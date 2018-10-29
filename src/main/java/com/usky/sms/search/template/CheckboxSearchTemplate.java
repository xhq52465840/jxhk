package com.usky.sms.search.template;

import com.usky.sms.custom.CustomFieldValueDO;

public class CheckboxSearchTemplate extends AbstractStringSearchTemplate {

	@Override
	public String getKey() {
		return "com.sms.plugin.search.checkboxProp";
	}

	@Override
	public String getName() {
		return "复选框搜索器";
	}

	@Override
	public Object getValue(CustomFieldValueDO customFieldValueDO) {
		return customFieldValueDO.getStringValue();
	}

}
