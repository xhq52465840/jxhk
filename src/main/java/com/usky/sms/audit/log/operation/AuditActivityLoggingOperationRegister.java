
package com.usky.sms.audit.log.operation;

import java.util.HashMap;
import java.util.Map;

import org.apache.log4j.Logger;

public class AuditActivityLoggingOperationRegister {
	
	private static final Logger log = Logger.getLogger(AuditActivityLoggingOperationRegister.class);
	
	private static Map<String, AbstractAuditActivityLoggingOperation> operationMap = new HashMap<String, AbstractAuditActivityLoggingOperation>();
	
	static {
		// 添加备注
		registerOperation(AddAuditCommentOperation.class);
		// 添加审计计划
		registerOperation(AddPlanOperation.class);
		// 添加工作单
		registerOperation(AddTaskOperation.class);
		// 删除工作单
		registerOperation(DeleteTaskOperation.class);
		// 更新工作单
		registerOperation(UpdateTaskOperation.class);
		// 添加检查单
		registerOperation(AddCheckOperation.class);
		// 更新检查单
		registerOperation(UpdateCheckOperation.class);
		// 添加整改单
		registerOperation(AddImproveOperation.class);
		// 更新整改单
		registerOperation(UpdateImproveOperation.class);
		// 更新整改单问题列表
		registerOperation(UpdateCheckListOperation.class);
		// 添加整改通知单
		registerOperation(AddImproveNoticeOperation.class);
		// 更新整改通知单
		registerOperation(UpdateImproveNoticeOperation.class);
		// 添加整改通知单问题列表
		registerOperation(AddImproveNoticeIssueOperation.class);
		// 更新整改通知单问题列表
		registerOperation(UpdateImproveNoticeIssueOperation.class);
		// 更新整改通知单子单
		registerOperation(UpdateSubImproveNoticeOperation.class);
	}
	
	public static void registerOperation(Class<? extends AbstractAuditActivityLoggingOperation> operationClass) {
		try {
			AbstractAuditActivityLoggingOperation operation = operationClass.getConstructor().newInstance();
			operationMap.put(operation.getName(), operation);
		} catch (Exception e) {
			log.warn("IAuditActivityLoggingOperation[" + operationClass.getName() + "] registration failed!");
			e.printStackTrace();
		}
	}
	
	public static AbstractAuditActivityLoggingOperation getOperation(String name) {
		return operationMap.get(name);
	}
	
}
