
package com.usky.sms.risk.airline;
import org.hibernate.cfg.Comment;

import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.activity.type.ActivityTypeDO;
import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_ALINFO_ATYPE_ENTITY")
@Comment("航线信息组件和安全信息类别关联")
public class AirlineInfoActivityTypeEntityDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 3400504923951308139L;
	
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
