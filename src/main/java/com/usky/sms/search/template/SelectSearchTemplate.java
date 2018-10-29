package com.usky.sms.search.template;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import com.usky.sms.custom.CustomFieldValueDO;

public class SelectSearchTemplate extends AbstractMultiIntSearchTemplate {

	@Override
	public String getKey() {
		return "com.sms.plugin.search.selectProp";
	}

	@Override
	public String getName() {
		return "选择下拉框搜索器";
	}

	@SuppressWarnings("rawtypes")
	@Override
	public Object getSolrFieldValue(Object object) {
		if (object instanceof Collection) {
			Collection collection = (Collection) object;
			if (collection.isEmpty()) {
				return null;
			}
			object = collection.iterator().next();
			if (object instanceof Number) {
				return collection;
			} else if (object instanceof Map) {
				List<Number> ids = new ArrayList<Number>();
				for (Object obj : collection) {
					ids.add((Number) ((Map) obj).get("id"));
				}
				return ids;
			} else {
				return null;
			}
		} else if (object instanceof Object[]) {
			return object;
		} else {
			return null;
		}
	}

	@Override
	public Object getSolrFieldSortValue(Object object) {
		return null;
	}

	@Override
	public Object getValue(CustomFieldValueDO customFieldValueDO) {
		return customFieldValueDO.getStringValue();
	}

}
