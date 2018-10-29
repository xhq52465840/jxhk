package com.usky.sms.app;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.apache.log4j.Logger;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.usky.sms.config.Config;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.SMSException;
import com.usky.sms.http.service.GsonBuilder4SMS;

public class AppUtils {
	
	private static Gson gson = GsonBuilder4SMS.getInstance();
	
	private static Logger log = Logger.getLogger(AppUtils.class);
	
	private static Config config = Config.getInstance();
	
	/**
	 *  通过联合办公获取用户的devices
	 * @param username
	 * @throws Exception 
	 */
	@SuppressWarnings("unchecked")
	public static List<Map<String, Object>> getDevicesByUsername(String username) throws Exception {
		if (StringUtils.isBlank(config.getFetchDeviceUrl())) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "配置文件没有配置获取用户移动设备信息接口地址(fetchDeviceUrl)");
		}
		if (StringUtils.isBlank(config.getAppId())) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "配置文件没有配置移动appId(appId)");
		}
		String deviceTokenUrl = config.getFetchDeviceUrl() + "/" + username + "?appId=" + config.getAppId();
		DefaultHttpClient httpClient = new DefaultHttpClient();
		
		HttpGet httpGet = new HttpGet(deviceTokenUrl);
		try {
			HttpResponse response = httpClient.execute(httpGet);
			HttpEntity entity = response.getEntity();
			String content = EntityUtils.toString(entity);
			Map<String, Object> result = (Map<String, Object>) gson.fromJson(content, new TypeToken<Map<String, Object>>(){}.getType());
			if (!"ok".equals((String) result.get("status"))) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_112003001, username);
			}
			return (List<Map<String, Object>>) result.get("devices");
			
		} catch (IOException ex) {
			throw ex;
		} catch (RuntimeException ex) {
			httpGet.abort();
			throw ex;
		}finally {
			httpGet.releaseConnection();
		}
	}
	
	/**
	 * @param usernames 联合办公用户名的集合
	 * @param title 消息标题
	 * @param body 消息正文
	 * @param testMsg (true or false)是否为测试消息，如果是，则通过相应的测试服务器发送
	 * @throws SMSException 
	 */
	public static void pushMsgByUsernames(Collection<String> usernames, String title, String body, boolean testMsg) throws SMSException {
		if (null != usernames && !usernames.isEmpty()) {
			for (String username : usernames) {
				pushMsgByUsername(username, title, body, testMsg);
			}
		}
	}
	
	/**
	 * @param username 联合办公用户名
	 * @param title 消息标题
	 * @param body 消息正文
	 * @param testMsg (true or false)是否为测试消息，如果是，则通过相应的测试服务器发送
	 * @throws SMSException 
	 */
	public static void pushMsgByUsername(String username, String title, String body, boolean testMsg) throws SMSException {
		if (null != username) {
			try {
				List<Map<String, Object>> devices = AppUtils.getDevicesByUsername(username);
				if (null != devices) {
					for (Map<String, Object> device : devices) {
						String mobieOs = "1".equals(device.get("platform")) ? "android" : "ios";
						String deviceToken = (String) device.get("deviceToken");
						AppUtils.pushMsg(title, body, config.getAppId(), mobieOs, deviceToken, testMsg);
					}
				}
			} catch (Exception e) {
				log.error("推送消息失败！", e);
				throw new SMSException(MessageCodeConstant.MSG_CODE_138000001, e.getMessage());
			}
		}
	}
	
	/**
	 * 
	 * @param title 消息标题
	 * @param body 消息正文
	 * @param appId 生产环境：sdk10098
	 * @param mobileOs 不可以为空，取值为：ios or android
	 * @param softToken 由widgetOne负责生成并上报,是widget的唯一标识 即deviceToken
	 * @param testMsg (true or false)是否为测试消息，如果是，则通过相应的测试服务器发送
	 * @throws IOException 
	 */
	private static void pushMsg(String title, String body, String appId,  String mobileOs, String softToken, boolean testMsg) throws IOException {
		if (StringUtils.isBlank(config.getPushMsgUrl())) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "配置文件没有配置推送消息的接口地址(pushMsgUrl)");
		}
		String pushMsgUrl = config.getPushMsgUrl();
		DefaultHttpClient httpClient = new DefaultHttpClient();
		List<NameValuePair> nvps = new ArrayList<NameValuePair>();
		nvps.add(new BasicNameValuePair("title", title));
		nvps.add(new BasicNameValuePair("body", body));
		nvps.add(new BasicNameValuePair("appId", appId));
		nvps.add(new BasicNameValuePair("mobileOs", mobileOs));
		nvps.add(new BasicNameValuePair("softToken", softToken));
		nvps.add(new BasicNameValuePair("testMsg", testMsg ? "true" : "false"));
		nvps.add(new BasicNameValuePair("stream.contentType", "text/json;charset=utf-8"));
		HttpPost httpPost = new HttpPost(pushMsgUrl);
		try {
			httpPost.setEntity(new UrlEncodedFormEntity(nvps, "UTF-8"));
			HttpResponse response = httpClient.execute(httpPost);
			HttpEntity entity = response.getEntity();
			String content = EntityUtils.toString(entity);
			@SuppressWarnings("unchecked")
			Map<String, Object> result = (Map<String, Object>) gson.fromJson(content, new TypeToken<Map<String, Object>>(){}.getType());
			if (!"ok".equals((String) result.get("status"))) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_138000001, result.get("info"));
			}
			
		} catch (IOException ex) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_138000001, ex.getMessage());
		} catch (RuntimeException ex) {
			httpPost.abort();
			throw new SMSException(MessageCodeConstant.MSG_CODE_138000001, ex.getMessage());
		}finally {
			httpPost.releaseConnection();
		}
	}

}
