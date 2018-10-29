
package com.usky.sms.activity.security;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_ACTIVITY_SECURITY_SCHEME")
@Comment("信息安全方案")
public class ActivitySecuritySchemeDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 4204039160517937380L;
	
	/** 名称 */
	private String name;
	
	/** 描述 */
	private String description;
	
	/** 默认安全级别主键 */
	private ActivitySecurityLevelDO defaultLevel;
	
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
	
	@OneToOne
	@JoinColumn(name = "default_level")
	@Comment("默认安全级别主键")
	public ActivitySecurityLevelDO getDefaultLevel() {
		return defaultLevel;
	}
	
	public void setDefaultLevel(ActivitySecurityLevelDO defaultLevel) {
		this.defaultLevel = defaultLevel;
	}
	
}
