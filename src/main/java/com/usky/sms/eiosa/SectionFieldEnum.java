package com.usky.sms.eiosa;

public enum SectionFieldEnum {	
	UPDATEAUDITOR("chiefAuditor","审计组联络人"),
	STARTDATE("startDate","开始日期"),
	ENDDATE("endDate","结束日期");
	
	
	private String key;
	private String value;
	
	private SectionFieldEnum(String key,String value){
		this.key=key;
		this.value=value;
	}
	public static SectionFieldEnum getEnumByVal(String val)throws Exception {
		for (SectionFieldEnum each : values()) {
            if (String.valueOf(each.getKey()).equals(val.toLowerCase())) {
                return each;
            }
        }
		
		return null;
	}
	
	public static String getValueByVal(String val) throws Exception {
		SectionFieldEnum e = getEnumByVal(val);
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
