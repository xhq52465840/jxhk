package com.usky.sms.external;

import java.util.Calendar;

import org.apache.log4j.Logger;

import com.google.gson.Gson;
import com.juneyaoair.common.util.SmsSingleton;
import com.juneyaoair.sms.model.SmsRequest;
import com.juneyaoair.sms.model.SmsResponse;
import com.usky.sms.common.DateHelper;
import com.usky.sms.http.service.GsonBuilder4SMS;

public class SmsSendDubboService {
	private static final Logger log = Logger.getLogger(UserDubboService.class);

	private static final Gson gson = GsonBuilder4SMS.getInstance();

//	@Autowired
//	private SmsService smsService;

	/** 发送短信接口登录名 */
	private String emsLoginName;
	
	/** 发送短信接口密码 */
	private String emsPassword;
	
	/** 发送短信类型*/
	private String smsType;

	/**
	 * 发送短信
	 * 
	 * @param smContent
	 *            短信内容
	 * @param mobiles
	 *             电话号码(以逗号隔开)
	 * @return
	 */
	public int sendMessage(String smContent, String mobiles) {
		try {
			SmsRequest request = new SmsRequest();
			request.setUserId(emsLoginName);
			request.setPassword(emsPassword);
			request.setContent(smContent);
			request.setMobiles(mobiles);
			request.setSmsType(smsType);
			// 当前时间  + 10分钟
			Calendar cal = Calendar.getInstance();
			cal.add(Calendar.MINUTE, 10);
			request.setEndSendTime(DateHelper.formatIsoSecond(cal.getTime()));
			SmsResponse smsResponse = SmsSingleton.getInstance().sendSms(request);
//			SmsResponse smsResponse = smsService.sendSms(request);
			Integer resultcode = Integer.parseInt(smsResponse.getResultcode());
			if (resultcode < 0) {
				// 发送失败
				log.error("调用外部接口SmService.sendSm失败, 错误详情：" + gson.toJson(smsResponse.getResultdata()));
			}
			return resultcode;
		} catch (Exception e) {
			log.error("调用外部接口SmService.sendSm失败", e);
			return 0;
		}
	}

//	public void setSmsService(SmsService smsService) {
//		this.smsService = smsService;
//	}

	public void setEmsLoginName(String emsLoginName) {
		this.emsLoginName = emsLoginName;
	}

	public void setEmsPassword(String emsPassword) {
		this.emsPassword = emsPassword;
	}

	public void setSmsType(String smsType) {
		this.smsType = smsType;
	}
	
}
