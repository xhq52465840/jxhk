package com.usky.sms.safetyreview;

public enum EnumMethanolStatus {
	/**
	 * 新建.
	 */
	NEW("新建"),
	
	/**
	 * 待审核.
	 */
	WAITING("待审核"),
	
	/**
	 * 完成.
	 */
	COMPLETE("完成"),
	
	/**
	 * 关闭.
	 */
	CLOSED("关闭");
	
	private String name;
	
	private EnumMethanolStatus(String name) {
		this.name = name;
	}
	
	public String getName(){
		return this.name;
	}
	
}
