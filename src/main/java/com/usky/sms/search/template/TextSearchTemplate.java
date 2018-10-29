package com.usky.sms.search.template;

import com.usky.sms.custom.CustomFieldValueDO;

public class TextSearchTemplate extends AbstractTextSearchTemplate {

	@Override
	public String getKey() {
		return "com.sms.plugin.search.textProp";
	}

	@Override
	public String getName() {
		return "大文本搜索器";
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
		return value.getTextValue();
	}

	@Override
	public String getOrderFieldName() {
		return "textValue";
	}

}
