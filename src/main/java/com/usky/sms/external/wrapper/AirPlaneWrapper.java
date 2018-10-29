package com.usky.sms.external.wrapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.usky.sms.common.DateHelper;
import com.usky.sms.flightmovementinfo.AirPlaneDO;

public class AirPlaneWrapper {

	/**
	 * 将外部接口返回的飞机数据封装成AirPlaneDO
	 * @param map
	 * @return
	 */
	public static AirPlaneDO wrapFromMap(Map<String, Object> map) {
		if (map != null) {
			AirPlaneDO airPlaneDO = new AirPlaneDO();
			airPlaneDO.setTailNo((String) map.get("ac_reg"));
			airPlaneDO.setCarrier((String) map.get("carrier"));
			airPlaneDO.setTypeShort((String) map.get("ac_type_short"));
			airPlaneDO.setTypeLong((String) map.get("ac_type_long"));
			if (map.get("max_depart_weight") != null) {
				airPlaneDO.setMaxDepartWeight(Double.valueOf((String) map.get("max_depart_weight")));
			}
			if (map.get("max_landfall_weight") != null) {
				airPlaneDO.setMaxLandfallWeight(Double.valueOf((String) map.get("max_landfall_weight")));
			}
			if (map.get("start_date") != null) {
				airPlaneDO.setStartDate(DateHelper.parseIsoTimestamp((String) map.get("start_date")));
			}
			if (map.get("end_date") != null) {
				airPlaneDO.setEndDate(DateHelper.parseIsoTimestamp((String) map.get("end_date")));
			}
			return airPlaneDO;
		}
		return null;
	}
	
	/**
	 * 将外部接口返回的飞机数据的list封装成AirPlaneDO的list
	 * @param maps 机场数据的map的list
	 * @return
	 */
	public static List<AirPlaneDO> wrapFromMaps(List<Map<String, Object>> maps) {
		List<AirPlaneDO> list = new ArrayList<AirPlaneDO>();
		if (maps != null) {
			for (Map<String, Object> map : maps) {
				AirPlaneDO airPlaneDO = wrapFromMap(map);
				if (airPlaneDO != null) {
					list.add(airPlaneDO);
				}
			}
		}
		return list;
	}
}
