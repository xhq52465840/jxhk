package com.usky.sms.flightmovementinfo;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;

import com.usky.sms.common.DateHelper;
import com.usky.sms.external.CrewDubboService;

public class CrewBaoWuDao extends HibernateDaoSupport {
	
	@Autowired
	private CrewDubboService crewDubboService;

	/*
	 * 根据PCode返回报务信息
	 */
	public List<Map<String, Object>> getBaoWuInfo(String pcode) {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		List<CrewBaoWuDO> baoWu = crewDubboService.getCrewBaoWuByCode(pcode);
		for (CrewBaoWuDO crewBaoWu : baoWu) {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("bmName", crewBaoWu.getBm_name());//区域
			map.put("firstDate", crewBaoWu.getFirst_date() == null ? null : DateHelper.formatIsoDate(crewBaoWu.getFirst_date()));//开始时间
			map.put("lastDate", crewBaoWu.getLast_date() == null ? null : DateHelper.formatIsoDate(crewBaoWu.getLast_date()));//到期时间
			list.add(map);
		}
		return list;
	}

	public void setCrewDubboService(CrewDubboService crewDubboService) {
		this.crewDubboService = crewDubboService;
	}
}
