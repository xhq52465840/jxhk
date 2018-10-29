
package com.usky.sms.field;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.activity.type.ActivityTypeDO;
import com.usky.sms.core.BaseDao;

public class FieldLayoutSchemeEntityDao extends BaseDao<FieldLayoutSchemeEntityDO> {
	
	public FieldLayoutSchemeEntityDao() {
		super(FieldLayoutSchemeEntityDO.class);
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		FieldLayoutSchemeEntityDO entity = (FieldLayoutSchemeEntityDO) obj;
		if ("type".equals(fieldName)) {
			ActivityTypeDO type = entity.getType();
			if (type == null) {
				map.put("type", "默认");
				map.put("typeDescription", "用于所有未映射字段配置的安全信息类型。");
				return;
			} else {
				map.put("typeDescription", type.getDescription());
				map.put("typeUrl", type.getUrl());
			}
		}
		super.setField(map, obj, claz, multiple, field);
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void copyByFieldLayoutScheme(FieldLayoutSchemeDO schemeSrc, FieldLayoutSchemeDO schemeDest) throws Exception {
		List<FieldLayoutSchemeEntityDO> srcs = this.getByFieldLayoutSchemeId(schemeSrc.getId());
		List<FieldLayoutSchemeEntityDO> dests = new ArrayList<FieldLayoutSchemeEntityDO>();
		for (FieldLayoutSchemeEntityDO src : srcs) {
			FieldLayoutSchemeEntityDO dest = new FieldLayoutSchemeEntityDO();
			this.copyValues(src, dest);
			dest.setScheme(schemeDest);
			dests.add(dest);
		}
		this.internalSave(dests);
	}
	
	public List<FieldLayoutSchemeEntityDO> getByFieldLayoutSchemeId(int schemeId) {
		@SuppressWarnings("unchecked")
		List<FieldLayoutSchemeEntityDO> list = this.getHibernateTemplate().find("from FieldLayoutSchemeEntityDO where scheme.id = ?", schemeId);
		return list;
	}
	
	public List<FieldLayoutSchemeEntityDO> getByFieldLayoutSchemes(Collection<FieldLayoutSchemeDO> schemes) {
		@SuppressWarnings("unchecked")
		List<FieldLayoutSchemeEntityDO> list = this.getHibernateTemplate().findByNamedParam("from FieldLayoutSchemeEntityDO where scheme in (:schemes)", "schemes", schemes);
		return list;
	}
	
}
