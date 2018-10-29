package com.usky.sms.aircraftType;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;

public class AircraftModelService extends AbstractService {
	
	@Autowired
	private AircraftModelDao aircraftModelDao;

	public void modifyAircraftModel(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String paramType = request.getParameter("paramType");
			String code = (String) request.getParameter("code");
			String familycode = (String) request.getParameter("familycode");
			String manufacturer = (String) request.getParameter("manufacturer");
			Object data = null;
			if ("add".equals(paramType)) { // 新增
				if (StringUtils.isNotBlank(familycode)) {
					List<Map<String, Object>> maps = new ArrayList<Map<String,Object>>();
					String[] codes = StringUtils.split(code, ",");
					for (String c : codes) {
						Map<String, Object> map = new HashMap<String, Object>();
						map.put("code", StringUtils.strip(c));
						map.put("familycode", familycode);
						map.put("manufacturer", manufacturer);
						maps.add(map);
					}
					data = aircraftModelDao.save(maps);
				}
			} 
			
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", data);
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
	 * 查询机型分类(大分类)
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void getFamilycodeBySearch(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String code = (String) request.getParameter("code");
			String familycode = (String) request.getParameter("familycode");
			String manufacturer = (String) request.getParameter("manufacturer");
			List<String> familyCodes = aircraftModelDao.getFieldBySearch("familycode", familycode, code, manufacturer, true);
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", PageHelper.getPagedResult(familyCodes, request));
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
	 * 查询机型分类(小分类)
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void getAircraftModelCodeBySearch(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String code = (String) request.getParameter("code");
			String familycode = (String) request.getParameter("familycode");
			String manufacturer = (String) request.getParameter("manufacturer");
			List<String> familyCodes = aircraftModelDao.getFieldBySearch("code", familycode, code, manufacturer, true);
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", PageHelper.getPagedResult(familyCodes, request));
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
	 * 查询机型厂商
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void getManufacturerBySearch(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String code = (String) request.getParameter("code");
			String familycode = (String) request.getParameter("familycode");
			String manufacturer = (String) request.getParameter("manufacturer");
			List<String> familyCodes = aircraftModelDao.getFieldBySearch("manufacturer", familycode, code, manufacturer, true);
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", PageHelper.getPagedResult(familyCodes, request));
			ResponseHelper.output(response, result);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	public void setAircraftModelDao(AircraftModelDao aircraftModelDao) {
		this.aircraftModelDao = aircraftModelDao;
	}

}
