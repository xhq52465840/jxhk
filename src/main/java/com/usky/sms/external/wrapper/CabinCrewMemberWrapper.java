package com.usky.sms.external.wrapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;

import com.usky.sms.flightmovementinfo.CabinCrewMemberDO;

public class CabinCrewMemberWrapper {

	/**
	 * 将外部接口返回的乘务信息数据封装成CabinCrewMemberDO
	 * @param map
	 * @return
	 */
	public static CabinCrewMemberDO wrapFromMap(Map<String, Object> map) {
		if (map != null) {
			CabinCrewMemberDO cabinCrewMemberDO = new CabinCrewMemberDO();
			cabinCrewMemberDO.setStaff_ID(map.get("p_code") == null ? null : Integer.parseInt((String) map.get("p_code")));
			cabinCrewMemberDO.setStaff_name((String) map.get("c_name"));
			cabinCrewMemberDO.setBirthday(StringUtils.substring((String) map.get("birth_date"), 0, 10));
			cabinCrewMemberDO.setSex((String) map.get("sex"));
			cabinCrewMemberDO.setMobile_tel((String) map.get("mobil_no"));
			cabinCrewMemberDO.setNationality((String) map.get("nativefullname"));
			return cabinCrewMemberDO;
		}
		return null;
	}
	
	/**
	 * 将外部接口返回的乘务信息数据的list封装成CabinCrewMemberDO的list
	 * @param maps 乘务信息数据的map的list
	 * @return
	 */
	public static List<CabinCrewMemberDO> wrapFromMaps(List<Map<String, Object>> maps) {
		List<CabinCrewMemberDO> list = new ArrayList<CabinCrewMemberDO>();
		if (maps != null) {
			for (Map<String, Object> map : maps) {
				CabinCrewMemberDO cabinCrewMemberDO = wrapFromMap(map);
				if (cabinCrewMemberDO != null) {
					list.add(cabinCrewMemberDO);
				}
			}
		}
		return list;
	}
}
