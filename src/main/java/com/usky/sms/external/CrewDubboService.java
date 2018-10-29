package com.usky.sms.external;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.juneyaoair.service.CrewInfoService;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.SMSException;
import com.usky.sms.external.wrapper.CabinCrewMemberWrapper;
import com.usky.sms.external.wrapper.CabinLicenseInfoWrapper;
import com.usky.sms.external.wrapper.CabinQualificationInfoWrapper;
import com.usky.sms.external.wrapper.CrewBaoWuWrapper;
import com.usky.sms.external.wrapper.CrewEtopsInfoWrapper;
import com.usky.sms.external.wrapper.CrewLicenseInfoWrapper;
import com.usky.sms.external.wrapper.CrewSpecAirportInfoWrapper;
import com.usky.sms.flightmovementinfo.CabinCrewMemberDO;
import com.usky.sms.flightmovementinfo.CabinLicenceInfoDO;
import com.usky.sms.flightmovementinfo.CabinQualificationInfoDO;
import com.usky.sms.flightmovementinfo.CrewBaoWuDO;
import com.usky.sms.flightmovementinfo.CrewEtopsInfoDO;
import com.usky.sms.flightmovementinfo.CrewLicenseInfoDO;
import com.usky.sms.flightmovementinfo.CrewSpecAirportInfoDO;
import com.usky.sms.http.service.GsonBuilder4SMS;

public class CrewDubboService {
	
	private static final Logger log = Logger.getLogger(CrewDubboService.class);
	
	private static final Gson gson = GsonBuilder4SMS.getInstance();
	
	@Autowired
	private CrewInfoService crewInfoService;

	/**
	 * 根据人员代码获取乘务信息
	 * @param pcode 人员代码
	 */
	public CabinCrewMemberDO getCrewCAInfoByCode(String pcode) {
		try {
			log.info("调用外部接口CrewInfoService.getCrewCAInfoByCode开始");
			assert pcode != null;
			String s = crewInfoService.getCrewCAInfoByCode(pcode);
			List<Map<String, Object>> maps = gson.fromJson(s, new TypeToken<List<Map<String, Object>>>(){}.getType());
			if (maps == null ||maps.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取乘务员信息失败[pcode:" + pcode + "]");
			} else {
				Map<String, Object> map = maps.get(0);
				if ("0".equals(map.get("resultcode")) || "1".equals(map.get("resultcode"))) {
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> resultDatas = (List<Map<String, Object>>) map.get("resultdata");
					log.info("调用外部接口CrewInfoService.getCrewCAInfoByCode成功");
					if (resultDatas == null || resultDatas.isEmpty()) {
						return null;
					}
					// TODO
					return CabinCrewMemberWrapper.wrapFromMap(resultDatas.get(0));
				} else {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取乘务员信息失败[pcode:" + pcode + "]");
				}
			}
		} catch (Exception e) {
			log.error("调用外部接口CrewInfoService.getCrewCAInfoByCode失败", e);
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取乘务员信息失败[pcode:" + pcode + "]");
			return null;
		}
	}
	
	/**
	 * 根据人员代码获取机组信息 TODO
	 * @param pcode 人员代码
	 */
	public CabinCrewMemberDO getCrewInfoByCode(String pcode) {
		try {
			log.info("调用外部接口CrewInfoService.getCrewInfoByCode开始");
			assert pcode != null;
			String s = crewInfoService.getCrewInfoByCode(pcode);
			List<Map<String, Object>> maps = gson.fromJson(s, new TypeToken<List<Map<String, Object>>>(){}.getType());
			if (maps == null ||maps.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取机组信息失败[pcode:" + pcode + "]");
			} else {
				Map<String, Object> map = maps.get(0);
				if ("0".equals(map.get("resultcode")) || "1".equals(map.get("resultcode"))) {
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> resultDatas = (List<Map<String, Object>>) map.get("resultdata");
					log.info("调用外部接口CrewInfoService.getCrewInfoByCode成功");
					if (resultDatas == null || resultDatas.isEmpty()) {
						return null;
					}
					// TODO
					return CabinCrewMemberWrapper.wrapFromMap(resultDatas.get(0));
				} else {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取机组信息失败[pcode:" + pcode + "]");
				}
			}
		} catch (Exception e) {
			log.error("调用外部接口CrewInfoService.getCrewInfoByCode失败", e);
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取机组信息失败[pcode:" + pcode + "]");
			return null;
		}
	}
	
	/**
	 * 根据人员代码获取报务信息
	 * @param pcode 人员代码
	 */
	public List<CrewBaoWuDO> getCrewBaoWuByCode(String pcode) {
		try {
			log.info("调用外部接口CrewInfoService.GetCrewBaoWuByCode开始");
			assert pcode != null;
			String s = crewInfoService.GetCrewBaoWuByCode(pcode);
			List<Map<String, Object>> maps = gson.fromJson(s, new TypeToken<List<Map<String, Object>>>(){}.getType());
			if (maps == null ||maps.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取报务信息失败[pcode:" + pcode + "]");
			} else {
				Map<String, Object> map = maps.get(0);
				if ("0".equals(map.get("resultcode")) || "1".equals(map.get("resultcode"))) {
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> resultDatas = (List<Map<String, Object>>) map.get("resultdata");
					log.info("调用外部接口CrewInfoService.GetCrewBaoWuByCode成功");
					return CrewBaoWuWrapper.wrapFromMaps(resultDatas);
				} else {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取报务信息失败[pcode:" + pcode + "]");
				}
			}
		} catch (Exception e) {
			log.error("调用外部接口CrewInfoService.GetCrewBaoWuByCode失败", e);
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取报务信息失败[pcode:" + pcode + "]");
			return Collections.emptyList();
		}
	}
	
	/**
	 * 根据人员代码获取特殊机场信息
	 * @param pcode 人员代码
	 */
	public List<CrewSpecAirportInfoDO> getCrewSpeAirportByCode(String pcode) {
		try {
			log.info("调用外部接口CrewInfoService.getCrewSpeAirportByCode开始");
			assert pcode != null;
			String s = crewInfoService.getCrewSpeAirportByCode(pcode);
			List<Map<String, Object>> maps = gson.fromJson(s, new TypeToken<List<Map<String, Object>>>(){}.getType());
			if (maps == null ||maps.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取特殊机场信息失败[pcode:" + pcode + "]");
			} else {
				Map<String, Object> map = maps.get(0);
				if ("0".equals(map.get("resultcode")) || "1".equals(map.get("resultcode"))) {
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> resultDatas = (List<Map<String, Object>>) map.get("resultdata");
					log.info("调用外部接口CrewInfoService.getCrewSpeAirportByCode成功");
					return CrewSpecAirportInfoWrapper.wrapFromMaps(resultDatas);
				} else {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取特殊机场信息失败[pcode:" + pcode + "]");
				}
			}
		} catch (Exception e) {
			log.error("调用外部接口CrewInfoService.getCrewSpeAirportByCode失败", e);
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取特殊机场信息失败[pcode:" + pcode + "]");
			return Collections.emptyList();
		}
	}
	
	/**
	 * 根据人员代码获取ETOPS信息
	 * @param pcode 人员代码
	 */
	public List<CrewEtopsInfoDO> getCrewEtopsInfoByCode(String pcode) {
		try {
			log.info("调用外部接口CrewInfoService.getCrewEtopsInfoByCode开始");
			assert pcode != null;
			String s = crewInfoService.getCrewEtopsInfoByCode(pcode);
			List<Map<String, Object>> maps = gson.fromJson(s, new TypeToken<List<Map<String, Object>>>(){}.getType());
			if (maps == null ||maps.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取ETOPS信息失败[pcode:" + pcode + "]");
			} else {
				Map<String, Object> map = maps.get(0);
				if ("0".equals(map.get("resultcode")) || "1".equals(map.get("resultcode"))) {
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> resultDatas = (List<Map<String, Object>>) map.get("resultdata");
					log.info("调用外部接口CrewInfoService.getCrewEtopsInfoByCode成功");
					return CrewEtopsInfoWrapper.wrapFromMaps(resultDatas);
				} else {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取ETOPS信息失败[pcode:" + pcode + "]");
				}
			}
		} catch (Exception e) {
			log.error("调用外部接口CrewInfoService.getCrewEtopsInfoByCode失败", e);
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取ETOPS信息失败[pcode:" + pcode + "]");
			return Collections.emptyList();
		}
	}
	
	/**
	 * 根据人员代码获取机组证件信息
	 * @param pcode 人员代码
	 */
	public List<CrewLicenseInfoDO> getCrewLicenseByCode(String pcode) {
		try {
			log.info("调用外部接口CrewInfoService.getCrewLicenseByCode开始");
			assert pcode != null;
			String s = crewInfoService.getCrewLicenseByCode(pcode);
			List<Map<String, Object>> maps = gson.fromJson(s, new TypeToken<List<Map<String, Object>>>(){}.getType());
			if (maps == null ||maps.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取证件信息失败[pcode:" + pcode + "]");
			} else {
				Map<String, Object> map = maps.get(0);
				if ("0".equals(map.get("resultcode")) || "1".equals(map.get("resultcode"))) {
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> resultDatas = (List<Map<String, Object>>) map.get("resultdata");
					log.info("调用外部接口CrewInfoService.getCrewLicenseByCode成功");
					return CrewLicenseInfoWrapper.wrapFromMaps(resultDatas);
				} else {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取证件信息失败[pcode:" + pcode + "]");
				}
			}
		} catch (Exception e) {
			log.error("调用外部接口CrewInfoService.getCrewLicenseByCode失败", e);
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取证件信息失败[pcode:" + pcode + "]");
			return Collections.emptyList();
		}
	}
	
	/**
	 * 根据人员代码获取机组资质信息
	 * @param pcode 人员代码
	 */
	/*
	public List<CabinQualificationInfoDO> getCrewQulificationByCode(String pcode) {
		try {
			log.info("调用外部接口CrewInfoService.getCrewQulificationByCode开始");
			assert pcode != null;
			String s = crewInfoService.getCrewQulificationByCode(pcode);
			List<Map<String, Object>> maps = gson.fromJson(s, new TypeToken<List<Map<String, Object>>>(){}.getType());
			if (maps == null ||maps.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取资质信息失败[pcode:" + pcode + "]");
			} else {
				Map<String, Object> map = maps.get(0);
				if ("0".equals(map.get("resultcode")) || "1".equals(map.get("resultcode"))) {
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> resultDatas = (List<Map<String, Object>>) map.get("resultdata");
					log.info("调用外部接口CrewInfoService.getCrewQulificationByCode成功");
					return CabinQualificationInfoWrapper.wrapFromMaps(resultDatas);
				} else {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取资质信息失败[pcode:" + pcode + "]");
				}
			}
		} catch (Exception e) {
			log.error("调用外部接口CrewInfoService.getCrewQulificationByCode失败", e);
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取资质信息失败[pcode:" + pcode + "]");
			return Collections.emptyList();
		}
	}
	*/
	
	/**
	 * 根据人员代码获取乘务资质
	 * @param pcode 人员代码
	 */
	public List<CabinQualificationInfoDO> getCAQulificationByCode(String pcode) {
		try {
			log.info("调用外部接口CrewInfoService.getCAQulificationByCode开始");
			assert pcode != null;
			String s = crewInfoService.getCAQulificationByCode(pcode);
			List<Map<String, Object>> maps = gson.fromJson(s, new TypeToken<List<Map<String, Object>>>(){}.getType());
			if (maps == null ||maps.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取资质信息失败[pcode:" + pcode + "]");
			} else {
				Map<String, Object> map = maps.get(0);
				if ("0".equals(map.get("resultcode")) || "1".equals(map.get("resultcode"))) {
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> resultDatas = (List<Map<String, Object>>) map.get("resultdata");
					log.info("调用外部接口CrewInfoService.getCAQulificationByCode成功");
					return CabinQualificationInfoWrapper.wrapFromMaps(resultDatas);
				} else {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取资质信息失败[pcode:" + pcode + "]");
				}
			}
		} catch (Exception e) {
			log.error("调用外部接口CrewInfoService.getCAQulificationByCode失败", e);
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取资质信息失败[pcode:" + pcode + "]");
			return Collections.emptyList();
		}
	}
	
	/**
	 * 根据人员代码获取签证信息
	 * @param pcode 人员代码
	 */
	public List<CabinLicenceInfoDO> getCrewVisaByCode(String pcode) {
		try {
			log.info("调用外部接口CrewInfoService.getCrewVisaByCode开始");
			assert pcode != null;
			String s = crewInfoService.getCrewVisaByCode(pcode);
			List<Map<String, Object>> maps = gson.fromJson(s, new TypeToken<List<Map<String, Object>>>(){}.getType());
			if (maps == null ||maps.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取签证信息失败[pcode:" + pcode + "]");
			} else {
				Map<String, Object> map = maps.get(0);
				if ("0".equals(map.get("resultcode")) || "1".equals(map.get("resultcode"))) {
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> resultDatas = (List<Map<String, Object>>) map.get("resultdata");
					log.info("调用外部接口CrewInfoService.getCrewVisaByCode成功");
					return CabinLicenseInfoWrapper.wrapFromMaps(resultDatas);
				} else {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取签证信息失败[pcode:" + pcode + "]");
				}
			}
		} catch (Exception e) {
			log.error("调用外部接口CrewInfoService.getCrewVisaByCode失败", e);
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取签证信息失败[pcode:" + pcode + "]");
			return Collections.emptyList();
		}
	}

	public void setCrewInfoService(CrewInfoService crewInfoService) {
		this.crewInfoService = crewInfoService;
	}
}
