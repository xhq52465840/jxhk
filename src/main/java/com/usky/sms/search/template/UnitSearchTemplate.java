package com.usky.sms.search.template;

import java.util.Map;

import com.usky.sms.custom.CustomFieldValueDO;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.utils.SpringBeanUtils;

public class UnitSearchTemplate extends AbstractIntSearchTemplate {

	@Override
	public String getKey() {
		return "com.sms.plugin.search.unitProp";
	}

	@Override
	public String getName() {
		return "安监机构搜索器";
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
		UnitDao unitDao = (UnitDao) SpringBeanUtils.getBean("unitDao");
		return this.convertToPinyin(unitDao.internalGetById(id).getName());
	}

	@Override
	public Object getValue(CustomFieldValueDO customFieldValueDO) {
		return customFieldValueDO.getNumberValue();
	}

}
