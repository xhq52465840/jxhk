package com.usky.sms.search.template;

import java.util.Arrays;
import java.util.Map;

import com.usky.sms.custom.CustomFieldValueDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.utils.SpringBeanUtils;

public class DictionaryIdSearchTemplate extends AbstractIntSearchTemplate {

	@Override
	public String getKey() {
		return "com.sms.plugin.search.dictionaryIDProp";
	}

	@Override
	public String getName() {
		return "字典ID搜索器";
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
		DictionaryDao dictionaryDao = (DictionaryDao) SpringBeanUtils.getBean("dictionaryDao");
		return this.convertToPinyin(dictionaryDao.internalGetById(id).getName());
	}
	
	@Override
	public Object getSolrFieldValue(Object object) {
		int id;
		if (object instanceof Number) {
			id = ((Number) object).intValue();
		} else if (object instanceof Map) {
			id = (Integer) ((Map) object).get("id");
		} else {
			return null;
		}
		DictionaryDao dictionaryDao = (DictionaryDao) SpringBeanUtils.getBean("dictionaryDao");
		return dictionaryDao.convert(dictionaryDao.internalGetById(id), false);
	}
	
	@Override
	public Object getCustomFieldDisplayValue(CustomFieldValueDO value) {
		Integer id = (Integer) getValue(value);
		if (id == null) {
			return null;
		}
		DictionaryDao dictionaryDao = (DictionaryDao) SpringBeanUtils.getBean("dictionaryDao");
		return dictionaryDao.convert(dictionaryDao.internalGetById(id), false);
	}

	@Override
	public Object getValue(CustomFieldValueDO customFieldValueDO) {
		return customFieldValueDO.getNumberValue() == null ? null : customFieldValueDO.getNumberValue().intValue();
	}

	@Override
	public String getOrderFieldName() {
		return "stringValue";
	}

}
