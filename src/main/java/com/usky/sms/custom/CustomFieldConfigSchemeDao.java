
package com.usky.sms.custom;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.usky.sms.activity.type.ActivityTypeDO;
import com.usky.sms.core.BaseDao;

public class CustomFieldConfigSchemeDao extends BaseDao<CustomFieldConfigSchemeDO> {
	
	public CustomFieldConfigSchemeDao() {
		super(CustomFieldConfigSchemeDO.class);
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		CustomFieldConfigSchemeDO scheme = (CustomFieldConfigSchemeDO) obj;
		if ("activityTypes".equals(fieldName)) {
			List<Map<String, Object>> typeMaps = new ArrayList<Map<String, Object>>();
			for (ActivityTypeDO type : scheme.getActivityTypes()) {
				Map<String, Object> typeMap = new HashMap<String, Object>();
				typeMap.put("id", type.getId());
				typeMap.put("name", type.getName());
				typeMap.put("url", type.getUrl());
				typeMaps.add(typeMap);
			}
			map.put("activityTypes", typeMaps);
			return;
		}
		super.setField(map, obj, claz, multiple, field);
	}
	
	public List<CustomFieldConfigSchemeDO> getByCustomFields(Collection<CustomFieldDO> fields) {
		@SuppressWarnings("unchecked")
		List<CustomFieldConfigSchemeDO> list = this.getHibernateTemplate().findByNamedParam("from CustomFieldConfigSchemeDO where field in (:fields)", "fields", fields);
		return list;
	}
	
	public List<CustomFieldConfigSchemeDO> getCustomFieldConfigScheme(int unitId, int typeId) {
		@SuppressWarnings("unchecked")
		List<CustomFieldConfigSchemeDO> list = this.getHibernateTemplate().find("select s from CustomFieldConfigSchemeDO s left join s.units u left join s.activityTypes t where (u.id = ? or s.units is empty) and (t.id = ? or s.activityTypes is empty)", unitId, typeId);
		return list;
	}
	
}
