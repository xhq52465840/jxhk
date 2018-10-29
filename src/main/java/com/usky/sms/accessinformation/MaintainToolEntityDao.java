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

public class MaintainToolEntityDao extends BaseDao<MaintainToolEntityDO> {

	@Autowired
	private ActivityLoggingDao activityLoggingDao;

	@Autowired
	private DictionaryDao dictionaryDao;

	public MaintainToolEntityDao() {
		super(MaintainToolEntityDO.class);
	}

	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		MaintainToolEntityDO entity = (MaintainToolEntityDO) obj;
		if ("maintainTool".equals(fieldName)) {
			map.put(fieldName, entity.getMaintainTool().getName());
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}

	public List<MaintainToolEntityDO> getByActivityId(int activityId) {
		@SuppressWarnings("unchecked")
		List<MaintainToolEntityDO> list = this.getHibernateTemplate().find(
				"from MaintainToolEntityDO where deleted = ? and activity.id = ? order by id", false, activityId);
		return list;
	}

	@Override
	protected void afterSave(MaintainToolEntityDO obj) {
		// 添加活动日志
		List<String> details = new ArrayList<String>();
		DictionaryDO maintainTool = dictionaryDao.internalGetById(obj.getMaintainTool().getId());
		details.add("添加维护工具为:[名称:" + (maintainTool == null ? "" : maintainTool.getName()) + "]");
		MDC.put("details", details.toArray());
		activityLoggingDao.addLogging(obj.getActivity().getId(),
				ActivityLoggingOperationRegister.getOperation("UPDATE_ACCESSINFO"));
		MDC.remove("details");
	}

	@Override
	protected void afterDelete(Collection<MaintainToolEntityDO> collection) {
		for (MaintainToolEntityDO maintainToolEntity : collection) {
			// 添加活动日志
			List<String> details = new ArrayList<String>();
			details.add("删除了维护工具:[名称:" + (maintainToolEntity == null ? "" : maintainToolEntity.getMaintainTool().getName()) + "]");
			MDC.put("details", details.toArray());
			activityLoggingDao.addLogging(maintainToolEntity.getActivity().getId(),
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
