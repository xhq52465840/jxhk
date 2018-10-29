package com.usky.sms.losa.scheme;

public enum SchemeFieldEnum {	
	UPDATESCHEME("updateScheme","新增审计方案"),	
	DELETESCHEME("deleteScheme","删除审计方案"),
	RELEASESCHEME("releaseScheme","发布审计方案"),
	UPDATESCHEMENO("updateSchemeNo","方案编号"),
	UPDATESCHEMETYPE("schemeType","方案类型 "),
	UPDATEIMPLEUNIT("impleUnitId","实施单位"),
	UPDATEUNIT("updateUnit","被实施单位"),
	UPDATESTARTDATE("startDate","开始时间"),
	UPDATEENDDATE("endDate","结束时间"),
	UPDATEAUDITOR("updateAuditor","方案审计员"),
	UPDATESCHEMEDESC("schemeDesc","方案描述");
	
	
	private String key;
	private String value;
	
	private SchemeFieldEnum(String key,String value){
		this.key=key;
		this.value=value;
	}
	public static SchemeFieldEnum getEnumByVal(String val)throws Exception {
		for (SchemeFieldEnum each : values()) {
            if (String.valueOf(each.getKey()).equals(val.toLowerCase())) {
                return each;
            }
        }
		
		return null;
	}
	
	public static String getValueByVal(String val) throws Exception {
		SchemeFieldEnum e = getEnumByVal(val);
		return e==null? null : e.getValue();
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
