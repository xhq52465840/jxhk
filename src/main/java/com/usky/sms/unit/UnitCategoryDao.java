
package com.usky.sms.unit;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.usky.sms.core.BaseDao;

public class UnitCategoryDao extends BaseDao<UnitCategoryDO> {
	
	public UnitCategoryDao() {
		super(UnitCategoryDO.class);
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		UnitCategoryDO category = (UnitCategoryDO) obj;
		if ("unit".equals(fieldName)) {
			Set<UnitDO> units = category.getUnits();
			if (units != null) {
				List<Map<String, Object>> ids = new ArrayList<Map<String, Object>>();
				for (UnitDO unit : units) {
					if (unit.isDeleted()) continue;
					Map<String, Object> subMap = new HashMap<String, Object>();
					subMap.put("id", unit.getId());
					subMap.put("name", unit.getDisplayName());
					ids.add(subMap);
				}
				map.put(field.getName(), ids);
			} else {
				map.put(field.getName(), null);
			}
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}
	
}
