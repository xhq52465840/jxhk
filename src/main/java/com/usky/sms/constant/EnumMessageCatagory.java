package com.usky.sms.constant;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;


/**
 * 信息类型
 * @author Administrator
 *
 */
public enum EnumMessageCatagory {

	/** 站内通知 */
	MESSAGE("MESSAGE", "站内通知"),
	
	/** 短信 */
	SHORT_MESSAGE("SHORT_MESSAGE", "短信"),
	
	/** 电子邮件 */
	EMAIL("EMAIL", "电子邮件"),
	
	;
	
	/** 信息类型代码 */
	private String code;
	
	/** 信息类型描述 */
	private String description;
	
	private EnumMessageCatagory(String code, String description) {
		this.code = code;
		this.description = description;
	}
	
	public static EnumMessageCatagory getEnumByVal(String val) {
		for (EnumMessageCatagory each : values()) {
			if (each.toString().equals(val)) {
				return each;
			}
		}
		return null;
	}
	
	public static Collection<EnumMessageCatagory> getEnumByVals(Collection<String> vals) {
		if (vals == null || vals.isEmpty()) {
			return Collections.emptyList();
		}
		List<EnumMessageCatagory> messageCatagories = new ArrayList<>();
		for (EnumMessageCatagory each : values()) {
			if (vals.contains(each.toString())) {
				messageCatagories.add(each);
			}
		}
		return messageCatagories;
	}

	public String getCode() {
		return code;
	}

	public String getDescription() {
		return description;
	}
	
}
