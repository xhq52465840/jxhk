package com.usky.sms.search.template;

import java.util.Map;

import org.apache.commons.lang.StringUtils;

import com.usky.sms.activity.attribute.ActivityResolutionDao;
import com.usky.sms.custom.CustomFieldValueDO;
import com.usky.sms.utils.SpringBeanUtils;

public class ResolutionSearchTemplate extends AbstractIntSearchTemplate {

	@Override
	public String getKey() {
		return "com.sms.plugin.search.resolutionProp";
	}

	@Override
	public String getName() {
		return "解决结果搜索器";
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
			return StringUtils.EMPTY;
		}
		ActivityResolutionDao activityResolutionDao = (ActivityResolutionDao) SpringBeanUtils
				.getBean("activityResolutionDao");
		return activityResolutionDao.internalGetById(id).getName();
	}

	@Override
	public Object getValue(CustomFieldValueDO customFieldValueDO) {
		return customFieldValueDO.getNumberValue();
	}

}
