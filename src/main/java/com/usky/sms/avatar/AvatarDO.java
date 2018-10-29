
package com.usky.sms.avatar;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name="T_AVATAR")
@Comment("头像")
public class AvatarDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -1468032999628135750L;
	
	/** 文件名 **/
	private String fileName;
	
	/** http内容类型 **/
	private String contentType;
	
	/** 类型 **/
	private String type;
	
	/** 拥有者 **/
	private String owner;
	
	/** 是否系统:1：是，0：否 **/
	private Boolean system;
	
	@Column(name = "file_name", length = 255)
	@Comment("文件名")
	public String getFileName() {
		return fileName;
	}
	
	public void setFileName(String fileName) {
		this.fileName = fileName;
	}
	
	@Column(name = "content_type", length = 50)
	@Comment("类型")
	public String getContentType() {
		return contentType;
	}
	
	public void setContentType(String contentType) {
		this.contentType = contentType;
	}
	
	@Column(length = 50)
	public String getType() {
		return type;
	}
	
	public void setType(String type) {
		this.type = type;
	}
	
	@Column(length = 50)
	@Comment("拥有者")
	public String getOwner() {
		return owner;
	}
	
	public void setOwner(String owner) {
		this.owner = owner;
	}
	
	@Column
	@Comment("是否系统:1：是，0：否")
	public Boolean getSystem() {
		return system;
	}
	
	public void setSystem(Boolean system) {
		this.system = system;
	}
	
}
