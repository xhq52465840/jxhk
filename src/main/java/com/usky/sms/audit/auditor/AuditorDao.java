package com.usky.sms.audit.auditor;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.audit.base.ProfessionUserDao;
import com.usky.sms.avatar.AvatarDO;
import com.usky.sms.common.NumberHelper;
import com.usky.sms.common.PageHelper;
import com.usky.sms.config.Config;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.file.FileDO;
import com.usky.sms.file.FileDao;
import com.usky.sms.role.RoleDO;
import com.usky.sms.role.RoleDao;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitRoleActorDO;
import com.usky.sms.unit.UnitRoleActorDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;
import com.usky.sms.user.UserGroupDO;
import com.usky.sms.user.UserGroupDao;

public class AuditorDao extends BaseDao<AuditorDO> {
	
	private Config config;
	
	@Autowired
	private DictionaryDao dictionaryDao;
	
	@Autowired
	private UnitRoleActorDao unitRoleActorDao;
	
	@Autowired
	private UserDao userDao;
	
	@Autowired
	private UserGroupDao userGroupDao;
	
	@Autowired
	private AuditorInfoDao auditorInfoDao;
	
	@Autowired
	private RoleDao roleDao;
	
	@Autowired
	private ProfessionUserDao professionUserDao;
	
	@Autowired
	private FileDao fileDao;

	protected AuditorDao() {
		super(AuditorDO.class);
		this.config = Config.getInstance();
	}

	@SuppressWarnings("unchecked")
	public UserGroupDO getUserGroupByName(String name){
		String sql = "from UserGroupDO u where u.deleted = false and u.name = ?";
		List<UserGroupDO> list = this.getHibernateTemplate().find(sql,name);
		if (list.size() > 0){
			return list.get(0);
		} else {
			return null;
		}
	}
	
	@SuppressWarnings("unchecked")
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public Map<String, Object> getAuditors(String unit, String user, String profession, Integer paramType, HttpServletRequest request){
		DictionaryDO dic = dictionaryDao.getByTypeAndKey("审计角色", "A1");
		UserGroupDO userGroup = this.getUserGroupByName(dic.getName());
		List<AuditorDO> auditors = this.getList();
		List<Map<String, Object>> lefts = new ArrayList<Map<String,Object>>();
		List<Map<String, Object>> list = new ArrayList<Map<String,Object>>();
		for (AuditorDO auditor : auditors){
			if (auditor.getUserGroup() != null){
				Map<String, Object> map = new HashMap<String, Object>();
				map.put("id", auditor.getId());
				if (auditor.getUser() != null){
					map.put("userid", auditor.getUser().getId());
					map.put("userfullname", auditor.getUser().getFullname());
				} else {
					map.put("userid", null);
					map.put("userfullname", null);
				}
				map.put("department", auditor.getDepartment());
				if (auditor.getUser() != null && auditor.getUser().getAvatar() != null) {
					AvatarDO avatar = auditor.getUser().getAvatar();
					map.put("avatar", avatar.getId());
					map.put("avatarUrl", config.getUserAvatarWebPath() + "/" + avatar.getFileName());
				} else {
					map.put("avatarUrl", config.getUserAvatarWebPath() + "/" + config.getUnknownUserAvatar());
				}
				list.add(map);
			}
		}
		Map<String, Object> leftMap = new HashMap<String, Object>();
		leftMap.put("usergroupid", userGroup.getId());
		leftMap.put("usergroupname", userGroup.getName());
		leftMap.put("users", list);
		lefts.add(leftMap);
		List<Map<String, Object>> rights = new ArrayList<Map<String,Object>>();
		StringBuffer sql = new StringBuffer("select distinct a from AuditorDO a");
		List<Object> param = new ArrayList<Object>();
		
		if (profession != null && !"".equals(profession)){
			sql.append(" left join a.system s");
		}
		sql.append(" where a.deleted = false");
		if (unit != null && !"".equals(unit)){
			sql.append(" and a.unit.id = ?");
			param.add(NumberHelper.toInteger(unit));
		}
		if (user != null && !"".equals(user)){
			sql.append(" and a.user.id = ?");
			param.add(NumberHelper.toInteger(user));
		}
		if (profession != null && !"".equals(profession)){
			sql.append(" and s.id = ?");
			param.add(NumberHelper.toInteger(profession));
		}
//		if (paramType == 1){
//			sql.append(" and a.param = 1");
//		} else if (paramType == 1){
//			sql.append(" and a.param = 2");
//		}
		sql.append(" order by a.unit.id desc");
		List<AuditorDO> filterauditors = this.getHibernateTemplate().find(sql.toString(), param.toArray());
		for (AuditorDO auditor : filterauditors){
			if (auditor.getUserGroup() == null){
				Map<String, Object> map = new HashMap<String, Object>();
				map.put("id", auditor.getId());
				if (auditor.getUser() != null){
					map.put("userid", auditor.getUser().getId());
					map.put("userfullname", auditor.getUser().getFullname());
				} else {
					map.put("userid", null);
					map.put("userfullname", null);
				}
				if (auditor.getUnit() != null){
					map.put("unitid", auditor.getUnit().getId());
					map.put("unitname", auditor.getUnit().getName());
				} else {
					map.put("unitid", null);
					map.put("unitname", null);
				}
				map.put("profession", auditor.getSystem());
				if (auditor.getUser() != null && auditor.getUser().getAvatar() != null) {
					AvatarDO avatar = auditor.getUser().getAvatar();
					map.put("avatar", avatar.getId());
					map.put("avatarUrl", config.getUserAvatarWebPath() + "/" + avatar.getFileName());
				} else {
					map.put("avatarUrl", config.getUserAvatarWebPath() + "/" + config.getUnknownUserAvatar());
				}
				rights.add(map);
			}
		}
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("left", lefts);
		map.put("right", PageHelper.getPagedResult(rights, request));
		return map;
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		Integer userId = ((Number) map.get("user")).intValue();
		@SuppressWarnings("unchecked")
		List<AuditorDO> auditors = this.getHibernateTemplate().find("from AuditorDO a where a.deleted = false and a.user.id = ?", userId);
		if (auditors.size() > 0){
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "此人已存在于列表中，请勿重复添加！");
		}
		return true;
	}
	
	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		Object userGroup = map.get("userGroup");
		AuditorDO auditor = this.internalGetById(id);
		if (userGroup != null && auditor.getSystem().size() == 0){
			throw new  SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "此人不属于任何专业,不允许加为一级审计员!");
		}
	}

	@Override
	protected void afterUpdate(AuditorDO obj, AuditorDO dbObj) {
		DictionaryDO dic = dictionaryDao.getByTypeAndKey("审计角色", "A1");
		UserGroupDO userGroup = this.getUserGroupByName(dic.getName());
		userGroup.setUsers(this.getAuditorAllUser(userGroup.getId()));
		userGroupDao.update(userGroup);
	}

	@SuppressWarnings("unchecked")
	private Set<UserDO> getAuditorAllUser(Integer id){
		String sql = "";
		List<UserDO> list = new ArrayList<UserDO>();
		if (id == null){
			sql = "select a.user from AuditorDO a where a.deleted = false";
			list.addAll((List<UserDO>)this.getHibernateTemplate().find(sql,id));
		} else {
			sql = "select a.user from AuditorDO a where a.deleted = false and a.userGroup.id = ?";
			list.addAll((List<UserDO>)this.getHibernateTemplate().find(sql,id));
		}
		
		Set<UserDO> set = new HashSet<UserDO>(list);
		return set;
	}
	
	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple, boolean showExtendFields) {
		AuditorDO auditor = (AuditorDO) obj;
		if (auditor.getUser() != null && auditor.getUser().getAvatar() != null) {
			AvatarDO avatar = auditor.getUser().getAvatar();
			map.put("avatar", avatar.getId());
			map.put("avatarUrl", config.getUserAvatarWebPath() + "/" + avatar.getFileName());
		} else {
			map.put("avatarUrl", config.getUserAvatarWebPath() + "/" + config.getUnknownUserAvatar());
		}
		UserDO user = auditor.getUser();
		Map<String, Object> userMap = new HashMap<String, Object>();
		if (user != null){
			userMap.put("id", user.getId());
			userMap.put("fullname", user.getFullname());
		} else {
			userMap.put("id", null);
			userMap.put("fullname", null);
		}
		map.put("user", userMap);
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
	}

	public List<Map<String, Object>> getAuditorByRole(String term){
		List<AuditorDO> auditors = this.getList();
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		List<Integer> removeal = new ArrayList<Integer>();
		for (AuditorDO auditor : auditors) {
			if (auditor.getUserGroup() == null) continue;
			if (auditor.getUnit() == null || auditor.getUser() == null) continue;
			if (term != null){
				if (auditor.getUser().getFullname().indexOf(term) > -1 || auditor.getUser().getUsername().indexOf(term) > -1){
					if (removeal.contains(auditor.getUnit().getId())) {
						Map<String, Object> map = new HashMap<String, Object>();
						map.put("userId", auditor.getUser().getId());
						map.put("userfullname", auditor.getUser().getFullname());
						map.put("parentId", auditor.getUnit().getId());
						map.put("username", auditor.getUser().getUsername());
						list.add(map);
					} else {
						Map<String, Object> unitMap = new HashMap<String, Object>();
						unitMap.put("unitId", auditor.getUnit().getId());
						unitMap.put("unitName", auditor.getUnit().getName());
						unitMap.put("parentId", 0);
						list.add(unitMap);
						Map<String, Object> map = new HashMap<String, Object>();
						map.put("userId", auditor.getUser().getId());
						map.put("userfullname", auditor.getUser().getFullname());
						map.put("parentId", auditor.getUnit().getId());
						map.put("username", auditor.getUser().getUsername());
						list.add(map);
						removeal.add(auditor.getUnit().getId());
					}
				}
			} else {
				if (removeal.contains(auditor.getUnit().getId())) {
					Map<String, Object> map = new HashMap<String, Object>();
					map.put("userId", auditor.getUser().getId());
					map.put("userfullname", auditor.getUser().getFullname());
					map.put("parentId", auditor.getUnit().getId());
					map.put("username", auditor.getUser().getUsername());
					list.add(map);
				} else {
					Map<String, Object> unitMap = new HashMap<String, Object>();
					unitMap.put("unitId", auditor.getUnit().getId());
					unitMap.put("unitName", auditor.getUnit().getName());
					unitMap.put("parentId", 0);
					list.add(unitMap);
					Map<String, Object> map = new HashMap<String, Object>();
					map.put("userId", auditor.getUser().getId());
					map.put("userfullname", auditor.getUser().getFullname());
					map.put("parentId", auditor.getUnit().getId());
					map.put("username", auditor.getUser().getUsername());
					list.add(map);
					removeal.add(auditor.getUnit().getId());
				}
			}
		}
		return list;
	}
	
	@SuppressWarnings("unchecked")
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void saveAuditorTrain(Map<String, Object> objMap) {
		List<Number> userIds = (List<Number>) objMap.get("userIds");// 人的id
		if (userIds.get(0) == null) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "请选择至少一个人员！");
		String content = (String) objMap.get("content"); // 内容
		String department = (String) objMap.get("department"); // 机构
		String startDate = (String) objMap.get("startDate");
		String endDate = (String) objMap.get("endDate");
		String teacher = (String) objMap.get("teacher");
		String manager = (String) objMap.get("manager");
		List<Number> fileIds = (List<Number>) objMap.get("fileIds");
		List<FileDO> files = new ArrayList<FileDO>();
		if (fileIds != null && fileIds.size() > 0 && fileIds.get(0) != null) {
			files.addAll(fileDao.internalGetByIds(fileIds.toArray(new String[fileIds.size()])));
		}
		String sql = "select distinct t from AuditorDO t where t.deleted = false and t.user.id in ( " + StringUtils.join(userIds, ",") + " )";
		List<AuditorDO> auditors = this.getHibernateTemplate().find(sql);
		for (AuditorDO auditor : auditors) {
			AuditorInfoDO auditorInfo = new AuditorInfoDO();
			auditorInfo.setAuditor(auditor);
			auditorInfo.setType("TRAIN");
			auditorInfo.setContent(content);
			auditorInfo.setDepartment(department);
			auditorInfo.setStartDate(startDate);
			auditorInfo.setEndDate(endDate);
			auditorInfo.setTeacher(teacher);
			auditorInfo.setManager(manager);
			auditorInfo.setCreator(UserContext.getUser());
			auditorInfo.setUpdater(UserContext.getUser());;
			int id = (int) auditorInfoDao.internalSave(auditorInfo);
			for (FileDO f : files) {
				f.setSource(id);
				fileDao.internalUpdate(f);
			}
		}
		
	}
	
	@SuppressWarnings("unchecked")
	public void saveAuditorTrainErJi(Map<String, Object> objMap) {
		String eventDate = (String) objMap.get("eventDate"); // 日期
		String content = (String) objMap.get("content"); // 内容
		String department = (String) objMap.get("department"); // 机构
		List<Number> userIds = (List<Number>) objMap.get("userIds");// 人的id
		List<UserDO> users = new ArrayList<UserDO>();
		if (userIds.size() > 0){
			users.addAll(userDao.internalGetByIds((String[])userIds.toArray(new String[userIds.size()])));
		}
		List<AuditorDO> tempAuditors = new ArrayList<AuditorDO>();
		List<AuditorDO> auditors = new ArrayList<AuditorDO>();
		for (UserDO user : users){
			if (getAuditorByUserId(user.getId()) == null){
				AuditorDO auditor = new AuditorDO();
				auditor.setUser(user);
				auditor.setCellTel(user.getTelephoneNumber());
				auditor.setEmail(user.getEmail());
				auditors.add(auditor);
			} else {
				tempAuditors.add(getAuditorByUserId(user.getId()));
			}
		}
		this.internalSave(auditors);
		tempAuditors.addAll(auditors);
		List<AuditorInfoDO> auditorInfos = new ArrayList<AuditorInfoDO>();
		for (AuditorDO auditor : tempAuditors) {
			AuditorInfoDO auditorInfo = new AuditorInfoDO();
			auditorInfo.setAuditor(auditor);
			auditorInfo.setType("TRAIN");
			auditorInfo.setEventDate(eventDate);
			auditorInfo.setContent(content);
			auditorInfo.setDepartment(department);
			auditorInfos.add(auditorInfo);
		}
		auditorInfoDao.internalSave(auditorInfos);
	}
	
	public List<UserDO> getAllUsersByUnit(Integer unitId, String roleName){
		List<UserDO> users = unitRoleActorDao.getUsersByUnitIdAndRoleName(unitId, roleName, null);
		return users;
	}
	
	@SuppressWarnings("unchecked")
	public List<UserDO> getUserByUserGroup(Integer userGroup, Integer system, String term){
		StringBuffer sql = null;
		List<Object> param = new ArrayList<Object>();
		List<UserDO> list = null;
		if (system != null){
			sql = new StringBuffer("select t.user from AuditorDO t left join t.system sys where t.deleted = false and t.userGroup.id = ? and sys.id = ?");
			param.add(userGroup);
			param.add(system);
			if (term != null && !"".equals(term)){
				sql.append(" and (upper(t.user.fullname) like upper(?) or upper(t.user.username) like upper(?))");
				param.add("%" + term + "%");
				param.add("%" + term + "%");
			}
			list = this.getHibernateTemplate().find(sql.toString(), param.toArray());
		} else {
			sql = new StringBuffer("select distinct t.user from AuditorDO t where t.deleted = false and t.userGroup.id = ?");
			param.add(userGroup);
			if (term != null && !"".equals(term)){
				sql.append(" and (upper(t.user.fullname) like upper(?) or upper(t.user.username) like upper(?))");
				param.add("%" + term + "%");
				param.add("%" + term + "%");
			}
			list = this.getHibernateTemplate().find(sql.toString(), param.toArray());
		}
		return list;
	}
	
	@SuppressWarnings("unchecked")
	public List<UserDO> getUserByUserGroup(Integer userGroup){
		StringBuffer sql = new StringBuffer("select t.user from AuditorDO t where t.deleted = false and t.userGroup.id = ?");
		List<UserDO> list = this.getHibernateTemplate().find(sql.toString(), userGroup);
		return list;
	}
	
	/**
	 * 通过专业查询一级审计员
	 * @param userIds
	 * @param profession
	 * @return
	 */
	public List<UserDO> getUserByProfession(List<Integer> userIds, Integer profession){
		if (userIds.size() == 0){
			return new ArrayList<UserDO>();
		}
		String sql = "select distinct t.user from AuditorDO t left join t.system sys where t.deleted = false and sys.id = ? and t.user.id in ( " +StringUtils.join(userIds, ",")+ " )";
		@SuppressWarnings("unchecked")
		List<UserDO> list = this.getHibernateTemplate().find(sql.toString(), profession);
		return list;
	}
	
	/**
	 * 通过专业查询二级审计员
	 * @param userIds
	 * @param profession
	 * @return
	 */
	public List<UserDO> getUserByProfession2(List<Integer> userIds, Integer profession){
		if (userIds.size() == 0){
			return new ArrayList<UserDO>();
		}
		String sql = "select distinct t.user from AuditorDO t left join t.system2 sys where t.deleted = false and sys.id = ? and t.user.id in ( " +StringUtils.join(userIds, ",")+ " )";
		@SuppressWarnings("unchecked")
		List<UserDO> list = this.getHibernateTemplate().find(sql.toString(), profession);
		return list;
	}
	
	/**
	 * 通过专业查询三级审计员
	 * @param userIds
	 * @param profession
	 * @return
	 */
	public List<UserDO> getUserByProfession3(List<Integer> userIds, Integer profession){
		if (userIds.size() == 0){
			return new ArrayList<UserDO>();
		}
		String sql = "select distinct t.user from AuditorDO t left join t.system3 sys where t.deleted = false and sys.id = ? and t.user.id in ( " +StringUtils.join(userIds, ",")+ " )";
		@SuppressWarnings("unchecked")
		List<UserDO> list = this.getHibernateTemplate().find(sql.toString(), profession);
		return list;
	}
	
	
	
	@SuppressWarnings("unchecked")
	public AuditorDO getAuditorByUserId(Integer id) {
		String sql = "from AuditorDO a where a.deleted = false and a.user.id = ?";
		List<AuditorDO> list = this.getHibernateTemplate().find(sql, id);
		if (list.size() > 0) {
			return list.get(0);
		} else {
			return null;
		}
	}
	
	/**
	 * 获取某些用户的电话号码
	 * @param ids
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public Collection<String> getCellTelByUserIds(Collection<Integer> ids) {
		if (null == ids || ids.isEmpty()) {
			return new ArrayList<String>();
		}
		String hql = "select distinct t.cellTel from AuditorDO t where t.deleted = false and t.cellTel is not null and t.user.id in (" + StringUtils.join(ids, ",") + ")";
		return (Collection<String>) this.query(hql);
	}
	
	/**
	 * 获取某些用户的电话号码
	 * @param ids
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public Collection<String> getCellTelByUsers(Collection<UserDO> users) {
		if (null == users || users.isEmpty()) {
			return new ArrayList<String>();
		}
		String hql = "select distinct t.cellTel from AuditorDO t where t.deleted = false and t.cellTel is not null and t.user in (:users)";
		return (Collection<String>) this.query(hql, new String[]{"users"}, new Object[]{users});
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
		return (List<DictionaryDO>) this.query("select distinct t.system from AuditorDO t where t.deleted = false and t.user.id = ?", userId);
	}
	
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}

	/******
	 * 1、如果他自己是审计员，他就不可以编辑自己的关于审计的信息
	 * 2、如果是一级审计主管进来，可以编辑所有审计员的
	 * 3、若是二级审计主管，他可以编辑二级及以下的信息
	 * @param auditorId
	 * @return
	 */
	public boolean hasEditBaseInfo(Integer auditorId){
		if (auditorId == null){
			return false;
		}
		AuditorDO auditor = this.internalGetById(auditorId);
		if (auditor == null) return false;
		UserDO currentUser = UserContext.getUser();//登录人
		UserDO user = auditor.getUser();//要修改信息的人
		String erjishenjiyuan = dictionaryDao.getByTypeAndKey("审计角色", "A2") == null ? null : dictionaryDao.getByTypeAndKey("审计角色", "A2").getName();
		String sanjishenjiyuan = dictionaryDao.getByTypeAndKey("审计角色", "A3") == null ? null : dictionaryDao.getByTypeAndKey("审计角色", "A3").getName();
		String sijishenjiyuan = dictionaryDao.getByTypeAndKey("审计角色", "A4") == null ? null : dictionaryDao.getByTypeAndKey("审计角色", "A4").getName();
		String erjishenjizhuguan = dictionaryDao.getByTypeAndKey("审计角色", "A2.2") == null ? null : dictionaryDao.getByTypeAndKey("审计角色", "A2.2").getName();
		//如果他自己查看自己信息，他不是审计员也不是审计主管，就可以
		if(currentUser.equals(user)){ 
			if (!professionUserDao.getYiJiShenJiZhuGuan().contains(currentUser) && !unitRoleActorDao.isRole(currentUser.getId(),erjishenjizhuguan)){
				if (!boolYiShenJiYuan(user) && !unitRoleActorDao.isRole(user.getId(), erjishenjiyuan) && !unitRoleActorDao.isRole(user.getId(), sanjishenjiyuan) && !unitRoleActorDao.isRole(user.getId(), sijishenjiyuan)){
					return true;
				}
			}
		}
		if (professionUserDao.getYiJiShenJiZhuGuan().contains(currentUser)){//currentUser是一级审计主管
			if (boolYiShenJiYuan(user)){ //一级审计主管只能维护一级审计员的
				return true;
			}
/*			if (boolYiShenJiYuan(user) || unitRoleActorDao.isRole(user.getId(), erjishenjiyuan) || unitRoleActorDao.isRole(user.getId(), sanjishenjiyuan) || unitRoleActorDao.isRole(user.getId(), sijishenjiyuan)){
				return true;
			}
*/		} else if (unitRoleActorDao.isRole(currentUser.getId(),erjishenjizhuguan)){//currentUser是二级审计主管
			//if (!boolYiShenJiYuan(user)){ //二级审计主管不能维护一级审计员的  
				// 2016-02-25 改为是一级审计员，二级审计主管也可维护
			List<UnitRoleActorDO> unitRoleActors = unitRoleActorDao.getByUser(currentUser.getId());
			for (UnitRoleActorDO u : unitRoleActors){
				if (boolRoleAndUserAndUnit(erjishenjiyuan, user, u.getUnit()) || boolRoleAndUserAndUnit(sanjishenjiyuan, user, u.getUnit()) || boolRoleAndUserAndUnit(sijishenjiyuan, user, u.getUnit())){
					return true;
				}
			}
			//}
		}
		return false;
	}
	/**
	 * 一级审计员组
	 * @param user
	 * @return
	 */
	public boolean boolYiShenJiYuan(UserDO user){
		String yijishenjiyuan = dictionaryDao.getByTypeAndKey("审计角色", "A1") == null ? null : dictionaryDao.getByTypeAndKey("审计角色", "A1").getName();
		if (yijishenjiyuan == null) return false;
		UserGroupDO yijigroup = this.getUserGroupByName(yijishenjiyuan);
		if (yijigroup == null) return false;
		if (yijigroup.getUsers() == null) return false;
		if (yijigroup.getUsers().contains(user)) return true;
		return false;
	}
	/**
	 * 判断user是否为该role
	 * @param roleName
	 * @param user
	 * @return
	 */
	public boolean boolRoleAndUserAndUnit(String roleName, UserDO user, UnitDO unit){
		if (roleName == null) return false;
		RoleDO role = this.getRole(roleName);
		if (role == null)  return false;
		List<UnitRoleActorDO> unitRoleActors = unitRoleActorDao.getByRoleId(role.getId());
		for (UnitRoleActorDO u : unitRoleActors){
			if ("USER".equals(u.getType()) && u.getParameter().equals(user.getId().toString()) && u.getUnit().equals(unit)){
				return true;
			}
		}
		return false;
	}
	
	
	/**
	 * 根据role的名称返回role对象
	 * @param name
	 * @return
	 */
	public RoleDO getRole(String name){
		@SuppressWarnings("unchecked")
		List<RoleDO> role = this.getHibernateTemplate().find("from RoleDO where deleted = false and name = ?",name);
		if (role.size() > 0){
			return role.get(0);
		}
		return null;
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

	public void setUserGroupDao(UserGroupDao userGroupDao) {
		this.userGroupDao = userGroupDao;
	}

	public void setAuditorInfoDao(AuditorInfoDao auditorInfoDao) {
		this.auditorInfoDao = auditorInfoDao;
	}

	public void setRoleDao(RoleDao roleDao) {
		this.roleDao = roleDao;
	}

	public void setProfessionUserDao(ProfessionUserDao professionUserDao) {
		this.professionUserDao = professionUserDao;
	}

	public void setFileDao(FileDao fileDao) {
		this.fileDao = fileDao;
	}

	
}
