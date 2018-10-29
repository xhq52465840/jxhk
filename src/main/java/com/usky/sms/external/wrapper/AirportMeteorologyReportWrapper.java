package com.usky.sms.external.wrapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.usky.sms.common.DateHelper;
import com.usky.sms.flightmovementinfo.AirportMeteorologyReportDO;

public class AirportMeteorologyReportWrapper {

	/**
	 * 将外部接口返回的天气信息数据封装成AirportMeteorologyReportDO
	 * @param map
	 * @return
	 */
	public static AirportMeteorologyReportDO wrapFromMap(Map<String, Object> map) {
		if (map != null) {
			AirportMeteorologyReportDO airportMeteorologyReportDO = new AirportMeteorologyReportDO();
			airportMeteorologyReportDO.setiCaoCode((String) map.get("airport_4code"));
			airportMeteorologyReportDO.setReportUTCTime(map.get("receive_time") == null ? null : DateHelper.parseIsoTimestamp((String) map.get("receive_time")));
			airportMeteorologyReportDO.setCnMessage((String) map.get("content"));
			return airportMeteorologyReportDO;
		}
		return null;
	}
	
	/**
	 * 将外部接口返回的乘务信息数据的list封装成AirportMeteorologyReportDO的list
	 * @param maps 天气信息数据的map的list
	 * @return
	 */
	public static List<AirportMeteorologyReportDO> wrapFromMaps(List<Map<String, Object>> maps) {
		List<AirportMeteorologyReportDO> list = new ArrayList<AirportMeteorologyReportDO>();
		if (maps != null) {
			for (Map<String, Object> map : maps) {
				AirportMeteorologyReportDO airportMeteorologyReportDO = wrapFromMap(map);
				if (airportMeteorologyReportDO != null) {
					list.add(airportMeteorologyReportDO);
				}
			}
		}
		return list;
	}
}
