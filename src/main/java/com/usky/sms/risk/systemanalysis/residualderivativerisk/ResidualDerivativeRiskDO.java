package com.usky.sms.risk.systemanalysis.residualderivativerisk;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import org.hibernate.cfg.Comment;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "T_RESIDUAL_DERIVATIVE_RISK")
@Comment("剩余衍生风险")
public class ResidualDerivativeRiskDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -9082256999635197135L;
	
	/** 系统分析风险分析ID */
	private Integer systemAnalysisRiskAnalysisId;
	
	/** 系统分类 */
	private DictionaryDO system;
	
	/** 剩余风险分析块明细行（威胁） */
	private List<ResidualRiskThreatMappingDO> residualRiskThreatMappings;
	
	/** 剩余风险分析块明细行（差错） */
	private List<ResidualRiskErrorMappingDO> residualRiskErrorMappings;
	
	/** 创建人 */
	private UserDO creator;
	
	/** 最后更新人 */
	private UserDO lastUpdater;
	
	@Column(name = "SYS_ANLS_RISK_ANLS_ID")
	public Integer getSystemAnalysisRiskAnalysisId() {
		return systemAnalysisRiskAnalysisId;
	}

	public void setSystemAnalysisRiskAnalysisId(Integer systemAnalysisRiskAnalysisId) {
		this.systemAnalysisRiskAnalysisId = systemAnalysisRiskAnalysisId;
	}

	@ManyToOne
	@JoinColumn(name = "SYSTEM_ID")
	@Comment("系统分类")
	public DictionaryDO getSystem() {
		return system;
	}
	
	public void setSystem(DictionaryDO system) {
		this.system = system;
	}
	
	@OneToMany(mappedBy = "residualDerivativeRisk")
	@Comment("剩余风险分析块明细行（威胁）")
	public List<ResidualRiskThreatMappingDO> getResidualRiskThreatMappings() {
		return residualRiskThreatMappings;
	}
	
	public void setResidualRiskThreatMappings(List<ResidualRiskThreatMappingDO> residualRiskThreatMappings) {
		this.residualRiskThreatMappings = residualRiskThreatMappings;
	}
	
	@OneToMany(mappedBy = "residualDerivativeRisk")
	@Comment("剩余风险分析块明细行（差错）")
	public List<ResidualRiskErrorMappingDO> getResidualRiskErrorMappings() {
		return residualRiskErrorMappings;
	}
	
	public void setResidualRiskErrorMappings(List<ResidualRiskErrorMappingDO> residualRiskErrorMappings) {
		this.residualRiskErrorMappings = residualRiskErrorMappings;
	}
	
	@ManyToOne
	@JoinColumn(name = "CREATOR_ID")
	@Comment("创建人")
	public UserDO getCreator() {
		return creator;
	}
	
	public void setCreator(UserDO creator) {
		this.creator = creator;
	}

	@ManyToOne
	@JoinColumn(name = "LAST_UPDATER_ID")
	@Comment("最后更新人")
	public UserDO getLastUpdater() {
		return lastUpdater;
	}

	public void setLastUpdater(UserDO lastUpdater) {
		this.lastUpdater = lastUpdater;
	}
	
}
