package com.usky.sms.shortmessage;

import org.hibernate.cfg.Comment;

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

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "T_SHORT_MESSAGE")
@Comment("短信")
public class ShortMessageDO extends AbstractBaseDO implements IDisplayable {

	private static final long serialVersionUID = -4015986190575709703L;

	/** 创建人 */
	private UserDO creator;

	/** 接收人 */
	private UserDO receiver;
	
	/** 接收短信的手机号码 */
	private String receiveTel;

	/** 定时发送时间 */
	private Date sendTime;

	/** 短信内容 */
	private String msgContent;

	/** 来源Id */
	private Integer source;
	
	/** 来源类型 */
	private String sourceType;
	
	/**
	 * 发送状态
	 * -2	参数异常
	 * -1	系统异常
	 * 0,  表示  提交至短信平台失败，请与平台管理员联系。 
	 * (N>0 表示提交至短信平台成功)。
	 */
	private Integer sendStatus;
	
	/** 重发次数（0表示初发，1表示重发一次，2表示重发二次...） */
	private Integer resendTimes;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "CREATOR_ID")
	@Comment("创建人")
	public UserDO getCreator() {
		return creator;
	}

	public void setCreator(UserDO creator) {
		this.creator = creator;
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

	@Column(name = "RECEIVE_TEL")
	@Comment("接收短信的手机号码")
	public String getReceiveTel() {
		return receiveTel;
	}

	public void setReceiveTel(String receiveTel) {
		this.receiveTel = receiveTel;
	}

	@Basic
	@Column(name = "SEND_TIME", columnDefinition = "DATE")
	@Temporal(TemporalType.TIMESTAMP)
	@Comment("定时发送时间")
	public Date getSendTime() {
		return sendTime;
	}

	public void setSendTime(Date sendTime) {
		this.sendTime = sendTime;
	}

	@Column(name = "MSG_CONTENT", length = 4000)
	@Comment("短信内容")
	public String getMsgContent() {
		return msgContent;
	}

	public void setMsgContent(String msgContent) {
		this.msgContent = msgContent;
	}

	/**
	 * @return the source
	 */
	@Column(name = "SOURCE_ID", length = 4000)
	@Comment("来源Id")
	public Integer getSource() {
		return source;
	}

	/**
	 * @param source the source to set
	 */
	public void setSource(Integer source) {
		this.source = source;
	}

	/**
	 * @return the sourceType
	 */
	@Column(name = "SOURCE_TYPE", length = 50)
	@Comment("来源类型")
	public String getSourceType() {
		return sourceType;
	}

	/**
	 * @param sourceType the sourceType to set
	 */
	public void setSourceType(String sourceType) {
		this.sourceType = sourceType;
	}

	/**
	 * @return the sendStatus
	 */
	@Column(name="SEND_STATUS")
	@Comment("(N>0 表示提交至短信平台成功)。")
	public Integer getSendStatus() {
		return sendStatus;
	}

	/**
	 * @param sendStatus the sendStatus to set
	 */
	public void setSendStatus(Integer sendStatus) {
		this.sendStatus = sendStatus;
	}

	@Column(name="RESEND_TIMES")
	@Comment("重发次数（0表示初发，1表示重发一次，2表示重发二次...）")
	public Integer getResendTimes() {
		return resendTimes;
	}

	public void setResendTimes(Integer resendTimes) {
		this.resendTimes = resendTimes;
	}

	@Override
	@Transient
	public String getDisplayName() {
		return null;
	}
	
	/** 无参构造方法 */
	public ShortMessageDO() {
		
	}

	/**
	 * 带参构造方法
	 * @param receiveTel 接收电话号码
	 * @param msgContent 短信内容
	 */
	public ShortMessageDO(String receiveTel, String msgContent) {
		this.receiveTel = receiveTel;
		this.msgContent = msgContent;
	}
	
	/**
	 * 带参构造方法
	 * @param creator 创建人
	 * @param receiver 接收人
	 * @param receiveTel 接收电话号码
	 * @param msgContent 短信内容
	 * @param source 短信来源id
	 * @param sourceType 短信来源的类型
	 */
	public ShortMessageDO(UserDO creator, UserDO receiver, String receiveTel, String msgContent,
			Integer source, String sourceType) {
		this.creator = creator;
		this.receiver = receiver;
		this.receiveTel = receiveTel;
		this.msgContent = msgContent;
		this.source = source;
		this.sourceType = sourceType;
	}
	
	/**
	 * 带参构造方法
	 * @param creator 创建人
	 * @param receiver 接收人
	 * @param receiveTel 接收电话号码
	 * @param sendTime 发送时间
	 * @param msgContent 短信内容
	 * @param source 短信来源id
	 * @param sourceType 短信来源的类型
	 * @param sendStatus 发送状态
	 * @param resendTimes 重发次数
	 */
	public ShortMessageDO(UserDO creator, UserDO receiver, String receiveTel, Date sendTime, String msgContent,
			Integer source, String sourceType, Integer sendStatus, Integer resendTimes) {
		this.creator = creator;
		this.receiver = receiver;
		this.receiveTel = receiveTel;
		this.sendTime = sendTime;
		this.msgContent = msgContent;
		this.source = source;
		this.sourceType = sourceType;
		this.sendStatus = sendStatus;
		this.resendTimes = resendTimes;
	}

}
