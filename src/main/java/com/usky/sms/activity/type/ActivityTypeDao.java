
package com.usky.sms.activity.type;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.core.BaseDao;

public class ActivityTypeDao extends BaseDao<ActivityTypeDO> {
	
	@Autowired
	private ActivityTypeSchemeDao activityTypeSchemeDao;
	
	@Autowired
	private ActivityTypeSchemeMappingDao activityTypeSchemeMappingDao;
	
	public ActivityTypeDao() {
		super(ActivityTypeDO.class);
	}
	
	@Override
	protected void afterSave(ActivityTypeDO type) {
		ActivityTypeSchemeDO scheme = activityTypeSchemeDao.getDefaultScheme();
		ActivityTypeSchemeMappingDO mapping = new ActivityTypeSchemeMappingDO();
		mapping.setScheme(scheme);
		mapping.setType(type);
		mapping.setTypeOrder(activityTypeSchemeMappingDao.getNextOrder(scheme));
		activityTypeSchemeMappingDao.internalSave(mapping);
	}
	
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}
	
	@Override
	protected void afterGetList(List<Map<String, Object>> list, Map<String, Object> paramMap, Map<String, Object> searchMap, List<String> orders) {
		List<ActivityTypeSchemeMappingDO> mappings = activityTypeSchemeMappingDao.getList();
		Map<Integer, List<Map<String, Object>>> idMap = new HashMap<Integer, List<Map<String, Object>>>();
		for (ActivityTypeSchemeMappingDO mapping : mappings) {
			Integer id = mapping.getType().getId();
			List<Map<String, Object>> idList = idMap.get(id);
			if (idList == null) {
				idList = new ArrayList<Map<String, Object>>();
				idMap.put(id, idList);
			}
			Map<String, Object> map = new HashMap<String, Object>();
			ActivityTypeSchemeDO scheme = mapping.getScheme();
			map.put("id", scheme.getId());
			map.put("name", scheme.getName());
			idList.add(map);
		}
		for (Object obj : list) {
			@SuppressWarnings("unchecked")
			Map<String, Object> map = (Map<String, Object>) obj;
			map.put("schemes", idMap.get(map.get("id")));
		}
	}
	
	public ActivityTypeDO getDefaultByUnitId(int unitId) {
		@SuppressWarnings("unchecked")
		List<ActivityTypeDO> list = this.getHibernateTemplate().find("select distinct m.type from ActivityTypeSchemeMappingDO m, UnitConfigDO c where m.scheme = c.activityTypeScheme and c.unit.id = ? and m.scheme.defaultType = m.type", unitId);
		if (list.size() > 0) return list.get(0);
		return null;
	}
	
	public List<ActivityTypeDO> getByActivityId(int activityId) {
		@SuppressWarnings("unchecked")
		List<ActivityTypeDO> list = this.getHibernateTemplate().find("select m.type from ActivityTypeSchemeMappingDO m, UnitConfigDO c, ActivityDO a where m.scheme = c.activityTypeScheme and c.unit = a.unit and a.id = ? order by m.typeOrder", activityId);
		return list;
	}
	
	public List<ActivityTypeDO> getByUnitId(int unitId) {
		@SuppressWarnings("unchecked")
		List<ActivityTypeDO> list = this.getHibernateTemplate().find("select m.type from ActivityTypeSchemeMappingDO m, UnitConfigDO c where m.scheme = c.activityTypeScheme and c.unit.id = ? order by m.typeOrder", unitId);
		return list;
	}
	
	/**
	 * 通过名称查找对应的信息类型的记录，如果没有则返回null，否则返回第一条数据
	 */
	public ActivityTypeDO getByName(String name) {
		if (null == name) return null;
		@SuppressWarnings("unchecked")
		List<ActivityTypeDO> list = (List<ActivityTypeDO>) this.query("from ActivityTypeDO t  where t.deleted = false and t.name = ?", name);
		if (list.isEmpty()) return null;
		return list.get(0);
	}
	
	public void setActivityTypeSchemeDao(ActivityTypeSchemeDao activityTypeSchemeDao) {
		this.activityTypeSchemeDao = activityTypeSchemeDao;
	}
	
	public void setActivityTypeSchemeMappingDao(ActivityTypeSchemeMappingDao activityTypeSchemeMappingDao) {
		this.activityTypeSchemeMappingDao = activityTypeSchemeMappingDao;
	}
	
}
