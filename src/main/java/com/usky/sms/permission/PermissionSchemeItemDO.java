
package com.usky.sms.permission;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_PERMISSION_SCHEME_ITEM")
@Comment("权限方案的明细")
public class PermissionSchemeItemDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 5214057332141072861L;
	
	/** 权限方案 */
	private PermissionSchemeDO scheme;
	
	/** 权限集 */
	private PermissionSetDO permissionSet;
	
	/** UNIT_RESPONSIBLE_USER 机构负责人 REPORTER 创建人 USER_GROUP用户组 PROCESSOR 处理人 ROLE角色 USER用户 */
	private String type;
	
	/** 参数和type关系 */
	private String parameter;
	
	@ManyToOne
	@JoinColumn(name = "SCHEME_ID")
	@Comment("权限方案")
	public PermissionSchemeDO getScheme() {
		return scheme;
	}
	
	public void setScheme(PermissionSchemeDO scheme) {
		this.scheme = scheme;
	}
	
	@ManyToOne
	@JoinColumn(name = "permission_set")
	@Comment("权限集")
	public PermissionSetDO getPermissionSet() {
		return permissionSet;
	}
	
	public void setPermissionSet(PermissionSetDO permissionSet) {
		this.permissionSet = permissionSet;
	}
	
	@Column(length = 50)
	@Comment("UNIT_RESPONSIBLE_USER 机构负责人 REPORTER 创建人 USER_GROUP用户组 PROCESSOR 处理人 ROLE角色 USER用户")
	public String getType() {
		return type;
	}
	
	public void setType(String type) {
		this.type = type;
	}
	
	@Column(length = 50)
	@Comment("参数和type关系")
	public String getParameter() {
		return parameter;
	}
	
	public void setParameter(String parameter) {
		this.parameter = parameter;
	}
	
}
