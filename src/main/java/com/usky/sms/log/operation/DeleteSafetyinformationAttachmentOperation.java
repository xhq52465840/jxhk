package com.usky.sms.log.operation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.MDC;

import com.usky.comm.JsonUtil;

public class DeleteSafetyinformationAttachmentOperation extends
		AbstractActivityLoggingOperation {

	@Override
	public String getName() {
		return "DELETE_SAFETYINFORMATION_ATTACHMENT";
	}

	@Override
	public String getPrefix() {
		return "为";
	}

	@Override
	public String getSuffix() {
		return "删除了附件";
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
		// 删除不需要备注
		return "";

	}

	@Override
	public List<Object> getDetails(String data) {
		List<Object> list = new ArrayList<Object>();
		// 解析data的数据获取details,对其进行处理
		@SuppressWarnings("unchecked")
		Map<String, Object> dataMap = (Map<String, Object>) JsonUtil.getGson()
				.fromJson(data, Object.class);
		@SuppressWarnings("unchecked")
		List<String> details = (List<String>) dataMap.get("details");
		if (null == details) {
			return null;
		}

		for (Object detail : details) {
			Map<String, String> map = new HashMap<String, String>();
			map.put("content", detail.toString());
			list.add(map);
		}
		return list;
	}

}
