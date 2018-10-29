package com.usky.sms.safetyreview;

import org.hibernate.cfg.Comment;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.unit.UnitDO;


@Entity
@Table(name = "T_ASSESSMENT_UNIT")
@Comment("进行评审的安监机构")
public class AssessmentUnitDO extends AbstractBaseDO {

	private static final long serialVersionUID = -4739155952212588583L;
	
	/** 安监机构 */
	private UnitDO unit;

	@ManyToOne
	@JoinColumn(name = "UNIT_ID")
	@Comment("安监机构")
	public UnitDO getUnit() {
		return unit;
	}

	public void setUnit(UnitDO unit) {
		this.unit = unit;
	}	
}
