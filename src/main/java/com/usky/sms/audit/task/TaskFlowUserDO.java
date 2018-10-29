package com.usky.sms.audit.task;

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
 * 流程处理人
 * @author zheng.xl
 *
 */
@Entity
@Table(name="A_TASK_FLOW_USER")
@Comment("流程处理人")
public class TaskFlowUserDO extends AbstractBaseDO implements IDisplayable{

	private static final long serialVersionUID = -2261087236052308570L;
	
	/** 审计工作单 */
	private TaskDO task;
	
	/** 流程处理人*/
	private UserDO user;

	@ManyToOne
	@JoinColumn(name="TASK_ID")
	@Comment("审计工作单")
	public TaskDO getTask() {
		return task;
	}

	public void setTask(TaskDO task) {
		this.task = task;
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
