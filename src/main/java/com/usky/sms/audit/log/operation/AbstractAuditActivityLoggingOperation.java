
package com.usky.sms.audit.log.operation;

import java.util.List;

import org.apache.log4j.MDC;

import com.usky.sms.audit.action.AuditActionDO;
import com.usky.sms.audit.action.AuditActionDao;
import com.usky.sms.utils.SpringBeanUtils;

/**
 * 显示活动日志的基类
 * @author 郑小龙
 *
 */
public abstract class AbstractAuditActivityLoggingOperation {
	
	/**
	 * 
	 * @return 活动日志的名称
	 */
	public abstract String getName();
	
	/**
	 * 
	 * @return 活动日志的前缀
	 */
	public abstract String getPrefix();
	
	/**
	 * 
	 * @return 活动日志的后缀
	 */
	public abstract String getSuffix();
	
	public String getData() {
		Object actionId = MDC.get("auditActionId");
		if (actionId == null) return null;
		return MDC.get("auditActionId").toString();
	}
	
	/**
	 * 
	 * @param data 方法getData的返回值
	 * @return 备注信息
	 */
	public String getRemark(String data) {
		if (data == null) return null;
		int auditActionId = Integer.parseInt(data);
		AuditActionDao auditActionDao = (AuditActionDao) SpringBeanUtils.getBean("auditActionDao");
		AuditActionDO action = auditActionDao.internalGetById(auditActionId);
		return action.getBody();
	}
	
	/**
	 * 
	 * @param data 方法getData的返回值
	 * @return 活动日志的详细信息
	 */
	public List<Object> getDetails(String data) {
		return null;
	}
	
}
