package com.usky.sms.subscribe;

import org.hibernate.cfg.Comment;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;
import com.usky.sms.filtermanager.FiltermanagerDO;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserGroupDO;

@Entity
@Table(name = "T_SUBSCRIBE")
@Comment("过滤器订阅规则")
public class SubscribeDO extends AbstractBaseDO implements IDisplayable {
	
	private static final long serialVersionUID = -4115338106219921631L;

	/** 类型 */
	private String type;

	/** 接收用户 */
	private UserDO receive;
	
	/** 用户组 */
	private UserGroupDO receivegroup;
	
	/** 当没有数据时是否发送邮件 Y / N */
	private String isEmail;

	/** 定时任务的表达式 */
	private String cronexpression;
	
	/** 过滤器 */
	private FiltermanagerDO filtermanager;
	
	/** 最后发送时间 */
	private Date lastSend;
	
	/** 创建人 */
	private UserDO creator;
	
	/** 更新人 */
	private UserDO lastUpdater;

	@Column(length = 50)
	@Comment("类型")
	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "receive")
	@Comment("接收用户")
	public UserDO getReceive() {
		return receive;
	}

	public void setReceive(UserDO receive) {
		this.receive = receive;
	}

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "receivegroup")
	@Comment("用户组")
	public UserGroupDO getReceivegroup() {
		return receivegroup;
	}
	
	public void setReceivegroup(UserGroupDO receivegroup) {
		this.receivegroup = receivegroup;
	}
	
	@Column(length = 10)
	@Comment("当没有数据时是否发送邮件 Y / N")
	public String getIsEmail() {
		return isEmail;
	}

	public void setIsEmail(String isEmail) {
		this.isEmail = isEmail;
	}

	@Column(length = 255)
	@Comment("定时任务的表达式")
	public String getCronexpression() {
		return cronexpression;
	}

	public void setCronexpression(String cronexpression) {
		this.cronexpression = cronexpression;
	}

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "filtermanager")
	@Comment("过滤器")
	public FiltermanagerDO getFiltermanager() {
		return filtermanager;
	}

	public void setFiltermanager(FiltermanagerDO filtermanager) {
		this.filtermanager = filtermanager;
	}
	
	@Column(name = "last_send")
	@Comment("最后发送时间")
	public Date getLastSend() {
		return lastSend;
	}

	public void setLastSend(Date lastSend) {
		this.lastSend = lastSend;
	}

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "creator")
	@Comment("创建人")
	public UserDO getCreator() {
		return creator;
	}

	public void setCreator(UserDO creator) {
		this.creator = creator;
	}
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "lastUpdater")	
	@Comment("更新人")
	public UserDO getLastUpdater() {
		return lastUpdater;
	}

	public void setLastUpdater(UserDO lastUpdater) {
		this.lastUpdater = lastUpdater;
	}

	@Override
	@Transient
	public String getDisplayName() {
		return this.getType();
	}
}
