package com.usky.sms.audit.plan;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.SMSException;


public enum EnumPlanType {
	/**
	 * 公司级.
	 */
	SYS("公司级", "audit"),
	
	/**
	 * 分子公司二级.
	 */
	SUB2("分子公司二级", "audit"),
	
	/**
	 * 部门三级.
	 */
	SUB3("部门三级", "audit"),
	
	/**
	 * 航站审计.
	 */
	TERM("航站审计", "term"),
	
	/**
	 * 现场检查.
	 */
	SPOT("现场检查", "check"),
	
	/**
	 * 专项检查.
	 */
	SPEC("专项检查", "check");
	
	private String description;
	
	private String category;
	
	private EnumPlanType(String description, String category) {
		this.description = description;
		this.category = category;
	}
	
	public String getDescription(){
		return this.description;
	}
	
	public String getCategory(){
		return this.category;
	}
	
	public static EnumPlanType getEnumByVal(String val) throws Exception {
		for (EnumPlanType each : values()) {
            if (each.toString().equals(val)) {
                return each;
            }
        }
		throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "审计计划类型[" + val + "]不存在!");
	}
	
}
