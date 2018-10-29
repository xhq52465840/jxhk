package com.usky.sms.flightmovementinfo;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;

import com.usky.sms.external.FlightDubboService;

public class LoadSheetDao extends HibernateDaoSupport {

	@Autowired
	private FlightDubboService flightDubboService;
	
	/**
	 * 根据航班号，航班日期，起降机场获取舱单信息(成功)
	 */
	public Map<String, Object> getLoadSheetInfo(Date flightDate, String flightNo, String depAirport, String arrAirport) {
		LoadSheetDO loadSheet = flightDubboService.getLoadSheetBykey(flightDate, flightNo, depAirport, arrAirport);
		if (loadSheet == null) {
			return null;
		}
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("flightLayout", loadSheet.getFlightLayout());//舱位布局
		map.put("compartmentsTotalLoad", loadSheet.getCompartmentsTotalLoad());//货物重量
		map.put("passengerWeight", loadSheet.getPassengerWeight());//旅客重量
		map.put("adultPassenger", loadSheet.getAdultPassenger());//成人数
		map.put("childPassenger", loadSheet.getChildPassenger());//儿童数
		map.put("babyPassenger", loadSheet.getBabyPassenger());//婴儿数
		map.put("fstCheckInPax", loadSheet.getFstCheckInPax());//头等舱登机数
		map.put("busCheckInPax", loadSheet.getBusCheckInPax());//商务舱登机数
		map.put("encCheckInPax", loadSheet.getEncCheckInPax());//经济舱登机数
		map.put("bag", loadSheet.getBag());//行李重量
		map.put("pos", loadSheet.getPos());//邮件重量
		map.put("maxTrafficLoad", loadSheet.getMaxTrafficLoad());//最大业载
		map.put("totalTrafficLoad", loadSheet.getTotalTrafficLoad());//实际业载
		return map;
	}

	public void setFlightDubboService(FlightDubboService flightDubboService) {
		this.flightDubboService = flightDubboService;
	}
}
