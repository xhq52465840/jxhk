package com.usky.sms.trainingrecord;


public enum EnumTrainingType {

	/** 内训 */
	IT("内训"),
	
	/** 外训 */
	OT("外训"),
	
	;
	private String desc;

	private EnumTrainingType(String desc) {
		this.desc = desc;
	}

	public String getDesc() {
		return desc;
	}

	public static EnumTrainingType getEnumByVal(String val) {
		for (EnumTrainingType each : values()) {
			if (each.toString().equals(val)) {
				return each;
			}
		}
		return null;
	}

}
