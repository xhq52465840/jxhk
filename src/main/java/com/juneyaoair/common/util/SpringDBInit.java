package com.juneyaoair.common.util;

import java.util.Locale;
import java.util.Properties;

import javax.servlet.ServletContext;

import org.springframework.context.ApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;


public class SpringDBInit  
{  
    /** 
     * 系统应用spring环境 
     */  
    private static ApplicationContext ctx;  
  
    /** 
     * 单实例对象 
     */  
    private static SpringDBInit instance = null;  
  
    private SpringDBInit()  
    {  
  
    }  
  
    /** 
     * 获得单实例对象 
     *  
     * @return 
     */  
    public static SpringDBInit getInstance()  
    {  
        if (instance == null)  
        {  
            synchronized (SpringDBInit.class)  
            {  
                if (instance == null)  
                {  
                    instance = new SpringDBInit();  
                }  
            }  
        }  
        return instance;  
    }  
  
    /** 
     * 初始化Spring组件 
     */  
    public void init(Properties props)  
        throws Exception  
    {  
        loadContextXML(props);  
    }  
  
    /** 
     * 加载spring对象 
     *  
     * @param props 
     */  
    private void loadContextXML(Properties props)  
        throws Exception  
    {  
        /* 
         * LogFactory.getInstance().logRun(RunPriority.INFORMATIONAL, 
         * LogConstants.sysLogConstants.INT_SPRING_START, null ); 
         */  
        try  
        {  
            ServletContext servletContext = (ServletContext) props  
                .get("APP_CONTEXT");  
            if (servletContext != null)  
                ctx = WebApplicationContextUtils  
                    .getRequiredWebApplicationContext(servletContext);  
        }  
  
        catch (Exception e)  
        {  
            e.printStackTrace();  
  
        }  
        if ((ctx == null) || (ctx.getBeanDefinitionNames().length == 0))  
        {  
  
        }  
  
    }  
  
    /** 
     * 得到一个spring的配置对象 
     *  
     * @param name 
     * @return 
     */  
    public Object getBean(String name)  
    {  
        if (ctx == null)  
            return null;  
        else  
            return ctx.getBean(name);  
    }  
  
    /** 
     * 获取单个信息 
     *  
     * @param key 
     * @param object 
     * @param request 
     * @return 
     */  
    public static String getMessage(String key, Object[] object, Locale locale)  
    {  
        return ctx.getMessage(key, object, locale);  
    }  
}  