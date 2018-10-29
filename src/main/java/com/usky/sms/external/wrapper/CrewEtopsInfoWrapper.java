package com.usky.sms.external.wrapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.usky.sms.common.DateHelper;
import com.usky.sms.flightmovementinfo.CrewEtopsInfoDO;

public class CrewEtopsInfoWrapper {

	/**
	 * 将外部接口返回的ETOPS信息数据封装成CrewEtopsInfoDO
	 * @param map
	 * @return
	 */
	public static CrewEtopsInfoDO wrapFromMap(Map<String, Object> map) {
		if (map != null) {
			CrewEtopsInfoDO crewEtopsInfoDO = new CrewEtopsInfoDO();
			crewEtopsInfoDO.setP_code((String) map.get("p_code"));
			crewEtopsInfoDO.setAera_code((String) map.get("aera_codeetpops"));
			crewEtopsInfoDO.setAc_type((String) map.get("ac_type"));
			crewEtopsInfoDO.setValid_flag((String) map.get("valid_flag"));
			if (map.get("first_date") != null) {
				crewEtopsInfoDO.setFirst_date(DateHelper.parseIsoTimestamp((String) map.get("first_date")));
			}
			if (map.get("last_date") != null) {
				crewEtopsInfoDO.setLast_date(DateHelper.parseIsoTimestamp((String) map.get("last_date")));
			}
			if (map.get("op_time") != null) {
				crewEtopsInfoDO.setUpdTime(DateHelper.parseIsoTimestamp((String) map.get("op_time")));
			}
			return crewEtopsInfoDO;
		}
		return null;
	}
	
	/**
	 * 将外部接口返回的ETOPS信息数据的list封装成CrewEtopsInfoDO的list
	 * @param maps ETOPS信息数据的map的list
	 * @return
	 */
	public static List<CrewEtopsInfoDO> wrapFromMaps(List<Map<String, Object>> maps) {
		List<CrewEtopsInfoDO> list = new ArrayList<CrewEtopsInfoDO>();
		if (maps != null) {
			for (Map<String, Object> map : maps) {
				CrewEtopsInfoDO crewEtopsInfoDO = wrapFromMap(map);
				if (crewEtopsInfoDO != null) {
					list.add(crewEtopsInfoDO);
				}
			}
		}
		return list;
	}
}
