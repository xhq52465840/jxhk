
package com.usky.sms.user;
import org.hibernate.cfg.Comment;

import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.core.AbstractHistorizableBaseDO;
import com.usky.sms.core.IDisplayable;

@Entity
@Table(name = "T_USER_GROUP")
@Comment("用户组")
public class UserGroupDO extends AbstractHistorizableBaseDO implements IDisplayable {
	
	private static final long serialVersionUID = -4516233483871774470L;
	
	/** 名称 */
	private String name;
	
	/** 描述 */
	private String description;
	
	/** 用户 */
	private Set<UserDO> users;
	
	@Column(length = 255, nullable = false)
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
	
	@ManyToMany
	@JoinTable(name = "T_USER_USER_GROUP", joinColumns = @JoinColumn(name = "USER_GROUP_ID"), inverseJoinColumns = @JoinColumn(name = "USER_ID"))
	@Comment("用户")
	public Set<UserDO> getUsers() {
		return users;
	}
	
	public void setUsers(Set<UserDO> users) {
		this.users = users;
	}

	@Override
	@Transient
    public String getDisplayName() {
	    return this.getName();
    }
	
}
