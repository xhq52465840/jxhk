package com.usky.sms.flightmovementinfo;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;

import com.usky.sms.external.CrewDubboService;

public class CabinLicenceInfoDao extends HibernateDaoSupport {

	@Autowired
	private CrewDubboService crewDubboService;
	
	/*
	 * 返回乘务组签证信息信息
	 */
	public List<Map<String, Object>> getCabinLicence(String staffid)
			throws Exception {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		List<CabinLicenceInfoDO> CabinLicenceList = crewDubboService.getCrewVisaByCode(staffid);
		for (CabinLicenceInfoDO Licence : CabinLicenceList) {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("passportType", Licence.getPassportType());//护照类型
			map.put("visaType", Licence.getVisaType());//签证类型
			map.put("paspoortName", Licence.getPaspoortName());////护照类型
			map.put("visaName", Licence.getVisaName());//签证类型
			list.add(map);
		}
		return list;
	}
	
	public void setCrewDubboService(CrewDubboService crewDubboService) {
		this.crewDubboService = crewDubboService;
	}
}
