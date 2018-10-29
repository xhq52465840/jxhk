package com.usky.sms.audit.neishen;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;

public class InnerPlanService extends AbstractService {

	@Autowired
	private InnerPlanDao innerPlanDao;
	
	public void innerCreatePlan(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String obj = request.getParameter("obj");
			Map<String, Object> objMap = gson.fromJson(obj, new TypeToken<Map<String, Object>>() {}.getType());
			Integer id = innerPlanDao.innerCreatePlan(objMap);
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", id);
			ResponseHelper.output(response, result);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	public void getErJiZuZhiByUnit(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String unitId = request.getParameter("unitId");
			String term = request.getParameter("term");
			List<Map<String, Object>> list = innerPlanDao.getErJiZuZhiByUnit(unitId,term);
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", list);
			ResponseHelper.output(response, result);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void setInnerPlanDao(InnerPlanDao innerPlanDao) {
		this.innerPlanDao = innerPlanDao;
	}

}
