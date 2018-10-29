
package com.usky.sms.search.template;

import com.usky.sms.custom.CustomFieldValueDO;

public class TagSearchTemplate extends AbstractMultiStringSearchTemplate {
	
	@Override
	public String getKey() {
		return "com.sms.plugin.search.tagProp";
	}
	
	@Override
	public String getName() {
		return "标签搜索器";
	}
	
	@Override
	public Object getSolrFieldValue(Object object) {
		String tagStr = (String) object;
		if (tagStr == null || tagStr.trim().length() == 0) {
			return null;
		}
		return tagStr.split(" ");
	}
	
	@Override
	public Object getSolrFieldSortValue(Object object) {
		return this.convertToPinyin(object);
	}
	
	@Override
	public Object getValue(CustomFieldValueDO customFieldValueDO) {
		return customFieldValueDO.getStringValue();
	}
	
}
