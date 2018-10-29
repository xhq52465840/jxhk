
package com.usky.sms.log.operation;

import java.util.HashMap;
import java.util.Map;

import org.apache.log4j.Logger;

public class ActivityLoggingOperationRegister {
	
	private static final Logger log = Logger.getLogger(ActivityLoggingOperationRegister.class);
	
	private static Map<String, AbstractActivityLoggingOperation> operationMap = new HashMap<String, AbstractActivityLoggingOperation>();
	
	static {
		registerOperation(CreateActivityOperation.class);
		//		registerOperation(EditActivityOperation.class);
		registerOperation(UpdateSafeInfoOperation.class);
		registerOperation(AddActivityCommentOperation.class);
		registerOperation(UploadSafetyinformationAttachmentOperation.class);
		registerOperation(DeleteSafetyinformationAttachmentOperation.class);
		registerOperation(AddAccessInfoOccurrenceTimeOperation.class);
		registerOperation(UpdateAccessInfoOccurrenceTimeOperation.class);
		registerOperation(UpdateAccessInfoOperation.class);
		registerOperation(AddTemOperation.class);
		registerOperation(UpdateTemOperation.class);
		registerOperation(AddUserWatchOperation.class);
		registerOperation(DeleteUserWatchOperation.class);
		// 新增航线
		registerOperation(AddAirlineOperation.class);
		// 更新航线
		registerOperation(UpdateAirlineOperation.class);
		// 分配任务
		registerOperation(AddRiskTaskOperation.class);
		// 删除分配任务
		registerOperation(DeleteRiskTaskOperation.class);
		// 发布任务
		registerOperation(PublishRiskTaskOperation.class);
		// 协助处理
		registerOperation(AddAssistOperation.class);
		// 新增事件分析
		registerOperation(AddEventAnalysisOperation.class);
		// 更新事件分析
		registerOperation(UpdateEventAnalysisOperation.class);
		// 删除事件分析
		registerOperation(DeleteEventAnalysisOperation.class);
	}
	
	public static void registerOperation(Class<? extends AbstractActivityLoggingOperation> operationClass) {
		try {
			AbstractActivityLoggingOperation operation = operationClass.getConstructor().newInstance();
			operationMap.put(operation.getName(), operation);
		} catch (Exception e) {
			log.warn("IActivityLoggingOperation[" + operationClass.getName() + "] registration failed!");
			e.printStackTrace();
		}
	}
	
	public static AbstractActivityLoggingOperation getOperation(String name) {
		return operationMap.get(name);
	}
	
}
