package com.usky.sms.safetyreview;

public enum EnumAssessmentSourceType {
	/**
	 * 安全信息.
	 */
	A("安全信息"),
	
	/**
	 * 资料上传.
	 */
	R("资料上传"),
	
	/**
	 * 行动项.
	 */
	ACTION_ITEM("行动项"),
	/**
	 * 人工.
	 */
	O("人工")
	
	;
	
	private String description;
	
	private EnumAssessmentSourceType(String description) {
		this.description = description;
	}
	
	public String getDescription(){
		return this.description;
	}
	
}
