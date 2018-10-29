package com.usky.sms.audit.improve;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.SMSException;

/**
 * 记录整改通知单日志的类型
 * @author zheng.xl
 *
 */
public enum EnumImproveNoticeLogType {
	/**
	 * 整改原因和措施.
	 */
	MESASURE_REASEON("记录整改原因和措施"),
	
	/**
	 * 记录处理人的操作行为.
	 */
	OPERATION("记录处理人的操作行为"),
	
	/**
	 * 其它.
	 */
	OTHER("其它");
	
	private String description;
	
	private EnumImproveNoticeLogType(String description) {
		this.description = description;
	}
	
	public String getDescription(){
		return this.description;
	}
	
	public static EnumImproveNoticeLogType getEnumByVal(String val) throws Exception {
		for (EnumImproveNoticeLogType each : values()) {
            if (each.toString().equals(val)) {
                return each;
            }
        }
		throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "整改通知单日志类型[" + val + "]不存在!");
	}
	
}
