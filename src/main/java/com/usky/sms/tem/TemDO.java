
package com.usky.sms.tem;
import org.hibernate.cfg.Comment;

import java.util.Set;

import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.tem.consequence.ConsequenceDO;
import com.usky.sms.tem.insecurity.InsecurityDO;
import com.usky.sms.tem.severity.ProvisionDO;
import com.usky.sms.tem.severity.SeverityDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "T_TEM")
@Comment("tem分析块")
public class TemDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 8366788630514894325L;
	
	/** 严重程度 */
	private SeverityDO severity;
	
	/** 严重程度条款 */
	private ProvisionDO provision;
	
	/** 不安全状态 */
	private InsecurityDO insecurity;
	
	/** 重大风险 */
	private ConsequenceDO consequence;
	
	/** 威胁 */
	private Set<ThreatMappingDO> threats;
	
	/** 主要威胁 */
	private ThreatMappingDO primaryThreat;
	
	/** 差错 */
	private Set<ErrorMappingDO> errors;
	
	/** 主要差错 */
	private ErrorMappingDO primaryError;
	
	/** 安全信息 */
	private ActivityDO activity;
	
	/** 系统分类 */
	private DictionaryDO sysType;
	
	/** 创建人 */
	private UserDO creator;
	
	@ManyToOne
	@JoinColumn(name = "SEVERITY_ID")
	@Comment("严重程度")
	public SeverityDO getSeverity() {
		return severity;
	}
	
	public void setSeverity(SeverityDO severity) {
		this.severity = severity;
	}
	
	@ManyToOne
	@JoinColumn(name = "PROVISION_ID")
	@Comment("严重程度条款")
	public ProvisionDO getProvision() {
		return provision;
	}
	
	public void setProvision(ProvisionDO provision) {
		this.provision = provision;
	}
	
	@ManyToOne
	@JoinColumn(name = "INSECURITY_ID")
	@Comment("不安全状态")
	public InsecurityDO getInsecurity() {
		return insecurity;
	}
	
	public void setInsecurity(InsecurityDO insecurity) {
		this.insecurity = insecurity;
	}
	
	@ManyToOne
	@JoinColumn(name = "CONSEQUENCE_ID")
	@Comment("重大风险")
	public ConsequenceDO getConsequence() {
		return consequence;
	}
	
	public void setConsequence(ConsequenceDO consequence) {
		this.consequence = consequence;
	}
	
	@OneToMany(mappedBy = "tem")
	@Comment("威胁")
	public Set<ThreatMappingDO> getThreats() {
		return threats;
	}
	
	public void setThreats(Set<ThreatMappingDO> threats) {
		this.threats = threats;
	}
	
	@OneToOne
	@JoinColumn(name = "primary_threat")
	@Comment("主要威胁")
	public ThreatMappingDO getPrimaryThreat() {
		return primaryThreat;
	}
	
	public void setPrimaryThreat(ThreatMappingDO primaryThreat) {
		this.primaryThreat = primaryThreat;
	}
	
	@OneToMany(mappedBy = "tem")
	@Comment("差错")
	public Set<ErrorMappingDO> getErrors() {
		return errors;
	}
	
	public void setErrors(Set<ErrorMappingDO> errors) {
		this.errors = errors;
	}
	
	@OneToOne
	@JoinColumn(name = "primary_error")
	@Comment("主要差错")
	public ErrorMappingDO getPrimaryError() {
		return primaryError;
	}
	
	public void setPrimaryError(ErrorMappingDO primaryError) {
		this.primaryError = primaryError;
	}
	
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
	@JoinColumn(name="sys_type")
	@Comment("系统分类")
	public DictionaryDO getSysType() {
		return sysType;
	}

	public void setSysType(DictionaryDO sysType) {
		this.sysType = sysType;
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
	
}
