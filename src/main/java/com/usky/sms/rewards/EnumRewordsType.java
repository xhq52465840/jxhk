package com.usky.sms.rewards;


public enum EnumRewordsType {

	/** 奖励 */
	R("奖励", "rewardType"),
	
	/** 惩罚 */
	P("惩罚", "rewardType"),
	
	;
	private String desc;

	private String category;

	private EnumRewordsType(String desc, String category) {
		this.desc = desc;
		this.category = category;
	}

	public String getDesc() {
		return desc;
	}

	public String getCategory() {
		return category;
	}

	public static EnumRewordsType getEnumByVal(String val) {
		for (EnumRewordsType each : values()) {
			if (each.toString().equals(val)) {
				return each;
			}
		}
		return null;
	}

}
