
package com.usky.sms.activity;

public enum ActivityOperation {
	
	CREATE("创建安全信息"), MODIFY("编辑安全信息"), VIEW("查看安全信息");
	
	private String name;
	
	ActivityOperation(String name) {
		this.name = name;
	}
	
	public String getName() {
		return name;
	}
	
}
