package com.usky.sms.rewards;

import java.util.List;

import com.usky.sms.core.BaseDao;

public class RewardsActivityTypeEntityDao extends BaseDao<RewardsActivityTypeEntityDO> {

	protected RewardsActivityTypeEntityDao() {
		super(RewardsActivityTypeEntityDO.class);
	}
	
	public boolean hasRewardsActivityTypeEntity(int activityTypeId) {
		@SuppressWarnings("unchecked")
		List<RewardsActivityTypeEntityDO> list = this.getHibernateTemplate().find("from RewardsActivityTypeEntityDO where activityType.id = ?", activityTypeId);
		return !list.isEmpty();
	}
}
