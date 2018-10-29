package com.usky.sms.flightmovementinfo.Maintenance;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.support.HibernateDaoSupport;

import com.usky.sms.common.DateHelper;
import com.usky.sms.external.MaintenanceWebService;

public class MonitDao extends HibernateDaoSupport {
	
	@Autowired
	private MaintenanceWebService maintenanceWebService;
	/*
	 * 根据飞机号获取重点监控故障 信息
	 */
	public List<Map<String, Object>> getMonitInfo(String tailNo) {
		List<MonitDO> monitList = maintenanceWebService.getPlaneDDMoniInfo(tailNo);
		List<Map<String, Object>> list = new ArrayList<Map<String,Object>>();
		for (MonitDO monit : monitList) {
			Map<String,Object> map = new HashMap<String, Object>();
			map.put("tailNo", tailNo);// 机号
			map.put("actype", monit.getActype());// 机型
			map.put("ifDifficult", monit.getIf_difficult());// 是否为疑难故障
			map.put("controller", monit.getController());// 控制人
			map.put("status", monit.getStatus());// 状态
			map.put("confirmContents", monit.getConfirm_contents());// 审核意见
			map.put("confirm_person", monit.getConfirm_person());// 审核人
			map.put("confirmDate", monit.getConfirm_date() == null ? null : DateHelper.formatIsoDate(monit.getConfirm_date()));// 审核日期
			map.put("closeReason", monit.getClose_reason());// 关闭原因
			map.put("yngzzjStatus", monit.getYngzzj_status());// 疑难故障总结状态
			list.add(map);
		}
		return list;
	}
	public void setMaintenanceWebService(MaintenanceWebService maintenanceWebService) {
		this.maintenanceWebService = maintenanceWebService;
	}
}
