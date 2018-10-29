package com.usky.sms.audit.improvenotice;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.SMSException;


public enum EnumImproveNoticeIssueStatus {
	/**
	 * 审核通过.
	 */
	AUDIT_PASSED("审核通过"),
	
	/**
	 * 审核拒绝.
	 */
	AUDIT_REJECTED("审核拒绝"),
	
	/**
	 * 审核暂时无法完成
	 */
	AUDIT_UN_COMPLETED_TEMPORARILY("暂时无法完成"),
	
	/**
	 * 完成情况
	 */
//	COMPLETION("完成情况"),

	/**
	 * 整改完成
	 */
	COMPLETED("整改完成"),
	
	;
	
	private String description;
	
	private EnumImproveNoticeIssueStatus(String description) {
		this.description = description;
	}
	
	public String getDescription(){
		return this.description;
	}
	
	public static EnumImproveNoticeIssueStatus getEnumByVal(String val) throws Exception {
		for (EnumImproveNoticeIssueStatus each : values()) {
            if (each.toString().equals(val)) {
                return each;
            }
        }
		throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "整改通知单状态[" + val + "]不存在!");
	}
	
}
