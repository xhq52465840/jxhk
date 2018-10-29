package com.usky.sms.eiosa;

public enum EiosaLogTypeEnum {
	REPORT("report","操作对象类型为report"),
	ISARP("isarp","操作对象类型为isarp"),
	ACTION("action","操作对象类型为action"),
	SECTION("section","操作对象类型为section"),
	DOCUMENT("document","操作对象类型为document");
	
	private String key;
	private String value;
	private EiosaLogTypeEnum(String key,String value){
		this.key=key;
		this.value=value;
	}
	public String getKey() {
		return key;
	}
	public void setKey(String key) {
		this.key = key;
	}
	public String getValue() {
		return value;
	}
	public void setValue(String value) {
		this.value = value;
	}
	

}
