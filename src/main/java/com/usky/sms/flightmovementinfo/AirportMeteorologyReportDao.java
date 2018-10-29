package com.usky.sms.flightmovementinfo;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;

import com.usky.sms.common.DateHelper;
import com.usky.sms.external.MetarContentDubboService;

public class AirportMeteorologyReportDao extends HibernateDaoSupport {
	
	@Autowired
	private MetarContentDubboService metarContentDubboService;

	/**
	 * 根据机场四字码，实际起飞时间，实际落地时间，查询出实际起飞前一小时和实际落地后一小时的天气报文
	 * atd 实际起飞时间UTC
	 * ata 实际到达时间UTC
	 */
	public List<Map<String,Object>> getMeteorology(String iCaoCode, Date atd, Date ata){
		List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
		if (StringUtils.isNotBlank(iCaoCode) && atd != null && ata != null) {
			List<AirportMeteorologyReportDO> meteList = metarContentDubboService.getWeatherContent(iCaoCode, atd, ata);
			for (AirportMeteorologyReportDO mete : meteList) {
				Map<String, Object> map = new HashMap<String, Object>();
				map.put("reportBJTime", mete.getReportUTCTime() == null ? null : DateHelper.formatIsoSecond(mete.getReportUTCTime()));// 报文时间
				map.put("cnMessage", mete.getCnMessage());
				list.add(map);
			}
		}
		return list;
	}
	
	/**
	 * 根据航班号，航班日期，起降机场查询出对应的天气信息
	 * @param flightNo 航班号
	 * @param flightDate 航班日期
	 * @param dptApt 起飞机场
	 * @param arrApt 到达机场
	 */
	public List<Map<String,Object>> getMeteorology(String flightNo, Date flightDate, String dptApt, String arrApt) {
		return metarContentDubboService.getMetarContent(flightNo, flightDate, dptApt, arrApt);
	}

	public void setMetarContentDubboService(MetarContentDubboService metarContentDubboService) {
		this.metarContentDubboService = metarContentDubboService;
	}
	
}
