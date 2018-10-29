package com.juneyaoair.common.util;
import com.juneyaoair.service.NcInfoService;
import com.juneyaoair.sms.service.SmsService;

public class SmsSingleton {
    private SmsSingleton() {   
    }   
    private static SmsService smsService;
    
    private static NcInfoService ncInfoService; 

    public static SmsService getInstance() {
        if (smsService == null){
        	smsService = (SmsService) SpringDBUtil.getBean("smsService"); 
        }
        return smsService;   
    }
    
    public static NcInfoService getInstanceNC() {
        if (ncInfoService == null){
        	ncInfoService = (NcInfoService) SpringDBUtil.getBean("ncInfoService"); 
        }
        return ncInfoService;   
    }
}
