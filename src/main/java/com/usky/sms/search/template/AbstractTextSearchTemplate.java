
package com.usky.sms.search.template;


abstract class AbstractTextSearchTemplate extends AbstractSearchTemplate {
	
	@Override
	public String getSolrFieldName(String key) {
		return key + "_text";
	}
	
	@Override
	public String getSolrFieldSortName(String key) {
		return key + "_sort_text";
	}

	@Override
	public String getOrderFieldName() {
		return "textValue";
	}
	
}
