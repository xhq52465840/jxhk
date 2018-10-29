
package com.usky.sms.entity;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_TABLE_FIELD")
@Comment("无用表")
public class EntityFieldDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 5172641716018808431L;
	
	private String description;
	
	private String key;
	
	private String type;
	
	private String typeData;
	
	private String length;
	
	private String required;
	
	private String regex;
	
	private String searchable;
	
	private String editable;
	
	private String defaultValue;
	
	private String isCustomized;
	
	private EntityDO entity;
	
	@Column(length = 50)
	@Comment("")
	public String getDescription() {
		return description;
	}
	
	public void setDescription(String description) {
		this.description = description;
	}
	
	@Column(name = "`key`", length = 50)
	@Comment("")
	public String getKey() {
		return key;
	}
	
	public void setKey(String key) {
		this.key = key;
	}
	
	@Column(name="`type`",length = 50)
	@Comment("")
	public String getType() {
		return type;
	}
	
	public void setType(String type) {
		this.type = type;
	}
	
	@Column(name = "type_data", length = 255)
	@Comment("")
	public String getTypeData() {
		return typeData;
	}
	
	public void setTypeData(String typeData) {
		this.typeData = typeData;
	}
	
	@Column(name="`length`",length = 50)
	@Comment("")
	public String getLength() {
		return length;
	}
	
	public void setLength(String length) {
		this.length = length;
	}
	
	@Column(name="`required`",length = 50)
	@Comment("")
	public String getRequired() {
		return required;
	}
	
	public void setRequired(String required) {
		this.required = required;
	}
	
	@Column(length = 50)
	@Comment("")
	public String getRegex() {
		return regex;
	}
	
	public void setRegex(String regex) {
		this.regex = regex;
	}
	
	@Column(length = 50)
	@Comment("")
	public String getSearchable() {
		return searchable;
	}
	
	public void setSearchable(String searchable) {
		this.searchable = searchable;
	}
	
	@Column(length = 50)
	@Comment("")
	public String getEditable() {
		return editable;
	}
	
	public void setEditable(String editable) {
		this.editable = editable;
	}
	
	@Column(name = "`default`", length = 50)
	@Comment("")
	public String getDefaultValue() {
		return defaultValue;
	}
	
	public void setDefaultValue(String defaultValue) {
		this.defaultValue = defaultValue;
	}
	
	@Column(name = "is_customized", length = 50)
	@Comment("")
	public String getIsCustomized() {
		return isCustomized;
	}
	
	public void setIsCustomized(String isCustomized) {
		this.isCustomized = isCustomized;
	}
	
	@ManyToOne
	@JoinColumn(name = "table_id")
	@Comment("")
	public EntityDO getEntity() {
		return entity;
	}
	
	public void setEntity(EntityDO entity) {
		this.entity = entity;
	}
	
}
