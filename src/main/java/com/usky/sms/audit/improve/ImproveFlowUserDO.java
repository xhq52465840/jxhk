package com.usky.sms.audit.improve;

import org.hibernate.cfg.Comment;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "A_IMPROVE_FLOW_USER")
@Comment("整改单处理人")
public class ImproveFlowUserDO extends AbstractBaseDO implements IDisplayable {

	private static final long serialVersionUID = 6208249330346693746L;

	/** 整改单 */
	private ImproveDO improve;

	/** 整改单处理人 */
	private UserDO flowUser;

	@ManyToOne
	@JoinColumn(name = "IMPROVE_ID")
	@Comment("整改单")
	public ImproveDO getImprove() {
		return improve;
	}

	public void setImprove(ImproveDO improve) {
		this.improve = improve;
	}

	@ManyToOne
	@JoinColumn(name = "flow_user_id")
	@Comment("整改单处理人")
	public UserDO getFlowUser() {
		return flowUser;
	}

	public void setFlowUser(UserDO flowUser) {
		this.flowUser = flowUser;
	}

	@Transient
	@Override
	public String getDisplayName() {
		return flowUser.getFullname();
	}

}
