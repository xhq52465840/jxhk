package com.usky.sms.audit.improvenotice;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.SMSException;


public enum EnumImproveNoticeStatus {
	
	/**
	 * 新建.
	 */
	NEW("新建"),

	/**
	 * 待审核.
	 */
	AUDIT_WAITING("待审核"),
	
	/**
	 * 审核拒绝.
	 */
	AUDIT_REJECTED("审核拒绝"),
	
	/**
	 * 下发.
	 */
	SENT("下发"),
	
	/**
	 * 完成.
	 */
	COMPLETED("完成");
	
	private String description;
	
	private EnumImproveNoticeStatus(String description) {
		this.description = description;
	}
	
	public String getDescription(){
		return this.description;
	}
	
	public static EnumImproveNoticeStatus getEnumByVal(String val) throws Exception {
		for (EnumImproveNoticeStatus each : values()) {
			if (each.toString().equals(val)) {
				return each;
			}
		}
		throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "整改通知单类型[" + val + "]不存在!");
	}
	
}
