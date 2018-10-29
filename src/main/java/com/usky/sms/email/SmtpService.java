package com.usky.sms.email;

import java.util.Calendar;
import java.util.HashMap;
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
import javax.mail.internet.MimeUtility;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import com.sun.mail.smtp.SMTPAddressFailedException;
import com.usky.comm.Utility;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;

public class SmtpService extends AbstractService {
	
	@Autowired
	private SmtpDao smtpDao;

	@Autowired
	private EmailDao emailDao;

	// http://192.168.1.203:8080/sms/query.do?method=getSmtp&tokenid=hp0rf40l406thv2rnnr8x8hx2028x08v
	// http://192.168.1.203:8080/sms/modify.do?method=stdcomponent.add&dataobject=smtp&obj={%22name%22:%22test%22,%22description%22:%22test%20123%22,%22creator%22:11,%22address%22:%22test@usky.com.cn%22,%22port%22:25,%22prefix%22:%22Usky%20Jiraadmin%22,%22protocol%22:%22SMTP%22,%22server%22:%22smtp.usky.com.cn%22,%22timeout%22:10000,%22tls%22:false,%22active%22:true,%22account%22:%22jiraadmin@usky.com.cn%22}&tokenid=h0zh4lrnp8204886bnr020n88h020rht
	public void getSmtp(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", smtpDao.getSmtp());
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	public void testConnection(HttpServletRequest request, HttpServletResponse response) throws Exception {
		SmtpDO smtp = gson.fromJson(request.getParameter("smtp"), SmtpDO.class);
		boolean bAuth = smtp.getPassword() != null && !smtp.getPassword().isEmpty();
		Authenticator auth = null;
		Properties pro = new Properties();
		pro.put("mail.smtp.host", smtp.getServer());
		pro.put("mail.smtp.port", smtp.getPort());
		pro.put("mail.smtp.auth", bAuth);
		if (smtp.isTls())
			pro.put("mail.smtp.starttls.enable", true);

		Session ms = Session.getInstance(pro, auth);
		Transport mt = null;
		try {
			mt = ms.getTransport(smtp.getProtocol().toLowerCase());
			if (bAuth)
				mt.connect(smtp.getAccount(), smtp.getPassword());
			else
				mt.connect();
			mt.close();
		} catch (Exception e) {
			ResponseHelper.output(response, new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "测试连接失败! " + e.getMessage()));
		} finally {
			if (mt != null) {
				mt.close();
			}
		}

		Map<String, Object> map = new HashMap<String, Object>();
		map.put("success", true);
		ResponseHelper.output(response, map);
	}

	public void testConnection1(HttpServletRequest request, HttpServletResponse response) throws Exception {
		List<SmtpDO> list = smtpDao.getAllList();
		if (list.size() == 0) {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", false);
			map.put("reason", "没有配置smtp");
			ResponseHelper.output(response, map);
		}

		SmtpDO smtp = list.get(0);
		boolean bAuth = smtp.getPassword() != null && !smtp.getPassword().isEmpty();
		Authenticator auth = null;
		Properties pro = new Properties();
		pro.put("mail.smtp.host", smtp.getServer());
		pro.put("mail.smtp.port", smtp.getPort());
		pro.put("mail.smtp.auth", bAuth);
		if (smtp.isTls())
			pro.put("mail.smtp.starttls.enable", true);

		Session ms = Session.getInstance(pro, auth);
		try {
			// Message mm = new MimeMessage(ms);

			Transport mt = ms.getTransport(smtp.getProtocol().toLowerCase());
			if (bAuth)
				mt.connect(smtp.getAccount(), smtp.getPassword());
			else
				mt.connect();
			mt.close();
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}

		Map<String, Object> map = new HashMap<String, Object>();
		map.put("success", true);
		ResponseHelper.output(response, map);
	}

	/**
	 * 发送测试邮件
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void sendTestEmail(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			EmailDO email = new EmailDO();
			List<SmtpDO> list = smtpDao.getAllList();
			if (list.size() == 0) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "没有配置SMTP邮件服务器");
			}

			SmtpDO smtp = list.get(0);
			if (!smtp.isActive()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "SMTP邮件服务器已被禁用！");
			}
			email.setFrom(smtp.getAddress());
			email.setTo(smtp.getAddress());
			email.setContent("这是在测试您的帐户设置时系统自动发送的电子邮件。 ");
			email.setSubject("系统测试消息");

			sendEmail(email);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			String message = "";
			if (e instanceof AuthenticationFailedException || e instanceof SMTPAddressFailedException) {
				message = "SMTP配置错误！";
			} else {
				message = e.getMessage();
			}
			ResponseHelper.output(response, new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, message));
		}
	}

	public void sendEmail(HttpServletRequest request, HttpServletResponse response) throws Exception {

		String from = request.getParameter("from");
		String to = request.getParameter("to");
		String subject = request.getParameter("subject");
		String content = request.getParameter("content");

		if (Utility.IsEmpty(from))
			throw new Exception("没有from参数");
		if (Utility.IsEmpty(to))
			throw new Exception("没有to参数");

		List<SmtpDO> list = smtpDao.getAllList();
		if (list.size() == 0) {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", false);
			map.put("reason", "没有配置smtp");
			ResponseHelper.output(response, map);
		}

		SmtpDO smtp = list.get(0);
		boolean bAuth = smtp.getPassword() != null && !smtp.getPassword().isEmpty();
		Authenticator auth = null;
		Properties pro = new Properties();
		pro.put("mail.smtp.host", smtp.getServer());
		pro.put("mail.smtp.port", smtp.getPort());
		pro.put("mail.smtp.auth", bAuth);
		if (smtp.isTls())
			pro.put("mail.smtp.starttls.enable", true);

		Session ms = Session.getInstance(pro, auth);
		try {
			InternetAddress from_addr = new InternetAddress(from);
			InternetAddress to_addr = new InternetAddress(to);

			Message mm = new MimeMessage(ms);
			mm.setFrom(from_addr);
			mm.addRecipient(RecipientType.TO, to_addr);

			mm.setSentDate(Calendar.getInstance().getTime());
			mm.setSubject(MimeUtility.encodeText(subject == null ? "" : subject, "UTF-8", "B"));
			mm.setText(content);

			Transport mt = ms.getTransport(smtp.getProtocol().toLowerCase());
			if (bAuth)
				mt.connect(smtp.getAccount(), smtp.getPassword());
			else
				mt.connect();
			mt.sendMessage(mm, mm.getRecipients(RecipientType.TO));
			mt.close();

			EmailDao emailDao = (EmailDao) getDataAccessObject(request, "email");
			EmailDO emailDO = new EmailDO();
			emailDO.setFrom(from);
			emailDO.setTo(to);
			emailDO.setSubject(subject);
			emailDO.setContent(content);
			emailDao.internalSave(emailDO);

			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}

	}

	public void sendEmail(EmailDO email) throws Exception {
		smtpDao.sendEmail(email);
	}

	public void setSmtpDao(SmtpDao smtpDao) {
		this.smtpDao = smtpDao;
	}

	/**
	 * @param emailDao
	 *            the emailDao to set
	 */
	public void setEmailDao(EmailDao emailDao) {
		this.emailDao = emailDao;
	}

}
