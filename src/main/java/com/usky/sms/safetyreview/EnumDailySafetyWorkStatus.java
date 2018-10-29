package com.usky.sms.safetyreview;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.SMSException;

public enum EnumDailySafetyWorkStatus {
	/**
	 * 已发布.
	 */
	RELEASE("已发布"),
	
	/**
	 * UN_RELEASE.
	 */
	UN_RELEASE("未发布");
	
	private String description;
	
	private EnumDailySafetyWorkStatus(String description) {
		this.description = description;
	}
	
	public String getDescription(){
		return this.description;
	}
	
	 /**
     * 通过枚举<code>status</code>获得枚举。
     *
     * @param status 状态
     * @return           状态枚举
     */
    public static EnumDailySafetyWorkStatus getByStatus(String status) {
        for (EnumDailySafetyWorkStatus each : values()) {
            if (each.toString().equals(status)) {
                return each;
            }
        }
        throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT,"日常安全工作的状态[" + status + "]不存在！");
    }
}
