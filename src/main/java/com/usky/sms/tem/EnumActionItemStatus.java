package com.usky.sms.tem;


public enum EnumActionItemStatus {

	DRAFT("DRAFT", "草稿"),
	
	COMFIRM_WAITING("COMFIRM_WAITING", "待验证"),
	
	AUDIT_WAITING("AUDIT_WAITING", "待审核"),
	
	COMFIRM_COMPLETED("COMFIRM_COMPLETED", "验证完成"),
	
	;
	
	private String code;
	
	private String description;
	
	private EnumActionItemStatus(String code, String description) {
		this.code = code;
		this.description = description;
	}
	
	public static EnumActionItemStatus getEnumByVal(String val) {
		for (EnumActionItemStatus each : values()) {
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
