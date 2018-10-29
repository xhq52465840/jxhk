package com.usky.sms.flightmovementinfo;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;

import com.usky.sms.external.FlightDubboService;

public class FlightDispatchInfoDao extends HibernateDaoSupport {
	
	@Autowired
	private FlightDubboService flightDubboService;
	
	/**
	 * 根据航班号，航班日期，起降机场获取签派情况信息(成功)
	 */
	public Map<String, Object> getdispatchInfo(Date flightDate, String flightNo, String depAirport, String arrAirport) {
		FlightDispatchInfoDO dispatch = flightDubboService.getDispatchInfoByKey(flightDate, flightNo, depAirport, arrAirport);
		if (dispatch == null) {
			return null;
		}
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("dispatcher", dispatch.getDispatcher());//签派员
		map.put("planTakeOffFuel", dispatch.getPlanTakeOffFuel());//计划燃油
		map.put("burn", dispatch.getBurn());//航段耗油
		map.put("adjustedMTOW", dispatch.getAdjustedMTOW());//最大起飞重量
		map.put("takeOffWeight", dispatch.getTakeOffWeight());//实际起飞重量
		map.put("maxLandingWeight", dispatch.getMaxLandingWeight());//最大降落重量
		map.put("landingWeight", dispatch.getLandingWeight());//实际降落重量
		map.put("operatingEmptyWeight", dispatch.getOperatingEmptyWeight());//飞机操作重量/干重
		map.put("zeroFuelWeight", dispatch.getZeroFuelWeight());//实际无油重量
		return map;
	}

	public void setFlightDubboService(FlightDubboService flightDubboService) {
		this.flightDubboService = flightDubboService;
	}
}
