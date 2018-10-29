
package com.usky.sms.risk;
import org.hibernate.cfg.Comment;

import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "T_RISK_ANALYSIS")
@Comment("风险分析块")
public class RiskAnalysisDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 4508951179289249329L;
	
	/** 风险分析 */
	private RiskDO risk;
	
	/** 系统分类 */
	private DictionaryDO system;
	
	/** 风险分析块明细行（威胁） */
	private List<RiskThreatMappingDO> threats;
	
	/** 风险分析块明细行（差错） */
	private List<RiskErrorMappingDO> errors;
	
	/** 创建人 */
	private UserDO creator;
	
	/** 状态(草稿、已提交) */
	private String status;
	
	@ManyToOne
	@JoinColumn(name = "RISK_ID")
	@Comment("风险分析")
	public RiskDO getRisk() {
		return risk;
	}
	
	public void setRisk(RiskDO risk) {
		this.risk = risk;
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
	
	@OneToMany(mappedBy = "analysis")
	@Comment("风险分析块明细行（威胁）")
	public List<RiskThreatMappingDO> getThreats() {
		return threats;
	}
	
	public void setThreats(List<RiskThreatMappingDO> threats) {
		this.threats = threats;
	}
	
	@OneToMany(mappedBy = "analysis")
	@Comment("风险分析块明细行（差错）")
	public List<RiskErrorMappingDO> getErrors() {
		return errors;
	}
	
	public void setErrors(List<RiskErrorMappingDO> errors) {
		this.errors = errors;
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
	
	@Column(length = 10)
	@Comment("状态(草稿、已提交)")
	public String getStatus() {
		return status;
	}
	
	public void setStatus(String status) {
		this.status = status;
	}
	
}
