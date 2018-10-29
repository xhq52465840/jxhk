
package com.usky.sms.custom;

import java.util.List;

import com.usky.sms.core.BaseDao;

public class CustomFieldTypeDao extends BaseDao<CustomFieldTypeDO> {
	
	public CustomFieldTypeDao() {
		super(CustomFieldTypeDO.class);
	}
	
	public CustomFieldTypeDO getByFieldKey(String key) {
		int id = Integer.parseInt(key.substring(12));
		@SuppressWarnings("unchecked")
		List<CustomFieldTypeDO> list = this.getHibernateTemplate().find("select f.type from CustomFieldDO f where f.id = ?", id);
		if (list.size() > 0) return list.get(0);
		return null;
	}
	
}
