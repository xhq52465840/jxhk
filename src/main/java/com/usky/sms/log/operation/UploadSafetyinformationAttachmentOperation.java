package com.usky.sms.log.operation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.MDC;

import com.usky.comm.JsonUtil;
import com.usky.sms.activity.action.ActionDO;
import com.usky.sms.activity.action.ActionDao;
import com.usky.sms.utils.SpringBeanUtils;

public class UploadSafetyinformationAttachmentOperation extends AbstractActivityLoggingOperation {

	@Override
	public String getName() {
		return "UPLOAD_SAFETYINFORMATION_ATTACHMENT";
	}

	@Override
	public String getPrefix() {
		return "为";
	}

	@Override
	public String getSuffix() {
		return "上传了附件";
	}

	@Override
	public String getData() {
		// 将actionId和details返回
		Object actionId = MDC.get("actionId");
		Object details = MDC.get("details");
		Map<String, Object> map = new HashMap<String, Object>();
		if (null != actionId) {
			map.put("actionId", actionId.toString());
		}
		map.put("details", details);
		return JsonUtil.toJson(map);
	}

	@Override
	public String getRemark(String data) {
		String result = "";
		// 解析data的数据获取actionId,返回对应action的body
		@SuppressWarnings("unchecked")
		Map<String, Object> dataMap = (Map<String, Object>) JsonUtil.getGson().fromJson(data, Object.class);
		String actionId = (String) dataMap.get("actionId");
		if (StringUtils.isBlank(actionId)) {
			return result;
		}
		ActionDao actionDao = (ActionDao) SpringBeanUtils.getBean("actionDao");
		ActionDO action = actionDao.internalGetById(Integer.parseInt(actionId));
		if (null != action && null != action.getBody()) {
			result = action.getBody();
		}
		return result;

	}

	@Override
	public List<Object> getDetails(String data) {
		List<Object> list = new ArrayList<Object>();
		// 解析data的数据获取details,对其进行处理
		@SuppressWarnings("unchecked")
		Map<String, Object> dataMap = (Map<String, Object>) JsonUtil.getGson().fromJson(data, Object.class);
		@SuppressWarnings("unchecked")
		List<String> details = (List<String>) dataMap.get("details");
		if (null == details) {
			return list;
		}

		for (Object detail : details) {
			Map<String, String> map = new HashMap<String, String>();
			map.put("content", detail.toString());
			list.add(map);
		}
		return list;
	}

}
