
package com.usky.sms.eventanalysis;
import org.hibernate.cfg.Comment;

import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.activity.type.ActivityTypeDO;
import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_EVENT_ANLS_ACT_TYPE_ENTITY")
@Comment("事件分析组件与安全信息类型的关联配置")
public class EventAnalysisActivityTypeEntityDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 7386506260867070960L;
	
	/** 安全信息类型 */
	private ActivityTypeDO activityType;
	
	@ManyToOne
	@JoinColumn(name = "activity_type")
	@Comment("安全信息类型")
	public ActivityTypeDO getActivityType() {
		return activityType;
	}
	
	public void setActivityType(ActivityTypeDO activityType) {
		this.activityType = activityType;
	}
	
}
