
package com.usky.sms.user;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.permission.PermissionSchemeDO;
import com.usky.sms.permission.PermissionSchemeDao;
import com.usky.sms.permission.PermissionSchemeItemDO;
import com.usky.sms.permission.PermissionSchemeItemDao;

public class UserGroupDao extends BaseDao<UserGroupDO> {
	
	@Autowired
	private PermissionSchemeDao permissionSchemeDao;
	
	@Autowired
	private PermissionSchemeItemDao permissionSchemeItemDao;
	
	public UserGroupDao() {
		super(UserGroupDO.class);
	}
	
	@Override
	protected void afterGetList(List<Map<String, Object>> list, Map<String, Object> paramMap, Map<String, Object> searchMap, List<String> orders) {
		List<PermissionSchemeItemDO> items = permissionSchemeItemDao.getByType(UserType.USER_GROUP.name());
		Map<String, List<PermissionSchemeDO>> idSchemesMap = new HashMap<String, List<PermissionSchemeDO>>();
		for (PermissionSchemeItemDO item : items) {
			String id = item.getParameter();
			List<PermissionSchemeDO> schemes = idSchemesMap.get(id);
			if (schemes == null) {
				schemes = new ArrayList<PermissionSchemeDO>();
				idSchemesMap.put(id, schemes);
			}
			boolean contains = false;
			for (PermissionSchemeDO scheme : schemes) {
				if (item.getScheme().getId().equals(scheme.getId())) {
					contains = true;
					break;
				}
			}
			if (!contains) schemes.add(item.getScheme());
		}
		for (Object obj : list) {
			@SuppressWarnings("unchecked")
			Map<String, Object> map = (Map<String, Object>) obj;
			List<PermissionSchemeDO> schemes = idSchemesMap.get(map.get("id").toString());
			if (schemes != null) map.put("schemes", permissionSchemeDao.convert(schemes));
		}
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		// 名称唯一性校验
		if (map.containsKey("name")) {
			checkNameConstraint((String) map.get("name"), null);
		}
		return super.beforeSave(map);
	}

	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		// 名称唯一性校验
		if (map.containsKey("name")) {
			checkNameConstraint((String) map.get("name"), id);
		}
		super.beforeUpdate(id, map);
	}
	
	/**
	 *  用户组名称唯一性校验
	 * @param name
	 * @param id
	 */
	public void checkNameConstraint(String name, Integer id) {
		StringBuffer hql = new StringBuffer("select count(*) from UserGroupDO t where t.deleted = false and t.name = ?");
		List<Object> values = new ArrayList<Object>();
		values.add(name);
		if (null != id) {
			hql.append(" and id != ?");
			values.add(id);
		}
		@SuppressWarnings("unchecked")
		List<Long> count = this.getHibernateTemplate().find(hql.toString(), values.toArray());
		
		if (count.get(0) > 0) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "用户组[" + name + "]已存在!");
		}
	}
	
	public List<UserGroupDO> getUserGroupByUserId(Integer userId) {
		@SuppressWarnings("unchecked")
		List<UserGroupDO> userGroups = this.getHibernateTemplate().find("select distinct g from UserGroupDO g left join g.users u where u.id = ?", userId);
		return userGroups;
	}
	
	public List<Integer> getUserIdsByUserGroup(Integer groupId) {
		@SuppressWarnings("unchecked")
		List<Integer> userIds = this.getHibernateTemplate().find("select u.id from UserGroupDO g inner join g.users u where g.id = ?", groupId);
		return userIds;
	}
	
	/**
	 * 根据用户组id的list获取用户组下的所有用户
	 * @param groupIds
	 * @return
	 */
	public List<Integer> getUserIdsByUserGroupIds(List<Integer> groupIds) {
		if (null == groupIds || groupIds.isEmpty()) {
			return new ArrayList<Integer>();
		}
		StringBuffer hql = new StringBuffer("select distinct u.id from UserGroupDO g inner join g.users u where g.id in (:groupIds)");
		List<String> params = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		params.add("groupIds");
		values.add(groupIds);
		@SuppressWarnings("unchecked")
		List<Integer> userIds = this.getHibernateTemplate().findByNamedParam(hql.toString(), params.toArray(new String[0]), values.toArray());
		return userIds;
	}
	
	/**
	 * 通过groupId获取user的list
	 * @param groupId
	 * @return
	 */
	public List<UserDO> getUsersByGroupId(Integer groupId) {
		@SuppressWarnings("unchecked")
		List<UserDO> users = (List<UserDO>) this.query("select u from UserGroupDO g inner join g.users u where g.id = ?", groupId);
		return users;
	}
	/**
	 * 通过groupName获取user的list
	 * @param name
	 * @return
	 */
	public List<UserDO> getUsersByGroupName(String name) {
		@SuppressWarnings("unchecked")
		List<UserDO> users = (List<UserDO>) this.query("select u from UserGroupDO g inner join g.users u where g.name = ?", name);
		return users;
	}
	
	
	/**
	 * 通过groupId获取user name和id的list
	 * @param groupId
	 * @return
	 */
	public List<Map<String,Object>> getUserIdNameByGroupId(Integer groupId) {
		@SuppressWarnings("unchecked")
		List<Map<String,Object>> users = (List<Map<String,Object>>) this.query("select u.id,u.username,u.fullname from UserGroupDO g inner join g.users u where g.id = ?", groupId);
		return users;
	}
	
	/**
	 * 通过用户组名称获取用户的信息
	 * @param groupName
	 * @return
	 */
	public List<UserDO> getUserIdNameByGroupName(String groupName, String userName) {
		StringBuffer hql = new StringBuffer("select distinct u from UserGroupDO g inner join g.users u where u.deleted = false and g.name = ?");
		List<Object> values = new ArrayList<Object>();
		values.add(groupName);
		if (null != userName) {
			userName = userName.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
			userName = "%" + userName + "%";
			hql.append(" and (upper(u.username) like upper(?) or upper(u.fullname) like upper(?))");
			values.add(userName);
			values.add(userName);
		}
		@SuppressWarnings("unchecked")
		List<UserDO> users = (List<UserDO>) this.query(hql.toString(), values.toArray());
		return users;
	}

	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}
	
	/**
	 * 根据用户组的名称查询用户组下的所有用户
	 * @param userGroupName
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<UserDO> getUsersByUserGroupName(String userGroupName){
		return (List<UserDO>) this.query("select t.users from UserGroupDO t where t.deleted = 0 and t.name = ?", userGroupName);
	}

	/**
	 * 判断用户是否是某个用户组的人
	 * @param userId
	 * @param userGroupName
	 * @return
	 */
	public boolean isUserGroup(Integer userId, String userGroupName){
		List<String> paramNames = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		StringBuilder hql = new StringBuilder("from UserGroupDO t left join t.users u where u.id = :userId and t.name = :userGroupName");
		paramNames.add("userId");
		values.add(userId);
		paramNames.add("userGroupName");
		values.add(userGroupName);
		@SuppressWarnings("unchecked")
		List<UserGroupDO> list = this.getHibernateTemplate().findByNamedParam(hql.toString(), paramNames.toArray(new String[0]), values.toArray());
		return !list.isEmpty();
	}
	
	/**
	 * 判断用户是否是某些任一用户组的人
	 * @param userId
	 * @param userGroupNames
	 * @return
	 */
	public boolean isUserGroups(Integer userId, String... userGroupNames){
		if (null == userGroupNames || userGroupNames.length == 0) {
			return false;
		}
		List<String> paramNames = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		StringBuilder hql = new StringBuilder("from UserGroupDO t left join t.users u where u.id = :userId and t.name in (:userGroupNames)");
		paramNames.add("userId");
		values.add(userId);
		paramNames.add("userGroupNames");
		values.add(userGroupNames);
		@SuppressWarnings("unchecked")
		List<UserGroupDO> list = this.getHibernateTemplate().findByNamedParam(hql.toString(), paramNames.toArray(new String[0]), values.toArray());
		return !list.isEmpty();
	}
	
	public void setPermissionSchemeDao(PermissionSchemeDao permissionSchemeDao) {
		this.permissionSchemeDao = permissionSchemeDao;
	}
	
	public void setPermissionSchemeItemDao(PermissionSchemeItemDao permissionSchemeItemDao) {
		this.permissionSchemeItemDao = permissionSchemeItemDao;
	}
	
}
