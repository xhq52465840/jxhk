package com.usky.sms.flightmovementinfo;

import java.util.List;

import org.springframework.orm.hibernate3.support.HibernateDaoSupport;

public class FlightCrewScheduleInfoDao extends HibernateDaoSupport {

	// 通过航班ID返回p_code
	@SuppressWarnings("unchecked")
	public String getPcodeByflightID(Integer flightInfoID) {
		String sql = "from FlightCrewScheduleInfoDO where flightInfoID = ?";
		List<FlightCrewScheduleInfoDO> list = this.getHibernateTemplate().find(sql, flightInfoID);
		String pCode = null;
		for (FlightCrewScheduleInfoDO flightCrewScheduleInfoDO : list) {
			pCode = flightCrewScheduleInfoDO.getP_code();
		}
		return pCode;
	}
	
	@SuppressWarnings("unchecked")
	public List<FlightCrewScheduleInfoDO> getCrewSchedule(Integer flightInfoID) {
		String sql = "from FlightCrewScheduleInfoDO where flightInfoID = ?";
		List<FlightCrewScheduleInfoDO> list = this.getHibernateTemplate().find(sql, flightInfoID);
		return list;
	}
}
