package com.usky.sms.search.template;

import java.util.Map;

import com.usky.sms.activity.attribute.ActivityStatusDao;
import com.usky.sms.custom.CustomFieldValueDO;
import com.usky.sms.utils.SpringBeanUtils;

public class StatusSearchTemplate extends AbstractIntSearchTemplate {

	@Override
	public String getKey() {
		return "com.sms.plugin.search.statusProp";
	}

	@Override
	public String getName() {
		return "状态搜索器";
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

	@SuppressWarnings("rawtypes")
	@Override
	public Object getSolrFieldSortValue(Object object) {
		int id;
		if (object instanceof Number) {
			id = ((Number) object).intValue();
		} else if (object instanceof Map) {
			id = (Integer) ((Map) object).get("id");
		} else {
			return null;
		}
		ActivityStatusDao activityStatusDao = (ActivityStatusDao) SpringBeanUtils.getBean("activityStatusDao");
		return this.convertToPinyin(activityStatusDao.internalGetById(id).getName());
	}

	@Override
	public Object getValue(CustomFieldValueDO customFieldValueDO) {
		return customFieldValueDO.getNumberValue();
	}

}
