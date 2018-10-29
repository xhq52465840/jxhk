
package com.usky.sms.risk.systemanalysis;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.hibernate.cfg.Comment;

import com.usky.sms.activity.type.ActivityTypeDO;
import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_SYS_ANLS_ATYPE_ENTITY")
@Comment("系统工作分析组件和安全信息类别关联")
public class SystemAnalysisActivityTypeEntityDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 2076519854404938562L;
	
	/** 信息类别 */
	private ActivityTypeDO activityType;
	
	@ManyToOne
	@JoinColumn(name = "activity_type")
	@Comment("信息类别")
	public ActivityTypeDO getActivityType() {
		return activityType;
	}
	
	public void setActivityType(ActivityTypeDO activityType) {
		this.activityType = activityType;
	}
	
}
