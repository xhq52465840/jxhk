
package com.usky.sms.unit;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.common.StringHelper;
import com.usky.sms.core.BaseDao;
import com.usky.sms.organization.OrganizationDao;
import com.usky.sms.role.RoleDO;
import com.usky.sms.role.RoleDao;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserGroupDO;
import com.usky.sms.user.UserGroupDao;

public class UnitRoleActorDao extends BaseDao<UnitRoleActorDO> {
	
	@Autowired
	private RoleDao roleDao;
	
	@Autowired
	private UserGroupDao userGroupDao;
	
	@Autowired
	private OrganizationDao organizationDao;
	
	public UnitRoleActorDao() {
		super(UnitRoleActorDO.class);
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		UnitRoleActorDO actor = (UnitRoleActorDO) obj;
		if ("role".equals(fieldName)) {
			map.put(fieldName, roleDao.convert(actor.getRole(), Arrays.asList("id", "name")));
			return;
		}
		super.setField(map, obj, claz, multiple, field);
	}
	
	public List<UnitRoleActorDO> getByUnitId(Integer unitId) {
		@SuppressWarnings("unchecked")
		List<UnitRoleActorDO> list = this.getHibernateTemplate().find("from UnitRoleActorDO where unit.id = ?", unitId);
		return list;
	}
	
	public List<UnitRoleActorDO> getByUnitAndRole(int unitId, int roleId) {
		@SuppressWarnings("unchecked")
		List<UnitRoleActorDO> list = this.getHibernateTemplate().find("from UnitRoleActorDO where unit.id = ? and role.id = ?", unitId, roleId);
		return list;
	}
	
	public List<UnitRoleActorDO> getByRoleId(int roleId) {
		@SuppressWarnings("unchecked")
		List<UnitRoleActorDO> list = this.getHibernateTemplate().find("from UnitRoleActorDO where role.id = ?", roleId);
		return list;
	}
	
	public List<UnitDO> getByRoleAndUser(int roleId, String userId){
		@SuppressWarnings("unchecked")
		List<UnitRoleActorDO> list = this.getHibernateTemplate().find("from UnitRoleActorDO where type = 'USER' and role.id = ? and parameter = ?", roleId, userId);
		Set<UnitDO> units = new HashSet<UnitDO>();
		for (UnitRoleActorDO u : list){
			units.add(u.getUnit());
		}
		return new ArrayList<UnitDO>(units);
	}
	
	/**
	 * 查询某个用户拥有某些任一角色所在的安监机构
	 * @param userId 用户
	 * @param roleNames 角色名称的集合
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<Integer> getUnitIdsByRoleNamesAndUser(Integer userId, String... roleNames){
		if (null == roleNames || roleNames.length == 0) {
			return new ArrayList<Integer>();
		}
		StringBuffer hql = new StringBuffer();
		hql.append("select distinct a.unit.id from UnitRoleActorDO a, UserGroupDO g inner join g.users gu, UserDO u where a.deleted = false");
		List<String> params = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		hql.append(" and a.role.name in (:roleNames)");
		params.add("roleNames");
		values.add(roleNames);
		hql.append(" and ((a.type = 'USER' and a.parameter = u.id) or (a.type = 'USER_GROUP' and a.parameter = g.id and gu.id = u.id))");
		hql.append(" and u.id = :userId");
		params.add("userId");
		values.add(userId);
		return this.getHibernateTemplate().findByNamedParam(hql.toString(), params.toArray(new String[0]), values.toArray());
	}
	
	/**
	 * 查询某个用户拥有某些任一角色所在的组织
	 * @param userId 用户
	 * @param roleNames 角色名称的集合
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<Integer> getOrgIdsByRoleNamesAndUser(Integer userId, String... roleNames){
		if (null == roleNames || roleNames.length == 0) {
			return new ArrayList<Integer>();
		}
		StringBuffer hql = new StringBuffer();
		hql.append("select distinct o.id from OrganizationDO o left join o.users ou where o.unit.id in (");
		hql.append("select distinct a.unit.id from UnitRoleActorDO a, UserGroupDO g inner join g.users gu, UserDO u where a.deleted = false");
		hql.append(" and a.role.name in (:roleNames)");
		hql.append(" and ((a.type = 'USER' and a.parameter = u.id) or (a.type = 'USER_GROUP' and a.parameter = g.id and gu.id = u.id))");
		hql.append(" and u.id = :userId");
		hql.append(")");
		hql.append(" and o.deleted = false and ou.id = :userId");
		List<String> params = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		params.add("roleNames");
		values.add(roleNames);
		params.add("userId");
		values.add(userId);
		params.add("userId");
		values.add(userId);
		return this.getHibernateTemplate().findByNamedParam(hql.toString(), params.toArray(new String[0]), values.toArray());
	}
	
	public List<UnitDO> getByUser(String userId){
		@SuppressWarnings("unchecked")
		List<UnitRoleActorDO> list = this.getHibernateTemplate().find("from UnitRoleActorDO where type = 'USER' and parameter = ?", userId);
		Set<UnitDO> units = new HashSet<UnitDO>();
		for (UnitRoleActorDO u : list){
			units.add(u.getUnit());
		}
		return new ArrayList<UnitDO>(units);
	}
	
	public List<UnitRoleActorDO> getByUser(Integer userId) {
		List<String> paramNames = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		List<String> groupIds = new ArrayList<String>();
		for (UserGroupDO group : userGroupDao.getUserGroupByUserId(userId)) {
			groupIds.add(group.getId().toString());
		}
		StringBuilder hql = new StringBuilder("from UnitRoleActorDO where (type = 'USER' and parameter = :userId)");
		paramNames.add("userId");
		values.add(userId.toString());
		if (groupIds.size() > 0) {
			hql.append(" or (type = 'USER_GROUP' and parameter in (:groupIds))");
			paramNames.add("groupIds");
			values.add(groupIds);
		}
		@SuppressWarnings("unchecked")
		List<UnitRoleActorDO> list = this.getHibernateTemplate().findByNamedParam(hql.toString(), paramNames.toArray(new String[0]), values.toArray());
		return list;
	}
	
	public List<UnitRoleActorDO> getByUserAndUnit(Integer userId, int unitId) {
		List<String> paramNames = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		paramNames.add("unitId");
		values.add(unitId);
		paramNames.add("userId");
		values.add(userId.toString());
		List<String> groupIds = new ArrayList<String>();
		for (UserGroupDO group : userGroupDao.getUserGroupByUserId(userId)) {
			groupIds.add(group.getId().toString());
		}
		StringBuilder hql = new StringBuilder("from UnitRoleActorDO where unit.id = :unitId and ((type = 'USER' and parameter = :userId)");
		if (!groupIds.isEmpty()) {
			hql.append(" or (type = 'USER_GROUP' and parameter in (:groupIds))");
			paramNames.add("groupIds");
			values.add(groupIds);
		}
		hql.append(")");
		@SuppressWarnings("unchecked")
		List<UnitRoleActorDO> list = this.getHibernateTemplate().findByNamedParam(hql.toString(), paramNames.toArray(new String[0]), values.toArray());
		return list;
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void setUnitRoles(int unitId, int roleId, List<Number> users, List<Number> userGroups) {
		@SuppressWarnings("unchecked")
		List<UnitRoleActorDO> actors = this.getHibernateTemplate().find("from UnitRoleActorDO where unit.id = ? and role.id = ?", unitId, roleId);
		List<UnitRoleActorDO> toAdds = new ArrayList<UnitRoleActorDO>();
		UnitDO unit = new UnitDO();
		unit.setId(unitId);
		RoleDO role = new RoleDO();
		role.setId(roleId);
		for (Number userId : users) {
			UnitRoleActorDO toAdd = null;
			for (UnitRoleActorDO actor : actors) {
				if ("USER".equals(actor.getType()) && userId.intValue() == Integer.parseInt(actor.getParameter())) {
					toAdd = actor;
					actors.remove(actor);
					break;
				}
			}
			if (toAdd == null) {
				toAdd = new UnitRoleActorDO();
				toAdd.setUnit(unit);
				toAdd.setRole(role);
				toAdd.setType("USER");
				toAdd.setParameter(Integer.toString(userId.intValue()));
				toAdds.add(toAdd);
			}
		}
		for (Number userGroupId : userGroups) {
			UnitRoleActorDO toAdd = null;
			for (UnitRoleActorDO actor : actors) {
				if ("USER_GROUP".equals(actor.getType()) && userGroupId.intValue() == Integer.parseInt(actor.getParameter())) {
					toAdd = actor;
					actors.remove(actor);
					break;
				}
			}
			if (toAdd == null) {
				toAdd = new UnitRoleActorDO();
				toAdd.setUnit(unit);
				toAdd.setRole(role);
				toAdd.setType("USER_GROUP");
				toAdd.setParameter(Integer.toString(userGroupId.intValue()));
				toAdds.add(toAdd);
			}
		}
		this.internalSave(toAdds);
		this.delete(actors);
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void setUnitRoles(int unitId, List<Number> roles, int userId) {
		@SuppressWarnings("unchecked")
		List<UnitRoleActorDO> actors = this.getHibernateTemplate().find("from UnitRoleActorDO where unit.id = ? and type = 'USER' and parameter = ?", unitId, String.valueOf(userId));
		List<UnitRoleActorDO> toAdds = new ArrayList<UnitRoleActorDO>();
		UnitDO unit = new UnitDO();
		unit.setId(unitId);
		for (Number roleId : roles) {
			UnitRoleActorDO toAdd = null;
			for (UnitRoleActorDO actor : actors) {
				if (roleId.intValue() == actor.getRole().getId()) {
					toAdd = actor;
					actors.remove(actor);
					break;
				}
			}
			if (toAdd == null) {
				toAdd = new UnitRoleActorDO();
				toAdd.setUnit(unit);
				RoleDO role = new RoleDO();
				role.setId(roleId.intValue());
				toAdd.setRole(role);
				toAdd.setType("USER");
				toAdd.setParameter(String.valueOf(userId));
				toAdds.add(toAdd);
			}
		}
		this.internalSave(toAdds);
		this.delete(actors);
	}
	
	public List<UserDO> getUsersByUnitIdAndRoleId(int unitId, int roleId) {
		@SuppressWarnings("unchecked")
		List<UserDO> users = this.getHibernateTemplate().find("select distinct u from UnitRoleActorDO a, UserGroupDO g inner join g.users gu, UserDO u where a.deleted = false and a.role.id = ? and a.unit.id = ? and ((a.type = 'USER' and a.parameter = u.id) or (a.type = 'USER_GROUP' and a.parameter = g.id and gu.id = u.id))", roleId, unitId);
		return users;
	}
	
	public List<UserDO> getUsersByUnitIdAndRoleName(int unitId, String roleName, String userName) {
		StringBuffer hql = new StringBuffer("select distinct u from UnitRoleActorDO a, UserGroupDO g inner join g.users gu, UserDO u where a.deleted = false and a.role.name = ? and a.unit.id = ? and ((a.type = 'USER' and a.parameter = u.id) or (a.type = 'USER_GROUP' and a.parameter = g.id and gu.id = u.id))");
		List<Object> values = new ArrayList<Object>();
		values.add(roleName);
		values.add(unitId);
		if (!StringUtils.isEmpty(userName)) {
			String transferredUserName = userName.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
			hql.append(" and upper(u.username) like upper(?)");
			values.add(transferredUserName);
		}
		@SuppressWarnings("unchecked")
		List<UserDO> users = this.getHibernateTemplate().find(hql.toString(), values.toArray());
		return users;
	}
	
	/**
	 * 根据安监机构的id的list和角色名称查询用户
	 * @param unitIds
	 * @param roleName
	 * @param userName
	 * @return
	 */
	public List<UserDO> getUsersByUnitIdsAndRoleName(List<Integer> unitIds, String roleName, String userName) {
		if(unitIds.isEmpty()){
			return new ArrayList<UserDO>();
		}
		StringBuffer hql = new StringBuffer("select distinct u from UnitRoleActorDO a, UserGroupDO g inner join g.users gu, UserDO u where a.deleted = false and a.role.name =:roleName and a.unit.id in (:unitIds) and ((a.type = 'USER' and a.parameter = u.id) or (a.type = 'USER_GROUP' and a.parameter = g.id and gu.id = u.id))");
		List<String> params = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		params.add("roleName");
		values.add(roleName);
		params.add("unitIds");
		values.add(unitIds);
		if (!StringUtils.isEmpty(userName)) {
			String transferredUserName = userName.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
			hql.append(" and upper(u.username) like upper(:userName)");
			params.add("userName");
			values.add(transferredUserName);
		}
		@SuppressWarnings("unchecked")
		List<UserDO> users = (List<UserDO>) this.query(hql.toString(), params.toArray(new String[0]), values.toArray());
		return users;
	}
	
	public List<UserDO> getUsersByOrgIdAndRoleName(int orgId, String roleName, String userName) {
		StringBuffer hql = new StringBuffer("select distinct u from UnitRoleActorDO a, UserGroupDO g inner join g.users gu, UserDO u, OrganizationDO org where a.deleted = false and a.role.name = ? and a.unit.id = org.unit.id and org.id = ? and ((a.type = 'USER' and a.parameter = u.id) or (a.type = 'USER_GROUP' and a.parameter = g.id and gu.id = u.id))");
		List<Object> values = new ArrayList<Object>();
		values.add(roleName);
		values.add(orgId);
		if (!StringUtils.isEmpty(userName)) {
			String transferredUserName = userName.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
			hql.append(" and u.username like ?");
			values.add(transferredUserName);
		}
		@SuppressWarnings("unchecked")
		List<UserDO> users = this.getHibernateTemplate().find(hql.toString(), values.toArray());
		return users;
	}
	
	/**
	 * 根据组织的id的list和角色名称查询用户
	 * @param unitIds
	 * @param roleName
	 * @param userName
	 * @return
	 */
	public List<UserDO> getUsersByOrgIdsAndRoleName(List<Integer> orgIds, String roleName, String userName) {
		if(orgIds.isEmpty()){
			return new ArrayList<UserDO>();
		}
		StringBuffer hql = new StringBuffer("select distinct u from UnitRoleActorDO a, UserGroupDO g inner join g.users gu, UserDO u, OrganizationDO org where a.deleted = false and a.role.name =:roleName and a.unit.id = org.unit.id and org.id in (:orgIds) and ((a.type = 'USER' and a.parameter = u.id) or (a.type = 'USER_GROUP' and a.parameter = g.id and gu.id = u.id))");
		List<String> params = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		params.add("roleName");
		values.add(roleName);
		params.add("orgIds");
		values.add(orgIds);
		if (!StringUtils.isEmpty(userName)) {
			String transferredUserName = userName.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
			hql.append(" and u.username like :userName");
			params.add("userName");
			values.add(transferredUserName);
		}
		@SuppressWarnings("unchecked")
		List<UserDO> users = (List<UserDO>) this.query(hql.toString(), params.toArray(new String[0]), values.toArray());
		return users;
	}
	
	/**
	 * 获取给定安监机构下的所有角色的用户
	 * @param unitId
	 * @return
	 */
	public List<UserDO> getUsersByUnitId(int unitId) {
		@SuppressWarnings("unchecked")
		List<UserDO> users = this.getHibernateTemplate().find("select distinct u from UnitRoleActorDO a, UserGroupDO g inner join g.users gu, UserDO u where a.deleted = false and a.unit.id = ? and ((a.type = 'USER' and a.parameter = u.id) or (a.type = 'USER_GROUP' and a.parameter = g.id and gu.id = u.id))", unitId);
		return users;
	}
	
	/**
	 * 获取给定安监机构下的所有角色的用户
	 * @param unitId
	 * @return
	 */
	public List<UserDO> getUsersByUnitIds(List<Integer> unitIds) {
		if (unitIds == null || unitIds.isEmpty()) {
			return new ArrayList<UserDO>();
		}
		List<Object> values = new ArrayList<Object>();
		values.add(unitIds);
		@SuppressWarnings("unchecked")
		List<UserDO> users = (List<UserDO>) this.query("select distinct u from UnitRoleActorDO a, UserGroupDO g inner join g.users gu, UserDO u where a.deleted = false and a.unit.id in (:unitIds) and ((a.type = 'USER' and a.parameter = u.id) or (a.type = 'USER_GROUP' and a.parameter = g.id and gu.id = u.id))", new String[]{"unitIds"}, values.toArray());
		return users;
	}
	
	/**
	 * 通过角色id和安监机构id获取用户id
	 * 
	 * @param roleId
	 * @param unitIds
	 * @return
	 */
	public Set<Integer> getUserIdsByUnitIdsAndRoleId(Integer roleId, List<Integer> unitIds) {
		Set<Integer> userIds = new HashSet<Integer>();
		List<String> params = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		
		if (null != roleId || (null != unitIds && !unitIds.isEmpty())) {
			values.add(roleId);
			values.add(unitIds);
			// select distinct u from UnitRoleActorDO a, UserGroup g inner join g.users gu, UserDO u where a.deleted = false and a.role.id = ? and a.unit.id = ? and ((a.type = 'USER' and a.parameter = u.id) or (a.type = 'USER_GROUP' and a.parameter = g.id and gu.id = u.id))
			// 通过roleId和unitIds获取userids,并加入userid的set中
			StringBuilder sql = new StringBuilder();
			sql.append("select DISTINCT t.parameter from UnitRoleActorDO t where t.deleted = false");
			if (null != roleId) {
				sql.append(" and t.role.id = (:roleId)");
				params.add("roleId");
			}
			if (unitIds.size() != 0) {
				sql.append(" and t.unit.id in (:unitIds)");
				params.add("unitIds");
			}
			
			@SuppressWarnings("unchecked")
			List<String> userIdList = (List<String>) this.query(sql.toString() + " and t.type='USER'", params.toArray(new String[] {}), values.toArray());
			userIds.addAll(StringHelper.converStringListToIntegerList(userIdList));
			
			// 通过roleId和unitIds获取groupids,并通过groupids获取userids并加入userid的set中
			@SuppressWarnings("unchecked")
			List<String> groupList = (List<String>) this.query(sql.toString() + " and t.type='USER_GROUP'", params.toArray(new String[] {}), values.toArray());
			for (String groupId : groupList) {
				userIds.addAll(userGroupDao.getUserIdsByUserGroup(Integer.parseInt(groupId)));
			}
		}
		return userIds;
	}
	
	/**
	 * 通过角色ids和安监机构ids获取用户ids
	 * 
	 * @param roleIds
	 * @param unitIds
	 * @return
	 */
	public Set<Integer> getUserIdsByUnitIdsAndRoleIds(Collection<Integer> roleIds, Collection<Integer> unitIds) {
		Set<Integer> userIds = new HashSet<Integer>();
		List<String> params = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		
		if ((null != roleIds && !roleIds.isEmpty()) || (null != unitIds && !unitIds.isEmpty())) {
			values.add(roleIds);
			values.add(unitIds);
			// 通过roleIds和unitIds获取userids,并加入userid的set中
			StringBuilder sql = new StringBuilder();
			sql.append("select DISTINCT t.parameter from UnitRoleActorDO t where t.deleted = false");
			if (null != roleIds && !roleIds.isEmpty()) {
				sql.append(" and t.role.id in (:roleIds)");
				params.add("roleIds");
			}
			if (null != unitIds && !unitIds.isEmpty()) {
				sql.append(" and t.unit.id in (:unitIds)");
				params.add("unitIds");
			}
			
			@SuppressWarnings("unchecked")
			List<String> userIdList = (List<String>) this.query(sql.toString() + " and t.type='USER'", params.toArray(new String[] {}), values.toArray());
			userIds.addAll(StringHelper.converStringListToIntegerList(userIdList));
			
			// 通过roleId和unitIds获取groupids,并通过groupids获取userids并加入userid的set中
			@SuppressWarnings("unchecked")
			List<String> groupList = (List<String>) this.query(sql.toString() + " and t.type='USER_GROUP'", params.toArray(new String[] {}), values.toArray());
			for (String groupId : groupList) {
				userIds.addAll(userGroupDao.getUserIdsByUserGroup(Integer.parseInt(groupId)));
			}
		}
		return userIds;
	}
	

	/**
	 * 通过角色id和组织id获取用户id
	 * 
	 * @param roleId
	 * @param unitIds
	 * @return
	 */
	public Set<Integer> getUserIdsByOrganizationIdsAndRoleIds(Collection<Integer> roleIds, Collection<Integer> organizationIds) {
		List<String> params = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		StringBuffer hql = new StringBuffer();
		hql.append("select distinct u.id");
		hql.append(" from OrganizationDO o left join o.users u where o.deleted = false");
		if (null != organizationIds && !organizationIds.isEmpty()) {
			hql.append(" and o.id in (:organizationIds)");
			params.add("organizationIds");
			values.add(organizationIds);
		}
		hql.append(" and u.id in (");
		hql.append(" select distinct u");
		hql.append("  from UnitRoleActorDO a, UserGroupDO g");
		hql.append("  inner join g.users gu, UserDO u");
		hql.append("  where a.deleted = false");
		if (null != roleIds && !roleIds.isEmpty()) {
			hql.append("    and a.role.id in (:roleIds)");
			params.add("roleIds");
			values.add(roleIds);
		}
		hql.append("    and (");
		hql.append("            (a.type = 'USER' and a.parameter = u.id)");
		hql.append("         or (a.type = 'USER_GROUP' and a.parameter = g.id and gu.id = u.id)");
		hql.append("        )");
		hql.append(")");
		@SuppressWarnings("unchecked")
		List<Integer> userIds =  (List<Integer>) this.query(hql.toString(), params.toArray(new String[] {}), values.toArray());
		return new HashSet<Integer>(userIds);
	}
	
	/**
	 * 通过角色id和组织id获取用户id
	 * 
	 * @param roleId 角色的ID
	 * @param organizationIds 组织的ID
	 * @param userName 模糊搜索
	 * @param recursive 是否递归组织
	 * @return
	 */
	public List<UserDO> getUsersByOrganizationIdsAndRoleIds(Collection<Integer> roleIds, Collection<Integer> organizationIds, String userName, boolean recursive) {
		List<String> params = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		StringBuffer hql = new StringBuffer();
		hql.append("select distinct u");
		hql.append(" from OrganizationDO o join o.users u where o.deleted = false");
		if (recursive && organizationIds != null) {
			organizationIds = organizationDao.getSubOrgIdsByParentsRecursive(new ArrayList<Integer>(organizationIds));
		}
		if (null != organizationIds && !organizationIds.isEmpty()) {
			hql.append(" and o.id in (:organizationIds)");
			params.add("organizationIds");
			values.add(organizationIds);
		}
		if (StringUtils.isNotBlank(userName)) {
			String transferredUserName = userName.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
			hql.append(" and (upper(u.username) like upper(:username) or upper(u.fullname) like upper(:fullname))");
			params.add("username");
			values.add("%" + transferredUserName + "%");
			params.add("fullname");
			values.add("%" + transferredUserName + "%");
		}
		hql.append(" and u.id in (");
		hql.append(" select distinct u.id");
		hql.append("  from UnitRoleActorDO a, UserGroupDO g");
		hql.append("  inner join g.users gu, UserDO u");
		hql.append("  where a.deleted = false");
		if (null != roleIds && !roleIds.isEmpty()) {
			hql.append("    and a.role.id in (:roleIds)");
			params.add("roleIds");
			values.add(roleIds);
		}
		hql.append("    and (");
		hql.append("            (a.type = 'USER' and a.parameter = u.id)");
		hql.append("         or (a.type = 'USER_GROUP' and a.parameter = g.id and gu.id = u.id)");
		hql.append("        )");
		hql.append(")");
		@SuppressWarnings("unchecked")
		List<UserDO> users =  (List<UserDO>) this.query(hql.toString(), params.toArray(new String[] {}), values.toArray());
		return users;
	}
	
	/**
	 * 判断用户是否是某个角色
	 * @param userId
	 * @param roleName
	 * @return
	 */
	public boolean isRole(Integer userId, String roleName){
		List<String> paramNames = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		List<String> groupIds = new ArrayList<String>();
		for (UserGroupDO group : userGroupDao.getUserGroupByUserId(userId)) {
			groupIds.add(group.getId().toString());
		}
		StringBuilder hql = new StringBuilder("from UnitRoleActorDO where ((type = 'USER' and parameter = :userId)");
		paramNames.add("userId");
		values.add(userId.toString());
		if (groupIds.size() > 0) {
			hql.append(" or (type = 'USER_GROUP' and parameter in (:groupIds))");
			paramNames.add("groupIds");
			values.add(groupIds);
		}

		hql.append(") and role.name = :roleName");
		paramNames.add("roleName");
		values.add(roleName);
		@SuppressWarnings("unchecked")
		List<UnitRoleActorDO> list = this.getHibernateTemplate().findByNamedParam(hql.toString(), paramNames.toArray(new String[0]), values.toArray());
		return list.isEmpty() ? false : true;
	}
	
	/**
	 * 判断用户是否是某些角色
	 * @param userId
	 * @param roleName
	 * @return
	 */
	public boolean isRoles(Integer userId, String... roleNames){
		if (null == roleNames || roleNames.length == 0) {
			return false;
		}
		List<String> paramNames = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		List<String> groupIds = new ArrayList<String>();
		for (UserGroupDO group : userGroupDao.getUserGroupByUserId(userId)) {
			groupIds.add(group.getId().toString());
		}
		StringBuilder hql = new StringBuilder("from UnitRoleActorDO where ((type = 'USER' and parameter = :userId)");
		paramNames.add("userId");
		values.add(userId.toString());
		if (groupIds.size() > 0) {
			hql.append(" or (type = 'USER_GROUP' and parameter in (:groupIds))");
			paramNames.add("groupIds");
			values.add(groupIds);
		}
		
		hql.append(") and role.name in (:roleNames)");
		paramNames.add("roleNames");
		values.add(roleNames);
		@SuppressWarnings("unchecked")
		List<UnitRoleActorDO> list = this.getHibernateTemplate().findByNamedParam(hql.toString(), paramNames.toArray(new String[0]), values.toArray());
		return list.isEmpty() ? false : true;
	}
	
	/**
	 * 获取用户所拥有的角色
	 * @param userId
	 * @return
	 */
	public List<RoleDO> getRoleByUserId(Integer userId){
		List<String> paramNames = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		List<String> groupIds = new ArrayList<String>();
		for (UserGroupDO group : userGroupDao.getUserGroupByUserId(userId)) {
			groupIds.add(group.getId().toString());
		}
		StringBuilder hql = new StringBuilder("select distinct t.role from UnitRoleActorDO t where ((t.type = 'USER' and t.parameter = :userId)");
		paramNames.add("userId");
		values.add(userId.toString());
		if (groupIds.size() > 0) {
			hql.append(" or (t.type = 'USER_GROUP' and t.parameter in (:groupIds))");
			paramNames.add("groupIds");
			values.add(groupIds);
		}

		hql.append(")");
		@SuppressWarnings("unchecked")
		List<RoleDO> list = this.getHibernateTemplate().findByNamedParam(hql.toString(), paramNames.toArray(new String[0]), values.toArray());
		return list;
	}
	
	/**
	 * 根据安监机构的id的list和角色id的list查询用户
	 * @param unitIds
	 * @param roleIds
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<UserDO> getUsersByUnitIdsAndRoleIds(Collection<Integer> unitIds, Collection<Integer> roleIds) {
		if ((null != roleIds && !roleIds.isEmpty()) || (null != unitIds && !unitIds.isEmpty())) {
			StringBuffer hql = new StringBuffer();
			hql.append("select distinct u from UnitRoleActorDO a, UserGroupDO g inner join g.users gu, UserDO u where a.deleted = false");
			List<String> params = new ArrayList<String>();
			List<Object> values = new ArrayList<Object>();
			if (null != roleIds && !roleIds.isEmpty()) {
				hql.append(" and a.role.id in (:roleIds)");
				params.add("roleIds");
				values.add(roleIds);
			}
			if (null != unitIds && !unitIds.isEmpty()) {
				hql.append(" and a.unit.id in (:unitIds)");
				params.add("unitIds");
				values.add(unitIds);
			}
			hql.append(" and ((a.type = 'USER' and a.parameter = u.id) or (a.type = 'USER_GROUP' and a.parameter = g.id and gu.id = u.id))");
			hql.append(" order by u.fullname");
			return (List<UserDO>) this.query(hql.toString(), params.toArray(new String[0]), values.toArray());
		}
		return new ArrayList<UserDO>();
	}
	
	public void setRoleDao(RoleDao roleDao) {
		this.roleDao = roleDao;
	}
	
	public void setUserGroupDao(UserGroupDao userGroupDao) {
		this.userGroupDao = userGroupDao;
	}

	public void setOrganizationDao(OrganizationDao organizationDao) {
		this.organizationDao = organizationDao;
	}
	
}
