
package com.usky.sms.search.template;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;

public class SearchTemplateService extends AbstractService {
	
	public void getSearchTemplate(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String key = request.getParameter("key");
			List<ISearchTemplate> templates = SearchTemplateRegister.getSearchTemplates(key);
			List<Map<String, String>> data = new ArrayList<Map<String, String>>();
			for (ISearchTemplate template : templates) {
				Map<String, String> map = new HashMap<String, String>();
				map.put("key", template.getKey());
				map.put("name", template.getName());
				data.add(map);
			}
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
			//		} catch (SMSException e) {
			//			e.printStackTrace();
			//			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
}
