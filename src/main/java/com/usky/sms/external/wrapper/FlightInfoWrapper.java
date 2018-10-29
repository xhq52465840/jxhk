package com.usky.sms.external.wrapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;

import com.usky.sms.common.DateHelper;
import com.usky.sms.flightmovementinfo.FlightInfoDO;

public class FlightInfoWrapper {

	/**
	 * 将外部接口返回的数据封装成FlightInfoDO
	 * @param map
	 * @return
	 */
	public static FlightInfoDO wrapFromMap(Map<String, Object> map) {
		if (map != null) {
			String adjustType = (String) map.get("adjust_type");
			if (!"0".equals(adjustType) && !"b".equals(adjustType)) {
				FlightInfoDO flightInfoDO = new FlightInfoDO();
				// 航班id
				flightInfoDO.setFlightInfoID(Integer.parseInt((String) map.get("flight_id")));
				// 机号
				flightInfoDO.setTailNO((String) map.get("ac_reg"));
				// 航班号
				flightInfoDO.setFlightNO((String) map.get("flight_no"));
				// 航班日期(BJ)
				if (StringUtils.isNotBlank((String) map.get("flight_date"))) {
					flightInfoDO.setFlightBJDate(DateHelper.parseIsoSecond((String) map.get("flight_date")));
				}
				// 实际起飞机场
				flightInfoDO.setDeptAirport((String) map.get("dep3code")); // 三字码
				flightInfoDO.setDeptAirportCaoCode((String) map.get("departure_airport")); // 四字码
				// 实际到达机场
				flightInfoDO.setArrAirport((String) map.get("arr3code")); // 三字码
				flightInfoDO.setArrAirportCaoCode((String) map.get("arrival_airport")); // 四字码
				// 计划到达机场
				flightInfoDO.setPlanArrAirport((String) map.get("dep3code")); // 三字码
				flightInfoDO.setPlanArrAirportCaoCode((String) map.get("departure_airport")); // 四字码
				// 计划起飞机场
				flightInfoDO.setPlanDeptAirport((String) map.get("arr3code")); // 三字码
				flightInfoDO.setPlanDeptAirportCaoCode((String) map.get("arrival_airport")); // 四字码
				// 预计起飞时间
				if (StringUtils.isNotBlank((String) map.get("etd"))) {
					flightInfoDO.setEtd(DateHelper.parseIsoTimestamp((String) map.get("etd")));
				}
				// 计划起飞时间
				if (StringUtils.isNotBlank((String) map.get("std"))) {
					flightInfoDO.setStd(DateHelper.parseIsoTimestamp((String) map.get("std")));
				}
				// 计划到达时间
				if (StringUtils.isNotBlank((String) map.get("sta"))) {
					flightInfoDO.setSta(DateHelper.parseIsoTimestamp((String) map.get("sta")));
				}
				// 实际起飞时间
				if (StringUtils.isNotBlank((String) map.get("atd"))) {
					flightInfoDO.setAtd(DateHelper.parseIsoTimestamp((String) map.get("atd")));
				}
				// 实际到达时间
				if (StringUtils.isNotBlank((String) map.get("ata"))) {
					flightInfoDO.setAta(DateHelper.parseIsoTimestamp((String) map.get("ata")));
				}
				// 航班类型(I国际,D国内)
				flightInfoDO.setInternationalFlight((String) map.get("d_or_i"));
				// 开客舱门时间
				if (StringUtils.isNotBlank((String) map.get("open_door_time"))) {
					flightInfoDO.setCabinOpenTime(DateHelper.parseIsoTimestamp((String) map.get("open_door_time")));
				}
				// 关客舱门时间
				if (StringUtils.isNotBlank((String) map.get("close_door_time"))) {
					flightInfoDO.setCabinCloseTime(DateHelper.parseIsoTimestamp((String) map.get("close_door_time")));
				}
				// 撤轮档时间
				if (StringUtils.isNotBlank((String) map.get("out"))) {
					flightInfoDO.setBlockOffTime(DateHelper.parseIsoTimestamp((String) map.get("out")));
				}
				// 上轮档时间
				if (StringUtils.isNotBlank((String) map.get("in"))) {
					flightInfoDO.setBlockOnTime(DateHelper.parseIsoTimestamp((String) map.get("in")));
				}
				// 桥位号
				flightInfoDO.setDeptBay((String) map.get("bay"));
				return flightInfoDO;
			}
		}
		return null;
	}
	
	/**
	 * 将外部接口返回的数据的list封装成FlightInfoDO的list
	 * @param map
	 * @return
	 */
	public static List<FlightInfoDO> wrapFromMaps(List<Map<String, Object>> maps) {
		List<FlightInfoDO> list = new ArrayList<FlightInfoDO>();
		if (maps != null) {
			for (Map<String, Object> map : maps) {
				FlightInfoDO flightInfoDO = wrapFromMap(map);
				if (flightInfoDO != null) {
					list.add(flightInfoDO);
				}
			}
		}
		return list;
	}
}
