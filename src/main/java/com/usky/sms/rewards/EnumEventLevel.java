package com.usky.sms.rewards;


public enum EnumEventLevel {

	/** 事故症候 */
	ACCIDENT("ACCIDENT", "事故症候"),
	
	/** 严重差错 */
	SEVERE_ERROR("SEVERE_ERROR", "严重差错"),
	
	;
	
	private String code;
	
	private String name;
	
	private EnumEventLevel(String code, String name) {
		this.code = code;
		this.name = name;
	}

	public String getCode() {
		return code;
	}

	public String getName() {
		return name;
	}
	
	

}
