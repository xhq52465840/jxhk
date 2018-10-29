package com.usky.sms.flightmovementinfo;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.orm.hibernate3.support.HibernateDaoSupport;

public class CrewRNPInfoDao extends HibernateDaoSupport {
	/*
	 * 根据PCode 返回RNP信息
	 */
	public List<Map<String, Object>> getRNPInfo(String pcode) {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
			String sql = "from CrewRNPInfoDO where p_code = ?";
			@SuppressWarnings("unchecked")
			List<CrewRNPInfoDO> rnp = this.getHibernateTemplate().find(sql, pcode);
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			for (CrewRNPInfoDO crewrnp : rnp) {
				Map<String, Object> map = new HashMap<String, Object>();
				map.put("airport", crewrnp.getChinese_name());// 机场
				map.put("techType", crewrnp.getTech_typeName());// 技术类型
				map.put("rankname", crewrnp.getRank_name());// 资质等级
				map.put("firstDate", crewrnp.getFirst_date() == null?null:sdf.format(crewrnp.getFirst_date()));// 开始时间
				map.put("lastDate", crewrnp.getLast_date() == null?null:sdf.format(crewrnp.getLast_date()));// 到期时间
				list.add(map);
			}
		return list;
	}
	
}
