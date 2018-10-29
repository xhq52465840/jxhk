
package com.usky.sms.tem;
import org.hibernate.cfg.Comment;

import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "T_ACTION_ITEM_OPERATION")
@Comment("行动项操作记录")
public class ActionItemOperationDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -9097376918180542478L;
	
	/** 行动项 */
	private ActionItemDO actionItem;
	
	/** 操作人 */
	private UserDO operator;
	
	/** 操作 */
	private String operation;

	@ManyToOne
	@JoinColumn(name = "ACTION_ITEM_ID")
	@Comment("行动项")
	public ActionItemDO getActionItem() {
		return actionItem;
	}

	public void setActionItem(ActionItemDO actionItem) {
		this.actionItem = actionItem;
	}

	@ManyToOne
	@JoinColumn(name = "OPERATOR_ID")
	@Comment("操作人")
	public UserDO getOperator() {
		return operator;
	}

	public void setOperator(UserDO operator) {
		this.operator = operator;
	}

	@Comment("操作")
	public String getOperation() {
		return operation;
	}

	public void setOperation(String operation) {
		this.operation = operation;
	}

}
