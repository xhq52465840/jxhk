package com.usky.sms.audit;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.SMSException;


public enum EnumAuditRole {

	/**
	 * A审计领导组.
	 */
	AUDIT_LEADER_GROUP("A审计领导组", "A"),
	
	/**
	 * A1.1一级审计经理组.
	 */
	FIRST_GRADE_AUDIT_MANAGER_GROUP("A1.1一级审计经理组", "A1.1"),
	
	/**
	 * A2.1二级审计经理.
	 */
	SECOND_GRADE_AUDIT_MANAGER("A2.1二级审计经理", "A2.1"),
	
	/**
	 * A2.0审计领导角色.
	 */
	AUDIT_LEADER_ROLE("A2.0审计领导", "A2.0"),
	
	/**
	 * A3.1三级审计经理.
	 */
	THIRD_GRADE_AUDIT_MANAGER("A3.1三级审计经理", "A3.1"),
	
	/**
	 * A1.2一级审计主管组.
	 */
	FIRST_GRADE_AUDIT_MASTER_GROUP("A1.2一级审计主管组", "A1.2"),
	
	/**
	 * A2.2二级审计主管.
	 */
	SECOND_GRADE_AUDIT_MASTER("A2.2二级审计主管", "A2.2"),

	/**
	 * A3.2三级审计主管.
	 */
	THIRD_GRADE_AUDIT_MASTER("A3.2三级审计主管", "A3.2"),
	
	/**
	 * A4.2四级审计主管.
	 */
	FOURTH_GRADE_AUDIT_MASTER("A4.2四级审计主管", "A4.2"),

	/**
	 * A1一级审计员组.
	 */
	FIRST_GRADE_AUDITOR_GROUP("A1一级审计员组", "A1"),

	/**
	 * A2二级审计员.
	 */
	SECOND_GRADE_AUDITOR("A2二级审计员", "A2"),

	/**
	 * A3三级审计员.
	 */
	THIRD_GRADE_AUDITOR("A3三级审计员", "A3"),
	
	/**
	 * AC1.1一级检查经理组.
	 */
	FIRST_GRADE_CHECK_MANAGER_GROUP("AC1.1一级检查经理组", "AC1.1"),

	/**
	 * AC2.1二级检查经理.
	 */
	SECOND_GRADE_CHECK_MANAGER("AC2.1二级检查经理", "AC2.1"),
	
	/**
	 * AC3.1三级检查经理.
	 */
	THIRD_GRADE_CHECK_MANAGER("AC3.1三级检查经理", "AC3.1"),

	/**
	 * AC1.2一级检查主管组.
	 */
	FIRST_GRADE_CHECK_MASTER_GROUP("AC1.2一级检查主管组", "AC1.2"),

	/**
	 * AC2.2二级检查主管.
	 */
	SECOND_GRADE_CHECK_MASTER("AC2.2二级检查主管", "AC2.2"),

	/**
	 * AC3.2三级检查主管.
	 */
	THIRD_GRADE_CHECK_MASTER("AC3.2三级检查主管", "AC3.2"),
	
	/**
	 * AC1一级检查员组.
	 */
	FIRST_GRADE_CHECKER("AC1一级检查员组", "AC1"),
	
	/**
	 * AC2二级检查员.
	 */
	SECOND_GRADE_CHECKER("AC2二级检查员", "AC2"),
	
	/**
	 * EIOSA审计员.
	 */
	EIOSA_AUDITOR("EIOSA审计员","E1"),
	
	/**
	 * EIOSA审计主管.
	 */
	EIOSA_MANAGER("EIOSA审计主管","E2"),
	
	/**
	 * EIOSA审计管理员.
	 */
	EIOSA_ADMIN("EIOSA审计管理员","E3");
	
	private String name;
	
	private String key;
	
	private EnumAuditRole(String name, String key) {
		this.name = name;
		this.key = key;
	}
	
	public String getName(){
		return this.name;
	}
	
	public String getKey(){
		return this.key;
	}
	
	public static EnumAuditRole getEnumByVal(String val) throws Exception {
		for (EnumAuditRole each : values()) {
			if (each.toString().equals(val)) {
				return each;
			}
		}
		throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "角色[" + val + "]不存在!");
	}
	
}
