package com.usky.sms.flightmovementinfo;

import java.util.List;

import org.springframework.orm.hibernate3.support.HibernateDaoSupport;

public class FlightSupportInfoDao extends HibernateDaoSupport {

	@SuppressWarnings("unchecked")
	public String getDeptbay(Integer flightInfoId) {
		String sql = "from FlightSupportInfoDO where flightInfoId = ?";
		List<FlightSupportInfoDO> list = this.getHibernateTemplate().find(sql, flightInfoId);
		String deptBay = "";
		if(list.size() > 0){
			if (list.get(0).getDeptbay() != null) {
				deptBay = list.get(0).getDeptbay();
			}
		}
		return deptBay;
	}
}
