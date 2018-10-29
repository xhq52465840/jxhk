package com.usky.sms.rewards;

import org.hibernate.cfg.Comment;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.core.AbstractBaseDO;

//@Entity
//@Table(name = "T_REWARDS_ACTIVITY")
public class RewardsActivityMappingDO extends AbstractBaseDO {

	private static final long serialVersionUID = 3322370258996247135L;

	private RewardsDO rewards;

	private ActivityDO activity;

	@ManyToOne
	@JoinColumn(name = "REWARDS_ID")
	@Comment("")
	public RewardsDO getRewards() {
		return rewards;
	}

	public void setRewards(RewardsDO rewards) {
		this.rewards = rewards;
	}

	@ManyToOne
	@JoinColumn(name = "ACTIVITY_ID")
	@Comment("")
	public ActivityDO getActivity() {
		return activity;
	}

	public void setActivity(ActivityDO activity) {
		this.activity = activity;
	}

}
