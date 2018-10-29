package com.usky.sms.email;

import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;

@Entity
@Table(name = "T_EMAIL")
@Comment("电子邮件")
public class EmailDO extends AbstractBaseDO implements IDisplayable {

	private static final long serialVersionUID = 1L;
	
	/** 来自…… **/
	private String from;
	
	/** 发往…… **/
	private String to;
	
	/** 主题…… **/
	private String subject;
	
	/** 内容…… **/
	private String content;
	
	/** 0:等待发送,1：发送成功,2：发送失败 */
	private Integer sendStatus = EnumSendStatus.WAITING.getCode();

	@Column(name="`FROM`",length = 200)
	@Comment("来自……")
	public String getFrom() {
		return from;
	}

	public void setFrom(String from) {
		this.from = from;
	}

	@Column(name="`TO`",length = 200)
	@Comment("发往……")
	public String getTo() {
		return to;
	}

	public void setTo(String to) {
		this.to = to;
	}

	@Column(length = 255)
	@Comment("主题……")
	public String getSubject() {
		return subject;
	}

	public void setSubject(String subject) {
		this.subject = subject;
	}

	@Column(name="`CONTENT`",length = 2000)
	@Comment("内容……")
	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	/**
	 * @return the sendStatus
	 */
	@Column(name="SEND_STATUS")
	@Comment("0:等待发送,1：发送成功,2：发送失败")
	public Integer getSendStatus() {
		return sendStatus;
	}

	/**
	 * @param sendStatus the sendStatus to set
	 */
	public void setSendStatus(Integer sendStatus) {
		this.sendStatus = sendStatus;
	}

	@Transient
	@Override
	public String getDisplayName() {
		return null;
	}

	/** 无参构造方法 */
	public EmailDO() {
		
	}
	
	/**
	 * 带参构造方法
	 * @param from 发件人邮箱地址
	 * @param to 收件人邮箱地址
	 * @param subject 主题
	 * @param content 邮件正文内容
	 */
	public EmailDO(String from, String to, String subject, String content) {
		this.from = from;
		this.to = to;
		this.subject = subject;
		this.content = content;
	}
	
	/**
	 * 带参构造方法
	 * @param from 发件人邮箱地址
	 * @param to 收件人邮箱地址
	 * @param subject 主题
	 * @param content 邮件正文内容
	 * @param sendStatus 发送状态
	 */
	public EmailDO(String from, String to, String subject, String content, Integer sendStatus) {
		this.from = from;
		this.to = to;
		this.subject = subject;
		this.content = content;
		this.sendStatus = sendStatus;
	}

}
