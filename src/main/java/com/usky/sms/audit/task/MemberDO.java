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
 * 审计组员
 * @author zheng.xl
 *
 */
@Entity
@Table(name="A_MEMBER")
public class MemberDO extends AbstractBaseDO implements IDisplayable{

	private static final long serialVersionUID = -2261087236052308570L;
	
	/** 审计工作单 */
	private TaskDO task;
	
	/** 项目主管 */
	private UserDO member;

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
	@JoinColumn(name="MEMBER_ID")
	@Comment("项目主管")
	public UserDO getMember() {
		return member;
	}

	public void setMember(UserDO member) {
		this.member = member;
	}

	@Transient
	@Override
	public String getDisplayName() {
		return member.getDisplayName();
	}

}
