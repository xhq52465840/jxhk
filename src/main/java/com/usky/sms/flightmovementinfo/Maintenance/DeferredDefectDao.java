package com.usky.sms.flightmovementinfo.Maintenance;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;

import com.usky.sms.common.DateHelper;
import com.usky.sms.external.MaintenanceWebService;

public class DeferredDefectDao extends HibernateDaoSupport {
	
	@Autowired
	private MaintenanceWebService maintenanceWebService;
	
	/**
	 * 根据飞机号获取故障保留信息
	 */
	public List<Map<String, Object>> getDeferredInfo(String tailNo) {
		List<DeferredDefectDO> deferredList = maintenanceWebService.getDefectInfo(tailNo);
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		for (DeferredDefectDO deferred : deferredList) {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("taskCode", deferred.getTask_code());// 编号
			map.put("applyDate", deferred.getApply_date() == null ? null : DateHelper.formatIsoDate(deferred.getApply_date()));// 申请签字日期
			map.put("expireDate", deferred.getExpire_date() == null ? null : DateHelper.formatIsoDate(deferred.getExpire_date()));// 到期日期
			map.put("ddfType", deferred.getDdf_type());// 保留类型
			map.put("limitEnd", deferred.getLimit_end());// 批准修复时限止
			map.put("deferEnd", deferred.getDefer_end());// 延期修复时限止
			map.put("info", deferred.getInfo());// 故障描述/损伤情况
			map.put("hasLimit", deferred.getHas_limit());// 是否有限制
			list.add(map);
		}
		return list;
	}

	public void setMaintenanceWebService(MaintenanceWebService maintenanceWebService) {
		this.maintenanceWebService = maintenanceWebService;
	}
}
