
package com.usky.sms.search.template;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.springframework.beans.BeansException;

import com.google.common.reflect.TypeToken;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.custom.CustomFieldValueDO;
import com.usky.sms.field.FieldRegister;
import com.usky.sms.tem.insecurity.InsecurityDO;
import com.usky.sms.tem.insecurity.InsecurityDao;
import com.usky.sms.utils.SpringBeanUtils;

public class CheckSearchTemplate extends AbstractMultiIntSearchTemplate {
	
	@Override
	public String getKey() {
		return "com.sms.plugin.search.checkProp";
	}
	
	@Override
	public String getName() {
		return "复选搜索器";
	}
	
	@Override
    public Object getSolrFieldSortValue(Object object) {
		return null;
    }

	@Override
	public Object getValue(CustomFieldValueDO customFieldValueDO) {
		String value = customFieldValueDO.getTextValue();
		return value == null || value.isEmpty() ? null : gson.fromJson(value, Integer[].class);
	}

	
	@SuppressWarnings("unchecked")
	@Override
	public Object getCustomFieldDisplayValue(CustomFieldValueDO customFieldValueDO) {
		FieldRegister fieldRegister = (FieldRegister) SpringBeanUtils.getBean("fieldRegister");
		com.usky.sms.field.Field field = fieldRegister.getField(customFieldValueDO.getKey());
		if (field != null && field.getConfig() != null) {
			try {
				BaseDao baseDao = (BaseDao<? extends AbstractBaseDO>) SpringBeanUtils.getBean(field.getConfig() + "Dao");
				Integer[] ids = (Integer[]) this.getValue(customFieldValueDO);
				if (ids != null  && ids.length > 0) {
					return baseDao.convert(baseDao.getByIds(Arrays.asList(ids)), Arrays.asList(new String[]{"id","name"}), false);
				}
			} catch (BeansException e) {
				throw SMSException.NO_MATCHABLE_OBJECT;
			}	
		}
		return null;
	}

}
