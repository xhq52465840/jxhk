
package com.usky.sms.user;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.core.BaseDao;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitRoleActorDO;
import com.usky.sms.unit.UnitRoleActorDao;

public class UserHistoryItemDao extends BaseDao<UserHistoryItemDO> {
	
	private static final Logger log = Logger.getLogger(UserHistoryItemDao.class);
	
	private static int UNIT_RECENT_COUNT = 5;
	
	private static int ACTIVITY_RECENT_COUNT = 5;
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	
	@Autowired
	private UserGroupDao userGroupDao;
	
	@Autowired
	private UnitRoleActorDao unitRoleActorDao;
	
	public UserHistoryItemDao() {
		super(UserHistoryItemDO.class);
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void recordActivityType(String entityId, String username, String data) {
		String entityType = "ActivityType";
		@SuppressWarnings("unchecked")
		List<UserHistoryItemDO> list = this.getHibernateTemplate().find("from UserHistoryItemDO where entityType = ? and username = ?", entityType, username);
		if (list.size() == 0) {
			UserHistoryItemDO item = new UserHistoryItemDO();
			item.setEntityType(entityType);
			item.setEntityId(entityId);
			item.setUsername(username);
			item.setData(data);
			item.setLastViewed(new Date());
			this.internalSave(item);
		} else {
			UserHistoryItemDO item = list.get(0);
			item.setEntityId(entityId);
			item.setLastViewed(new Date());
			this.internalUpdate(item);
		}
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void record(String entityType, String entityId, String username, String data) {
		synchronized (UserContext.getUser()) {
			@SuppressWarnings("unchecked")
			List<UserHistoryItemDO> list = this.getHibernateTemplate().find("from UserHistoryItemDO where entityType = ? and entityId = ? and username = ?", entityType, entityId, username);
			if (list.size() == 0) {
				UserHistoryItemDO item = new UserHistoryItemDO();
				item.setEntityType(entityType);
				item.setEntityId(entityId);
				item.setUsername(username);
				item.setData(data);
				item.setLastViewed(new Date());
				this.internalSave(item);
			} else {
				UserHistoryItemDO item = list.get(0);
				item.setLastViewed(new Date());
				this.internalUpdate(item);
			}
		}
	}
	
	public UserHistoryItemDO getActivityType() {
		@SuppressWarnings("unchecked")
		List<UserHistoryItemDO> list = this.getHibernateTemplate().find("from UserHistoryItemDO where entityType = ? and username = ?", "ActivityType", UserContext.getUser().getUsername());
		if (list.size() > 0) return list.get(0);
		return null;
	}
	
	public UserHistoryItemDO getCurrentUnit(String... permissions) {
		List<UserHistoryItemDO> list = getRecentUnits(0, 1, permissions);
		if (list.size() > 0) return list.get(0);
		return null;
	}
	
	public List<UserHistoryItemDO> getRecentUnits(String... permissions) {
		return getRecentUnits(1, UNIT_RECENT_COUNT + 1, permissions);
	}
	
	public List<UserHistoryItemDO> getRecentUnits(int from, int to, String... permissions) {
		@SuppressWarnings("unchecked")
		List<UserHistoryItemDO> list = this.getHibernateTemplate().find("from UserHistoryItemDO where entityType = ? and username = ? order by lastViewed desc", "Unit", UserContext.getUser().getUsername());
		List<UserHistoryItemDO> items = new ArrayList<UserHistoryItemDO>();
		int count = 0;
		List<UnitDO> units = this.getPermittedUnits(permissions);
		for (UserHistoryItemDO item : list) {
			if (count >= to) break;
			for (UnitDO unit : units) {
				if (item.getEntityId().equals(unit.getId().toString())) {
					if (count >= from) items.add(item);
					count++;
					break;
				}
			}
		}
		return items;
	}
	
	private List<UnitDO> getPermittedUnits(String... permissions) {
		return permissionSetDao.getPermittedUnits(permissions);
	}
	
	public List<ActivityDO> getRecentActivities(String... permissions) {
		return getRecentActivities(0, ACTIVITY_RECENT_COUNT, permissions);
	}
	
	//	public List<UserHistoryItemDO> getRecentActivities(int from, int to, String... permissions) {
	//		@SuppressWarnings("unchecked")
	//		List<UserHistoryItemDO> list = this.getHibernateTemplate().find("from UserHistoryItemDO where entityType = ? and username = ? order by lastViewed desc", "Activity", UserContext.getUser().getUsername());
	//		List<UserHistoryItemDO> items = new ArrayList<UserHistoryItemDO>();
	//		int count = 0;
	//		List<ActivityDO> activities = this.getPermittedActivities(permissions);
	//		for (UserHistoryItemDO item : list) {
	//			if (count >= to) break;
	//			for (ActivityDO activity : activities) {
	//				if (item.getEntityId().equals(activity.getId().toString())) {
	//					if (count >= from) items.add(item);
	//					count++;
	//					break;
	//				}
	//			}
	//		}
	//		return items;
	//	}
	//	
	//	private List<ActivityDO> getPermittedActivities(String... permissions) {
	//		return permissionSetDao.getPermittedActivities(permissions);
	//	}
	
	public List<ActivityDO> getRecentActivities(int from, int to, String... permissions) {
		long stamp = System.currentTimeMillis();
		StringBuilder hql = new StringBuilder("select distinct a, u from ActivityDO a, UnitConfigDO c, PermissionSchemeItemDO i, ProcessorDO p, UserHistoryItemDO u where a.unit = c.unit and c.permissionScheme = i.scheme and i.permissionSet.name in (:permissions) and (");
		List<String> paramNames = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		paramNames.add("permissions");
		values.add(permissions);
		Integer userId = UserContext.getUserId();
		for (UserType userType : UserType.values()) {
			switch (userType) {
				case REPORTER:
					hql.append("(i.type = 'REPORTER' and a.creator.id = :REPORTER) or ");
					paramNames.add(userType.name());
					values.add(userId);
					break;
				case PROCESSOR:
					hql.append("(i.type = 'PROCESSOR' and a.id = p.activity.id and p.user.id = :PROCESSOR) or ");
					paramNames.add(userType.name());
					values.add(userId);
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
						hql.append("(i.parameter = :" + roleParamName + " and c.unit.id = :" + unitParamName + ") or ");
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
		hql.delete(hql.length() - 4, hql.length()).append(")");
		hql.append(" and u.entityType = 'Activity' and u.username = :username and u.entityId = a.id order by u.lastViewed desc");
		paramNames.add("username");
		values.add(UserContext.getUser().getUsername());
		log.debug(System.currentTimeMillis() - stamp);
//		this.getHibernateTemplate().setMaxResults(to);
		@SuppressWarnings("unchecked")
		List<Object> list = this.getHibernateTemplate().findByNamedParam(hql.toString(), paramNames.toArray(new String[0]), values.toArray());
		log.debug(System.currentTimeMillis() - stamp);
		List<ActivityDO> items = new ArrayList<ActivityDO>();
		int count = 0;
		for (Object item : list) {
			if (count >= to) break;
			if (count >= from) items.add((ActivityDO) ((Object[]) item)[0]);
			count++;
		}
		log.debug("获取最新安全信息（ms）：" + (System.currentTimeMillis() - stamp));
		return items;
	}
	
	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}
	
	public void setUserGroupDao(UserGroupDao userGroupDao) {
		this.userGroupDao = userGroupDao;
	}
	
	public void setUnitRoleActorDao(UnitRoleActorDao unitRoleActorDao) {
		this.unitRoleActorDao = unitRoleActorDao;
	}
	
}
