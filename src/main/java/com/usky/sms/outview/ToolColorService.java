package com.usky.sms.outview;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;

public class ToolColorService extends AbstractService{
	@Autowired
	private ToolColorDao toolColorDao;
	public void getToolColor(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		try {
			List<ToolColorDO> list = toolColorDao.getList();
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("data", toolColorDao.convert(list));
			result.put("success", true);
			ResponseHelper.output(response, result);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	public ToolColorDao getToolColorDao() {
		return toolColorDao;
	}
	public void setToolColorDao(ToolColorDao toolColorDao) {
		this.toolColorDao = toolColorDao;
	}
	
}
