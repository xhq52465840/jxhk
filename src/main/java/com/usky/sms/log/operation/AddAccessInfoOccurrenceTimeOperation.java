
package com.usky.sms.log.operation;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.MDC;

import com.usky.comm.JsonUtil;

/**
 * 息获取创建发生时间的活动日志
 * @author 郑小龙
 *
 */
public class AddAccessInfoOccurrenceTimeOperation extends AbstractActivityLoggingOperation {
	
	@Override
	public String getName() {
		return "ADD_ACCESSINFO_OCCURRENCETIME";
	}
	
	@Override
	public String getPrefix() {
		return "为";
	}
	
	@Override
	public String getSuffix() {
		return "添加了信息获取";
	}
	
	@Override
	public String getData() {
		// 将details返回
		Object details = MDC.get("details");
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("details", details);
		return JsonUtil.toJson(map);
	}

	@Override
	public String getRemark(String data) {
		// 没有备注
		return "";
	}

	@Override
	public List<Object> getDetails(String data) {
		List<Object> list = new ArrayList<Object>();
		// 解析data的数据获取details,对其进行处理
		@SuppressWarnings("unchecked")
		Map<String, Object> dataMap = (Map<String, Object>) JsonUtil.getGson().fromJson(data, Object.class);
		if (null != dataMap) {
			@SuppressWarnings("unchecked")
			List<String> details = (List<String>) dataMap.get("details");
			if (null == details) {
				return list;
			}

			for(String detail : details){
				Map<String, String> map = new HashMap<String, String>();
				map.put("content", detail);
				list.add(map);
			}
		}
		return list;
	}

}
