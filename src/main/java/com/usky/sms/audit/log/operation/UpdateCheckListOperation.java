package com.usky.sms.audit.log.operation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.MDC;

import com.usky.comm.JsonUtil;

public class UpdateCheckListOperation extends AbstractAuditActivityLoggingOperation {

	@Override
	public String getName() {
		return "UPDATE_CHECK_LIST";
	}

	@Override
	public String getPrefix() {
		return "更新了";
	}

	@Override
	public String getSuffix() {
		return null;
	}

	public String getData() {
		// 将details返回
		Object details = MDC.get("details");
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("details", details);
		return JsonUtil.toJson(map);
	}

	/**
	 * 
	 * @param data
	 *            方法getData的返回值
	 * @return 备注信息
	 */
	public String getRemark(String data) {
		// 没有备注
		return "";
	}

	public List<Object> getDetails(String data) {
		List<Object> list = new ArrayList<Object>();
		// 解析data的数据获取details,对其进行处理
		@SuppressWarnings("unchecked")
		Map<String, Object> dataMap = (Map<String, Object>) JsonUtil.getGson()
				.fromJson(data, Object.class);
		if (null != dataMap) {
			@SuppressWarnings("unchecked")
			List<String> details = (List<String>) dataMap.get("details");
			if (null == details) {
				return list;
			}
			for (String detail : details) {
				Map<String, String> map = new HashMap<String, String>();
				map.put("content", detail);
				list.add(map);
			}
		}
		return list;
	}
}
