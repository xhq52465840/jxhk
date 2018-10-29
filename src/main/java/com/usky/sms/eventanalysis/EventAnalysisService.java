
package com.usky.sms.eventanalysis;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;

public class EventAnalysisService extends AbstractService {
	
	@Autowired
	private EventAnalysisDao eventAnalysisDao;
	
	/**
	 * 保存事件分析
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void saveOrUpdateEventAnalysis(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			@SuppressWarnings("unchecked")
			Map<String, Object> map = gson.fromJson(request.getParameter("obj"), Map.class);
			int id = eventAnalysisDao.saveOrUpdateEventAnalysis(map);
			map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", id);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	public void setEventAnalysisDao(EventAnalysisDao eventAnalysisDao) {
		this.eventAnalysisDao = eventAnalysisDao;
	}
	
}
