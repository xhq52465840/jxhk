
package com.usky.sms.notification;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;

@Entity
@Table(name = "T_NOTIFICATION_SCHEME")
@Comment("通知方案")
public class NotificationSchemeDO extends AbstractBaseDO implements IDisplayable {
	
	private static final long serialVersionUID = 4384543945678621493L;
	
	/** 名称 */
	private String name;
	
	/** 描述 */
	private String description;
	
	/** default 是否默认方案 */
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
	@Comment("default 是否默认方案")
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
