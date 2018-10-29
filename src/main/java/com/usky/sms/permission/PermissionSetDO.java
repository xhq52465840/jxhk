
package com.usky.sms.permission;
import org.hibernate.cfg.Comment;

import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.Table;

import com.usky.sms.core.AbstractHistorizableBaseDO;
import com.usky.sms.user.UserGroupDO;

@Entity
@Table(name = "T_PERMISSION_SET")
@Comment("权限点")
public class PermissionSetDO extends AbstractHistorizableBaseDO {
	
	private static final long serialVersionUID = -1121342781183988764L;
	
	/** 名称 */
	private String name;
	
	/** 描述 */
	private String description;
	
	/** 类型(global:全局权限，activity等等:机构权限) */
	private String type;
	
	/** 权重(排序) */
	private Integer weight;
	
	/** 用户组 */
	private Set<UserGroupDO> userGroups;
	
	/** 权限 */
	private Set<PermissionDO> permissions;
	
	@Column(length = 255, unique = true, nullable = false)
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
	
	@Column(length = 255)
	@Comment("类型(global:全局权限，activity等等:机构权限)")
	public String getType() {
		return type;
	}
	
	public void setType(String type) {
		this.type = type;
	}
	
	@Column
	@Comment("权重(排序)")
	public Integer getWeight() {
		return weight;
	}
	
	public void setWeight(Integer weight) {
		this.weight = weight;
	}
	
	@ManyToMany
	@JoinTable(name = "T_PERM_SET_USER_GROUP", joinColumns = @JoinColumn(name = "PERM_SET_ID", columnDefinition = "COMMENT '权限点的id'"), inverseJoinColumns = @JoinColumn(name = "USER_GROUP_ID", columnDefinition = "COMMENT '用户组的id'"))
	@Comment("用户组")
	public Set<UserGroupDO> getUserGroups() {
		return userGroups;
	}
	
	public void setUserGroups(Set<UserGroupDO> userGroups) {
		this.userGroups = userGroups;
	}
	
	@ManyToMany
	@JoinTable(name = "T_PERM_SET_PERMISSION", joinColumns = @JoinColumn(name = "PERM_SET_ID", columnDefinition = "COMMENT '权限集主键'"), inverseJoinColumns = @JoinColumn(name = "PERMISSION_ID", columnDefinition = "COMMENT '权限点主键'"))
	@Comment("权限")
	public Set<PermissionDO> getPermissions() {
		return permissions;
	}
	
	public void setPermissions(Set<PermissionDO> permissions) {
		this.permissions = permissions;
	}
	
}
