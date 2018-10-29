
package com.usky.sms.permission;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.core.BaseDao;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.unit.UnitRoleActorDO;
import com.usky.sms.unit.UnitRoleActorDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserGroupDO;
import com.usky.sms.user.UserGroupDao;
import com.usky.sms.user.UserType;

public class PermissionSetDao extends BaseDao<PermissionSetDO> implements IPermission {
	
	@Autowired
	private UserGroupDao userGroupDao;
	
	@Autowired
	private UnitRoleActorDao unitRoleActorDao;
	
	@Autowired
	private UnitDao unitDao;
	
	public PermissionSetDao() {
		super(PermissionSetDO.class);
	}
	
	@Override
	public boolean hasPermission(Integer id, HttpServletRequest request) {
		return hasPermission(PermissionSets.ADMIN.getName());
	}
	
	public boolean hasPermission(String... permissions) {
		StringBuilder hql = new StringBuilder("from PermissionSetDO s left join s.userGroups g left join g.users u where s.name in (:permissions) and u.id = :userId");
		List<String> paramNames = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		paramNames.add("permissions");
		values.add(permissions);
		Integer userId = UserContext.getUserId();
		paramNames.add("userId");
		values.add(userId);
		@SuppressWarnings("unchecked")
		List<UnitDO> list = this.getHibernateTemplate().findByNamedParam(hql.toString(), paramNames.toArray(new String[0]), values.toArray());
		return list.size() > 0;
	}
	
	/**
	 * 获取具有某些全局权限的用户
	 * @param permissions
	 * @return
	 */
	public List<UserDO> getPermittedUsers(String... permissions) {
		StringBuilder hql = new StringBuilder("select distinct u from PermissionSetDO s left join s.userGroups g left join g.users u where s.name in (:permissions)");
		List<String> paramNames = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		paramNames.add("permissions");
		values.add(permissions);
		@SuppressWarnings("unchecked")
		List<UserDO> list = this.getHibernateTemplate().findByNamedParam(hql.toString(), paramNames.toArray(new String[0]), values.toArray());
		return list;
	}
	
	public boolean hasUnitPermission(int unitId, String... permissions) {
		StringBuilder hql = new StringBuilder("select c.unit from UnitDO u, UnitConfigDO c, PermissionSchemeItemDO i where c.unit = u and u.id = :unitId and c.permissionScheme = i.scheme and i.permissionSet.name in (:permissions) and ");
		List<String> paramNames = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		paramNames.add("unitId");
		values.add(unitId);
		paramNames.add("permissions");
		values.add(permissions);
		Integer userId = UserContext.getUserId();
		hql.append(this.getPermittedSql(PermissionType.UNIT, userId, paramNames, values));
		@SuppressWarnings("unchecked")
		List<UnitDO> list = this.getHibernateTemplate().findByNamedParam(hql.toString(), paramNames.toArray(new String[0]), values.toArray());
		return !list.isEmpty();
	}
	
	public boolean hasOrgPermission(int orgId, String... permissions) {
		StringBuilder hql = new StringBuilder("select c.unit from UnitDO u, UnitConfigDO c, PermissionSchemeItemDO i, OrganizationDO org join org.users orgUser where c.unit = u and u.id = org.unit.id and orgUser.id = :userId and c.permissionScheme = i.scheme and i.permissionSet.name in (:permissions) and org.id =:orgId and ");
		List<String> paramNames = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		paramNames.add("orgId");
		values.add(orgId);
		paramNames.add("permissions");
		values.add(permissions);
		Integer userId = UserContext.getUserId();
		paramNames.add("userId");
		values.add(userId);
		hql.append(this.getPermittedSql(PermissionType.UNIT, userId, paramNames, values));
		@SuppressWarnings("unchecked")
		List<UnitDO> list = this.getHibernateTemplate().findByNamedParam(hql.toString(), paramNames.toArray(new String[0]), values.toArray());
		return !list.isEmpty();
	}
	
	/**
	 * 获取具有某些机构权限的用户
	 * @param unitId
	 * @param permissions
	 * @return
	 */
	public List<UserDO> getPermittedUsers(int unitId, String... permissions) {
		if (permissions == null || permissions.length == 0) {
			return new ArrayList<UserDO>();
		}
		StringBuilder hql = new StringBuilder();
		hql.append("select distinct usr");
		hql.append("  from UserDO usr, UnitConfigDO uc");
		hql.append("  left join uc.unit u");
		hql.append("  left join uc.permissionScheme ps, PermissionSchemeItemDO psi left join psi.permissionSet p,");
		hql.append("  UnitRoleActorDO ura, UserGroupDO ug left join ug.users ugusr");
		hql.append(" where ");
		hql.append(" (");
		hql.append("  (('USER_GROUP') = psi.type and ug.id = psi.parameter and ugusr.id = usr.id)");
		hql.append("  or ('USER' = psi.type and psi.parameter = usr.id)");
		hql.append("  or ('ROLE' = psi.type and ura.role = psi.parameter");
		hql.append("       and (");
		hql.append("             ('USER_GROUP' = ura.type and ug.id = ura.parameter and ugusr.id = usr.id)");
		hql.append("          or ('USER' = ura.type and ura.parameter = usr.id)");
		hql.append("        )");
		hql.append("   )");
		hql.append(" )");
		hql.append(" and ura.unit.id = u.id");
		hql.append(" and psi.scheme.id = ps.id");
		hql.append(" and p.name in (:permissions)");
		hql.append(" and u.id = :unitId");
		
		List<String> paramNames = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		paramNames.add("unitId");
		values.add(unitId);
		paramNames.add("permissions");
		values.add(permissions);
		@SuppressWarnings("unchecked")
		List<UserDO> list = this.getHibernateTemplate().findByNamedParam(hql.toString(), paramNames.toArray(new String[0]), values.toArray());
		return list;
	}
	
	
	/**
	 * 获取具有某些机构权限的用户
	 * @param unitId
	 * @param permissions
	 * @return
	 */
	public List<UserDO> getPermittedUsers(List<Integer> unitIds, String... permissions) {
		if (unitIds == null || unitIds.isEmpty() || permissions == null || permissions.length == 0) {
			return new ArrayList<UserDO>();
		}
		StringBuilder hql = new StringBuilder();
		hql.append("select distinct usr");
		hql.append("  from UserDO usr, UnitConfigDO uc");
		hql.append("  left join uc.unit u");
		hql.append("  left join uc.permissionScheme ps, PermissionSchemeItemDO psi left join psi.permissionSet p,");
		hql.append("  UnitRoleActorDO ura, UserGroupDO ug left join ug.users ugusr");
		hql.append(" where ");
		hql.append(" (");
		hql.append("  (('USER_GROUP') = psi.type and ug.id = psi.parameter and ugusr.id = usr.id)");
		hql.append("  or ('USER' = psi.type and psi.parameter = usr.id)");
		hql.append("  or ('ROLE' = psi.type and ura.role = psi.parameter");
		hql.append("       and (");
		hql.append("             ('USER_GROUP' = ura.type and ug.id = ura.parameter and ugusr.id = usr.id)");
		hql.append("          or ('USER' = ura.type and ura.parameter = usr.id)");
		hql.append("        )");
		hql.append("   )");
		hql.append(" )");
		hql.append(" and ura.unit.id = u.id");
		hql.append(" and psi.scheme.id = ps.id");
		hql.append(" and p.name in (:permissions)");
		hql.append(" and u.id in (:unitIds)");
		hql.append(" order by usr.id");
		
		List<String> paramNames = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		paramNames.add("unitIds");
		values.add(unitIds);
		paramNames.add("permissions");
		values.add(permissions);
		@SuppressWarnings("unchecked")
		List<UserDO> list = this.getHibernateTemplate().findByNamedParam(hql.toString(), paramNames.toArray(new String[0]), values.toArray());
		return list;
	}
	
	/**
	 * 获取具有某些组织对应的机构权限的组织的用户的id
	 * @param orgIds
	 * @param permissions
	 * @return
	 */
	public List<Integer> getPermittedOrgUserIds(List<Integer> orgIds, String... permissions) {
		if (orgIds == null || orgIds.isEmpty() || permissions == null || permissions.length == 0) {
			return new ArrayList<Integer>();
		}
		StringBuilder hql = new StringBuilder();
		hql.append("select distinct usr.id");
		hql.append("  from OrganizationDO org left join org.users usr, UnitConfigDO uc");
		hql.append("  left join uc.unit u");
		hql.append("  left join uc.permissionScheme ps, PermissionSchemeItemDO psi left join psi.permissionSet p,");
		hql.append("  UnitRoleActorDO ura, UserGroupDO ug left join ug.users ugusr");
		hql.append(" where ");
		hql.append(" (");
		hql.append("  (('USER_GROUP') = psi.type and ug.id = psi.parameter and ugusr.id = usr.id)");
		hql.append("  or ('USER' = psi.type and psi.parameter = usr.id)");
		hql.append("  or ('ROLE' = psi.type and ura.role = psi.parameter");
		hql.append("       and (");
		hql.append("             ('USER_GROUP' = ura.type and ug.id = ura.parameter and ugusr.id = usr.id)");
		hql.append("          or ('USER' = ura.type and ura.parameter = usr.id)");
		hql.append("        )");
		hql.append("   )");
		hql.append(" )");
		hql.append(" and ura.unit.id = u.id");
		hql.append(" and psi.scheme.id = ps.id");
		hql.append(" and p.name in (:permissions)");
		hql.append(" and u.id = org.unit.id");
		hql.append(" and org.id in (:orgIds)");
		hql.append(" order by usr.id");
		
		List<String> paramNames = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		paramNames.add("orgIds");
		values.add(orgIds);
		paramNames.add("permissions");
		values.add(permissions);
		@SuppressWarnings("unchecked")
		List<Integer> list = this.getHibernateTemplate().findByNamedParam(hql.toString(), paramNames.toArray(new String[0]), values.toArray());
		return list;
	}
	
	/**
	 * 获取具有与指定用户所在安监机构的具有某些权限的用户
	 * @param user
	 * @param term
	 * @return
	 */
	public List<UserDO> getPermittedUsersByUnitsOfSpecifiedUser(UserDO user, String term, String... permissions) {
		List<UnitDO> units = unitDao.getUnitsByUser(user);
		List<Integer> unitIds = new ArrayList<Integer>();
		for (UnitDO unit : units) {
			unitIds.add(unit.getId());
		}
		List<UserDO> users = this.getPermittedUsers(unitIds, permissions);
		
		if (StringUtils.isNotBlank(term)) {
			Iterator<UserDO> it = users.iterator();
			while (it.hasNext()) {
				UserDO u = it.next();
				if (!StringUtils.containsIgnoreCase(u.getUsername(), term) && (u.getFullname() == null || !StringUtils.containsIgnoreCase(u.getFullname(), term))) {
					it.remove();
				}
			}
		}
		return users;
	}
	
	/**
	 * 获取具有某些机构权限的对应组织的用户
	 * @param unitId
	 * @param permissions
	 * @return
	 */
	public List<UserDO> getPermittedOrgUsers(int orgId, String... permissions) {
		StringBuilder hql = new StringBuilder();
		hql.append("select distinct usr");
		hql.append("  from UserDO usr, UnitConfigDO uc, OrganizationDO org");
		hql.append("  inner join org.users as orgUser");
		hql.append("  left join uc.unit u");
		hql.append("  left join uc.permissionScheme ps, PermissionSchemeItemDO psi left join psi.permissionSet p,");
		hql.append("  UnitRoleActorDO ura, UserGroupDO ug left join ug.users ugusr");
		hql.append(" where ");
		hql.append(" (");
		hql.append("  (('USER_GROUP') = psi.type and ug.id = psi.parameter and ugusr.id = usr.id)");
		hql.append("  or ('USER' = psi.type and psi.parameter = usr.id)");
		hql.append("  or ('ROLE' = psi.type and ura.role = psi.parameter");
		hql.append("       and (");
		hql.append("             ('USER_GROUP' = ura.type and ug.id = ura.parameter and ugusr.id = usr.id)");
		hql.append("          or ('USER' = ura.type and ura.parameter = usr.id)");
		hql.append("        )");
		hql.append("   )");
		hql.append(" )");
		hql.append(" and ura.unit.id = u.id");
		hql.append(" and psi.scheme.id = ps.id");
		hql.append(" and p.name in (:permissions)");
		hql.append(" and u.id = org.unit.id");
		hql.append(" and org.id = :orgId");
		hql.append(" and usr.id = orgUser.id");
		
		List<String> paramNames = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		paramNames.add("orgId");
		values.add(orgId);
		paramNames.add("permissions");
		values.add(permissions);
		@SuppressWarnings("unchecked")
		List<UserDO> list = this.getHibernateTemplate().findByNamedParam(hql.toString(), paramNames.toArray(new String[0]), values.toArray());
		return list;
	}
	
	/**
	 * 获取具有某些机构权限的用户的id
	 * @param unitId
	 * @param permissions
	 * @return
	 */
	public List<Integer> getPermittedUserIds(int unitId, String... permissions) {
		StringBuilder hql = new StringBuilder();
		hql.append("select distinct usr.id");
		hql.append("  from UserDO usr, UnitConfigDO uc");
		hql.append("  left join uc.unit u");
		hql.append("  left join uc.permissionScheme ps, PermissionSchemeItemDO psi left join psi.permissionSet p,");
		hql.append("  UnitRoleActorDO ura, UserGroupDO ug left join ug.users ugusr");
		hql.append(" where ");
		hql.append(" (");
		hql.append("  (('USER_GROUP') = psi.type and ug.id = psi.parameter and ugusr.id = usr.id)");
		hql.append("  or ('USER' = psi.type and psi.parameter = usr.id)");
		hql.append("  or ('ROLE' = psi.type and ura.role = psi.parameter");
		hql.append("       and (");
		hql.append("             ('USER_GROUP' = ura.type and ug.id = ura.parameter and ugusr.id = usr.id)");
		hql.append("          or ('USER' = ura.type and ura.parameter = usr.id)");
		hql.append("        )");
		hql.append("   )");
		hql.append(" )");
		hql.append(" and ura.unit.id = u.id");
		hql.append(" and psi.scheme.id = ps.id");
		hql.append(" and p.name in (:permissions)");
		hql.append(" and u.id = :unitId");
		
		List<String> paramNames = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		paramNames.add("unitId");
		values.add(unitId);
		paramNames.add("permissions");
		values.add(permissions);
		@SuppressWarnings("unchecked")
		List<Integer> list = this.getHibernateTemplate().findByNamedParam(hql.toString(), paramNames.toArray(new String[0]), values.toArray());
		return list;
	}

	/**
	 * 查询当前用户是否具有某些机构权限(无论是哪个安监机构)
	 * @param permissions
	 * @return
	 */
	public boolean hasUnitPermission(String... permissions) {
		
		StringBuilder hql = new StringBuilder("select c.unit from UnitDO u, UnitConfigDO c , PermissionSchemeItemDO i where c.unit = u and c.permissionScheme = i.scheme and i.permissionSet.name in (:permissions) and ");
		List<String> paramNames = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		paramNames.add("permissions");
		values.add(permissions);
		Integer userId = UserContext.getUserId();
		hql.append(this.getPermittedSql(PermissionType.UNIT, userId, paramNames, values));
		@SuppressWarnings("unchecked")
		List<UnitDO> list = this.getHibernateTemplate().findByNamedParam(hql.toString(), paramNames.toArray(new String[0]), values.toArray());
		return !list.isEmpty();
	}
	
	public boolean hasActivityPermission(int activityId, int unitId, String... permissions) {
		StringBuilder hql = new StringBuilder("select a from ProcessorDO p right join p.activity a inner join a.unit u, UnitConfigDO c, PermissionSchemeItemDO i where a.id = :activityId and a.unit = u and u = c.unit and c.permissionScheme = i.scheme and i.permissionSet.name in (:permissions) and ");
		List<String> paramNames = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		paramNames.add("activityId");
		values.add(activityId);
		paramNames.add("permissions");
		values.add(permissions);
		Integer userId = UserContext.getUserId();
		hql.append(this.getPermittedSql(PermissionType.ACTIVITY, userId, paramNames, values));
		List<?> list = this.getHibernateTemplate().findByNamedParam(hql.toString(), paramNames.toArray(new String[0]), values.toArray());
		return !list.isEmpty();
	}
	
	public List<String> getActivityPermissions(int activityId, int unitId) {
		StringBuilder hql = new StringBuilder("select distinct i.permissionSet.name from ProcessorDO p right join p.activity a inner join a.unit u, UnitConfigDO c, PermissionSchemeItemDO i where ");
		List<String> paramNames = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		Integer userId = UserContext.getUserId();
		hql.append(this.getPermittedSql(PermissionType.ACTIVITY, userId, paramNames, values));
		hql.append(" and u = c.unit and c.permissionScheme = i.scheme and a.id = :activityId");
		paramNames.add("activityId");
		values.add(activityId);
		@SuppressWarnings("unchecked")
		List<String> list = this.getHibernateTemplate().findByNamedParam(hql.toString(), paramNames.toArray(new String[0]), values.toArray());
		return list;
	}
	
	public List<PermissionSetDO> getNonGlobalPermissionSet() {
		@SuppressWarnings("unchecked")
		List<PermissionSetDO> list = this.getHibernateTemplate().find("from PermissionSetDO where deleted = false and (type <> 'global' or type is null) order by weight");
		return list;
	}
	
	public List<UnitDO> getPermittedUnits(String... permissions) {
		return this.getPermittedUnitsByUnitName(null, null, permissions);
	}
	
	public List<UnitDO> getPermittedUnits(int userId, String... permissions) {
		return this.getPermittedUnitsByUnitName(userId, null, permissions);
	}
	
	public List<UnitDO> getPermittedUnitsByUnitName(String unitName, String... permissions) {
		return getPermittedUnitsByUnitName(null, unitName, permissions);
	}
	
	public List<UnitDO> getPermittedUnitsByUnitName(Integer userId, String unitName, String... permissions) {
		StringBuilder hql = new StringBuilder("select distinct u from UnitDO u, UnitConfigDO c, PermissionSchemeItemDO i where u.deleted = false and u = c.unit and c.permissionScheme = i.scheme and i.permissionSet.name in (:permissions) and ");
		List<String> paramNames = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		paramNames.add("permissions");
		values.add(permissions);
		if (userId == null) userId = UserContext.getUserId();
		hql.append(this.getPermittedSql(PermissionType.UNIT, userId, paramNames, values));
		if (unitName != null && !unitName.trim().isEmpty()) {
			hql.append(" and upper(u.name) like upper(:unitName)");
			paramNames.add("unitName");
			values.add("%" + unitName + "%");
		}
		hql.append(" order by u.name");
		@SuppressWarnings("unchecked")
		List<UnitDO> list = this.getHibernateTemplate().findByNamedParam(hql.toString(), paramNames.toArray(new String[0]), values.toArray());
		return list;
	}
	
	public List<Integer> getPermittedUnitIdsByUnitName(Integer userId, String unitName, String... permissions) {
		StringBuilder hql = new StringBuilder("select distinct u.id from UnitDO u, UnitConfigDO c, PermissionSchemeItemDO i where u.deleted = false and u = c.unit and c.permissionScheme = i.scheme and i.permissionSet.name in (:permissions) and ");
		List<String> paramNames = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		paramNames.add("permissions");
		values.add(permissions);
		if (userId == null) userId = UserContext.getUserId();
		hql.append(this.getPermittedSql(PermissionType.UNIT, userId, paramNames, values));
		if (unitName != null && !unitName.trim().isEmpty()) {
			hql.append(" and upper(u.name) like upper(:unitName)");
			paramNames.add("unitName");
			values.add("%" + unitName + "%");
		}
		@SuppressWarnings("unchecked")
		List<Integer> list = this.getHibernateTemplate().findByNamedParam(hql.toString(), paramNames.toArray(new String[0]), values.toArray());
		return list;
	}
	
	public List<Integer> getPermittedOrgIdsByOrgName(Integer userId, String orgName, String... permissions) {
		StringBuilder hql = new StringBuilder("select distinct org.id from UnitDO u, UnitConfigDO c, PermissionSchemeItemDO i, OrganizationDO org join org.users orgUser where u.deleted = false and u = c.unit and u.id = org.unit.id and orgUser.id = :userId and c.permissionScheme = i.scheme and i.permissionSet.name in (:permissions) and ");
		List<String> paramNames = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		if (userId == null) userId = UserContext.getUserId();
		paramNames.add("permissions");
		values.add(permissions);
		paramNames.add("userId");
		values.add(userId);
		hql.append(this.getPermittedSql(PermissionType.UNIT, userId, paramNames, values));
		if (orgName != null && !orgName.trim().isEmpty()) {
			hql.append(" and upper(org.name) like upper(:orgName)");
			paramNames.add("orgName");
			values.add("%" + orgName + "%");
		}
		@SuppressWarnings("unchecked")
		List<Integer> list = this.getHibernateTemplate().findByNamedParam(hql.toString(), paramNames.toArray(new String[0]), values.toArray());
		return list;
	}
	
	public List<ActivityDO> getPermittedActivities(String... permissions) {
		StringBuilder hql = new StringBuilder("select distinct a from ProcessorDO p right join p.activity a inner join a.unit u, UnitConfigDO c, PermissionSchemeItemDO i where a.unit = u and u = c.unit and c.permissionScheme = i.scheme and i.permissionSet.name in (:permissions) and ");
		List<String> paramNames = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		paramNames.add("permissions");
		values.add(permissions);
		Integer userId = UserContext.getUserId();
		hql.append(this.getPermittedSql(PermissionType.ACTIVITY, userId, paramNames, values));
		@SuppressWarnings("unchecked")
		List<ActivityDO> list = this.getHibernateTemplate().findByNamedParam(hql.toString(), paramNames.toArray(new String[0]), values.toArray());
		return list;
	}
	
	public List<UnitDO> getPermittedUnitsByUserType(UserType userType, String... permissions) {
		List<String> paramNames = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		paramNames.add("userType");
		values.add(userType.name());
		paramNames.add("permissions");
		values.add(permissions);
		@SuppressWarnings("unchecked")
		List<UnitDO> list = this.getHibernateTemplate().findByNamedParam("select distinct u from UnitDO u, UnitConfigDO c, PermissionSchemeItemDO i where u = c.unit and c.permissionScheme = i.scheme and i.type = :userType and i.permissionSet.name in (:permissions)", paramNames.toArray(new String[0]), values.toArray());
		return list;
	}
	
	public String getPermittedSql(PermissionType type, Integer userId, List<String> paramNames, List<Object> values) {
		StringBuilder hql = new StringBuilder("(");
		for (UserType userType : UserType.values()) {
			switch (userType) {
				case REPORTER:
					if (type == PermissionType.ACTIVITY) {
						hql.append("(i.type = 'REPORTER' and a.creator.id = :REPORTER) or ");
						paramNames.add(userType.name());
						values.add(userId);
					}
					break;
				case PROCESSOR:
					if (type == PermissionType.ACTIVITY) {
						hql.append("(i.type = 'PROCESSOR' and a.id = p.activity.id and p.user.id = :PROCESSOR) or ");
						paramNames.add(userType.name());
						values.add(userId);
					}
					break;
				case UNIT_RESPONSIBLE_USER:
					hql.append("(i.type = 'UNIT_RESPONSIBLE_USER' and c.unit.responsibleUser.id = :UNIT_RESPONSIBLE_USER) or ");
					paramNames.add(userType.name());
					values.add(userId);
					break;
				case USER:
					hql.append("(i.type = 'USER' and i.parameter = :USER) or ");
					paramNames.add(userType.name());
					values.add(userId.toString());
					break;
				case USER_GROUP:
					List<UserGroupDO> groups = userGroupDao.getUserGroupByUserId(userId);
					if (groups.size() == 0) {
						hql.append("(i.type = 'USER_GROUP' and i.parameter is null) or ");
					} else {
						hql.append("(i.type = 'USER_GROUP' and (i.parameter in (:USER_GROUP) or i.parameter is null)) or ");
						paramNames.add(userType.name());
						List<String> groupIds = new ArrayList<String>();
						for (UserGroupDO group : groups) {
							groupIds.add(group.getId().toString());
						}
						values.add(groupIds);
					}
					break;
				case ROLE:
					List<UnitRoleActorDO> actors = unitRoleActorDao.getByUser(userId);
					if (actors.size() == 0) break;
					hql.append("(i.type = 'ROLE' and (");
					for (int i = 0; i < actors.size(); i++) {
						UnitRoleActorDO actor = actors.get(i);
						String roleParamName = "ROLE" + i;
						String unitParamName = "UNIT" + i;
						hql.append("(i.parameter = :" + roleParamName + " and u.id = :" + unitParamName + ") or ");
						paramNames.add(roleParamName);
						values.add(actor.getRole().getId().toString());
						paramNames.add(unitParamName);
						values.add(actor.getUnit().getId());
					}
					int length = hql.length();
					hql.delete(length - 4, length).append(")) or ");
					break;
				case CUSTOM_USER_FIELD:
				case CUSTOM_USER_GROUP_FIELD:
				default:
					continue;
			}
		}
		int length = hql.length();
		hql.delete(length - 4, length).append(")");
		return hql.toString();
	}
	
	enum PermissionType {
		UNIT, ACTIVITY;
	}
	
	public void setUserGroupDao(UserGroupDao userGroupDao) {
		this.userGroupDao = userGroupDao;
	}
	
	public void setUnitRoleActorDao(UnitRoleActorDao unitRoleActorDao) {
		this.unitRoleActorDao = unitRoleActorDao;
	}

	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}
	
}
