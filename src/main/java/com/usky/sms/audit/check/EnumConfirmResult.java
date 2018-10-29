package com.usky.sms.audit.check;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.SMSException;

public enum EnumConfirmResult {

	/**
	 * 已验证
	 */
	COMFIRM_PASSED("已验证"),

	/**
	 * 未验证
	 */
	COMFIRM_UN_PASSED("未验证"),

	/**
	 * 验证暂时无法完成
	 */
//	COMFIRM_UN_COMPLETED_TEMPORARILY("暂时无法完成")
	
	;

	private String description;

	private EnumConfirmResult(String description) {
		this.description = description;
	}

	public String getDescription() {
		return this.description;
	}

	public static EnumConfirmResult getEnumByVal(String val)
			throws Exception {
		for (EnumConfirmResult each : values()) {
			if (each.toString().equals(val)) {
				return each;
			}
		}
		throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "验证状态[" + val + "]不存在!");
	}

}
