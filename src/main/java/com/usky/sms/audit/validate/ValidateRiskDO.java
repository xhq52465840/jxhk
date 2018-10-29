package com.usky.sms.audit.validate;

import org.hibernate.cfg.Comment;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.tem.ActionItemDO;

@Entity
@Table(name = "A_VALIDATE_RISK")
@Comment("风险验证")
public class ValidateRiskDO extends AbstractBaseDO {

	private static final long serialVersionUID = 239675191053942530L;

	/** 行动项 **/
	private ActionItemDO aid;

	/** 验证人 **/
	private String validator;

	/** 验证结论 **/
	private String result;

	/** 验证日期 **/
	private Date validate_date;

	@OneToOne
	@JoinColumn(name = "Action_item_id")
	@Comment("行动项")
	public ActionItemDO getAid() {
		return aid;
	}

	public void setAid(ActionItemDO aid) {
		this.aid = aid;
	}

	@Column(length = 50)
	@Comment("验证人")
	public String getValidator() {
		return validator;
	}

	public void setValidator(String validator) {
		this.validator = validator;
	}

	@Column(length = 50)
	@Comment("验证结论")
	public String getResult() {
		return result;
	}

	public void setResult(String result) {
		this.result = result;
	}

	@Column(name = "validate_date", columnDefinition = "DATE")
	@Comment("验证日期")
	public Date getValidate_date() {
		return validate_date;
	}

	public void setValidate_date(Date validate_date) {
		this.validate_date = validate_date;
	}

}
