
package com.usky.sms.log.operation;

/**
 * 添加关注的活动日志
 * @author 郑小龙
 *
 */
public class AddUserWatchOperation extends AbstractActivityLoggingOperation {
	
	@Override
	public String getName() {
		return "ADD_UER_WATCH";
	}
	
	@Override
	public String getPrefix() {
		return "关注了";
	}
	
	@Override
	public String getSuffix() {
		return "";
	}

}
