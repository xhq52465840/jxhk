
package com.usky.sms.filter;

import java.io.IOException;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.web.context.support.WebApplicationContextUtils;

import com.usky.sms.common.ResponseHelper;
import com.usky.sms.service.Service;
import com.usky.sms.service.ServiceRegister;
import com.usky.sms.user.UserContext;

public class DispatcherFilter implements Filter {
	
	private static final Logger log = Logger.getLogger(DispatcherFilter.class);
	
	@Override
	public void init(FilterConfig config) throws ServletException {
		// do nothing
	}
	
	@Override
	public void destroy() {
		// do nothing
	}
	
	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws ServletException, IOException {
		long beginTime = System.currentTimeMillis();
		String methodName = null;
		HttpServletRequest req = (HttpServletRequest) request;
		Enumeration<String> ems = req.getParameterNames();
		List<String> params = new ArrayList<String>();
		if (null != ems) {
			while (ems.hasMoreElements()) {
				String param = ems.nextElement();
				params.add(param + ":" + request.getParameter(param));
			}
		}
		HttpServletResponse res = (HttpServletResponse) response;
		try {
			req.setCharacterEncoding("UTF-8");
			String serviceName = this.getServiceName(req);
			String methodSign = this.getMethodSign(req);
			Service service = ServiceRegister.getService(serviceName, methodSign);
			String beanName;
//			String methodName;
			if (service == null) {
				beanName = serviceName;
				methodName = "doDefault";
			} else {
				beanName = service.getBeanName();
				methodName = service.getMethodName();
			}
			Object bean = getService(req.getSession().getServletContext(), beanName);
			Method method = getMethod(bean.getClass(), methodName);
			methodName = method.getName();
			log.info(UserContext.getUsername() + "调用服务[" + methodName + "], 参数[" + StringUtils.join(params, ",") + "]开始");
			method.invoke(bean, req, res);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(res, e);
		} finally {
			log.info(UserContext.getUsername() + "调用服务[" + methodName + "], 参数[" + StringUtils.join(params, ",") + "]结束, 共耗时" + (System.currentTimeMillis() - beginTime) + "ms");
		}
	}
	
	private String getServiceName(HttpServletRequest request) {
		String uri = request.getRequestURI();
		return uri.substring(request.getContextPath().length() + 1, uri.indexOf(".do"));
	}
	
	private String getMethodSign(HttpServletRequest request) {
		return request.getParameter("method");
	}
	
	private Object getService(ServletContext context, String beanName) {
		return WebApplicationContextUtils.getRequiredWebApplicationContext(context).getBean(beanName);
	}
	
	private Method getMethod(Class<?> clazz, String methodName) throws SecurityException, NoSuchMethodException {
		return clazz.getMethod(methodName, HttpServletRequest.class, HttpServletResponse.class);
	}
	
}
