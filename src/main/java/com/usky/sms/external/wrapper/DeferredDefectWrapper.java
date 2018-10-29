package com.usky.sms.external.wrapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.usky.sms.common.DateHelper;
import com.usky.sms.flightmovementinfo.Maintenance.DeferredDefectDO;

public class DeferredDefectWrapper {

	/**
	 * 将外部接口返回的故障保留数据封装成DeferredDefectDO
	 * @param map
	 * @return
	 */
	public static DeferredDefectDO wrapFromMap(Map<String, Object> map) {
		if (map != null) {
			DeferredDefectDO deferredDefectDO = new DeferredDefectDO();
			deferredDefectDO.setTail_no((String) map.get("tailno"));
			deferredDefectDO.setTask_code((String) map.get("taskcode"));
			if (map.get("applydate") != null){
				deferredDefectDO.setApply_date(DateHelper.parseIsoDate((String) map.get("applydate")));
			}
			if (map.get("expiredate") != null) {
				deferredDefectDO.setExpire_date(DateHelper.parseIsoDate((String) map.get("expiredate")));
			}
			deferredDefectDO.setDdf_type((String) map.get("ddfType"));
			deferredDefectDO.setLimit_end((String) map.get("limitend"));
			deferredDefectDO.setDefer_end((String) map.get("deferend"));
			deferredDefectDO.setInfo((String) map.get("info"));
			deferredDefectDO.setHas_limit((String) map.get("haslimit"));
			return deferredDefectDO;
		}
		return null;
	}
	
	/**
	 * 将外部接口返回的故障保留数据的list封装成DeferredDefectDO的list
	 * @param maps 故障保留数据的map的list
	 * @return
	 */
	public static List<DeferredDefectDO> wrapFromMaps(List<Map<String, Object>> maps) {
		List<DeferredDefectDO> list = new ArrayList<DeferredDefectDO>();
		if (maps != null) {
			for (Map<String, Object> map : maps) {
				DeferredDefectDO deferredDefectDO = wrapFromMap(map);
				if (deferredDefectDO != null) {
					list.add(deferredDefectDO);
				}
			}
		}
		return list;
	}
}
