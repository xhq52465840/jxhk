
package com.usky.sms.search.template;

import com.usky.sms.custom.CustomFieldValueDO;

public class ReleaseSearchTemplate extends AbstractStringSearchTemplate {
	
	@Override
	public String getKey() {
		return "com.sms.plugin.search.publishProp";
	}
	
	@Override
	public String getName() {
		return "是否发布搜索器";
	}
	
	@Override
	public Object getSolrFieldValue(Object object) {
		if (object instanceof String && ((String) object).length() == 0) {
			return null;
		}
		return object;
	}
	
	@Override
	public Object getValue(CustomFieldValueDO value) {
		return value.getStringValue();
	}
	
}
