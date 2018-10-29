
package com.usky.sms.search.template;

import com.usky.sms.custom.CustomFieldValueDO;

public class ControlsSearchTemplate extends AbstractMultiStringSearchTemplate {
	
	@Override
	public String getKey() {
		return "com.sms.plugin.render.controlProp";
	}
	
	@Override
	public String getName() {
		return "控制措施搜索器";
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
