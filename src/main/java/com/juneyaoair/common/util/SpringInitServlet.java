package com.juneyaoair.common.util;

import java.util.Properties;

import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;

public class SpringInitServlet extends HttpServlet {
	static final long serialVersionUID = -1111516993124229949L;  
	  
    /** 
     * 启动对象实例 
     */  
    private SpringDBInit sdbinit = SpringDBInit.getInstance();  
  
    /** 
     * servlet初始化 
     */  
    public void init(ServletConfig config)  
        throws ServletException  
    {  
  
        super.init(config);  
        Properties props = new Properties();  
        props.put("APP_CONTEXT", config.getServletContext());  
        // 文件路径  
        String prefix = getServletContext().getRealPath("/");  
  
        // web应用路径  
        props.put("APP_PATH", prefix);  
  
        try  
        {  
            sdbinit.init(props);  
        }  
        catch (Exception e)  
        {  
  
        }  
    }  
}
