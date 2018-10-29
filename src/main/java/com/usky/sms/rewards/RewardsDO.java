package com.usky.sms.rewards;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import org.hibernate.cfg.Comment;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "T_REWARDS")
@Comment("奖惩记录")
public class RewardsDO extends AbstractBaseDO {

	private static final long serialVersionUID = 2479509177538584949L;
	
	/** 奖惩对象 */
	private UserDO rewardTarget;
	
	/** 奖惩类型：奖R；惩P **/
	private String rewardType;
	
	/** 原因 **/
	private String rewardReason;
	
	/** 内容 **/
	private String rewardContent;
	
	/** 奖惩金额 */
	private Double rewardAmount;
	
	/** 备注 **/
	private String remark;
	
	/** 对应的安监机构 */
	private UnitDO rewardUnit;
	
	/** 事件等级 */
	private DictionaryDO eventLevel;
	
	/** 事发日期 */
	private Date occurDate;
	
	@ManyToOne
	@JoinColumn(name = "REWARD_TARGET")
	@Comment("奖惩对象")
	public UserDO getRewardTarget() {
		return rewardTarget;
	}
	
	public void setRewardTarget(UserDO rewardTarget) {
		this.rewardTarget = rewardTarget;
	}

	@Column(name = "REWARD_TYPE", length = 1)
	@Comment("奖惩类型：奖R；惩P")
	public String getRewardType() {
		return rewardType;
	}

	public void setRewardType(String rewardType) {
		this.rewardType = rewardType;
	}

	@Column(name = "REWARD_REASON", length = 4000)
	@Comment("原因")
	public String getRewardReason() {
		return rewardReason;
	}

	public void setRewardReason(String rewardReason) {
		this.rewardReason = rewardReason;
	}

	@Column(name = "REWARD_CONTENT", length = 4000)
	@Comment("内容")
	public String getRewardContent() {
		return rewardContent;
	}

	public void setRewardContent(String rewardContent) {
		this.rewardContent = rewardContent;
	}

	@Column(name = "REWARD_AMOUNT", columnDefinition = "NUMBER(10, 2)")
	@Comment("奖惩金额")
	public Double getRewardAmount() {
		return rewardAmount;
	}

	public void setRewardAmount(Double rewardAmount) {
		this.rewardAmount = rewardAmount;
	}

	@Column(name = "REMARK", length = 4000)
	@Comment("备注")
	public String getRemark() {
		return remark;
	}

	public void setRemark(String remark) {
		this.remark = remark;
	}

	@ManyToOne
	@JoinColumn(name = "REWARD_UNIT")
	@Comment("对应的安监机构")
	public UnitDO getRewardUnit() {
		return rewardUnit;
	}

	public void setRewardUnit(UnitDO rewardUnit) {
		this.rewardUnit = rewardUnit;
	}

	@ManyToOne
	@JoinColumn(name = "EVENT_LEVEL")
	@Comment("事件等级")
	public DictionaryDO getEventLevel() {
		return eventLevel;
	}

	public void setEventLevel(DictionaryDO eventLevel) {
		this.eventLevel = eventLevel;
	}

	@Column(name = "OCCUR_DATE", columnDefinition = "DATE")
	@Temporal(TemporalType.DATE)
	@Comment("事发日期")
	public Date getOccurDate() {
		return occurDate;
	}

	public void setOccurDate(Date occurDate) {
		this.occurDate = occurDate;
	}

}
