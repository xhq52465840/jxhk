package com.usky.sms.risk.systemanalysis;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;

public class SystemAnalysisService extends AbstractService {
	
	@Autowired
	private SystemAnalysisDao systemAnalysisDao;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private DictionaryDao dictionaryDao;

	/**
	 * 查询系统分析
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public void getSystemAnalysisFactorBySearch(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			Integer systemId = request.getParameter("systemId") == null ? null : Integer.parseInt(request.getParameter("systemId"));
			Integer unitId = request.getParameter("unitId") == null ? null : Integer.parseInt(request.getParameter("unitId"));
			String subsystem = (String) request.getParameter("subsystem");
			String primaryWorkflow = (String) request.getParameter("primaryWorkflow");
			String secondaryWorkflow = (String) request.getParameter("secondaryWorkflow");
			String factor = (String) request.getParameter("factor");
			Object systemAnalysisFactors = systemAnalysisDao.getFieldBySearch(factor, systemId, unitId, subsystem, primaryWorkflow, secondaryWorkflow, true);
			if ("unit".equals(factor)) {
				systemAnalysisFactors = unitDao.convert((List<UnitDO>)(Object)systemAnalysisFactors, Arrays.asList(new String[]{"id", "name"}), false);
			} else if ("system".equals(factor)) {
				systemAnalysisFactors = dictionaryDao.convert((List<DictionaryDO>)(Object)systemAnalysisFactors, Arrays.asList(new String[]{"id", "name"}), false);
			}
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", systemAnalysisFactors);
			ResponseHelper.output(response, result);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void setSystemAnalysisDao(SystemAnalysisDao systemAnalysisDao) {
		this.systemAnalysisDao = systemAnalysisDao;
	}

	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}

	public void setDictionaryDao(DictionaryDao dictionaryDao) {
		this.dictionaryDao = dictionaryDao;
	}

}
