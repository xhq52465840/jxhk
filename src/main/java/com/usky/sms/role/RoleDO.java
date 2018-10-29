
package com.usky.sms.role;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;


@Entity
@Table(name = "T_ROLE")
@Comment("角色")
public class RoleDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 8203218962833275539L;
	
	/** 名称 */
	private String name;
	
	/** 描述 */
	private String description;
	
	/** 类型(audit:审计) */
	private String type;
	
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
	
	@Column(length = 50)
	@Comment("类型(audit:审计)")
	public String getType() {
		return type;
	}
	
	public void setType(String type) {
		this.type = type;
	}
	
}
