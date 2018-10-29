package com.usky.sms.losa.plan;

public enum PlanFieldEnum {	
	UPDATEPLAN("updatePlan","新增审计计划"),	
	DELETEPLAN("deletePlab","删除审计计划"),
	RELEASEPLAN("releasePlan","发布审计计划"),
	UPDATEPLANSCHEME("schemeId","所属方案"),
	UPDATEFLIGHT("flightId","观察航班 "),
	UPDATEOBSERVERID("observerId","观察人员"),
	UPDATEOBSERVEDATE("observeDate","观察日期"),
	UPDATEDESCRIPTION("planDescription","计划描述");
	
	
	private String key;
	private String value;
	
	private PlanFieldEnum(String key,String value){
		this.key=key;
		this.value=value;
	}
	public static PlanFieldEnum getEnumByVal(String val)throws Exception {
		for (PlanFieldEnum each : values()) {
            if (String.valueOf(each.getKey()).equals(val.toLowerCase())) {
                return each;
            }
        }
		
		return null;
	}
	
	public static String getValueByVal(String val) throws Exception {
		PlanFieldEnum e = getEnumByVal(val);
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
