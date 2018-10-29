
package com.usky.sms.activity.type;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.hibernate.LockMode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.config.Config;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.unit.UnitConfigDO;
import com.usky.sms.unit.UnitConfigDao;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;

public class ActivityTypeSchemeDao extends BaseDao<ActivityTypeSchemeDO> {
	
	private Config config;
	
	@Autowired
	private ActivityTypeDao activityTypeDao;
	
	@Autowired
	private ActivityTypeSchemeMappingDao activityTypeSchemeMappingDao;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private UnitConfigDao unitConfigDao;
	
	public ActivityTypeSchemeDao() {
		super(ActivityTypeSchemeDO.class);
		this.config = Config.getInstance();
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public Integer save(Map<String, Object> map) {
		@SuppressWarnings("unchecked")
		List<Double> types = (List<Double>) map.remove("types");
		ActivityTypeSchemeDO scheme = new ActivityTypeSchemeDO();
		copyValues(scheme, map);
		Integer id = (Integer) this.internalSave(scheme);
		if (types != null) {
			int order = 1;
			for (Double typeId : types) {
				ActivityTypeDO type = new ActivityTypeDO();
				type.setId(typeId.intValue());
				ActivityTypeSchemeMappingDO mapping = new ActivityTypeSchemeMappingDO();
				mapping.setScheme(scheme);
				mapping.setType(type);
				mapping.setTypeOrder(order++);
				activityTypeSchemeMappingDao.internalSave(mapping);
			}
		}
		return id;
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void update(int id, Map<String, Object> map) {
		@SuppressWarnings("unchecked")
		List<Double> types = (List<Double>) map.remove("types");
		ActivityTypeSchemeDO scheme = getHibernateTemplate().load(clazz, id, LockMode.PESSIMISTIC_WRITE);
		if (scheme == null) throw SMSException.NO_MATCHABLE_OBJECT;
		boolean result = copyValues(scheme, map);
		if (result) this.internalUpdate(scheme);
		if (types != null) {
			@SuppressWarnings("unchecked")
			List<ActivityTypeSchemeMappingDO> mappings = this.getHibernateTemplate().find("from ActivityTypeSchemeMappingDO where scheme = ?", scheme);
			activityTypeSchemeMappingDao.delete(mappings);
			int order = 1;
			for (Double typeId : types) {
				ActivityTypeDO type = new ActivityTypeDO();
				type.setId(typeId.intValue());
				ActivityTypeSchemeMappingDO mapping = new ActivityTypeSchemeMappingDO();
				mapping.setScheme(scheme);
				mapping.setType(type);
				mapping.setTypeOrder(order++);
				activityTypeSchemeMappingDao.internalSave(mapping);
			}
		}
	}
	
	@Override
	protected void beforeDelete(Collection<ActivityTypeSchemeDO> schemes) {
		if (schemes == null || schemes.size() == 0) return;
		@SuppressWarnings("unchecked")
		List<ActivityTypeSchemeMappingDO> list = this.getHibernateTemplate().findByNamedParam("from ActivityTypeSchemeMappingDO where scheme in (:schemes)", "schemes", schemes);
		activityTypeSchemeMappingDao.delete(list);
	}
	
	@Override
	protected void afterGetList(List<Map<String, Object>> list, Map<String, Object> paramMap, Map<String, Object> searchMap, List<String> orders) {
		List<ActivityTypeSchemeMappingDO> mappings = activityTypeSchemeMappingDao.getAllList();
		Map<Integer, List<Map<String, Object>>> idTypesMap = new HashMap<Integer, List<Map<String, Object>>>();
		for (ActivityTypeSchemeMappingDO mapping : mappings) {
			Integer id = mapping.getScheme().getId();
			List<Map<String, Object>> types = idTypesMap.get(id);
			if (types == null) {
				types = new ArrayList<Map<String, Object>>();
				idTypesMap.put(id, types);
			}
			Map<String, Object> type = activityTypeDao.convert(mapping.getType());
			type.put("order", mapping.getTypeOrder());
			types.add(type);
		}
		List<UnitConfigDO> configs = unitConfigDao.getAllList();
		Map<Integer, List<Map<String, Object>>> idUnitsMap = new HashMap<Integer, List<Map<String, Object>>>();
		List<String> fields = Arrays.asList(new String[] { "id", "name" });
		for (UnitConfigDO config : configs) {
			Integer id = config.getActivityTypeScheme().getId();
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
			map.put("types", idTypesMap.get(map.get("id")));
			map.put("units", idUnitsMap.get(map.get("id")));
		}
	}
	
	@Override
	protected void afterGetById(Map<String, Object> map) {
		int id = (Integer) map.get("id");
		List<ActivityTypeSchemeMappingDO> mappings = activityTypeSchemeMappingDao.getByActivityTypeSchemeId(id);
		List<ActivityTypeDO> types = activityTypeDao.getAllList();
		List<Map<String, Object>> activityTypeMaps = new ArrayList<Map<String, Object>>();
		for (ActivityTypeSchemeMappingDO mapping : mappings) {
			Map<String, Object> activityTypeMap = new HashMap<String, Object>();
			ActivityTypeDO type = mapping.getType();
			for (ActivityTypeDO t : types) {
				if (t.getId().equals(type.getId())) {
					types.remove(t);
					break;
				}
			}
			activityTypeMap.put("id", type.getId());
			activityTypeMap.put("name", type.getName());
			activityTypeMaps.add(activityTypeMap);
		}
		map.put("types", activityTypeMaps);
		List<Map<String, Object>> restActivityTypeMaps = new ArrayList<Map<String, Object>>();
		for (ActivityTypeDO type : types) {
			Map<String, Object> restActivityTypeMap = new HashMap<String, Object>();
			restActivityTypeMap.put("id", type.getId());
			restActivityTypeMap.put("name", type.getName());
			restActivityTypeMaps.add(restActivityTypeMap);
		}
		map.put("restTypes", restActivityTypeMaps);
		List<UnitDO> units = unitDao.getByActivityTypeSchemeId(id);
		List<Map<String, Object>> unitMaps = new ArrayList<Map<String, Object>>();
		for (UnitDO unit : units) {
			Map<String, Object> unitMap = new HashMap<String, Object>();
			unitMap.put("id", unit.getId());
			unitMap.put("name", unit.getName());
			if (unit.getAvatar() == null) {
				unitMap.put("avatar", this.config.getUnitAvatarWebPath() + "/" + this.config.getDefaultUnitAvatar());
			} else {
				unitMap.put("avatar", this.config.getUnitAvatarWebPath() + "/" + unit.getAvatar().getFileName());
			}
			unitMaps.add(unitMap);
		}
		map.put("units", unitMaps);
	}
	
	public ActivityTypeSchemeDO getDefaultScheme() {
		@SuppressWarnings("unchecked")
		List<ActivityTypeSchemeDO> list = this.getHibernateTemplate().find("from ActivityTypeSchemeDO where type = ?", "default");
		if (list.size() == 0) return null;
		return list.get(0);
	}
	
	public void setActivityTypeDao(ActivityTypeDao activityTypeDao) {
		this.activityTypeDao = activityTypeDao;
	}
	
	public void setActivityTypeSchemeMappingDao(ActivityTypeSchemeMappingDao activityTypeSchemeMappingDao) {
		this.activityTypeSchemeMappingDao = activityTypeSchemeMappingDao;
	}
	
	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}
	
	public void setUnitConfigDao(UnitConfigDao unitConfigDao) {
		this.unitConfigDao = unitConfigDao;
	}
	
}
