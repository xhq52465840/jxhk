
package com.usky.sms.label;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;

public class LabelService extends AbstractService {
	
	@Autowired
	private LabelDao labelDao;
	
	public void getLabels(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String filter = request.getParameter("filter");
			List<String> labels = labelDao.getLabels(filter);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", labels);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void setLabelDao(LabelDao labelDao) {
		this.labelDao = labelDao;
	}
	
}
