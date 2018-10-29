
package com.usky.sms.audit.log.operation;

public class AddImproveNoticeOperation extends AbstractAuditActivityLoggingOperation {
	
	@Override
	public String getName() {
		return "ADD_IMPROVE_NOTICE";
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
