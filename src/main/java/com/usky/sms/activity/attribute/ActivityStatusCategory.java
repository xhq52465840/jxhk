
package com.usky.sms.activity.attribute;

public enum ActivityStatusCategory {
	
	NEW("新建"), COMPLETE("完成"), IN_PROGRESS("进行中");
	
	private String name;
	
	ActivityStatusCategory(String name) {
		this.name = name;
	}
	
	public String getName() {
		return name;
	}
	
}
