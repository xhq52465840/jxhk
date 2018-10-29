package com.usky.sms.email;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.mail.AuthenticationFailedException;
import javax.mail.SendFailedException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;

import com.sun.mail.smtp.SMTPAddressFailedException;
import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;

public class EmailService extends AbstractService {
	
	private static final Logger log = Logger.getLogger(EmailService.class);

	@Autowired
	private EmailDao emailDao;

	@Autowired
	private SmtpService smtp;

	public void getEmails(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			List<EmailDO> undersendingEmails = emailDao.getUndersendingEmails();
			List<EmailDO> failedEmails = emailDao.getFailedEmails();
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("undersendingEmails", PageHelper.getPagedResult(emailDao.convert(undersendingEmails), request));
			map.put("failedEmails", PageHelper.getPagedResult(emailDao.convert(failedEmails), request));
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/**
	 * 发送邮件<br>
	 * paramType为sendUndersendingEmails时发送邮件队列中的待发送邮件<br>
	 * paramType为sendFailedEmails时发送邮件队列中的发送失败邮件<br>
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void sendEmails(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String paramType = request.getParameter("paramType");
			List<EmailDO> emails = null;
			if("sendUndersendingEmails".equals(paramType)){
			emails = emailDao.getUndersendingEmails();
			}else if("sendFailedEmails".equals(paramType)){
				emails = emailDao.getFailedEmails();
			}
			if (!emails.isEmpty()) {
				for (EmailDO email : emails) {
					try {
						smtp.sendEmail(email);

						email.setSendStatus(EnumSendStatus.SUCCESS.getCode());
						emailDao.update(email);
					} catch (Exception e) {
						String message = "";
						if (e instanceof SendFailedException) {
							if (e instanceof SMTPAddressFailedException) {
								email.setSendStatus(((SMTPAddressFailedException) e).getReturnCode());
							} else {
								Exception nextException = ((SendFailedException) e).getNextException();
								if (null != nextException && nextException instanceof SMTPAddressFailedException) {
									email.setSendStatus(((SMTPAddressFailedException) nextException)
											.getReturnCode());
									message = nextException.getMessage();
								}
							}
						} else if (e instanceof SMTPAddressFailedException) {
							email.setSendStatus(((SMTPAddressFailedException) e).getReturnCode());
						} else if (e instanceof AuthenticationFailedException) {
							email.setSendStatus(EnumSendStatus.AUTHENTICATION_FAILED.getCode());
						} else {
							email.setSendStatus(EnumSendStatus.UNKNOWN_ERROR.getCode());
						}
						if (StringUtils.isEmpty(message)) {
							message = e.getMessage();
						}
						emailDao.update(email);
						StringBuffer sb = new StringBuffer();
						sb.append("邮件[ID:");
						sb.append(email.getId());
						sb.append(" ,发件人:");
						sb.append(email.getFrom());
						sb.append(" ,接收人:");
						sb.append(email.getTo());
						sb.append(" ,主题:");
						sb.append(email.getSubject());
						sb.append(" ,内容:");
						sb.append(email.getContent());
						sb.append("]发送失败！错误代码:");
						sb.append(email.getSendStatus());
						sb.append(" 错误详细:");
						sb.append(message);
						log.warn(sb.toString());
					}
				}
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	/**
	 * @param emailDao
	 *            the emailDao to set
	 */
	public void setEmailDao(EmailDao emailDao) {
		this.emailDao = emailDao;
	}

	/**
	 * @param smtp the smtp to set
	 */
	public void setSmtp(SmtpService smtp) {
		this.smtp = smtp;
	}

}
