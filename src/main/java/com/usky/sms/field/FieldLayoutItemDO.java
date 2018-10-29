
package com.usky.sms.field;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_FIELD_LAYOUT_ITEM")
@Comment("字段配置明细")
public class FieldLayoutItemDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 2143369486195545369L;
	
	/** 字段布局 */
	private FieldLayoutDO layout;
	
	/** 是否隐藏 */
	private Boolean hidden;
	
	/** 是否必填 */
	private Boolean required;
	
	/** 渲染器 */
	private String renderer;
	
	/** ID */
	private String key;
	
	/** 描述 */
	private String description;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "LAYOUT_ID")
	@Comment("字段布局")
	public FieldLayoutDO getLayout() {
		return layout;
	}
	
	public void setLayout(FieldLayoutDO layout) {
		this.layout = layout;
	}
	
	@Column
	@Comment("是否隐藏")
	public Boolean getHidden() {
		return hidden;
	}
	
	public void setHidden(Boolean hidden) {
		this.hidden = hidden;
	}
	
	@Column
	@Comment("是否必填")
	public Boolean getRequired() {
		return required;
	}
	
	public void setRequired(Boolean required) {
		this.required = required;
	}
	
	@Column(length = 50)
	@Comment("渲染器")
	public String getRenderer() {
		return renderer;
	}
	
	public void setRenderer(String renderer) {
		this.renderer = renderer;
	}
	
	@Column(name = "`key`", length = 50)
	@Comment("ID")
	public String getKey() {
		return key;
	}
	
	public void setKey(String key) {
		this.key = key;
	}
	
	@Column(length = 255)
	@Comment("描述")
	public String getDescription() {
		return description;
	}
	
	public void setDescription(String description) {
		this.description = description;
	}
	
}
