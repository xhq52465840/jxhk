package com.usky.sms.external.wrapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;

import com.usky.sms.common.DateHelper;

public class FlyTimePerDayWrapper {

	/**
	 * 将外部接口返回的飞行小时数数据的list封装成Map
	 * @param maps 飞行小时数数据的map的list
	 * @return
	 */
	public static Map<String, Double> wrapFromMaps(List<Map<String, Object>> maps) {
		Map<String, Double> result = new HashMap<String, Double>();
		if (maps != null) {
			for (Map<String, Object> map : maps) {
				if (map.get("flight_Date") != null) {
					String date = DateHelper.formatIsoDate(DateHelper.parseIsoTimestamp((String) map.get("flight_date")));
					String time = (String) map.get("gzsj_sum");
					result.put(date, StringUtils.isBlank(time) ? 0.0 : ((Double) Double.parseDouble(time)).intValue() / 60);
				}
			}
		}
		return result;
	}
}
