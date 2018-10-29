
package com.usky.sms.tem;
import java.util.Date;
import java.util.List;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import org.hibernate.cfg.Comment;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.eventanalysis.EventAnalysisDO;
import com.usky.sms.organization.OrganizationDO;
import com.usky.sms.risk.ClauseDO;
import com.usky.sms.risk.systemanalysis.SystemAnalysisClauseDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "T_ACTION_ITEM")
@Comment("行动项")
public class ActionItemDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -9097376918180542478L;
	
	/** 控制措施 */
	private ControlMeasureDO measure;
	
	/** 条款 */
	private ClauseDO clause;
	
	/** 对应的事件分析 */
	private EventAnalysisDO eventAnalysis;
	
	/** 对应的系统分析手册条款 */
	private SystemAnalysisClauseDO systemAnalysisClause;
	
	/** 内容 */
	private String description;
	
	/** 验证日期 */
	private Date confirmDate;
	
	/** 验证到期日 */
	private Date confirmDeadLine;
	
	/** 验证意见 */
	private String confirmComment;
	
	/** 处理人 */
	private Set<UserDO> processors;
	
	/** 验证人 */
	private Set<UserDO> confirmMan;
	
	/** 审核人 */
	private Set<UserDO> auditor;
	
	/** 审核意见 */
	private String auditComment;
	
	/** 审核日期 */
	private Date auditDate;
	
	/** 审核期限 */
	private Date auditDeadLine;
	
	/** 责任单位 */
	private List<OrganizationDO> organizations;
	
	/** 状态 */
	private String status;
	
	/** 完成(执行)情况 */
	private String completionStatus;
	
	/** 完成(执行)日期 */
	private Date completionDate;
	
	/** 完成(执行)期限 */
	private Date completionDeadLine;
	
	/** 下发日期 */
	private Date distributeDate;
	
	@ManyToOne
	@JoinColumn(name = "MEASURE_ID")
	@Comment("控制措施")
	public ControlMeasureDO getMeasure() {
		return measure;
	}
	
	public void setMeasure(ControlMeasureDO measure) {
		this.measure = measure;
	}
	
	@ManyToOne
	@JoinColumn(name = "CLAUSE_ID")
	@Comment("条款")
	public ClauseDO getClause() {
		return clause;
	}
	
	public void setClause(ClauseDO clause) {
		this.clause = clause;
	}
	
	@ManyToOne
	@JoinColumn(name = "SYSTEM_ANALYSIS_CLAUSE_ID")
	@Comment("对应的系统分析手册条款条款")
	public SystemAnalysisClauseDO getSystemAnalysisClause() {
		return systemAnalysisClause;
	}
	
	public void setSystemAnalysisClause(SystemAnalysisClauseDO systemAnalysisClause) {
		this.systemAnalysisClause = systemAnalysisClause;
	}
	
	@ManyToOne
	@JoinColumn(name = "EVENT_ANALYSIS_ID")
	@Comment("对应的事件分析")
	public EventAnalysisDO getEventAnalysis() {
		return eventAnalysis;
	}

	public void setEventAnalysis(EventAnalysisDO eventAnalysis) {
		this.eventAnalysis = eventAnalysis;
	}

	@Column(length = 4000)
	@Comment("内容")
	public String getDescription() {
		return description;
	}
	
	public void setDescription(String description) {
		this.description = description;
	}
	
	@Column(name = "CONFIRM_DATE", columnDefinition = "DATE")
	@Temporal(TemporalType.DATE)
	@Comment("验证日期")
	public Date getConfirmDate() {
		return confirmDate;
	}
	
	public void setConfirmDate(Date confirmDate) {
		this.confirmDate = confirmDate;
	}

	@ManyToMany
	@JoinTable(name = "T_AITEM_PROCESSOR", joinColumns = @JoinColumn(name = "AITEM_ID"), inverseJoinColumns = @JoinColumn(name = "PROCESSOR_ID"))
	@Comment("处理人")
	public Set<UserDO> getProcessors() {
		return processors;
	}

	public void setProcessors(Set<UserDO> processors) {
		this.processors = processors;
	}

	@ManyToMany
	@JoinTable(name = "T_AITEM_CONFIRMAN", joinColumns = @JoinColumn(name = "AITEM_ID"), inverseJoinColumns = @JoinColumn(name = "CONFIRM_MAN_ID"))
	@Comment("验证人")
	public Set<UserDO> getConfirmMan() {
		return confirmMan;
	}

	public void setConfirmMan(Set<UserDO> confirmMan) {
		this.confirmMan = confirmMan;
	}

	@ManyToMany
	@JoinTable(name = "T_AITEM_AUDITOR", joinColumns = @JoinColumn(name = "AITEM_ID"), inverseJoinColumns = @JoinColumn(name = "AUDITOR_ID"))
	@Comment("审核人")
	public Set<UserDO> getAuditor() {
		return auditor;
	}

	public void setAuditor(Set<UserDO> auditor) {
		this.auditor = auditor;
	}

	@Column(name = "AUDIT_COMMENT")
	@Comment("审核意见")
	public String getAuditComment() {
		return auditComment;
	}

	public void setAuditComment(String auditComment) {
		this.auditComment = auditComment;
	}

	@ManyToMany
	@JoinTable(name = "T_AITEM_ORGANIZATION", joinColumns = @JoinColumn(name = "AITEM_ID"), inverseJoinColumns = @JoinColumn(name = "ORGANIZATION_ID"))
	@Comment("责任单位")
	public List<OrganizationDO> getOrganizations() {
		return organizations;
	}
	
	public void setOrganizations(List<OrganizationDO> organizations) {
		this.organizations = organizations;
	}
	
	@Column(length = 10)
	@Comment("状态")
	public String getStatus() {
		return status;
	}
	
	public void setStatus(String status) {
		this.status = status;
	}

	@Column(name = "COMPLETION_STATUS", length = 4000)
	@Comment("完成(执行)情况")
	public String getCompletionStatus() {
		return completionStatus;
	}

	public void setCompletionStatus(String completionStatus) {
		this.completionStatus = completionStatus;
	}

	@Column(name = "COMPLETION_DATE", columnDefinition = "DATE")
	@Temporal(TemporalType.TIMESTAMP)
	@Comment("完成(执行)日期")
	public Date getCompletionDate() {
		return completionDate;
	}

	public void setCompletionDate(Date completionDate) {
		this.completionDate = completionDate;
	}

	@Column(name = "DISTRIBUTE_DATE", columnDefinition = "DATE")
	@Temporal(TemporalType.TIMESTAMP)
	@Comment("下发日期")
	public Date getDistributeDate() {
		return distributeDate;
	}

	public void setDistributeDate(Date distributeDate) {
		this.distributeDate = distributeDate;
	}

	@Column(name = "AUDIT_DATE", columnDefinition = "DATE")
	@Temporal(TemporalType.TIMESTAMP)
	@Comment("审核日期")
	public Date getAuditDate() {
		return auditDate;
	}

	public void setAuditDate(Date auditDate) {
		this.auditDate = auditDate;
	}

	@Column(name = "AUDIT_DEAD_LINE", columnDefinition = "DATE")
	@Temporal(TemporalType.TIMESTAMP)
	@Comment("审核期限")
	public Date getAuditDeadLine() {
		return auditDeadLine;
	}

	public void setAuditDeadLine(Date auditDeadLine) {
		this.auditDeadLine = auditDeadLine;
	}

	@Column(name = "COMPLETION_DEAD_LINE", columnDefinition = "DATE")
	@Temporal(TemporalType.TIMESTAMP)
	@Comment("完成(执行)期限")
	public Date getCompletionDeadLine() {
		return completionDeadLine;
	}

	public void setCompletionDeadLine(Date completionDeadLine) {
		this.completionDeadLine = completionDeadLine;
	}

	@Column(name = "CONFIRM_DEAD_LINE", columnDefinition = "DATE")
	@Temporal(TemporalType.TIMESTAMP)
	@Comment("验证到期日")
	public Date getConfirmDeadLine() {
		return confirmDeadLine;
	}
	
	public void setConfirmDeadLine(Date confirmDeadLine) {
		this.confirmDeadLine = confirmDeadLine;
	}

	@Column(name = "CONFIRM_COMMENT")
	@Comment("验证意见")
	public String getConfirmComment() {
		return confirmComment;
	}

	public void setConfirmComment(String confirmComment) {
		this.confirmComment = confirmComment;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (null == obj) {
			return false;
		}
		if (!(obj instanceof ActionItemDO)) {
			return false;
		}
		final ActionItemDO act = (ActionItemDO) obj;
		if (this.getId().equals(act.getId())) {
			return true;
		}
		return false;
	}

	@Override
	public int hashCode() {
		return this.getId().hashCode();
	}
}
