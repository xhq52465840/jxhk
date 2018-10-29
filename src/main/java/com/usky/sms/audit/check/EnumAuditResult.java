package com.usky.sms.audit.check;


/**
 * 审计结果的枚举
 * @author zheng.xl
 *
 */
public enum EnumAuditResult {
	符合项,
	
	建议项,
	
	有文无实,
	
	无文无实,
	
	有实无文,
	
	不适用;
}
