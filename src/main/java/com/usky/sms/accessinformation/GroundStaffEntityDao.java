package com.usky.sms.accessinformation;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.apache.log4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.core.BaseDao;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.log.ActivityLoggingDao;
import com.usky.sms.log.operation.ActivityLoggingOperationRegister;

public class GroundStaffEntityDao extends BaseDao<GroundStaffEntityDO> {

	@Autowired
	private ActivityLoggingDao activityLoggingDao;

	@Autowired
	private DictionaryDao dictionaryDao;

	public GroundStaffEntityDao() {
		super(GroundStaffEntityDO.class);
	}

	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		GroundStaffEntityDO entity = (GroundStaffEntityDO) obj;
		if ("workType".equals(fieldName)) {
			map.put("workTypeId", entity.getWorkType().getId());
			map.put("workType", entity.getWorkType().getName());
			map.put("workTypeDeleted", entity.getWorkType().isDeleted());
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}

	public List<GroundStaffEntityDO> getByActivityId(int activityId) {
		@SuppressWarnings("unchecked")
		List<GroundStaffEntityDO> list = this.getHibernateTemplate().find(
				"from GroundStaffEntityDO where deleted = ? and activity.id = ? order by id", false, activityId);
		return list;
	}

	@Override
	protected void afterSave(GroundStaffEntityDO obj) {
		// 添加活动日志
		List<String> details = new ArrayList<String>();
		details.add("添加地面人员为:[姓名:" + obj.getUserName() + "]");
		MDC.put("details", details.toArray());
		activityLoggingDao.addLogging(obj.getActivity().getId(),
				ActivityLoggingOperationRegister.getOperation("UPDATE_ACCESSINFO"));
		MDC.remove("details");
	}

	@Override
	protected void afterDelete(Collection<GroundStaffEntityDO> collection) {
		for (GroundStaffEntityDO groundStaffEntityDO : collection) {
			// 添加活动日志
			List<String> details = new ArrayList<String>();
			details.add("删除了地面人员:[姓名:" + groundStaffEntityDO.getUserName() + "]");
			MDC.put("details", details.toArray());
			activityLoggingDao.addLogging(groundStaffEntityDO.getActivity().getId(),
					ActivityLoggingOperationRegister.getOperation("UPDATE_ACCESSINFO"));
			MDC.remove("details");
		}
	}

	public void setActivityLoggingDao(ActivityLoggingDao activityLoggingDao) {
		this.activityLoggingDao = activityLoggingDao;
	}

	public void setDictionaryDao(DictionaryDao dictionaryDao) {
		this.dictionaryDao = dictionaryDao;
	}
	
}
