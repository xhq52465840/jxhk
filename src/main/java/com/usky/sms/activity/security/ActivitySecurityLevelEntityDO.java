
package com.usky.sms.activity.security;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_ASLEVEL_ENTITY")
@Comment("信息安全级别和用户用户组角色关联关系表")
public class ActivitySecurityLevelEntityDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 2653518223199289052L;
	
	/** 信息安全级别主键 */
	private ActivitySecurityLevelDO level;
	
	/** 类型 */
	private String type;
	
	/** 用户 用户组 角色主键 非强关联 */
	private String parameter;
	
	@ManyToOne
	@JoinColumn(name = "LEVEL_ID")
	@Comment("信息安全级别主键")
	public ActivitySecurityLevelDO getLevel() {
		return level;
	}
	
	public void setLevel(ActivitySecurityLevelDO level) {
		this.level = level;
	}
	
	@Column(length = 50)
	@Comment("类型")
	public String getType() {
		return type;
	}
	
	public void setType(String type) {
		this.type = type;
	}
	
	@Column(length = 255)
	@Comment("用户 用户组 角色主键 非强关联")
	public String getParameter() {
		return parameter;
	}
	
	public void setParameter(String parameter) {
		this.parameter = parameter;
	}
	
}
