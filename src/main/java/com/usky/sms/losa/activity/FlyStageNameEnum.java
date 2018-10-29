package com.usky.sms.losa.activity;


public enum FlyStageNameEnum {
	
	DEPARTURE("departure","离场前/滑出"),
	TAKEOFF("takeOff","起飞/爬升"),
	CRUISE("cruise","巡航"),
	TECHWORKSHEET("techWorkSheet","着陆技术工作单"),
	LAUNCH("launch","下降/进近/着陆"),
	WHOLEFLIGHT("wholeFlight","整个飞行"),
	BASEINFO("baseInfo","基础信息"),
	THREAT("threat","威胁列表"),
	ERROR("error","差错列表"),
	CREWINTERVIEW("crewInterview","机组访谈"),
	//移动端的新增字段类型
	INSERTJSONOBSERVE("newObserve","新增观察活动的评分信息"),
	INSERTJSONTHREAT("newThreat","新增威胁"),
	INSERTJSONOERROR("newError","新增差错"),
	INSERTJSONOCREW("newCrew","新增机组访谈"),
	INSERTJSONATTACH("newAttach","新增附件");
	
	private String key;
	private String value;
	
	private FlyStageNameEnum(String key,String value){
		this.key=key;
		this.value=value;
	}
	public static FlyStageNameEnum getEnumByVal(String val)throws Exception {
		for (FlyStageNameEnum each : values()) {
            if (String.valueOf(each.getKey()).equals(val)) {
                return each;
            }
        }
		
		return null;
	}
	
	public static String getValueByVal(String val) throws Exception {
		FlyStageNameEnum e = getEnumByVal(val);
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
