package com.usky.sms.audit.improvenotice;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.SMSException;

public enum EnumImproveNoticeIssueTraceStatus {

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

	private EnumImproveNoticeIssueTraceStatus(String description) {
		this.description = description;
	}

	public String getDescription() {
		return this.description;
	}

	public static EnumImproveNoticeIssueTraceStatus getEnumByVal(String val)
			throws Exception {
		for (EnumImproveNoticeIssueTraceStatus each : values()) {
			if (each.toString().equals(val)) {
				return each;
			}
		}
		throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "跟踪单状态[" + val + "]不存在!");
	}

}
