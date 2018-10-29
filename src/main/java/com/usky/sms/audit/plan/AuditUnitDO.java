package com.usky.sms.audit.plan;

import org.hibernate.cfg.Comment;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;
import com.usky.sms.unit.UnitDO;

/**
 * 审计的安监机构
 * @author zheng.xl
 *
 */
@Entity
@Table(name="A_AUDIT_UNIT")
@Comment("审计的安监机构")
public class AuditUnitDO extends AbstractBaseDO implements IDisplayable{

	private static final long serialVersionUID = -5818094435878410175L;
	
	/** 安监机构 */
	private UnitDO unit;
	
	/** 排序用字段 */
	private Integer sortKey;

	@ManyToOne
	@JoinColumn(name="UNIT_ID", unique = true)
	@Comment("安监机构")
	public UnitDO getUnit() {
		return unit;
	}

	public void setUnit(UnitDO unit) {
		this.unit = unit;
	}

	@Comment("排序用字段")
	public Integer getSortKey() {
		return sortKey;
	}

	public void setSortKey(Integer sortKey) {
		this.sortKey = sortKey;
	}

	@Transient
	@Override
	public String getDisplayName() {
		return null;
	}

}
