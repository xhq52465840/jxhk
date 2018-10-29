
package com.usky.sms.search.template;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.math.NumberUtils;

import com.google.gson.Gson;
import com.usky.comm.Utility;
import com.usky.sms.common.PinyinUtils;
import com.usky.sms.custom.CustomFieldValueDO;
import com.usky.sms.http.service.GsonBuilder4SMS;

abstract class AbstractSearchTemplate implements ISearchTemplate {
	
	protected static final Gson gson = GsonBuilder4SMS.getInstance();
	
	@Override
	public String getKey() {
		return StringUtils.EMPTY;
	}
	
	@Override
	public String getName() {
		return StringUtils.EMPTY;
	}
	
	@Override
	public String getSolrFieldName(String key) {
		return StringUtils.EMPTY;
	}
	
	@Override
	public Object getSolrFieldValue(Object object) {
		return object;
	}
	
	@Override
	public String getSolrFieldSortName(String key) {
		return key + "_sort_string";
	}
	
	@Override
	public Object getSolrFieldSortValue(Object object) {
		return convertToPinyin(getSolrFieldValue(object));
	}
	
	@Override
	public String getUql(String key, List<Map<String, Object>> list) {
		String uql = StringUtils.EMPTY;
		for (Map<String, Object> m : list) {
			String value = Utility.GetStringField(m, "id");
			if (Utility.IsEmpty(value)) {
				continue;
			}
			if (NumberUtils.isNumber(value)) {
				value = String.valueOf(((Number) Double.parseDouble(value)).intValue());
			}
			if (Utility.IsEmpty(uql)) {
				uql = value;
			} else {
				uql += " OR " + value;
			}
		}
		if (!Utility.IsEmpty(uql)) {
			return getSolrFieldName(key) + ":(" + uql + ")";
		} else {
			return uql;
		}
	}
	
	@Override
	public Object getValue(CustomFieldValueDO customFieldValueDO) {
		if (customFieldValueDO == null) {
			return null;
		}
		if (customFieldValueDO.getStringValue() != null) {
			return customFieldValueDO.getStringValue();
		}
		if (customFieldValueDO.getNumberValue() != null) {
			return customFieldValueDO.getNumberValue();
		}
		if (customFieldValueDO.getTextValue() != null) {
			return customFieldValueDO.getTextValue();
		}
		if (customFieldValueDO.getDateValue() != null) {
			return customFieldValueDO.getDateValue();
		}
		return null;
	}

	@Override
	public Object getCustomFieldDisplayValue(CustomFieldValueDO value) {
		return getValue(value);
	}

	@Override
	public String getOrderFieldName() {
		return "stringValue";
	}
	
	@SuppressWarnings({ "unchecked", "rawtypes" })
	@Override
	public String getExportContent(Object object) {
		if (null == object) {
			return StringUtils.EMPTY;
		}
		if (object instanceof Map) {
			return ((Map<String, Object>) object).get("name").toString();
		} else if (object instanceof Collection || object instanceof Object[]) {
			List<String> resultList = new ArrayList<String>();
			if (object instanceof Collection) {
				for (Object o : (Collection) object) {
					resultList.add(getExportContent(o));
				}
			} else {
				for (Object o : (Object[]) object) {
					resultList.add(getExportContent(o));
				}
			}
			return StringUtils.join(resultList.toArray(), ";");
		}
		return object.toString();
	}
	
	/**
	 * 将字符串转换成拼音
	 * @param object
	 * @return
	 */
	public String convertToPinyin(Object object) {
		if (object == null) {
			return StringUtils.EMPTY;
		}
		return StringUtils.upperCase(PinyinUtils.toPinYin(object.toString(), " "));
	}
	
}
