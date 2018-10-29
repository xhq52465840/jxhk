package com.usky.sms.trainingrecord;


public enum EnumCertificateType {

	/** 安全负责人 */
	SR("安全负责人"),
	
	/** 安全管理人 */
	SM("安全管理人"),
	
	/** 风险管理专家 */
	RM("风险管理专家"),
	
	/** 安全信息员 */
	SI("安全信息员"),
	
	/** 安全内审员 */
	SA("安全内审员"),
	
	/** 其他 */
	OT("其他"),
	
	;
	private String desc;

	private EnumCertificateType(String desc) {
		this.desc = desc;
	}

	public String getDesc() {
		return desc;
	}

	public static EnumCertificateType getEnumByVal(String val) {
		for (EnumCertificateType each : values()) {
			if (each.toString().equals(val)) {
				return each;
			}
		}
		return null;
	}

}
