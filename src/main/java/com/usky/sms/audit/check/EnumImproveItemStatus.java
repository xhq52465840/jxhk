package com.usky.sms.audit.check;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.SMSException;

/**
 * 整改项的状态
 * @author zheng.xl
 *
 */
public enum EnumImproveItemStatus {
	/**
	 * 整改反馈({@code 0}).
	 */
	整改反馈("0"),
	
	/**
	 * 整改转发({@code 1}).
	 */
	整改转发("1"),
	
	/**
	 * 措施制定({@code 2}).
	 */
	措施制定("2"),
	
	/**
	 * 预案上报({@code 3}).
	 */
	预案上报("3"),
	
	/**
	 * 预案通过({@code 4}).
	 */
	预案通过("4"),
	
	/**
	 * 预案拒绝({@code 5}).
	 */
	预案拒绝("5"),
	
	/**
	 * 暂时无法完成({@code 6}).
	 */
	暂时无法完成("6"),
	
	/**
	 * 
	 */
//	完成情况("7"),

	整改完成("8"),

	已指派("9"),

	验证通过("10");
	
	
	private String status;
	
	private EnumImproveItemStatus(String status) {
		this.status = status;
	}
	
	public int getCode() {
		return Integer.parseInt(status);
	}

	public static EnumImproveItemStatus getEnumByVal(String val) throws Exception {
		for (EnumImproveItemStatus each : values()) {
			if (each.toString().equals(val)) {
				return each;
			}
		}
		throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "整改单状态[" + val + "]不存在!");
	}
	
	public static EnumImproveItemStatus getEnumByCode(int code) throws Exception {
		for (EnumImproveItemStatus each : values()) {
			if (each.getCode() == code) {
				return each;
			}
		}
		throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "整改单状态[" + code + "]不存在!");
	}

}
