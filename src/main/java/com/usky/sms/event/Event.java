
package com.usky.sms.event;

public class Event {
	
	private String name;
	
	private String description;
	
	private String code;
	
	private String template;
	
	private String type;
	
	public Event(String name, String description, String code, String template, String type) {
		this.name = name;
		this.description = description;
		this.code = code;
		this.template = template;
		this.type = type;
	}
	
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	public String getDescription() {
		return description;
	}
	
	public void setDescription(String description) {
		this.description = description;
	}
	
	public String getCode() {
		return code;
	}
	
	public void setCode(String code) {
		this.code = code;
	}
	
	public String getTemplate() {
		return template;
	}
	
	public void setTemplate(String template) {
		this.template = template;
	}
	
	public String getType() {
		return type;
	}
	
	public void setType(String type) {
		this.type = type;
	}
	
}
