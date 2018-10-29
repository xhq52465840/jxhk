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
import com.juneyaoair.service.FlightService;
import com.usky.sms.common.DateHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.SMSException;
import com.usky.sms.external.wrapper.CabinCrewMemberWrapper;
import com.usky.sms.external.wrapper.DispatchInfoWrapper;
import com.usky.sms.external.wrapper.FlightCrewMemberWrapper;
import com.usky.sms.external.wrapper.FlightInfoWrapper;
import com.usky.sms.external.wrapper.LoadSheetWrapper;
import com.usky.sms.flightmovementinfo.CabinCrewMemberDO;
import com.usky.sms.flightmovementinfo.FlightCrewMemberDO;
import com.usky.sms.flightmovementinfo.FlightDispatchInfoDO;
import com.usky.sms.flightmovementinfo.FlightInfoDO;
import com.usky.sms.flightmovementinfo.LoadSheetDO;
import com.usky.sms.http.service.GsonBuilder4SMS;

public class FlightDubboService {
	
	private static final Logger log = Logger.getLogger(FlightDubboService.class);
	
	private static final Gson gson = GsonBuilder4SMS.getInstance();
	
	@Autowired
	private FlightService flightService;

	/**
	 * 根据时间段获取航班动态
	 * @param beginDate (字符串)格式：（yyyy-mm-dd）
	 * @param endDate (字符串)格式：（yyyy-mm-dd）
	 */
	public List<FlightInfoDO> getFlightInfoByTime(Date beginDate, Date endDate) {
		try {
			log.info("调用外部接口FlightService.getFlightInfoByTime开始");
			if (beginDate == null || endDate == null) {
				throw new Exception("参数开始时间和结束时间都不能为空");
			}
			String s = flightService.getFlightInfoByTime(DateHelper.formatIsoDate(beginDate), DateHelper.formatIsoDate(endDate));
			List<Map<String, Object>> maps = gson.fromJson(s, new TypeToken<List<Map<String, Object>>>(){}.getType());
			if (maps == null ||maps.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取航班信息失败");
			} else {
				Map<String, Object> map = maps.get(0);
				if ("0".equals(map.get("resultcode")) || "1".equals(map.get("resultcode"))) {
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> resultDatas = (List<Map<String, Object>>) map.get("resultdata");
					log.info("调用外部接口FlightService.getFlightInfoByTime成功");
					return FlightInfoWrapper.wrapFromMaps(resultDatas);
				} else {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取航班信息失败");
				}
			}
		} catch (Exception e) {
			log.error("调用外部接口FlightService.getFlightInfoByTime失败", e);
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取航班信息失败");
			return Collections.emptyList();
		}
	}
	
	/**
	 * 根据航班id获取航班动态
	 * @param flightInfoId 航班id
	 */
	public FlightInfoDO getFlightInfoById(Integer flightInfoId) {
		try {
			log.info("调用外部接口FlightService.getFlightInfoById开始");
			if (flightInfoId == null) {
				return null;
			}
			String s = flightService.getFlightInfoById(flightInfoId.toString());
			List<Map<String, Object>> maps = gson.fromJson(s, new TypeToken<List<Map<String, Object>>>(){}.getType());
			if (maps == null ||maps.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取航班信息失败, id:" + flightInfoId);
			} else {
				Map<String, Object> map = maps.get(0);
				if ("0".equals(map.get("resultcode")) || "1".equals(map.get("resultcode"))) {
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> resultDatas = (List<Map<String, Object>>) map.get("resultdata");
					log.info("调用外部接口FlightService.getFlightInfoById成功");
					if (resultDatas == null || resultDatas.isEmpty()) {
						return null;
					}
					return FlightInfoWrapper.wrapFromMap(resultDatas.get(0));
				} else {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取航班信息失败, id:" + flightInfoId);
				}
			}
		} catch (Exception e) {
			log.error("调用外部接口FlightService.getFlightInfoById失败, id:" + flightInfoId, e);
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取航班信息失败, id:" + flightInfoId);
			return null;
		}
	}
	
	/**
	 * 根据航班日期，航班号，起飞机场，落地机场获取签派信息
	 * @param flightDate 航班日期 yyyy-mm-dd
	 * @param flightNo 航班号
	 * @param depAirport 起飞机场四字码
	 * @param arrAirport 降落机场四字码
	 */
	public FlightDispatchInfoDO getDispatchInfoByKey(Date flightDate, String flightNo, String depAirport, String arrAirport) {
		try {
			log.info("调用外部接口FlightService.getDispatchInfoByKey开始");
			if (flightDate == null) {
				throw new Exception("航班日期不能为空");
			}
			if (StringUtils.isBlank(flightNo)) {
				throw new Exception("航班号不能为空");
			}
			if (StringUtils.isBlank(depAirport)) {
				throw new Exception("起飞机场不能为空");
			}
			if (StringUtils.isBlank(arrAirport)) {
				throw new Exception("到达机场不能为空");
			}
			String s = flightService.getDispatchInfoByKey(DateHelper.formatIsoDate(flightDate), flightNo, depAirport, arrAirport);
			List<Map<String, Object>> maps = gson.fromJson(s, new TypeToken<List<Map<String, Object>>>(){}.getType());
			if (maps == null ||maps.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取航班信息失败");
			} else {
				Map<String, Object> map = maps.get(0);
				if ("0".equals(map.get("resultcode")) || "1".equals(map.get("resultcode"))) {
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> resultDatas = (List<Map<String, Object>>) map.get("resultdata");
					log.info("调用外部接口FlightService.getDispatchInfoByKey成功");
					if (resultDatas == null || resultDatas.isEmpty()) {
						return null;
					}
					return DispatchInfoWrapper.wrapFromMap(resultDatas.get(0));
				} else {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取签派信息失败");
				}
			}
		} catch (Exception e) {
			log.error("调用外部接口FlightService.getDispatchInfoByKey失败", e);
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取签派信息失败");
			return null;
		}
	}
	
	/**
	 * 根据航班日期，航班号，起飞机场，落地机场获取舱单信息
	 * @param flightDate 航班日期 yyyy-mm-dd
	 * @param flightNo 航班号
	 * @param depAirport 起飞机场四字码
	 * @param arrAirport 降落机场四字码
	 */
	public LoadSheetDO getLoadSheetBykey(Date flightDate, String flightNo, String depAirport, String arrAirport) {
		try {
			log.info("调用外部接口FlightService.getLoadSheetBykey开始");
			if (flightDate == null) {
				throw new Exception("航班日期不能为空");
			}
			if (StringUtils.isBlank(flightNo)) {
				throw new Exception("航班号不能为空");
			}
			if (StringUtils.isBlank(depAirport)) {
				throw new Exception("起飞机场不能为空");
			}
			if (StringUtils.isBlank(arrAirport)) {
				throw new Exception("到达机场不能为空");
			}
			String s = flightService.getLoadSheetByKey(DateHelper.formatIsoDate(flightDate), flightNo, depAirport, arrAirport);
			List<Map<String, Object>> maps = gson.fromJson(s, new TypeToken<List<Map<String, Object>>>(){}.getType());
			if (maps == null ||maps.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取航班信息失败");
			} else {
				Map<String, Object> map = maps.get(0);
				if ("0".equals(map.get("resultcode")) || "1".equals(map.get("resultcode"))) {
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> resultDatas = (List<Map<String, Object>>) map.get("resultdata");
					log.info("调用外部接口FlightService.getLoadSheetBykey成功");
					if (resultDatas == null || resultDatas.isEmpty()) {
						return null;
					}
					return LoadSheetWrapper.wrapFromMap(resultDatas.get(0));
				} else {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取航班信息失败");
				}
			}
		} catch (Exception e) {
			log.error("调用外部接口FlightService.getLoadSheetBykey失败", e);
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取航班信息失败");
			return null;
		}
	}

	/**
	 * 根据航班日期，航班号，起飞机场，落地机场获取乘务组信息
	 * @param flightDate 航班日期 yyyy-mm-dd
	 * @param flightNo 航班号
	 * @param depAirport 起飞机场四字码
	 * @param arrAirport 降落机场四字码
	 */
	public List<CabinCrewMemberDO> getCAInfo(Date flightDate, String flightNo, String depAirport, String arrAirport) {
		try {
			log.info("调用外部接口FlightService.getCAInfo开始");
			if (flightDate == null) {
				throw new Exception("航班日期不能为空");
			}
			if (StringUtils.isBlank(flightNo)) {
				throw new Exception("航班号不能为空");
			}
			if (StringUtils.isBlank(depAirport)) {
				throw new Exception("起飞机场不能为空");
			}
			if (StringUtils.isBlank(arrAirport)) {
				throw new Exception("到达机场不能为空");
			}
			String s = flightService.getCAInfo(DateHelper.formatIsoDate(flightDate), flightNo, depAirport, arrAirport);
			List<Map<String, Object>> maps = gson.fromJson(s, new TypeToken<List<Map<String, Object>>>(){}.getType());
			if (maps == null ||maps.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取乘务信息失败");
			} else {
				Map<String, Object> map = maps.get(0);
				if ("0".equals(map.get("resultcode")) || "1".equals(map.get("resultcode"))) {
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> resultDatas = (List<Map<String, Object>>) map.get("resultdata");
					log.info("调用外部接口FlightService.getCAInfo成功");
					if (resultDatas == null || resultDatas.isEmpty()) {
						return new ArrayList<CabinCrewMemberDO>();
					}
					return CabinCrewMemberWrapper.wrapFromMaps(resultDatas);
				} else {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取乘务信息失败");
				}
			}
		} catch (Exception e) {
			log.error("调用外部接口FlightService.getCAInfo失败", e);
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取航班乘务失败");
			return Collections.emptyList();
		}
	}
		
	/**
	 * 根据航班日期，航班号，起飞机场，落地机场获取机组信息
	 * @param flightDate 航班日期 yyyy-mm-dd
	 * @param flightNo 航班号
	 * @param depAirport 起飞机场四字码
	 * @param arrAirport 降落机场四字码
	 */
	public List<FlightCrewMemberDO> getFWInfo(Date flightDate, String flightNo, String depAirport, String arrAirport) {
		try {
			log.info("调用外部接口FlightService.getFWInfo开始");
			if (flightDate == null) {
				throw new Exception("航班日期不能为空");
			}
			if (StringUtils.isBlank(flightNo)) {
				throw new Exception("航班号不能为空");
			}
			if (StringUtils.isBlank(depAirport)) {
				throw new Exception("起飞机场不能为空");
			}
			if (StringUtils.isBlank(arrAirport)) {
				throw new Exception("到达机场不能为空");
			}
			String s = flightService.getFWInfo(DateHelper.formatIsoDate(flightDate), flightNo, depAirport, arrAirport);
			List<Map<String, Object>> maps = gson.fromJson(s, new TypeToken<List<Map<String, Object>>>(){}.getType());
			if (maps == null ||maps.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取机组信息失败");
			} else {
				Map<String, Object> map = maps.get(0);
				if ("0".equals(map.get("resultcode")) || "1".equals(map.get("resultcode"))) {
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> resultDatas = (List<Map<String, Object>>) map.get("resultdata");
					log.info("调用外部接口FlightService.getFWInfo成功");
					if (resultDatas == null || resultDatas.isEmpty()) {
						return new ArrayList<FlightCrewMemberDO>();
					}
					return FlightCrewMemberWrapper.wrapFromMaps(resultDatas);
				} else {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取机组信息失败");
				}
			}
		} catch (Exception e) {
			log.error("调用外部接口FlightService.getFWInfo失败", e);
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取航班机组信息失败");
			return Collections.emptyList();
		}
	}
	
	public void setFlightService(FlightService flightService) {
		this.flightService = flightService;
	}
}
