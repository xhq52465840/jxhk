package com.usky.sms.external.wrapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.usky.sms.flightmovementinfo.FlightDispatchInfoDO;

public class DispatchInfoWrapper {

	/**
	 * 将外部接口返回的签派信息数据封装成FlightDispatchInfoDO
	 * @param map
	 * @return
	 */
	public static FlightDispatchInfoDO wrapFromMap(Map<String, Object> map) {
		if (map != null) {
			FlightDispatchInfoDO flightDispatchInfoDO = new FlightDispatchInfoDO();
			flightDispatchInfoDO.setDispatcher((String) map.get("user_name"));
			flightDispatchInfoDO.setPlanTakeOffFuel(map.get("fixed_fuel") == null ? null : Double.parseDouble((String) map.get("fixed_fuel")));
			flightDispatchInfoDO.setBurn(map.get("dispatch_seg_fuel") == null ? null : Double.parseDouble((String) map.get("dispatch_seg_fuel")));
			flightDispatchInfoDO.setAdjustedMTOW(map.get("max_depart_weight") == null ? null : Double.parseDouble((String) map.get("max_depart_weight")));
			flightDispatchInfoDO.setMaxLandingWeight(map.get("max_landfall_weight") == null ? null : Double.parseDouble((String) map.get("max_landfall_weight")));
			flightDispatchInfoDO.setOperatingEmptyWeight(map.get("operate_empty_weight") == null ? null : Double.parseDouble((String) map.get("operate_empty_weight")));
			return flightDispatchInfoDO;
		}
		return null;
	}
	
	/**
	 * 将外部接口返回的签派信息数据的list封装成FlightDispatchInfoDO的list
	 * @param maps 签派信息数据的map的list
	 * @return
	 */
	public static List<FlightDispatchInfoDO> wrapFromMaps(List<Map<String, Object>> maps) {
		List<FlightDispatchInfoDO> list = new ArrayList<FlightDispatchInfoDO>();
		if (maps != null) {
			for (Map<String, Object> map : maps) {
				FlightDispatchInfoDO flightDispatchInfoDO = wrapFromMap(map);
				if (flightDispatchInfoDO != null) {
					list.add(flightDispatchInfoDO);
				}
			}
		}
		return list;
	}
}
