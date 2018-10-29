
package com.usky.sms.risk.systemanalysis;

import java.util.List;

import com.usky.sms.core.BaseDao;

public class SystemAnalysisRiskAnalysisActivityTypeEntityDao extends BaseDao<SystemAnalysisRiskAnalysisActivityTypeEntityDO> {
	
	public SystemAnalysisRiskAnalysisActivityTypeEntityDao() {
		super(SystemAnalysisRiskAnalysisActivityTypeEntityDO.class);
	}
	
	public boolean hasSystemAnalysisRiskAnalysisActivityTypeEntity(int activityTypeId) {
		@SuppressWarnings("unchecked")
		List<SystemAnalysisRiskAnalysisActivityTypeEntityDO> list = this.getHibernateTemplate().find("from SystemAnalysisRiskAnalysisActivityTypeEntityDO where activityType.id = ?", activityTypeId);
		return !list.isEmpty();
	}
	
}
