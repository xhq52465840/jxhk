package com.juneyaoair.common.util;

public class SpringDBUtil {
	/** 
     * sjb管理类实例 
     */  
    private static SpringDBInit sdb = SpringDBInit.getInstance();  
  
    /** 
     * 得到一个系统配置 bean 
     *  
     * @param name bean的配置名称 
     * @return 如果系统没有加载返回 null 
     */  
    public static Object getBean(String name)  
    {  
        return sdb.getBean(name);  
    }  
}
