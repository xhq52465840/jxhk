//
//package com.usky.sms.service;
//
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//
//import javax.servlet.http.Cookie;
//import javax.servlet.http.HttpServletRequest;
//import javax.servlet.http.HttpServletResponse;
//import javax.servlet.http.HttpSession;
//
//import org.apache.log4j.Logger;
//import org.datacontract.schemas._2004._07.Ceair_Operations_SSO_WCF_Contracts_Model.UserIsLoginResultModel;
//import org.datacontract.schemas._2004._07.Ceair_Operations_SSO_WCF_Contracts_Model.UserLoginModel;
//import org.datacontract.schemas._2004._07.Ceair_Operations_SSO_WCF_Contracts_Model.UserLoginResultModel;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.orm.hibernate3.HibernateTemplate;
//import org.springframework.stereotype.Controller;
//import org.tempuri.SSOAuthorizationLocator;
//
//import com.Operations.Ceair.SSOAuth.ISSOAuthorization;
//import com.usky.sms.common.ResponseHelper;
//import com.usky.sms.config.Config;
//import com.usky.sms.core.AbstractService;
//import com.usky.sms.core.SMSException;
//import com.usky.sms.dictionary.DictionaryDO;
//import com.usky.sms.dictionary.DictionaryDao;
//import com.usky.sms.user.UserDO;
//import com.usky.sms.user.UserDao;
//
//@Controller("/login")
//public class LoginService extends AbstractService {
//	
//	private static final Logger log = Logger.getLogger(LoginService.class);
//	
//	private static final String DEFAULT_PAGE_DISPLAY_NUM = "10";
//	
//	@Autowired
//	private HibernateTemplate hibernateTemplate;
//	
//	@Autowired
//	private DictionaryDao dictionaryDao;
//	
//	@Autowired
//	private UserDao userDao;
//	
//	@Override
//	public void doDefault(HttpServletRequest request, HttpServletResponse response) {
//		try {
//			Object result = login(request, response);
//			ResponseHelper.output(response, result);
//		} catch (SMSException e) {
//			ResponseHelper.output(response, e);
//		} catch (Exception e) {
//			e.printStackTrace();
//			ResponseHelper.output(response, e);
//		}
//	}
//	
//	private Object login(HttpServletRequest request, HttpServletResponse response) throws Exception {
//		Map<String, Object> result = new HashMap<String, Object>();
//		String username = request.getParameter("username");
//		String password = request.getParameter("password");
//		UserDO user = null;
//		/*
//		 * sso begin*********************************************************************************
//		 */
//		String SSOSessionId = "";
//		Cookie[] cookie = request.getCookies();
//		for (int i = 0; i < cookie.length; i++) {
//			Cookie cook = cookie[i];
//			if(cook.getName().equals("SSOSessionId")){ //获取键 
//				System.out.println("SSOSessionId:"+cook.getValue().toString());    //获取值 
//				SSOSessionId = cook.getValue().toString();
//				break;
//			}
//		}
//		String ssoFlag = Config.getInstance().getSsoFlag();
//		String tempName = username+"";
//		if(("N".equals(ssoFlag)||"ADMIN".equals(username)||"ANONYMITY".equals(username)||tempName.indexOf("NOLOGIN@#")>-1)&&username!=null){
//			if(tempName.indexOf("NOLOGIN@#")>-1){
//				username = username.split("@#")[1];
//			}
//			user = getUser(username);
//			userDao.login(user, password);
//		}else{
//			SSOAuthorizationLocator locator = new SSOAuthorizationLocator();
//			ISSOAuthorization sso = locator.getBasicHttpBinding_ISSOAuthorization();
//			String authorizationAppId = Config.getInstance().getAuthorizationAppId();
//			if(username != null && password != null && !"".equals(username) && !"".equals(password)){
//				user = getUser(username);
//				if (user == null) throw SMSException.INVALID_USER;
//				UserLoginResultModel userLoginResultModel = sso.login(new UserLoginModel(authorizationAppId, "chrome", password, username));
//				SSOSessionId = userLoginResultModel.getSessionId();
//				if(SSOSessionId==null||"".equals(SSOSessionId)||"null".equals(SSOSessionId)){
//					SMSException e = new SMSException("-10002", userLoginResultModel.getMessage());
//					throw e;
//				}else{					
//					userDao.login(user);
//				}				
//			}else if(SSOSessionId != null && !"".equals(SSOSessionId) && !"null".equals(SSOSessionId)){
//				UserIsLoginResultModel userIsLoginResultModel = sso.isLogin(SSOSessionId);
//			    if(userIsLoginResultModel.getIsLogin()){
//			    	user = getUser(userIsLoginResultModel.getUserName());
//					userDao.login(user);
//			    }else{
//			    	SMSException e = new SMSException("-10002",  "会话过期");
//					throw e;
//			    }
//			}else{
//				SMSException e = new SMSException("-10002", "会话过期");
//				throw e;
//			}
//		}
//		/*
//		 * sso end*********************************************************************************
//		 */
//		// TODO: 鏆傛椂涓嶉?杩嘦PS楠岃瘉鐢ㄦ埛
//		//		UpsService upsService = new UpsService();
//		//		@SuppressWarnings("unchecked")
//		//		Map<String, Object> data = (Map<String, Object>) upsService.login(username, password);
//		//		userDao.login(user);
//		//		String tokenId = (String) data.get("tokenid");
//		//		Double tokenExpire = (Double) data.get("tokenexpire");
//		
//		String tokenId = Long.toString(System.currentTimeMillis());
//		Double tokenExpire = 0.0;		
//		HttpSession session = request.getSession();
//		session.setAttribute("user", user);
//		session.setAttribute("tokenid", tokenId);
//		session.setAttribute("upsExpirationTime", System.currentTimeMillis() + tokenExpire.longValue());
//		log.debug(tokenId + " : " + tokenExpire);
//		result.put("success", "true");
//		result.put("tokenid", tokenId);
//		result.put("userid", user.getId().toString());
//		result.put("username", user.getUsername());
//		result.put("fullname", user.getFullname());
//		result.put("sessionid", request.getSession().getId());
//		result.put("SSOSessionId",SSOSessionId);
//		String pageDisplayNum = user.getPageDisplayNum();
//		if (pageDisplayNum == null) {
//			List<DictionaryDO> list = dictionaryDao.getListByKey(DictionaryDao.USER_DEFAULT_SETTING_KEYS[1]);
//			if (list.size() > 0) {
//				pageDisplayNum = list.get(0).getValue();
//			} else {
//				pageDisplayNum = DEFAULT_PAGE_DISPLAY_NUM;
//			}
//		}
//		result.put("pageDisplayNum", pageDisplayNum);
//		return result;
//	}
//	
//	private UserDO getUser(String username) {
//		@SuppressWarnings("unchecked")
//		List<UserDO> users = hibernateTemplate.find("from UserDO where username = ?", username);
//		return users.size() == 0 ? null : users.get(0);
//	}
//	
//	public void setHibernateTemplate(HibernateTemplate hibernateTemplate) {
//		this.hibernateTemplate = hibernateTemplate;
//	}
//	
//	public void setDictionaryDao(DictionaryDao dictionaryDao) {
//		this.dictionaryDao = dictionaryDao;
//	}
//	
//	public void setUserDao(UserDao userDao) {
//		this.userDao = userDao;
//	}
//	
//}
