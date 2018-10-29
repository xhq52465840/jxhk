package com.usky.sms.common;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class HttpHelper {

	/**
	 * 设置cookie
	 * 
	 * @param response
	 * @param name
	 *            cookie名字
	 * @param value
	 *            cookie值
	 * @param maxAge
	 *            cookie生命周期 以秒为单位
	 */
	public static void addCookie(HttpServletResponse response, String name, String value, Integer maxAge, String domain) {
		Cookie cookie = null;
		try {
			value = value == null ? null : URLEncoder.encode(value, "UTF-8");
			cookie = new Cookie(name, value);
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}
		if (cookie != null) {
			cookie.setPath("/");
			if (maxAge != null && maxAge > 0) {
				cookie.setMaxAge(maxAge);
			}
			if (domain != null) {
				cookie.setDomain(domain);
			}
			response.addCookie(cookie);
		}
	}
	
	/**
	 * 设置cookie
	 * 
	 * @param response
	 * @param name
	 *            cookie名字
	 * @param value
	 *            cookie值
	 * @param maxAge
	 *            cookie生命周期 以秒为单位
	 */
	public static void addCookie(HttpServletResponse response, Map<String, Object> cookieMap) {
		if (cookieMap != null) {
			for (Entry<String, Object> entry : cookieMap.entrySet()) {
				if (entry.getValue() != null) {
					addCookie(response, entry.getKey(), entry.getValue().toString(), null, null);
				}
			}
		}
	}

	/**
	 * 根据名字获取cookie
	 * 
	 * @param request
	 * @param name
	 *            cookie名字
	 * @return
	 */
	public static Cookie getCookieByName(HttpServletRequest request, String name) {
		Map<String, Cookie> cookieMap = ReadCookieMap(request);
		if (cookieMap.containsKey(name)) {
			Cookie cookie = (Cookie) cookieMap.get(name);
			return cookie;
		} else {
			return null;
		}
	}

	/**
	 * 将cookie封装到Map里面
	 * 
	 * @param request
	 * @return
	 */
	private static Map<String, Cookie> ReadCookieMap(HttpServletRequest request) {
		Map<String, Cookie> cookieMap = new HashMap<String, Cookie>();
		Cookie[] cookies = request.getCookies();
		if (null != cookies) {
			for (Cookie cookie : cookies) {
				cookieMap.put(cookie.getName(), cookie);
			}
		}
		return cookieMap;
	}
}
