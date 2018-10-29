
package com.usky.sms.activity.security;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_ACTIVITY_SECURITY_LEVEL")
@Comment("信息安全级别字典")
public class ActivitySecurityLevelDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -8648834001680087773L;
	
	/** 名称 */
	private String name;
	
	/** 描述 */
	private String description;
	
	/** t_activity_security_scheme主键 */
	private ActivitySecuritySchemeDO scheme;
	
	@Column(length = 50)
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
	
	@ManyToOne
	@JoinColumn(name = "SCHEME_ID")
	@Comment("t_activity_security_scheme主键")
	public ActivitySecuritySchemeDO getScheme() {
		return scheme;
	}
	
	public void setScheme(ActivitySecuritySchemeDO scheme) {
		this.scheme = scheme;
	}
	
}
