package com.usky.sms.audit.padfunc;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.common.NumberHelper;
import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.file.FileService;

public class PadService extends AbstractService {

	@Autowired
	private HasCompletedDao hasCompletedDao;

	@Autowired
	private FileService fileService;
	
	public void getTaskPad(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String type = request.getParameter("type");
			String status = request.getParameter("status");
			List<Map<String, Object>> list = hasCompletedDao.getTaskPad(type, status);
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
	
	public void getTaskPadById(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String dataobject = request.getParameter("dataobject");
			String id = request.getParameter("id");
			if (dataobject == null || "".equals(dataobject)) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "未指定对象类型！");
			}
			if (id == null || "".equals(id)) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "未找到实体对象！");
			}
			Map<String, Object> map = hasCompletedDao.getTaskById(dataobject, NumberHelper.toInteger(id));
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", map);
			ResponseHelper.output(response, result);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getQar_event_tongbi(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			List<Map<String, Object>> list = hasCompletedDao.getQar_event_tongbi();
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
	
	public void getTODOCount(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			Map<String, Integer> map = hasCompletedDao.getTODOCount();
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", map);
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
	 * 为移动审计写得附件上传
	 * @param request
	 * @throws Exception
	 */
	public void downfile(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			List<Map<String, Object>> data = fileService.downfile(request);
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
	
	public void setHasCompletedDao(HasCompletedDao hasCompletedDao) {
		this.hasCompletedDao = hasCompletedDao;
	}

	public void setFileService(FileService fileService) {
		this.fileService = fileService;
	}
	
}
