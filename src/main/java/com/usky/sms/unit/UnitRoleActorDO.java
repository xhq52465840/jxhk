
package com.usky.sms.unit;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.role.RoleDO;

@Entity
@Table(name = "T_UNIT_ROLE_ACTOR")
@Comment("机构角色")
public class UnitRoleActorDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -1291640841922232064L;
	
	/** 安监机构 */
	private UnitDO unit;
	
	/** 角色 */
	private RoleDO role;
	
	/** 类型 USER_GROUP USER */
	private String type;
	
	/** 参数 用户主键 用户组主键 */
	private String parameter;
	
	@ManyToOne
	@JoinColumn(name = "UNIT_ID")
	@Comment("安监机构")
	public UnitDO getUnit() {
		return unit;
	}
	
	public void setUnit(UnitDO unit) {
		this.unit = unit;
	}
	
	@ManyToOne
	@JoinColumn(name = "ROLE_ID")
	@Comment("角色")
	public RoleDO getRole() {
		return role;
	}
	
	public void setRole(RoleDO role) {
		this.role = role;
	}
	
	@Column(length = 50)
	@Comment("类型 USER_GROUP USER")
	public String getType() {
		return type;
	}
	
	public void setType(String type) {
		this.type = type;
	}
	
	@Column(length = 50)
	@Comment("参数 用户主键 用户组主键")
	public String getParameter() {
		return parameter;
	}
	
	public void setParameter(String parameter) {
		this.parameter = parameter;
	}
	
}
