
package com.usky.sms.risk.airline;

import java.util.List;

import com.usky.sms.core.BaseDao;

public class AirlineInfoActivityTypeEntityDao extends BaseDao<AirlineInfoActivityTypeEntityDO> {
	
	public AirlineInfoActivityTypeEntityDao() {
		super(AirlineInfoActivityTypeEntityDO.class);
	}
	
	public boolean hasAirlineInfoActivityTypeEntity(int activityTypeId) {
		@SuppressWarnings("unchecked")
		List<AirlineInfoActivityTypeEntityDO> list = this.getHibernateTemplate().find("from AirlineInfoActivityTypeEntityDO where activityType.id = ?", activityTypeId);
		return !list.isEmpty();
	}
	
}
