package com.usky.sms.flightmovementinfo;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;

import com.usky.sms.external.FlightDubboService;



public class CabinCrewMemberDao extends HibernateDaoSupport {

	@Autowired
	private FlightDubboService flightDubboService;
	
	/**
	 * 返回乘务组信息
	 */
	public List<Map<String, Object>> getCabinCrewMember(Date flightDate, String flightNo, String depAirport, String arrAirport) {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		List<CabinCrewMemberDO> CabinCrewMemberList = flightDubboService.getCAInfo(flightDate, flightNo, depAirport, arrAirport);
		for (CabinCrewMemberDO cabinCrewMember : CabinCrewMemberList) {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("staffid", cabinCrewMember.getStaff_ID());
			map.put("staffName", cabinCrewMember.getStaff_name());// 姓名
			map.put("birthday",cabinCrewMember.getBirthday());//出生年月
			map.put("sex", cabinCrewMember.getSex());// 性别
			map.put("phone", cabinCrewMember.getMobile_tel());// 电话
			map.put("nationality", cabinCrewMember.getNationality());//国籍
			map.put("rank", cabinCrewMember.getRank());
			list.add(map);
		}
		return list;
	}

	public void setFlightDubboService(FlightDubboService flightDubboService) {
		this.flightDubboService = flightDubboService;
	}
	
}
