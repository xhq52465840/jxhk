
package com.usky.sms.accessinformation;

import java.util.List;

import com.usky.sms.core.BaseDao;

public class AccessInformationActivityTypeEntityDao extends BaseDao<AccessInformationActivityTypeEntityDO> {
	
	public AccessInformationActivityTypeEntityDao() {
		super(AccessInformationActivityTypeEntityDO.class);
	}
	
	public boolean hasAccessInformationActivityTypeEntity(int activityTypeId) {
		@SuppressWarnings("unchecked")
		List<AccessInformationActivityTypeEntityDO> list = this.getHibernateTemplate().find("from AccessInformationActivityTypeEntityDO where activityType.id = ?", activityTypeId);
		return !list.isEmpty();
	}
	
}
