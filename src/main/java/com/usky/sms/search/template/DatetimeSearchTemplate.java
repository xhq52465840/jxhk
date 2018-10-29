
package com.usky.sms.search.template;

import java.util.Date;

import com.usky.sms.common.DateHelper;
import com.usky.sms.custom.CustomFieldValueDO;

public class DatetimeSearchTemplate extends AbstractDateSearchTemplate {
	
	@Override
	public String getKey() {
		return "com.sms.plugin.search.datetimeProp";
	}
	
	@Override
	public String getName() {
		return "日期时间搜索器";
	}
	
	@Override
	public Object getSolrFieldValue(Object object) {
		if (object instanceof String) {
			String dateString = (String) object;
			int length = dateString.length();
			switch (length) {
				case 0:
					return null;
				case 10:
					object = DateHelper.parseIsoDate(dateString);
					break;
				case 19:
					object = DateHelper.parseIsoSecond(dateString);
					break;
			}
		}
		if (object instanceof Date) {
			object = DateHelper.formatStandardDate((Date) object) + 'Z';
		}
		return object;
	}
	
	@Override
	public Object getValue(CustomFieldValueDO customFieldValueDO) {
		return DateHelper.formatIsoSecond(customFieldValueDO.getDateValue());
	}
	
}
