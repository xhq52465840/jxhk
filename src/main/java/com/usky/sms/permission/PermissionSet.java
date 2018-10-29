
package com.usky.sms.permission;

public class PermissionSet {
	
	private String key;
	
	private String name;
	
	private String type;
	
	private String description;
	
	public PermissionSet(String key, String name, String type, String description) {
		this.key = key;
		this.name = name;
		this.type = type;
		this.description = description;
	}
	
	public String getKey() {
		return key;
	}
	
	public void setKey(String key) {
		this.key = key;
	}
	
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public String getType() {
		return type;
	}
	
	public void setType(String type) {
		this.type = type;
	}
	
	public String getDescription() {
		return description;
	}
	
	public void setDescription(String description) {
		this.description = description;
	}
	
}
