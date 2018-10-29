package com.usky.sms.external.wrapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;

import com.usky.sms.common.DateHelper;
import com.usky.sms.flightmovementinfo.FlightCrewMemberDO;

public class FlightCrewMemberWrapper {

	/**
	 * 将外部接口返回的乘务信息数据封装成FlightCrewMemberDO
	 * @param map
	 * @return
	 */
	public static FlightCrewMemberDO wrapFromMap(Map<String, Object> map) {
		if (map != null) {
			FlightCrewMemberDO flightCrewMemberDO = new FlightCrewMemberDO();
			flightCrewMemberDO.setP_code((String) map.get("p_code"));
			List<String> duties = new ArrayList<String>();
			if (StringUtils.isNotBlank((String) map.get("tech_name"))) {
				duties.add((String) map.get("tech_name"));
			}
			if (StringUtils.isNotBlank((String) map.get("tech_no_z_name"))) {
				duties.add((String) map.get("tech_no_z_name"));
			}
			flightCrewMemberDO.setPost_duty(StringUtils.join(duties, ", "));
			flightCrewMemberDO.setC_name((String) map.get("c_name"));
			flightCrewMemberDO.setBirth_date(map.get("birth_date") == null ? null : DateHelper.parseIsoTimestamp(((String) map.get("birth_date"))));
			flightCrewMemberDO.setSex((String) map.get("sex"));
			flightCrewMemberDO.setPhone((String) map.get("mobil_no"));
			flightCrewMemberDO.setParty((String) map.get("partyName"));
			flightCrewMemberDO.setNativer((String) map.get("nativefullname"));
			return flightCrewMemberDO;
		}
		return null;
	}
	
	/**
	 * 将外部接口返回的乘务信息数据的list封装成FlightCrewMemberDO的list
	 * @param maps 乘务信息数据的map的list
	 * @return
	 */
	public static List<FlightCrewMemberDO> wrapFromMaps(List<Map<String, Object>> maps) {
		List<FlightCrewMemberDO> list = new ArrayList<FlightCrewMemberDO>();
		if (maps != null) {
			for (Map<String, Object> map : maps) {
				FlightCrewMemberDO flightCrewMemberDO = wrapFromMap(map);
				if (flightCrewMemberDO != null) {
					list.add(flightCrewMemberDO);
				}
			}
		}
		return list;
	}
}
