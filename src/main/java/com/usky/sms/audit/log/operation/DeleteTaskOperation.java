
package com.usky.sms.audit.log.operation;

public class DeleteTaskOperation extends AbstractAuditActivityLoggingOperation {
	
	@Override
	public String getName() {
		return "DELETE_TASK";
	}
	
	@Override
	public String getPrefix() {
		return "删除了";
	}
	
	@Override
	public String getSuffix() {
		return null;
	}
	
}
