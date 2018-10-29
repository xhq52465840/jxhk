
package com.usky.sms.search.template;


abstract class AbstractMultiStringSearchTemplate extends AbstractSearchTemplate {
	
	@Override
	public String getSolrFieldName(String key) {
		return key + "_multi_string";
	}
	
	@Override
	public String getSolrFieldSortName(String key) {
		return key + "_sort_string";
	}
	
}
