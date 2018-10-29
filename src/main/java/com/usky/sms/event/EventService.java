
package com.usky.sms.event;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;

public class EventService extends AbstractService {
	
	@Autowired
	private EventRegister eventRegister;
	
	public void getAllEvents(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(new ArrayList<Event>(eventRegister.getEvents()), request));
			ResponseHelper.output(response, map);
			//		} catch (SMSException e) {
			//			e.printStackTrace();
			//			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void setEventRegister(EventRegister eventRegister) {
		this.eventRegister = eventRegister;
	}
	
}
