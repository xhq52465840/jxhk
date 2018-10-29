
package com.usky.sms.log.operation;

/**
 * 取消关注的活动日志
 * @author 郑小龙
 *
 */
public class DeleteUserWatchOperation extends AbstractActivityLoggingOperation {
	
	@Override
	public String getName() {
		return "DELETE_UER_WATCH";
	}
	
	@Override
	public String getPrefix() {
		return "取消了对";
	}
	
	@Override
	public String getSuffix() {
		return "的关注";
	}

}
