package com.usky.sms.activity.type;


public enum EnumActivityType {
	/**
	 * 员工安全报告.
	 */
	EMPLOYEE_REPORT("员工安全报告"),
	
	/**
	 * 机长报告.
	 */
	AIRCRAFT_COMMANDER_REPORT("机长报告"),
	
	/**
	 * 信息报告.
	 */
	INFOMATION_REPORT("信息报告"),
	
	/**
	 * 风险管理.
	 */
	RISK_MANAGEMENT("风险管理"),
	
	/**
	 * 风险分析.
	 */
	RISK_ANALYSIS("风险分析"),
	
	/**
	 * 新开航线.
	 */
	NEW_AIRLINE("新开航线"),
	
	;

	private String description;

	private EnumActivityType(String description) {
		this.description = description;
	}

	public String getDescription() {
		return this.description;
	}

	public static EnumActivityType getEnumByVal(String val) throws Exception {
		for (EnumActivityType each : values()) {
			if (each.toString().equals(val)) {
				return each;
			}
		}
		return null;
	}

}
