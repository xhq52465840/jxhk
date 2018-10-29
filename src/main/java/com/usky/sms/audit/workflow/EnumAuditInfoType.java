package com.usky.sms.audit.workflow;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.SMSException;


public enum EnumAuditInfoType {
	
	/** 公司级计划. */
	SYS_PLAN("公司级计划"),
	
	/** 公司级工作单. */
	SYS_TASK("公司级工作单"),
	
	/** 公司级现场检查工作单. */
	SYS_SPOT_TASK("公司级现场检查工作单"),
	
	/** 公司级专项检查工作单. */
	SYS_SPEC_TASK("公司级专项检查工作单"),
	
	/** 公司级检查单. */
	SYS_CHECK("公司级检查单"),
	
	/** 公司级现场检查检查单. */
	SYS_SPOT_CHECK("公司级现场检查检查单"),
	
	/** 公司级专项检查检查单. */
	SYS_SPEC_CHECK("公司级专项检查检查单"),
	
	/** 公司级整改单. */
	SYS_IMPROVE("公司级整改单"),
	
	/** 公司级整改通知单. */
	SYS_SUB_IMPROVE_NOTICE("公司级整改通知单"),
	
	/** 分子公司级计划. */
	SUB2_PLAN("分子公司级计划"),
	
	/** 分子公司级工作单. */
	SUB2_TASK("分子公司级工作单"),

	/** 分子公司级现场检查工作单. */
	SUB2_SPOT_TASK("分子公司级现场检查工作单"),
	
	/** 分子公司级专项检查工作单. */
	SUB2_SPEC_TASK("分子公司级专项检查工作单"),
	
	/** 分子公司级检查单. */
	SUB2_CHECK("分子公司级检查单"),

	/** 分子公司级现场检查检查单. */
	SUB2_SPOT_CHECK("分子公司级现场检查检查单"),
	
	/** 分子公司级专项检查检查单. */
	SUB2_SPEC_CHECK("分子公司级专项检查检查单"),
	
	/** 分子公司级整改单. */
	SUB2_IMPROVE("分子公司级整改单"),
	
	/** 分子公司级整改通知单. */
	SUB2_SUB_IMPROVE_NOTICE("分子公司级整改通知单"),
	
	/** 二级内审计划. */
	SUB3_PLAN("二级内审计划"),
	
	/** 二级内审工作单. */
	SUB3_TASK("二级内审工作单"),
	
	/** 二级内审检查单. */
	SUB3_CHECK("二级内审检查单"),
	
	/** 二级内审整改单. */
	SUB3_IMPROVE("二级内审整改单"),
	
	/** 航站计划. */
	TERM_PLAN("航站计划"),
	
	/** 航站工作单. */
	TERM_TASK("航站工作单"),
	
	/** 航站检查单. */
	TERM_CHECK("航站检查单"),
	
	/** 航站整改单. */
	TERM_IMPROVE("航站整改单"),
	
	;
	
	private String name;
	
	private EnumAuditInfoType(String name) {
		this.name = name;
	}
	
	public String getName(){
		return this.name;
	}
	
	public static EnumAuditInfoType getEnumByVal(String val) throws Exception {
		for (EnumAuditInfoType each : values()) {
			if (each.toString().equals(val)) {
				return each;
			}
		}
		throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "审计信息类型[" + val + "]不存在!");
	}
}
