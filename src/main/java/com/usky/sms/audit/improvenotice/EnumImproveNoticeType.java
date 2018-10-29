package com.usky.sms.audit.improvenotice;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.SMSException;


public enum EnumImproveNoticeType {
	/**
	 * 公司级.
	 */
	SYS("公司级"),
	
	/**
	 * 分子公司二级.
	 */
	SUB2("分子公司二级");
	
	private String description;
	
	private EnumImproveNoticeType(String description) {
		this.description = description;
	}
	
	public String getDescription(){
		return this.description;
	}
	
	public static EnumImproveNoticeType getEnumByVal(String val) throws Exception {
		for (EnumImproveNoticeType each : values()) {
			if (each.toString().equals(val)) {
				return each;
			}
		}
		throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "整改通知单类型[" + val + "]不存在!");
	}
	
}
