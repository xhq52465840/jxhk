package com.usky.sms.message;

import java.util.Date;

import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.Transient;

import org.hibernate.cfg.Comment;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "T_MESSAGE")
@Comment("站内通知")
public class MessageDO extends AbstractBaseDO implements IDisplayable {

	private static final long serialVersionUID = -4015986190575709703L;

	/** 发送人 */
	private UserDO sender;
	
	/** 接收人 */
	private UserDO receiver;
	
	/** 发送时间 */
	private Date sendTime;

	/** 通知内容 */
	private String content;

	/** 标题 */
	private String title;

	/** 链接(通知源的id) */
	private String link;

	/** 接收人是否已查看 */
	private boolean checked = false;

	/** 接收人查看时间 */
	private Date checkTime;
	
	/** 发送人是否已查看 */
	private boolean senderChecked = false;
	
	/** 发送人查看时间 */
	private Date senderCheckTime;
	
	/** 通知信息源的类型 (ACTIVITY, TASK等) */
	private String sourceType;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "SENDER_ID")
	@Comment("发送人")
	public UserDO getSender() {
		return sender;
	}

	public void setSender(UserDO sender) {
		this.sender = sender;
	}

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "RECEIVER_ID")
	@Comment("接收人")
	public UserDO getReceiver() {
		return receiver;
	}

	public void setReceiver(UserDO receiver) {
		this.receiver = receiver;
	}

	@Basic
	@Column(columnDefinition = "DATE")
	@Temporal(TemporalType.TIMESTAMP)
	@Comment("发送时间")
	public Date getSendTime() {
		return sendTime;
	}

	public void setSendTime(Date sendTime) {
		this.sendTime = sendTime;
	}

	@Column(name = "`CONTENT`", length = 4000)
	@Comment("通知内容")
	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	@Column(name = "`TITLE`")
	@Comment("标题")
	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	@Column(name = "`LINK`")
	@Comment("链接(通知源的id)")
	public String getLink() {
		return link;
	}

	public void setLink(String link) {
		this.link = link;
	}

	@Column(length = 1, columnDefinition = "NUMBER(1) DEFAULT 0")
	public boolean isChecked() {
		return checked;
	}

	public void setChecked(boolean checked) {
		this.checked = checked;
	}

	@Basic
	@Column(columnDefinition = "DATE")
	@Temporal(TemporalType.TIMESTAMP)
	@Comment("接收人查看时间")
	public Date getCheckTime() {
		return checkTime;
	}

	public void setCheckTime(Date checkTime) {
		this.checkTime = checkTime;
	}

	@Column(length = 1, name = "SENDER_CHECKED", columnDefinition = "NUMBER(1) DEFAULT 0")
	public boolean isSenderChecked() {
		return senderChecked;
	}

	public void setSenderChecked(boolean senderChecked) {
		this.senderChecked = senderChecked;
	}

	@Basic
	@Column(columnDefinition = "TIMESTAMP", name = "SENDER_CHECK_TIME")
	@Temporal(TemporalType.TIMESTAMP)
	@Comment("发送人查看时间")
	public Date getSenderCheckTime() {
		return senderCheckTime;
	}

	public void setSenderCheckTime(Date senderCheckTime) {
		this.senderCheckTime = senderCheckTime;
	}

	/**
	 * @return the sourceType
	 */
	@Comment("通知信息源的类型 (ACTIVITY, TASK等)")
	public String getSourceType() {
		return sourceType;
	}

	/**
	 * @param sourceType the sourceType to set
	 */
	public void setSourceType(String sourceType) {
		this.sourceType = sourceType;
	}

	@Override
	@Transient
	public String getDisplayName() {
		return this.getTitle();
	}
	
	/** 无参构造方法 */
	public MessageDO() {
		
	}
	
	/**
	 * 带参构造方法 
	 * @param sender 发送者
	 * @param receiver 接收者
	 * @param title 标题
	 * @param content 正文内容
	 */
	public MessageDO (UserDO sender, UserDO receiver, String title, String content) {
		this.sender = sender;
		this.receiver = receiver;
		this.title = title;
		this.content = content;
		this.sendTime = new Date();
	}
	
	/**
	 * 带参构造方法 
	 * @param sender 发送者
	 * @param receiver 接收者
	 * @param title 标题
	 * @param content 正文内容
	 * @param link 站内通知的来源id（链接）
	 * @param sourceType 站内通知的来源类型
	 */
	public MessageDO(UserDO sender, UserDO receiver, String title, String content, String link, String sourceType) {
		this.sender = sender;
		this.receiver = receiver;
		this.title = title;
		this.content = content;
		this.link = link;
		this.sourceType = sourceType;
		this.sendTime = new Date();
	}

}
