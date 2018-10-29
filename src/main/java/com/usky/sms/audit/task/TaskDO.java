package com.usky.sms.audit.task;

import org.hibernate.cfg.Comment;
import java.util.Date;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.audit.plan.PlanDO;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;
import com.usky.sms.user.UserDO;

/**
 * 审计工作单表
 * 
 * @author zheng.xl
 *
 */
@Entity
@Table(name = "A_TASK")
@Comment("审计工作单")
public class TaskDO extends AbstractBaseDO implements IDisplayable {

	private static final long serialVersionUID = -6743176891873471639L;

	/** 审计计划 */
	private PlanDO plan;

	/** 审计计划类型:SYS公司级;SUB2分子公司二级;SUB3部门三级;TERM航站审计;SPOT现场审计;OC运控;SPEC专项审计; */
	private String planType;

	/** 检查类型(现场检查和专项检查使用，区分系统级和分子公司级) */
	private String checkType;

	/** 审计实施主体:安监总部、分子公司、3级部门... */
	private String operator;

	/** 审计对象key:安监机构、分子公司部门、三级部、航站、现场... */
	private String target;

	/** 审计年份 */
	private Integer year;

	/** 审计计划时间:201501或2015或2015第一季度 */
	private String planTime;

	/** 审计开始日期 */
	private Date startDate;

	/** 审计结束日期 */
	private Date endDate;

	/** 工作单名称 */
	private String workName;

	/** 工作单编号,如:2014HOA-001 */
	private String workNo;

	/** 审计地点 */
	private String address;

	/** 审计方式 */
	private String method;

	/** 审计标准 */
	private String standard;

	/** 审计组长（名称）,只是个头衔,不起作用 */
	private String teamLeader;

	/** 项目主管 */
	private Set<MasterDO> managers;

	/** 审计组员:用户名称,用JSON格式可存多人 */
	private String member;

	/** 备注 */
	private String remark;

	/** 流程状态名称:草拟,一级审批,完成 */
	private String flowStatus;

	/** 流程节点:0,1,2...节点;done完成 */
	private String flowStep;

	/** 流程处理人 */
	private Set<TaskFlowUserDO> flowUsers;

	/** 状态:Y有效 */
	private String status;

	/** 创建人 */
	private UserDO creator;

	/** 修改人 */
	private UserDO lastUpdater;

	/** 流程实例ID */
	private String flowId;

	/** 审计报告名称 */
	private String reportName;

	/** 经办人联系方式 */
	private String contact;

	/** 审计报告备注 */
	private String reportRemark;

	/** 审计签批件:可以有多个附件 */
	private String reportFiles;

	/** 生成审计报告时间 */
	private Date generateReportDate;
	
	/** 结案时间 */
	private Date closeDate;

	/** 审计报告概述 */
	private String auditReportSummary;

	/** 检查报告经办人(使用现场检查和专项检查) */
	private String auditReportTransactor;
	/** 拒绝理由，专为航站用 **/
	private String reject;
	/** 审计结论，专为航站用 **/
	private String termResult;
	
	/** 下发整改单的时间 */
	private Date distributeDate;

	@ManyToOne
	@JoinColumn(name = "PLAN_ID")
	@Comment("审计计划")
	public PlanDO getPlan() {
		return plan;
	}

	public void setPlan(PlanDO plan) {
		this.plan = plan;
	}

	@Column(name = "PLAN_TYPE", length = 12)
	@Comment("审计计划类型:SYS公司级;SUB2分子公司二级;SUB3部门三级;TERM航站审计;SPOT现场审计;OC运控;SPEC专项审计;")
	public String getPlanType() {
		return planType;
	}

	public void setPlanType(String planType) {
		this.planType = planType;
	}

	@Column(name = "CHECK_TYPE", length = 32)
	@Comment("检查类型(现场检查和专项检查使用，区分系统级和分子公司级)")
	public String getCheckType() {
		return checkType;
	}

	public void setCheckType(String checkType) {
		this.checkType = checkType;
	}

	@Column(name = "OPERATOR", length = 64)
	@Comment("审计实施主体:安监总部、分子公司、3级部门...")
	public String getOperator() {
		return operator;
	}

	public void setOperator(String operator) {
		this.operator = operator;
	}

	@Column(name = "TARGET", length = 64)
	@Comment("审计对象key:安监机构、分子公司部门、三级部、航站、现场...")
	public String getTarget() {
		return target;
	}

	public void setTarget(String target) {
		this.target = target;
	}

	@Column(name = "YEAR")
	@Comment("审计年份")
	public Integer getYear() {
		return year;
	}

	public void setYear(Integer year) {
		this.year = year;
	}

	@Column(name = "PLAN_TIME", length = 32)
	@Comment("审计计划时间:201501或2015或2015第一季度")
	public String getPlanTime() {
		return planTime;
	}

	public void setPlanTime(String planTime) {
		this.planTime = planTime;
	}

	@Column(name = "START_DATE", columnDefinition = "DATE")
	@Comment("审计开始日期")
	public Date getStartDate() {
		return startDate;
	}

	public void setStartDate(Date startDate) {
		this.startDate = startDate;
	}

	@Column(name = "END_DATE", columnDefinition = "DATE")
	@Comment("审计结束日期")
	public Date getEndDate() {
		return endDate;
	}

	public void setEndDate(Date endDate) {
		this.endDate = endDate;
	}

	@Column(name = "WORK_NAME", length = 256)
	@Comment("工作单名称")
	public String getWorkName() {
		return workName;
	}

	public void setWorkName(String workName) {
		this.workName = workName;
	}

	@Column(name = "WORK_NO", length = 256)
	@Comment("工作单编号,如:2014HOA-001")
	public String getWorkNo() {
		return workNo;
	}

	public void setWorkNo(String workNo) {
		this.workNo = workNo;
	}

	@Column(name = "ADDRESS", length = 512)
	@Comment("审计地点")
	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	@Column(name = "METHOD", length = 256)
	@Comment("审计方式")
	public String getMethod() {
		return method;
	}

	public void setMethod(String method) {
		this.method = method;
	}

	@Column(name = "STANDARD", length = 256)
	@Comment("审计标准")
	public String getStandard() {
		return standard;
	}

	public void setStandard(String standard) {
		this.standard = standard;
	}

	@Column(name = "TEAM_LEADER", length = 256)
	@Comment("审计组长（名称）,只是个头衔,不起作用")
	public String getTeamLeader() {
		return teamLeader;
	}

	public void setTeamLeader(String teamLeader) {
		this.teamLeader = teamLeader;
	}

	@OneToMany(mappedBy = "task")
	@Comment("项目主管")
	public Set<MasterDO> getManagers() {
		return managers;
	}

	public void setManagers(Set<MasterDO> managers) {
		this.managers = managers;
	}

	@Column(name = "MEMBER", length = 256)
	@Comment("审计组员:用户名称,用JSON格式可存多人")
	public String getMember() {
		return member;
	}

	public void setMember(String member) {
		this.member = member;
	}

	@Column(name = "REMARK", length = 4000)
	@Comment("备注")
	public String getRemark() {
		return remark;
	}

	public void setRemark(String remark) {
		this.remark = remark;
	}

	@Column(name = "FLOW_STATUS", length = 32)
	@Comment("状态:Y有效")
	public String getFlowStatus() {
		return flowStatus;
	}

	public void setFlowStatus(String flowStatus) {
		this.flowStatus = flowStatus;
	}

	@Column(name = "FLOW_STEP", length = 32)
	@Comment("流程节点:0,1,2...节点;done完成")
	public String getFlowStep() {
		return flowStep;
	}

	public void setFlowStep(String flowStep) {
		this.flowStep = flowStep;
	}

	@OneToMany(mappedBy = "task")
	@Comment("流程处理人")
	public Set<TaskFlowUserDO> getFlowUsers() {
		return flowUsers;
	}

	public void setFlowUsers(Set<TaskFlowUserDO> flowUsers) {
		this.flowUsers = flowUsers;
	}

	@Column(name = "STATUS", length = 1)
	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
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
	@Comment("修改人")
	public UserDO getLastUpdater() {
		return lastUpdater;
	}

	public void setLastUpdater(UserDO lastUpdater) {
		this.lastUpdater = lastUpdater;
	}

	@Column(name = "FLOW_ID", length = 32)
	@Comment("流程实例ID")
	public String getFlowId() {
		return flowId;
	}

	public void setFlowId(String flowId) {
		this.flowId = flowId;
	}

	@Column(name = "REPORT_NAME", length = 256)
	@Comment("审计报告名称")
	public String getReportName() {
		return reportName;
	}

	public void setReportName(String reportName) {
		this.reportName = reportName;
	}

	@Column(name = "CONTACT", length = 256)
	@Comment("经办人联系方式")
	public String getContact() {
		return contact;
	}

	public void setContact(String contact) {
		this.contact = contact;
	}

	@Column(name = "REPORT_REMARK", length = 4000)
	@Comment("审计报告备注")
	public String getReportRemark() {
		return reportRemark;
	}

	public void setReportRemark(String reportRemark) {
		this.reportRemark = reportRemark;
	}

	@Column(name = "REPORT_FILES", length = 512)
	@Comment("审计签批件:可以有多个附件")
	public String getReportFiles() {
		return reportFiles;
	}

	public void setReportFiles(String reportFiles) {
		this.reportFiles = reportFiles;
	}

	@Column(name = "GENERATE_REPORT_DATE", columnDefinition = "DATE")
	@Comment("生成审计报告时间")
	public Date getGenerateReportDate() {
		return generateReportDate;
	}

	public void setGenerateReportDate(Date generateReportDate) {
		this.generateReportDate = generateReportDate;
	}
	
	@Column(name = "CLOSE_DATE", columnDefinition = "DATE")
	@Comment("结案时间")
	public Date getCloseDate() {
		return closeDate;
	}
	
	public void setCloseDate(Date closeDate) {
		this.closeDate = closeDate;
	}

	@Column(name = "AUDIT_REPORT_SUMMARY", length = 4000)
	@Comment("审计报告概述")
	public String getAuditReportSummary() {
		return auditReportSummary;
	}

	public void setAuditReportSummary(String auditReportSummary) {
		this.auditReportSummary = auditReportSummary;
	}

	@Column(name = "AUDIT_REPORT_TRANSACTOR", length = 256)
	@Comment("检查报告经办人(使用现场检查和专项检查)")
	public String getAuditReportTransactor() {
		return auditReportTransactor;
	}

	public void setAuditReportTransactor(String auditReportTransactor) {
		this.auditReportTransactor = auditReportTransactor;
	}

	@Column(name = "REJECT", length = 1000)
	@Comment("拒绝理由，专为航站用")
	public String getReject() {
		return reject;
	}

	public void setReject(String reject) {
		this.reject = reject;
	}

	@Column(name = "TERM_RESULT", length = 1000)
	@Comment("审计结论，专为航站用")
	public String getTermResult() {
		return termResult;
	}

	public void setTermResult(String termResult) {
		this.termResult = termResult;
	}

	@Column(name = "DISTRIBUTE_DATE", columnDefinition = "DATE")
	@Comment("下发整改单的时间")
	public Date getDistributeDate() {
		return distributeDate;
	}

	public void setDistributeDate(Date distributeDate) {
		this.distributeDate = distributeDate;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (null == obj) {
			return false;
		}
		if (!(obj instanceof TaskDO)) {
			return false;
		}
		final TaskDO task = (TaskDO) obj;
		if (this.getId().equals(task.getId())) {
			return true;
		}
		return false;
	}

	@Override
	public int hashCode() {
		return this.getId().hashCode();
	}

	@Transient
	@Override
	public String getDisplayName() {
		return workName;
	}

}
