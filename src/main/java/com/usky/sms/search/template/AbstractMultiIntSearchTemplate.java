
package com.usky.sms.search.template;

import java.util.ArrayList;
import java.util.Collection;

import org.apache.commons.lang.math.NumberUtils;


abstract class AbstractMultiIntSearchTemplate extends AbstractSearchTemplate {
	
	@Override
	public String getSolrFieldName(String key) {
		return key + "_multi_int";
	}
	
	@Override
	public String getSolrFieldSortName(String key) {
		return key + "_sort_string";
	}
	
	@SuppressWarnings("unchecked")
	@Override
	public Object getSolrFieldValue(Object object) {
		if (object == null) {
			return null;
		}
		if (object instanceof Collection) {
			Collection<Integer> result = new ArrayList<Integer>();
			for (Object item : (Collection<Object>) object) {
				if (item instanceof Number) {
					result.add(((Number) item).intValue());
				} else if (item instanceof String && NumberUtils.isNumber((String) item)) {
					result.add(((Number) Double.parseDouble((String) item)).intValue());
				}
			}
			return result;
		} else if (object.getClass().isArray()) {
			Collection<Integer> result = new ArrayList<Integer>();
			for (Object item : (Object[]) object) {
				if (item instanceof Number) {
					result.add(((Number) item).intValue());
				} else if (item instanceof String && NumberUtils.isNumber((String) item)) {
					result.add(((Number) Double.parseDouble((String) item)).intValue());
				}
			}
			return result;
		}
		return object;
	}
}
