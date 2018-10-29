
package com.usky.sms.activity.security;

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

public class ActivitySecuritySchemeDao extends BaseDao<ActivitySecuritySchemeDO> {
	
	@Autowired
	private ActivitySecurityLevelDao activitySecurityLevelDao;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private UnitConfigDao unitConfigDao;
	
	public ActivitySecuritySchemeDao() {
		super(ActivitySecuritySchemeDO.class);
	}
	
	@Override
	protected void beforeDelete(Collection<ActivitySecuritySchemeDO> schemes) {
		if (schemes == null || schemes.size() == 0) return;
		@SuppressWarnings("unchecked")
		List<ActivitySecurityLevelDO> list = this.getHibernateTemplate().findByNamedParam("from ActivitySecurityLevelDO where scheme in (:schemes)", "schemes", schemes);
		activitySecurityLevelDao.delete(list);
	}
	
	@Override
	protected void afterGetList(List<Map<String, Object>> list, Map<String, Object> paramMap, Map<String, Object> searchMap, List<String> orders) {
		List<UnitConfigDO> configs = unitConfigDao.getAllList();
		Map<Integer, List<Map<String, Object>>> idUnitsMap = new HashMap<Integer, List<Map<String, Object>>>();
		List<String> fields = Arrays.asList(new String[] { "id", "name" });
		for (UnitConfigDO config : configs) {
			if (config.getActivitySecurityScheme() == null) continue;
			Integer id = config.getActivitySecurityScheme().getId();
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
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void copy(Integer id, String name, String description) throws Exception {
		ActivitySecuritySchemeDO src = this.internalGetById(id);
		ActivitySecuritySchemeDO dest = new ActivitySecuritySchemeDO();
		this.copyValues(src, dest);
		dest.setName(name);
		dest.setDescription(description);
		this.internalSave(dest);
		activitySecurityLevelDao.copyByActivitySecurityScheme(src, dest);
	}
	
	public void setActivitySecurityLevelDao(ActivitySecurityLevelDao activitySecurityLevelDao) {
		this.activitySecurityLevelDao = activitySecurityLevelDao;
	}
	
	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}
	
	public void setUnitConfigDao(UnitConfigDao unitConfigDao) {
		this.unitConfigDao = unitConfigDao;
	}
	
}
