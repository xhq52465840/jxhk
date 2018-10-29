
package com.usky.sms.tem;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.activity.ActivityDao;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.log.ActivityLoggingDao;
import com.usky.sms.log.operation.ActivityLoggingOperationRegister;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.tem.control.ControlDO;
import com.usky.sms.tem.control.ControlDao;
import com.usky.sms.tem.error.ErrorDO;
import com.usky.sms.tem.threat.ThreatDO;

public class ControlMeasureDao extends BaseDao<ControlMeasureDO> {
	
	public static final SMSException EXIST_DUPLICATE_CONTROLS = new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "存在重复的控制措施条款！");
	
	public static final String CONTROL_MEASURE_STATUS_UNPUBLISHED = "未发布";
	
	public static final String CONTROL_MEASURE_STATUS_INCOMPLETE = "未落实";
	
	public static final String CONTROL_MEASURE_STATUS_COMPLETE = "落实";
	
	@Autowired
	private ActionItemDao actionItemDao;
	
	@Autowired
	private ActivityDao activityDao;
	
	@Autowired
	private ActivityLoggingDao activityLoggingDao;
	
	@Autowired
	private ControlDao controlDao;
	
	@Autowired
	private ErrorMappingDao errorMappingDao;
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	
	@Autowired
	private ThreatMappingDao threatMappingDao;
	
	public ControlMeasureDao() {
		super(ControlMeasureDO.class);
	}
	
	@Override
	public void afterGetList(Map<String, Object> map, Map<String, Object> ruleMap) {
		@SuppressWarnings("unchecked")
		List<List<Map<String, Object>>> ruleList = (List<List<Map<String, Object>>>) ruleMap.get("rule");
		Integer activityId = null;
		if (ruleList != null && ruleList.size() > 0) {
			OUTER: for (List<Map<String, Object>> andRule : ruleList) {
				for (Map<String, Object> orRule : andRule) {
					String key = (String) orRule.get("key");
					if ("threat".equals(key)) {
						Number threatId = (Number) orRule.get("value");
						if (threatId == null) continue;
						activityId = threatMappingDao.internalGetById(threatId.intValue()).getTem().getActivity().getId();
					} else if ("error".equals(key)) {
						Number errorId = (Number) orRule.get("value");
						if (errorId == null) continue;
						activityId = errorMappingDao.internalGetById(errorId.intValue()).getTem().getActivity().getId();
					} else {
						continue;
					}
					break OUTER;
				}
			}
		}
		map.put("editable", activityId != null && permissionSetDao.hasActivityPermission(activityId, activityDao.internalGetById(activityId).getUnit().getId(), PermissionSets.CONTROL_MEASURE.getName()));
	}
	
	public List<ControlMeasureDO> getControlMeasures(Integer errorId, Integer threatId, int controlId) {
		if (errorId == null && threatId == null) return null;
		StringBuilder hql = new StringBuilder("from ControlMeasureDO where deleted = ? and control.id = ?");
		List<Object> parameters = new ArrayList<Object>();
		parameters.add(false);
		parameters.add(controlId);
		if (errorId != null) {
			hql.append(" and error.id = ?");
			parameters.add(errorId);
		}
		if (threatId != null) {
			hql.append(" and threat.id = ?");
			parameters.add(threatId);
		}
		@SuppressWarnings("unchecked")
		List<ControlMeasureDO> list = this.getHibernateTemplate().find(hql.toString(), parameters.toArray());
		return list;
	}
	
	private void checkConstraint(Integer controlMeasureId, Integer errorId, Integer threatId, int controlId) {
		List<ControlMeasureDO> controlMeasures = this.getControlMeasures(errorId, threatId, controlId);
		switch (controlMeasures.size()) {
			case 0:
				return;
			case 1:
				if (controlMeasures.get(0).getId().equals(controlMeasureId)) return;
			default:
				throw EXIST_DUPLICATE_CONTROLS;
		}
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		Number error = (Number) map.get("error");
		Integer errorId = error == null ? null : error.intValue();
		Number threat = (Number) map.get("threat");
		Integer threatId = threat == null ? null : threat.intValue();
		checkConstraint(null, errorId, threatId, ((Number) map.get("control")).intValue());
		map.put("status", CONTROL_MEASURE_STATUS_UNPUBLISHED);
		return true;
	}
	
	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		ControlMeasureDO controlMeasure = this.internalGetById(id);
		if (controlMeasure == null) throw SMSException.NO_MATCHABLE_OBJECT;
		ErrorMappingDO error = controlMeasure.getError();
		Integer errorId = error == null ? null : error.getId();
		ThreatMappingDO threat = controlMeasure.getThreat();
		Integer threatId = threat == null ? null : threat.getId();
		checkConstraint(id, errorId, threatId, ((Number) map.get("control")).intValue());
	}
	
	@Override
	protected void beforeDelete(Collection<ControlMeasureDO> collection) {
		for (ControlMeasureDO controlMeasureDO : collection) {
			List<ActionItemDO> list = actionItemDao.getActionItemsByControlMeasure(controlMeasureDO.getId(), false);
			if (list != null && list.size() > 0) {
				SMSException e = new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "操作失败：控制措施下存在行动项");
				throw e;
			}
		}
	}
	
	@Override
	protected void afterUpdate(ControlMeasureDO controlMeasure, ControlMeasureDO dbControlMeasure) {
		// 添加活动日志
		List<String> details = new ArrayList<String>();
		ErrorMappingDO errorMapping = controlMeasure.getError();
		ThreatMappingDO threatMapping = controlMeasure.getThreat();
		TemDO tem = null;
		String detail = "";
		if (null != errorMapping) {
			errorMapping = errorMappingDao.internalGetById(errorMapping.getId());
			ErrorDO error = errorMapping.getError();
			if (null != error) {
				tem = errorMapping.getTem();
				detail = "将差错[名称:" + error.getName() + "]的控制措施:[";
			}
		} else if (null != threatMapping) {
			threatMapping = threatMappingDao.internalGetById(threatMapping.getId());
			ThreatDO threat = threatMapping.getThreat();
			if (null != threat) {
				tem = threatMapping.getTem();
				detail = "将威胁[名称:" + threat.getName() + "]的控制措施:[";
			}
		}
		if (null != tem) {
			// 控制名称
			ControlDO control = controlMeasure.getControl();
			ControlDO dbControl = dbControlMeasure.getControl();
			detail += dbControl.getTitle() + "]的";
			if (!control.getId().equals(dbControl.getId())) {
				control = controlDao.internalGetById(control.getId());
				detail += "名称修改为[" + control.getTitle() + "]";
				details.add(detail);
			}
			// 状态
			String status = controlMeasure.getStatus();
			String dbStatus = dbControlMeasure.getStatus();
			if (!status.equals(dbStatus)) {
				detail += "状态修改为[" + status + "]";
				details.add(detail);
			}
			if (!details.isEmpty()) {
				MDC.put("details", details.toArray());
				activityLoggingDao.addLogging(tem.getActivity().getId(), ActivityLoggingOperationRegister.getOperation("UPDATE_TEM"));
				MDC.remove("details");
			}
		}
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		ControlMeasureDO controlMeasure = (ControlMeasureDO) obj;
		if ("control".equals(fieldName)) {
			map.put(fieldName, controlDao.convert(controlMeasure.getControl()));
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}
	
	public List<ControlMeasureDO> getControlMeasures(Integer errorId, Integer threatId) {
		if (errorId == null && threatId == null) return null;
		StringBuilder hql = new StringBuilder("from ControlMeasureDO where deleted = ?");
		List<Object> parameters = new ArrayList<Object>();
		parameters.add(false);
		if (errorId != null) {
			hql.append(" and error.id = ?");
			parameters.add(errorId);
		}
		if (threatId != null) {
			hql.append(" and threat.id = ?");
			parameters.add(threatId);
		}
		@SuppressWarnings("unchecked")
		List<ControlMeasureDO> list = this.getHibernateTemplate().find(hql.toString(), parameters.toArray());
		return list;
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void saveControlMeasures(Integer errorId, Integer threatId, List<Map<String, Object>> controlMeasureMaps) {
		List<ControlMeasureDO> measures = this.getControlMeasures(errorId, threatId);
		Map<Integer, ControlMeasureDO> idControlMeasureMap = new HashMap<Integer, ControlMeasureDO>();
		for (ControlMeasureDO measure : measures) {
			idControlMeasureMap.put(measure.getId(), measure);
		}
		List<Integer> controlIds = new ArrayList<Integer>();
		for (Map<String, Object> controlMeasureMap : controlMeasureMaps) {
			Number id = (Number) controlMeasureMap.get("id");
			ControlMeasureDO measure;
			if (id == null) {
				measure = new ControlMeasureDO();
				if (errorId != null) {
					ErrorMappingDO error = new ErrorMappingDO();
					error.setId(errorId);
					measure.setError(error);
				} else if (threatId != null) {
					ThreatMappingDO threat = new ThreatMappingDO();
					threat.setId(threatId);
					measure.setThreat(threat);
				}
				measure.setStatus(CONTROL_MEASURE_STATUS_INCOMPLETE);
			} else {
				measure = idControlMeasureMap.remove(id.intValue());
			}
			if (measure == null) continue;
			int controlId = ((Number) controlMeasureMap.get("control")).intValue();
			if (controlIds.contains(controlId)) throw EXIST_DUPLICATE_CONTROLS;
			controlIds.add(controlId);
			ControlDO control = new ControlDO();
			control.setId(controlId);
			measure.setControl(control);
			this.internalSaveOrUpdate(measure);
		}
		this.internalMarkAsDeleted(idControlMeasureMap.values());
	}
	
	@Override
	protected void afterSave(ControlMeasureDO obj) {
		// 添加活动日志
		List<String> details = new ArrayList<String>();
		ErrorMappingDO errorMapping = obj.getError();
		ThreatMappingDO threatMapping = obj.getThreat();
		TemDO tem = null;
		ControlDO control = controlDao.internalGetById(obj.getControl().getId());
		if (null != errorMapping) {
			errorMapping = errorMappingDao.internalGetById(errorMapping.getId());
			ErrorDO error = errorMapping.getError();
			if (null != error) {
				tem = errorMapping.getTem();
				details.add("为差错[名称:" + error.getName() + "]添加了运行控制措施:[名称:" + control.getTitle() + "]");
			}
		} else if (null != threatMapping) {
			threatMapping = threatMappingDao.internalGetById(threatMapping.getId());
			ThreatDO threat = threatMapping.getThreat();
			if (null != threat) {
				tem = threatMapping.getTem();
				details.add("为威胁[名称:" + threat.getName() + "]添加了运行控制措施:[名称:" + control.getTitle() + "]");
			}
		}
		if (!details.isEmpty()) {
			MDC.put("details", details.toArray());
			activityLoggingDao.addLogging(tem.getActivity().getId(), ActivityLoggingOperationRegister.getOperation("UPDATE_TEM"));
			MDC.remove("details");
		}
	}
	
	@Override
	protected void afterDelete(Collection<ControlMeasureDO> collection) {
		super.afterDelete(collection);
		List<String> details = new ArrayList<String>();
		for (ControlMeasureDO controlMeasure : collection) {
			// 添加活动日志
			ErrorMappingDO errorMapping = controlMeasure.getError();
			ThreatMappingDO threatMapping = controlMeasure.getThreat();
			TemDO tem = null;
			ControlDO control = controlDao.internalGetById(controlMeasure.getControl().getId());
			if (null != errorMapping) {
				errorMapping = errorMappingDao.internalGetById(errorMapping.getId());
				ErrorDO error = errorMapping.getError();
				if (null != error) {
					tem = errorMapping.getTem();
					details.add("为差错[名称:" + error.getName() + "]删除了运行控制措施:[名称:" + control.getTitle() + "]");
				}
			} else if (null != threatMapping) {
				threatMapping = threatMappingDao.internalGetById(threatMapping.getId());
				ThreatDO threat = threatMapping.getThreat();
				if (null != threat) {
					tem = threatMapping.getTem();
					details.add("为威胁[名称:" + threat.getName() + "]删除了运行控制措施:[名称:" + control.getTitle() + "]");
				}
			}
			if (!details.isEmpty()) {
				MDC.put("details", details.toArray());
				activityLoggingDao.addLogging(tem.getActivity().getId(), ActivityLoggingOperationRegister.getOperation("UPDATE_TEM"));
				MDC.remove("details");
			}
		}
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void setControlMeasureStatus(int id, String status) {
		ControlMeasureDO controlMeasure = this.internalGetById(id);
		if (status.equals(controlMeasure.getStatus())) return;
		controlMeasure.setStatus(status);
		this.internalUpdate(controlMeasure);
		
		// 添加活动日志
		addActivityLoggingForSetControlMeasureStatus(controlMeasure, status);
	}
	
	/**
	 * 修改控制措施状态的活动日志
	 * 
	 * @param id
	 * @param status
	 */
	private void addActivityLoggingForSetControlMeasureStatus(ControlMeasureDO dbDontrolMeasure, String status) {
		// 添加活动日志
		List<String> details = new ArrayList<String>();
		ErrorMappingDO errorMapping = dbDontrolMeasure.getError();
		ThreatMappingDO threatMapping = dbDontrolMeasure.getThreat();
		TemDO tem = null;
		ControlDO control = controlDao.internalGetById(dbDontrolMeasure.getControl().getId());
		if (null != errorMapping) {
			errorMapping = errorMappingDao.internalGetById(errorMapping.getId());
			ErrorDO error = errorMapping.getError();
			if (null != error) {
				tem = errorMapping.getTem();
				details.add("将差错[名称:" + error.getName() + "]的控制措施:[名称:" + control.getTitle() + "]的状态修改为" + status);
			}
		} else if (null != threatMapping) {
			threatMapping = threatMappingDao.internalGetById(threatMapping.getId());
			ThreatDO threat = threatMapping.getThreat();
			if (null != threat) {
				tem = threatMapping.getTem();
				details.add("将威胁[名称:" + threat.getName() + "]的控制措施:[名称:" + control.getTitle() + "]的状态修改为" + status);
			}
		}
		if (!details.isEmpty()) {
			MDC.put("details", details.toArray());
			activityLoggingDao.addLogging(tem.getActivity().getId(), ActivityLoggingOperationRegister.getOperation("UPDATE_TEM"));
			MDC.remove("details");
		}
	}
	
	public void setActionItemDao(ActionItemDao actionItemDao) {
		this.actionItemDao = actionItemDao;
	}
	
	public void setActivityDao(ActivityDao activityDao) {
		this.activityDao = activityDao;
	}
	
	public void setActivityLoggingDao(ActivityLoggingDao activityLoggingDao) {
		this.activityLoggingDao = activityLoggingDao;
	}
	
	public void setControlDao(ControlDao controlDao) {
		this.controlDao = controlDao;
	}
	
	public void setErrorMappingDao(ErrorMappingDao errorMappingDao) {
		this.errorMappingDao = errorMappingDao;
	}
	
	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}
	
	public void setThreatMappingDao(ThreatMappingDao threatMappingDao) {
		this.threatMappingDao = threatMappingDao;
	}
	
}
