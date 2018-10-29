
package com.usky.sms.organization;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.lang.StringUtils;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.type.StandardBasicTypes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.custom.CustomFieldDO;
import com.usky.sms.custom.CustomFieldDao;
import com.usky.sms.custom.CustomFieldValueDO;
import com.usky.sms.custom.CustomFieldValueDao;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.http.service.GsonBuilder4SMS;
import com.usky.sms.temptable.TempTableDao;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitRoleActorDO;
import com.usky.sms.unit.UnitRoleActorDao;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;
import com.usky.sms.uwffunc.IUwfFuncPlugin;

public class OrganizationDao extends BaseDao<OrganizationDO> implements IUwfFuncPlugin {
	
	protected static Gson gson = GsonBuilder4SMS.getInstance();
	
	@Autowired
	private DictionaryDao dictionaryDao;
	
	@Autowired
	private UnitRoleActorDao unitRoleActorDao;
	
	@Autowired
	private UserDao userDao;
	
	@Autowired
	private CustomFieldValueDao customFieldValueDao;
	
	@Autowired
	private CustomFieldDao customFieldDao;
	
	@Autowired
	private TempTableDao tempTableDao;
	
	public OrganizationDao() {
		super(OrganizationDO.class);
	}
	
	@Override
	protected String[] getSearchFields() {
		return new String[] { "name" };
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		OrganizationDO organization = (OrganizationDO) obj;
		if ("parent".equals(fieldName)) {
			StringBuilder path = new StringBuilder();
			while (organization.getParent() != null) {
				organization = organization.getParent();
				if (organization.getParent() != null) {
					path.insert(0, "/" + organization.getName());
				}
			}
			String orgName = path.toString();
			map.put("path", orgName);
		}else if("users".equals(fieldName)){
			Set<UserDO> users = organization.getUsers();
			List<Map<String,Object>> userlist = new ArrayList<Map<String,Object>>();
			for (UserDO userDO : users) {
				UserDO user = userDao.internalGetById(userDO.getId());
				Map<String,Object> userMap = new HashMap<String, Object>();
				userMap.put("id", user.getId());
				userMap.put("name", user.getFullname()+"("+user.getUsername()+")");
				userMap.put("deleted", user.isDeleted());
				userlist.add(userMap);
			}
			map.put("users", userlist);
		}else{
			super.setField(map, obj, claz, multiple, field);
		}
	}
	
	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple, boolean showExtendFields) {
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
		if (!multiple) {
			OrganizationDO organization = (OrganizationDO) obj;
			OrganizationDO parent = organization.getParent();
			if (parent != null && parent.isDeleted()) {
				organization.setDeleted(true);
			}
			OrganizationDO previous = new OrganizationDO();
			// 返回前一组织时排除掉删除的组织
			StringBuffer hql = new StringBuffer("from OrganizationDO where deleted = false and sortKey <= ?");
			List<Object> values = new ArrayList<Object>();
			values.add(organization.getSortKey() - 1);
			if (null != parent) {
				hql.append(" and parent.id = ?");
				values.add(parent.getId());
			} else {
				hql.append(" and parent.id is null");
			}
			hql.append(" order by sortKey desc");
			@SuppressWarnings("unchecked")
			List<OrganizationDO> list = (List<OrganizationDO>) this.query(hql.toString(), values.toArray());
			if (!list.isEmpty()) {
				previous = list.get(0);
			}
			map.put("previousName", previous.getName() == null ? "" : previous.getName());
			map.put("previous", previous.getId());
			map.put("parent", parent == null ? null : parent.getId());
			map.put("parentDisplayName", parent == null ? null : parent.getName());
			
			if (null != organization.getUnit()) {
				if (null != organization.getUnit().getResponsibleUser()) {
					map.put("unitResponsibleUser", organization.getUnit().getResponsibleUser().getDisplayName());
				}
			}
		}
	}
	
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}
	
	@Override
	protected void beforeDelete(Collection<OrganizationDO> collection) {
		// 子组织也删除
		for (OrganizationDO organization : collection) {
			Collection<OrganizationDO> subOrganizations = this.getSubOrganizations(organization.getId(), null);
			this.beforeDelete(subOrganizations);
			for (OrganizationDO subOrganization : subOrganizations) {
				subOrganization.setDeleted(true);
				this.internalUpdate(subOrganization);
			}
		}
	}
	
	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		// TODO: 组织树环校验
	}
	
	/**
	 * 获取当前组织下的下级组织
	 */
	@SuppressWarnings("unchecked")
	public List<OrganizationDO> getSubOrganizations(Integer organizationId, String name) {
		StringBuffer hql = new StringBuffer("from OrganizationDO where deleted = false");
		List<Object> values = new ArrayList<Object>();
		if (null == organizationId) {
			hql.append(" and parent.id is null");
		} else {
			hql.append(" and parent.id = ?");
			values.add(organizationId);
		}
		if (!StringUtils.isBlank(name)) {
			name = name.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
			hql.append(" and upper(name) like upper(?) escape '/'");
			values.add("%" + name + "%");
		}
		hql.append(" order by sortKey");
		return (List<OrganizationDO>) this.query(hql.toString(), values.toArray());
	}
	
	/**
	 * 获取某些组织下的下级组织
	 */
	@SuppressWarnings("unchecked")
	public List<OrganizationDO> getSubOrganizationsByParents(List<Integer> organizationIds) {
		if (null == organizationIds || organizationIds.isEmpty()) {
			return new ArrayList<OrganizationDO>();
		}
		StringBuffer hql = new StringBuffer("from OrganizationDO where deleted = false and parent.id in (:ids) order by sortKey");
		return (List<OrganizationDO>) this.getHibernateTemplate().findByNamedParam(hql.toString(), "ids", organizationIds);
	}
	
	/**
	 * 获取某些组织下的下级组织的id
	 */
	@SuppressWarnings("unchecked")
	public List<Integer> getSubOrgIdsByParents(List<Integer> organizationIds) {
		if (null == organizationIds || organizationIds.isEmpty()) {
			return new ArrayList<Integer>();
		}
		StringBuffer hql = new StringBuffer("select id from OrganizationDO where deleted = false and parent.id in (:ids) order by sortKey");
		return (List<Integer>) this.getHibernateTemplate().findByNamedParam(hql.toString(), "ids", organizationIds);
	}

	/**
	 * 获取当前组织名为parentName的下级组织<br>
	 * 可按名称模糊查询
	 */
	@SuppressWarnings("unchecked")
	public List<OrganizationDO> getSubOrganizationsByName(String parentName, String name) {
		StringBuffer hql = new StringBuffer("from OrganizationDO t where t.deleted = false");
		List<Object> values = new ArrayList<Object>();
		if (!StringUtils.isBlank(name)) {
			name = name.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
			hql.append(" and upper(t.name) like upper(?) escape '/'");
			values.add("%" + name + "%");
		}
		hql.append(" and t.parent.name = ?");
		values.add(parentName);
		hql.append(" order by t.sortKey");
		return (List<OrganizationDO>) this.query(hql.toString(), values.toArray());
	}
	
	/**
	 * 递归获取某些组织下的下级组织的id<br>
	 * 
	 */
	@SuppressWarnings("unchecked")
	public List<Integer> getSubOrgIdsByParentsRecursive(List<Integer> organizationIds) {
		if (null == organizationIds || organizationIds.isEmpty()) {
			return new ArrayList<Integer>();
		}
		StringBuffer sql = new StringBuffer("select id from (select id, deleted, sortKey from t_organization t start with id in (" + StringUtils.join(organizationIds, ",") + ") connect by prior id = parent_id) where deleted = '0' order by sortKey");
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql.toString());
		query.addScalar("id", StandardBasicTypes.INTEGER);
		List<Integer> list = query.list();
		return list;
	}
	
	public List<OrganizationDO> getByUnit(UnitDO unitDO) {
		@SuppressWarnings("unchecked")
		List<OrganizationDO> list = this.getHibernateTemplate().find("from OrganizationDO where unit = ? and deleted = false order by lastUpdate ", unitDO);
		return list;
	}
	
	
	public List<OrganizationDO> getAJB() {
		@SuppressWarnings("unchecked")
		List<OrganizationDO> list = this.getHibernateTemplate().find("from OrganizationDO t where t.name ='安全监察部'  and deleted = false and olevel = '2' order by olevel ");
		return list;
	}
	
	
	public List<OrganizationDO> getByUnitforEm(UnitDO unitDO) {
		@SuppressWarnings("unchecked")
		List<OrganizationDO> list = this.getHibernateTemplate().find("from OrganizationDO where unit = ? and deleted = false and olevel > '2' and olevel < '4' order by olevel ", unitDO);
		return list;
	}
	
	public List<OrganizationDO> getAllByforEm() {
		@SuppressWarnings("unchecked")
		List<OrganizationDO> list = this.getHibernateTemplate().find("from OrganizationDO where deleted = false and olevel >= '3' and olevel < '4' order by olevel ");
		return list;
	}
	
	public List<OrganizationDO> getByUser(Integer userId) {
		@SuppressWarnings("unchecked")
		List<OrganizationDO> list = this.getHibernateTemplate().find("select distinct g from OrganizationDO g left join g.users u where u.id = ?", userId);
		return list;
	}
	
	@SuppressWarnings("unchecked")
	public List<Integer> getIdsByUser(Integer userId) {
		return this.getHibernateTemplate().find("select distinct g.id from OrganizationDO g left join g.users u where u.id = ?", userId);
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void updateAll(UnitDO unit, String objs) throws Exception {
		List<Map<String, Object>> paramMap = gson.fromJson(objs, new TypeToken<List<Map<String, Object>>>() {}.getType());
		List<OrganizationDO> list = this.getByUnit(unit);
		for (OrganizationDO organizationDO : list) {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("unit", null);
			this.update(organizationDO.getId(), map);
		}
		for (Map<String, Object> map : paramMap) {
			int id = map.get("id") == null ? null : ((Number) (map.get("id"))).intValue();
			Map<String, Object> pmap = new HashMap<String, Object>();
			pmap.put("unit", unit.getId());
			this.update(id, pmap);
		}
	}
	
	public List<DictionaryDO> getSysTemByUser() {
		List<DictionaryDO> list = dictionaryDao.getListByType("系统分类");
//		List<DictionaryDO> list = new ArrayList<DictionaryDO>();
//		List<OrganizationDO> orglist = this.getByUser(UserContext.getUserId());
//		for (OrganizationDO organizationDO : orglist) {
//			Set<DictionaryDO> dicSet = organizationDO.getSystems();
//			for (DictionaryDO dictionaryDO : dicSet) {
//				DictionaryDO finaDict = dictionaryDao.internalGetById(dictionaryDO.getId());
//				if (!list.contains(finaDict)) {
//					list.add(finaDict);
//				}
//			}
//		}
		return list;
	}
	
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> getByParent(Integer parent, String name) {
		StringBuffer hql = new StringBuffer();
		hql.append("from OrganizationDO t where t.deleted = false");
		List<Object> values = new ArrayList<Object>();
		if (null == parent) {
			hql.append(" and t.parent.id is null");
		} else {
			hql.append(" and t.parent.id = ?");
			values.add(parent);
		}
		if (null != name) {
			name = name.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
			hql.append(" and upper(t.name) like upper(?) escape '/'");
			values.add("%" + name + "%");
		}
		hql.append(" order by sortKey");
		List<OrganizationDO> orgList = this.getHibernateTemplate().find(hql.toString(), values.toArray());
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		for (OrganizationDO org : orgList) {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("id", org.getId());
			map.put("name", org.getName());
			list.add(map);
		}
		return list;
	}
	
	public List<OrganizationDO> getByParentAndUnit(Integer parentId, Integer unitId){
		List<OrganizationDO> list = this.getHibernateTemplate().find("from OrganizationDO t where t.deleted = false and t.parent.id = ? and t.unit.id = ?", parentId, unitId);
		return list;
	}
	
	@Transactional(readOnly = true)
	public List<?> getMembers(int organizationId) {
		OrganizationDO organization = this.internalGetById(organizationId);
		Integer unitId = organization.getUnit().getId();
		Set<UserDO> users = organization.getUsers();
		if (users.isEmpty()) return null;
		List<Integer> userIds = new ArrayList<Integer>();
		for (UserDO user : users) {
			userIds.add(user.getId());
		}
		// userIds过多，有超过1000个的情况，故使用临时表
		try {
			tempTableDao.insertIds(userIds);
		} catch (Exception e) {
			e.printStackTrace();
		}
		@SuppressWarnings("unchecked")
		List<UnitRoleActorDO> list = this.getHibernateTemplate().findByNamedParam("from UnitRoleActorDO a where a.type = 'USER' "
				+ "and a.parameter in (select id from TempTableDO ) and unit.id=:unitId", new String[]{"unitId"} , new Object[]{unitId});
		Map<String, List<UnitRoleActorDO>> userIdRoleMap = new HashMap<String, List<UnitRoleActorDO>>();
		for (UnitRoleActorDO actor : list) {
			String userId = actor.getParameter();
			List<UnitRoleActorDO> roles = (List<UnitRoleActorDO>) userIdRoleMap.get(userId);
			if (roles == null) {
				roles = new ArrayList<UnitRoleActorDO>();
				userIdRoleMap.put(userId, roles);
			}
			roles.add(actor);
		}
		List<Map<String, Object>> userList = new ArrayList<Map<String, Object>>();
		for (UserDO user : users) {
			Map<String, Object> map = userDao.convert(user, Arrays.asList("id", "fullname", "username", "avatar","deleted"));
			List<UnitRoleActorDO> actors = userIdRoleMap.get(user.getId().toString());
			if (actors != null && !actors.isEmpty()) map.put("roles", unitRoleActorDao.convert(actors, Arrays.asList("id", "role")));
			userList.add(map);
		}
		return userList;
	}
	
	/**
	 * 查找父组织下名称为name的组织
	 * 
	 * @param parentId
	 * @param name
	 * @return
	 */
	public OrganizationDO getSubOrganizationByName(OrganizationDO parent, String name) {
		if (null == name) {
			return null;
		}
		StringBuffer hql = new StringBuffer("from OrganizationDO where deleted = false and name = ?");
		List<Object> values = new ArrayList<Object>();
		values.add(name);
		if (null == parent) {
			hql.append(" and parent.id is null");
		} else {
			hql.append(" and parent.id = ?");
			values.add(parent.getId());
		}
		@SuppressWarnings("unchecked")
		List<OrganizationDO> list = (List<OrganizationDO>) this.query(hql.toString(), values.toArray());
		if (!list.isEmpty()) {
			return list.get(0);
		}
		return null;
	}
	
	/**
	 * 新增组织
	 */
	public void addOrganization(OrganizationDO current, OrganizationDO previous) {
		StringBuffer hql = new StringBuffer("from OrganizationDO t where t.sortKey > ?");
		List<Object> values = new ArrayList<Object>();
		Integer previousSortKey = previous == null ? -1 : previous.getSortKey();
		current.setSortKey(previousSortKey + 1);
		values.add(previousSortKey);
		if (null == current.getParent()) {
			hql.append(" and t.parent.id is null");
		} else {
			hql.append(" and t.parent.id = ?");
			values.add(current.getParent().getId());
		}
		@SuppressWarnings("unchecked")
		List<OrganizationDO> list = (List<OrganizationDO>) this.query(hql.toString(), values.toArray());
		for (OrganizationDO organization : list) {
			organization.setSortKey(organization.getSortKey() + 1);
			this.internalUpdate(organization);
		}
		this.internalSave(current);
	}
	
	/**
	 * 同组织下的更新
	 * 
	 * @param current
	 * @param previous
	 * @throws Exception
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void updateOrganizationToSameParent(OrganizationDO current, OrganizationDO previous) throws Exception {
		StringBuffer hql = new StringBuffer("from OrganizationDO t where t.sortKey > ? and t.sortKey < ?");
		List<Object> values = new ArrayList<Object>();
		if (null == current.getParent()) {
			hql.append(" and t.parent.id is null");
		} else {
			hql.append(" and t.parent.id = ?");
			values.add(current.getParent().getId());
		}
		Integer oldSortKey = current.getSortKey();
		Integer previousSortKey = previous == null ? -1 : previous.getSortKey();
		current.setSortKey(previousSortKey + 1);
		if (oldSortKey >= previousSortKey) {
			// 由后转到前，sortKey由大变小,newSortKey与oldSortKey之间的sortKey增1
			values.add(0, previousSortKey.intValue());
			values.add(1, oldSortKey.intValue());
			@SuppressWarnings("unchecked")
			List<OrganizationDO> list = (List<OrganizationDO>) this.query(hql.toString(), values.toArray());
			for (OrganizationDO organization : list) {
				organization.setSortKey(organization.getSortKey() + 1);
				this.internalUpdate(organization);
			}
			this.update(current);
		} else {
			// 由前转到后，sortKey由小变大,newSortKey与oldSortKey之间的sortKey减1
			values.add(0, oldSortKey.intValue());
			values.add(1, previousSortKey.intValue() + 1);
			@SuppressWarnings("unchecked")
			List<OrganizationDO> list = (List<OrganizationDO>) this.query(hql.toString(), values.toArray());
			for (OrganizationDO organization : list) {
				organization.setSortKey(organization.getSortKey() - 1);
				this.update(organization);
			}
			current.setSortKey(previousSortKey);
			this.update(current);
		}
	}
	
	/**
	 * 不同组织下的更新
	 * 
	 * @param current
	 * @param previous
	 * @throws Exception
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void updateOrganizationToDiffParent(OrganizationDO current, OrganizationDO previous, OrganizationDO newParent) throws Exception {
		if (isSubOrganization(newParent, current)) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "所属组织不能为当前组织或当前组织的下级组织！");
		}
		StringBuffer hql = new StringBuffer("");
		List<Object> values = new ArrayList<Object>();
		Integer oldSortKey = current.getSortKey();
		Integer previousSortKey = previous == null ? -1 : previous.getSortKey();
		// 原组织以后的sortKey减1
		hql.append("from OrganizationDO t where t.sortKey > ?");
		values.add(oldSortKey.intValue());
		if (null == current.getParent()) {
			hql.append(" and t.parent.id is null");
		} else {
			hql.append(" and t.parent.id = ?");
			values.add(current.getParent().getId());
		}
		@SuppressWarnings("unchecked")
		List<OrganizationDO> oldOrganizations = (List<OrganizationDO>) this.query(hql.toString(), values.toArray());
		for (OrganizationDO organization : oldOrganizations) {
			organization.setSortKey(organization.getSortKey() - 1);
			this.update(organization);
		}
		
		hql.setLength(0);
		values.clear();
		
		// 新组织以后的sortKey增1
		hql.append("from OrganizationDO t where t.sortKey > ?");
		values.add(previousSortKey.intValue());
		if (null == newParent) {
			hql.append(" and t.parent.id is null");
		} else {
			hql.append(" and t.parent.id = ?");
			values.add(newParent.getId());
		}
		@SuppressWarnings("unchecked")
		List<OrganizationDO> newOrganizations = (List<OrganizationDO>) this.query(hql.toString(), values.toArray());
		for (OrganizationDO organization : newOrganizations) {
			organization.setSortKey(organization.getSortKey() + 1);
			this.update(organization);
		}
		current.setParent(newParent);
		current.setSortKey(previousSortKey + 1);
		this.update(current);
	}
	
	/**
	 * 获取一个组织下可添加的用户列表
	 * 
	 * @param organization
	 * @param userName
	 * @return
	 */
	public List<Map<String, String>> getAddableUsersForOrganization(OrganizationDO organization, String userName) {
		List<Map<String, String>> result = new ArrayList<Map<String, String>>();
		if (null == organization) {
			return result;
		}
		StringBuffer hql = new StringBuffer("select u.id, u.fullname, u.username from UserDO u where u.deleted = false");
		List<Object> params = new ArrayList<Object>();
		List<Object> values = new ArrayList<Object>();
		
		// 排除该组织中已有的用户
		Set<UserDO> users = organization.getUsers();
		List<Integer> userIds = new ArrayList<Integer>();
		for (UserDO user : users) {
			userIds.add(user.getId());
		}
		if (!userIds.isEmpty()) {
			hql.append(" and u.id not in :userIds");
			params.add("userIds");
			values.add(userIds);
		}
		// 根据用户名模糊查询
		if (null != userName) {
			userName = userName.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
			hql.append(" and (upper(u.fullname) like upper(:fullname) escape '/' or upper(u.username) like upper(:username) escape '/')");
			params.add("fullname");
			params.add("username");
			values.add("%" + userName + "%");
			values.add("%" + userName + "%");
		}
		// 按用户名排序
		hql.append(" order by u.fullname, u.username");
		@SuppressWarnings("unchecked")
		List<Object[]> list = (List<Object[]>) this.getHibernateTemplate().findByNamedParam(hql.toString(), params.toArray(new String[0]), values.toArray());
		for (Object[] o : list) {
			Map<String, String> map = new HashMap<String, String>();
			map.put("id", o[0].toString());
			map.put("fullname", o[1].toString() + "(" + o[2].toString() + ")");
			result.add(map);
		}
		return result;
	}
	
	/**
	 * 获取所有未删除的组织<br>
	 * 可根据组织名进行模糊查询<br>
	 * 可选择对应安监机构下的组织<br>
	 */
	@SuppressWarnings("unchecked")
	public List<OrganizationDO> getAllOrganizations(String name, Integer unitId) {
		StringBuffer hql = new StringBuffer();
		List<Object> values = new ArrayList<Object>();
		values.add(false);
		hql.append("from OrganizationDO t where deleted = ?");
		if (null != name) {
			name = name.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
			hql.append(" and upper(t.name) like upper(?) escape '/'");
			values.add("%" + name + "%");
		}
		if (null != unitId) {
			hql.append(" and t.unit.id = ?");
			values.add(unitId);
		}
		hql.append(" order by sortKey asc");
		List<OrganizationDO> list = (List<OrganizationDO>) this.query(hql.toString(), values.toArray());
		return list;
	}
	
	public OrganizationDO getOrganizationsByNameAndUnit(String name, Integer unitId) {
		@SuppressWarnings("unchecked")
		List<OrganizationDO> list = this.getHibernateTemplate().find("from OrganizationDO t where t.deleted = false and t.name = ? and t.unit.id = ?", name, unitId);
		if (list.size() > 0){
			return list.get(0);
		} else {
			return null;
		}
	}
	
	/**
	 * 通过组织级别和安监机构查询对应的组织
	 * @param olevel 0、1、2...
	 * @param unitId
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<OrganizationDO> getByOlevelAndUnit(String olevel, Integer unitId) {
		return this.getHibernateTemplate().find("from OrganizationDO t where t.deleted = false and t.olevel = ? and t.unit.id = ? order by t.sortKey asc", olevel, unitId);
	}
	
	/**
	 * 通过组织级别和安监机构查询对应的组织的id
	 * @param olevel 0、1、2...
	 * @param unitIds 安监机构的id的集合
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<Integer> getIdsByOlevelAndUnitIds(String olevel, List<Integer> unitIds) {
		StringBuffer hql = new StringBuffer("select t.id from OrganizationDO t where t.deleted = false and t.olevel = :olevel");
		List<String> params = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		params.add("olevel");
		values.add(olevel);
		if (null != unitIds && !unitIds.isEmpty()) {
			hql.append(" and t.unit.id in (:unitIds)");
			params.add("unitIds");
			values.add(unitIds);
		}
		hql.append("  order by t.unit.name, t.sortKey asc");
		return this.getHibernateTemplate().findByNamedParam(hql.toString(), params.toArray(new String[0]), values.toArray());
	}
	
	/**
	 * 通过组织级别和安监机构及用户查询对应的组织的id
	 * @param olevel 0、1、2...
	 * @param unitIds 安监机构的id的集合
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<Integer> getIdsByOlevelAndUnitIdsAndUser(String olevel, List<Integer> unitIds, Integer userId, String name) {
		StringBuffer hql = new StringBuffer("select t.id from OrganizationDO t left join t.users u where t.deleted = false and t.olevel = :olevel");
		List<String> params = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		params.add("olevel");
		values.add(olevel);
		if (null != unitIds && !unitIds.isEmpty()) {
			hql.append(" and t.unit.id in (:unitIds)");
			params.add("unitIds");
			values.add(unitIds);
		}
		if (null != userId) {
			hql.append(" and u.id = :userId");
			params.add("userId");
			values.add(userId);
		}
		if (null != name) {
			hql.append(" and upper(t.name) like upper(:name) escape '/'");
			name = name.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
			params.add("name");
			values.add("%" + name + "%");
		}
		hql.append("  order by t.unit.name, t.sortKey asc");
		List<Integer> list = this.getHibernateTemplate().findByNamedParam(hql.toString(), params.toArray(new String[0]), values.toArray());
		// 去重
		List<Integer> result = new ArrayList<Integer>();
		for (Integer id : list) {
			if (!result.contains(id)) {
				result.add(id);
			}
		}
		return result;
	}
	
	/**
	 * 通过组织级别和安监机构查询对应的组织
	 * @param olevel 0、1、2...
	 * @param unitIds 安监机构的id的集合
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<OrganizationDO> getByOlevelAndUnitIds(String olevel, List<Integer> unitIds) {
		StringBuffer hql = new StringBuffer("from OrganizationDO t where t.deleted = false and t.olevel = :olevel");
		List<String> params = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		params.add("olevel");
		values.add(olevel);
		if (null != unitIds && !unitIds.isEmpty()) {
			hql.append(" and t.unit.id in (:unitIds)");
			params.add("unitIds");
			values.add(unitIds);
		}
		hql.append("  order by t.unit.name, t.sortKey asc");
		return this.getHibernateTemplate().findByNamedParam(hql.toString(), params.toArray(new String[0]), values.toArray());
	}
	
	/**
	 * 通过组织级别和安监机构查询对应的组织的id
	 * @param olevel 0、1、2...
	 * @param unitIds 安监机构的id的集合
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<Integer> getOrgIdsByOlevelAndUnitIds(String olevel, List<Integer> unitIds) {
		StringBuffer hql = new StringBuffer("select distinct t.id from OrganizationDO t where t.deleted = false and t.olevel = :olevel");
		List<String> params = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		params.add("olevel");
		values.add(olevel);
		if (null != unitIds && !unitIds.isEmpty()) {
			hql.append(" and t.unit.id in (:unitIds)");
			params.add("unitIds");
			values.add(unitIds);
		}
		return this.getHibernateTemplate().findByNamedParam(hql.toString(), params.toArray(new String[0]), values.toArray());
	}
	
	/**
	 * 通过组织级别和安监机构查询对应的组织
	 * @param olevel 0、1、2...
	 * @param unitIds 安监机构的id的集合
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<OrganizationDO> getByOlevelAndUnitIdsAndUser(String olevel, List<Integer> unitIds, Integer userId, String name) {
		StringBuffer hql = new StringBuffer("from OrganizationDO t where t.deleted = false and t.olevel = :olevel");
		List<String> params = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		params.add("olevel");
		values.add(olevel);
		if (null != unitIds && !unitIds.isEmpty()) {
			hql.append(" and t.unit.id in (:unitIds)");
			params.add("unitIds");
			values.add(unitIds);
		}
		if (null != userId) {
			hql.append(" and u.id = :userId");
			params.add("userId");
			values.add(userId);
		}
		if (null != name) {
			name = name.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
			hql.append(" and upper(t.name) like upper(:name) escape '/'");
			params.add("name");
			values.add("%" + name + "%");
		}
		hql.append("  order by t.unit.name, t.sortKey asc");
		return this.getHibernateTemplate().findByNamedParam(hql.toString(), params.toArray(new String[0]), values.toArray());
	}
	
	/**
	 * 通过组织级别和安监机构查询对应的组织
	 * @param olevel 0、1、2...
	 * @param unitIds 安监机构的id的集合
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<OrganizationDO> getByOlevelAndUnits(String olevel, List<UnitDO> units) {
		StringBuffer hql = new StringBuffer("from OrganizationDO t where t.deleted = false and t.olevel = :olevel");
		List<String> params = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		params.add("olevel");
		values.add(olevel);
		if (null != units && !units.isEmpty()) {
			hql.append(" and t.unit in (:units)");
			params.add("units");
			values.add(units);
		}
		hql.append("  order by t.unit.name, t.sortKey asc");
		return this.getHibernateTemplate().findByNamedParam(hql.toString(), params.toArray(new String[0]), values.toArray());
	}
	
	/**
	 * 目标组织是否是源组织的下级组织
	 * 
	 * @param fromOrganization
	 * @param toOrganization
	 * @return
	 */
	private boolean isSubOrganization(OrganizationDO toOrganization, OrganizationDO fromOrganization) {
		boolean result = false;
		if (null == toOrganization) {
			if (toOrganization == fromOrganization) {
				result = true;
			}
		} else {
			if (toOrganization.equals(fromOrganization)) {
				result = true;
			} else {
				// 递归判断目标组织的父组织是否是源组织的下级组织
				result = isSubOrganization(toOrganization.getParent(), fromOrganization);
			}
		}
		return result;
	}
	
	public Integer validateDeptCode(String deptCode) {
		@SuppressWarnings("unchecked")
		List<OrganizationDO> list = this.getHibernateTemplate().find("from OrganizationDO where deleted = false and deptCode = ?", deptCode);
		return list.size();
	}
	
	/**
	 * 获取组织的全路径
	 * 
	 * @param organization
	 * @return
	 */
	public String getFullPathOfOrganization(OrganizationDO organization) {
		StringBuilder path = new StringBuilder();
		if (null != organization) {
			organization = this.internalGetById(organization.getId());
			path.append("/" + organization.getName());
			while (organization.getParent() != null) {
				organization = organization.getParent();
				if (organization.getParent() != null) {
					path.insert(0, "/" + organization.getName());
				}
			}
		}
		return path.toString();
	}
	
	@SuppressWarnings("unchecked")
	public List<HashMap<String,Object>> getOrganizationByUserId(int userId){
		List<OrganizationDO> list = this.getHibernateTemplate().find("select a from OrganizationDO a left join a.users u where a.deleted = 0 and u.id = ?", userId);
		List<HashMap<String,Object>> currList = new ArrayList<HashMap<String,Object>>();
		for (OrganizationDO organizationDO : list) {
			HashMap<String, Object> map = new HashMap<String, Object>();
			String name = this.getFullPathOfOrganization(organizationDO);
			map.put("orgId", name);
			map.put("orgName", name);
			currList.add(map);
		}
		return currList;
	}
	/**
	 * 返回当前组织下所有的子组织
	 * @param id
	 * @return
	 */
	public List<OrganizationDO> getAllOrganizationByParent(Integer id){
		List<OrganizationDO> organizations = new ArrayList<OrganizationDO>();
		OrganizationDO organization = this.internalGetById(id);
		organizations.add(organization);
		List<OrganizationDO> next = this.getByParent(id);
		organizations.addAll(next);
		while (next.size() > 0){
			List<OrganizationDO> hasnext = new ArrayList<OrganizationDO>();
			for (OrganizationDO o : next){
				hasnext.addAll(this.getByParent(o.getId()));
			}
			organizations.addAll(hasnext);
			next = hasnext;
		}
		return organizations;
	}

	@Override
	public Collection<Integer> getUserByOrganizationRole(Integer id, Integer roleId, String field) {
		List<Integer> userIdList = new ArrayList<Integer>();
		List<CustomFieldValueDO> customFieldValueList = customFieldValueDao.getByActivityId(id);
		if(customFieldValueList==null||customFieldValueList.size()==0){
			return new HashSet<Integer>();
		}
		List<CustomFieldDO> customFieldList = customFieldDao.getByName("员工报告处理部门ID");
		if(customFieldList==null||customFieldList.size()==0){
			return new HashSet<Integer>();
		}
		String deptId = "";
		for (CustomFieldValueDO customFieldValue : customFieldValueList) {
			if(("customfield_"+customFieldList.get(0).getId()).equals(customFieldValue.getKey())){
				deptId = customFieldValue.getStringValue();
			}
		}
		if("".equals(deptId)){
			return new HashSet<Integer>();
		}
		OrganizationDO organization =  this.internalGetById(Integer.parseInt(deptId));
		UnitDO unit = organization.getUnit();
		if(unit==null) return new HashSet<Integer>();
		
		
		Set<UserDO> userSet = organization.getUsers();
		if(userSet==null||userSet.size()==0){
			return new HashSet<Integer>();
		}
		List<UnitRoleActorDO> userList = unitRoleActorDao.getByUnitAndRole(unit.getId(),roleId);
		for (UnitRoleActorDO unitRoleActor : userList) {
			if(!"USER".equals(unitRoleActor.getType())) continue;
			String userId = unitRoleActor.getParameter();		
			for (UserDO user : userSet) {
				if(userId.equals(user.getId()+"")){
					userIdList.add(user.getId());
				}
			}
			
		}
		return userIdList;
	}
	/**
	 * 看一个人是否为某个组织下的人
	 * @param organizationId
	 * @param userId
	 * @return
	 */
	public boolean isOrganizationAndUser(Integer organizationId, Integer userId){
		String sql = "from OrganizationDO t join t.users u where t.deleted = false and t.id = ? and u.id = ?";
		@SuppressWarnings("unchecked")
		List<OrganizationDO> organizations = this.getHibernateTemplate().find(sql,organizationId,userId);
		if (organizations.size() > 0){
			return true;
		}
		return false;
	}
	
	@SuppressWarnings("unchecked")
	public List<OrganizationDO> getByParent(Integer id){
		return this.getHibernateTemplate().find("from OrganizationDO t where t.deleted = false and t.parent.id = ?",id);
	}
	
	/**
	 * 根据组织编号查询对应的组织
	 * @param deptCode
	 * @return
	 */
	public OrganizationDO getByDeptCode(String deptCode) {
		@SuppressWarnings("unchecked")
		List<OrganizationDO> list = (List<OrganizationDO>) this.query("from OrganizationDO t where t.deleted = false and upper(concat(',', t.deptCode, ',')) like upper(?)", "%," + deptCode + ",%");
		return list.isEmpty() ? null : list.get(0);
	}
	
	/**
	 * 获取员工安全报告的部门
	 * @param unitId
	 * @return
	 */
	public List<OrganizationDO> getByUnitforEm(String unitId) {
		if (StringUtils.isBlank(unitId)) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "请选择所属部门");
		}
		UnitDO unit = new UnitDO();
		unit.setId(Integer.parseInt(unitId));
		List<OrganizationDO> listOrg = this.getByUnitforEm(unit);
		Iterator<OrganizationDO> iterator = listOrg.iterator();
		while (iterator.hasNext()) {
			OrganizationDO organizationDO = iterator.next();
			if (organizationDO.getName().indexOf("安全监察部") > -1) {
				iterator.remove();
			}
		}
		return listOrg;
	}
	
	/**
	 * 获取给定安监机构对应的组织下的所有用户
	 * @param unitId
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<UserDO> getOrgUserByUnit(Integer unitId) {
		return (List<UserDO>) this.query("select distinct u from OrganizationDO o left join o.users u where o.deleted = false and o.unit.id = ?", unitId);
	}
	
	/**
	 * 获取给定安监机构ids对应的的组织
	 * @param unitIds
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<OrganizationDO> getByUnitIds(List<Integer> unitIds, String term) {
		StringBuffer hql = new StringBuffer("from OrganizationDO o where o.deleted = false");
		List<String> params = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		if (unitIds != null && !unitIds.isEmpty()) {
			hql.append(" and o.unit.id in (:unitIds)");
			params.add("unitIds");
			values.add(unitIds);
		}
		if (StringUtils.isNotBlank(term)) {
			hql.append(" and upper(o.name) like upper(:term) escape '/'");
			params.add("term");
			String transferredContent = term.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
			transferredContent = "%" + transferredContent + "%";
			values.add(transferredContent);
		}
		hql.append(" order by o.name");
		return (List<OrganizationDO>) this.query(hql.toString(), params.toArray(new String[0]), values.toArray());
	}
	
	/**
	 * 获取给定安监机构对应的组织下的所有用户
	 * @param unitId
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<UserDO> getOrgUserByUnits(List<Integer> unitIds) {
		if (unitIds == null || unitIds.isEmpty()) {
			return new ArrayList<UserDO>();
		}
		List<Object> values = new ArrayList<Object>();
		values.add(unitIds);
		return (List<UserDO>) this.query("select distinct u from OrganizationDO o left join o.users u where o.deleted = false and o.unit.id in (:unitIds)", new String[]{"unitIds"}, values.toArray());
	}
	
	@Override
	public void writeUser(Integer id, String[] userIds) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public void setStatus(Integer id, Integer statusId,
			Map<String, Object> attributes) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public Collection<Integer> getUserByUnitRole(Integer id, Integer roleId) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Collection<Integer> getUserByUnitRoles(Integer id,
			Collection<Integer> roleIds) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Collection<Integer> getUserByOrganizationRoles(Integer id, Collection<Integer> roleIds, String field) {
		// TODO Auto-generated method stub
		return null;
	}
	
	/**
	 * 发送待办的信息
	 * @param id
	 * @param userIds
	 */
	@Override
	public void sendTodoMsg(Integer id, Collection<Integer> userIds, Collection<String> sendingModes) {
	}
	
	@Override
	public void sendFeedbackMsg(Integer id, Collection<String> sendingModes) {
		// TODO Auto-generated method stub
		
	}
	
	public void setDictionaryDao(DictionaryDao dictionaryDao) {
		this.dictionaryDao = dictionaryDao;
	}
	
	public void setUnitRoleActorDao(UnitRoleActorDao unitRoleActorDao) {
		this.unitRoleActorDao = unitRoleActorDao;
	}
	
	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}

	public void setCustomFieldValueDao(CustomFieldValueDao customFieldValueDao) {
		this.customFieldValueDao = customFieldValueDao;
	}

	public void setCustomFieldDao(CustomFieldDao customFieldDao) {
		this.customFieldDao = customFieldDao;
	}

	public void setTempTableDao(TempTableDao tempTableDao) {
		this.tempTableDao = tempTableDao;
	}
	
}
