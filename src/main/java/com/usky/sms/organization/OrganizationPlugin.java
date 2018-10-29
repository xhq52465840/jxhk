
package com.usky.sms.organization;

import org.hibernate.cfg.Configuration;
import org.hibernate.impl.SessionFactoryImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.context.WebApplicationContext;

import com.usky.sms.core.AbstractPlugin;
import com.usky.sms.filter.AuthenticationFilter;
import com.usky.sms.menu.MenuCache;
import com.usky.sms.menu.MenuDao;
import com.usky.sms.unit.UnitDao;

public class OrganizationPlugin extends AbstractPlugin {
	
	@Autowired
	private MenuCache menuCache;
	
	@Autowired
	private UnitDao unitDao;
	
	@Override
	public void initialize(WebApplicationContext context) throws Exception {
		SessionFactoryImpl factory = (SessionFactoryImpl) context.getBean("sessionFactory");
		Configuration cfg = factory.getConfiguration();
		cfg.addAnnotatedClass(OrganizationDO.class);
		cfg.buildMappings();
		factory.rebuild();
		
		AuthenticationFilter.systemUpdating = 80;
		
		Thread.currentThread().getContextClassLoader().loadClass(OrganizationDO.class.getName());
		menuCache.forceReload();
		menuCache.setMenuDao((MenuDao) context.getBean("menuDao"));
		menuCache.addMenu("用户/用户管理/组织", null, "/sms/uui/com/sms/plugin/organization/OrgBrowser.html", null, null);
		
		unitDao.setContext(context);
		unitDao.registerFieldExtensibleBean("organizationDao");
	}
	
	@Override
	public void uninstall() throws Exception {
		menuCache.removeMenu("用户/用户管理/组织");
	}
	
	public void setMenuCache(MenuCache menuCache) {
		this.menuCache = menuCache;
	}

	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}
	
}
