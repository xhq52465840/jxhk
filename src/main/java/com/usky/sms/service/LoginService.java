
package com.usky.sms.service;

import java.io.IOException;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.HibernateTemplate;
import org.springframework.stereotype.Controller;

import com.usky.comm.Utility;
import com.usky.sms.common.HttpHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.common.VerifyCodeUtils;
import com.usky.sms.config.Config;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;
import com.usky.sso.oa.SSOClient;

@Controller("/login")
public class LoginService extends AbstractService {
	
	private static final Logger log = Logger.getLogger(LoginService.class);
	
	private static final String DEFAULT_PAGE_DISPLAY_NUM = "10";
	
	private static final int VERIFY_CODE_LEN = 4;
	
	/** 验证码图片宽度({code}) */
	private static final int VERIFY_CODE_IMG_WIDTH = 140;
	
	/** 验证码图片高度({@code}) */
	private static final int VERIFY_CODE_IMG_HIGHT = 34;
	
	@Autowired
	private HibernateTemplate hibernateTemplate;
	
	@Autowired
	private DictionaryDao dictionaryDao;
	
	@Autowired
	private UserDao userDao;
	
	@Override
	public void doDefault(HttpServletRequest request, HttpServletResponse response) {
		try {
			String method = request.getParameter("method");
			Object result = null;
			if ("getVerifyCode".equals(method)) {
				// 获取验证码
				this.getVerifyCode(request, response);
				return;
			} else if ("checkVerifyCode".equals(method)) {
				// 校验验证码
				result = this.checkVerifyCode(request);
			} else {
				// 默认调用登录方法
				result = login(request, response);
			}
			ResponseHelper.output(response, result);
		} catch (SMSException e) {
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public Object login(HttpServletRequest request, HttpServletResponse response) throws Exception {
		// 校验验证码
		this.checkVerifyCode(request);
		
		String username = request.getParameter("username");
		String password = request.getParameter("password");
		UserDO user = null;
		String ticket = null;
		
		Config config = Config.getInstance();
		String ssoFlag = config.getSsoFlag();
		String tempName = username+"";
		if (("N".equals(ssoFlag) || "ADMIN".equals(username) || "ANONYMITY".equals(username)
			|| tempName.indexOf("NOLOGIN@#") > -1) && username != null) { // 是否是免登录
			if (tempName.indexOf("NOLOGIN@#") > -1) {
				String[] temp = StringUtils.split(username, "@#");
				if (temp.length > 1) {
					username = temp[1];
				}
			}
			user = userDao.getByUsername(username);
			if (user == null)
				throw SMSException.INVALID_USER;
			if (password != null) {
				String basePwd = Utility.pwdEncode(password.getBytes());
				userDao.login(user, basePwd);
			}
		} else {
			/*
			 * oa sso	
			 */
			Cookie cookie = HttpHelper.getCookieByName(request, "TGC");
			ticket = cookie == null ? null : cookie.getValue();
				
			if (StringUtils.isNotBlank(username) && StringUtils.isNotBlank(password)) { // 从sms直接登录
				user = userDao.getByUsername(username);
				if (user == null) throw SMSException.INVALID_USER;
				// SSO登录
				ticket = SSOClient.getTicketGrantingTicket(config.getSsoServerUrl(), username, password);
				if (StringUtils.isBlank(ticket)) {
					throw SMSException.WRONG_PASSWORD;
				}
				// 验证
				String serviceTicket = SSOClient.getServiceTicket(config.getSsoServerUrl(), ticket, config.getSsoServiceUrl());
				if (serviceTicket != null) {
					username = SSOClient.ticketValidate(config.getSsoValidateUrl(), serviceTicket, config.getSsoServiceUrl());
				}
				if (StringUtils.isBlank(username)) {
					throw SMSException.WRONG_PASSWORD;
				} else {
					// SSO登录成功后，本地更新用户登录信息
					userDao.login(user);
				}				
			} else if (StringUtils.isNotBlank(ticket) && !"null".equals(ticket)) { // 从OA转到SMS
				user = this.loginFromOaToSms(ticket);
			} else{
				throw SMSException.SESSION_TIMEOUT;
			}
		}
		/*
		 * sso end*********************************************************************************
		 */
		Map<String, Object> result = this.writeUserCookie(user, ticket, request, response);
		return result;
	}
	
	public Map<String, Object> writeUserCookie(UserDO user, String ticket, HttpServletRequest request, HttpServletResponse response) {
		Map<String, Object> result = new HashMap<String, Object>();
		String tokenId = Long.toString(System.currentTimeMillis());
		Double tokenExpire = 0.0;
		HttpSession session = request.getSession();
		session.setAttribute("user", user);
		session.setAttribute("tokenid", tokenId);
		session.setAttribute("upsExpirationTime", System.currentTimeMillis() + tokenExpire.longValue());
		log.debug(tokenId + " : " + tokenExpire);
		result.put("success", "true");
		result.put("tokenid", tokenId);
		result.put("userid", user.getId().toString());
		result.put("username", user.getUsername());
		result.put("fullname", user.getFullname());
		result.put("sessionid", request.getSession().getId());
		result.put("TGC",ticket);
		String pageDisplayNum = user.getPageDisplayNum();
		if (pageDisplayNum == null) {
			List<DictionaryDO> list = dictionaryDao.getListByKey(DictionaryDao.USER_DEFAULT_SETTING_KEYS[1]);
			if (list.size() > 0) {
				pageDisplayNum = list.get(0).getValue();
			} else {
				pageDisplayNum = DEFAULT_PAGE_DISPLAY_NUM;
			}
		}
		result.put("pageDisplayNum", pageDisplayNum);
		
		HttpHelper.addCookie(response, "sessionid", request.getSession().getId(), null, null);
		HttpHelper.addCookie(response, "tokenid", tokenId, 60 * 60 * 2, null);
		HttpHelper.addCookie(response, "userid", user.getId().toString(), null, null);
		HttpHelper.addCookie(response, "TGC", ticket, 60 * 60 * 2, "juneyaoair.com"); // 2小时
		return result;
	}
	
	public UserDO loginFromOaToSms(String ticket) {
		Config config = Config.getInstance();
		// 先通过TGC获得service ticket
		String serviceTicket = SSOClient.getServiceTicket(config.getSsoServerUrl(), ticket, config.getSsoServiceUrl());
		if (serviceTicket != null) {
			String username = SSOClient.ticketValidate(config.getSsoValidateUrl(), serviceTicket, config.getSsoServiceUrl());
			if (StringUtils.isNotBlank(username)) { // SSO验证通过
				UserDO user = userDao.getByUsername(username);
				if (user == null) {
					throw SMSException.INVALID_USER;
				}
				userDao.login(user);
				return user;
			} else {
				throw SMSException.SESSION_TIMEOUT;
			}
		} else {
			throw SMSException.SESSION_TIMEOUT;
		}
	}
	
	/**
	 * 获取验证码，并将验证码房到session中，然后输出到reponse输出流中
	 * @param request
	 * @param response
	 * @throws IOException
	 */
	private void getVerifyCode(HttpServletRequest request, HttpServletResponse response) {
		OutputStream out = null;
		try {
			response.setContentType("image/jpeg");
			String verifyCode = VerifyCodeUtils.generateVerifyCode(VERIFY_CODE_LEN);
			HttpSession session = request.getSession();
			session.setAttribute("verifyCode", verifyCode);
			out = response.getOutputStream();
			VerifyCodeUtils.outputImage(VERIFY_CODE_IMG_WIDTH, VERIFY_CODE_IMG_HIGHT, out, verifyCode);
			out.flush();
		} catch (Exception e) {
			log.error("获取验证码失败", e);
		} finally {
			IOUtils.closeQuietly(out);
		}
	}
	
	/**
	 * 校验验证码
	 * @param request
	 */
	private Map<String, Object> checkVerifyCode(HttpServletRequest request) {
		String inputVerifyCode = request.getParameter("verifyCode");
		if (StringUtils.isBlank(inputVerifyCode)) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "验证码不能为空");
		}
		String savedVerifyCode = (String) request.getSession().getAttribute("verifyCode");
		if (!inputVerifyCode.equalsIgnoreCase(savedVerifyCode)) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "验证码错误");
		}
		Map<String, Object> result = new HashMap<String, Object>();
		result.put("success", true);
		return result;
	}
	
	public void setHibernateTemplate(HibernateTemplate hibernateTemplate) {
		this.hibernateTemplate = hibernateTemplate;
	}
	
	public void setDictionaryDao(DictionaryDao dictionaryDao) {
		this.dictionaryDao = dictionaryDao;
	}
	
	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}
	
}
