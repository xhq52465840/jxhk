package com.usky.sms.audit.check;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.SMSException;

public enum EnumTraceItemStatus {
	
	待验证("0"),
	
	完成验证("1"),

	未按时完成验证("2"),

	暂时无法完成("3"),
	
	完成情况("4"),
	
	整改完成("5"),
	
	已指派("6"),
	
	通过("7");

	private String status;

	private EnumTraceItemStatus(String status) {
		this.status = status;
	}

	public String getCode() {
		return status;
	}

	public static EnumTraceItemStatus getEnumByVal(String val)
			throws Exception {
		for (EnumTraceItemStatus each : values()) {
			if (each.toString().equals(val)) {
				return each;
			}
		}
		throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "跟踪单状态[" + val + "]不存在!");
	}

	public static EnumTraceItemStatus getEnumByCode(String code)
			throws Exception {
		for (EnumTraceItemStatus each : values()) {
			if (each.getCode().equals(code)) {
				return each;
			}
		}
		throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "跟踪单状态[" + code + "]不存在!");
	}

}
