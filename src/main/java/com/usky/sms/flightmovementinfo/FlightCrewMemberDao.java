package com.usky.sms.flightmovementinfo;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;

import com.usky.sms.common.DateHelper;
import com.usky.sms.external.FlightDubboService;

public class FlightCrewMemberDao extends HibernateDaoSupport {
	
	@Autowired
	private FlightDubboService flightDubboService;
	
	/*
	 * 根据PCode获取对象信息(成功)
	 */
	public List<Map<String, Object>> getCrewBaseInfo(Date flightDate, String flightNo, String depAirport, String arrAirport) {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		List<FlightCrewMemberDO> flightCrew = flightDubboService.getFWInfo(flightDate, flightNo, depAirport, arrAirport);
		for (FlightCrewMemberDO crewMember : flightCrew) {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("pcode", crewMember.getP_code());//pCode
			map.put("postDuty", crewMember.getPost_duty());// 岗位
			map.put("name", crewMember.getC_name());// 姓名
			map.put("birthDate", crewMember.getBirth_date() == null ? null : DateHelper.formatIsoDate(crewMember.getBirth_date()));// 出生年月
			map.put("sex", crewMember.getSex());// 性别
			map.put("phone", crewMember.getPhone());// 电话
			map.put("party", crewMember.getParty());// 党籍
			map.put("nativer", crewMember.getNativer());// 国籍
			list.add(map);
		}
		return list;
	}
	
	/**
	 * 根据pcode获取机组人员的信息
	 * @param pcode
	 * @return
	 */
	public FlightCrewMemberDO getByPcode(String pcode){
		@SuppressWarnings("unchecked")
		List<FlightCrewMemberDO> list = this.getHibernateTemplate().find("from FlightCrewMemberDO t where t.p_code = ? order by t.updTime desc", pcode);
		return list.isEmpty() ? null : list.get(0);
	}
	
	/**
	 * 根据workNo获取机组人员的信息
	 * @param pcode
	 * @return
	 */
	public FlightCrewMemberDO getByWorkNo(String workNo){
		@SuppressWarnings("unchecked")
		List<FlightCrewMemberDO> list = this.getHibernateTemplate().find("from FlightCrewMemberDO t where t.work_no = ? order by t.updTime desc", workNo);
		return list.isEmpty() ? null : list.get(0);
	}

	public void setFlightDubboService(FlightDubboService flightDubboService) {
		this.flightDubboService = flightDubboService;
	}
	
}
