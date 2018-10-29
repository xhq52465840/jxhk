
package com.usky.sms.risk;
import org.hibernate.cfg.Comment;

import java.util.List;

import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.role.RoleDO;

@Entity
@Table(name = "T_RISK_TASK_SETTING")
@Comment("任务分配组件和安全信息类别关联配置")
public class RiskTaskSettingDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 3876195662294802775L;
	
	/** 角色 */
	private List<RoleDO> roles;
	
	/** 任务分配组件和安全信息类别关联 */
	private List<RiskTaskActivityTypeEntityDO> entities;
	
	@ManyToMany
	@JoinTable(name = "T_RTSETTING_ROLE", joinColumns = @JoinColumn(name = "RTSETTING_ID"), inverseJoinColumns = @JoinColumn(name = "ROLE_ID"))
	@Comment("角色")
	public List<RoleDO> getRoles() {
		return roles;
	}
	
	public void setRoles(List<RoleDO> roles) {
		this.roles = roles;
	}
	
	@OneToMany(mappedBy = "setting")
	@Comment("任务分配组件和安全信息类别关联")
	public List<RiskTaskActivityTypeEntityDO> getEntities() {
		return entities;
	}
	
	public void setEntities(List<RiskTaskActivityTypeEntityDO> entities) {
		this.entities = entities;
	}
	
}
