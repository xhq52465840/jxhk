package com.usky.sms.audit.validate;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

/**
 * 存放行动项和其所对应risk的创建人
 * 
 * @author rj
 *
 */
@Entity
@Table(name = "A_ACTION_ITEM_CREATOR")
@Comment("行动项创建人")
public class ActionItemCreatorDO extends AbstractBaseDO {

	private static final long serialVersionUID = -7619811400252832654L;

	/** 行动项 **/
	private Integer actionItemId;

	/** 创建人 **/
	private Integer creator;

	@Id
	@Column(name = "ACTION_ITEM_ID")
	@Comment("行动项")
	public Integer getActionItemId() {
		return actionItemId;
	}

	public void setActionItemId(Integer actionItemId) {
		this.actionItemId = actionItemId;
	}

	@Column(name = "CREATOR_ID")
	@Comment("创建人")
	public Integer getCreator() {
		return creator;
	}

	public void setCreator(Integer creator) {
		this.creator = creator;
	}

}
