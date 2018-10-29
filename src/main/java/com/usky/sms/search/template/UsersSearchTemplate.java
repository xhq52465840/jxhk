package com.usky.sms.search.template;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;

import com.usky.sms.custom.CustomFieldValueDO;
import com.usky.sms.user.UserDao;
import com.usky.sms.utils.SpringBeanUtils;

public class UsersSearchTemplate extends AbstractMultiIntSearchTemplate {

	@Override
	public String getKey() {
		return "com.sms.plugin.search.usersProp";
	}

	@Override
	public String getName() {
		return "多用户搜索器";
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

	@SuppressWarnings("unchecked")
	@Override
	public Object getSolrFieldSortValue(Object object) {
		UserDao userDao = (UserDao) SpringBeanUtils.getBean("userDao");
		Object o = getSolrFieldValue(object);
		if (o instanceof Collection) {
			return this.convertToPinyin(userDao.getFullnameByIds((List<Integer>) o).toString());
		} else {
			return StringUtils.EMPTY;
		}
	}

	@Override
	public Object getValue(CustomFieldValueDO customFieldValueDO) {
		return customFieldValueDO.getStringValue();
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
