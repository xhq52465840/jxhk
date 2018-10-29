package com.usky.sms.audit.improvenotice;

import org.hibernate.cfg.Comment;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.user.UserDO;

/**
 * 整改通知单问题列表
 * 
 * @author zheng.xl
 *
 */
@Entity
@Table(name = "A_IMPROVE_NOTICE_ISSUE")
/** 整改通知单问题列表 */
public class ImproveNoticeIssueDO extends AbstractBaseDO implements
		IDisplayable {

	private static final long serialVersionUID = 6928282042918236398L;

	/** 整改通知单 */
	private ImproveNoticeDO improveNotice;

	/** 整改通知单子单 */
	private SubImproveNoticeDO subImproveNotice;

	/** 问题编号 */
	// private Integer issueNo;

	/** 问题内容 */
	private String issueContent;

	/** 预计完成时间 */
	private Date expectedCompletedDate;

	/** 整改期限 */
	private Date improveDeadLine;

	/** 负责单位（以逗号隔开，UT代表unit的ID，DP代表组织的ID） */
	private String improveUnit;

	/** 整改说明原因 */
	private String improveReason;

	/** 整改措施 */
	private String improveMeasure;

	/** 状态(审核通过，审核拒绝) */
	private String status;

	/** 完成日期 */
	private Date completionDate;

	/** 完成情况 */
	private String completionStatus;

	/** 验证建议 */
	private String confirmSuggestion;

	/** 验证人 */
	private String confirmMan;

	/** 验证时间 */
	private Date confirmDate;

	/** 验证期限 */
	private Date confirmDeadLine;

	/** 审计总结 */
	private String auditSummary;

	/**
	 * 备用字段
	 */
	private String traceItemStatus;

	/**
	 * COMFIRM_PASSED("验证通过")，COMFIRM_UN_PASSED("验证未通过"),
	 * COMFIRM_UN_COMPLETED_TEMPORARILY("暂时无法完成")
	 */
	private String traceFlowStatus;

	/** 附件IDs:在t_file表中的ID,json格式 */
	private String files;

	/** 创建人 */
	private UserDO creator;

	/** 更新人 */
	private UserDO lastUpdater;

	/** 检查单编号(适用从工作单生成的整改通知单) */
	private Integer checkListId;

	/** 审核意见 */
	private String auditOpinion;

	/** 原因类型 */
	private String auditReasonId; // 原因类型的id
	
	/** 专业 */
	private DictionaryDO profession;

	@ManyToOne
	@JoinColumn(name = "IMPROVE_NOTICE_ID")
	@Comment("整改通知单")
	public ImproveNoticeDO getImproveNotice() {
		return improveNotice;
	}

	public void setImproveNotice(ImproveNoticeDO improveNotice) {
		this.improveNotice = improveNotice;
	}

	@ManyToOne
	@JoinColumn(name = "SUB_IMPROVE_NOTICE_ID")
	@Comment("整改通知单子单")
	public SubImproveNoticeDO getSubImproveNotice() {
		return subImproveNotice;
	}

	public void setSubImproveNotice(SubImproveNoticeDO subImproveNotice) {
		this.subImproveNotice = subImproveNotice;
	}

	// @Column(name = "ISSUE_NO")
//	@Comment("private Integer issueNo;")
	// public Integer getIssueNo() {
	// return issueNo;
	// }
	//
	// public void setIssueNo(Integer issueNo) {
	// this.issueNo = issueNo;
	// }

	@Column(name = "ISSUE_CONTENT", length = 4000)
	@Comment("问题内容")
	public String getIssueContent() {
		return issueContent;
	}

	public void setIssueContent(String issueContent) {
		this.issueContent = issueContent;
	}

	@Column(name = "EXPECTED_COMPLETED_DATE", columnDefinition = "DATE")
	@Comment("预计完成时间")
	public Date getExpectedCompletedDate() {
		return expectedCompletedDate;
	}

	public void setExpectedCompletedDate(Date expectedCompletedDate) {
		this.expectedCompletedDate = expectedCompletedDate;
	}

	@Column(name = "IMPROVE_DEAD_LINE", columnDefinition = "DATE")
	@Comment("整改期限")
	public Date getImproveDeadLine() {
		return improveDeadLine;
	}

	public void setImproveDeadLine(Date improveDeadLine) {
		this.improveDeadLine = improveDeadLine;
	}

	@Column(name = "IMPROVE_UNIT", length = 50)
	@Comment("负责单位（以逗号隔开，UT代表unit的ID，DP代表组织的ID）")
	public String getImproveUnit() {
		return improveUnit;
	}

	public void setImproveUnit(String improveUnit) {
		this.improveUnit = improveUnit;
	}

	@Column(name = "IMPROVE_REASON", length = 4000)
	@Comment("整改说明原因")
	public String getImproveReason() {
		return improveReason;
	}

	public void setImproveReason(String improveReason) {
		this.improveReason = improveReason;
	}

	@Column(name = "IMPROVE_MEASURE", length = 4000)
	@Comment("整改措施")
	public String getImproveMeasure() {
		return improveMeasure;
	}

	public void setImproveMeasure(String improveMeasure) {
		this.improveMeasure = improveMeasure;
	}

	@Column(name = "STATUS", length = 50)
	@Comment("状态(审核通过，审核拒绝)")
	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	@Column(name = "COMPLETION_DATE", columnDefinition = "DATE")
	@Comment("完成日期")
	public Date getCompletionDate() {
		return completionDate;
	}

	public void setCompletionDate(Date completionDate) {
		this.completionDate = completionDate;
	}

	@Column(name = "TRACE_ITEM_STATUS", length = 10)
	@Comment("备用字段")
	public String getTraceItemStatus() {
		return traceItemStatus;
	}

	public void setTraceItemStatus(String traceItemStatus) {
		this.traceItemStatus = traceItemStatus;
	}

	@Column(name = "COMPLETION_STATUS", length = 4000)
	@Comment("完成情况")
	public String getCompletionStatus() {
		return completionStatus;
	}

	public void setCompletionStatus(String completionStatus) {
		this.completionStatus = completionStatus;
	}

	@Column(name = "CONFIRM_SUGGESTION", length = 4000)
	@Comment("验证建议")
	public String getConfirmSuggestion() {
		return confirmSuggestion;
	}

	public void setConfirmSuggestion(String confirmSuggestion) {
		this.confirmSuggestion = confirmSuggestion;
	}

	@Column(name = "CONFIRM_MAN", length = 256)
	@Comment("验证人")
	public String getConfirmMan() {
		return confirmMan;
	}

	public void setConfirmMan(String confirmMan) {
		this.confirmMan = confirmMan;
	}

	@Column(name = "CONFIRM_DEAD_LINE", columnDefinition = "DATE")
	@Comment("验证期限")
	public Date getConfirmDeadLine() {
		return confirmDeadLine;
	}

	public void setConfirmDeadLine(Date confirmDeadLine) {
		this.confirmDeadLine = confirmDeadLine;
	}

	@Column(name = "AUDIT_SUMMARY", length = 4000)
	@Comment("审计总结")
	public String getAuditSummary() {
		return auditSummary;
	}

	public void setAuditSummary(String auditSummary) {
		this.auditSummary = auditSummary;
	}

	@Column(name = "CONFIRM_DATE", columnDefinition = "DATE")
	@Comment("验证时间")
	public Date getConfirmDate() {
		return confirmDate;
	}

	public void setConfirmDate(Date confirmDate) {
		this.confirmDate = confirmDate;
	}

	@Column(name = "TRACE_FLOW_STATUS", length = 50)
	@Comment("COMFIRM_UN_COMPLETED_TEMPORARILY('暂时无法完成')")
	public String getTraceFlowStatus() {
		return traceFlowStatus;
	}

	public void setTraceFlowStatus(String traceFlowStatus) {
		this.traceFlowStatus = traceFlowStatus;
	}

	@Column(name = "FILES", length = 1024)
	@Comment("附件IDs:在t_file表中的ID,json格式")
	public String getFiles() {
		return files;
	}

	public void setFiles(String files) {
		this.files = files;
	}

	@ManyToOne
	@JoinColumn(name = "CREATOR")
	@Comment("创建人")
	public UserDO getCreator() {
		return creator;
	}

	public void setCreator(UserDO creator) {
		this.creator = creator;
	}

	@ManyToOne
	@JoinColumn(name = "LAST_UPDATER")
	@Comment("更新人")
	public UserDO getLastUpdater() {
		return lastUpdater;
	}

	public void setLastUpdater(UserDO lastUpdater) {
		this.lastUpdater = lastUpdater;
	}

	@Column(name = "CHECK_LIST_ID")
	@Comment("检查单编号(适用从工作单生成的整改通知单)")
	public Integer getCheckListId() {
		return checkListId;
	}

	public void setCheckListId(Integer checkListId) {
		this.checkListId = checkListId;
	}

	@Column(name = "AUDIT_OPINION", length = 4000)
	@Comment("审核意见")
	public String getAuditOpinion() {
		return auditOpinion;
	}

	public void setAuditOpinion(String auditOpinion) {
		this.auditOpinion = auditOpinion;
	}

	@Column(length = 4000, name = "AUDIT_REASON_ID")
	@Comment("原因类型的id")
	public String getAuditReasonId() {
		return auditReasonId;
	}

	public void setAuditReasonId(String auditReasonId) {
		this.auditReasonId = auditReasonId;
	}

	@ManyToOne
	@JoinColumn(name = "PROFESSION")
	@Comment("专业")
	public DictionaryDO getProfession() {
		return profession;
	}

	public void setProfession(DictionaryDO profession) {
		this.profession = profession;
	}

	@Transient
	@Override
	public String getDisplayName() {
		return issueContent;
	}

}
