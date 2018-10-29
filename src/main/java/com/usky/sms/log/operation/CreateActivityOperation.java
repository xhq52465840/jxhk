
package com.usky.sms.log.operation;

public class CreateActivityOperation extends AbstractActivityLoggingOperation {
	
	@Override
	public String getName() {
		return "CREATE_ACTIVITY";
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
