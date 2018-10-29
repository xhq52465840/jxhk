
package com.usky.sms.eventanalysis;

import java.util.List;

import com.usky.sms.core.BaseDao;

public class EventAnalysisActivityTypeEntityDao extends BaseDao<EventAnalysisActivityTypeEntityDO> {
	
	public EventAnalysisActivityTypeEntityDao() {
		super(EventAnalysisActivityTypeEntityDO.class);
	}
	
	public boolean hasEventAnalysisActivityTypeEntity(int activityTypeId) {
		@SuppressWarnings("unchecked")
		List<EventAnalysisActivityTypeEntityDO> list = this.getHibernateTemplate().find("from EventAnalysisActivityTypeEntityDO where activityType.id = ?", activityTypeId);
		return !list.isEmpty();
	}
	
}
