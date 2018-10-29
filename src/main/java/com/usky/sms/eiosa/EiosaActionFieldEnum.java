package com.usky.sms.eiosa;

public enum EiosaActionFieldEnum {
	STATUS("status", "AA状态"),
	RECORD("reports","record"),
	AUDITDATE("auditDate","审计日期"),
	ADDAUDITOR("addAuditors","添加审计员"),
	DELAUDITOR("deleteAuditor","删除审计员");
	
	
	private String key;
	private String value;
	
	private EiosaActionFieldEnum(String key,String value){
		this.key=key;
		this.value=value;
	}
	public static EiosaActionFieldEnum getEnumByVal(String val)throws Exception {
		for (EiosaActionFieldEnum each : values()) {
            if (String.valueOf(each.getKey()).equals(val.toLowerCase())) {
                return each;
            }
        }
		//throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "EiosaIsarpFieldEnum类型[" + val + "]不存在!");
		return null;
	}
	public static String getValueByVal(String val) throws Exception {
		EiosaActionFieldEnum e = getEnumByVal(val);
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
