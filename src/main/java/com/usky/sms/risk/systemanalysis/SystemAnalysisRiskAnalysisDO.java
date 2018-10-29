
package com.usky.sms.risk.systemanalysis;
import java.util.List;

import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import org.hibernate.cfg.Comment;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "T_SYS_ANLS_RISK_ANLS")
@Comment("系统分析风险分析块")
public class SystemAnalysisRiskAnalysisDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 4508951179289249329L;
	
	/** 安全信息 */
	private ActivityDO activity;
	
	/** 系统分类 */
	private DictionaryDO system;
	
	/** 系统分析风险分析块明细行（威胁） */
	private List<SystemAnalysisRiskThreatMappingDO> riskThreatMappings;
	
	/** 系统分析风险分析块明细行（差错） */
	private List<SystemAnalysisRiskErrorMappingDO> riskErrorMappings;
	
	/** 创建人 */
	private UserDO creator;
	
	/** 最后更新人 */
	private UserDO lastUpdater;
	
	@ManyToOne
	@JoinColumn(name = "ACTIVITY_ID")
	@Comment("安全信息")
	public ActivityDO getActivity() {
		return activity;
	}
	
	public void setActivity(ActivityDO activity) {
		this.activity = activity;
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
	
	@OneToMany(mappedBy = "riskAnalysis")
	@Comment("风险分析块明细行（威胁）")
	public List<SystemAnalysisRiskThreatMappingDO> getRiskThreatMappings() {
		return riskThreatMappings;
	}
	
	public void setRiskThreatMappings(List<SystemAnalysisRiskThreatMappingDO> riskThreatMappings) {
		this.riskThreatMappings = riskThreatMappings;
	}
	
	@OneToMany(mappedBy = "riskAnalysis")
	@Comment("风险分析块明细行（差错）")
	public List<SystemAnalysisRiskErrorMappingDO> getRiskErrorMappings() {
		return riskErrorMappings;
	}
	
	public void setRiskErrorMappings(List<SystemAnalysisRiskErrorMappingDO> riskErrorMappings) {
		this.riskErrorMappings = riskErrorMappings;
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
