
package com.usky.sms.field.screen;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;

@Entity
@Table(name = "T_ATYPE_FSCREEN_SCHEME")
@Comment("安全信息类型界面方案")
public class ActivityTypeFieldScreenSchemeDO extends AbstractBaseDO implements IDisplayable {
	
	private static final long serialVersionUID = 5364913123391458620L;
	
	/** 名称 */
	private String name;
	
	/** 描述 */
	private String description;
	
	/** 类型(default:默认) */
	private String type;
	
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
	
	@Column(length = 50)
	@Comment("类型(default:默认)")
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
