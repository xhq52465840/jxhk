
package com.usky.sms.risk.systemanalysis;

import java.util.List;

import com.usky.sms.core.BaseDao;

public class SystemAnalysisActivityTypeEntityDao extends BaseDao<SystemAnalysisActivityTypeEntityDO> {
	
	public SystemAnalysisActivityTypeEntityDao() {
		super(SystemAnalysisActivityTypeEntityDO.class);
	}
	
	public boolean hasSystemAnalysisActivityTypeEntity(int activityTypeId) {
		@SuppressWarnings("unchecked")
		List<SystemAnalysisActivityTypeEntityDO> list = this.getHibernateTemplate().find("from SystemAnalysisActivityTypeEntityDO where activityType.id = ?", activityTypeId);
		return !list.isEmpty();
	}
	
}
