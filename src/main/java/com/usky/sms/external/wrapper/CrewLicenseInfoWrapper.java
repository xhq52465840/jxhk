package com.usky.sms.external.wrapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.usky.sms.common.DateHelper;
import com.usky.sms.flightmovementinfo.CrewLicenseInfoDO;

public class CrewLicenseInfoWrapper {

	/**
	 * 将外部接口返回的证件信息数据封装成CrewLicenseInfoDO
	 * @param map
	 * @return
	 */
	public static CrewLicenseInfoDO wrapFromMap(Map<String, Object> map) {
		if (map != null) {
			CrewLicenseInfoDO crewLicenseInfoDO = new CrewLicenseInfoDO();
			crewLicenseInfoDO.setLicenseInfoID((String) map.get("license_no"));
			crewLicenseInfoDO.setPcode((String) map.get("p_code"));
			crewLicenseInfoDO.setDocType((String) map.get("cert_type"));
			crewLicenseInfoDO.setValidFlag((String) map.get("valid_flag"));
			crewLicenseInfoDO.setState("Y".equals(crewLicenseInfoDO.getValidFlag()) ? 1 : 0);
			if (map.get("issue_date") != null) {
				crewLicenseInfoDO.setStartDate(DateHelper.parseIsoTimestamp((String) map.get("issue_date")));
			}
			if (map.get("end_date") != null) {
				crewLicenseInfoDO.setEndDate(DateHelper.parseIsoTimestamp((String) map.get("end_date")));
			}
			if (map.get("op_time") != null) {
				crewLicenseInfoDO.setUpdTime(DateHelper.parseIsoTimestamp((String) map.get("op_time")));
			}
			return crewLicenseInfoDO;
		}
		return null;
	}
	
	/**
	 * 将外部接口返回的证件信息数据的list封装成CrewLicenseInfoDO的list
	 * @param maps 证件信息数据的map的list
	 * @return
	 */
	public static List<CrewLicenseInfoDO> wrapFromMaps(List<Map<String, Object>> maps) {
		List<CrewLicenseInfoDO> list = new ArrayList<CrewLicenseInfoDO>();
		if (maps != null) {
			for (Map<String, Object> map : maps) {
				CrewLicenseInfoDO crewLicenseInfoDO = wrapFromMap(map);
				if (crewLicenseInfoDO != null) {
					list.add(crewLicenseInfoDO);
				}
			}
		}
		return list;
	}
}
