
package com.usky.sms.activity.type;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;

@Entity
@Table(name = "T_ACTIVITY_TYPE")
@Comment("安全信息类型字典")
public class ActivityTypeDO extends AbstractBaseDO implements IDisplayable {
	
	private static final long serialVersionUID = 3566607710804115337L;
	
	/** 名称 */
	private String name;
	
	/** 描述 */
	private String description;
	
	/** 图标URL */
	private String url;
	
	/** 类型代码 */
	private String code;
	
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
	@Comment("图标URL")
	public String getUrl() {
		return url;
	}
	
	public void setUrl(String url) {
		this.url = url;
	}
	
	@Column(name = "CODE", length = 30)
	@Comment("类型代码")
	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	@Transient
	@Override
	public String getDisplayName() {
		return this.getName();
	}
	
}
