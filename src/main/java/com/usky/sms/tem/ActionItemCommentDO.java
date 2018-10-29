
package com.usky.sms.tem;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "T_ACTION_ITEM_COMMENT")
@Comment("行动项详细说明")
public class ActionItemCommentDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -1173921576730390292L;
	
	/** 行动项 */
	private ActionItemDO actionItem;
	
	/** 用户 */
	private UserDO user;
	
	/** 说明 */
	private String comment;
	
	@ManyToOne
	@JoinColumn(name = "action_item")
	@Comment("行动项")
	public ActionItemDO getActionItem() {
		return actionItem;
	}
	
	public void setActionItem(ActionItemDO actionItem) {
		this.actionItem = actionItem;
	}
	
	@ManyToOne
	@JoinColumn(name = "`user`")
	@Comment("用户")
	public UserDO getUser() {
		return user;
	}
	
	public void setUser(UserDO user) {
		this.user = user;
	}
	
	@Column(name = "`comment`", length = 255)
	@Comment("说明")
	public String getComment() {
		return comment;
	}
	
	public void setComment(String comment) {
		this.comment = comment;
	}
	
}
