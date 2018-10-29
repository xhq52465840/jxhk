
package com.usky.sms.field.screen;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;

import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.activity.ActivityOperation;
import com.usky.sms.core.BaseDao;

public class FieldScreenSchemeItemDao extends BaseDao<FieldScreenSchemeItemDO> {
	
	public FieldScreenSchemeItemDao() {
		super(FieldScreenSchemeItemDO.class);
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		FieldScreenSchemeItemDO item = (FieldScreenSchemeItemDO) obj;
		if ("operation".equals(fieldName)) {
			String operation = item.getOperation();
			if (operation == null) {
				map.put("operation", "默认");
				map.put("operationDescription", "用于所有未映射的操作。");
			} else {
				map.put("operation", ActivityOperation.valueOf(operation).getName());
			}
			return;
		}
		super.setField(map, obj, claz, multiple, field);
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void copyByFieldScreenScheme(FieldScreenSchemeDO schemeSrc, FieldScreenSchemeDO schemeDest) throws Exception {
		List<FieldScreenSchemeItemDO> srcs = this.getByFieldScreenSchemeId(schemeSrc.getId());
		for (FieldScreenSchemeItemDO src : srcs) {
			FieldScreenSchemeItemDO dest = new FieldScreenSchemeItemDO();
			this.copyValues(src, dest);
			dest.setScheme(schemeDest);
			this.internalSave(dest);
		}
	}
	
	public List<FieldScreenSchemeItemDO> getByFieldScreenSchemeId(int schemeId) {
		@SuppressWarnings("unchecked")
		List<FieldScreenSchemeItemDO> list = this.getHibernateTemplate().find("from FieldScreenSchemeItemDO where scheme.id = ?", schemeId);
		return list;
	}

	public List<FieldScreenSchemeItemDO> getByUnitAndNullType(int unitId) {
		@SuppressWarnings("unchecked")
		List<FieldScreenSchemeItemDO> list = this.getHibernateTemplate().find("select distinct i from FieldScreenSchemeItemDO i, ActivityTypeFieldScreenSchemeEntityDO e, UnitConfigDO c where c.unit.id = ? and c.activityTypeFieldScreenScheme = e.scheme and e.type is null and e.fieldScreenScheme = i.scheme", unitId);
		return list;
    }

	public List<FieldScreenSchemeItemDO> getByUnitAndType(int unitId, int typeId) {
		@SuppressWarnings("unchecked")
		List<FieldScreenSchemeItemDO> list = this.getHibernateTemplate().find("select distinct i from FieldScreenSchemeItemDO i, ActivityTypeFieldScreenSchemeEntityDO e, UnitConfigDO c where c.unit.id = ? and c.activityTypeFieldScreenScheme = e.scheme and e.type.id = ? and e.fieldScreenScheme = i.scheme", unitId, typeId);
		return list;
    }
	
}
