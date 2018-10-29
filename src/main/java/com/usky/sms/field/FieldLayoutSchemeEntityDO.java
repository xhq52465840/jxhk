
package com.usky.sms.field;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.activity.type.ActivityTypeDO;
import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_FIELD_LAYOUT_SCHEME_ENTITY")
@Comment("字段配置和方案和信息类型关联关系表")
public class FieldLayoutSchemeEntityDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -6528369360011232621L;
	
	/** 字段配置方案 */
	private FieldLayoutSchemeDO scheme;
	
	/** 安全信息类型 */
	private ActivityTypeDO type;
	
	/** 字段配置 */
	private FieldLayoutDO layout;
	
	/** 是否默认配置 */
	private String entityType;
	
	@ManyToOne
	@JoinColumn(name = "SCHEME_ID")
	@Comment("字段配置方案")
	public FieldLayoutSchemeDO getScheme() {
		return scheme;
	}
	
	public void setScheme(FieldLayoutSchemeDO scheme) {
		this.scheme = scheme;
	}
	
	@ManyToOne
	@JoinColumn(name = "TYPE_ID")
	@Comment("安全信息类型")
	public ActivityTypeDO getType() {
		return type;
	}
	
	public void setType(ActivityTypeDO type) {
		this.type = type;
	}
	
	@ManyToOne
	@JoinColumn(name = "LAYOUT_ID")
	@Comment("字段配置")
	public FieldLayoutDO getLayout() {
		return layout;
	}
	
	public void setLayout(FieldLayoutDO layout) {
		this.layout = layout;
	}
	
	@Column(name = "entity_type", length = 50)
	@Comment("是否默认配置")
	public String getEntityType() {
		return entityType;
	}
	
	public void setEntityType(String entityType) {
		this.entityType = entityType;
	}
	
}
