
package com.usky.sms.log;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.activity.attribute.ActivityStatusCategory;
import com.usky.sms.activity.attribute.ActivityStatusDO;
import com.usky.sms.activity.type.ActivityTypeDO;
import com.usky.sms.avatar.AvatarDO;
import com.usky.sms.common.DateHelper;
import com.usky.sms.config.Config;
import com.usky.sms.core.BaseDao;
import com.usky.sms.log.operation.AbstractActivityLoggingOperation;
import com.usky.sms.log.operation.ActivityLoggingOperationRegister;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;

public class ActivityLoggingDao extends BaseDao<ActivityLoggingDO> {
	
	private Config config;
	
	@Autowired
	private UserDao userDao;
	
	public ActivityLoggingDao() {
		super(ActivityLoggingDO.class);
		this.config = Config.getInstance();
	}
	
	@Override
	protected Object getQueryParamValue(String key, Object value) {
		if ("activity.unit.id".equals(key)) {
			@SuppressWarnings("unchecked")
			List<Double> idDoubles = (List<Double>) value;
			List<Integer> ids = new ArrayList<Integer>();
			for (Double idDouble : idDoubles) {
				ids.add(idDouble.intValue());
			}
			return ids;
		}
		return super.getQueryParamValue(key, value);
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		ActivityLoggingDO logging = (ActivityLoggingDO) obj;
		if ("user".equals(fieldName)) {
			UserDO user = logging.getUser();
			if(user==null){
				user = userDao.getByUsername("ANONYMITY");
			}
			map.put("userId", user.getId());
			map.put("username", user.getUsername());
			map.put("fullname", user.getFullname());
			AvatarDO avatar = user.getAvatar();
			map.put("avatar", config.getUserAvatarWebPath() + "/" + (avatar == null ? config.getUnknownUserAvatar() : avatar.getFileName()));
			return;
		} else if ("activity".equals(fieldName)) {
			ActivityDO activity = logging.getActivity();
			map.put("activityId", activity.getId());
			map.put("activityNum", activity.getNum());
			map.put("activityName", activity.getSummary());
			ActivityStatusDO status = activity.getStatus();
			map.put("activityStatus", status.getName());
			map.put("activityResolved", ActivityStatusCategory.valueOf(status.getCategory()) == ActivityStatusCategory.COMPLETE);
			ActivityTypeDO type = activity.getType();
			map.put("activityTypeName", type.getName());
			map.put("activityTypeUrl", type.getUrl());
			UnitDO unit = activity.getUnit();
			map.put("unitKey", unit.getCode());
			AbstractActivityLoggingOperation operation = ActivityLoggingOperationRegister.getOperation(logging.getOperation());
			map.put("remark", operation.getRemark(logging.getData()));
			// TODO:
			map.put("details", operation.getDetails(logging.getData()));
			//			map.put("watch", activity.getNum());
			//			map.put("vote", activity.getNum());
			return;
		} else if ("operation".equals(fieldName)) {
			AbstractActivityLoggingOperation operation = ActivityLoggingOperationRegister.getOperation(logging.getOperation());
			map.put("operation", operation.getName());
			map.put("operationPrefix", operation.getPrefix());
			map.put("operationSuffix", operation.getSuffix());
			return;
		} else if ("created".equals(fieldName)) {
			map.put("date", DateHelper.formatIsoSecond(logging.getCreated()));
		}
		super.setField(map, obj, claz, multiple, field);
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void addLogging(int activityId, AbstractActivityLoggingOperation operation) {
		ActivityLoggingDO logging = new ActivityLoggingDO();
		ActivityDO activity = new ActivityDO();
		activity.setId(activityId);
		logging.setActivity(activity);
		logging.setOperation(operation.getName());
		UserDO user = UserContext.getUser();
		if(user==null){
			user = userDao.getByUsername("ANONYMITY");
		}
		logging.setUser(UserContext.getUser());
		logging.setData(operation.getData());
		this.internalSave(logging);
	}
	
	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}
	
}
