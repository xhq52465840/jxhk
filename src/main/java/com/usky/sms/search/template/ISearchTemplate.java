
package com.usky.sms.search.template;

import java.util.List;
import java.util.Map;

import com.usky.sms.custom.CustomFieldValueDO;

public interface ISearchTemplate {
	
	public String getKey();
	
	public String getName();
	
	public String getSolrFieldName(String key);
	
	public Object getSolrFieldValue(Object object);

	public String getSolrFieldSortName(String key);

	public Object getSolrFieldSortValue(Object object);
	
	public String getUql(String key, List<Map<String, Object>> list);
	
	public Object getValue(CustomFieldValueDO value);
	
	/** 获取自定义字段显示在详情页面和检索页面的内容 */
	public Object getCustomFieldDisplayValue(CustomFieldValueDO value);
	
	public String getOrderFieldName();
	
	/**
	 * 获取显示在页面的内容
	 * @return
	 */
	public String getExportContent(Object object);
	
}
