
package com.usky.sms.custom;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;

@Entity
@Table(name = "T_CUSTOM_FIELD_TYPE")
@Comment("自定义字段类型")
public class CustomFieldTypeDO extends AbstractBaseDO implements IDisplayable {
	
	private static final long serialVersionUID = 4439024249544945411L;
	
	/** 名称 */
	private String name;
	
	/** key值  */
	private String key;
	
	/** url */
	private String url;
	
	/** 描述 */
	private String description;
	
	/** 类型 */
	private String type;
	
	@Column(length = 50)
	@Comment("名称")
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	@Column(name = "`key`", length = 100)
	@Comment("key值")
	public String getKey() {
		return key;
	}
	
	public void setKey(String key) {
		this.key = key;
	}
	
	@Column(length = 255)
	@Comment("url")
	public String getUrl() {
		return url;
	}
	
	public void setUrl(String url) {
		this.url = url;
	}
	
	@Column(length = 255)
	@Comment("描述")
	public String getDescription() {
		return description;
	}
	
	public void setDescription(String description) {
		this.description = description;
	}
	
	@Column(length = 20)
	@Comment("类型")
	public String getType() {
		return type;
	}
	
	public void setType(String type) {
		this.type = type;
	}
	
	@Transient
	@Override
	public String getDisplayName() {
		return this.getName();
	}
	
}
