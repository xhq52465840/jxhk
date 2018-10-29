package com.usky.sms.directory;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.SMSException;

public enum EnumDirectoryType {
	/**
	 * 自定义上传 ({@code 1}).
	 */
	CUSTOM("1", "CUSTOM", "自定义"),

	/**
	 * 安全评审上传 ({@code 2}).
	 */
	SAFETYREVIEW("2", "SAFETYREVIEW", "安全评审"),

	/**
	 * 安全信息上传 ({@code 3}).
	 */
	SAFETYINFORMATION("3", "SAFETYINFORMATION", "安全信息");

	private String directoryType;
	private String name;
	private String comment;

	private EnumDirectoryType(String directoryType, String name, String comment) {
		this.directoryType = directoryType;
		this.name = name;
		this.comment = comment;
	}
	
	public int getCode() {
		return Integer.parseInt(directoryType);
	}
	
	public static EnumDirectoryType getEnumByVal(String val) throws Exception {
		for (EnumDirectoryType each : values()) {
            if (String.valueOf(each.getCode()).equals(val)) {
                return each;
            }
        }
		throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "目录类型[" + val + "]不存在!");
	}

	/** 将枚举转化成对应的中文含义 */
	public String toComment() {
		return this.comment;
	}
	
	public String getName() {
		return this.name;
	}
}
