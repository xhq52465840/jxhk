
package com.usky.sms.plugin;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.FileUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.context.support.WebApplicationContextUtils;
import org.springframework.web.context.support.XmlWebApplicationContext;

import com.google.gson.Gson;
import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.common.ZipHelper;
import com.usky.sms.config.Config;
import com.usky.sms.core.AbstractPlugin;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.filter.AuthenticationFilter;
import com.usky.sms.http.service.GsonBuilder4SMS;

public class PluginService extends AbstractService {
	
	private static final Logger log = Logger.getLogger(PluginService.class);
	
	private static Gson gson = GsonBuilder4SMS.getInstance();
	
	@Autowired
	private PluginDao pluginDao;
	
	private Config config;
	
	public PluginService() {
		this.config = Config.getInstance();
	}
	
	public void getList(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String type = request.getParameter("type");
			Object data;
			if ("manage".equals(type)) {
				data = PageHelper.getPagedResult(pluginDao.convert(pluginDao.getAllList()), request);
			} else if ("market".equals(type)) {
				Map<String, String> parameters = new HashMap<String, String>();
				parameters.put("method", "stdcomponent.getbysearch");
				parameters.put("dataobject", "plugin");
				@SuppressWarnings("unchecked")
				Map<String, Object> result = (Map<String, Object>) this.executeService("query.do", parameters);
				@SuppressWarnings("unchecked")
				List<Map<String, Object>> aaData = (List<Map<String, Object>>) result.get("aaData");
				for (PluginDO plugin : pluginDao.getList()) {
					for (Map<String, Object> pluginMap : aaData) {
						if (plugin.getKey().equals(pluginMap.get("key"))) {
							pluginMap.put("status", plugin.getStatus());
							break;
						}
					}
				}
				data = result;
			} else {
				throw SMSException.UNRECOGNIZED_REQUEST;
			}
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void installPlugin(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			AuthenticationFilter.systemUpdating = 0;
			String key = request.getParameter("key");
			Map<String, String> parameters = new HashMap<String, String>();
			parameters.put("method", "getplugin");
			parameters.put("key", key);
			@SuppressWarnings("unchecked")
			Map<String, Object> result = (Map<String, Object>) this.executeService("query.do", parameters);
			@SuppressWarnings("unchecked")
			Map<String, Object> pluginMap = (Map<String, Object>) result.get("plugin");
			pluginMap.remove("id");
			pluginMap.remove("created");
			pluginMap.remove("lastUpdate");
			pluginMap.put("status", "启用");
			pluginDao.save(pluginMap);
			@SuppressWarnings("unchecked")
			List<Double> list = (List<Double>) result.get("content");
			byte[] bytes = new byte[list.size()];
			for (int i = 0; i < list.size(); i++) {
				bytes[i] = list.get(i).byteValue();
			}
			String rootPathStr = request.getSession().getServletContext().getRealPath("/");
			String tempPathStr = rootPathStr + "/temp";
			File tempPath = new File(tempPathStr);
			if (tempPath.exists()) {
				FileUtils.cleanDirectory(tempPath);
			} else {
				tempPath.mkdir();
			}
			File plugin = new File(tempPathStr + "/" + key + ".zip");
			FileUtils.writeByteArrayToFile(plugin, bytes);
			ZipHelper.unZip(plugin, tempPathStr, false);
			FileUtils.copyFileToDirectory(new File(tempPathStr + "/" + key + ".jar"), new File(rootPathStr + config.getPluginLibPath()));
			FileUtils.copyDirectoryToDirectory(new File(tempPathStr + "/" + key), new File(rootPathStr + config.getPluginWebPath()));
			AuthenticationFilter.systemUpdating = 20;
			
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
	
	public void uninstallPlugin(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			AuthenticationFilter.systemUpdating = 0;
			String key = request.getParameter("key");
			ServletContext sc = request.getSession().getServletContext();
			XmlWebApplicationContext context = (XmlWebApplicationContext) WebApplicationContextUtils.getWebApplicationContext(sc);
			AbstractPlugin plugin = (AbstractPlugin) context.getBean(key + "Plugin");
			plugin.uninstall();
			pluginDao.deleteByKey(key);
			String rootPathStr = request.getSession().getServletContext().getRealPath("/");
			FileUtils.deleteQuietly(new File(rootPathStr + config.getPluginLibPath() + "/" + key + ".jar"));
			FileUtils.deleteQuietly(new File(rootPathStr + config.getPluginWebPath() + "/" + key));
			AuthenticationFilter.systemUpdating = 100;
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	private Object executeService(String serviceName, Map<String, String> parameters) throws Exception {
		DefaultHttpClient httpClient = new DefaultHttpClient();
		HttpPost httpPost = new HttpPost(config.getPluginService() + "/" + serviceName);
		List<NameValuePair> nvps = new ArrayList<NameValuePair>();
		if (parameters != null) {
			for (Map.Entry<String, String> entry : parameters.entrySet()) {
				nvps.add(new BasicNameValuePair(entry.getKey(), entry.getValue()));
			}
		}
		httpPost.setEntity(new UrlEncodedFormEntity(nvps, "UTF-8"));
		HttpResponse response = httpClient.execute(httpPost);
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
				Map<String, Object> result = (Map<String, Object>) gson.fromJson(builder.toString(), Object.class);
				Boolean success = (Boolean) result.get("success");
				if (success == null || success == false) {
					Double code = (Double) result.get("code");
					throw new SMSException(code == null ? null : code.toString(), (String) result.get("reason"));
				} else {
					return result.get("data");
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
	
	public void setPluginDao(PluginDao pluginDao) {
		this.pluginDao = pluginDao;
	}
	
}
