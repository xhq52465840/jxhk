
package com.usky.sms.field.screen;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;

@Entity
@Table(name = "T_FIELD_SCREEN_SCHEME")
@Comment("界面方案")
public class FieldScreenSchemeDO extends AbstractBaseDO implements IDisplayable {
	
	private static final long serialVersionUID = 1785141476610795835L;
	
	/** 名称 */
	private String name;
	
	/** 描述 */
	private String description;
	
	@Column(length = 50, unique = true, nullable = false)
	@Comment("名称")
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	@Column(length = 255)
	@Comment("描述")
	public String getDescription() {
		return description;
	}
	
	public void setDescription(String description) {
		this.description = description;
	}
	
	@Transient
	@Override
	public String getDisplayName() {
		return this.getName();
	}
	
}
