
package com.usky.sms.risk;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.apache.log4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.log.ActivityLoggingDao;
import com.usky.sms.log.operation.ActivityLoggingOperationRegister;
import com.usky.sms.organization.OrganizationDao;

public class RiskTaskDao extends BaseDao<RiskTaskDO> {
	
	public static final SMSException SAME_ORGANIZATION = new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "不可重复添加相同的组织！");
	
	@Autowired
	private OrganizationDao organizationDao;
	
	@Autowired
	private ActivityLoggingDao activityLoggingDao;
	
	public RiskTaskDao() {
		super(RiskTaskDO.class);
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		int activityId = ((Number) map.get("activity")).intValue();
		int organizationId = ((Number) map.get("organization")).intValue();
		@SuppressWarnings("unchecked")
		List<RiskTaskDO> list = this.getHibernateTemplate().find("from RiskTaskDO where activity.id = ? and organization.id = ?", activityId, organizationId);
		if (!list.isEmpty()) throw SAME_ORGANIZATION;
		return true;
	}
	
	@Override
	protected void afterSave(RiskTaskDO obj) {
		// 添加活动日志
		addActivityLoggingForAddRiskTask(obj);
	}
	
	@Override
	protected void afterDelete(Collection<RiskTaskDO> collection) {
		for (RiskTaskDO riskTask : collection) {
			// 添加活动日志
			addActivityLoggingForDeleteRiskTask(riskTask);
		}
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		RiskTaskDO riskTask = (RiskTaskDO) obj;
		if ("organization".equals(fieldName)) {
			map.put("organization", organizationDao.convert(riskTask.getOrganization()));
			return;
		}
		super.setField(map, obj, claz, multiple, field);
	}
	
	public List<RiskTaskDO> getAirlineInfoByActivity(int activityId) {
		@SuppressWarnings("unchecked")
		List<RiskTaskDO> list = this.getHibernateTemplate().find("from RiskTaskDO where activity.id = ?", activityId);
		return list;
	}
	
	private void addActivityLoggingForAddRiskTask(RiskTaskDO riskTask) {
		// 添加活动日志
		List<String> details = new ArrayList<String>();
		if (null != riskTask) {
			String organizatinPath = organizationDao.getFullPathOfOrganization(riskTask.getOrganization());
			details.add("任务分配给了 " + organizatinPath);
			MDC.put("details", details.toArray());
			activityLoggingDao.addLogging(riskTask.getActivity().getId(), ActivityLoggingOperationRegister.getOperation("ADD_RISK_TASK"));
			MDC.remove("details");
		}
	}
	
	/**
	 * 添加删除分配任务的活动日志
	 * 
	 * @param riskTask
	 */
	private void addActivityLoggingForDeleteRiskTask(RiskTaskDO riskTask) {
		// 添加活动日志
		if (null != riskTask) {
			List<String> details = new ArrayList<String>();
			String organizatinPath = organizationDao.getFullPathOfOrganization(riskTask.getOrganization());
			details.add("删除了分配给 " + organizatinPath + " 的任务");
			MDC.put("details", details.toArray());
			activityLoggingDao.addLogging(riskTask.getActivity().getId(), ActivityLoggingOperationRegister.getOperation("DELETE_RISK_TASK"));
			MDC.remove("details");
		}
	}
	
	public void setOrganizationDao(OrganizationDao organizationDao) {
		this.organizationDao = organizationDao;
	}
	
	public void setActivityLoggingDao(ActivityLoggingDao activityLoggingDao) {
		this.activityLoggingDao = activityLoggingDao;
	}
	
}
