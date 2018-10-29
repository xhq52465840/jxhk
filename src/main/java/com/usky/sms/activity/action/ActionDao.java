
package com.usky.sms.activity.action;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.apache.log4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.activity.ActivityDao;
import com.usky.sms.avatar.AvatarDO;
import com.usky.sms.common.DateHelper;
import com.usky.sms.config.Config;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.log.ActivityLoggingDO;
import com.usky.sms.log.ActivityLoggingDao;
import com.usky.sms.log.operation.ActivityLoggingOperationRegister;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;

public class ActionDao extends BaseDao<ActionDO> {
	
	private Config config;
	
	@Autowired
	private ActivityDao activityDao;
	
	@Autowired
	private ActivityLoggingDao activityLoggingDao;
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	
	public ActionDao() {
		super(ActionDO.class);
		this.config = Config.getInstance();
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		checkConstraints(map);
		return super.beforeSave(map);
	}
	
	@Override
	protected void afterSave(ActionDO action) {
		UserDO user = UserContext.getUser();
		action.setAuthor(user);
		action.setUpdatedAuthor(user);
		this.internalUpdate(action);
		MDC.put("actionId", action.getId());
		activityLoggingDao.addLogging(action.getActivity().getId(), ActivityLoggingOperationRegister.getOperation("ACTIVITY_COMMENTED"));
		MDC.remove("actionId");
	}
	
	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		checkConstraints(map);
		map.put("updatedAuthor", UserContext.getUserId());
	}
	
	@Override
	protected void afterDelete(Collection<ActionDO> actions) {
		if (actions.size() == 0) return;
		List<String> paramNames = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		StringBuilder hql = new StringBuilder("from ActivityLoggingDO where operation = :operation and (");
		paramNames.add("operation");
		values.add("ACTIVITY_COMMENTED");
		int i = 0;
		for (ActionDO action : actions) {
			String activityIdName = "activityId" + i;
			String dataName = "data" + i;
			hql.append("(activity.id = :" + activityIdName + " and to_char(substr(data, 0, 2000)) = :" + dataName + ") or ");
			paramNames.add(activityIdName);
			values.add(action.getActivity().getId());
			paramNames.add(dataName);
			values.add(action.getId().toString());
			i++;
		}
		int length = hql.length();
		hql.delete(length - 4, length).append(")");
		@SuppressWarnings("unchecked")
		List<ActivityLoggingDO> loggings = this.getHibernateTemplate().findByNamedParam(hql.toString(), paramNames.toArray(new String[0]), values.toArray());
		activityLoggingDao.internalDelete(loggings);
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		ActionDO action = (ActionDO) obj;
		if ("author".equals(fieldName)) {
			UserDO user = action.getAuthor();
			map.put("userId", user.getId());
			map.put("username", user.getUsername());
			map.put("fullname", user.getFullname());
			AvatarDO avatar = user.getAvatar();
			map.put("avatar", config.getUserAvatarWebPath() + "/" + (avatar == null ? config.getUnknownUserAvatar() : avatar.getFileName()));
			return;
		} else if ("created".equals(fieldName)) {
			map.put("date", DateHelper.formatIsoSecond(action.getCreated()));
		} else if ("lastUpdate".equals(fieldName)) {
			map.put("lastDate", DateHelper.formatIsoSecond(action.getLastUpdate()));
		}
		super.setField(map, obj, claz, multiple, field);
	}
	
	@Override
	protected void afterGetList(List<Map<String, Object>> list, Map<String, Object> paramMap, Map<String, Object> searchMap, List<String> orders) {
		if (list.isEmpty()) return;
		int activityId = (Integer) list.get(0).get("activityId");
		ActivityDO activity = activityDao.internalGetById(activityId);
		boolean editAll = permissionSetDao.hasActivityPermission(activity.getId(), activity.getUnit().getId(), PermissionSets.EDIT_REMARK.getName());
		boolean editSelf = editAll || permissionSetDao.hasActivityPermission(activity.getId(), activity.getUnit().getId(), PermissionSets.EDIT_SELF_REMARK.getName());
		boolean deleteAll = permissionSetDao.hasActivityPermission(activity.getId(), activity.getUnit().getId(), PermissionSets.DELETE_REMARK.getName());
		boolean deleteSelf = deleteAll || permissionSetDao.hasActivityPermission(activity.getId(), activity.getUnit().getId(), PermissionSets.DELETE_SELF_REMARK.getName());
		for (Map<String, Object> map : list) {
			map.put("editable", editAll || (editSelf && UserContext.getUserId().equals(map.get("userId"))));
			map.put("deletable", deleteAll || (deleteSelf && UserContext.getUserId().equals(map.get("userId"))));
		}
	}
	
	private void checkConstraints(Map<String, Object> map) {
		String body = (String) map.get("body");
		checkFieldLimit(body);
	}
	
	private void checkFieldLimit(String body) {
		if (body.length() > 4000) throw new SMSException(SMSException.FIELD_OUT_OF_LIMIT, "body");
	}
	
	public List<ActionDO> getByActivity(int activityId) {
		@SuppressWarnings("unchecked")
		List<ActionDO> list = this.getHibernateTemplate().find("from ActionDO where deleted = false and activity.id = ? order by created desc", activityId);
		return list;
	}
	
	public void setActivityDao(ActivityDao activityDao) {
		this.activityDao = activityDao;
	}
	
	public void setActivityLoggingDao(ActivityLoggingDao activityLoggingDao) {
		this.activityLoggingDao = activityLoggingDao;
	}
	
	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}
	
}
