package com.usky.sms.shortmessage;

import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.common.DateHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.user.UserContext;

public class ShortMessageService extends AbstractService {
	
	@Autowired
	private ShortMessageDao shortMessageDao;

	/**
	 * 发送短信
	 * 
	 */
	public void sendShortMessage(HttpServletRequest request, HttpServletResponse response) throws Exception {
		ShortMessageDO shortMessage = new ShortMessageDO();
		shortMessage.setCreator(UserContext.getUser());
		shortMessage.setReceiver(UserContext.getUser());
		shortMessage.setReceiveTel(request.getParameter("mobiles"));
		shortMessage.setMsgContent(request.getParameter("smContent"));
		
		
		shortMessageDao.sendShortMessage(shortMessage);
		try {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", null);

			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	public void setShortMessageDao(ShortMessageDao shortMessageDao) {
		this.shortMessageDao = shortMessageDao;
	}

}

