package com.usky.sms.external.wrapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.usky.sms.flightmovementinfo.LoadSheetDO;

public class LoadSheetWrapper {

	/**
	 * 将外部接口返回的舱单信息数据封装成LoadSheetDO
	 * @param map
	 * @return
	 */
	public static LoadSheetDO wrapFromMap(Map<String, Object> map) {
		if (map != null) {
			LoadSheetDO loadSheetDO = new LoadSheetDO();
			loadSheetDO.setFlightLayout((String) map.get("layout"));
			loadSheetDO.setCompartmentsTotalLoad(map.get("cargo") == null ? null : Integer.parseInt((String) map.get("cargo")));
			loadSheetDO.setPassengerWeight(map.get("passengerweight") == null ? null : Integer.parseInt((String) map.get("passengerweight")));
			loadSheetDO.setAdultPassenger(map.get("adult") == null ? null : Integer.parseInt((String) map.get("adult")));
			loadSheetDO.setChildPassenger(map.get("children") == null ? null : Integer.parseInt((String) map.get("children")));
			loadSheetDO.setBabyPassenger(map.get("infant") == null ? null : Integer.parseInt((String) map.get("infant")));
			loadSheetDO.setBag(map.get("baggage") == null ? null : Double.parseDouble((String) map.get("baggage")));
			loadSheetDO.setPos(map.get("mail") == null ? null : Double.parseDouble((String) map.get("mail")));
			loadSheetDO.setMaxTrafficLoad(map.get("max_load") == null ? null : Double.parseDouble((String) map.get("max_load")));
			loadSheetDO.setTotalTrafficLoad(map.get("totaltrafficload") == null ? null : Double.parseDouble((String) map.get("totaltrafficload")));
			return loadSheetDO;
		}
		return null;
	}
	
	/**
	 * 将外部接口返回的舱单信息数据的list封装成LoadSheetDO的list
	 * @param maps 舱单信息数据的map的list
	 * @return
	 */
	public static List<LoadSheetDO> wrapFromMaps(List<Map<String, Object>> maps) {
		List<LoadSheetDO> list = new ArrayList<LoadSheetDO>();
		if (maps != null) {
			for (Map<String, Object> map : maps) {
				LoadSheetDO loadSheetDO = wrapFromMap(map);
				if (loadSheetDO != null) {
					list.add(loadSheetDO);
				}
			}
		}
		return list;
	}
}
