
package com.usky.sms.risk.systemanalysis;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.hibernate.cfg.Comment;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.tem.control.ControlDO;

@Entity
@Table(name = "T_SYS_ANLS_CLAUSE")
@Comment("系统分析手册条款实例")
public class SystemAnalysisClauseDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -3158406453119038582L;
	
	/** 风险分析块明细行（威胁） */
	private SystemAnalysisRiskThreatMappingDO riskThreatMapping;
	
	/** 风险分析块明细行（差错） */
	private SystemAnalysisRiskErrorMappingDO riskErrorMapping;
	
	/** 控制措施 */
	private ControlDO control;
	
	@ManyToOne
	@JoinColumn(name = "SYS_ANLS_RISK_THREAT_MPP_ID")
	@Comment("系统分析风险分析块明细行（威胁）")
	public SystemAnalysisRiskThreatMappingDO getRiskThreatMapping() {
		return riskThreatMapping;
	}
	
	public void setRiskThreatMapping(SystemAnalysisRiskThreatMappingDO riskThreatMapping) {
		this.riskThreatMapping = riskThreatMapping;
	}
	
	@ManyToOne
	@JoinColumn(name = "SYS_ANLS_RISK_ERR_MPP_ID")
	@Comment("系统分析风险分析块明细行（差错）")
	public SystemAnalysisRiskErrorMappingDO getRiskErrorMapping() {
		return riskErrorMapping;
	}
	
	public void setRiskErrorMapping(SystemAnalysisRiskErrorMappingDO riskErrorMapping) {
		this.riskErrorMapping = riskErrorMapping;
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
	
}
