package com.usky.sms.email;

import java.util.Calendar;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.activation.DataHandler;
import javax.mail.AuthenticationFailedException;
import javax.mail.Authenticator;
import javax.mail.BodyPart;
import javax.mail.Message;
import javax.mail.Message.RecipientType;
import javax.mail.Multipart;
import javax.mail.SendFailedException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.quartz.Scheduler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.sun.mail.smtp.SMTPAddressFailedException;
import com.usky.comm.Utility;
import com.usky.sms.config.Config;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.job.CronSendEmailJob;
import com.usky.sms.job.JobUtils;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.utils.SpringBeanUtils;

public class SmtpDao extends BaseDao<SmtpDO> {
	
	private static final Logger log = Logger.getLogger(SmtpDao.class);
	
	/** 默认每五分钟发送一次 */
	private static final String CRON_EXPRESSION_FOR_SEND_EMAIL = "0 0/5 * * * ?";
	
	private Config config;
	
	@Autowired
	private EmailDao emailDao;
	
	public SmtpDao() {
		super(SmtpDO.class);
		this.config = Config.getInstance();
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		map.put("creator", UserContext.getUserId());

		List<SmtpDO> list = this.getAllList();
		
		if (list.size() > 0) {
			SmtpDO smtp = list.get(0);
			String[] ids = new String[1];
			ids[0] = smtp.getId().toString();
			this.delete(ids);
		}
		
		return true;
	}	

	public Map<String, Object> getSmtp() {
		return this.convert(this.getActivieSmtp());
	}
	

	/**
	 * 发送邮件操作（仅仅使用smtp发送邮件, 不对邮件信息进行持久化）
	 * @param content 内容
	 * @param subject 主题
	 * @param receivers 接收人
	 * @throws SendFailedException
	 */
	public void sendEmail(String content, String subject, List<UserDO> receivers) throws SendFailedException {
		try {
			Map<String, Object> smtp = this.getSmtp();
			if (null == smtp) {
				throw new SMTPAddressFailedException(null, null, 4, "未配置smtp");
			}
			for (UserDO user : receivers) {
				EmailDO email = new EmailDO();
				email.setContent(content);
				email.setSubject(subject);
				email.setTo(user.getEmail());
				this.sendEmail(email);
			}
		} catch (Exception e) {
			throw new SendFailedException(e.getMessage());
		}
	}
	
	/**
	 * 发送邮件操作（仅仅使用smtp发送邮件, 不对邮件信息进行持久化）
	 * 设置email的发送状态和发件邮箱地址到email
	 * @param smtp
	 * @param email
	 * @throws Exception
	 */
	public void sendEmail(SmtpDO smtp, EmailDO email) throws SMSException{
		try {
			email.setFrom(smtp == null ? null : smtp.getAddress());
			if (smtp == null) {
				throw new SMTPAddressFailedException(null, null, 4, "未配置smtp");
			}
			if (Utility.IsEmpty(email.getFrom())) {
				throw new SMTPAddressFailedException(null, null, 2, "未指定发件人");
			}
			if (Utility.IsEmpty(email.getTo())) {
				throw new SMTPAddressFailedException(null, null, 3, "未指定收件人");
			}

			boolean bAuth = smtp.getPassword() != null && !smtp.getPassword().isEmpty();
			Authenticator auth = null;
			Properties pro = new Properties();
			pro.put("mail.smtp.host", smtp.getServer());
			pro.put("mail.smtp.port", smtp.getPort());
			pro.put("mail.smtp.auth", bAuth);
			if (smtp.isTls()) {
				pro.put("mail.smtp.starttls.enable", true);
			}
			Session ms = Session.getInstance(pro, auth);

			InternetAddress from_addr = new InternetAddress(smtp.getAddress());
			InternetAddress to_addr = new InternetAddress(email.getTo());

			Message mm = new MimeMessage(ms);
			mm.setFrom(from_addr);
			mm.addRecipient(RecipientType.TO, to_addr);

			mm.setSentDate(Calendar.getInstance().getTime());
			mm.setSubject(email.getSubject());
			Multipart mp = new MimeMultipart();
			// 正文  
			BodyPart body = new MimeBodyPart();
			// 网页格式的邮件内容
			body.setDataHandler(new DataHandler(email.getContent(), "text/html;charset=utf-8"));
			// 发件内容
			mp.addBodyPart(body);

			mm.setContent(mp);

			Transport mt = ms.getTransport(smtp.getProtocol().toLowerCase());
			if (bAuth) {
				mt.connect(smtp.getAccount(), smtp.getPassword());
			} else {
				mt.connect();
			}
			mt.sendMessage(mm, mm.getRecipients(RecipientType.TO));
			mt.close();
		} catch (Exception e) {
			String message = "";
			if (e instanceof SendFailedException) {
				if (e instanceof SMTPAddressFailedException) {
					email.setSendStatus(((SMTPAddressFailedException) e).getReturnCode());
				} else {
					Exception nextException = ((SendFailedException) e).getNextException();
					if (null != nextException
							&& nextException instanceof SMTPAddressFailedException) {
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
			log.error(sb.toString(), e);
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, sb.toString());
		}
	}
	
	/**
	 * 发送邮件并对邮件信息进行持久化
	 * @param smtp
	 * @param email
	 * @throws Exception
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED)
	public void sendAndUpdateEmail(EmailDO email) {
		try {
			this.sendEmail(email);
			email.setSendStatus(EnumSendStatus.SUCCESS.getCode());
		} catch (Exception e) {
		} finally {
			if (email.getId() != null) {
				emailDao.internalUpdate(email);
			} else {
				emailDao.internalSave(email);
			}
		}
	}
	
	/**
	 * 发送邮件操作（仅仅使用smtp发送邮件, 不对邮件信息进行持久化）
	 * 设置email的发送状态和发件邮箱地址到email
	 * @param email 邮件
	 */
	public void sendEmail(EmailDO email) {
		SmtpDO smtp = this.getActivieSmtp();
		this.sendEmail(smtp, email);
	}
	
	/**
	 * 获取有效的smtp信息
	 * @return
	 */
	public SmtpDO getActivieSmtp() {
		@SuppressWarnings("unchecked")
		List<SmtpDO> smtps = (List<SmtpDO>) this.query("from SmtpDO t where t.deleted = false and t.active = true");
		return smtps.isEmpty() ? null : smtps.get(0);
	}
	
	
	/**
	 *  发送待发送的邮件
	 * @param scheduler
	 */
	public void sendUnderSendingEmails(Scheduler scheduler) {
		String expression = config.getCronExpForSendEmail();
		if (StringUtils.isNotBlank(expression)) {
			try {
				JobUtils.createCron(scheduler, "sendUnderSendingEmails", "smtp", CronSendEmailJob.class, CRON_EXPRESSION_FOR_SEND_EMAIL, expression);
			} catch (Exception e) {
				log.warn("发送邮件失败！" + e.getMessage(), e);
				throw e;
			}
		}
	}
	
	/**
	 * 发送待发送的邮件
	 */
	public void sendUnderSendingEmails() {
		// 获取待发送的邮件
		List<EmailDO> list = emailDao.getUndersendingEmails();
		SmtpDao smtpDao = (SmtpDao) SpringBeanUtils.getBean("smtpDao");
		if (!list.isEmpty()) {
			for (EmailDO email : list) {
				// 发送并更新邮件的状态
				smtpDao.sendAndUpdateEmail(email);
			}
		}
	}

	public void setEmailDao(EmailDao emailDao) {
		this.emailDao = emailDao;
	}
}
