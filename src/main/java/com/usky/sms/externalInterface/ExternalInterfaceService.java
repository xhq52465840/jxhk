package com.usky.sms.externalInterface;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.common.DateHelper;
import com.usky.sms.common.NumberHelper;
import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;

public class ExternalInterfaceService extends AbstractService {

	@Autowired
	private ExternalInterfaceDao externalInterfaceDao;

	public void getActivityByTypeAndCreatedAndUnitZ(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String _type = request.getParameter("type");
			String _startDate = request.getParameter("startDate");
			String _endDate = request.getParameter("endDate");
			String _unit = request.getParameter("unit");
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			Integer type = ("".equals(_type) || _type == null) ? null : NumberHelper.toInteger(_type);
			if (type == null) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "请选择一个信息类型！");
			Date startDate = ("".equals(_startDate) || _startDate == null) ? null : sdf.parse(_startDate);
			if (startDate == null) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "请选择开始时间！");
			Date endDate = ("".equals(_endDate) || _endDate == null) ? null : sdf.parse(_endDate);
			if (endDate == null) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "请选择结束时间！");
			Integer unit = ("".equals(_unit) || _unit == null) ? null : NumberHelper.toInteger(_unit);
			if (unit == null) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "请选择一个安监机构！");
			List<Map<String,Object>> list = externalInterfaceDao.getActivityByTypeAndCreatedAndUnitZ(type, startDate, endDate, unit);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(list, request));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getRadarZ(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String _startDate = request.getParameter("startDate");
			String _endDate = request.getParameter("endDate");
			String _unit = request.getParameter("unit");
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			Date firstDay = ("".equals(_startDate) || _startDate == null) ? null : DateHelper.getFirstDayOfMonth(sdf.parse(_startDate));
			if (firstDay == null) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "请选择开始时间！");
			Date lastDay = ("".equals(_endDate) || _endDate == null) ? null : DateHelper.getLastDayOfMonth(sdf.parse(_endDate));
			if (lastDay == null) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "请选择结束时间！");
			Integer unitId = ("".equals(_unit) || _unit == null) ? null : NumberHelper.toInteger(_unit);
			if (unitId == null) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "请选择一个安监机构！");
			List<Map<String, Object>> list = externalInterfaceDao.getRadarZ(firstDay, lastDay, unitId);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data", list);
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	/**
	 * 系统管理→用户管理，增加按安监机构、组织等查询
	 * N代表new
	 * @param externalInterfaceDao
	 */
	public void getUserBySearchN(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String obj = request.getParameter("obj");
			Map<String, Object> objMap = gson.fromJson(obj, new TypeToken<Map<String, Object>>() {}.getType());
			List<Map<String, Object>> list = externalInterfaceDao.getUserBySearchN(objMap);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data", PageHelper.getPagedResult(list, request));
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getUserByOrganizationN(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			Integer orgId = (request.getParameter("id") == null || "".equals(request.getParameter("id"))) ? null : NumberHelper.toInteger(request.getParameter("id"));
			List<Map<String, Object>> list = externalInterfaceDao.getUserByOrganizationN(orgId);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data", list);
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getUserByRoleN(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String user = request.getParameter("user");
			Integer unitId = (request.getParameter("unit") == null || "".equals(request.getParameter("unit"))) ? null : NumberHelper.toInteger(request.getParameter("unit"));
			Integer roleId = (request.getParameter("role") == null || "".equals(request.getParameter("role"))) ? null : NumberHelper.toInteger(request.getParameter("role"));
			List<Map<String, Object>> list = externalInterfaceDao.getUserByRoleN(roleId, user, unitId);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("data", PageHelper.getPagedResult(list, request));
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/**
	 * 根据用户单位和信息部的需求，需要在管理大屏系统中统计事故症候万时率，其中的分子事故症候数量就是从我们的安全网中获取的。所以需要请你们协助开发一个接口：
	 * 输入 起、止日期
	 * 输出 事故症候数量（对应我们航空安全信息严重等级为严重事故症候、一般事故症候、地面事故症候三类信息数量的总和）* 
	 * @param request
	 * @param response
	 */
	@SuppressWarnings("unchecked")
	public void getSeverityByFliterN(HttpServletRequest request, HttpServletResponse response) {
		try {
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
			Date startDate = null;
			Date endDate = null;
			try {
				startDate = sdf.parse(request.getParameter("startDate"));
				endDate = sdf.parse(request.getParameter("endDate"));
			} catch (Exception e) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "请输入正确的开始日期和结束日期！");
				
			}
			String severityType_ = request.getParameter("severityType");
			List<String> severityType = new ArrayList<>();
			try {
				severityType.addAll((List<String>) gson.fromJson(severityType_, new TypeToken<List<String>>(){}.getType()));
			} catch (Exception e) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "严重程度应传入数组");
			}
			Integer result = externalInterfaceDao.getSeverityByFliterN(startDate,endDate,severityType);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", result);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}

	}
	
	public void setExternalInterfaceDao(ExternalInterfaceDao externalInterfaceDao) {
		this.externalInterfaceDao = externalInterfaceDao;
	}

}
