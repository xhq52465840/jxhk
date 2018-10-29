
package com.usky.sms.filter;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.apache.log4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.HibernateTemplate;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.common.HttpHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.config.Config;
import com.usky.sms.core.SMSException;
import com.usky.sms.http.service.GsonBuilder4SMS;
import com.usky.sms.http.session.SessionContext;
import com.usky.sms.service.LoginService;
import com.usky.sms.ups.service.UpsService;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;
import com.usky.sms.utils.SpringBeanUtils;
import com.usky.sso.oa.SSOClient;

public class AuthenticationFilter implements Filter {
	
	private static final Logger log = Logger.getLogger(AuthenticationFilter.class);
	
	@Autowired
	private HibernateTemplate hibernateTemplate;
	
	private boolean enable;
	
	public static long interval;
	
	public static Integer systemUpdating = 0;
	
	@Override
	public void destroy() {
		// do nothing
	}
	
	// TODO: 添加用户当前角色可用性验证
	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
		HttpServletRequest req = (HttpServletRequest) request;
		HttpServletResponse res = (HttpServletResponse) response;
		try {
			if (systemUpdating < 100) throw new SMSException(SMSException.SYSTEM_UPDATE, systemUpdating);
			HttpSession session = req.getSession();
			MDC.put("ip", req.getRemoteAddr());
			MDC.put("session", session.getId());
			// locale
			Cookie[] cookies = req.getCookies();
			if (cookies != null) {
				for (Cookie cookie : cookies) {
					if ("locale".equals(cookie.getName())) {
						if (StringUtils.isNotBlank(cookie.getValue())) {
							session.setAttribute("locale", cookie.getValue());
						}
						break;
					}
				}
			}
			SessionContext.setSession(session);
			
			String uri = getURI(req);
			log.debug(uri);
			if (!isEnable()) {
				chain.doFilter(req, res);
				return;
			}
			if (isValidServerRequest(req)) {
				chain.doFilter(req, res);
				return;
			}
			if (isLoginService(uri)) {
				chain.doFilter(req, res);
				return;
			}
			if (isNologinService(req)) {
				chain.doFilter(req, res);
				return;
			}
			if (isBulletinService(req)) {
				chain.doFilter(req, res);
				return;
			}
			if (isTestService(req)) {
				chain.doFilter(req, res);
				return;
			}
			if (authenticate(req, res)/* || authenticateByUPS(req) */) {
				UserDO user = (UserDO) session.getAttribute("user");
				MDC.put("user", user.getUsername());
				UserContext.setUser(user);
				chain.doFilter(req, res);
			}
		} catch (SMSException e) {
			ResponseHelper.output(res, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(res, e);
		} finally {
			UserContext.setUser(null);
			MDC.remove("ip");
			MDC.remove("session");
			MDC.remove("user");
		}
	}
	
	private String getURI(HttpServletRequest req) {
		String uri = req.getRequestURI();
		return uri.substring(req.getContextPath().length() + 1, uri.length() - 3);
	}
	
	@Override
	public void init(FilterConfig config) throws ServletException {
		// do nothing
	}
	
	private boolean isEnable() {
		return enable;
	}
	
	private boolean isValidServerRequest(HttpServletRequest req) {
		String serviceName = req.getParameter("serviceName");
		if (serviceName == null) return false;
		String ip = req.getRemoteAddr();
		log.debug("Remote addr: " + ip);
		//		Number count = (Number) hibernateTemplate.find("select count(*) from ServiceDO where serviceName = ? and ip = ?", serviceName, ip).get(0);
		//		if (count.intValue() == 0) return false;
		return true;
	}
	
	private boolean isLoginService(String uri) {
		return "login".equals(uri);
	}
	
	private boolean isNologinService(HttpServletRequest req) {
		if (!"Y".equals(req.getParameter("nologin"))) return false;
		if ("submitEmReport".equals(req.getParameter("method"))) return true;
		if ("stdcomponent.getbysearch".equals(req.getParameter("method")) && ("unit".equals(req.getParameter("dataobject")) || "organization".equals(req.getParameter("dataobject")))) return true;
		if ("stdcomponent.getbysearch".equals(req.getParameter("method")) && "dictionary".equals(req.getParameter("dataobject"))) {
			String rule = req.getParameter("rule");
			if (rule != null && rule.trim().length() > 0) {
				List<List<Map<String, Object>>> ruleList = GsonBuilder4SMS.getInstance().fromJson(rule, new TypeToken<List<List<Map<String, Object>>>>() {}.getType());
				for (List<Map<String, Object>> ruleMaps : ruleList) {
					for (Map<String, Object> ruleMap : ruleMaps) {
						if ("type".equals(ruleMap.get("key")) && "飞行阶段".equals(ruleMap.get("value"))) return true;
					}
				}
			}
		}
		if ("stdcomponent.getbysearch".equals(req.getParameter("method")) && "activity".equals(req.getParameter("dataobject"))) {
			String rule = req.getParameter("rule");
			if (rule != null && rule.trim().length() > 0) {
				List<List<Map<String, Object>>> ruleList = GsonBuilder4SMS.getInstance().fromJson(rule, new TypeToken<List<List<Map<String, Object>>>>() {}.getType());
				if (ruleList.size() > 0 && ruleList.get(0).size() > 0) {
					Map<String, Object> map = ruleList.get(0).get(0);
					if ("deviceId".equals(map.get("key"))) return true;
				}
			}
		}
		if ("getEmReportDeatil".equals(req.getParameter("method"))) return true;
		if ("downloadFiles".equals(req.getParameter("method"))) return true;
		if ("downloadLosaFiles".equals(req.getParameter("method"))) return true;
		if ("uploadFiles".equals(req.getParameter("method"))) return true;
		if ("synchronizeActivity".equals(req.getParameter("method"))) return true;
		if ("synchronizeActivityWithThreads".equals(req.getParameter("method"))) return true;
		if ("getByUnitforEm".equals(req.getParameter("method"))) return true;
		if ("getActivityByTypeAndCreatedAndUnitZ".equals(req.getParameter("method"))) return true;
		if ("getRadarZ".equals(req.getParameter("method"))) return true;
		if ("getSeverityByFliterN".equals(req.getParameter("method"))) return true;
		if ("getBaseInfo".equals(req.getParameter("method"))) return true;
		return false;
	}
	
	private boolean isBulletinService(HttpServletRequest req) {
		return "stdcomponent.getbysearch".equals(req.getParameter("method")) && "bulletin".equals(req.getParameter("dataobject"));
	}
	
	private boolean isTestService(HttpServletRequest req) {
		String uri = req.getRequestURI();
		int pos = uri.indexOf(".do");
		if (pos == -1) return false;
		return "test".equals(uri.substring(req.getContextPath().length() + 1, pos));
	}
	
	private boolean authenticate(HttpServletRequest request, HttpServletResponse response) throws Exception {
		String token = request.getParameter("tokenid");
		// sso校验
		Cookie cookie = HttpHelper.getCookieByName(request, "TGC");
		String ticket = cookie == null ? null : cookie.getValue();
		if ((token == null || token.trim().length() == 0) && ticket == null) {
			throw SMSException.NO_TOKEN;
		}
		if (token != null && token.trim().length() != 0) {
			token = token.trim();
			HttpSession session = request.getSession(false);
			if (session == null) throw SMSException.SESSION_EXPIRED;//return false;
			UserDO user = (UserDO) session.getAttribute("user");
			if (user == null) throw SMSException.SESSION_EXPIRED;//return false;
			log.debug("User[" + user.getUsername() + "]<" + token + ">: " + request.getRequestURI());
			if (token.equals(session.getAttribute("tokenid"))) {
				// TODO: 暂时不同步UPS的时间
				//			if (compareExpirationTime(getExpirationTime(request), getUPSExpirationTime(request))) synchronizeExpirationTime(request);
				return true;
			}
			throw SMSException.SESSION_EXPIRED;
		} else {
			Config config = Config.getInstance();
			// 先通过TGC获得service ticket
			String serviceTicket = SSOClient.getServiceTicket(config.getSsoServerUrl(), ticket, config.getSsoServiceUrl());
			if (serviceTicket != null) {
				String username = SSOClient.ticketValidate(config.getSsoValidateUrl(), serviceTicket, config.getSsoServiceUrl());
				UserDao userDao = (UserDao) SpringBeanUtils.getBean("userDao");
				LoginService login = (LoginService) SpringBeanUtils.getBean("login");
				if (StringUtils.isNotBlank(username)) { // SSO验证通过
					UserDO user = userDao.getByUsername(username);
					if (user == null) {
						throw SMSException.INVALID_USER;
					}
					login.writeUserCookie(user, ticket, request, response);
					return true;
				} else {
					throw SMSException.SESSION_TIMEOUT;
				}
			} else {
				throw SMSException.SESSION_TIMEOUT;
			}
		}
		//		return false;
	}
	
	@SuppressWarnings("unused")
	private long getExpirationTime(HttpServletRequest request) {
		// TODO: 一般会比真实过期时间晚几毫秒
		return System.currentTimeMillis() + interval;
	}
	
	@SuppressWarnings("unused")
	private long getUPSExpirationTime(HttpServletRequest request) {
		Long upsExpirationTime = (Long) request.getSession().getAttribute("upsExpirationTime");
		return upsExpirationTime == null ? 0 : upsExpirationTime;
	}
	
	@SuppressWarnings("unused")
	private boolean compareExpirationTime(long expirationTime, long upsExpirationTime) {
		return expirationTime > upsExpirationTime;
	}
	
	@SuppressWarnings("unused")
	private void synchronizeExpirationTime(HttpServletRequest request) throws Exception {
		@SuppressWarnings("unchecked")
		Map<String, Object> result = (Map<String, Object>) new UpsService().echo(request.getParameter("tokenid"));
		Double tokenExpire = (Double) result.get("tokenexpire");
		request.getSession().setAttribute("upsExpirationTime", System.currentTimeMillis() + tokenExpire.longValue());
	}
	
	@SuppressWarnings("unused")
	private boolean authenticateByUPS(HttpServletRequest request) throws Exception {
		String token = request.getParameter("tokenid");
		if (token == null || token.trim().length() == 0) throw SMSException.NO_TOKEN;
		@SuppressWarnings("unchecked")
		Map<String, Object> result = (Map<String, Object>) new UpsService().echo(token);
		String username = (String) result.get("usercode");
		HttpSession session = request.getSession();
		@SuppressWarnings("unchecked")
		List<UserDO> users = hibernateTemplate.find("from UserDO where username = ?", username);
		if (users.size() == 0) throw SMSException.INVALID_USER;
		UserDO user = users.get(0);
		session.setAttribute("user", user);
		session.setAttribute("tokenid", token);
		session.setAttribute("upsExpirationTime", System.currentTimeMillis() + ((Double) result.get("tokenexpire")).longValue());
		return true;
	}
	
	public void setHibernateTemplate(HibernateTemplate hibernateTemplate) {
		this.hibernateTemplate = hibernateTemplate;
	}
	
	public void setEnable(boolean enable) {
		this.enable = enable;
	}
	
	public static void setInterval(long interval) {
		AuthenticationFilter.interval = interval;
	}
	
}
