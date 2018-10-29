package com.usky.sms.email;

public enum EnumSendStatus {
	/** 0:等待发送 */
	WAITING(0),
	
	/** 1：发送成功 */
	SUCCESS(1),

	/** 2：未指定发件人 */
	NO_SENDER(2),
	
	/** 3：未指定收件人 */
	NO_RECIEVER(3),
	
	/** 4：未配置smtp */
	NO_SMTP(4),
	
	/** 5：smtp验证失败 */
	AUTHENTICATION_FAILED(5),
	
	/** 501：邮件地址格式错误 */
	BAD_ADDRESS_SYNTAX(501),
	
	/** 550：邮箱不存在或拒绝访问 */
	MAILBOX_NOT_FOUND_OR_ACCESS_DENIED(550),
	
	/** 未知错误 */
	UNKNOWN_ERROR(9999);
	
	
	private Integer status;
	
	private EnumSendStatus(Integer status){
		this.status = status;
	}
	
	public int getCode() {
		return status;
	}
}
