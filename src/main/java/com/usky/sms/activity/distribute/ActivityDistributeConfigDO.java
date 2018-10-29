package com.usky.sms.activity.distribute;

import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

import org.hibernate.cfg.Comment;

import com.usky.sms.activity.type.ActivityTypeDO;
import com.usky.sms.core.AbstractHistorizableBaseDO;
import com.usky.sms.role.RoleDO;

@Entity
@Table(name = "T_ACTIVITY_DISTRIBUTE_CONFIG", uniqueConstraints = {@UniqueConstraint(columnNames={"SOURCE_TYPE", "DISTRIBUTE_TYPE"})})
@Comment("安全任务分配配置")
public class ActivityDistributeConfigDO extends AbstractHistorizableBaseDO {

	private static final long serialVersionUID = -8407391669434975129L;

	/** 源类型 */
	private ActivityTypeDO sourceType;
	
	/** 下发后的类型 */
	private ActivityTypeDO distributeType;
	
	/** 机构类别(UT: 安监机构; DP: 组织) */
	private String unitType;
	
	/** 角色 */
	private Set<RoleDO> roles;
	
	@ManyToOne
	@JoinColumn(name = "SOURCE_TYPE")
	@Comment("源类型")
	public ActivityTypeDO getSourceType() {
		return sourceType;
	}

	public void setSourceType(ActivityTypeDO sourceType) {
		this.sourceType = sourceType;
	}

	@ManyToOne
	@JoinColumn(name = "DISTRIBUTE_TYPE")
	@Comment("下发后的类型")
	public ActivityTypeDO getDistributeType() {
		return distributeType;
	}

	public void setDistributeType(ActivityTypeDO distributeType) {
		this.distributeType = distributeType;
	}

	@Column(name = "UNIT_TYPE", length = 2)
	@Comment("机构类别(UT: 安监机构; DP: 组织)")
	public String getUnitType() {
		return unitType;
	}

	public void setUnitType(String unitType) {
		this.unitType = unitType;
	}

	@ManyToMany
	@JoinTable(name = "T_ACT_DSB_CFG_ROLE", joinColumns = @JoinColumn(name = "ACT_DSB_CFG_ID"), inverseJoinColumns = @JoinColumn(name = "ROLE_ID"))
	@Comment("角色")
	public Set<RoleDO> getRoles() {
		return roles;
	}

	public void setRoles(Set<RoleDO> roles) {
		this.roles = roles;
	}

}
