package com.usky.sms.log;

import org.hibernate.cfg.Comment;

import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "T_ACTIVITY_LOGGING")
@Comment("安全信息活动日志")
public class ActivityLoggingDO extends AbstractBaseDO {

	private static final long serialVersionUID = -7994119298700113705L;

	/** 操作人 */
	private UserDO user;

	/** 安全信息 */
	private ActivityDO activity;

	/** 操作(CREATE_ACTIVITY,UPDATE_TEM等) */
	private String operation;

	/** 活动详细内容 */
	private String data;

	@ManyToOne
	@JoinColumn(name = "USER_ID")
	@Comment("操作人")
	public UserDO getUser() {
		return user;
	}

	public void setUser(UserDO user) {
		this.user = user;
	}

	@ManyToOne
	@JoinColumn(name = "ACTIVITY_ID")
	@Comment("安全信息")
	public ActivityDO getActivity() {
		return activity;
	}

	public void setActivity(ActivityDO activity) {
		this.activity = activity;
	}

	@Column(length = 50)
	@Comment("操作(CREATE_ACTIVITY,UPDATE_TEM等)")
	public String getOperation() {
		return operation;
	}

	public void setOperation(String operation) {
		this.operation = operation;
	}

	@Lob
	@Basic(fetch = FetchType.EAGER)
	@Column(name = "DATA", columnDefinition = "CLOB", nullable = true)
	@Comment("活动详细内容")
	public String getData() {
		return data;
	}

	public void setData(String data) {
		this.data = data;
	}

}
