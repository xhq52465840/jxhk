
package com.usky.sms.field.screen;

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

public class FieldScreenSchemeDao extends BaseDao<FieldScreenSchemeDO> {
	
	@Autowired
	private ActivityTypeFieldScreenSchemeEntityDao activityTypeFieldScreenSchemeEntityDao;
	
	@Autowired
	private FieldScreenSchemeItemDao fieldScreenSchemeItemDao;
	
	public FieldScreenSchemeDao() {
		super(FieldScreenSchemeDO.class);
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public Integer save(Map<String, Object> map) {
		Integer screenId = ((Number) map.remove("defaultFieldScreen")).intValue();
		
		FieldScreenSchemeDO scheme = new FieldScreenSchemeDO();
		copyValues(scheme, map);
		Integer id = (Integer) this.internalSave(scheme);
		
		FieldScreenSchemeItemDO item = new FieldScreenSchemeItemDO();
		item.setScheme(scheme);
		FieldScreenDO screen = new FieldScreenDO();
		screen.setId(screenId);
		item.setScreen(screen);
		fieldScreenSchemeItemDao.internalSave(item);
		
		return id;
	}
	
	@Override
	protected void beforeDelete(Collection<FieldScreenSchemeDO> schemes) {
		if (schemes == null || schemes.size() == 0) return;
		@SuppressWarnings("unchecked")
		List<FieldScreenSchemeItemDO> list = this.getHibernateTemplate().findByNamedParam("from FieldScreenSchemeItemDO where scheme in (:schemes)", "schemes", schemes);
		fieldScreenSchemeItemDao.delete(list);
	}
	
	@Override
	protected void afterGetList(List<Map<String, Object>> list, Map<String, Object> paramMap, Map<String, Object> searchMap, List<String> orders) {
		List<ActivityTypeFieldScreenSchemeEntityDO> entities = activityTypeFieldScreenSchemeEntityDao.getList();
		Map<Integer, List<Map<String, Object>>> idSchemesMap = new HashMap<Integer, List<Map<String, Object>>>();
		for (ActivityTypeFieldScreenSchemeEntityDO entity : entities) {
			Integer id = entity.getFieldScreenScheme().getId();
			List<Map<String, Object>> schemeMaps = idSchemesMap.get(id);
			if (schemeMaps == null) {
				schemeMaps = new ArrayList<Map<String, Object>>();
				idSchemesMap.put(id, schemeMaps);
			}
			Map<String, Object> schemeMap = null;
			ActivityTypeFieldScreenSchemeDO scheme = entity.getScheme();
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
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void copy(Integer id, String name, String description) throws Exception {
		FieldScreenSchemeDO src = this.internalGetById(id);
		FieldScreenSchemeDO dest = new FieldScreenSchemeDO();
		this.copyValues(src, dest);
		dest.setName(name);
		dest.setDescription(description);
		this.internalSave(dest);
		fieldScreenSchemeItemDao.copyByFieldScreenScheme(src, dest);
	}
	
	public void setActivityTypeFieldScreenSchemeEntityDao(ActivityTypeFieldScreenSchemeEntityDao activityTypeFieldScreenSchemeEntityDao) {
		this.activityTypeFieldScreenSchemeEntityDao = activityTypeFieldScreenSchemeEntityDao;
	}
	
	public void setFieldScreenSchemeItemDao(FieldScreenSchemeItemDao fieldScreenSchemeItemDao) {
		this.fieldScreenSchemeItemDao = fieldScreenSchemeItemDao;
	}
	
}
