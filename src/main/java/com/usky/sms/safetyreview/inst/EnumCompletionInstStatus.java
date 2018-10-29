package com.usky.sms.safetyreview.inst;

public enum EnumCompletionInstStatus {
	
	/**
	 * 未完成.
	 */
	UN_COMPLETE("未完成"),
	
	/**
	 * 完成.
	 */
	COMPLETE("完成");
	
	private String name;
	
	private EnumCompletionInstStatus(String name) {
		this.name = name;
	}
	
	public String getName(){
		return this.name;
	}
	
}
