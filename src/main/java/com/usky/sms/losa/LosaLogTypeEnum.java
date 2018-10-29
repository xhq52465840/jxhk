package com.usky.sms.losa;

public enum LosaLogTypeEnum {
	SCHEME("scheme","操作对象类型为scheme"),
	PLAN("plan","操作对象类型为plan");	
	
	private String key;
	private String value;
	private LosaLogTypeEnum(String key,String value){
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
