package com.usky.sms.audit.plan;

import org.hibernate.cfg.Comment;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;
import com.usky.sms.user.UserDO;

/**
 * 工作计划流程处理人
 * @author zheng.xl
 *
 */
@Entity
@Table(name="A_PLAN_FLOW_USER")
@Comment("工作计划流程处理人")
public class PlanFlowUserDO extends AbstractBaseDO implements IDisplayable{

	private static final long serialVersionUID = -2261087236052308570L;
	
	/** 工作计划 */
	private PlanDO plan;
	
	/** 流程处理人*/
	private UserDO user;

	@ManyToOne
	@JoinColumn(name="PLAN_ID")
	@Comment("工作计划")
	public PlanDO getPlan() {
		return plan;
	}

	public void setPlan(PlanDO plan) {
		this.plan = plan;
	}

	@ManyToOne
	@JoinColumn(name="FLOW_USER_ID")
	@Comment("流程处理人")
	public UserDO getUser() {
		return user;
	}

	public void setUser(UserDO user) {
		this.user = user;
	}

	@Transient
	@Override
	public String getDisplayName() {
		return user.getDisplayName();
	}

}
