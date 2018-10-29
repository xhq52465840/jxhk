
package com.usky.sms.search.template;

import com.usky.sms.custom.CustomFieldValueDO;

public class FlightNOSearchTemplate extends AbstractMultiStringSearchTemplate {
	
	@Override
	public String getKey() {
		return "com.sms.plugin.search.flightNOProp";
	}
	
	@Override
	public String getName() {
		return "航班号搜索器";
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
