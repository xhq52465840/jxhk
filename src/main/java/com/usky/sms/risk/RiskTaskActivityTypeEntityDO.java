
package com.usky.sms.risk;
import org.hibernate.cfg.Comment;

import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.activity.type.ActivityTypeDO;
import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_RTASK_ATYPE_ENTITY")
@Comment("任务分配组件和安全信息类别关联")
public class RiskTaskActivityTypeEntityDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 2076519854404938562L;
	
	/** 信息类别 */
	private ActivityTypeDO activityType;
	
	/** 配置 */
	private RiskTaskSettingDO setting;
	
	@ManyToOne
	@JoinColumn(name = "activity_type")
	@Comment("信息类别")
	public ActivityTypeDO getActivityType() {
		return activityType;
	}
	
	public void setActivityType(ActivityTypeDO activityType) {
		this.activityType = activityType;
	}
	
	@ManyToOne
	@JoinColumn(name = "SETTING_ID")
	@Comment("配置")
	public RiskTaskSettingDO getSetting() {
		return setting;
	}
	
	public void setSetting(RiskTaskSettingDO setting) {
		this.setting = setting;
	}
	
}
