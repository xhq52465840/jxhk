
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
import com.usky.sms.tem.threat.ThreatDao;

public class ThreatMappingDao extends BaseDao<ThreatMappingDO> {
	
	@Autowired
	private ActivityDao activityDao;
	
	@Autowired
	private ControlMeasureDao controlMeasureDao;
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	
	@Autowired
	private ThreatDao threatDao;
	
	public ThreatMappingDao() {
		super(ThreatMappingDO.class);
	}
	
	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple, boolean showExtendFields) {
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
		if (fields.contains("controlMeasures")) {
			ThreatMappingDO mapping = (ThreatMappingDO) obj;
			ActivityDO activity = mapping.getTem().getActivity();
			Map<String, Object> data = new HashMap<String, Object>();
			data.put("data", controlMeasureDao.convert(controlMeasureDao.getControlMeasures(null, mapping.getId())));
			data.put("editable", activity.getId() != null && permissionSetDao.hasActivityPermission(activity.getId(), activity.getUnit().getId(), PermissionSets.CONTROL_MEASURE.getName()));
			map.put("controlMeasures", data);
		}
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		ThreatMappingDO mapping = (ThreatMappingDO) obj;
		if ("threat".equals(fieldName)) {
			map.put(fieldName, threatDao.convert(mapping.getThreat()));
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}
	
	public ThreatMappingDO getThreatMapping(int temId, int threatId) {
		@SuppressWarnings("unchecked")
		List<ThreatMappingDO> list = this.getHibernateTemplate().find("from ThreatMappingDO where tem.id = ? and threat.id = ?", temId, threatId);
		if (list.size() == 0) return null;
		return list.get(0);
	}
	
	@Override
	protected void beforeDelete(Collection<ThreatMappingDO> collection) {
		for (ThreatMappingDO threatMapping : collection) {
			List<ControlMeasureDO> list = controlMeasureDao.getControlMeasures(null,threatMapping.getId());
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
	
	public void setThreatDao(ThreatDao threatDao) {
		this.threatDao = threatDao;
	}
	
}
