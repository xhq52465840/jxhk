
package com.usky.sms.user;

public enum UserType {
	
	REPORTER("报告人"), //报告人
	PROCESSOR("处理人"), //处理人
	UNIT_RESPONSIBLE_USER("机构负责人"), //机构负责人
	USER("单一用户"), //单一用户
	USER_GROUP("用户组"), //用户组
	ROLE("角色"), //角色
	CUSTOM_USER_FIELD("自定义用户字段"), //自定义用户字段
	CUSTOM_USER_GROUP_FIELD("自定义用户组字段"), //自定义用户组字段
	;
	
	private String name;
	
	UserType(String name) {
		this.name = name;
	}
	
	public String getName() {
		return name;
	}
	
}
