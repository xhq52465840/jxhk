package com.usky.sms.losa;

import org.hibernate.cfg.Comment;
import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.Lob;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "l_losa_operation_log")
@Comment("LOSA 操作日志")
public class LosaOperateLogDO extends AbstractBaseDO {

	private static final long serialVersionUID = 1L;

	/** 更新人  */
	private Integer last_modifier;
	
	/** 对象id */
	private Integer targetId;
	
	/** 详细 */
	private String detail;
	
	/** 类型 */
	private String type;
	
	/** 操作类型 */
	private String oper_type;

	/** 创建人 */
	private transient UserDO creator;

	@ManyToOne
	@JoinColumn(name = "CREATOR")
	@Comment("创建人")
	public UserDO getCreator() {
		return creator;
	}

	public void setCreator(UserDO creator) {
		this.creator = creator;
	}
	
	@Column(length = 10)
	@Comment("更新人")
	public Integer getLast_modifier() {
		return last_modifier;
	}

	public void setLast_modifier(Integer last_modifier) {
		this.last_modifier = last_modifier;
	}
	
	@Lob
	@Basic(fetch = FetchType.EAGER)
	@Column(name = "detail", columnDefinition = "CLOB", nullable = true)
	@Comment("详细")
	public String getDetail() {
		return detail;
	}
	public void setDetail(String detail) {
		this.detail = detail;
	}
	@Column(length = 10)
	@Comment("对象id")
	public Integer getTargetId() {
		return targetId;
	}

	public void setTargetId(Integer targetId) {
		this.targetId = targetId;
	}

	@Comment("类型")
	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	@Comment("操作类型")
	public String getOper_type() {
		return oper_type;
	}

	public void setOper_type(String oper_type) {
		this.oper_type = oper_type;
	}
}
