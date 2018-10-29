
package com.usky.sms.log.operation;

import java.util.List;

import org.apache.log4j.MDC;

import com.usky.sms.activity.action.ActionDO;
import com.usky.sms.activity.action.ActionDao;
import com.usky.sms.utils.SpringBeanUtils;

/**
 * 显示活动日志的基类
 * @author 郑小龙
 *
 */
public abstract class AbstractActivityLoggingOperation {
	
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
		Object actionId = MDC.get("actionId");
		if (actionId == null) return null;
		return MDC.get("actionId").toString();
	}
	
	/**
	 * 
	 * @param data 方法getData的返回值
	 * @return 备注信息
	 */
	public String getRemark(String data) {
		if (data == null) return null;
		int actionId = Integer.parseInt(data);
		ActionDao actionDao = (ActionDao) SpringBeanUtils.getBean("actionDao");
		ActionDO action = actionDao.internalGetById(actionId);
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
