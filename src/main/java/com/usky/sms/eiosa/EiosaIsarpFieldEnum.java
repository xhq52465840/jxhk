package com.usky.sms.eiosa;

import com.usky.sms.core.SMSException;

public enum EiosaIsarpFieldEnum {
	STATUS("status", "流程状态"),
	ASSESSMENT("assessment", "符合性"),
    REASON("reason","reason"),
    ROOTCAUST("rootCause","rootCause"),
	TAKEN("taken","taken"),
	COMMENTS("comments","comments");
	
	private String name;
	private String comment;
	private EiosaIsarpFieldEnum(String name, String comment) {
		this.name = name;
		this.comment = comment;
		
	}


	public static EiosaIsarpFieldEnum getEnumByVal(String val) throws Exception {
		for (EiosaIsarpFieldEnum each : values()) {
            if (String.valueOf(each.getName()).equals(val.toLowerCase())) {
                return each;
            }
        }
		//throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "EiosaIsarpFieldEnum类型[" + val + "]不存在!");
		return null;
	}
	public static String getCommentByVal(String val) throws Exception {
		EiosaIsarpFieldEnum e = getEnumByVal(val);
		return e==null? null : e.getComment();
	}
	public String getComment() {
		return this.comment;
	}
	
	public String getName() {
		return this.name;
	}
}
