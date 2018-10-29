
package com.usky.sms.common;

import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;

import com.google.gson.Gson;
import com.usky.sms.core.SMSException;
import com.usky.sms.http.service.GsonBuilder4SMS;

public class ResponseHelper {
	
	private static final Logger log = Logger.getLogger(ResponseHelper.class);
	
	private static Gson gson = GsonBuilder4SMS.getInstance();
	
	public static void output(HttpServletResponse response, Object obj) {
		try {
			String json = gson.toJson(obj);
			log.debug("Json: " + json);
			responseSetting(response);
			PrintWriter out = response.getWriter();
			out.println(json);
			out.flush();
			out.close();
		} catch (Exception ex) {
			output(response, ex);
		}
	}
	
	public static void output(HttpServletResponse response, SMSException e) {
		try {
			log.error(e.getMessage(), e);
			//		if (!response.isCommitted()) response.reset();
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", false);
			result.put("code", Double.parseDouble(e.getCode()));
			result.put("reason", e.getLocalizedMessage());
			String json = gson.toJson(result);
			responseSetting(response);
			PrintWriter out = response.getWriter();
			out.println(json);
			out.flush();
			out.close();
		} catch (Exception ex) {
			output(response, ex);
		}
	}
	
	public static void output(HttpServletResponse response, Exception e) {
		try {
			log.error(e.getMessage(), e);
			//		if (!response.isCommitted()) response.reset();
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", false);
			result.put("code", Double.parseDouble(SMSException.UNKNOWN_EXCEPTION.getCode()));
			result.put("reason", SMSException.UNKNOWN_EXCEPTION.getLocalizedMessage());
			String json = gson.toJson(result);
			responseSetting(response);
			PrintWriter out = response.getWriter();
			out.println(json);
			out.flush();
			out.close();
		} catch (Exception ex) {
			output(response, ex);
		}
	}
	
	public static void output4Workflow(HttpServletResponse response, SMSException e) {
		try {
			log.error(e.getMessage(), e);
			//		if (!response.isCommitted()) response.reset();
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("status", Integer.parseInt(e.getCode()));
			result.put("msg", e.getLocalizedMessage());
			String json = gson.toJson(result);
			responseSetting(response);
			PrintWriter out = response.getWriter();
			out.println(json);
			out.flush();
			out.close();
		} catch (Exception ex) {
			output4Workflow(response, ex);
		}
	}
	
	public static void output4Workflow(HttpServletResponse response, Exception e) {
		try {
			log.error(e.getMessage(), e);
			//		if (!response.isCommitted()) response.reset();
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("status", -1);
			result.put("msg", SMSException.UNKNOWN_EXCEPTION.getLocalizedMessage());
			String json = gson.toJson(result);
			responseSetting(response);
			PrintWriter out = response.getWriter();
			out.println(json);
			out.flush();
			out.close();
		} catch (Exception ex) {
			output4Workflow(response, ex);
		}
	}
	
	private static void responseSetting(HttpServletResponse response) {
		response.setContentType("application/json");
		response.setCharacterEncoding("UTF-8");
		response.setHeader("Pragma", "no-cache");
		response.setHeader("Cache-Control", "no-cache");
	}
	
}
