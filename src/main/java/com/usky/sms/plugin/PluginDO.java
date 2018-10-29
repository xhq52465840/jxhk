
package com.usky.sms.plugin;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_PLUGIN")
@Comment("插件")
public class PluginDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 1875117054970490067L;
	
	/** 名称 */
	private String name;
	
	/** 键 */
	private String key;
	
	/** 版本 */
	private String version;
	
	/** 描述 */
	private String description;
	
	/** 详细 */
	private String details;
	
	/** 状态 */
	private String status;
	
	@Column(length = 50)
	@Comment("名称")
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	@Column(name = "`key`", length = 50)
	@Comment("键")
	public String getKey() {
		return key;
	}
	
	public void setKey(String key) {
		this.key = key;
	}
	
	@Column(length = 50)
	@Comment("版本")
	public String getVersion() {
		return version;
	}
	
	public void setVersion(String version) {
		this.version = version;
	}
	
	@Column(length = 2000)
	@Comment("描述")
	public String getDescription() {
		return description;
	}
	
	public void setDescription(String description) {
		this.description = description;
	}
	
	@Column(length = 4000)
	@Comment("详细")
	public String getDetails() {
		return details;
	}
	
	public void setDetails(String details) {
		this.details = details;
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
