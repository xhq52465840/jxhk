package com.usky.sms.audit.check;

import org.hibernate.cfg.Comment;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "A_CHECK_FLOW_USER")
@Comment("检查单流程处理人")
public class CheckFlowUserDO extends AbstractBaseDO {

	private static final long serialVersionUID = 6220319795594598204L;

	/** 检查单 */
	private CheckDO check;

	/** 流程处理人 */
	private UserDO flowUser;

	@ManyToOne
	@JoinColumn(name = "CHECK_ID")
	@Comment("检查单")
	public CheckDO getCheck() {
		return check;
	}

	public void setCheck(CheckDO check) {
		this.check = check;
	}

	@ManyToOne
	@JoinColumn(name = "FLOW_USER_ID")
	@Comment("流程处理人")
	public UserDO getFlowUser() {
		return flowUser;
	}

	public void setFlowUser(UserDO flowUser) {
		this.flowUser = flowUser;
	}

}
