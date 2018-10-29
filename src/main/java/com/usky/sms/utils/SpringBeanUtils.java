
package com.usky.sms.utils;

import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.HibernateTemplate;
import org.springframework.web.context.support.XmlWebApplicationContext;

public class SpringBeanUtils {
	
	private static XmlWebApplicationContext context;
	
	@Autowired
	private static HibernateTemplate hibernateTemplate;
	
	public static Object getBean(String beanName) {
		try {
			return context.getBean(beanName);
		} catch (NoSuchBeanDefinitionException e) {
			return null;
		}
	}
	
	public static void setContext(XmlWebApplicationContext context) {
		SpringBeanUtils.context = context;
	}
	
	public static HibernateTemplate getHibernateTemplate() {
		return hibernateTemplate;
	}
	
	public static void setHibernateTemplate(HibernateTemplate hibernateTemplate) {
		SpringBeanUtils.hibernateTemplate = hibernateTemplate;
	}
	
}
