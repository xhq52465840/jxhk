package com.usky.sms.eiosa;

import org.hibernate.cfg.Comment;
import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "e_iosa_operation_log")
@Comment("EIOSA表")
public class OperateLogDO extends AbstractBaseDO {

	/**
	 * 
	 */
	private static final long serialVersionUID = 8567888154367261813L;

	private Integer last_modifier;
	private Integer targetId;
	private String descoperate;
	private String detail;
	private String type;
	private String oper_type;

	private transient UserDO creator;
	private transient UserDO receiver;

	@ManyToOne
	@JoinColumn(name = "CREATOR")
	@Comment("")
	public UserDO getCreator() {
		return creator;
	}

	public void setCreator(UserDO creator) {
		this.creator = creator;
	}

	@ManyToOne
	@JoinColumn(name = "RECEIVER")
	@Comment("")
	public UserDO getReceiver() {
		return receiver;
	}

	public void setReceiver(UserDO receiver) {
		this.receiver = receiver;
	}

	@Column(length = 1000)
	@Comment("")
	public String getDescoperate() {
		return descoperate;
	}

	public void setDescoperate(String descoperate) {
		this.descoperate = descoperate;
	}

	@Column(length = 10)
	@Comment("")
	public Integer getLast_modifier() {
		return last_modifier;
	}

	public void setLast_modifier(Integer last_modifier) {
		this.last_modifier = last_modifier;
	}

	
	
	
	@Lob
	@Basic(fetch = FetchType.EAGER)
	@Column(name = "detail", columnDefinition = "CLOB", nullable = true)
	@Comment("")
	public String getDetail() {
		return detail;
	}
	public void setDetail(String detail) {
		this.detail = detail;
	}
	@Column(length = 10)
	@Comment("")
	public Integer getTargetId() {
		return targetId;
	}

	public void setTargetId(Integer targetId) {
		this.targetId = targetId;
	}

	@Comment("")
	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	@Comment("")
	public String getOper_type() {
		return oper_type;
	}

	public void setOper_type(String oper_type) {
		this.oper_type = oper_type;
	}
}
