
package com.usky.sms.activity.attribute;

import java.util.List;

import com.usky.sms.core.BaseDao;

public class ActivityResolutionDao extends BaseDao<ActivityResolutionDO> {
	
	public ActivityResolutionDao() {
		super(ActivityResolutionDO.class);
	}
	
	@Override
	protected void afterUpdate(ActivityResolutionDO resolution, ActivityResolutionDO dbResolution) {
		if (resolution.getDefaultValue() && !dbResolution.getDefaultValue()) {
			for (ActivityResolutionDO defaultResolution : this.getDefaultResolution()) {
				if (defaultResolution.getId().equals(resolution.getId())) continue;
				defaultResolution.setDefaultValue(false);
				this.internalUpdate(defaultResolution);
			}
		}
	}
	
	public List<ActivityResolutionDO> getDefaultResolution() {
		@SuppressWarnings("unchecked")
		List<ActivityResolutionDO> list = this.getHibernateTemplate().find("from ActivityResolutionDO where defaultValue = ?", true);
		return list;
	}
	
}
