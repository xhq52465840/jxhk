package com.usky.sms.audit.check;

import org.hibernate.cfg.Comment;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;
import com.usky.sms.user.UserDO;

/**
 * 整改项当前处理人
 * @author zheng.xl
 *
 */
@Entity
@Table(name="A_IMPROVE_ITEM_USER")
@Comment("整改单处理人")
public class ImproveItemUserDO extends AbstractBaseDO implements IDisplayable{

	private static final long serialVersionUID = -2261087236052308570L;
	
	/** 审计整改单的整改项 */
	private CheckListDO checkList;
	
	/** 处理人 */
	private UserDO user;

	@ManyToOne
	@JoinColumn(name="CHECK_LIST_ID")
	@Comment("审计整改单的整改项")
	public CheckListDO getCheckList() {
		return checkList;
	}

	public void setCheckList(CheckListDO checkList) {
		this.checkList = checkList;
	}

	@ManyToOne
	@JoinColumn(name="TRANSACTOR_ID")
	@Comment("处理人")
	public UserDO getUser() {
		return user;
	}

	public void setUser(UserDO user) {
		this.user = user;
	}

	@Transient
	@Override
	public String getDisplayName() {
		return user.getDisplayName();
	}

}
