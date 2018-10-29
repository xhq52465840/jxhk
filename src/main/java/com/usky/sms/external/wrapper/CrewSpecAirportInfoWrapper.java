package com.usky.sms.external.wrapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.usky.sms.common.DateHelper;
import com.usky.sms.flightmovementinfo.CrewSpecAirportInfoDO;

public class CrewSpecAirportInfoWrapper {

	/**
	 * 将外部接口返回的特殊机场信息数据封装成CrewSpecAirportInfoDO
	 * @param map
	 * @return
	 */
	public static CrewSpecAirportInfoDO wrapFromMap(Map<String, Object> map) {
		if (map != null) {
			CrewSpecAirportInfoDO crewSpecAirportInfoDO = new CrewSpecAirportInfoDO();
			crewSpecAirportInfoDO.setP_code((String) map.get("p_code"));
			crewSpecAirportInfoDO.setRank_no((String) map.get("rank_no"));
			crewSpecAirportInfoDO.setRank_name((String) map.get("rank_name"));
			crewSpecAirportInfoDO.setAirport_code((String) map.get("airport_code"));
			crewSpecAirportInfoDO.setValid_flag((String) map.get("valid_flag"));
			crewSpecAirportInfoDO.setChinese_name((String) map.get("chinese_name"));
			crewSpecAirportInfoDO.setCityCode((String) map.get("city_3code"));
			crewSpecAirportInfoDO.setCityNameCn((String) map.get("city_ch_name"));
			if (map.get("first_date") != null) {
				crewSpecAirportInfoDO.setFirst_date(DateHelper.parseIsoTimestamp((String) map.get("first_date")));
			}
			if (map.get("last_date") != null) {
				crewSpecAirportInfoDO.setLast_date(DateHelper.parseIsoTimestamp((String) map.get("last_date")));
			}
			if (map.get("op_time") != null) {
				crewSpecAirportInfoDO.setUpdTime(DateHelper.parseIsoTimestamp((String) map.get("op_time")));
			}
			return crewSpecAirportInfoDO;
		}
		return null;
	}
	
	/**
	 * 将外部接口返回的特殊机场信息数据的list封装成CrewSpecAirportInfoDO的list
	 * @param maps 特殊机场信息数据的map的list
	 * @return
	 */
	public static List<CrewSpecAirportInfoDO> wrapFromMaps(List<Map<String, Object>> maps) {
		List<CrewSpecAirportInfoDO> list = new ArrayList<CrewSpecAirportInfoDO>();
		if (maps != null) {
			for (Map<String, Object> map : maps) {
				CrewSpecAirportInfoDO crewSpecAirportInfoDO = wrapFromMap(map);
				if (crewSpecAirportInfoDO != null) {
					list.add(crewSpecAirportInfoDO);
				}
			}
		}
		return list;
	}
}
