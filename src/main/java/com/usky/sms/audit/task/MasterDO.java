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
 * 项目主管
 * @author zheng.xl
 *
 */
@Entity
@Table(name="A_MASTER")
@Comment("项目主管")
public class MasterDO extends AbstractBaseDO implements IDisplayable{

	private static final long serialVersionUID = -2261087236052308570L;
	
	/** 审计工作单 */
	private TaskDO task;
	
	/** 项目主管 */
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
	@JoinColumn(name="MASTER_ID")
	@Comment("项目主管")
	public UserDO getUser() {
		return user;
	}

	public void setUser(UserDO user) {
		this.user = user;
	}

	@Transient
	@Override
	public String getDisplayName() {
		if (user != null) {
			return user.getDisplayName();
		}
		return null;
	}

}
