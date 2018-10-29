
package com.usky.sms.log.operation;

public class AddActivityCommentOperation extends AbstractActivityLoggingOperation {
	
	@Override
	public String getName() {
		return "ACTIVITY_COMMENTED";
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
