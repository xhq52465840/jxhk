
package com.usky.sms.audit.log.operation;

public class AddAuditCommentOperation extends AbstractAuditActivityLoggingOperation {
	
	@Override
	public String getName() {
		return "AUDIT_COMMENTED";
	}
	
	@Override
	public String getPrefix() {
		return "为";
	}
	
	@Override
	public String getSuffix() {
		return "添加了备注";
	}
	
}
