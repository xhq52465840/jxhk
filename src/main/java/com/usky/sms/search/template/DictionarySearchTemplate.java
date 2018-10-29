
package com.usky.sms.search.template;

import com.usky.sms.custom.CustomFieldValueDO;

public class DictionarySearchTemplate extends AbstractStringSearchTemplate {
	
	@Override
	public String getKey() {
		return "com.sms.plugin.search.dictionaryProp";
	}
	
	@Override
	public String getName() {
		return "字典搜索器";
	}
	
	@Override
	public Object getSolrFieldValue(Object object) {
		if (object instanceof String && ((String) object).length() == 0) {
			return null;
		}
		return object;
	}
	
	@Override
	public Object getValue(CustomFieldValueDO customFieldValueDO) {
		return customFieldValueDO.getStringValue();
	}
	
}
