package com.usky.sms.job;

import org.hibernate.cfg.Comment;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;

@Entity
@Table(name = "T_FIRED_SUCCESS_TRIGGER")
@Comment("执行成功的job记录")
public class FiredSuccessTriggerDO extends AbstractBaseDO implements IDisplayable {

	private static final long serialVersionUID = -3578387885551223137L;

	/** 触发器名称  */
	private String triggerName;

	/** 触发器组  */
	private String triggerGroup;

	/** job名称  */
	private String jobName;

	/** job组  */
	private String jobGroup;
	
	/** 触发时间 */
	private Date firedTime;

	@Column(name = "TRIGGER_NAME", length=200)
	@Comment("触发器名称")
	public String getTriggerName() {
		return triggerName;
	}

	public void setTriggerName(String triggerName) {
		this.triggerName = triggerName;
	}

	@Column(name = "TRIGGER_GROUP", length=200)
	@Comment("触发器组")
	public String getTriggerGroup() {
		return triggerGroup;
	}

	public void setTriggerGroup(String triggerGroup) {
		this.triggerGroup = triggerGroup;
	}

	@Column(name = "JOB_NAME", length=200)
	@Comment("job名称")
	public String getJobName() {
		return jobName;
	}

	public void setJobName(String jobName) {
		this.jobName = jobName;
	}

	@Column(name = "JOB_GROUP", length=200)
	@Comment("job组")
	public String getJobGroup() {
		return jobGroup;
	}

	public void setJobGroup(String jobGroup) {
		this.jobGroup = jobGroup;
	}

	@Column(name = "FIRED_TIME", columnDefinition = "DATE")
	@Comment("触发时间")
	public Date getFiredTime() {
		return firedTime;
	}

	public void setFiredTime(Date firedTime) {
		this.firedTime = firedTime;
	}

	@Override
	@Transient
	public String getDisplayName() {
		return this.getTriggerName();
	}

}
