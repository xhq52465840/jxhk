package com.usky.sms.accessinformation;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.apache.log4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.core.BaseDao;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.log.ActivityLoggingDao;
import com.usky.sms.log.operation.ActivityLoggingOperationRegister;

public class VehicleInfoEntityDao extends BaseDao<VehicleInfoEntityDO> {

	@Autowired
	private ActivityLoggingDao activityLoggingDao;

	@Autowired
	private DictionaryDao dictionaryDao;

	public VehicleInfoEntityDao() {
		super(VehicleInfoEntityDO.class);
	}

	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		VehicleInfoEntityDO entity = (VehicleInfoEntityDO) obj;
		if ("vehicleInfo".equals(fieldName)) {
			map.put(fieldName, entity.getVehicleInfo().getName());
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}

	public List<VehicleInfoEntityDO> getByActivityId(int activityId) {
		@SuppressWarnings("unchecked")
		List<VehicleInfoEntityDO> list = this.getHibernateTemplate().find(
				"from VehicleInfoEntityDO where deleted = ? and activity.id = ? order by id", false, activityId);
		return list;
	}
	
	@Override
	protected void afterSave(VehicleInfoEntityDO obj) {
		// 添加活动日志
		List<String> details = new ArrayList<String>();
		DictionaryDO vehicleInfo = dictionaryDao.internalGetById(obj.getVehicleInfo().getId());
		details.add("添加车辆信息为:[车牌号:" + (vehicleInfo == null ? "" : obj.getNum()) + "]");
		MDC.put("details", details.toArray());
		activityLoggingDao.addLogging(obj.getActivity().getId(),
				ActivityLoggingOperationRegister.getOperation("UPDATE_ACCESSINFO"));
		MDC.remove("details");
	}

	@Override
	protected void afterDelete(Collection<VehicleInfoEntityDO> collection) {
		for (VehicleInfoEntityDO vehicleInfoEntity : collection) {
			// 添加活动日志
			List<String> details = new ArrayList<String>();
			details.add("删除了车辆信息:[车牌号:" + (vehicleInfoEntity == null ? "" : vehicleInfoEntity.getNum()) + "]");
			MDC.put("details", details.toArray());
			activityLoggingDao.addLogging(vehicleInfoEntity.getActivity().getId(),
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
