package com.usky.sms.external.wrapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.usky.sms.common.DateHelper;
import com.usky.sms.flightmovementinfo.Maintenance.MonitDO;

public class MonitWrapper {

	/**
	 * 将外部接口返回的重点监控故障数据封装成MonitDO
	 * @param map
	 * @return
	 */
	public static MonitDO wrapFromMap(Map<String, Object> map) {
		if (map != null) {
			MonitDO monitDO = new MonitDO();
			monitDO.setTail_no((String) map.get("tailno"));
			monitDO.setActype((String) map.get("actype"));
			monitDO.setIf_difficult((String) map.get("ifdifficult"));
			monitDO.setController((String) map.get("controller"));
			monitDO.setStatus((String) map.get("status"));
			monitDO.setConfirm_contents((String) map.get("confirmcontents"));
			monitDO.setConfirm_person((String) map.get("confirmperson"));
			if (map.get("confirmdate") != null) {
				monitDO.setConfirm_date(DateHelper.parseIsoDate((String) map.get("confirmdate")));
			}
			monitDO.setClose_reason((String) map.get("closereason"));
			monitDO.setYngzzj_status((String) map.get("yngzzjstatus"));
			return monitDO;
		}
		return null;
	}
	
	/**
	 * 将外部接口返回的重点监控故障数据的list封装成MonitDO的list
	 * @param maps 重点监控故障数据的map的list
	 * @return
	 */
	public static List<MonitDO> wrapFromMaps(List<Map<String, Object>> maps) {
		List<MonitDO> list = new ArrayList<MonitDO>();
		if (maps != null) {
			for (Map<String, Object> map : maps) {
				MonitDO monitDO = wrapFromMap(map);
				if (monitDO != null) {
					list.add(monitDO);
				}
			}
		}
		return list;
	}
}
