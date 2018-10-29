
package com.usky.sms.search.template;

import com.usky.sms.custom.CustomFieldValueDO;

public class TemSystemSearchTemplate extends AbstractMultiStringSearchTemplate {
	
	@Override
	public String getKey() {
		return "com.sms.plugin.search.temSystemProp";
	}
	
	@Override
	public String getName() {
		return "TEM系统分类搜索器";
	}
	
	@Override
	public String getSolrFieldSortName(String key) {
		return key + "_sort_string";
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
