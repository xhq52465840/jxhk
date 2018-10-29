package com.usky.sms.flightmovementinfo;

import java.util.List;

import org.springframework.orm.hibernate3.support.HibernateDaoSupport;

public class CabinCrewScheduleInfoDao extends HibernateDaoSupport {
	/*
	 * 根据航班ID返回staff_id
	 */
	public List<CabinCrewScheduleInfoDO> getStaffID(Integer flightInfoID) {
		String sql = "from CabinCrewScheduleInfoDO where flightInfoID = ?";
		@SuppressWarnings("unchecked")
		List<CabinCrewScheduleInfoDO> list = this.getHibernateTemplate().find(sql, flightInfoID);
		return list;
	}
}
