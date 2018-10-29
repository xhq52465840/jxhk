package com.usky.sms.search.template;

import java.util.Map;

import com.usky.sms.activity.type.ActivityTypeDao;
import com.usky.sms.custom.CustomFieldValueDO;
import com.usky.sms.utils.SpringBeanUtils;

public class TypeSearchTemplate extends AbstractIntSearchTemplate {

	@Override
	public String getKey() {
		return "com.sms.plugin.search.typeProp";
	}

	@Override
	public String getName() {
		return "安全信息类型搜索器";
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
		ActivityTypeDao activityTypeDao = (ActivityTypeDao) SpringBeanUtils.getBean("activityTypeDao");
		return this.convertToPinyin(activityTypeDao.internalGetById(id).getName());
	}

	@Override
	public Object getValue(CustomFieldValueDO customFieldValueDO) {
		return customFieldValueDO.getNumberValue();
	}

}
