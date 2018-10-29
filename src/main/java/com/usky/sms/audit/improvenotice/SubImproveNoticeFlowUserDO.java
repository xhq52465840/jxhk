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
@Table(name = "A_SUB_IMPROVE_NOTICE_FLOW_USER")
@Comment("整改通知单子单流程处理人")
public class SubImproveNoticeFlowUserDO extends AbstractBaseDO implements IDisplayable {

	private static final long serialVersionUID = 6208249330346693746L;

	/** 整改通知单子单 */
	private SubImproveNoticeDO subImproveNotice;

	/** 处理人 */
	private UserDO user;

	@ManyToOne
	@JoinColumn(name="SUB_IMPROVE_NOTICE_ID")
	@Comment("整改通知单子单")
	public SubImproveNoticeDO getSubImproveNotice() {
		return subImproveNotice;
	}

	public void setSubImproveNotice(SubImproveNoticeDO subImproveNotice) {
		this.subImproveNotice = subImproveNotice;
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
