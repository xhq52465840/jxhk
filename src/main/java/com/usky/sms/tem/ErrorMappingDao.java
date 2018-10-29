
package com.usky.sms.tem;

import java.lang.reflect.Field;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.activity.ActivityDao;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.tem.error.ErrorDao;

public class ErrorMappingDao extends BaseDao<ErrorMappingDO> {
	
	@Autowired
	private ActivityDao activityDao;
	
	@Autowired
	private ControlMeasureDao controlMeasureDao;
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	
	@Autowired
	private ErrorDao errorDao;
	
	public ErrorMappingDao() {
		super(ErrorMappingDO.class);
	}
	
	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple, boolean showExtendFields) {
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
		if (fields.contains("controlMeasures")) {
			ErrorMappingDO mapping = (ErrorMappingDO) obj;
			ActivityDO activity = mapping.getTem().getActivity();
			Map<String, Object> data = new HashMap<String, Object>();
			data.put("data", controlMeasureDao.convert(controlMeasureDao.getControlMeasures(mapping.getId(), null)));
			data.put("editable", activity.getId() != null && permissionSetDao.hasActivityPermission(activity.getId(), activity.getUnit().getId(), PermissionSets.CONTROL_MEASURE.getName()));
			map.put("controlMeasures", data);
		}
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		ErrorMappingDO mapping = (ErrorMappingDO) obj;
		if ("error".equals(fieldName)) {
			map.put(fieldName, errorDao.convert(mapping.getError()));
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}
	
	public ErrorMappingDO getErrorMapping(int temId, int errorId) {
		@SuppressWarnings("unchecked")
		List<ErrorMappingDO> list = this.getHibernateTemplate().find("from ErrorMappingDO where tem.id = ? and error.id = ? ", temId, errorId);
		if (list.size() == 0) return null;
		return list.get(0);
	}
	
	@Override
	protected void beforeDelete(Collection<ErrorMappingDO> collection) {
		for (ErrorMappingDO errorMapping : collection) {
			List<ControlMeasureDO> list = controlMeasureDao.getControlMeasures(errorMapping.getId(), null);
			if (list != null && list.size() > 0) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "操作失败：已存在控制措施");
		}
	}
	
	public void setActivityDao(ActivityDao activityDao) {
		this.activityDao = activityDao;
	}
	
	public void setControlMeasureDao(ControlMeasureDao controlMeasureDao) {
		this.controlMeasureDao = controlMeasureDao;
	}
	
	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}
	
	public void setErrorDao(ErrorDao errorDao) {
		this.errorDao = errorDao;
	}
}
