
package com.usky.sms.search.template;

public class SearchTemplate {
	
	private String name;
	
	private String key;
	
	public SearchTemplate(String key, String name) {
		this.key = key;
		this.name = name;
	}
	
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public String getKey() {
		return key;
	}
	
	public void setKey(String key) {
		this.key = key;
	}
	
}
