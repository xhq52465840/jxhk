package com.usky.sms.search.template;

import java.util.Map;

abstract class AbstractIntSearchTemplate extends AbstractSearchTemplate {

	@Override
	public String getSolrFieldName(String key) {
		return key + "_int";
	}

	@Override
	public String getOrderFieldName() {
		return "numberValue";
	}

	@SuppressWarnings("rawtypes")
	@Override
	public Object getSolrFieldValue(Object object) {
		if (object instanceof Number) {
			return ((Number) object).intValue();
		} else if (object instanceof Map) {
			return ((Map) object).get("id");
		} else {
			return null;
		}
	}
	
	@Override
	public String getSolrFieldSortName(String key) {
		return key + "_sort_string";
	}
}
