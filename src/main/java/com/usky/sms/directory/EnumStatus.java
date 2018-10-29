package com.usky.sms.directory;

public enum EnumStatus {
	/**
	 * 未发布 ({@code 0}).
	 */
	UNRELEASE("0"), 
	
	/**
	 * 已发布 ({@code 1}).
	 */
	RELEASE("1");
	
	private String status;
	
	private EnumStatus(String status) {
		this.status = status;
	}
	
	public int getCode() {
		return Integer.parseInt(status);
	}
}
