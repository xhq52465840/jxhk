
package com.usky.sms.subscribe;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.common.DateHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;

public class SubscribeService extends AbstractService {
	
	@Autowired
	private SubscribeDao subscribeDao;
	
	//获取当前系统时间
	public void getSysTime(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try{
			String currTime = DateHelper.formatIsoTimestamp(new Date());
			Map<String, Object> timemap = new HashMap<String, Object>();
			timemap.put("currTime", currTime);
			List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
			list.add(timemap);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", list);
			ResponseHelper.output(response, map);
		}catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/**
	 * 
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void excuteImmediately(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try{
			Integer subscribeId = StringUtils.isBlank(request.getParameter("subscribeId")) ? null : Integer.parseInt(request.getParameter("subscribeId"));
			if (null != subscribeId) {
				SubscribeDO subscribe = subscribeDao.internalGetById(subscribeId);
				subscribeDao.sendSubscribeEmail(null,subscribe);
			}
			
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);

			ResponseHelper.output(response, result);
		}catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	/**
	 * @param subscribeDao the subscribeDao to set
	 */
	public void setSubscribeDao(SubscribeDao subscribeDao) {
		this.subscribeDao = subscribeDao;
	}
}
