
package com.usky.sms.field;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.core.BaseDao;
import com.usky.sms.custom.CustomFieldDO;

public class FieldLayoutItemDao extends BaseDao<FieldLayoutItemDO> {
	
	@Autowired
	private FieldRegister fieldRegister;
	
	public FieldLayoutItemDao() {
		super(FieldLayoutItemDO.class);
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		FieldLayoutItemDO item = (FieldLayoutItemDO) obj;
		if ("key".equals(fieldName)) {
			String key = item.getKey();
			map.put("name", fieldRegister.getFieldName(key));
		}
		super.setField(map, obj, claz, multiple, field);
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void copyByFieldLayout(FieldLayoutDO layoutSrc, FieldLayoutDO layoutDest) throws Exception {
		List<FieldLayoutItemDO> srcs = this.getByFieldLayoutId(layoutSrc.getId());
		List<FieldLayoutItemDO> dests = new ArrayList<FieldLayoutItemDO>();
		for (FieldLayoutItemDO src : srcs) {
			FieldLayoutItemDO dest = new FieldLayoutItemDO();
			this.copyValues(src, dest);
			dest.setLayout(layoutDest);
			dests.add(dest);
		}
		this.internalSave(dests);
	}
	
	public List<FieldLayoutItemDO> getByCustomFields(Collection<CustomFieldDO> fields) {
		List<String> keys = new ArrayList<String>();
		for (CustomFieldDO field : fields) {
			keys.add("customfield_" + field.getId());
		}
		@SuppressWarnings("unchecked")
		List<FieldLayoutItemDO> list = this.getHibernateTemplate().findByNamedParam("from FieldLayoutItemDO where key in (:keys)", "keys", keys);
		return list;
	}
	
	public List<FieldLayoutItemDO> getByFieldLayoutId(int layoutId) {
		@SuppressWarnings("unchecked")
		List<FieldLayoutItemDO> list = this.getHibernateTemplate().find("from FieldLayoutItemDO where layout.id = ? order by id", layoutId);
		return list;
	}

	public List<Object[]> getFieldLayoutItemAndFieldLayoutSchemeEntity(int unitId, int typeId) {
		@SuppressWarnings("unchecked")
		List<Object[]> list = this.getHibernateTemplate().find("select i, e from FieldLayoutItemDO i, FieldLayoutSchemeEntityDO e, UnitConfigDO c where c.unit.id = ? and c.fieldLayoutScheme = e.scheme and (e.type.id = ? or e.type is null) and e.layout = i.layout", unitId, typeId);
		return list;
    }
	
	public void setFieldRegister(FieldRegister fieldRegister) {
		this.fieldRegister = fieldRegister;
	}
	
}
