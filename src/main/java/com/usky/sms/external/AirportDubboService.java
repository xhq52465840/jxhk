package com.usky.sms.external;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.juneyaoair.service.FlightAirportService;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.SMSException;
import com.usky.sms.external.wrapper.AirportWrapper;
import com.usky.sms.flightmovementinfo.AirportDO;
import com.usky.sms.http.service.GsonBuilder4SMS;

public class AirportDubboService {
	
	private static final Logger log = Logger.getLogger(AirportDubboService.class);
	
	private static final Gson gson = GsonBuilder4SMS.getInstance();
	
	@Autowired
	private FlightAirportService flightAirportService;

	/**
	 * 根据机场四字码获取机场信息
	 * @param code 机场四字码
	 */
	public AirportDO getFlightAirportBy4Code(String code) {
		try {
			log.info("调用外部接口FlightAirportService.getFlightAirportBy4Code开始");
			String s = flightAirportService.getFlightAirportBy4Code(code);
			List<Map<String, Object>> maps = gson.fromJson(s, new TypeToken<List<Map<String, Object>>>(){}.getType());
			if (maps == null || maps.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取" + code + "的机场信息失败");
			} else {
				Map<String, Object> map = maps.get(0);
				if ("0".equals(map.get("resultcode")) || "1".equals(map.get("resultcode"))) {
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> resultDatas = (List<Map<String, Object>>) map.get("resultdata");
					log.info("调用外部接口FlightAirportService.getFlightAirportBy4Code成功");
					if (resultDatas == null || resultDatas.isEmpty()) {
						return null;
					}
					return AirportWrapper.wrapFromMap(resultDatas.get(0));
				} else {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取" + code + "的机场信息失败");
				}
			}
		} catch (Exception e) {
			log.error("调用外部接口FlightAirportService.getFlightAirportBy4Code失败", e);
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取" + code + "的机场信息失败");
			return null;
		}
	}
	
	/**
	 * 获取所有机场信息
	 * 
	 */
	public List<AirportDO> getFlightAirport() {
		try {
			log.info("调用外部接口FlightAirportService.getFlightAirport开始");
			String s = flightAirportService.getVaildAirports();
			List<Map<String, Object>> maps = gson.fromJson(s, new TypeToken<List<Map<String, Object>>>(){}.getType());
			if (maps == null || maps.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取所有机场信息失败");
			} else {
				Map<String, Object> map = maps.get(0);
				if ("0".equals(map.get("resultcode")) || "1".equals(map.get("resultcode"))) {
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> resultDatas = (List<Map<String, Object>>) map.get("resultdata");
					log.info("调用外部接口FlightAirportService.getFlightAirport成功");
					if (resultDatas == null || resultDatas.isEmpty()) {
						return new ArrayList<AirportDO>();
					}
					return AirportWrapper.wrapFromMaps(resultDatas);
				} else {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取所有机场信息失败");
				}
			}
		} catch (Exception e) {
			log.error("调用外部接口FlightAirportService.getFlightAirport失败", e);
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取所有机场信息失败");
			return Collections.emptyList();
		}
	}

	public void setFlightAirportService(FlightAirportService flightAirportService) {
		this.flightAirportService = flightAirportService;
	}
}
