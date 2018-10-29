package com.usky.sms.audit.base;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.audit.EnumAuditRole;
import com.usky.sms.audit.auditor.AuditorDao;
import com.usky.sms.audit.plan.EnumPlanType;
import com.usky.sms.audit.task.TaskDO;
import com.usky.sms.common.NumberHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.menu.MenuCache;
import com.usky.sms.menu.MenuItem;
import com.usky.sms.organization.OrganizationDO;
import com.usky.sms.organization.OrganizationDao;
import com.usky.sms.permission.IPermission;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.role.RoleDO;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.unit.UnitRoleActorDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserGroupDO;
import com.usky.sms.user.UserGroupDao;

public class ProfessionUserDao extends BaseDao<ProfessionUserDO> implements IPermission {

	protected ProfessionUserDao() {
		super(ProfessionUserDO.class);
	}

	@Autowired
	private DictionaryDao dictionaryDao;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private UnitRoleActorDao unitRoleActorDao;
	
	@Autowired
	private UserGroupDao userGroupDao;
	
	@Autowired
	private AuditorDao auditorDao;

	@Autowired
	private MenuCache menuCache;
	
	@Autowired
	private OrganizationDao organizationDao;

	private static final String dictionaryType = "系统分类";

	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}

	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		map.put("creator", UserContext.getUserId());
		map.put("lastUpdater", UserContext.getUserId());
		return true;
	}

	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		map.put("lastUpdater", UserContext.getUserId());
	}

	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple, boolean showExtendFields) {
		ProfessionUserDO professionUser = (ProfessionUserDO) obj;
		Set<UserDO> users = professionUser.getUsers();
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		if(users != null){
			for (UserDO user : users) {
				Map<String, Object> userMap = new HashMap<String, Object>();
				userMap.put("userId", user.getId());
				userMap.put("username", user.getUsername());
				userMap.put("userFullName", user.getFullname());
				list.add(userMap);
			}
		}
		map.put("users", list);
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
	}
	
	private void syncProfession(String unit, List<DictionaryDO> professions) {
		@SuppressWarnings("unchecked")
		List<ProfessionUserDO> professionUsers = this.getHibernateTemplate().find("from ProfessionUserDO t where t.deleted = false and t.unit.id = ?",NumberHelper.toInteger(unit));
		UnitDO unitDo = unitDao.internalGetById(NumberHelper.toInteger(unit));
		if (professionUsers.size() == 0){
			for (DictionaryDO profession : professions) {
				List<ProfessionUserDO> professionUser = this.getByUnitAndProfession(NumberHelper.toInteger(unit), profession.getId());
				if (professionUser.size() == 0) {
					ProfessionUserDO professionUserDO = new ProfessionUserDO();
					professionUserDO.setCreator(UserContext.getUser());
					professionUserDO.setLastUpdater(UserContext.getUser());
					professionUserDO.setProfession(profession);
					professionUserDO.setUnit(unitDo);
					this.internalSave(professionUserDO);
				}
			}
		}
	}

	@SuppressWarnings("unchecked")
	public List<ProfessionUserDO> getList() {
		List<ProfessionUserDO> list = this.getHibernateTemplate().find("from ProfessionUserDO where deleted = false");
		return list;
	}

	public List<ProfessionUserDO> getProfessionUserBySearch(String unit, String profession, String name) {
		List<DictionaryDO> professions = dictionaryDao.getListByType(dictionaryType);
		if (unit == null){
			List<UnitDO> units = unitDao.getList();
			for (UnitDO u : units){
				syncProfession(u.getId().toString(), professions);
			}
		} else {
			syncProfession(unit, professions);
		}
		StringBuffer sql = new StringBuffer("select t from ProfessionUserDO t");
		List<Object> param = new ArrayList<Object>();
		if (name != null){
			sql.append(" left join t.users user");
		}
		sql.append(" where t.deleted = false");
		if (name != null){
			sql.append(" and upper(user.fullname) like upper(?)");
			param.add("%"+name+"%");
		}
		if (unit != null){
			sql.append(" and t.unit.id = ?");
			param.add(NumberHelper.toInteger(unit));
		}
		if (profession != null){
			sql.append(" and t.profession.id = ?");
			param.add(NumberHelper.toInteger(profession));
		}
		@SuppressWarnings("unchecked")
		List<ProfessionUserDO> list = this.getHibernateTemplate().find(sql.toString(),param.toArray());
		return list;
	}
	
	@SuppressWarnings("unchecked")
	public List<ProfessionUserDO> getByUnitAndProfession(Integer unit, Integer profession){
		List<ProfessionUserDO> list = this.getHibernateTemplate().find("from ProfessionUserDO where deleted = false and unit.id = ? and profession.id = ?",unit,profession);
		return list;
	}
	
	@SuppressWarnings("unchecked")
	public List<UserDO> getAuditorsByRoleName(Integer profession, String roleName, String taskId, String term, Integer unitId){
		List<RoleDO> roles = this.getHibernateTemplate().find("from RoleDO where deleted = false and name = ?",roleName);
		if (roles.size() == 0 || roles.size() > 1)  throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "角色里没有" + roleName + "角色 ！");
		Integer roleId = roles.get(0).getId();
		List<UserDO> roleUsers = unitRoleActorDao.getUsersByUnitIdAndRoleId(unitId, roleId);
		List<UserDO> professionUsers = null;
		if (profession != null){
			professionUsers = this.getHibernateTemplate().find("select t.users from ProfessionUserDO t where t.deleted = false and t.profession.id = ?",profession);
		}
		List<UserDO> list = new ArrayList<UserDO>();
		for (UserDO user : roleUsers){
			if (profession != null){
				if (professionUsers.contains(user)){
					if (term != null && !"".equals(term)){
						if (user.getFullname().indexOf(term) > -1){
							list.add(user);
						}
					} else {
						list.add(user);
					}
				}
			} else {
				if (term != null && !"".equals(term)){
					if (user.getFullname().indexOf(term) > -1){
						list.add(user);
					}
				} else {
					list.add(user);
				}
			}
		}
		return list;
			
	}
	
	public List<UserDO> getYiJiShenJiYuan(TaskDO task){
		DictionaryDO dic = dictionaryDao.getByTypeAndKey("审计角色", "A1");
		String userGroupName = dic.getName();
		UserGroupDO userGroup = auditorDao.getUserGroupByName(userGroupName);
		if (userGroup == null) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT,"字典里没有一级审计员参数！");
		List<UserDO> list = auditorDao.getUserByUserGroup(userGroup.getId());
		return list;
	}
	public List<UserDO> getErJiShenJiYuan(TaskDO task){
		Integer operator = NumberHelper.toInteger(task.getOperator());
		if (EnumPlanType.SUB3.toString().equals(task.getPlanType())) {
			OrganizationDO organization = organizationDao.internalGetById(operator);
			operator = organization.getUnit().getId();
		}
		DictionaryDO dic = dictionaryDao.getByTypeAndKey("审计角色", "A2");
		if (dic == null) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT,"字典里没有二级审计员参数！");
		String roleName = dic.getName();
		RoleDO role = auditorDao.getRole(roleName);
		if (role == null) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT,"没有 "+ roleName + "角色！");
		List<UserDO> list = unitRoleActorDao.getUsersByUnitIdAndRoleId(operator, role.getId());
		return list;
	}
	public List<UserDO> getSanJiShenJiYuan(TaskDO task){
		Integer operator = NumberHelper.toInteger(task.getOperator());
		DictionaryDO dic = dictionaryDao.getByTypeAndKey("审计角色", "A3");
		if (dic == null) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT,"字典里没有三级审计员参数！");
		String roleName = dic.getName();
		RoleDO role = auditorDao.getRole(roleName);
		if (role == null) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT,"没有 "+ roleName + "角色！");
		OrganizationDO organization = organizationDao.internalGetById(operator);
		List<UserDO> list = new ArrayList<UserDO>();
		if (organization.getUnit() != null){
			list.addAll(unitRoleActorDao.getUsersByUnitIdAndRoleId(organization.getUnit().getId(), role.getId()));
		}
		return list;
	}
	
	public List<Map<String,Object>> getXiangMuZhuGuan(TaskDO task, String term){
		List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
		Set<UserDO> users = new HashSet<UserDO>();
		if (EnumPlanType.SYS.toString().equals(task.getPlanType())){
			users.addAll(this.getYiJiShenJiYuan(task));
		} else if (EnumPlanType.SUB2.toString().equals(task.getPlanType())){
			users.addAll(this.getYiJiShenJiYuan(task));
			users.addAll(this.getErJiShenJiYuan(task));
		} else if (EnumPlanType.SUB3.toString().equals(task.getPlanType())){ 
			users.addAll(this.getYiJiShenJiYuan(task));
			users.addAll(this.getErJiShenJiYuan(task));
			users.addAll(this.getSanJiShenJiYuan(task));
		}
		list.addAll(this.productUserMap(new ArrayList<UserDO>(users), term));
		return list;
	}
	
	private List<Map<String, Object>> productUserMap(List<UserDO> users, String term) {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		for (UserDO user : users) {
			if (term != null) {
				if (user.getFullname().indexOf(term) > -1 || user.getUsername().indexOf(term) > -1) {
					Map<String, Object> map = new HashMap<String, Object>();
					map.put("id", user.getId());
					map.put("name", user.getFullname());
					map.put("username", user.getUsername());
					list.add(map);
				}
			} else {
				Map<String, Object> map = new HashMap<String, Object>();
				map.put("id", user.getId());
				map.put("name", user.getFullname());
				map.put("username", user.getUsername());
				list.add(map);
			}
		}
		return list;
	}
	
	public List<UserDO> getYiJiShenJiYuan(Integer professionId, String taskId, String term){
		DictionaryDO dic = dictionaryDao.getByTypeAndKey("审计角色", "A1");
		if (dic == null) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT,"字典里没有一级审计员参数！");
		String userGroupName = dic.getName();
		UserGroupDO userGroup = auditorDao.getUserGroupByName(userGroupName);
		List<UserDO> users = auditorDao.getUserByUserGroup(userGroup.getId(), professionId, term);
		return users;
	}
	
	public List<UserDO> getErJiShenJiYuan(Integer professionId, TaskDO task, String term){
		Integer operator = NumberHelper.toInteger(task.getOperator());
		if (EnumPlanType.SUB3.toString().equals(task.getPlanType())) {
			OrganizationDO organization = organizationDao.internalGetById(operator);
			operator = organization.getUnit().getId();
		}
		DictionaryDO dic = dictionaryDao.getByTypeAndKey("审计角色", "A2");
		if (dic == null) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT,"字典里没有二级审计员参数！");
		String roleName = dic.getName();
		RoleDO role = auditorDao.getRole(roleName);
		if (role == null) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT,"没有 "+ roleName + "角色！");
		List<UserDO> list = unitRoleActorDao.getUsersByUnitIdAndRoleId(operator, role.getId());
		List<Integer> ids = new ArrayList<Integer>();
		for (UserDO user : list){
			ids.add(user.getId());
		}
		//分子公司审计 能选一级、二级审计员
		List<UserDO> allUsers = auditorDao.getUserByProfession2(ids, professionId);
		allUsers.addAll(this.getYiJiShenJiYuan(professionId, task.getId().toString(), term));
		
		Set<UserDO> users = new HashSet<UserDO>();
		if (term != null && !"".equals(term)){
			for (UserDO user : allUsers){
				if (user == null) continue;
				if (user.getFullname().indexOf(term) > -1 || user.getUsername().indexOf(term) > -1){
					users.add(user);
				}
			}
		} else {
			users.addAll(allUsers);
		}
		return new ArrayList<UserDO>(users);
	}
	
	public Collection<? extends UserDO> getSanJiShenJiYuan(Integer professionId, TaskDO task, String term) {
		Integer operator = NumberHelper.toInteger(task.getOperator());
		DictionaryDO dic = dictionaryDao.getByTypeAndKey("审计角色", "A3");
		if (dic == null) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT,"字典里没有二级审计员参数！");
		String roleName = dic.getName();
		RoleDO role = auditorDao.getRole(roleName);
		if (role == null) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT,"没有 "+ roleName + "角色！");
		OrganizationDO organization = organizationDao.internalGetById(operator);
		Set<UserDO> users = new HashSet<UserDO>();
		if (organization.getUnit() != null){
			List<UserDO> list = unitRoleActorDao.getUsersByUnitIdAndRoleId(organization.getUnit().getId(), role.getId());
			List<Integer> ids = new ArrayList<Integer>();
			for (UserDO user : list){
				ids.add(user.getId());
			}
			// 二级内审能选一级、二级、三级审计员
			List<UserDO> allUsers = auditorDao.getUserByProfession3(ids, professionId);//三级
			allUsers.addAll(this.getErJiShenJiYuan(professionId, task, term));//二级的时候已经包含一级了
			
			if (term != null && !"".equals(term)){
				for (UserDO user : allUsers){
					if (user == null) continue;
					if (user.getFullname().indexOf(term) > -1 || user.getUsername().indexOf(term) > -1){
						users.add(user);
					}
				}
			} else {
				users.addAll(allUsers);
			}
		}
		return users;
	}
	
	public List<UserDO> getYiJiShenJiZhuGuan(){
		DictionaryDO dic = dictionaryDao.getByTypeAndKey("审计角色", "A1.2");
		if (dic == null) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT,"字典里没有一级审计主管参数！");
		String userGroupName = dic.getName();
		UserGroupDO userGroup = auditorDao.getUserGroupByName(userGroupName);
		if (userGroup.getUsers() != null){
			return new ArrayList<UserDO>(userGroup.getUsers());
		} else {
			return new ArrayList<UserDO>();
		}
	}
	
	public List<UserDO> getYiJiShenJiJingLi(){
		DictionaryDO dic = dictionaryDao.getByTypeAndKey("审计角色", "A1.1");
		if (dic == null) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT,"字典里没有一级审计经理参数！");
		String userGroupName = dic.getName();
		UserGroupDO userGroup = auditorDao.getUserGroupByName(userGroupName);
		if (userGroup.getUsers() != null){
			return new ArrayList<UserDO>(userGroup.getUsers());
		} else {
			return new ArrayList<UserDO>();
		}
	}
	/**
	 * 若果不是一级审计主管，就不显示设置当前版本、创建版本导出这三个按钮，
	 * 却返回此人所在的安监机构id
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public Object getMarkByUser(){
		Object mark = null;
		List<UserDO> yiJiShenJiZhuGuan = this.getYiJiShenJiZhuGuan();
		if (yiJiShenJiZhuGuan.contains(UserContext.getUser())) {
			mark =  "DISPLAY";
		} else {
			List<UnitDO> units = unitDao.getUnits(PermissionSets.VIEW_UNIT.getName(), null);
			mark = new ArrayList<Integer>();
			for (UnitDO u : units) {
				((List<Integer>) mark).add(u.getId());
			}
		}
		return mark;
	}
	
	/**
	 * 根据用户ID返回用户所在的专业
	 * @param userId
	 * @return 用户所在的专业
	 */
	@SuppressWarnings("unchecked")
	public List<DictionaryDO> getProfessionsByUserId(Integer userId){
		if (null == userId) {
			return new ArrayList<DictionaryDO>();
		}
		return (List<DictionaryDO>) this.query("select distinct t.profession from ProfessionUserDO t left join t.users u where t.deleted = false and u.id = ?", userId);
	}
	
	@Override
	public boolean hasPermission(Integer id, HttpServletRequest request) {
		MenuItem item = menuCache.getMenuItemById(id);
		String path = item.getPath();
//		"审计管理/专业用户", 
//		"审计管理/检查要点库",
//		"审计管理/人员资质", 
		List<DictionaryDO> dics = dictionaryDao.getListByType("审计角色");
		Map<String, Object> roleMap = new HashMap<String, Object>();
		for (DictionaryDO dic : dics) {
			roleMap.put(dic.getKey(), dic.getName());
		}
		// 一级审计经理或一级审计主管可以看到专业用户、人员资质，一级审计主管或二级审计主管可以看到检查要点库
		if ("审计管理/人员资质".equals(path) || "审计管理/专业用户".equals(path)) {
			// 一级审计经理或一级审计主管可以看到专业用户、人员资质
			return userGroupDao.isUserGroups(UserContext.getUserId(), (String) roleMap.get(EnumAuditRole.FIRST_GRADE_AUDIT_MANAGER_GROUP.getKey()), (String) roleMap.get(EnumAuditRole.FIRST_GRADE_AUDIT_MASTER_GROUP.getKey()));
		} else if ("审计管理/检查要点库".equals(path)) {
			// 一级审计主管和二级审计主管可以看到检查要点库
			if (userGroupDao.isUserGroup(UserContext.getUserId(), (String) roleMap.get(EnumAuditRole.FIRST_GRADE_AUDIT_MASTER_GROUP.getKey()))) {
				return true;
			} else {
				return unitRoleActorDao.isRole(UserContext.getUserId(), (String) roleMap.get(EnumAuditRole.SECOND_GRADE_AUDIT_MASTER.getKey()));
			}
		}
		return false;
	}
	
	public DictionaryDao getDictionaryDao() {
		return dictionaryDao;
	}

	public void setDictionaryDao(DictionaryDao dictionaryDao) {
		this.dictionaryDao = dictionaryDao;
	}

	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}

	public void setUnitRoleActorDao(UnitRoleActorDao unitRoleActorDao) {
		this.unitRoleActorDao = unitRoleActorDao;
	}

	public void setUserGroupDao(UserGroupDao userGroupDao) {
		this.userGroupDao = userGroupDao;
	}

	public void setAuditorDao(AuditorDao auditorDao) {
		this.auditorDao = auditorDao;
	}

	public void setMenuCache(MenuCache menuCache) {
		this.menuCache = menuCache;
	}

	public void setOrganizationDao(OrganizationDao organizationDao) {
		this.organizationDao = organizationDao;
	}

}
