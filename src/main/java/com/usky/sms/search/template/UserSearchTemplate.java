package com.usky.sms.search.template;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;

import com.usky.sms.custom.CustomFieldValueDO;
import com.usky.sms.user.UserDao;
import com.usky.sms.utils.SpringBeanUtils;

public class UserSearchTemplate extends AbstractIntSearchTemplate {

	@Override
	public String getKey() {
		return "com.sms.plugin.search.userProp";
	}

	@Override
	public String getName() {
		return "用户搜索器";
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
		UserDao userDao = (UserDao) SpringBeanUtils.getBean("userDao");
		return this.convertToPinyin(userDao.internalGetById(id).getFullname());
	}

	@Override
	public Object getValue(CustomFieldValueDO customFieldValueDO) {
		return customFieldValueDO.getNumberValue() == null ? null : customFieldValueDO.getNumberValue().intValue();
	}

	@Override
	public String getOrderFieldName() {
		return "stringValue";
	}

	@SuppressWarnings("unchecked")
	@Override
	public String getExportContent(Object object) {
		if (null == object) {
			return "";
		}
		if (object instanceof Map) {
			return ((Map<String, Object>) object).get("fullname").toString();
		} else if (object instanceof Collection) {
			List<String> resultList = new ArrayList<String>();
			for (Object o : (Collection<Object>) object) {
				resultList.add(getExportContent(o));
			}
			return StringUtils.join(resultList.toArray(), ",");
		}
		return object.toString();
	}

}
