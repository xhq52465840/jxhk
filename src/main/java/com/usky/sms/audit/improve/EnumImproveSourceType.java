package com.usky.sms.audit.improve;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.SMSException;


public enum EnumImproveSourceType {
	/**
	 * 现场检查.
	 */
	SPOT("现场检查", "SPOT", "INNER"),
	/**
	 * 专项检查.
	 */
	SPEC("专项检查", "SPEC", "INNER"),
	
	/**
	 * 局方.
	 */
	BUREAU("局方", "JFJC", "OUTER"),
	
	/**
	 * SAFA.
	 */
//	SAFA("SAFA", "SAFA", "OUTER"),
	
	/**
	 * 国际.
	 */
	INT("国际", "GJSW", "OUTER"),
	
	/**
	 * 公司.
	 */
	COMPANY("公司", "", "OUTER"),
	
	/**
	 * 其它.
	 */
	OTHER("其它", "QTSW", "OUTER");
	
	private String description;
	
	private String shortName;
	
	private String category;
	
	private EnumImproveSourceType(String description, String shortName, String category) {
		this.description = description;
		this.shortName = shortName;
		this.category = category;
	}
	
	public String getDescription(){
		return this.description;
	}
	
	public String getShortName(){
		return this.shortName;
	}
	
	public String getCategory(){
		return this.category;
	}
	
	public static EnumImproveSourceType getEnumByVal(String val) throws Exception {
		for (EnumImproveSourceType each : values()) {
            if (each.toString().equals(val)) {
                return each;
            }
        }
		throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "整改通知单来源类型[" + val + "]不存在!");
	}
	
}
