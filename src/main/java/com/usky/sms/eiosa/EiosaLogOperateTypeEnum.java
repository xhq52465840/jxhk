package com.usky.sms.eiosa;

public enum EiosaLogOperateTypeEnum {
	COMFORMITY("comformity","操作类型为comformity"),
	MESSAGE("message","操作类型为message"),
	DOCUMENT("document","操作类型为document"),
	ACTION("action","操作类型为action"),
	REAUDIT("reaudit","操作类型为reaudit"),
	SUBMIT("submit","操作类型为submit"),
	AUDIT("audit","操作类型为audit"),
	SECTION("section","操作类型为section"),
	CHANGEDEALER("changeDealer","变更协调人");
	private String key;
	private String value;
	private EiosaLogOperateTypeEnum(String key,String value){
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
