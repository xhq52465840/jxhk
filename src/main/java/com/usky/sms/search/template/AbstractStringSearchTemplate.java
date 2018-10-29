
package com.usky.sms.search.template;


abstract class AbstractStringSearchTemplate extends AbstractSearchTemplate {
	
	@Override
	public String getSolrFieldName(String key) {
		return key + "_string";
	}
	
	@Override
	public String getSolrFieldSortName(String key) {
		return key + "_sort_string";
	}
	

	@Override
	public String getOrderFieldName() {
		return "stringValue";
	}
	
}
