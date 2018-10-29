
package com.usky.sms.risk;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.tem.control.ControlDO;

@Entity
@Table(name = "T_CLAUSE")
@Comment("手册条款实例")
public class ClauseDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -3158406453119038582L;
	
	/** 风险分析块明细行（威胁） */
	private RiskThreatMappingDO threat;
	
	/** 风险分析块明细行（差错） */
	private RiskErrorMappingDO error;
	
	/** 控制措施 */
	private ControlDO control;
	
	/** 状态(未发布、为落实、落实) */
	private String status;
	
	/** 是否生成检查单 */
	private Boolean generate;
	
	@ManyToOne
	@JoinColumn(name = "THREAT_ID")
	@Comment("风险分析块明细行（威胁）")
	public RiskThreatMappingDO getThreat() {
		return threat;
	}
	
	public void setThreat(RiskThreatMappingDO threat) {
		this.threat = threat;
	}
	
	@ManyToOne
	@JoinColumn(name = "ERROR_ID")
	@Comment("风险分析块明细行（差错）")
	public RiskErrorMappingDO getError() {
		return error;
	}
	
	public void setError(RiskErrorMappingDO error) {
		this.error = error;
	}
	
	@ManyToOne
	@JoinColumn(name = "CONTROL_ID")
	@Comment("控制措施")
	public ControlDO getControl() {
		return control;
	}
	
	public void setControl(ControlDO control) {
		this.control = control;
	}
	
	@Column(length = 10)
	@Comment("状态(未发布、为落实、落实)")
	public String getStatus() {
		return status;
	}
	
	public void setStatus(String status) {
		this.status = status;
	}
	
	@Column
	@Comment("是否生成检查单")
	public Boolean getGenerate() {
		return generate;
	}
	
	public void setGenerate(Boolean generate) {
		this.generate = generate;
	}
	
}
