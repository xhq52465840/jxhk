package com.usky.sms.directory;


public enum EnumSafetyInfoType {

	/**
	 * 其他 ({@code 0}).OTHER
	 */
	OTHER("0", "其他"),

	/**
	 * 调查报告 ({@code 1}).INVESTIGATION_REPORT
	 */
	INVESTIGATION_REPORT("1", "调查报告"),

	/**
	 * 信息获取 ({@code 2}).INFORMATION_ACQUISITION
	 */
	INFORMATION_ACQUISITION("2", "信息获取"),

	/**
	 * 风险通告 ({@code 3}).RISK_ANNOUNCEMENT
	 */
	RISK_ANNOUNCEMENT("3", "风险通告"),
	
	/**
	 * 讲评记录 ({@code 4}).EVALUATION_RECORD
	 */
	EVALUATION_RECORD("4", "讲评记录"),
	
	/**
	 * 机长报告书 ({@code 5}).AIRCRAFT_COMMANDER_REPORT
	 */
	AIRCRAFT_COMMANDER_REPORT("5", "机长报告书"),
	
	/**
	 * QAR数据 ({@code 6}).QAR_DATA
	 */
	QAR_DATA("6", "QAR数据"),
	
	;

	private String code;
	
	private String name;

	private EnumSafetyInfoType(String code, String name) {
		this.code = code;
		this.name = name;
	}

	public int getCode() {
		return Integer.parseInt(code);
	}
	
	public String getName() {
		return name;
	}

	public static EnumSafetyInfoType getEnumByVal(String val) {
		for (EnumSafetyInfoType each : values()) {
			if ((each.getCode() + "").equals(val)) {
				return each;
			}
		}
		return null;
	}

}
