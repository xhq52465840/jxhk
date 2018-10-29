
package com.usky.sms.notification;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_NOTIFICATION_SCHEME_ITEM")
@Comment("通知方案明细")
public class NotificationSchemeItemDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -3999222304033638829L;
	
	/** 通知方案 */
	private NotificationSchemeDO scheme;
	
	/** 事件 */
	private String event;
	
	/** 类型USER_GROUP USER */
	private String type;
	
	/** 参数 */
	private String parameter;
	
	@ManyToOne
	@JoinColumn(name = "SCHEME_ID")
	@Comment("通知方案")
	public NotificationSchemeDO getScheme() {
		return scheme;
	}
	
	public void setScheme(NotificationSchemeDO scheme) {
		this.scheme = scheme;
	}
	
	@Column(length = 50)
	@Comment("事件")
	public String getEvent() {
		return event;
	}
	
	public void setEvent(String event) {
		this.event = event;
	}
	
	@Column(length = 50)
	@Comment("类型USER_GROUP USER")
	public String getType() {
		return type;
	}
	
	public void setType(String type) {
		this.type = type;
	}
	
	@Column(length = 50)
	@Comment("参数")
	public String getParameter() {
		return parameter;
	}
	
	public void setParameter(String parameter) {
		this.parameter = parameter;
	}
	
}
