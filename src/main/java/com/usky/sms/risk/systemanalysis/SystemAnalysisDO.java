package com.usky.sms.risk.systemanalysis;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.hibernate.cfg.Comment;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.unit.UnitDO;

@Entity
@Table(name = "T_SYSTEM_ANALYSIS")
@Comment("系统工作分析")
public class SystemAnalysisDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -9082256999635197135L;
	
	/** 系统分类 */
	private DictionaryDO system;
	
	/** 安监机构 */
	private UnitDO unit;
	
	/** 子系统 */
	private String subsystem;
	
	/** 一级流程 */
	private String primaryWorkflow;
	
	/** 二级流程 */
	private String secondaryWorkflow;

	@ManyToOne
	@JoinColumn(name = "SYSTEM_ID")
	@Comment("系统分类")
	public DictionaryDO getSystem() {
		return system;
	}
	
	public void setSystem(DictionaryDO system) {
		this.system = system;
	}

	@ManyToOne
	@JoinColumn(name = "UNIT_ID")
	@Comment("安监机构")
	public UnitDO getUnit() {
		return unit;
	}

	public void setUnit(UnitDO unit) {
		this.unit = unit;
	}

	@Column(name = "SUBSYSTEM", length = 255)
	@Comment("子系统")
	public String getSubsystem() {
		return subsystem;
	}

	public void setSubsystem(String subsystem) {
		this.subsystem = subsystem;
	}

	@Column(name = "PRIMARY_WORKFLOW", length = 255)
	@Comment("一级流程")
	public String getPrimaryWorkflow() {
		return primaryWorkflow;
	}

	public void setPrimaryWorkflow(String primaryWorkflow) {
		this.primaryWorkflow = primaryWorkflow;
	}

	@Column(name = "SECONDARY_WORKFLOW", length = 255)
	@Comment("二级流程")
	public String getSecondaryWorkflow() {
		return secondaryWorkflow;
	}

	public void setSecondaryWorkflow(String secondaryWorkflow) {
		this.secondaryWorkflow = secondaryWorkflow;
	}
	
}
