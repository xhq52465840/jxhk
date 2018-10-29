
package com.usky.sms.field;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.core.BaseDao;

public class FieldLayoutDao extends BaseDao<FieldLayoutDO> {
	
	@Autowired
	private FieldLayoutItemDao fieldLayoutItemDao;
	
	@Autowired
	private FieldLayoutSchemeEntityDao fieldLayoutSchemeEntityDao;
	
	public FieldLayoutDao() {
		super(FieldLayoutDO.class);
	}
	
	@Override
	protected void afterSave(FieldLayoutDO layout) {
		FieldLayoutDO defaultLayout = this.getDefaultLayout();
		if (defaultLayout == null) return;
		List<FieldLayoutItemDO> items = fieldLayoutItemDao.getByFieldLayoutId(defaultLayout.getId());
		List<FieldLayoutItemDO> itemsCopy = new ArrayList<FieldLayoutItemDO>();
		for (FieldLayoutItemDO item : items) {
			FieldLayoutItemDO itemCopy = new FieldLayoutItemDO();
			itemCopy.setHidden(item.getHidden());
			itemCopy.setRequired(item.getRequired());
			itemCopy.setRenderer(item.getRenderer());
			itemCopy.setKey(item.getKey());
			itemCopy.setDescription(item.getDescription());
			itemCopy.setLayout(layout);
			itemsCopy.add(itemCopy);
		}
		fieldLayoutItemDao.internalSave(itemsCopy);
	}
	
	@Override
	protected void beforeDelete(Collection<FieldLayoutDO> layouts) {
		if (layouts == null || layouts.size() == 0) return;
		@SuppressWarnings("unchecked")
		List<FieldLayoutItemDO> list = this.getHibernateTemplate().findByNamedParam("from FieldLayoutItemDO where layout in (:layouts)", "layouts", layouts);
		fieldLayoutItemDao.delete(list);
	}
	
	@Override
	protected void afterGetList(List<Map<String, Object>> list, Map<String, Object> paramMap, Map<String, Object> searchMap, List<String> orders) {
		List<FieldLayoutSchemeEntityDO> entities = fieldLayoutSchemeEntityDao.getList();
		Map<Integer, List<Map<String, Object>>> idSchemesMap = new HashMap<Integer, List<Map<String, Object>>>();
		for (FieldLayoutSchemeEntityDO entity : entities) {
			Integer id = entity.getLayout().getId();
			List<Map<String, Object>> schemeMaps = idSchemesMap.get(id);
			if (schemeMaps == null) {
				schemeMaps = new ArrayList<Map<String, Object>>();
				idSchemesMap.put(id, schemeMaps);
			}
			Map<String, Object> schemeMap = null;
			FieldLayoutSchemeDO scheme = entity.getScheme();
			for (Map<String, Object> map : schemeMaps) {
				if (scheme.getId().equals(map.get("id"))) {
					schemeMap = map;
					break;
				}
			}
			if (schemeMap == null) {
				schemeMap = new HashMap<String, Object>();
			} else {
				continue;
			}
			schemeMap.put("id", scheme.getId());
			schemeMap.put("name", scheme.getName());
			schemeMaps.add(schemeMap);
		}
		for (Object obj : list) {
			@SuppressWarnings("unchecked")
			Map<String, Object> map = (Map<String, Object>) obj;
			map.put("schemes", idSchemesMap.get(map.get("id")));
		}
	}
	
	public FieldLayoutDO getDefaultLayout() {
		@SuppressWarnings("unchecked")
		List<FieldLayoutDO> list = this.getHibernateTemplate().find("from FieldLayoutDO where type = ?", "default");
		if (list.size() == 0) return null;
		return list.get(0);
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void copy(Integer id, String name, String description) throws Exception {
		FieldLayoutDO src = this.internalGetById(id);
		FieldLayoutDO dest = new FieldLayoutDO();
		this.copyValues(src, dest);
		dest.setName(name);
		dest.setDescription(description);
		dest.setType(null);
		this.internalSave(dest);
		fieldLayoutItemDao.copyByFieldLayout(src, dest);
	}
	
	public void setFieldLayoutItemDao(FieldLayoutItemDao fieldLayoutItemDao) {
		this.fieldLayoutItemDao = fieldLayoutItemDao;
	}
	
	public void setFieldLayoutSchemeEntityDao(FieldLayoutSchemeEntityDao fieldLayoutSchemeEntityDao) {
		this.fieldLayoutSchemeEntityDao = fieldLayoutSchemeEntityDao;
	}
	
}
