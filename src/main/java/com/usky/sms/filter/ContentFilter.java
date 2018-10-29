package com.usky.sms.filter;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

public class ContentFilter implements Filter {
	@Override
	public void init(FilterConfig config) throws ServletException {
		// TODO Auto-generated method stub
	}

	@Override
	public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain) throws IOException, ServletException {
		HttpServletRequest request = (HttpServletRequest) req;

		// 使用包装对象来包裹原请求对象
		ContentReplaceHttpServletRequestWapper wapper = new ContentReplaceHttpServletRequestWapper(request);
		chain.doFilter(wapper, resp);
	}

	@Override
	public void destroy() {
		// TODO Auto-generated method stub
	}
}
