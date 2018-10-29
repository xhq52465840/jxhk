package com.usky.sms.external.wrapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.usky.sms.common.DateHelper;
import com.usky.sms.flightmovementinfo.CrewBaoWuDO;

public class CrewBaoWuWrapper {

	/**
	 * 将外部接口返回的报务信息数据封装成CrewBaoWuDO
	 * @param map
	 * @return
	 */
	public static CrewBaoWuDO wrapFromMap(Map<String, Object> map) {
		if (map != null) {
			CrewBaoWuDO crewBaoWuDO = new CrewBaoWuDO();
			crewBaoWuDO.setP_code((String) map.get("p_code"));
			crewBaoWuDO.setBm_name((String) map.get("bm_name"));
			crewBaoWuDO.setAera_code((String) map.get("aera_code"));
			crewBaoWuDO.setValid_flag((String) map.get("valid_flag"));
			if (map.get("first_date") != null) {
				crewBaoWuDO.setFirst_date(DateHelper.parseIsoTimestamp((String) map.get("first_date")));
			}
			if (map.get("last_date") != null) {
				crewBaoWuDO.setLast_date(DateHelper.parseIsoTimestamp((String) map.get("last_date")));
			}
			return crewBaoWuDO;
		}
		return null;
	}
	
	/**
	 * 将外部接口返回的报务信息数据的list封装成CrewBaoWuDO的list
	 * @param maps 报务信息数据的map的list
	 * @return
	 */
	public static List<CrewBaoWuDO> wrapFromMaps(List<Map<String, Object>> maps) {
		List<CrewBaoWuDO> list = new ArrayList<CrewBaoWuDO>();
		if (maps != null) {
			for (Map<String, Object> map : maps) {
				CrewBaoWuDO crewBaoWuDO = wrapFromMap(map);
				if (crewBaoWuDO != null) {
					list.add(crewBaoWuDO);
				}
			}
		}
		return list;
	}
}
