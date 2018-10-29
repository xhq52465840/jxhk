package com.usky.sms.losa.scheme;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

/**
 * 审计方案与被实施单位关联表
 */
@Entity
@Table(name = "l_scheme_unit")
@Comment("LOSA 审计方案与被实施单位关联表")
public class SchemeUnitDO extends AbstractBaseDO{

	private static final long serialVersionUID = 8703880023814041640L;
	
	/** 创建人 */
	private Long creator;
	
	/** 更新人 */
	private Long lastModifier;
	
	/** 方案 */
	private Long schemeId;
	
	/** 安监机构 */
	private Long unitId;
	
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
	@Comment("方案")
	public Long getSchemeId() {
		return schemeId;
	}

	public void setSchemeId(Long schemeId) {
		this.schemeId = schemeId;
	}

	@Column(name = "UNIT_ID")
	@Comment("安监机构")
	public Long getUnitId() {
		return unitId;
	}

	public void setUnitId(Long unitId) {
		this.unitId = unitId;
	}
}
