
package com.usky.sms.audit.action;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "A_AUDIT_ACTION")
@Comment("审计中的备注")
public class AuditActionDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -8898359138793225037L;
	
	/** 备注来源ID */
	private Integer source;
	
	/** 备注来源的类型 */
	private String sourceType;
	
	/** 创建备注人 */
	private UserDO author;
	
	/** 备注的内容 */
	private String body;
	
	/** 更新备注人 */
	private UserDO updatedAuthor;
	
	@Comment("备注来源ID")
	public Integer getSource() {
		return source;
	}

	public void setSource(Integer source) {
		this.source = source;
	}

	@Column(name = "SOURCE_TYPE", length = 50)
	@Comment("备注来源的类型")
	public String getSourceType() {
		return sourceType;
	}

	public void setSourceType(String sourceType) {
		this.sourceType = sourceType;
	}
	
	@ManyToOne
	@JoinColumn(name = "AUTHOR_ID")
	@Comment("创建备注人")
	public UserDO getAuthor() {
		return author;
	}
	
	public void setAuthor(UserDO author) {
		this.author = author;
	}
	
	@Column(name="`body`", length = 4000, columnDefinition = "clob")
	@Comment("备注的内容")
	public String getBody() {
		return body;
	}
	
	public void setBody(String body) {
		this.body = body;
	}
	
	@ManyToOne
	@JoinColumn(name = "UPDATEDAUTHOR_ID")
	@Comment("更新备注人")
	public UserDO getUpdatedAuthor() {
		return updatedAuthor;
	}
	
	public void setUpdatedAuthor(UserDO updatedAuthor) {
		this.updatedAuthor = updatedAuthor;
	}
	
}
