package com.usky.sms.accessinformation;

import org.hibernate.cfg.Comment;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.activity.type.ActivityTypeDO;
import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name="T_AINFO_ATYPE_ENTITY")
@Comment("信息获取组件和安全信息类别关联关系")
public class AccessInformationActivityTypeEntityDO extends AbstractBaseDO {

    private static final long serialVersionUID = 440282594323949343L;
	
    /** 安全信息类型 **/
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
