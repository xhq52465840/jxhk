
package com.usky.sms.core;
import org.hibernate.cfg.Comment;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.MappedSuperclass;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

@MappedSuperclass
public abstract class AbstractBaseDO implements Serializable {
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	
	/** 主键 **/
	private Integer id;
	
	/** 创建时间 **/
	private Date created;
	
	/** 更新时间 **/
	private Date lastUpdate;
	
	/** 是否删除 **/
	private boolean deleted;
	
	@Id
	@GeneratedValue
	@Column
	@Comment("主键")
	public Integer getId() {
		return id;
	}
	
	public void setId(final Integer id) {
		this.id = id;
	}
	
	@Basic
	@Comment("是否删除")
	public boolean isDeleted() {
		return deleted;
	}
	
	public void setDeleted(boolean deleted) {
		this.deleted = deleted;
	}
	
	@Basic
	@Column(columnDefinition = "DATE")
	@Temporal(TemporalType.TIMESTAMP)
	@Comment("创建时间")
	public Date getCreated() {
		return created;
	}
	
	public void setCreated(Date created) {
		this.created = created;
	}
	
	public void setCreated() {
		this.created = new Date();
	}
	
	@Basic
	@Column(name = "last_update", columnDefinition = "DATE")
	@Temporal(TemporalType.TIMESTAMP)
	@Comment("更新时间")
	public Date getLastUpdate() {
		return lastUpdate;
	}
	
	public void setLastUpdate(Date lastUpdate) {
		this.lastUpdate = lastUpdate;
	}
	
	public void setLastUpdate() {
		this.lastUpdate = new Date();
	}
	
}
