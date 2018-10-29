
package com.usky.sms.user;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_USER_ASSOCIATION")
@Comment("关注投票")
public class UserAssociationDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -9027444018591547391L;
	
	/** 对应的用户 */
	private UserDO user;
	
	/** 对应的实体类型activity */
	private String entityType;
	
	/** 对应的实体 */
	private String entityId;
	
	/** 类型watch */
	private String type;
	
	/** 排序 */
	private Integer sequence;
	
	@ManyToOne
	@JoinColumn(name = "USER_ID")
	@Comment("对应的用户")
	public UserDO getUser() {
		return user;
	}
	
	public void setUser(UserDO user) {
		this.user = user;
	}
	
	@Column(name = "entity_type", length = 50)
	@Comment("类型watch")
	public String getEntityType() {
		return entityType;
	}
	
	public void setEntityType(String entityType) {
		this.entityType = entityType;
	}
	
	@Column(name = "entity_id", length = 50)
	@Comment("对应的实体")
	public String getEntityId() {
		return entityId;
	}
	
	public void setEntityId(String entityId) {
		this.entityId = entityId;
	}
	
	@Column(length = 50)
	public String getType() {
		return type;
	}
	
	public void setType(String type) {
		this.type = type;
	}
	
	@Column
	@Comment("排序")
	public Integer getSequence() {
		return sequence;
	}
	
	public void setSequence(Integer sequence) {
		this.sequence = sequence;
	}
	
}
