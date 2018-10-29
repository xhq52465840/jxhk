package com.usky.sms.external.wrapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.usky.sms.flightmovementinfo.CabinQualificationInfoDO;

public class CabinQualificationInfoWrapper {

	/**
	 * 将外部接口返回的乘务组飞行资格信息数据封装成CabinQualificationInfoDO
	 * @param map
	 * @return
	 */
	public static CabinQualificationInfoDO wrapFromMap(Map<String, Object> map) {
		if (map != null) {
			CabinQualificationInfoDO cabinQualificationInfoDO = new CabinQualificationInfoDO();
			cabinQualificationInfoDO.setStaffID((String) map.get("p_code"));
			cabinQualificationInfoDO.setIsTeacher("1".equals((String) map.get("isteacher")) ? "是" : "否");
			cabinQualificationInfoDO.setIsAnnouncer("1".equals((String) map.get("isannouncer")) ? "是" : "否");
			return cabinQualificationInfoDO;
		}
		return null;
	}
	
	/**
	 * 将外部接口返回的乘务组飞行资格信息数据的list封装成CabinQualificationInfoDO的list
	 * @param maps 乘务组飞行资格信息数据的map的list
	 * @return
	 */
	public static List<CabinQualificationInfoDO> wrapFromMaps(List<Map<String, Object>> maps) {
		List<CabinQualificationInfoDO> list = new ArrayList<CabinQualificationInfoDO>();
		if (maps != null) {
			for (Map<String, Object> map : maps) {
				CabinQualificationInfoDO cabinQualificationInfoDO = wrapFromMap(map);
				if (cabinQualificationInfoDO != null) {
					list.add(cabinQualificationInfoDO);
				}
			}
		}
		return list;
	}
}
