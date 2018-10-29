package com.usky.sms.search.template;

import java.util.Arrays;
import java.util.Map;

import com.usky.sms.custom.CustomFieldValueDO;
import com.usky.sms.organization.OrganizationDao;
import com.usky.sms.utils.SpringBeanUtils;

public class OrganizationSearchTemplate extends AbstractIntSearchTemplate {

	@Override
	public String getKey() {
		return "com.sms.plugin.search.organizationProp";
	}

	@Override
	public String getName() {
		return "组织搜索器";
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
		if (object == null) {
			return null;
		}
		Integer id;
		if (object instanceof Number) {
			id = ((Number) object).intValue();
		} else if (object instanceof Map) {
			id = (Integer) ((Map) object).get("id");
		} else {
			return null;
		}
		if (id == null) {
			return null;
		}
		OrganizationDao organizationDao = (OrganizationDao) SpringBeanUtils.getBean("organizationDao");
		return convertToPinyin(organizationDao.internalGetById(id).getName());
	}

	@Override
	public Object getValue(CustomFieldValueDO customFieldValueDO) {
		return customFieldValueDO.getNumberValue();
	}
	
	@Override
	public Object getCustomFieldDisplayValue(CustomFieldValueDO customFieldValueDO) {
		OrganizationDao organizationDao = (OrganizationDao) SpringBeanUtils.getBean("organizationDao");
		return organizationDao.convert(organizationDao.internalGetById(customFieldValueDO.getNumberValue().intValue()), Arrays.asList(new String[]{"id", "name", "nameEn", "nameByLanguage"}), true, false);
	}

}
