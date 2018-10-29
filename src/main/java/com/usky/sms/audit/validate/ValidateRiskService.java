package com.usky.sms.audit.validate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;

public class ValidateRiskService extends AbstractService {

	@Autowired
	private ActionItemCreatorDao actionItemCreatorDao;
	/**
	 * 风险验证列表
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void getValidateList(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			List<Map<String, Object>> list = actionItemCreatorDao.getValidateList(request);
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", PageHelper.getPagedResult(list, request));
			ResponseHelper.output(response, result);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	/**
	 * 分配验证人
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void saveFenPeiResult(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			actionItemCreatorDao.saveFenPeiResult(request);
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			ResponseHelper.output(response, result);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	public void setActionItemCreatorDao(ActionItemCreatorDao actionItemCreatorDao) {
		this.actionItemCreatorDao = actionItemCreatorDao;
	}

}
