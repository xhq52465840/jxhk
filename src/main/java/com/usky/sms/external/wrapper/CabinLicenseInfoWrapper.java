package com.usky.sms.external.wrapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.usky.sms.flightmovementinfo.CabinLicenceInfoDO;

public class CabinLicenseInfoWrapper {

	/**
	 * 将外部接口返回的签证信息数据封装成CabinLicenceInfoDO
	 * @param map
	 * @return
	 */
	public static CabinLicenceInfoDO wrapFromMap(Map<String, Object> map) {
		if (map != null) {
			CabinLicenceInfoDO cabinLicenceInfoDO = new CabinLicenceInfoDO();
			cabinLicenceInfoDO.setLisenceInfoID((String) map.get("license_no"));
			cabinLicenceInfoDO.setStaffID((String) map.get("p_code"));
			cabinLicenceInfoDO.setPassportType((String) map.get("cert_type"));
			cabinLicenceInfoDO.setPaspoortName((String) map.get("cert_name"));
			cabinLicenceInfoDO.setVisaCode((String) map.get("visa_no"));
			cabinLicenceInfoDO.setVisaType((String) map.get("cert_type"));
			cabinLicenceInfoDO.setVisaName((String) map.get("cert_name"));
			return cabinLicenceInfoDO;
		}
		return null;
	}
	
	/**
	 * 将外部接口返回的签证信息数据的list封装成CabinLicenceInfoDO的list
	 * @param maps 签证信息数据的map的list
	 * @return
	 */
	public static List<CabinLicenceInfoDO> wrapFromMaps(List<Map<String, Object>> maps) {
		List<CabinLicenceInfoDO> list = new ArrayList<CabinLicenceInfoDO>();
		if (maps != null) {
			for (Map<String, Object> map : maps) {
				CabinLicenceInfoDO cabinLicenceInfoDO = wrapFromMap(map);
				if (cabinLicenceInfoDO != null) {
					list.add(cabinLicenceInfoDO);
				}
			}
		}
		return list;
	}
}
