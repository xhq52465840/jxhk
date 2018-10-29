package com.usky.sms.flightmovementinfo.Maintenance;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;

import com.usky.sms.common.DateHelper;
import com.usky.sms.external.MaintenanceWebService;

public class DeferredPepairDao extends HibernateDaoSupport {
	
	@Autowired
	private MaintenanceWebService maintenanceWebService;
	/*
	 * 根据飞机号获取暂缓修理项目信息
	 */
	public List<Map<String, Object>> getRepairInfo(String tailNo) {
		List<DeferredPepairDO> repairList = maintenanceWebService.getDefectRepairInfo(tailNo);
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		int count = 0;
		for (DeferredPepairDO repair : repairList) {
			if(count >= 10)break;
			count++;
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("taskCode", repair.getTask_code());// 编号
			map.put("happenDate", repair.getHappen_date() == null ? null : DateHelper.formatIsoDate(repair.getHappen_date()));// 发生日期
			map.put("chapter", repair.getChapter());// ATA
			map.put("resolveLimit", repair.getResolve_limit());// 修复期限
			map.put("cancelReason", repair.getCancel_reason());// 取消原因
			map.put("controlScheme", repair.getControl_scheme());// 监控方案
			list.add(map);
		}
		return list;
	}
	
	public void setMaintenanceWebService(MaintenanceWebService maintenanceWebService) {
		this.maintenanceWebService = maintenanceWebService;
	}
}
