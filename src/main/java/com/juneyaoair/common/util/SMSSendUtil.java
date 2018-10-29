package com.juneyaoair.common.util;

import java.net.URL;

import javax.xml.namespace.QName;

import org.apache.log4j.Logger;

import com.juneyaoair.sms.SmService;
import com.juneyaoair.sms.SmServiceSoap;

public class SMSSendUtil {

	private static final Logger log = Logger.getLogger(SMSSendUtil.class);
	
	private static final QName SERVICE_NAME = new QName("http://tempuri.org/", "SmService");

	private SMSSendUtil() {
	}

	public static int sendMessage(String smContent, String mobiles) {
		try {
			URL wsdlURL = SmService.WSDL_LOCATION;
			SmService smService = new SmService(wsdlURL, SERVICE_NAME);
			SmServiceSoap port = smService.getSmServiceSoap();
			return port.sendSm(smContent, mobiles, "ajadmin", "888888", "");
		} catch (Exception e) {
			log.error("调用域验证服务错误", e);
			return 0;
		}
	}

}
