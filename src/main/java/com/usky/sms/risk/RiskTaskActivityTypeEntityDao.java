
package com.usky.sms.risk;

import java.util.List;

import com.usky.sms.core.BaseDao;

public class RiskTaskActivityTypeEntityDao extends BaseDao<RiskTaskActivityTypeEntityDO> {
	
	public RiskTaskActivityTypeEntityDao() {
		super(RiskTaskActivityTypeEntityDO.class);
	}
	
	public boolean hasRiskTaskActivityTypeEntity(int activityTypeId) {
		@SuppressWarnings("unchecked")
		List<RiskTaskActivityTypeEntityDO> list = this.getHibernateTemplate().find("from RiskTaskActivityTypeEntityDO where activityType.id = ?", activityTypeId);
		return !list.isEmpty();
	}
	
}
