package com.usky.sms.audit.plan;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.SMSException;

/**
 * 检查的级别
 *
 */
public enum EnumCheckGrade {
	/**
	 * 公司级.
	 */
	SYS("公司级"),
	
	/**
	 * 分子公司二级.
	 */
	SUB2("分子公司二级");
	
	private String description;
	
	private EnumCheckGrade(String description) {
		this.description = description;
	}
	
	public String getDescription(){
		return this.description;
	}
	
	public static EnumCheckGrade getEnumByVal(String val) throws Exception {
		for (EnumCheckGrade each : values()) {
            if (each.toString().equals(val)) {
                return each;
            }
        }
		throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "检查的级别[" + val + "]不存在!");
	}
	
}
