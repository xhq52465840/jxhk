package com.usky.sms.audit.improve;

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
 * 经办人
 * @author zheng.xl
 *
 */
@Entity
@Table(name="A_TRANSACTOR")
@Comment("跟踪表")
public class TransactorDO extends AbstractBaseDO implements IDisplayable{

	private static final long serialVersionUID = -2261087236052308570L;
	
	/** 审计整改单 */
	private ImproveDO improve;
	
	/** 经办人 */
	private UserDO user;

	@ManyToOne
	@JoinColumn(name="IMPROVE_ID")
	@Comment("审计整改单")
	public ImproveDO getImprove() {
		return improve;
	}

	public void setImprove(ImproveDO improve) {
		this.improve = improve;
	}

	@ManyToOne
	@JoinColumn(name="TRANSACTOR_ID")
	@Comment("经办人")
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
