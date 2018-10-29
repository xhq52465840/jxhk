package com.usky.sms.flightmovementinfo;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;

import com.usky.sms.common.DateHelper;
import com.usky.sms.external.CrewDubboService;

public class CrewSpecAirportInfoDao extends HibernateDaoSupport {

	@Autowired
	private CrewDubboService crewDubboService;
	
	/*
	 * 根据PCode返回特殊机场信息
	 */
	public List<Map<String, Object>> getSpecAirportInfo(String pcode) {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		List<CrewSpecAirportInfoDO> spec = crewDubboService.getCrewSpeAirportByCode(pcode);
		for (CrewSpecAirportInfoDO crewSpec : spec) {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("airportname", crewSpec.getChinese_name());// 机场
			map.put("cityName", crewSpec.getCityNameCn());// 城市名称
			map.put("rankName", crewSpec.getRank_name());// 资质等级
			map.put("firstDate", crewSpec.getFirst_date() == null ? null: DateHelper.formatIsoDate(crewSpec.getFirst_date()));// 放飞日期
			map.put("lastDate", crewSpec.getLast_date() == null ? null: DateHelper.formatIsoDate(crewSpec.getLast_date()));// 最后经历日期
			// 有效标志
			map.put("validFlag", crewSpec.getValid_flag());
			list.add(map);
		}
		return list;
	}
	
	public void setCrewDubboService(CrewDubboService crewDubboService) {
		this.crewDubboService = crewDubboService;
	}
}
