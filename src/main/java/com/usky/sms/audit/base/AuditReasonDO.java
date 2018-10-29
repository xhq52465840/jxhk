package com.usky.sms.audit.base;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;

import javax.persistence.Entity;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "A_AUDIT_REASON")
@Comment("审计原因分类")
public class AuditReasonDO extends AbstractBaseDO {

	private static final long serialVersionUID = 5672103842527819457L;

	/** 名称 */
	private String name;

	/** 描述 */
	private String description;

	@Column(length = 50)
	@Comment("名称")
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@Column(length = 2000)
	@Comment("描述")
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

}
