
package com.usky.sms.user;
import org.hibernate.cfg.Comment;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_USER_HISTORY_ITEM")
@Comment("用户对实体对象查看的历史")
public class UserHistoryItemDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -4381563200238437601L;
	
	/** 实体类型 */
	private String entityType;
	
	/** 实体id */
	private String entityId;
	
	/** 用户名 */
	private String username;
	
	/** 最后查看时间 */
	private Date lastViewed;
	
	/** 详细内容 */
	private String data;
	
	@Column(name = "entity_type", length = 50)
	@Comment("实体类型")
	public String getEntityType() {
		return entityType;
	}
	
	public void setEntityType(String entityType) {
		this.entityType = entityType;
	}
	
	@Column(name = "entity_id", length = 50)
	@Comment("实体id")
	public String getEntityId() {
		return entityId;
	}
	
	public void setEntityId(String entityId) {
		this.entityId = entityId;
	}
	
	@Column(length = 50)
	@Comment("用户名")
	public String getUsername() {
		return username;
	}
	
	public void setUsername(String username) {
		this.username = username;
	}
	
	@Column
	@Comment("最后查看时间")
	public Date getLastViewed() {
		return lastViewed;
	}
	
	public void setLastViewed(Date lastViewed) {
		this.lastViewed = lastViewed;
	}
	
	@Column(length = 255)
	@Comment("详细内容")
	public String getData() {
		return data;
	}
	
	public void setData(String data) {
		this.data = data;
	}
	
}
