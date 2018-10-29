
package com.usky.sms.core;

import java.util.Locale;

import org.springframework.context.support.ReloadableResourceBundleMessageSource;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.http.session.SessionContext;
import com.usky.sms.utils.SpringBeanUtils;

public class SMSException extends RuntimeException {
	
	private static final long serialVersionUID = 5875000400471599623L;
	
	public static final SMSException WRONG_PASSWORD = new SMSException(MessageCodeConstant.MSG_CODE_103000003);
	
	public static final SMSException SESSION_EXPIRED = new SMSException(MessageCodeConstant.MSG_CODE_103000002);
	
	public static final SMSException SESSION_TIMEOUT = new SMSException(MessageCodeConstant.MSG_CODE_103000004);
	
	public static final SMSException NO_TOKEN = new SMSException(MessageCodeConstant.MSG_CODE_103000001);
	
	public static final SMSException NO_ACCESS_RIGHT = new SMSException(MessageCodeConstant.MSG_CODE_101000003);
	
	public static final SMSException SYSTEM_UPDATE = new SMSException(MessageCodeConstant.MSG_CODE_101000004);
	
	public static final SMSException INVALID_USER = new SMSException(MessageCodeConstant.MSG_CODE_104000002);
	
	public static final SMSException UNRECOGNIZED_REQUEST = new SMSException(MessageCodeConstant.MSG_CODE_101000001);
	
	public static final SMSException UNKNOWN_EXCEPTION = new SMSException(MessageCodeConstant.MSG_CODE_101000002);
	
	public static final SMSException NO_ENTRY_SELECTED = new SMSException(MessageCodeConstant.MSG_CODE_101000008);
	
	public static final SMSException UPDATE_FAILED = new SMSException(MessageCodeConstant.MSG_CODE_101002017);
	
	public static final SMSException NOT_EXISTED_ROLE = new SMSException(MessageCodeConstant.MSG_CODE_106000004);
	
	public static final SMSException NO_ACCESS_ROLE = new SMSException(MessageCodeConstant.MSG_CODE_108000001);
	
	public static final SMSException NO_ROLE = new SMSException(MessageCodeConstant.MSG_CODE_104000004);
	
	public static final SMSException NO_CORE = new SMSException(MessageCodeConstant.MSG_CODE_134000001);
	
	public static final SMSException NO_DATA_OBJECT = new SMSException(MessageCodeConstant.MSG_CODE_101000007);
	
	public static final SMSException NO_MATCHABLE_OBJECT = new SMSException(MessageCodeConstant.MSG_CODE_101000009);
	
	public static final SMSException FIELD_OUT_OF_LIMIT = new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "字段[%s]输入内容超出限制范围！");
	
	public static final SMSException NO_OPERATE_PERMISSION = new SMSException(MessageCodeConstant.MSG_CODE_101000011);
	
	/******************************luobin added**********************************/
	/**该航班已提交过机长报告*/
	public static final SMSException CAPTAIN_REPORT_EXIST = new SMSException(MessageCodeConstant.MSG_CODE_800000001);
	/******************************luobin added**********************************/
	
	private String code;
	
	private Object[] params;
	
//	public SMSException(String code, String message) {
//		super(message);
//		this.code = code;
//	}
	
	public SMSException(String code) {
		super("ERROR CODE:" + code);
		this.code = code;
	}
	
	public SMSException(String code, Object... params) {
		super("ERROR CODE:" + code);
		this.code = code;
		this.params = params;
	}
	
	public SMSException(SMSException exception, Object... params) {
		this(exception.getCode(), String.format(exception.getMessage(), params));
	}
	
	public SMSException(Exception e) {
		this(MessageCodeConstant.MSG_CODE_DEFAULT, "未知错误！请联系系统管理员！\n" + e.getMessage());
	}
	
	public String getLocalizedMessage() {
		Locale locale;
		if (SessionContext.getAttribute("locale") != null) {
			locale = new Locale((String) SessionContext.getAttribute("locale"));
		} else {
			locale = Locale.CHINESE;
		}
		return getLocalizedMessage(locale);
	}
	
	public String getLocalizedMessage(Locale locale) {
		try {
			ReloadableResourceBundleMessageSource messageSource = (ReloadableResourceBundleMessageSource) SpringBeanUtils.getBean("messageSource");
			return messageSource.getMessage(code, params, locale);
		} catch (Exception e) {
			if (!Locale.CHINESE.equals(locale)) {
				return getLocalizedMessage(Locale.CHINESE);
			}
			return super.getMessage();
		}
	}
	
	@Override
	public String getMessage() {
		return getLocalizedMessage();
	}

	public String getCode() {
		return code;
	}
	
	public Object[] getParams() {
		return params;
	}
	
}
