package com.usky.sms.flightmovementinfo;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;

import com.usky.sms.external.CrewDubboService;

public class CabinQualificationInfoDao extends HibernateDaoSupport {
	
	@Autowired
	private CrewDubboService crewDubboService;
	/*
	 * 返回乘务组飞行资格信息
	 */
	public List<Map<String, Object>> getCabinQualification(String staffid)throws Exception {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		List<CabinQualificationInfoDO> CabinQualificationList = crewDubboService.getCAQulificationByCode(staffid);
		for (CabinQualificationInfoDO cabinQualification : CabinQualificationList) {
			Map<String, Object> map = new HashMap<String, Object>();
			CabinCrewMemberDO cabinCrewMember = crewDubboService.getCrewCAInfoByCode(cabinQualification.getStaffID());
			map.put("staffname", cabinCrewMember.getStaff_name());//姓名
			map.put("stewLevel", cabinQualification.getStewLevel());
			map.put("isInspector", cabinQualification.getIsInspector());
			map.put("isTeacher", cabinQualification.getIsTeacher());
			map.put("isSpecial", cabinQualification.getIsSpecial());
			map.put("announcerLevel", cabinQualification.getAnnouncerLevel());
			map.put("isAnnouncer", cabinQualification.getIsAnnouncer());
			map.put("announcerLanguage",cabinQualification.getAnnouncerLanguage());
			map.put("isSafety", cabinQualification.getIsSafety());
			map.put("licenceCode", cabinQualification.getLicenceCode());
			list.add(map);
		}
		return list;
	}
	
	public void setCrewDubboService(CrewDubboService crewDubboService) {
		this.crewDubboService = crewDubboService;
	}
}
