
package com.usky.sms.tem;

import java.util.List;

import com.usky.sms.core.BaseDao;

public class TemActivityTypeEntityDao extends BaseDao<TemActivityTypeEntityDO> {
	
	public TemActivityTypeEntityDao() {
		super(TemActivityTypeEntityDO.class);
	}
	
	public boolean hasTemActivityTypeEntity(int activityTypeId) {
		@SuppressWarnings("unchecked")
		List<TemActivityTypeEntityDO> list = this.getHibernateTemplate().find("from TemActivityTypeEntityDO where activityType.id = ?", activityTypeId);
		return !list.isEmpty();
	}
	
}
