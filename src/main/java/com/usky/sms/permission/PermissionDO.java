
package com.usky.sms.permission;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_PERMISSION")
@Comment("权限点（系统暂不启用）")
public class PermissionDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 6467325992485720066L;
	
	/** 名称 */
	private String name;
	
	/** 描述 */
	private String description;
	
	/** 父节点 */
	private PermissionDO parent;
	
	/** 状态 */
	private String status;
	
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
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "parent")
	@Comment("父节点")
	public PermissionDO getParent() {
		return parent;
	}
	
	public void setParent(PermissionDO parent) {
		this.parent = parent;
	}
	
	@Column(length = 10)
	@Comment("状态")
	public String getStatus() {
		return status;
	}
	
	public void setStatus(String status) {
		this.status = status;
	}
	
}
