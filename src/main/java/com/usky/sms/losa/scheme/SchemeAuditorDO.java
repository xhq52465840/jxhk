package com.usky.sms.losa.scheme;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

/**
 * 审计方案与观察员关联表
 */
@Entity
@Table(name = "l_scheme_auditor")
@Comment("LOSA 审计方案与观察员关联表")
public class SchemeAuditorDO extends AbstractBaseDO{

	private static final long serialVersionUID = -2053030214842444818L;
	
	/** 创建人 */
	private Long creator;
	
	/** 更新人 */
	private Long lastModifier;
	
	/** 方案id */
	private Long schemeId;
	
	/** 观察员 */
	private Long auditorId;
	
	@Column(name = "CREATOR")
	@Comment("创建人")
	public Long getCreator() {
		return creator;
	}
	public void setCreator(Long creator) {
		this.creator = creator;
	}
	
	@Column(name = "LAST_MODIFIER")
	@Comment("更新人")
	public Long getLastModifier() {
		return lastModifier;
	}
	public void setLastModifier(Long lastModifier) {
		this.lastModifier = lastModifier;
	}
	
	@Column(name = "SCHEME_ID")
	@Comment("方案id")
	public Long getSchemeId() {
		return schemeId;
	}
	public void setSchemeId(Long schemeId) {
		this.schemeId = schemeId;
	}
	
	@Column(name = "AUDITOR_ID")
	@Comment("观察员")
	public Long getAuditorId() {
		return auditorId;
	}
	public void setAuditorId(Long auditorId) {
		this.auditorId = auditorId;
	}
}
