package com.usky.sms.flightmovementinfo;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.core.BaseDao;
import com.usky.sms.external.AirPlaneDubboService;

public class AirPlaneDao extends BaseDao<AirPlaneDO> {

	@Autowired
	private AirPlaneDubboService airPlaneDubboService;
	
	protected AirPlaneDao() {
		super(AirPlaneDO.class);
	}
	
	/**
	 * 根据飞机号获取飞机信息
	 */
	public AirPlaneDO getAirPlaneByTailNo(String tailNo) {
		return airPlaneDubboService.getAirPlaneInfoByTailNo(tailNo);
	}

	public void setAirPlaneDubboService(AirPlaneDubboService airPlaneDubboService) {
		this.airPlaneDubboService = airPlaneDubboService;
	}
	
}
