
package com.usky.sms.filter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;

import com.usky.sms.user.UserContext;

public class CharacterEncodingFilter implements Filter {
	
	private static final Logger log = Logger.getLogger(CharacterEncodingFilter.class);
	
	private String characterEncoding; // 编码方式，配置在web.xml中
	
	private boolean enabled; // 是否开启用该Filter,配置在web.xml中
	
	public void init(FilterConfig config) throws ServletException { // 初始化时加载参数
		characterEncoding = config.getInitParameter("characterEncoding");
		// 编码方式
		enabled = "true".equalsIgnoreCase(config.getInitParameter("enabled").trim());
		// 启用
	}
	
	public void destroy() {
		characterEncoding = null; // 销毁时清空资源
		
	}
	
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
		long timestamp = System.currentTimeMillis();
		if ("cjqu".equals(UserContext.getUsername())) {
			HttpServletRequest req = (HttpServletRequest) request;
			Enumeration<String> ems = req.getParameterNames();
			List<String> params = new ArrayList<String>();
			boolean isSearchex = false;
			if (null != ems) {
				while (ems.hasMoreElements()) {
					String param = ems.nextElement();
					params.add(param + ":" + request.getParameter(param));
					if (!isSearchex && "stdcomponent.getbysearchex".equals(request.getParameter(param))) {
						isSearchex = true;
					}
				}
			}
			if (isSearchex) {
				log.info(UserContext.getUsername() + "调用服务[stdcomponent.getbysearchex], 参数[" + StringUtils.join(params, ",") + "]开始");
			}
		}
		if (enabled || characterEncoding != null) { // 如果启用该Filter
			request.setCharacterEncoding(characterEncoding); // 设置request编码
		}
		if (enabled || characterEncoding != null) { // 如果启用该Filter
			response.setCharacterEncoding(characterEncoding); // 设置response编码
		}
		chain.doFilter(request, response);
		log.debug("本次请求耗时（ms）：" + (System.currentTimeMillis() - timestamp));
	}
}
