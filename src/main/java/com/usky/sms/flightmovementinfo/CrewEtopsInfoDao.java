package com.usky.sms.flightmovementinfo;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;

import com.usky.sms.common.DateHelper;
import com.usky.sms.external.CrewDubboService;

public class CrewEtopsInfoDao extends HibernateDaoSupport {

	@Autowired
	private CrewDubboService crewDubboService;
	
	/*
	 * 根据PCode返回etops信息
	 */
	public List<Map<String, Object>> getEtopsInfo(String pcode) {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		List<CrewEtopsInfoDO> etops = crewDubboService.getCrewEtopsInfoByCode(pcode);
		for (CrewEtopsInfoDO crewetops : etops) {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("area", crewetops.getBm_name());//区域
			map.put("actype", crewetops.getAc_type());//机型
			map.put("firstDate", crewetops.getFirst_date() == null ? null : DateHelper.formatIsoDate(crewetops.getFirst_date()));//开始时间
			map.put("lastDate", crewetops.getLast_date() == null ? null : DateHelper.formatIsoDate(crewetops.getLast_date()));//到期日期
			list.add(map);
		}
		return list;
	}
	
	public void setCrewDubboService(CrewDubboService crewDubboService) {
		this.crewDubboService = crewDubboService;
	}
}
