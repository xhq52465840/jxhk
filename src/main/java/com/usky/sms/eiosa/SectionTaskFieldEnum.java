package com.usky.sms.eiosa;

public enum SectionTaskFieldEnum {
	
	ADDDEALER("addSectionDealer","添加协调人"),
	UPDATEDEALER("updateSectionDealer","变更协调人为");
	
	private String key;
	private String value;
	
	private SectionTaskFieldEnum(String key,String value){
		this.key=key;
		this.value=value;
	}
	public static SectionTaskFieldEnum getEnumByVal(String val)throws Exception {
		for (SectionTaskFieldEnum each : values()) {
            if (String.valueOf(each.getKey()).equals(val.toLowerCase())) {
                return each;
            }
        }
		
		return null;
	}
	
	public static String getValueByVal(String val) throws Exception {
		SectionTaskFieldEnum e = getEnumByVal(val);
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
