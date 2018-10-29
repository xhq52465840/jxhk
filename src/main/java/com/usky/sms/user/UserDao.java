
package com.usky.sms.user;

import java.lang.reflect.Field;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang.StringUtils;
import org.hibernate.HibernateException;
import org.hibernate.Session;
import org.quartz.Scheduler;
import org.quartz.Trigger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.HibernateCallback;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.comm.Utility;
import com.usky.sms.audit.base.ItemDO;
import com.usky.sms.avatar.AvatarDO;
import com.usky.sms.common.DataFormat;
import com.usky.sms.common.DateHelper;
import com.usky.sms.config.Config;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.external.UserDubboService;
import com.usky.sms.job.CronSynchronizeUserJob;
import com.usky.sms.job.FiredSuccessTriggerDO;
import com.usky.sms.job.FiredSuccessTriggerDao;
import com.usky.sms.job.JobUtils;
import com.usky.sms.organization.OrganizationDao;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.unit.UnitRoleActorDao;

public class UserDao extends BaseDao<UserDO> {
	
	/** 默认生同步用户的时间(每天24点) */
	private static final String CRON_EXPRESSION_FOR_SYNCHRONIZE_USER = "0 0 0 * * ?";
	
	
	private Config config;
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	
	@Autowired
	private UserDubboService userDubboService;
	
	@Autowired
	private FiredSuccessTriggerDao firedSuccessTriggerDao;
	
	@Autowired
	private UnitRoleActorDao unitRoleActorDao;
	
	@Autowired
	private OrganizationDao organizationDao;
	
	@Autowired
	private UserGroupDao userGroupDao;
	
	
	

	public UserDao() {
		super(UserDO.class);
		this.config = Config.getInstance();
	}
	
	@Override
	protected String[] getSearchFields() {
		return new String[] { "username", "fullname" };
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		if(map.containsKey("password")){
			String password = map.get("password")+"";
			String basePwd = Utility.pwdEncode(password.getBytes());
			map.put("password", basePwd);
		}
		return true;
	}
	
	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		if(map.containsKey("password")){
			String password = map.get("password").toString();
			String basePwd = Utility.pwdEncode(password.getBytes());
			map.put("password", basePwd);
		}
	}

	@Override
	protected void beforeUpdate(UserDO obj) {
		obj.setLastUpdate();
	}

	@Override
	protected String getBaseHql(Map<String, Object> map) {
		if (map != null) {
			@SuppressWarnings("unchecked")
			List<List<Map<String, Object>>> ruleList = (List<List<Map<String, Object>>>) map.get("rule");
			for (List<Map<String, Object>> list : ruleList) {
				for (Map<String, Object> paramMap : list) {
					if ("userGroup".equals(paramMap.get("key"))) return "select distinct t from " + clazz.getSimpleName() + " t left join t.userGroups g where t.deleted = false and (";
				}
			}
		}
		return super.getBaseHql(map);
	}
	
	@Override
	protected String getQueryParamName(String key) {
		if ("userGroup".equals(key)) return "g.id";
		return super.getQueryParamName(key);
	}
	
	@Override
	protected Object getQueryParamValue(String key, Object value) {
		if ("userGroup".equals(key)) return ((Number) value).intValue();
		return super.getQueryParamValue(key, value);
	}
	
	@Override
	protected void afterGetById(Map<String, Object> map) {
		map.put("editable", map.get("id").equals(UserContext.getUserId()) || permissionSetDao.hasPermission(PermissionSets.ADMIN.getName()));
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		UserDO user = (UserDO) obj;
		if ("lastLogin".equals(field.getName())) {
			Date date = user.getLastLogin();
			map.put(field.getName(), date == null ? null : DateHelper.formatIsoSecond(date));
			return;
		} else if ("avatar".equals(field.getName())) {
			AvatarDO avatar = user.getAvatar();
			if (avatar == null) {
				map.put("avatarUrl", config.getUserAvatarWebPath() + "/" + config.getUnknownUserAvatar());
			} else {
				map.put("avatar", avatar.getId());
				map.put("avatarUrl", config.getUserAvatarWebPath() + "/" + avatar.getFileName());
			}
			return;
		} else if ("password".equals(field.getName())) {
			return;
		}
		super.setField(map, obj, claz, multiple, field);
	}
	
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple, boolean showExtendFields) {
		UserDO user = (UserDO) obj;
		map.put("displayName", user.getDisplayName());
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void login(UserDO user) {
		user = this.internalGetById(user.getId());
		user.setLastLogin(new Date());
		user.setLoginCount(user.getLoginCount() == null ? 1 : (user.getLoginCount() + 1));
		this.internalUpdate(user);
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void login(UserDO user, String password) throws Exception {
		user = this.internalGetById(user.getId());
		if (!user.getPassword().equals(password)) throw SMSException.WRONG_PASSWORD;
		user.setLastLogin(new Date());
		user.setLoginCount(user.getLoginCount() == null ? 1 : (user.getLoginCount() + 1));
		this.internalUpdate(user);
	}
	
	public UserDO getByUsername(String username) {
		@SuppressWarnings("unchecked")
		List<UserDO> list = this.getHibernateTemplate().find("from UserDO where deleted = false and onTheJob = true and username = ?", username);
		if (list.size() == 0) return null;
		return list.get(0);
	}
	
	/**
	 * 根据pkPsnbasdoc获取用户
	 * @param pkPsnbasdoc
	 * @return
	 */
	public UserDO getByPkPsnbasdoc(String pkPsnbasdoc) {
		@SuppressWarnings("unchecked")
		List<UserDO> list = this.getHibernateTemplate().find("from UserDO where pkPsnbasdoc = ?", pkPsnbasdoc);
		if (list.size() == 0) return null;
		return list.get(0);
	}
	
	public List<Map<String, Object>> getYxwUser(final String username,final String fullname,final String orgId){		
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> list = (List<Map<String, Object>>) this.getHibernateTemplate().execute(new HibernateCallback<Object>() {
			@Override
			public Object doInHibernate(Session session) throws HibernateException, SQLException {	
				DataFormat dataFormat = new DataFormat();	
				String sql ="";
				if(orgId == null || "".equals(orgId)){
					sql = "select * from (select distinct yu.id as username ,yu.userfullname,yu.useremail,yu.usersex,yu.usersequence,yu.userofficephone,yu.usercard, "+
						 "yu.usermobilephone,yu.useroffice,yu.userhomepost,yu.userhomephone,yu.userhomeaddress,yu.userduty,'mos' as type "+
						 "from yxw_tb_user yu "+ 
						 "where yu.state=0 and not exists(select * from t_user u where yu.id = u.username and u.deleted=0 ) "+
						 "and (yu.id like '%"+username+"%' "+
						 "or yu.userfullname like '%"+fullname+"%'))  where rownum BETWEEN 0 AND 100 "; 
				}else{
					sql = "select * from (select distinct yu.id as username ,yu.userfullname,yu.useremail,yu.usersex,yu.usersequence,yu.userofficephone,yu.usercard, "+
							 "yu.usermobilephone,yu.useroffice,yu.userhomepost,yu.userhomephone,yu.userhomeaddress,yu.userduty,'mos' as type "+
							 "from yxw_tb_user yu "+ 
							 "where yu.state=0 and not exists "+
							 "(select * from (select u.username,u.fullname from t_user u, T_USER_ORGANIZATION uo where u.id = uo.user_id and uo.organization_id = "+orgId+") t where t.username = yu.id) "+
							 "and (yu.id like '%"+username+"%' "+
							 "or yu.userfullname like '%"+fullname+"%'))  where rownum BETWEEN 0 AND 100 "; 
				}
				Object[] obj = null;
				@SuppressWarnings("deprecation")
				List<Map<String, Object>> list = dataFormat.executeQueryNoConn(sql,session.connection(),obj);
				return list;
			}
		});	
		return list;
	}
	
	public UserDO saveYxwUser(Map<String,Object> yxwUser){
		String username = yxwUser.get("USERNAME")+"";
		String fullname = yxwUser.get("USERFULLNAME")+"";
		String email = yxwUser.get("USEREMAIL")+"";
		String type = yxwUser.get("TYPE")+"";
		UserDO user = this.getByUsername(username);
		if(user!=null){
			user.setDeleted(false);
			user.setEmail(email);
			user.setFullname(fullname);
			user.setLastUpdate(new Date());
			this.internalUndelete(user);
			return user;
		}else{
			user = new UserDO();
			//user.setAutoWatch(null);
			//user.setAvatar(null);
			//user.setColumns(null);
			//user.setDefaultAccess(null);
			user.setEmail(email);
			//user.setEmailFormat(null);
			//user.setEmailUser(null);
			user.setFullname(fullname);
			//user.setLastLogin(null);
			//user.setLoginCount(null);
			//user.setPageDisplayNum(null);
			user.setPassword("YWJjLTEyMw==");
			user.setStatus("正常");
			user.setType(type);
			//user.setUserGroups(null);
			user.setUsername(username);
			user.setCreated(new Date());
			user.setLastUpdate(new Date());
			user.setDeleted(false);
			Integer userId = (Integer) this.internalSave(user);
			user.setId(userId);
			return user;
		}
	}
	
	public List<UserDO> getAllUserById(List<Integer> ids) {
		StringBuilder hql = new StringBuilder("from ").append(clazz.getSimpleName()).append(" where id in (:ids)");
		@SuppressWarnings("unchecked")
		List<UserDO> list = getHibernateTemplate().findByNamedParam(hql.toString(), "ids", ids);
		return list;
	}
	
	public Collection<String> getUsernamesByIds(Collection<Integer> ids) {
		if (null != ids && !ids.isEmpty()) {
			StringBuilder hql = new StringBuilder("select username from ").append(clazz.getSimpleName()).append(" where id in (:ids)");
			@SuppressWarnings("unchecked")
			Collection<String> list = getHibernateTemplate().findByNamedParam(hql.toString(), "ids", ids);
			return list;
		}
		return new ArrayList<String>();
	}
	
	public List<UserDO> getByUsernames(List<String> usernames) {
		if (null != usernames && !usernames.isEmpty()) {
			StringBuilder hql = new StringBuilder("from UserDO where username in (:usernames)");
			@SuppressWarnings("unchecked")
			List<UserDO> list= getHibernateTemplate().findByNamedParam(hql.toString(), "usernames", usernames);
			return list;
		}
		return new ArrayList<UserDO>();
	}
	
	public List<UserDO> getByPkPsnbasdocs(List<String> pkPsnbasdocs) {
		if (null != pkPsnbasdocs && !pkPsnbasdocs.isEmpty()) {
			StringBuilder hql = new StringBuilder("from UserDO where pkPsnbasdoc in (:pkPsnbasdocs)");
			@SuppressWarnings("unchecked")
			List<UserDO> list= getHibernateTemplate().findByNamedParam(hql.toString(), "pkPsnbasdocs", pkPsnbasdocs);
			return list;
		}
		return new ArrayList<UserDO>();
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void synchronizeUser(Trigger trigger) {
		Date date = firedSuccessTriggerDao.getLatestFireDate(trigger.getName(), trigger.getGroup(), trigger.getJobName(), trigger.getJobGroup());
		if (date == null) {
			date = new Date(0);
		}
		FiredSuccessTriggerDO firedSuccessTriggerDO = new FiredSuccessTriggerDO();
		firedSuccessTriggerDO.setTriggerName(trigger.getName());
		firedSuccessTriggerDO.setTriggerGroup(trigger.getGroup());
		firedSuccessTriggerDO.setJobName(trigger.getJobName());
		firedSuccessTriggerDO.setJobGroup(trigger.getJobGroup());
		firedSuccessTriggerDO.setFiredTime(new Date());
		firedSuccessTriggerDao.internalSave(firedSuccessTriggerDO);
		this.synchronizeUser(date);
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void synchronizeUser(Date date) {
		List<UserDO> users = userDubboService.getSmsUser(date);
		List<UserDO> savedUsers = null;
		if (users.size() >= 1000) {
			savedUsers = this.getAllList();
		} else {
			List<String> pkPsnbasdocs = new ArrayList<String>();
			for (UserDO user : users) {
				pkPsnbasdocs.add(user.getPkPsnbasdoc());
			}
			savedUsers = this.getByPkPsnbasdocs(pkPsnbasdocs);
		}
		Map<String, UserDO> map = new HashMap<String, UserDO>();
		for (UserDO user : savedUsers) {
			map.put(user.getPkPsnbasdoc(), user);
		}
		for (UserDO user : users) {
			if (map.containsKey(user.getPkPsnbasdoc())) {
				// 更新
				UserDO savedUser = map.get(user.getPkPsnbasdoc());
				savedUser.setEmail(user.getEmail());
				savedUser.setDeleted(user.isDeleted());
				savedUser.setFullname(user.getFullname());
				savedUser.setOaDeptName(user.getOaDeptName());
				savedUser.setPkPsnbasdoc(user.getPkPsnbasdoc());
				savedUser.setTelephoneNumber(user.getTelephoneNumber());
				savedUser.setSex(user.getSex());
				savedUser.setUsername(user.getUsername());
				savedUser.setJobName(user.getJobName());
				savedUser.setEducation(user.getEducation());
				savedUser.setBirthDate(user.getBirthDate());
				savedUser.setSchool(user.getSchool());
				savedUser.setOnTheJob(user.isOnTheJob());
				
				this.update(savedUser);
			} else {
				// 保存
				this.internalSave(user);
				map.put(user.getPkPsnbasdoc(), user);
			}
		}
	}
	
	public void synchronizeUserScheduler(Scheduler scheduler){
		String expression = config.getCronExpForSynchronizeUser();
		if (StringUtils.isNotBlank(expression)) {
			JobUtils.createCron(scheduler, "synchronizeUser", "user", CronSynchronizeUserJob.class, CRON_EXPRESSION_FOR_SYNCHRONIZE_USER, expression);
		}
	}
	
	/**
	 * 将给定安监机构下的所有用户返回, 按名称排序
	 * 
	 * 可按用户名模糊搜索
	 * @param unitId
	 * @param excludeOrgUsers 是否不包含与给定安监机构相关的组织下的所有用户
	 * @param term
	 */
	public List<UserDO> getByUnit(List<Integer> unitIds, boolean excludeOrgUsers, String term) {
		if (unitIds == null || unitIds.isEmpty()) {
			return new ArrayList<UserDO>();
		}
		Set<UserDO> users = new HashSet<UserDO>();
		List<UserDO> unitUsers = unitRoleActorDao.getUsersByUnitIds(unitIds);
		users.addAll(unitUsers);
		if (!excludeOrgUsers) {
			List<UserDO> orgUsers = organizationDao.getOrgUserByUnits(unitIds);
			users.addAll(orgUsers);
		}
		users.remove(null);
		if (StringUtils.isNotBlank(term)) {
			Iterator<UserDO> it = users.iterator();
			while (it.hasNext()) {
				UserDO user = it.next();
				if (!StringUtils.containsIgnoreCase(user.getUsername(), term) && (user.getFullname() == null || !StringUtils.containsIgnoreCase(user.getFullname(), term))) {
					it.remove();
				}
			}
		}
		List<UserDO> result = new ArrayList<UserDO>();
		result.addAll(users);
		Collections.sort(result, new Comparator<UserDO>() {

			@Override
			public int compare(UserDO o1, UserDO o2) {
				return o1.getUsername().compareTo(o2.getUsername());
			}
		});
		return result;
	}
	/**
	 * 根据当前用户角色和当前用户部门 获取部门下的用户信息或者检查员组下的用户
	 * @param checkGrade
	 * @param request
	 * @return
	 */
	public List<UserDO> getUsersByRoleIdAndUnitId(String checkGrade,HttpServletRequest request,String term,List<Integer> unitId,String roleName){
	/*	HttpSession session=request.getSession();
		UserDO userDo=(UserDO) session.getAttribute("user");
		String oadeptname=userDo.getOaDeptName();
		String oadept=oadeptname.split("/")[2];
		Integer id=userDo.getId();*/
//		StringBuffer hql=new StringBuffer();
			//hql.append("");
			//hql.append(" left join ta.RoleDO tr");
			//hql.append(" on ta.role.id=tr.id");
			//hql.append(" left join ta.UserDO tu");
			//hql.append(" on ta.parameter=tu.id");
		
		if("SYS".equals(checkGrade)) {
			String str="AC1一级检查员组";
			List<UserDO> list =userGroupDao.getUsersByGroupName(str);
			
			list.remove(null);
			if (StringUtils.isNotBlank(term)) {
				Iterator<UserDO> it = list.iterator();
				while (it.hasNext()) {
					UserDO user = it.next();
					if (!StringUtils.containsIgnoreCase(user.getUsername(), term) && (user.getFullname() == null || !StringUtils.containsIgnoreCase(user.getFullname(), term))) {
						it.remove();
					}
				}
			}
			List<UserDO> result = new ArrayList<UserDO>();
			result.addAll(list);
			Collections.sort(result, new Comparator<UserDO>() {

				@Override
				public int compare(UserDO o1, UserDO o2) {
					return o1.getUsername().compareTo(o2.getUsername());
				}
			});
			return result;
		}
		else {
			List<UserDO> list1=unitRoleActorDao.getUsersByUnitIdsAndRoleName(unitId,roleName,null);
			//Integer id=this.getUserIdByOadept(oadept);
//			hql.append("select distinct tu from UnitRoleActorDO ta,RoleDO tr,UserDO tu");
//			hql.append(" where ta.deleted = false and ta.role.id=tr.id");
//			hql.append(" and ta.parameter = '"+id+"'");
//			hql.append(" and tr.name like '%二级检查员%'");
//			hql.append(" and tu.oaDeptName like '%"+oadept+"%'");
//			@SuppressWarnings("unchecked")
//			List<UserDO> list1 = this.getHibernateTemplate().find(hql.toString());
			
			list1.remove(null);
			if (StringUtils.isNotBlank(term)) {
				Iterator<UserDO> it = list1.iterator();
				while (it.hasNext()) {
					UserDO user = it.next();
					if (!StringUtils.containsIgnoreCase(user.getUsername(), term) && (user.getFullname() == null || !StringUtils.containsIgnoreCase(user.getFullname(), term))) {
						it.remove();
					}
				}
			}
			List<UserDO> result = new ArrayList<UserDO>();
			result.addAll(list1);
			Collections.sort(result, new Comparator<UserDO>() {

				@Override
				public int compare(UserDO o1, UserDO o2) {
					return o1.getUsername().compareTo(o2.getUsername());
				}
			});
			return result;
		}
		
		//getHibernateTemplate().findByNamedParam(hql.toString(), "oadept", oadept);

	
	}
	
	/**
	 * 根据所给的用户的id获取用户的全名
	 * @param ids 用户的id的list
	 * @return 如果ids为null或为empty则返回null
	 */
	public List<String> getFullnameByIds(List<Integer> ids) {
		if (ids == null || ids.isEmpty()) {
			return null;
		}
		@SuppressWarnings("unchecked")
		List<String> fullnames = this.getHibernateTemplate().findByNamedParam("select t.fullname from UserDO t where t.deleted = false and t.id in (:ids)", "ids", ids);
		return fullnames;
	}
	/**
	 * 根据所给的用户的部门获取用户id
	 * @param ids
	 * @return
	 */
/*	public Integer getUserIdByOadept(String oadept) {
		if (oadept == null || oadept.isEmpty()) {
			return null;
		}
		@SuppressWarnings("unchecked")
		List<Integer> ids = this.getHibernateTemplate().find("select t.id from UserDO t where t.deleted = false and t.oaDeptName like '%"+oadept+"%'");
		return ids.isEmpty() ? null : ids.get(0);
	}*/
	
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}
	
	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}

	public void setFiredSuccessTriggerDao(FiredSuccessTriggerDao firedSuccessTriggerDao) {
		this.firedSuccessTriggerDao = firedSuccessTriggerDao;
	}

	public void setUserDubboService(UserDubboService userDubboService) {
		this.userDubboService = userDubboService;
	}

	public void setUnitRoleActorDao(UnitRoleActorDao unitRoleActorDao) {
		this.unitRoleActorDao = unitRoleActorDao;
	}

	public void setOrganizationDao(OrganizationDao organizationDao) {
		this.organizationDao = organizationDao;
	}
	

	public UserGroupDao getUserGroupDao() {
		return userGroupDao;
	}

	public void setUserGroupDao(UserGroupDao userGroupDao) {
		this.userGroupDao = userGroupDao;
	}
	
}
