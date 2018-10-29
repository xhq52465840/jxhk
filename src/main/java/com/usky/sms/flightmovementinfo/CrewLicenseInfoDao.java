package com.usky.sms.flightmovementinfo;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;

import com.usky.sms.common.DateHelper;
import com.usky.sms.external.CrewDubboService;

public class CrewLicenseInfoDao extends HibernateDaoSupport {

	@Autowired
	private CrewDubboService crewDubboService;
	
	/*
	 * 根据PCode返回证件信息
	 */
	public List<Map<String, Object>> getLicenseInfo(String pcode) {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		List<CrewLicenseInfoDO> licenseList = crewDubboService.getCrewLicenseByCode(pcode);
		for (CrewLicenseInfoDO license : licenseList) {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("doctype", license.getDocType());// 执照类型
			map.put("state", license.getState());// 有效标志(0有效，1无效)
			map.put("start", license.getStartDate() == null ? null : DateHelper.formatIsoDate(license.getStartDate()));// 颁发日期
			map.put("end", license.getEndDate() == null ? null : DateHelper.formatIsoDate(license.getEndDate()));// 到期日期
			list.add(map);
		}
		return list;
	}
	
	public void setCrewDubboService(CrewDubboService crewDubboService) {
		this.crewDubboService = crewDubboService;
	}
}
