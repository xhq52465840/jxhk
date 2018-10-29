package com.usky.sms.rewards;

import org.hibernate.cfg.Comment;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.activity.type.ActivityTypeDO;
import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_REWARDS_ACTIVITY_TYPE_ENTITY")
@Comment("组件和安全信息类别关联")
public class RewardsActivityTypeEntityDO extends AbstractBaseDO {

	private static final long serialVersionUID = 2758117791844065484L;

	/** 信息类型 */
	private ActivityTypeDO activityType;

	@ManyToOne
	@JoinColumn(name = "activity_type")
	@Comment("信息类型")
	public ActivityTypeDO getActivityType() {
		return activityType;
	}

	public void setActivityType(ActivityTypeDO activityType) {
		this.activityType = activityType;
	}
}
