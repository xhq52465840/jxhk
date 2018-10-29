package com.usky.sms.external.wrapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.usky.sms.flightmovementinfo.AirportDO;

public class AirportWrapper {

	/**
	 * 将外部接口返回的机场数据封装成AirportDO
	 * @param map
	 * @return
	 */
	public static AirportDO wrapFromMap(Map<String, Object> map) {
		if (map != null) {
			AirportDO airportDO = new AirportDO();
			airportDO.setiATACode((String) map.get("airport_3code"));
			airportDO.setiCaoCode((String) map.get("airport_4code"));
			airportDO.setFullName((String) map.get("chinese_name"));
			airportDO.setFullEnName((String) map.get("english_name"));
			airportDO.setCityName((String) map.get("city_ch_name"));
			airportDO.setLongitude((String) map.get("longitude"));
			airportDO.setLatitude((String) map.get("latitude"));
			airportDO.setRegionType((String) map.get("a_fir"));
			airportDO.setIsJoinAirport((String) map.get("a_attr"));
			return airportDO;
		}
		return null;
	}
	
	/**
	 * 将外部接口返回的机场数据的list封装成AirportDO的list
	 * @param maps 机场数据的map的list
	 * @return
	 */
	public static List<AirportDO> wrapFromMaps(List<Map<String, Object>> maps) {
		List<AirportDO> list = new ArrayList<AirportDO>();
		if (maps != null) {
			for (Map<String, Object> map : maps) {
				AirportDO airportDO = wrapFromMap(map);
				if (airportDO != null) {
					list.add(airportDO);
				}
			}
		}
		return list;
	}
}
