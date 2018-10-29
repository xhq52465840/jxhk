
package com.usky.sms.risk.systemanalysis;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.tem.error.ErrorDO;

@Entity
@Table(name = "T_SYS_ANLS_RISK_ERR_MPP")
@Comment("系统分析风险分析块明细行（差错）")
public class SystemAnalysisRiskErrorMappingDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 4734893921742801397L;
	
	/** 系统分析风险分析块 */
	private SystemAnalysisRiskAnalysisDO riskAnalysis;
	
	/** 差错 */
	private ErrorDO error;
	
	/** 分析描述 */
	private String text;
	
	/** 风险等级P */
	private Integer riskLevelP;
	
	/** 风险等级S */
	private Integer riskLevelS;
	
	@ManyToOne
	@JoinColumn(name = "SYS_ANLS_RISK_ANLS_ID")
	@Comment("系统分析风险分析块")
	public SystemAnalysisRiskAnalysisDO getRiskAnalysis() {
		return riskAnalysis;
	}
	
	public void setRiskAnalysis(SystemAnalysisRiskAnalysisDO riskAnalysis) {
		this.riskAnalysis = riskAnalysis;
	}
	
	@ManyToOne
	@JoinColumn(name = "ERROR_ID")
	@Comment("差错")
	public ErrorDO getError() {
		return error;
	}
	
	public void setError(ErrorDO error) {
		this.error = error;
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
