package com.usky.sms.tem;


public enum EnumActionItemOperation {
	
	EXECUTE("EXECUTE", "执行"),

	COMFIRM("COMFIRM", "验证"),
	
	AUDIT_REJECT("AUDIT_REJECT", "审核拒绝"),
	
	AUDIT_PASS("AUDIT_PASS", "审核通过"),
	
	;
	
	private String code;
	
	private String description;
	
	private EnumActionItemOperation(String code, String description) {
		this.code = code;
		this.description = description;
	}
	
	public static EnumActionItemOperation getEnumByVal(String val) {
		for (EnumActionItemOperation each : values()) {
			if (each.toString().equals(val)) {
				return each;
			}
		}
		return null;
	}
	
	public String getCode(){
		return this.code;
	}
	
	public String getDescription(){
		return this.description;
	}
	
}
