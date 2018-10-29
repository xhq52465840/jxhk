
package com.usky.sms.audit.log.operation;

public class AddPlanOperation extends AbstractAuditActivityLoggingOperation {
	
	@Override
	public String getName() {
		return "ADD_PLAN";
	}
	
	@Override
	public String getPrefix() {
		return "创建了";
	}
	
	@Override
	public String getSuffix() {
		return null;
	}
	
}
