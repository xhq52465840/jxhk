package com.usky.sms.external;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.juneyaoair.service.MetarContentService;
import com.usky.sms.common.DateHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.SMSException;
import com.usky.sms.external.wrapper.AirportMeteorologyReportWrapper;
import com.usky.sms.flightmovementinfo.AirportMeteorologyReportDO;
import com.usky.sms.http.service.GsonBuilder4SMS;

public class MetarContentDubboService {
	
	private static final Logger log = Logger.getLogger(MetarContentDubboService.class);
	
	private static final Gson gson = GsonBuilder4SMS.getInstance();
	
	@Autowired
	private MetarContentService metarContentService;

	/**
	 * 获取天气报文信息
	 * @param airport 机场四字码
	 * @param startTime 开始时间
	 * @param endTime 结束时间
	 */
	public List<AirportMeteorologyReportDO> getMetarContent(String airport, Date startTime, Date endTime) {
		try {
			log.info("调用外部接口MetarContentService.getAirportMetarContent开始");
			if (StringUtils.isBlank(airport)) {
				throw new Exception("机场四字码不能为空");
			}
			if (startTime == null) {
				throw new Exception("开始时间不能为空");
			}
			if (endTime == null) {
				throw new Exception("结束间不能为空");
			}
			String s = metarContentService.getAirportMetarContent(airport, DateHelper.formatIsoSecond(startTime), DateHelper.formatIsoSecond(endTime));
			List<Map<String, Object>> maps = gson.fromJson(s, new TypeToken<List<Map<String, Object>>>(){}.getType());
			if (maps == null || maps.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取机场：" + airport + "的天气信息失败");
			} else {
				Map<String, Object> map = maps.get(0);
				if ("0".equals(map.get("resultcode")) || "1".equals(map.get("resultcode"))) {
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> resultDatas = (List<Map<String, Object>>) map.get("resultdata");
					log.info("调用外部接口MetarContentService.getAirportMetarContent成功");
					if (resultDatas == null || resultDatas.isEmpty()) {
						return new ArrayList<AirportMeteorologyReportDO>();
					}
					return AirportMeteorologyReportWrapper.wrapFromMaps(resultDatas);
				} else {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取机场：" + airport + "的天气信息失败");
				}
			}
		} catch (Exception e) {
			log.error("调用外部接口MetarContentService.getAirportMetarContent失败", e);
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取机场：" + airport + "的天气信息失败");
			return Collections.emptyList();
		}
	}
	
	/**
	 * 获取天气报文信息
	 * @param flightNo 航班号
	 * @param flightDate 航班日期
	 * @param dptApt 起飞机场
	 * @param arrApt 到达机场
	 */
	public List<Map<String, Object>> getMetarContent(String flightNo, Date flightDate, String dptApt, String arrApt) {
		try {
			log.info("调用外部接口MetarContentService.getMetarContent开始");
			if (StringUtils.isBlank(flightNo)) {
				throw new Exception("航班号不能为空");
			}
			if (flightDate == null) {
				throw new Exception("航班日期不能为空");
			}
			if (dptApt == null) {
				throw new Exception("起飞机场不能为空");
			}
			if (arrApt == null) {
				throw new Exception("到达机场不能为空");
			}
			String s = metarContentService.getMetarContent(flightNo, DateHelper.formatIsoDate(flightDate), dptApt, arrApt);
			List<Map<String, Object>> maps = gson.fromJson(s, new TypeToken<List<Map<String, Object>>>(){}.getType());
			if (maps == null || maps.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取航班号：" + flightNo + "的天气信息失败");
			} else {
				Map<String, Object> map = maps.get(0);
				if ("0".equals(map.get("resultcode")) || "1".equals(map.get("resultcode"))) {
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> resultDatas = (List<Map<String, Object>>) map.get("resultdata");
					log.info("调用外部接口MetarContentService.getMetarContent成功");
					if (resultDatas == null || resultDatas.isEmpty()) {
						return new ArrayList<Map<String,Object>>();
					}
					return resultDatas;
				} else {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取航班号：" + flightNo + "的天气信息失败");
				}
			}
		} catch (Exception e) {
			log.error("调用外部接口MetarContentService.getMetarContent失败", e);
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取航班号：" + flightNo + "的天气信息失败");
			return Collections.emptyList();
		}
	}

	/**
	 * 获取机场的所有报文，按接收时间倒叙排序
	 * @param airport 机场四字码
	 * @param startTime 开始时间
	 * @param endTime 结束时间
	 */
	public List<AirportMeteorologyReportDO> getWeatherContent(String airport, Date startTime, Date endTime) {
		try {
			log.info("调用外部接口MetarContentService.getWeatherContent开始");
			if (StringUtils.isBlank(airport)) {
				throw new Exception("机场四字码不能为空");
			}
			if (startTime == null) {
				throw new Exception("开始时间不能为空");
			}
			if (endTime == null) {
				throw new Exception("结束间不能为空");
			}
			String s = metarContentService.getWeatherContent(airport, DateHelper.formatIsoSecond(startTime), DateHelper.formatIsoSecond(endTime));
			List<Map<String, Object>> maps = gson.fromJson(s, new TypeToken<List<Map<String, Object>>>(){}.getType());
			if (maps == null || maps.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取机场：" + airport + "的天气信息失败");
			} else {
				Map<String, Object> map = maps.get(0);
				if ("0".equals(map.get("resultcode")) || "1".equals(map.get("resultcode"))) {
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> resultDatas = (List<Map<String, Object>>) map.get("resultdata");
					log.info("调用外部接口MetarContentService.getAirportMetarContent成功");
					if (resultDatas == null || resultDatas.isEmpty()) {
						return new ArrayList<AirportMeteorologyReportDO>();
					}
					return AirportMeteorologyReportWrapper.wrapFromMaps(resultDatas);
				} else {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取机场：" + airport + "的天气信息失败");
				}
			}
		} catch (Exception e) {
			log.error("调用外部接口MetarContentService.getAirportMetarContent失败", e);
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取机场：" + airport + "的天气信息失败");
			return Collections.emptyList();
		}
	}
	
	public void setMetarContentService(MetarContentService metarContentService) {
		this.metarContentService = metarContentService;
	}
}
