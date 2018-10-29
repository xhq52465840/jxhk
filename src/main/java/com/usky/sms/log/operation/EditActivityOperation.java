
package com.usky.sms.log.operation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.MDC;

import com.usky.comm.JsonUtil;

public class EditActivityOperation extends AbstractActivityLoggingOperation {
	
	@Override
	public String getName() {
		return "EDIT_ACTIVITY";
	}
	
	@Override
	public String getPrefix() {
		return "更新了";
	}
	
	@Override
	public String getSuffix() {
		return "的内容";
	}
	
	@Override
	public String getData() {
		Object details = MDC.get("details");
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("details", details);
		return JsonUtil.toJson(map);
	}

	@Override
	public String getRemark(String data) {
		return "";
	}
	
	@Override
	public List<Object> getDetails(String data) {
		List<Object> list = new ArrayList<Object>();
		@SuppressWarnings("unchecked")
		Map<String, Object> dataMap = (Map<String, Object>) JsonUtil.getGson().fromJson(data, Object.class);
		if (dataMap != null) {
			@SuppressWarnings("unchecked")
			List<String> details = (List<String>) dataMap.get("details");
			if (details == null) return list;
			for (String detail : details) {
				Map<String, String> map = new HashMap<String, String>();
				map.put("content", detail);
				list.add(map);
			}
		}
		return list;
	}
	
}
