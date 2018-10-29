package com.usky.sms.external;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.juneyaoair.service.AirPlaneInfoService;
import com.usky.sms.common.DateHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.SMSException;
import com.usky.sms.external.wrapper.AirPlaneWrapper;
import com.usky.sms.external.wrapper.FlyTimePerDayWrapper;
import com.usky.sms.external.wrapper.FlyTimePerMonthWrapper;
import com.usky.sms.flightmovementinfo.AirPlaneDO;
import com.usky.sms.http.service.GsonBuilder4SMS;

public class AirPlaneDubboService {
	
	private static final Logger log = Logger.getLogger(AirPlaneDubboService.class);
	
	private static final Gson gson = GsonBuilder4SMS.getInstance();
	
	@Autowired
	private AirPlaneInfoService airPlaneInfoService;

	/**
	 * 获取所有飞机信息
	 */
	public List<AirPlaneDO> getAirPlaneInfo() {
		try {
			log.info("调用外部接口AirPlaneInfoService.getAirPlaneInfo开始");
			String s = airPlaneInfoService.getAirPlaneInfo();
			List<Map<String, Object>> maps = gson.fromJson(s, new TypeToken<List<Map<String, Object>>>(){}.getType());
			if (maps == null ||maps.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取飞机信息失败");
			} else {
				Map<String, Object> map = maps.get(0);
				if ("0".equals(map.get("resultcode")) || "1".equals(map.get("resultcode"))) {
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> resultDatas = (List<Map<String, Object>>) map.get("resultdata");
					log.info("调用外部接口AirPlaneInfoService.getAirPlaneInfo成功");
					if (resultDatas == null || resultDatas.isEmpty()) {
						return null;
					}
					return AirPlaneWrapper.wrapFromMaps(resultDatas);
				} else {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取飞机信息失败");
				}
			}
		} catch (Exception e) {
			log.error("调用外部接口AirPlaneInfoService.getAirPlaneInfo失败", e);
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取飞机信息失败");
			return Collections.emptyList();
		}
	}
	
	/**
	 * 根据机号获取飞机信息 TODO(临时方法)
	 * @param tailNo
	 * @return
	 */
	public AirPlaneDO getAirPlaneInfoByTailNo(String tailNo) {
		try {
			log.info("调用外部接口AirPlaneInfoService.getAirPlaneByID开始");
			if (StringUtils.isBlank(tailNo)) {
				return null;
			}
			String s = airPlaneInfoService.getAirPlaneByID(tailNo);
			List<Map<String, Object>> maps = gson.fromJson(s, new TypeToken<List<Map<String, Object>>>(){}.getType());
			if (maps == null ||maps.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取飞机信息失败, 机号:" + tailNo);
			} else {
				Map<String, Object> map = maps.get(0);
				if ("0".equals(map.get("resultcode")) || "1".equals(map.get("resultcode"))) {
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> resultDatas = (List<Map<String, Object>>) map.get("resultdata");
					log.info("调用外部接口AirPlaneInfoService.getAirPlaneByID成功");
					if (resultDatas == null || resultDatas.isEmpty()) {
						return null;
					}
					return AirPlaneWrapper.wrapFromMap(resultDatas.get(0));
				} else {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取飞机信息失败, 机号:" + tailNo);
				}
			}
		} catch (Exception e) {
			log.error("调用外部接口AirPlaneInfoService.getAirPlaneByID失败", e);
			return null;
		}
	}

	/**
	 * 根据日期段获取每天的飞行小时数(通用飞行小时数+运输飞行小时数)
	 * @param startDate 开始日期
	 * @param endDate 结束日期
	 */
	public Map<String, Double> getFlyHoursPerDay(Date startDate, Date endDate) {
		try {
			Map<String, Double> transportationFlyHoursPerDay = this.getTransportationFlyHoursPerDay(startDate, endDate);
			Map<String, Double> generalFlyHoursPerDay = this.getGeneralFlyHoursPerDay(startDate, endDate);
			return this.sumMapValue(transportationFlyHoursPerDay, generalFlyHoursPerDay);
		} catch (Exception e) {
			return Collections.emptyMap();
		}
	}
	
	/**
	 * 根据日期段获取每月的飞行小时数(通用飞行小时数+运输飞行小时数)
	 * @param startDate 开始日期
	 * @param endDate 结束日期
	 */
	public Map<String, Double> getFlyHoursPerMonth(Date startDate, Date endDate) {
		try {
			// 开始时间设置为指定时间所在月的第一天
			startDate = DateHelper.getFirstDayOfMonth(startDate);
			// 结束日期设置为指定时间所在月的最后一天
			endDate = DateHelper.getLastDayOfMonth(endDate);
			Map<String, Double> transportationFlyHoursPerMonth = this.getTransportationFlyHoursPerMonth(startDate, endDate);
			Map<String, Double> generalFlyHoursPerMonth = this.getGeneralFlyHoursPerMonth(startDate, endDate);
			return this.sumMapValue(transportationFlyHoursPerMonth, generalFlyHoursPerMonth);
		} catch (Exception e) {
			return Collections.emptyMap();
		}
	}
	
	/**
	 * 两map中相同的key值求和
	 * @param map1
	 * @param map2
	 * @return
	 */
	private Map<String, Double> sumMapValue(Map<String, Double> map1, Map<String, Double> map2) {
		for (Entry<String, Double> entry : map1.entrySet()) {
			if (map2.get(entry.getKey()) != null) {
				map1.put(entry.getKey(), entry.getValue() + map2.get(entry.getKey()));
			}
		}
		for (Entry<String, Double> entry : map2.entrySet()) {
			if (!map1.containsKey(entry.getKey())) {
				map1.put(entry.getKey(), entry.getValue());
			}
		}
		return map1;
	}
	
	/**
	 * 根据日期段获取每天运输的飞行小时数
	 * @param startDate 开始日期
	 * @param endDate 结束日期
	 */
	public Map<String, Double> getTransportationFlyHoursPerDay(Date startDate, Date endDate) {
		try {
			log.info("调用外部接口AirPlaneInfoService.getFlyHoursPerDay开始");
			assert startDate != null;
			assert endDate != null;
			String s = airPlaneInfoService.getFlyHoursPerDay(DateHelper.formatIsoDate(startDate), DateHelper.formatIsoDate(endDate));
			List<Map<String, Object>> maps = gson.fromJson(s, new TypeToken<List<Map<String, Object>>>(){}.getType());
			if (maps == null ||maps.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取每天运输的飞行小时数失败");
			} else {
				Map<String, Object> map = maps.get(0);
				if ("0".equals(map.get("resultcode")) || "1".equals(map.get("resultcode"))) {
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> resultDatas = (List<Map<String, Object>>) map.get("resultdata");
					log.info("调用外部接口AirPlaneInfoService.getFlyHoursPerDay成功");
					if (resultDatas == null || resultDatas.isEmpty()) {
						return Collections.emptyMap();
					}
					return FlyTimePerDayWrapper.wrapFromMaps(resultDatas);
				} else {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取每天运输的飞行小时数失败");
				}
			}
		} catch (Exception e) {
			log.error("调用外部接口AirPlaneInfoService.getFlyHoursPerDay失败", e);
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取每天运输的飞行小时数失败");
			return Collections.emptyMap();
		}
	}
	
	/**
	 * 根据日期段获取每月运输的飞行小时数
	 * @param startDate 开始日期
	 * @param endDate 结束日期
	 */
	public Map<String, Double> getTransportationFlyHoursPerMonth(Date startDate, Date endDate) {
		try {
			log.info("调用外部接口AirPlaneInfoService.getFlyHoursPerMonth开始");
			assert startDate != null;
			assert endDate != null;
			String s = airPlaneInfoService.getFlyHoursPerMonth(DateHelper.formatIsoDate(startDate), DateHelper.formatIsoDate(endDate));
			List<Map<String, Object>> maps = gson.fromJson(s, new TypeToken<List<Map<String, Object>>>(){}.getType());
			if (maps == null ||maps.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取每月运输的飞行小时数失败");
			} else {
				Map<String, Object> map = maps.get(0);
				if ("0".equals(map.get("resultcode")) || "1".equals(map.get("resultcode"))) {
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> resultDatas = (List<Map<String, Object>>) map.get("resultdata");
					log.info("调用外部接口AirPlaneInfoService.getFlyHoursPerMonth成功");
					if (resultDatas == null || resultDatas.isEmpty()) {
						return Collections.emptyMap();
					}
					return FlyTimePerMonthWrapper.wrapFromMaps(resultDatas);
				} else {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取每月运输的飞行小时数失败");
				}
			}
		} catch (Exception e) {
			log.error("调用外部接口AirPlaneInfoService.getFlyHoursPerMonth失败", e);
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取每月运输的飞行小时数失败");
			return Collections.emptyMap();
		}
	}
	
	/**
	 * 根据日期段获取每天通用飞行的飞行小时数
	 * @param startDate 开始日期
	 * @param endDate 结束日期
	 */
	public Map<String, Double> getGeneralFlyHoursPerDay(Date startDate, Date endDate) {
		try {
			log.info("调用外部接口AirPlaneInfoService.getGeneralFlyHoursPerDay开始");
			assert startDate != null;
			assert endDate != null;
			String s = airPlaneInfoService.getGeneralFlyHoursPerDay(DateHelper.formatIsoDate(startDate), DateHelper.formatIsoDate(endDate));
			List<Map<String, Object>> maps = gson.fromJson(s, new TypeToken<List<Map<String, Object>>>(){}.getType());
			if (maps == null ||maps.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取每天通用飞行的飞行小时数失败");
			} else {
				Map<String, Object> map = maps.get(0);
				if ("0".equals(map.get("resultcode")) || "1".equals(map.get("resultcode"))) {
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> resultDatas = (List<Map<String, Object>>) map.get("resultdata");
					log.info("调用外部接口AirPlaneInfoService.getGeneralFlyHoursPerDay成功");
					if (resultDatas == null || resultDatas.isEmpty()) {
						Collections.emptyMap();
					}
					return FlyTimePerDayWrapper.wrapFromMaps(resultDatas);
				} else {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取每天通用飞行的飞行小时数失败");
				}
			}
		} catch (Exception e) {
			log.error("调用外部接口AirPlaneInfoService.getGeneralFlyHoursPerDay失败", e);
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取每天通用飞行的飞行小时数失败");
			return Collections.emptyMap();
		}
	}
	
	/**
	 * 根据日期段获取每月通用飞行的飞行小时数
	 * @param startDate 开始日期
	 * @param endDate 结束日期
	 */
	public Map<String, Double> getGeneralFlyHoursPerMonth(Date startDate, Date endDate) {
		try {
			log.info("调用外部接口AirPlaneInfoService.getGeneralFlyHoursPerMonth开始");
			assert startDate != null;
			assert endDate != null;
			String s = airPlaneInfoService.getGeneralFlyHoursPerMonth(DateHelper.formatIsoDate(startDate), DateHelper.formatIsoDate(endDate));
			List<Map<String, Object>> maps = gson.fromJson(s, new TypeToken<List<Map<String, Object>>>(){}.getType());
			if (maps == null ||maps.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取每月通用飞行的飞行小时数失败");
			} else {
				Map<String, Object> map = maps.get(0);
				if ("0".equals(map.get("resultcode")) || "1".equals(map.get("resultcode"))) {
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> resultDatas = (List<Map<String, Object>>) map.get("resultdata");
					log.info("调用外部接口AirPlaneInfoService.getGeneralFlyHoursPerMonth成功");
					if (resultDatas == null || resultDatas.isEmpty()) {
						return Collections.emptyMap();
					}
					return FlyTimePerMonthWrapper.wrapFromMaps(resultDatas);
				} else {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取每月通用飞行的飞行小时数失败");
				}
			}
		} catch (Exception e) {
			log.error("调用外部接口AirPlaneInfoService.getGeneralFlyHoursPerMonth失败", e);
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取每月通用飞行的飞行小时数失败");
			return Collections.emptyMap();
		}
	}
	
	public void setAirPlaneInfoService(AirPlaneInfoService airPlaneInfoService) {
		this.airPlaneInfoService = airPlaneInfoService;
	}
}
