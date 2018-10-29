package com.usky.sms.audit.improvenotice;

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
@Table(name = "A_IMPROVE_NOTICE_FLOW_USER")
@Comment("整改通知单流程处理人")
public class ImproveNoticeFlowUserDO extends AbstractBaseDO implements IDisplayable {
	
	private static final long serialVersionUID = 2088291182751450489L;

	/** 整改通知单 */
	private ImproveNoticeDO improveNotice;

	/** 处理人 */
	private UserDO user;

	@ManyToOne
	@JoinColumn(name="IMPROVE_NOTICE_ID")
	@Comment("整改通知单")
	public ImproveNoticeDO getImproveNotice() {
		return improveNotice;
	}

	public void setImproveNotice(ImproveNoticeDO improveNotice) {
		this.improveNotice = improveNotice;
	}

	@ManyToOne
	@JoinColumn(name = "FLOW_USER_ID")
	@Comment("处理人")
	public UserDO getUser() {
		return user;
	}

	public void setUser(UserDO user) {
		this.user = user;
	}

	@Transient
	@Override
	public String getDisplayName() {
		return user.getFullname();
	}

}
