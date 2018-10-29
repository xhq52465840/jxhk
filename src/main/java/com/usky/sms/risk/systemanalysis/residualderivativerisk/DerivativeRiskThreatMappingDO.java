
package com.usky.sms.risk.systemanalysis.residualderivativerisk;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.hibernate.cfg.Comment;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.tem.threat.ThreatDO;

@Entity
@Table(name = "T_DERIVATIVE_RISK_THREAT_MPP")
@Comment("衍生风险块明细行（威胁）")
public class DerivativeRiskThreatMappingDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 4734893921742801397L;
	
	/** 剩余衍生风险分析块 */
	private ResidualDerivativeRiskDO residualDerivativeRisk;
	
	/** 剩余风险块明细行（威胁） ID*/
	private Integer residualRiskThreatMappingId;
	
	/** 威胁 */
	private ThreatDO threat;
	
	/** 分析描述 */
	private String text;
	
	/** 风险等级P */
	private Integer riskLevelP;
	
	/** 风险等级S */
	private Integer riskLevelS;
	
	@ManyToOne
	@JoinColumn(name = "RESIDUAL_DERIVATIVE_RISK_ID")
	@Comment("剩余衍生风险分析块")
	public ResidualDerivativeRiskDO getResidualDerivativeRisk() {
		return residualDerivativeRisk;
	}
	
	public void setResidualDerivativeRisk(ResidualDerivativeRiskDO residualDerivativeRisk) {
		this.residualDerivativeRisk = residualDerivativeRisk;
	}
	
	@Column(name = "RESIDUAL_RISK_THREAT_MPP_ID")
	@Comment("剩余风险块明细行（威胁） ID")
	public Integer getResidualRiskThreatMappingId() {
		return residualRiskThreatMappingId;
	}

	public void setResidualRiskThreatMappingId(Integer residualRiskThreatMappingId) {
		this.residualRiskThreatMappingId = residualRiskThreatMappingId;
	}

	@ManyToOne
	@JoinColumn(name = "THREAT_ID")
	@Comment("威胁")
	public ThreatDO getThreat() {
		return threat;
	}
	
	public void setThreat(ThreatDO threat) {
		this.threat = threat;
	}
	
	@Column(name = "TEXT", length = 4000)
	@Comment("分析描述")
	public String getText() {
		return text;
	}
	
	public void setText(String text) {
		this.text = text;
	}

	@Column(name = "RISK_LEVEL_P")
	@Comment("风险等级P")
	public Integer getRiskLevelP() {
		return riskLevelP;
	}

	public void setRiskLevelP(Integer riskLevelP) {
		this.riskLevelP = riskLevelP;
	}

	@Column(name = "RISK_LEVEL_S")
	@Comment("风险等级S")
	public Integer getRiskLevelS() {
		return riskLevelS;
	}

	public void setRiskLevelS(Integer riskLevelS) {
		this.riskLevelS = riskLevelS;
	}
	
}
