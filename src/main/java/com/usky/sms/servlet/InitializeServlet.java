
package com.usky.sms.servlet;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;

import org.springframework.web.context.support.WebApplicationContextUtils;
import org.springframework.web.context.support.XmlWebApplicationContext;

import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.event.EventRegister;
import com.usky.sms.field.FieldRegister;
import com.usky.sms.filter.AuthenticationFilter;
import com.usky.sms.flightmovementinfo.FlightInfoCache;
import com.usky.sms.menu.MenuCache;
import com.usky.sms.plugin.PluginDao;
import com.usky.sms.utils.SpringBeanUtils;

public class InitializeServlet extends HttpServlet {
	
	private static final long serialVersionUID = 1772911317066935425L;
	
	@Override
	public void init() throws ServletException {
		super.init();
		XmlWebApplicationContext context = (XmlWebApplicationContext) WebApplicationContextUtils.getRequiredWebApplicationContext(getServletContext());
		
		AuthenticationFilter.systemUpdating = 60;
		
		try {
			PluginDao pluginDao = (PluginDao) context.getBean("pluginDao");
			pluginDao.setContext(context);
			pluginDao.initialize();
		} catch (Exception e) {
			e.printStackTrace();
		}
		
		DictionaryDao dictionaryDao = (DictionaryDao) context.getBean("dictionaryDao");
		dictionaryDao.initialize();
		
		MenuCache menuCache = (MenuCache) context.getBean("menuCache");
		menuCache.setContext(context);
		menuCache.registerMenuBeans();
		menuCache.forceReload();
		
		EventRegister eventRegister = (EventRegister) context.getBean("eventRegister");
		eventRegister.forceReload();
		
		FieldRegister fieldRegister = (FieldRegister) context.getBean("fieldRegister");
		fieldRegister.forceReload();
		
		FlightInfoCache flightInfoCache = (FlightInfoCache) context.getBean("flightInfoCache");
		flightInfoCache.forceReload();
		
		SpringBeanUtils.setContext(context);
		
		AuthenticationFilter.systemUpdating = 100;
	}
	
}
