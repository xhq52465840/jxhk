
package com.usky.sms.field;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.core.BaseDao;
import com.usky.sms.unit.UnitConfigDO;
import com.usky.sms.unit.UnitConfigDao;
import com.usky.sms.unit.UnitDao;

public class FieldLayoutSchemeDao extends BaseDao<FieldLayoutSchemeDO> {
	
	@Autowired
	private FieldLayoutDao fieldLayoutDao;
	
	@Autowired
	private FieldLayoutSchemeEntityDao fieldLayoutSchemeEntityDao;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private UnitConfigDao unitConfigDao;
	
	public FieldLayoutSchemeDao() {
		super(FieldLayoutSchemeDO.class);
	}
	
	@Override
	protected void afterSave(FieldLayoutSchemeDO scheme) {
		FieldLayoutDO layout = fieldLayoutDao.getDefaultLayout();
		FieldLayoutSchemeEntityDO entity = new FieldLayoutSchemeEntityDO();
		entity.setEntityType("default");
		entity.setScheme(scheme);
		entity.setLayout(layout);
		fieldLayoutSchemeEntityDao.internalSave(entity);
	}
	
	@Override
	protected void beforeDelete(Collection<FieldLayoutSchemeDO> schemes) {
		if (schemes == null || schemes.size() == 0) return;
		List<FieldLayoutSchemeEntityDO> entities = fieldLayoutSchemeEntityDao.getByFieldLayoutSchemes(schemes);
		fieldLayoutSchemeEntityDao.delete(entities);
	}
	
	@Override
	protected void afterGetList(List<Map<String, Object>> list, Map<String, Object> paramMap, Map<String, Object> searchMap, List<String> orders) {
		List<UnitConfigDO> configs = unitConfigDao.getAllList();
		Map<Integer, List<Map<String, Object>>> idUnitsMap = new HashMap<Integer, List<Map<String, Object>>>();
		List<String> fields = Arrays.asList(new String[] { "id", "name" });
		for (UnitConfigDO config : configs) {
			Integer id = config.getFieldLayoutScheme().getId();
			List<Map<String, Object>> units = idUnitsMap.get(id);
			if (units == null) {
				units = new ArrayList<Map<String, Object>>();
				idUnitsMap.put(id, units);
			}
			units.add(unitDao.convert(config.getUnit(), fields));
		}
		for (Object obj : list) {
			@SuppressWarnings("unchecked")
			Map<String, Object> map = (Map<String, Object>) obj;
			map.put("units", idUnitsMap.get(map.get("id")));
		}
	}
	
	public FieldLayoutSchemeDO getDefaultScheme() {
		@SuppressWarnings("unchecked")
		List<FieldLayoutSchemeDO> list = this.getHibernateTemplate().find("from FieldLayoutSchemeDO where type = ?", "default");
		if (list.size() == 0) return null;
		return list.get(0);
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void copy(Integer id, String name, String description) throws Exception {
		FieldLayoutSchemeDO src = this.internalGetById(id);
		FieldLayoutSchemeDO dest = new FieldLayoutSchemeDO();
		this.copyValues(src, dest);
		dest.setName(name);
		dest.setDescription(description);
		this.internalSave(dest);
		fieldLayoutSchemeEntityDao.copyByFieldLayoutScheme(src, dest);
	}
	
	public void setFieldLayoutDao(FieldLayoutDao fieldLayoutDao) {
		this.fieldLayoutDao = fieldLayoutDao;
	}
	
	public void setFieldLayoutSchemeEntityDao(FieldLayoutSchemeEntityDao fieldLayoutSchemeEntityDao) {
		this.fieldLayoutSchemeEntityDao = fieldLayoutSchemeEntityDao;
	}
	
	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}
	
	public void setUnitConfigDao(UnitConfigDao unitConfigDao) {
		this.unitConfigDao = unitConfigDao;
	}
	
}
