package com.usky.sms.external.wrapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.usky.sms.common.DateHelper;
import com.usky.sms.flightmovementinfo.Maintenance.DeferredPepairDO;

public class DeferredRepairWrapper {

	/**
	 * 将外部接口返回的暂缓修理项目数据封装成DeferredPepairDO
	 * @param map
	 * @return
	 */
	public static DeferredPepairDO wrapFromMap(Map<String, Object> map) {
		if (map != null) {
			DeferredPepairDO deferredPepairDO = new DeferredPepairDO();
			deferredPepairDO.setTask_code((String) map.get("taskcode"));
			if (map.get("happendate") != null) {
				deferredPepairDO.setHappen_date(DateHelper.parseIsoDate((String) map.get("happendate")));
			}
			deferredPepairDO.setChapter((String) map.get("chapter"));
			deferredPepairDO.setResolve_limit((String) map.get("resolvelimit"));
			deferredPepairDO.setCancel_reason((String) map.get("cancelreason"));
			deferredPepairDO.setControl_scheme((String) map.get("controlscheme"));
			return deferredPepairDO;
		}
		return null;
	}
	
	/**
	 * 将外部接口返回的暂缓修理项目数据的list封装成DeferredPepairDO的list
	 * @param maps 暂缓修理项目数据的map的list
	 * @return
	 */
	public static List<DeferredPepairDO> wrapFromMaps(List<Map<String, Object>> maps) {
		List<DeferredPepairDO> list = new ArrayList<DeferredPepairDO>();
		if (maps != null) {
			for (Map<String, Object> map : maps) {
				DeferredPepairDO deferredPepairDO = wrapFromMap(map);
				if (deferredPepairDO != null) {
					list.add(deferredPepairDO);
				}
			}
		}
		return list;
	}
}
