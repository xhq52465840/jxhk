
package com.usky.sms.unit;

import java.io.Serializable;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.StringUtils;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.activity.type.ActivityTypeDO;
import com.usky.sms.activity.type.ActivityTypeDao;
import com.usky.sms.activity.type.ActivityTypeSchemeDO;
import com.usky.sms.activity.type.ActivityTypeSchemeDao;
import com.usky.sms.avatar.AvatarDO;
import com.usky.sms.config.Config;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.field.FieldLayoutSchemeDao;
import com.usky.sms.field.screen.ActivityTypeFieldScreenSchemeDao;
import com.usky.sms.menu.IMenu;
import com.usky.sms.menu.MenuCache;
import com.usky.sms.menu.MenuItem;
import com.usky.sms.notification.NotificationSchemeDao;
import com.usky.sms.organization.OrganizationDO;
import com.usky.sms.organization.OrganizationDao;
import com.usky.sms.permission.IPermission;
import com.usky.sms.permission.PermissionSchemeDao;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserHistoryItemDO;
import com.usky.sms.user.UserHistoryItemDao;
import com.usky.sms.workflow.WorkflowSchemeDao;

public class UnitDao extends BaseDao<UnitDO> implements IMenu, IPermission {
	
	public static final SMSException EXIST_SAME_UNIT = new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "已存在相同名称或键值的安全机构！");
	
	private Config config;
	
	@Autowired
	private ActivityTypeDao activityTypeDao;
	
	@Autowired
	private ActivityTypeFieldScreenSchemeDao activityTypeFieldScreenSchemeDao;
	
	@Autowired
	private ActivityTypeSchemeDao activityTypeSchemeDao;
	
	@Autowired
	private FieldLayoutSchemeDao fieldLayoutSchemeDao;
	
	@Autowired
	private MenuCache menuCache;
	
	@Autowired
	private NotificationSchemeDao notificationSchemeDao;
	
	@Autowired
	private PermissionSchemeDao permissionSchemeDao;
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	
	@Autowired
	private UnitConfigDao unitConfigDao;
	
	@Autowired
	private UserHistoryItemDao userHistoryItemDao;
	
	@Autowired
	private WorkflowSchemeDao workflowSchemeDao;
	
	@Autowired
	private OrganizationDao organizationDao;
	
	@Autowired
	private DictionaryDao dictionaryDao;
	
	public UnitDao() {
		super(UnitDO.class);
		this.config = Config.getInstance();
	}
	
	@Override
	public Serializable internalSave(UnitDO obj) {
		try {
			return super.internalSave(obj);
		} catch (ConstraintViolationException e) {
			throw EXIST_SAME_UNIT;
		}
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		// 名称和键值唯一性校验
		if (map.containsKey("name") || map.containsKey("code")) {
			checkNameAndCodeConstraint((String) map.get("name"), (String) map.get("code"), null);
		}
		return super.beforeSave(map);
	}

	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		// 名称和键值唯一性校验
		if (map.containsKey("name") || map.containsKey("code")) {
			checkNameAndCodeConstraint((String) map.get("name"), (String) map.get("code"), id);
		}
		super.beforeUpdate(id, map);
	}

	/**
	 *  安监机构名称和code唯一性校验
	 * @param name
	 * @param id
	 */
	public void checkNameAndCodeConstraint(String name, String code, Integer id) {
		StringBuffer hql = new StringBuffer("select count(*) from UnitDO t where t.deleted = false and (t.name = ? or t.code = ?)");
		List<Object> values = new ArrayList<Object>();
		values.add(name);
		values.add(code);
		if (null != id) {
			hql.append(" and id != ?");
			values.add(id);
		}
		@SuppressWarnings("unchecked")
		List<Long> count = this.getHibernateTemplate().find(hql.toString(), values.toArray());
		
		if (count.get(0) > 0) {
			throw EXIST_SAME_UNIT;
		}
	}
	
	@Override
	protected void afterSave(UnitDO unit) {
		UnitConfigDO config = new UnitConfigDO();
		config.setUnit(unit);
		config.setActivityTypeScheme(activityTypeSchemeDao.getDefaultScheme());
		config.setActivityTypeFieldScreenScheme(activityTypeFieldScreenSchemeDao.getDefaultScheme());
		config.setFieldLayoutScheme(fieldLayoutSchemeDao.getDefaultScheme());
		config.setPermissionScheme(permissionSchemeDao.getDefaultScheme());
		config.setNotificationScheme(notificationSchemeDao.getDefaultScheme());
		config.setWorkflowScheme(workflowSchemeDao.getDefaultScheme());
		unitConfigDao.internalSave(config);
	}
	
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}

	@Override
	protected void afterGetById(Map<String, Object> map) {
		userHistoryItemDao.record("Unit", ((Integer) map.get("id")).toString(), UserContext.getUser().getUsername(), null);
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		UnitDO unit = (UnitDO) obj;
		if ("avatar".equals(field.getName())) {
			AvatarDO avatar = unit.getAvatar();
			if (avatar == null) {
				map.put("avatarUrl", config.getUnitAvatarWebPath() + "/" + config.getDefaultUnitAvatar());
			} else {
				map.put("avatar", avatar.getId());
				map.put("avatarUrl", config.getUnitAvatarWebPath() + "/" + avatar.getFileName());
			}
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}
	
	@Override
	public List<Map<String, Object>> getSubMenus(Integer id, HttpServletRequest request) {
		MenuItem item = menuCache.getMenuItemById(id);
		String path = item.getPath();
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		if ("安监机构/当前安监机构".equals(path)) {
			UserHistoryItemDO userHistoryItem = userHistoryItemDao.getCurrentUnit(PermissionSets.VIEW_UNIT.getName());
			if (userHistoryItem != null) {
				list.add(getMenuMap(userHistoryItem.getEntityId(),"U"));
			}
		} else if ("安监机构/最新安监机构".equals(path)) {
			List<UserHistoryItemDO> userHistoryItems = userHistoryItemDao.getRecentUnits(PermissionSets.VIEW_UNIT.getName());
			if (userHistoryItems != null) {
				for (UserHistoryItemDO userHistoryItem : userHistoryItems) {
					list.add(getMenuMap(userHistoryItem.getEntityId(),"U"));
				}
			}
		} else if ("管理/安全信息类型/安全信息类型".equals(path)) {
			String unit = request.getParameter("unit");
			if (unit == null) return null;
			int unitId = Integer.parseInt(unit);
			List<ActivityTypeDO> types = activityTypeDao.getByUnitId(unitId);
			for (ActivityTypeDO type : types) {
				list.add(getMenuMap(type));
			}
		}else if("用户管理/当前安监机构".equals(path)){
			UserHistoryItemDO userHistoryItem = userHistoryItemDao.getCurrentUnit(PermissionSets.MANAGE_UNIT.getName());
			if (userHistoryItem != null) {
				list.add(getMenuMap(userHistoryItem.getEntityId(),"MU"));
			}
		}else if("安全评审/当前安监机构".equals(path)){
			UserHistoryItemDO userHistoryItem = userHistoryItemDao.getCurrentUnit(PermissionSets.VIEW_SAFETY_REVIEW.getName(), PermissionSets.MANAGE_SAFETY_REVIEW.getName());
			if (userHistoryItem != null) {
				list.add(getMenuMap(userHistoryItem.getEntityId(),"MS"));
			}
		}
		return list;
	}
	
	private Map<String, Object> getMenuMap(ActivityTypeDO type) {
		Map<String, Object> menuMap = new HashMap<String, Object>();
		menuMap.put("name", type.getName());
		menuMap.put("type", type.getId());
		menuMap.put("url", config.getActivityTypeForUnitPageUrl() + "?type=" + type.getId());
		return menuMap;
	}
	
	private Map<String, Object> getMenuMap(String id,String type) {
		UnitDO unit = this.internalGetById(Integer.parseInt(id));
		Map<String, Object> menuMap = new HashMap<String, Object>();
		menuMap.put("name", unit.getName());
		menuMap.put("code", unit.getCode());
		menuMap.put("type", "unit");
		if (unit.getAvatar() == null) {
			menuMap.put("avatar", config.getUnitAvatarWebPath() + "/" + config.getDefaultUnitAvatar());
		} else {
			menuMap.put("avatar", config.getUnitAvatarWebPath() + "/" + unit.getAvatar().getFileName());
		}
		if("MU".equals(type)){
			menuMap.put("url", "/sms/uui/com/sms/plugin/organization/ViewOrgUserRole01.html?id=" + id);
		}else if("MS".equals(type)){
			menuMap.put("url", "/sms/uui/com/sms/unitbrowse/ViewLevelOneReview01.html?id=" + id);
		}else if("U".equals(type)){
			menuMap.put("url", config.getUnitPageUrl() + "?id=" + id);
		}
		return menuMap;
	}
	
	@Override
	public boolean hasPermission(Integer id, HttpServletRequest request) {
		MenuItem item = menuCache.getMenuItemById(id);
		String path = item.getPath();
		if ("管理".equals(path)) {
			String unit = request.getParameter("unit");
			if (unit == null) return false;
			int unitId = Integer.parseInt(unit);
			return hasPermission(unitId, PermissionSets.MANAGE_UNIT.getName());
		}
		return true;
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void addActivityTypeSchemeForUnit(int unitId, Map<String, Object> map) throws Exception {
		int id = activityTypeSchemeDao.save(map);
		ActivityTypeSchemeDO scheme = new ActivityTypeSchemeDO();
		scheme.setId(id);
		UnitConfigDO config = unitConfigDao.getByUnitId(unitId);
		config.setActivityTypeScheme(scheme);
		unitConfigDao.internalUpdate(config);
	}
	
	public List<UnitDO> getByActivitySecuritySchemeId(int schemeId) {
		@SuppressWarnings("unchecked")
		List<UnitDO> list = this.getHibernateTemplate().find("select distinct u from UnitConfigDO c inner join c.unit u where c.activitySecurityScheme.id = ?", schemeId);
		return list;
	}
	
	public List<UnitDO> getByActivityTypeFieldScreenSchemeId(int schemeId) {
		@SuppressWarnings("unchecked")
		List<UnitDO> list = this.getHibernateTemplate().find("select distinct u from UnitConfigDO c inner join c.unit u where c.activityTypeFieldScreenScheme.id = ?", schemeId);
		return list;
	}
	
	public List<UnitDO> getByActivityTypeSchemeId(int activityTypeSchemeId) {
		@SuppressWarnings("unchecked")
		List<UnitDO> list = this.getHibernateTemplate().find("select distinct u from UnitConfigDO c inner join c.unit u where c.activityTypeScheme.id = ?", activityTypeSchemeId);
		return list;
	}
	
	public List<UnitDO> getByFieldLayoutId(int layoutId) {
		@SuppressWarnings("unchecked")
		List<UnitDO> list = this.getHibernateTemplate().find("select distinct u from UnitConfigDO c inner join c.unit u, FieldLayoutSchemeEntityDO e where c.fieldLayoutScheme = e.scheme and e.layout.id = ?", layoutId);
		return list;
	}
	
	public List<UnitDO> getByFieldLayoutSchemeId(int schemeId) {
		@SuppressWarnings("unchecked")
		List<UnitDO> list = this.getHibernateTemplate().find("select distinct u from UnitConfigDO c inner join c.unit u where c.fieldLayoutScheme.id = ?", schemeId);
		return list;
	}
	
	public List<UnitDO> getByFieldScreenId(int screenId) {
		@SuppressWarnings("unchecked")
		List<UnitDO> list = this.getHibernateTemplate().find("select distinct u from UnitConfigDO c inner join c.unit u, ActivityTypeFieldScreenSchemeEntityDO e, FieldScreenSchemeItemDO i where c.activityTypeFieldScreenScheme = e.scheme and e.fieldScreenScheme = i.scheme and i.screen.id = ?", screenId);
		return list;
	}
	
	public List<UnitDO> getByFieldScreenSchemeId(int schemeId) {
		@SuppressWarnings("unchecked")
		List<UnitDO> list = this.getHibernateTemplate().find("select distinct u from UnitConfigDO c inner join c.unit u, ActivityTypeFieldScreenSchemeEntityDO e where c.activityTypeFieldScreenScheme = e.scheme and e.fieldScreenScheme.id = ?", schemeId);
		return list;
	}
	
	public List<UnitDO> getByNotificationSchemeId(int schemeId) {
		@SuppressWarnings("unchecked")
		List<UnitDO> list = this.getHibernateTemplate().find("select distinct u from UnitConfigDO c inner join c.unit u where c.notificationScheme.id = ?", schemeId);
		return list;
	}
	
	public List<UnitDO> getByPermissionSchemeId(int schemeId) {
		@SuppressWarnings("unchecked")
		List<UnitDO> list = this.getHibernateTemplate().find("select distinct u from UnitConfigDO c inner join c.unit u where c.permissionScheme.id = ?", schemeId);
		return list;
	}
	
	public List<UnitDO> getByWorkflow(String workflow) {
		@SuppressWarnings("unchecked")
		List<UnitDO> list = this.getHibernateTemplate().find("select distinct c.unit from UnitConfigDO c, WorkflowSchemeEntityDO e where c.workflowScheme = e.scheme and e.workflow = ?", workflow);
		return list;
	}
	
	public List<UnitDO> getByWorkflowSchemeId(int schemeId) {
		@SuppressWarnings("unchecked")
		List<UnitDO> list = this.getHibernateTemplate().find("select distinct u from UnitConfigDO c inner join c.unit u where c.workflowScheme.id = ?", schemeId);
		return list;
	}
	
	private boolean hasPermission(int unitId, String permission) {
		return permissionSetDao.hasUnitPermission(unitId, permission);
	}
	
	public List<UnitDO> getUnits(String permission) {
		return this.getUnits(permission, null);
	}
	
	public List<UnitDO> getUnits(String permission, String unitName) {
		return permissionSetDao.getPermittedUnitsByUnitName(unitName, permission);
	}
	
	public List<Integer> getUnitIds(String permission) {
		return this.getUnitIds(permission, null);
	}
	
	public List<Integer> getUnitIds(String permission, String unitName) {
		return permissionSetDao.getPermittedUnitIdsByUnitName(null, unitName, permission);
	}
	
	@SuppressWarnings("unchecked")
	public List<Integer> getByUnitIds(List<Integer> unitIds, String name) {
		if (null == unitIds || unitIds.isEmpty()) {
			return new ArrayList<Integer>();
		}
		StringBuffer hql = new StringBuffer("select t.id from UnitDO t where t.deleted = false");
		List<Object> values = new ArrayList<Object>();
		hql.append(" and t.id in (" + StringUtils.join(unitIds, ",") + ")");
		if (!StringUtils.isBlank(name)) {
			name = name.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
			hql.append(" and upper(t.name) like upper(?) escape '/'");
			values.add("%" + name + "%");
		}
		hql.append(" order by t.name");
		return (List<Integer>) this.query(hql.toString(), values.toArray());
	}
	
	/**
	 * 获取用户所在的安监机构
	 * 
	 * @param user
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<UnitDO> getUnitsByUser(UserDO user) {
		if (null == user) {
			return new ArrayList<UnitDO>();
		}
		Integer userId = user.getId();
		return (List<UnitDO>) this.query("select distinct un.unit from UnitRoleActorDO un where (un.type = ? and to_number(un.parameter) = ?) or (un.type = ? and to_number(un.parameter) in (select g.id from UserGroupDO g left join g.users us where us.id = ?))", "USER", userId, "USER_GROUP", userId);
	}
	
	/**
	 * 获取用户角色所在安监机构及用户所在组织对应的安监机构
	 * 
	 * @param user
	 * @return
	 */
	public List<UnitDO> getUserUnits(UserDO user, String term, boolean sortByName) {
		List<UnitDO> units = this.getUnitsByUser(user);
		List<OrganizationDO> orgs = organizationDao.getByUser(UserContext.getUserId());
		for (OrganizationDO org : orgs) {
			if (org.getUnit() != null && !units.contains(org.getUnit())) {
				units.add(org.getUnit());
			}
		}
		if (StringUtils.isNotBlank(term)) {
			Iterator<UnitDO> it = units.iterator();
			while (it.hasNext()) {
				if (StringUtils.containsIgnoreCase(it.next().getName(), term)) {
					it.remove();
				}
			}
		}
		if (sortByName) {
			Collections.sort(units, new Comparator<UnitDO>() {
				@Override
				public int compare(UnitDO o1, UnitDO o2) {
					return o1.getName().compareTo(o1.getName());
				}
			});
		}
		return units;
	}
	
	/**
	 * 通过安监机构名称查询安监机构
	 * @param name
	 * @return 如果没有，返回null
	 */
	public UnitDO getUnitByName(String name) {
		if (null == name) {
			return null;
		}
		@SuppressWarnings("unchecked")
		List<UnitDO> list = (List<UnitDO>) this.query("from UnitDO t where t.deleted = false and t.name = ?", name);
		if(list.isEmpty()){
			return null;
		}
		return list.get(0);
	}
	
	/**
	 * 得到所有安监机构的id, 按名称排序<br>
	 * 可按照name进行模糊查询
	 * @param name
	 * @return 
	 */
	@SuppressWarnings("unchecked")
	public List<Integer> getAllUnitIds(String name) {
		StringBuffer hql = new StringBuffer("select t.id from UnitDO t where t.deleted = false");
		List<Object> values = new ArrayList<Object>();
		if (!StringUtils.isBlank(name)) {
			name = name.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
			hql.append(" and upper(t.name) like upper(?) escape '/'");
			values.add("%" + name + "%");
		}
		hql.append(" order by t.name");
		return (List<Integer>) this.query(hql.toString(), values.toArray());
	}
	
	/**
	 * 得到所有安监机构, 按名称排序<br>
	 * 可按照name进行模糊查询
	 * @param name
	 * @return 
	 */
	@SuppressWarnings("unchecked")
	public List<UnitDO> getAllUnits(String name) {
		StringBuffer hql = new StringBuffer("from UnitDO t where t.deleted = false");
		List<Object> values = new ArrayList<Object>();
		if (!StringUtils.isBlank(name)) {
			name = name.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
			hql.append(" and upper(t.name) like upper(?) escape '/'");
			values.add("%" + name + "%");
		}
		hql.append(" order by t.name");
		return (List<UnitDO>) this.query(hql.toString(), values.toArray());
	}
	
	/**
	 * 根据组织编号查询组织对应的安监机构
	 * @param deptCode
	 * @return
	 */
	public UnitDO getByDeptCode(String deptCode) {
		if (null == deptCode) {
			return null;
		}
		deptCode = "%," + deptCode + ",%";
		String hql = "select t.unit from OrganizationDO t where t.deleted = false and upper(concat(',', t.deptCode, ',')) like upper(?)";
		@SuppressWarnings("unchecked")
		List<UnitDO> units = (List<UnitDO>) this.query(hql, deptCode);
		return units.isEmpty() ? null : units.get(0);
	}
	
	/**
	 * 根据字典里的配置获取安监部
	 * 
	 * @return
	 */
	public UnitDO getAnJianBu(boolean throwExp) {
		int unitId = this.getAnJianBuId(throwExp);
		return this.internalGetById(unitId);
	}
	
	/**
	 * 根据字典里的配置获取安监部的id
	 * 
	 * @return
	 */
	public Integer getAnJianBuId(boolean throwExp) {
		DictionaryDO dic = dictionaryDao.getByTypeAndName("审计参数", "公司级安监机构");
		if (null == dic) {
			if (throwExp) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "字典中没有配置类型为:审计参数,名称为:公司级安监机构的记录！");
			}
		}
		try {
			return Integer.parseInt(dic.getValue());
		} catch (Exception e) {
			if (throwExp) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "字典中类型为:审计参数,名称为:公司级安监机构的记录的value值不是有效的数字！");
			}
		}
		return null;
	}
	
	/**
	 * 安监机构的count字段自增长
	 * 
	 * @return 更新后的安监机构
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED)
	public UnitDO autoIncrementUnitCount(Integer unitId) {
		UnitDO unit = this.internalGetById(unitId);
		if (unit.getCount() == null) {
			unit.setCount(1);
		} else {
			unit.setCount(unit.getCount() + 1);
		}
		this.internalUpdate(unit);
		return unit;
	}
	
	public void setActivityTypeDao(ActivityTypeDao activityTypeDao) {
		this.activityTypeDao = activityTypeDao;
	}
	
	public void setActivityTypeFieldScreenSchemeDao(ActivityTypeFieldScreenSchemeDao activityTypeFieldScreenSchemeDao) {
		this.activityTypeFieldScreenSchemeDao = activityTypeFieldScreenSchemeDao;
	}
	
	public void setActivityTypeSchemeDao(ActivityTypeSchemeDao activityTypeSchemeDao) {
		this.activityTypeSchemeDao = activityTypeSchemeDao;
	}
	
	public void setFieldLayoutSchemeDao(FieldLayoutSchemeDao fieldLayoutSchemeDao) {
		this.fieldLayoutSchemeDao = fieldLayoutSchemeDao;
	}
	
	public void setMenuCache(MenuCache menuCache) {
		this.menuCache = menuCache;
	}
	
	public void setNotificationSchemeDao(NotificationSchemeDao notificationSchemeDao) {
		this.notificationSchemeDao = notificationSchemeDao;
	}
	
	public void setOrganizationDao(OrganizationDao organizationDao) {
		this.organizationDao = organizationDao;
	}
	
	public void setPermissionSchemeDao(PermissionSchemeDao permissionSchemeDao) {
		this.permissionSchemeDao = permissionSchemeDao;
	}
	
	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}
	
	public void setUnitConfigDao(UnitConfigDao unitConfigDao) {
		this.unitConfigDao = unitConfigDao;
	}
	
	public void setUserHistoryItemDao(UserHistoryItemDao userHistoryItemDao) {
		this.userHistoryItemDao = userHistoryItemDao;
	}
	
	public void setWorkflowSchemeDao(WorkflowSchemeDao workflowSchemeDao) {
		this.workflowSchemeDao = workflowSchemeDao;
	}

	public void setDictionaryDao(DictionaryDao dictionaryDao) {
		this.dictionaryDao = dictionaryDao;
	}
	
}
