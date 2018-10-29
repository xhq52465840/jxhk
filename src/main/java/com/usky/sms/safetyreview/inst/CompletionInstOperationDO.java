package com.usky.sms.safetyreview.inst;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "T_COMPLETION_INST_OPERATION")
@Comment("评审单的完成情况的操作记录")
public class CompletionInstOperationDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 2928187402637739201L;
	
	/** 用户 */
	private UserDO user;
	
	/** 完成情况实例 */
	private CompletionInstDO completionInst;
	
	/** 操作记录 */
	private String data;
	
	/** 操作 */
	private String operation;

	@ManyToOne
	@JoinColumn(name = "USER_ID")
	@Comment("用户")
	public UserDO getUser() {
		return user;
	}

	public void setUser(UserDO user) {
		this.user = user;
	}

	@ManyToOne
	@JoinColumn(name = "COMPLETION_INST_ID")
	@Comment("完成情况实例")
	public CompletionInstDO getCompletionInst() {
		return completionInst;
	}

	public void setCompletionInst(CompletionInstDO completionInst) {
		this.completionInst = completionInst;
	}

	@Column(name = "DATA", length = 4000)
	@Comment("操作记录")
	public String getData() {
		return data;
	}

	public void setData(String data) {
		this.data = data;
	}

	@Column(name = "OPERATION", length = 256)
	@Comment("操作")
	public String getOperation() {
		return operation;
	}

	public void setOperation(String operation) {
		this.operation = operation;
	}
}
