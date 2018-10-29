
package com.usky.sms.audit.log;
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
@Table(name = "A_AUDIT_ACTIVITY_LOGGING")
@Comment("审计活动日志")
public class AuditActivityLoggingDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -7994119298700113705L;
	
	/** 用户 */
	private UserDO user;
	
	/** 活动日志源的ID */
	private Integer source;
	
	/** 活动日志的源的类型 */
	private String sourceType;
	
	/** 操作类型：新增，删除，修改 */
	private String operation;
	
	/** 活动日志内容 */
	private String data;
	
	@ManyToOne
	@JoinColumn(name = "USER_ID")
	@Comment("用户")
	public UserDO getUser() {
		return user;
	}
	
	public void setUser(UserDO user) {
		this.user = user;
	}
	
	@Comment("活动日志源的ID")
	public Integer getSource() {
		return source;
	}

	public void setSource(Integer source) {
		this.source = source;
	}

	@Column(name = "SOURCE_TYPE", length = 50)
	@Comment("活动日志的源的类型")
	public String getSourceType() {
		return sourceType;
	}

	public void setSourceType(String sourceType) {
		this.sourceType = sourceType;
	}
	
	@Column(length = 50)
	@Comment("操作类型：新增，删除，修改")
	public String getOperation() {
		return operation;
	}
	
	public void setOperation(String operation) {
		this.operation = operation;
	}
	
	@Lob
	@Basic(fetch = FetchType.EAGER)
	@Column(name = "DATA", columnDefinition = "CLOB", nullable = true)
	@Comment("活动日志内容")
	public String getData() {
		return data;
	}
	
	public void setData(String data) {
		this.data = data;
	}
	
}
