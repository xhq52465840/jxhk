package com.usky.sms.safetyreview;

import org.hibernate.cfg.Comment;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.role.RoleDO;

/**
 * 评审接收角色
 */
@Entity
@Table(name = "T_METHANOL_ROLE")
@Comment("评审接收角色")
public class MethanolRoleDO extends AbstractBaseDO {

	private static final long serialVersionUID = -3255064797470731714L;
	
	/** 角色 */
	private RoleDO role;

	@ManyToOne
	@JoinColumn(name = "ROLE_ID")
	@Comment("角色")
	public RoleDO getRole() {
		return role;
	}

	public void setRole(RoleDO role) {
		this.role = role;
	}

}
