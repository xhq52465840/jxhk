
package com.usky.sms.search.template;

import com.usky.sms.custom.CustomFieldValueDO;

public class FlightPhaseSearchTemplate extends AbstractMultiStringSearchTemplate {
	
	@Override
	public String getKey() {
		return "com.sms.plugin.search.flightPhaseProp";
	}
	
	@Override
	public String getName() {
		return "飞行阶段搜索器";
	}
	
	@Override
	public Object getSolrFieldSortValue(Object object) {
		return null;
	}
	
	@Override
	public Object getValue(CustomFieldValueDO customFieldValueDO) {
		String value = customFieldValueDO.getTextValue();
		return value == null || value.isEmpty() ? null : gson.fromJson(value, String[].class);
	}
	
}
