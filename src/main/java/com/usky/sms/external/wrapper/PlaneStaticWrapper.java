package com.usky.sms.external.wrapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.usky.sms.common.DateHelper;
import com.usky.sms.flightmovementinfo.Maintenance.AircraftDO;

public class PlaneStaticWrapper {

	/**
	 * 将机务的外部接口返回的飞机数据封装成AircraftDO
	 * @param map
	 * @return
	 */
	public static AircraftDO wrapFromMap(Map<String, Object> map) {
		if (map != null) {
			AircraftDO aircraftDO = new AircraftDO();
			aircraftDO.setTail_no((String) map.get("acno"));
			// 机型
			aircraftDO.setAircraft_type((String) map.get("actype"));
			aircraftDO.setEngine_type_model((String) map.get("engineno"));
			if (map.get("tsn") != null) {
				aircraftDO.setInit_tsn(Double.valueOf((String) map.get("tsn")));
			}
			if (map.get("enginenum") != null) {
				aircraftDO.setEngine_count(Integer.valueOf((String) map.get("enginenum")));
			}
			if (map.get("outdate") != null) {
					aircraftDO.setExit_factory_date(DateHelper.parseIsoDate((String) map.get("outdate")));
			}
			aircraftDO.setApu_type((String) map.get("apuno"));
			aircraftDO.setFsn((String) map.get("fsn"));
			if (map.get("csn") != null) {
				aircraftDO.setInit_csn(Double.valueOf((String) map.get("csn")));
			}
			// TODO
//			aircraftDO.setAircraft_manufacturer((String) map.get("manufacturer"));
			aircraftDO.setStatus((String) map.get("status"));
			// TODO
//			aircraftDO.setMaint_dept_id((String) map.get("maintdeptid"));
			aircraftDO.setMsn((String) map.get("msn"));
			aircraftDO.setTrans_flag((String) map.get("transflag"));
			aircraftDO.setAircraft_description((String) map.get("description"));
			// TODO
//			aircraftDO.setAirway_id((String) map.get("crafter"));
			return aircraftDO;
		}
		return null;
	}
	
	/**
	 * 将外部接口返回的飞机数据的list封装成AircraftDO的list
	 * @param maps 机场数据的map的list
	 * @return
	 */
	public static List<AircraftDO> wrapFromMaps(List<Map<String, Object>> maps) {
		List<AircraftDO> list = new ArrayList<AircraftDO>();
		if (maps != null) {
			for (Map<String, Object> map : maps) {
				AircraftDO aircraftDO = wrapFromMap(map);
				if (aircraftDO != null) {
					list.add(aircraftDO);
				}
			}
		}
		return list;
	}
}
