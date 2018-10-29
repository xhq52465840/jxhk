package com.usky.sms.filter;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;

public class ContentReplaceHttpServletRequestWapper extends HttpServletRequestWrapper {

	public ContentReplaceHttpServletRequestWapper(HttpServletRequest request) {
		super(request);
	}

	@Override
	public String getParameter(String name) {
		String old = super.getParameter(name);
		old = doFilter(old);
		return old;
	}

	private String doFilter(String old) {
		if (null != old) {
			String str = "((\\%3C)|<)[^\\n]+((\\%3E)|>)";
			Pattern pattern = Pattern.compile(str, Pattern.CASE_INSENSITIVE);
			Matcher matcher = pattern.matcher(old);
			matcher.replaceAll("");
		}
		return old;
	}
}
