
package com.usky.sms.field.screen;

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

public class ActivityTypeFieldScreenSchemeDao extends BaseDao<ActivityTypeFieldScreenSchemeDO> {
	
	@Autowired
	private ActivityTypeFieldScreenSchemeEntityDao activityTypeFieldScreenSchemeEntityDao;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private UnitConfigDao unitConfigDao;
	
	public ActivityTypeFieldScreenSchemeDao() {
		super(ActivityTypeFieldScreenSchemeDO.class);
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public Integer save(Map<String, Object> map) {
		Integer schemeId = ((Number) map.remove("defaultFieldScreenScheme")).intValue();
		
		ActivityTypeFieldScreenSchemeDO scheme = new ActivityTypeFieldScreenSchemeDO();
		copyValues(scheme, map);
		Integer id = (Integer) this.internalSave(scheme);
		
		ActivityTypeFieldScreenSchemeEntityDO entity = new ActivityTypeFieldScreenSchemeEntityDO();
		entity.setScheme(scheme);
		FieldScreenSchemeDO fieldScreenScheme = new FieldScreenSchemeDO();
		fieldScreenScheme.setId(schemeId);
		entity.setFieldScreenScheme(fieldScreenScheme);
		activityTypeFieldScreenSchemeEntityDao.internalSave(entity);
		
		return id;
	}
	
	@Override
	protected void beforeDelete(Collection<ActivityTypeFieldScreenSchemeDO> schemes) {
		if (schemes == null || schemes.size() == 0) return;
		@SuppressWarnings("unchecked")
		List<ActivityTypeFieldScreenSchemeEntityDO> list = this.getHibernateTemplate().findByNamedParam("from ActivityTypeFieldScreenSchemeEntityDO where scheme in (:schemes)", "schemes", schemes);
		activityTypeFieldScreenSchemeEntityDao.delete(list);
	}
	
	@Override
	protected void afterGetList(List<Map<String, Object>> list, Map<String, Object> paramMap, Map<String, Object> searchMap, List<String> orders) {
		List<UnitConfigDO> configs = unitConfigDao.getAllList();
		Map<Integer, List<Map<String, Object>>> idUnitsMap = new HashMap<Integer, List<Map<String, Object>>>();
		List<String> fields = Arrays.asList(new String[] { "id", "name" });
		for (UnitConfigDO config : configs) {
			Integer id = config.getActivityTypeFieldScreenScheme().getId();
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
	
	public ActivityTypeFieldScreenSchemeDO getDefaultScheme() {
		@SuppressWarnings("unchecked")
		List<ActivityTypeFieldScreenSchemeDO> list = this.getHibernateTemplate().find("from ActivityTypeFieldScreenSchemeDO where type = ?", "default");
		if (list.size() == 0) return null;
		return list.get(0);
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void copy(Integer id, String name, String description) throws Exception {
		ActivityTypeFieldScreenSchemeDO src = this.internalGetById(id);
		ActivityTypeFieldScreenSchemeDO dest = new ActivityTypeFieldScreenSchemeDO();
		this.copyValues(src, dest);
		dest.setName(name);
		dest.setDescription(description);
		dest.setType(null);
		this.internalSave(dest);
		activityTypeFieldScreenSchemeEntityDao.copyByActivityTypeFieldScreenScheme(src, dest);
	}
	
	public void setActivityTypeFieldScreenSchemeEntityDao(ActivityTypeFieldScreenSchemeEntityDao activityTypeFieldScreenSchemeEntityDao) {
		this.activityTypeFieldScreenSchemeEntityDao = activityTypeFieldScreenSchemeEntityDao;
	}
	
	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}
	
	public void setUnitConfigDao(UnitConfigDao unitConfigDao) {
		this.unitConfigDao = unitConfigDao;
	}
	
}
