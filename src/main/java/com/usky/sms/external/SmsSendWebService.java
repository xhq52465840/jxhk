package com.usky.sms.external;

import java.net.URL;

import org.apache.log4j.Logger;

import com.juneyaoair.sms.SmService;
import com.juneyaoair.sms.SmServiceSoap;

public class SmsSendWebService {

	private static final Logger log = Logger.getLogger(SmsSendWebService.class);
	
	/** 发送短信接口地址 */
	private String emsServicelUrl;
	
	/** 发送短信接口登录名 */
	private String emsLoginName;
	
	/** 发送短信接口密码 */
	private String emsPassword;
	
	/**
	 * 发送短信
	 * @param smContent 短信内容
	 * @param mobiles 电话号码(以逗号隔开)
	 * @return
	 */ 
	public int sendMessage(String smContent, String mobiles) {
		try {
			log.info("调用外部接口SmService.sendSm开始");
			SmService smService = new SmService(new URL(emsServicelUrl));
			SmServiceSoap port = smService.getSmServiceSoap();
			return port.sendSm(smContent, mobiles, emsLoginName, emsPassword, "");
		} catch (Exception e) {
			log.error("调用外部接口SmService.sendSm失败", e);
			return 0;
		}
	}

	public void setEmsServicelUrl(String emsServicelUrl) {
		this.emsServicelUrl = emsServicelUrl;
	}

	public void setEmsLoginName(String emsLoginName) {
		this.emsLoginName = emsLoginName;
	}

	public void setEmsPassword(String emsPassword) {
		this.emsPassword = emsPassword;
	}

}
