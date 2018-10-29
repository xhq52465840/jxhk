package com.usky.sms.external;

import java.net.URL;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.junyao.sms.entity.req.ObjectFactory;
import com.junyao.sms.entity.req.PlanDDMoniQuery;
import com.junyao.sms.entity.req.PlanFcQuery;
import com.junyao.sms.entity.req.PlanStaticQuery;
import com.junyao.sms.entity.req.PlaneDDQuery;
import com.junyao.sms.service.JwSmsService;
import com.junyao.sms.service.JwSmsServiceImplService;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.SMSException;
import com.usky.sms.external.wrapper.DeferredDefectWrapper;
import com.usky.sms.external.wrapper.DeferredRepairWrapper;
import com.usky.sms.external.wrapper.MonitWrapper;
import com.usky.sms.external.wrapper.PlaneStaticWrapper;
import com.usky.sms.flightmovementinfo.Maintenance.AircraftDO;
import com.usky.sms.flightmovementinfo.Maintenance.DeferredDefectDO;
import com.usky.sms.flightmovementinfo.Maintenance.DeferredPepairDO;
import com.usky.sms.flightmovementinfo.Maintenance.MonitDO;
import com.usky.sms.http.service.GsonBuilder4SMS;

public class MaintenanceWebService {

	private static final Logger log = Logger.getLogger(MaintenanceWebService.class);
	
	private static final Gson gson = GsonBuilder4SMS.getInstance();
	
	private static final String TAIL_NO_PRIFIX = "B-";
	
	private String jwSmsServiceImplUrl;
	
	/** 
	 * 重点监控故障
	 * 
	 */
	public List<MonitDO> getPlaneDDMoniInfo(String tailNo) {
		try {
			log.info("调用外部接口JwSmsService.getPlaneDDMoniInfo开始");
			JwSmsServiceImplService jwSmsServiceImplService = new JwSmsServiceImplService(new URL(jwSmsServiceImplUrl));
			JwSmsService jwSmsService = jwSmsServiceImplService.getJwSmsServiceImplPort();
			PlanDDMoniQuery planDDMoniQuery = new PlanDDMoniQuery();
			ObjectFactory objectFactory = new ObjectFactory();
			planDDMoniQuery.setAcno(objectFactory.createPlanDDMoniQueryAcno(TAIL_NO_PRIFIX + tailNo));
			String rs = jwSmsService.getPlaneDDMoniInfo(planDDMoniQuery);
			Map<String, Object> map = gson.fromJson(rs, new TypeToken<Map<String, Object>>(){}.getType());
			if ((boolean) map.get("success")) {
				@SuppressWarnings("unchecked")
				List<Map<String, Object>> resultDatas = (List<Map<String, Object>>) map.get("data");
				log.info("调用外部接口JwSmsService.getPlaneDDMoniInfo成功");
				return MonitWrapper.wrapFromMaps(resultDatas);
			} else {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取重点监控故障信息失败");
			}
		} catch (Exception e) {
			log.error("调用外部接口JwSmsService.getPlaneDDMoniInfo失败", e);
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取重点监控故障信息失败");
			return Collections.emptyList();
		}
	}
	
	/**
	 * 故障保留
	 * @param tailNo
	 */
	public List<DeferredDefectDO> getDefectInfo(String tailNo) {
		try {
			log.info("调用外部接口JwSmsService.getDefectInfo开始");
			JwSmsServiceImplService jwSmsServiceImplService = new JwSmsServiceImplService(new URL(jwSmsServiceImplUrl));
			JwSmsService jwSmsService = jwSmsServiceImplService.getJwSmsServiceImplPort();
			PlaneDDQuery planeDDQuery = new PlaneDDQuery();
			ObjectFactory objectFactory = new ObjectFactory();
			planeDDQuery.setAcno(objectFactory.createPlaneDDQueryAcno(TAIL_NO_PRIFIX + tailNo));
			String rs = jwSmsService.getDefectInfo(planeDDQuery);
			Map<String, Object> map = gson.fromJson(rs, new TypeToken<Map<String, Object>>(){}.getType());
			if ((boolean) map.get("success")) {
				@SuppressWarnings("unchecked")
				List<Map<String, Object>> resultDatas = (List<Map<String, Object>>) map.get("data");
				log.info("调用外部接口JwSmsService.getDefectInfo成功");
				return DeferredDefectWrapper.wrapFromMaps(resultDatas);
			} else {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取故障保留信息失败");
			}
		} catch (Exception e) {
			log.error("调用外部接口JwSmsService.getDefectInfo失败", e);
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取故障保留信息失败");
			return Collections.emptyList();
		}
	}
	
	/**
	 * 暂缓修理项目
	 * @param tailNo
	 */
	public List<DeferredPepairDO> getDefectRepairInfo(String tailNo) {
		try {
			log.info("调用外部接口JwSmsService.getDefectRepairInfo开始");
			JwSmsServiceImplService jwSmsServiceImplService = new JwSmsServiceImplService(new URL(jwSmsServiceImplUrl));
			JwSmsService jwSmsService = jwSmsServiceImplService.getJwSmsServiceImplPort();
			PlanFcQuery planFcQuery = new PlanFcQuery();
			ObjectFactory objectFactory = new ObjectFactory();
			planFcQuery.setAcno(objectFactory.createPlanFcQueryAcno(TAIL_NO_PRIFIX + tailNo));
			String rs = jwSmsService.getDefectRepairInfo(planFcQuery);
			Map<String, Object> map = gson.fromJson(rs, new TypeToken<Map<String, Object>>(){}.getType());
			if ((boolean) map.get("success")) {
				@SuppressWarnings("unchecked")
				List<Map<String, Object>> resultDatas = (List<Map<String, Object>>) map.get("data");
				log.info("调用外部接口JwSmsService.getDefectRepairInfo成功");
				return DeferredRepairWrapper.wrapFromMaps(resultDatas);
			} else {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取暂缓修理项目信息失败");
			}
		} catch (Exception e) {
			log.error("调用外部接口JwSmsService.getDefectRepairInfo失败", e);
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取暂缓修理项目信息失败");
			return Collections.emptyList();
		}
	}
	
	/**
	 * 飞机信息
	 * @return
	 */
	public List<AircraftDO> getPlaneInfo(String tailNo) {
		try {
			log.info("调用外部接口JwSmsService.getPlaneInfo开始");
			JwSmsServiceImplService jwSmsServiceImplService = new JwSmsServiceImplService(new URL(jwSmsServiceImplUrl));
			JwSmsService jwSmsService = jwSmsServiceImplService.getJwSmsServiceImplPort();
			PlanStaticQuery planStaticQuery = new PlanStaticQuery();
			ObjectFactory objectFactory = new ObjectFactory();
			planStaticQuery.setTailNo(objectFactory.createPlanStaticQueryTailNo(TAIL_NO_PRIFIX + tailNo));
			String rs = jwSmsService.getPlaneInfo(planStaticQuery);
			Map<String, Object> map = gson.fromJson(rs, new TypeToken<Map<String, Object>>(){}.getType());
			if ((boolean) map.get("success")) {
				@SuppressWarnings("unchecked")
				List<Map<String, Object>> resultDatas = (List<Map<String, Object>>) map.get("data");
				log.info("调用外部接口JwSmsService.getPlaneInfo成功");
				return PlaneStaticWrapper.wrapFromMaps(resultDatas);
			} else {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取飞机信息失败");
			}
		} catch (Exception e) {
			log.error("调用外部接口JwSmsService.getPlaneInfo失败", e);
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取飞机信息失败");
			return Collections.emptyList();
		}
	}
	
	/**
	 * 飞机信息
	 * @return
	 */
	public List<AircraftDO> getDailyReport(String tailNo) {
		try {
			log.info("调用外部接口JwSmsService.getPlaneInfo开始");
			JwSmsServiceImplService jwSmsServiceImplService = new JwSmsServiceImplService(new URL(jwSmsServiceImplUrl));
			JwSmsService jwSmsService = jwSmsServiceImplService.getJwSmsServiceImplPort();
			PlanDDMoniQuery planDDMoniQuery = new PlanDDMoniQuery();
			ObjectFactory objectFactory = new ObjectFactory();
			planDDMoniQuery.setReportBegin(objectFactory.createPlanDDMoniQueryReportBegin("2016-12-12"));
			String rs = null;//jwSmsService.dailyReport((planStaticQuery);
			Map<String, Object> map = gson.fromJson(rs, new TypeToken<Map<String, Object>>(){}.getType());
			if ((boolean) map.get("success")) {
				@SuppressWarnings("unchecked")
				List<Map<String, Object>> resultDatas = (List<Map<String, Object>>) map.get("data");
				log.info("调用外部接口JwSmsService.getPlaneInfo成功");
				return PlaneStaticWrapper.wrapFromMaps(resultDatas);
			} else {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取飞机信息失败");
			}
		} catch (Exception e) {
			log.error("调用外部接口JwSmsService.getPlaneInfo失败", e);
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "获取飞机信息失败");
			return Collections.emptyList();
		}
	}

	public void setJwSmsServiceImplUrl(String jwSmsServiceImplUrl) {
		this.jwSmsServiceImplUrl = jwSmsServiceImplUrl;
	}

}
