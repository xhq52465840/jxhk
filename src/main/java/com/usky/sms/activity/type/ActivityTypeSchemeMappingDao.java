
package com.usky.sms.activity.type;

import java.util.List;

import com.usky.sms.core.BaseDao;

public class ActivityTypeSchemeMappingDao extends BaseDao<ActivityTypeSchemeMappingDO> {
	
	public ActivityTypeSchemeMappingDao() {
		super(ActivityTypeSchemeMappingDO.class);
	}
	
	public Integer getNextOrder(ActivityTypeSchemeDO scheme) {
		@SuppressWarnings("unchecked")
		List<ActivityTypeSchemeMappingDO> mappings = this.getHibernateTemplate().find("from ActivityTypeSchemeMappingDO where scheme = ?", scheme);
		int lastOrder = 0;
		for (ActivityTypeSchemeMappingDO mapping : mappings) {
			Integer order = mapping.getTypeOrder();
			if (order != null && order > lastOrder) lastOrder = order;
		}
		return lastOrder + 1;
	}
	
	public List<ActivityTypeSchemeMappingDO> getByActivityTypeSchemeId(int schemeId) {
		@SuppressWarnings("unchecked")
		List<ActivityTypeSchemeMappingDO> list = this.getHibernateTemplate().find("from ActivityTypeSchemeMappingDO where scheme.id = ?", schemeId);
		return list;
	}
	
}
