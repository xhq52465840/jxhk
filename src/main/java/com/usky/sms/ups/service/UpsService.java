
package com.usky.sms.ups.service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.apache.log4j.Logger;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.usky.sms.config.Config;
import com.usky.sms.config.ConfigService;
import com.usky.sms.core.SMSException;
import com.usky.sms.http.service.GsonNaturalDeserializer;

public class UpsService {
	
	private static final Logger log = Logger.getLogger(UpsService.class);
	
	private Config upsConfig;
	
	public UpsService() {
		this.upsConfig = new ConfigService().getConfig();
	}
	
	public Object login(String username, String password) throws Exception {
		Map<String, String> map = new HashMap<String, String>();
		map.put("usercode", username);
		map.put("password", password);
		Object obj = executeService("login", null, map);
		return obj;
	}
	
	public Object echo(String tokenId) throws Exception {
		return executeService("echo", tokenId, null);
	}
	
	public Object executeService(String serviceName, String tokenId, Map<String, String> parameters) throws Exception {
		return executeService(serviceName, tokenId, upsConfig.getSubSystem(), parameters);
	}
	
	public Object executeService(String serviceName, String tokenId, String subsystemName, Map<String, String> parameters) throws Exception {
		DefaultHttpClient httpClient = new DefaultHttpClient();
		HttpPost httpPost = new HttpPost(upsConfig.getUpsService());
		List<NameValuePair> nvps = new ArrayList<NameValuePair>();
		if (serviceName != null && !"".equals(serviceName)) {
			nvps.add(new BasicNameValuePair("sv", serviceName));
		}
		if (tokenId != null && !"".equals(tokenId)) {
			nvps.add(new BasicNameValuePair("tokenid", tokenId));
		}
		if (subsystemName != null && !"".equals(subsystemName)) {
			nvps.add(new BasicNameValuePair("subsysname", subsystemName));
		}
		if (parameters != null) {
			for (Map.Entry<String, String> entry : parameters.entrySet()) {
				nvps.add(new BasicNameValuePair(entry.getKey(), entry.getValue()));
			}
		}
		httpPost.setEntity(new UrlEncodedFormEntity(nvps, "UTF-8"));
		long timestamp = System.currentTimeMillis();
		HttpResponse response = httpClient.execute(httpPost);
		log.debug("本次访问UPS耗时（ms）：" + (System.currentTimeMillis() - timestamp));
		try {
			HttpEntity entity = response.getEntity();
			InputStream instream = entity.getContent();
			try {
				BufferedReader reader = new BufferedReader(new InputStreamReader(instream, "UTF-8"));
				StringBuilder builder = new StringBuilder();
				String line = "";
				while ((line = reader.readLine()) != null) {
					builder.append(line);
					builder.append("\n");
				}
				log.debug(builder);
				@SuppressWarnings("unchecked")
				Map<String, Object> result = (Map<String, Object>) newUpsGson().fromJson(builder.toString(), Object.class);
				@SuppressWarnings("unchecked")
				Map<String, Object> header = (Map<String, Object>) result.get("responseHeader");
				Double status = (Double) header.get("status");
				if (status != 0) {
					throw new SMSException(status.toString(), (String) header.get("msg"));
				} else {
					return result.get("responseData");
				}
			} catch (IOException ex) {
				throw ex;
			} catch (RuntimeException ex) {
				httpPost.abort();
				throw ex;
			} finally {
				try {
					instream.close();
				} catch (Exception ignore) {
				}
			}
		} finally {
			httpPost.releaseConnection();
		}
	}
	
	Gson newUpsGson() {
		GsonBuilder gsonBuilder = new GsonBuilder();
		gsonBuilder.registerTypeAdapter(Object.class, new GsonNaturalDeserializer());
		Gson gson = gsonBuilder.create();
		return gson;
	}
	
}
