package com.usky.sms.search.template;

abstract class AbstractDateSearchTemplate extends AbstractSearchTemplate {

	@Override
	public String getSolrFieldName(String key) {
		return key + "_date";
	}

	@Override
	public String getSolrFieldSortName(String key) {
		return key + "_sort_date";
	}

	@Override
	public String getOrderFieldName() {
		return "dateValue";
	}

	@Override
	public Object getSolrFieldSortValue(Object object) {
		return getSolrFieldValue(object);
	}
}
