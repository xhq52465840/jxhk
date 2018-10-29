package com.usky.sms.audit.improvenotice;

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

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;
import com.usky.sms.user.UserDO;

/**
 * 整改通知单
 * @author zheng.xl
 *
 */
@Entity
@Table(name = "A_IMPROVE_NOTICE")
@Comment("整改通知单")
public class ImproveNoticeDO extends AbstractBaseDO implements IDisplayable {

	private static final long serialVersionUID = 6928282042918236398L;

	/** 整改来源:BUREAU局方;SAFA;INT国际;COMPANY公司;OTHER其它 */
	private String source;
	
	/** 系统级(SYS),分子公司级(SUB2) */
	private String improveNoticeType;

	/** 整改通知单编号 */
	private String improveNoticeNo;
	
	/** 整改通知单来源编号 */
	private String improveNoticeSourceNo;

	/** 审计地点, 检查地点 */
	private String address;

	/** 说明 */
	private String description;
	
	/** 执行单位(安监机构的ID) */
	private String operator;

	/** 负责单位（以逗号隔开，UT代表unit的ID，DP代表组织的ID） */
//	private String improveUnit;
	
	/** 状态(下发，未下发，结案) */
	private String status;
	
	/** 检查组成员 */
	private String checkGroupMembers;

	/** 附件IDs:在t_file表中的ID,json格式 */
	private String files;

	/** 创建人 */
	private UserDO creator;

	/** 更新人 */
	private UserDO lastUpdater;

	/** 问题列表 */
	private Set<ImproveNoticeIssueDO> improveNoticeIssues;

	/** 跟踪表名称 */
	private String traceName;

	/** 跟踪表编号 */
	private String traceNo;
	
	/** 检查开始日期 */
	private Date checkStartDate;
	
	/** 检查结束日期 */
	private Date checkEndDate;
	
	/** 回复期限 */
	private Date replyDeadLine;
	
	/** 整改通知单经办人 */
	private String improveNoticeTransactor;
	
	/** 整改通知单经办人联系方式 */
	private String improveNoticeTransactorTel;
	
	/** 负责人(数据库里没有保存数据) */
//	private String executive;
	
	/** 负责人联系方式(数据库里没有保存数据) */
//	private String executiveTel;
	
	/** 工作单的id(适用从工作单生成的整改通知单) */
	private Integer taskId;
	
	/** 工作单编号(适用从工作单生成的整改通知单) */
	private String workNo;
	
	/** 处理人*/
	private Set<ImproveNoticeFlowUserDO> flowUsers;
	
	/** 审核意见 */
	private String auditOpinion;
	
	/** 下发整改通知单子单的时间 */
	private Date distributeDate;

	@Column(name = "SOURCE", length = 256)
	@Comment("整改来源:BUREAU局方;SAFA;INT国际;COMPANY公司;OTHER其它")
	public String getSource() {
		return source;
	}

	public void setSource(String source) {
		this.source = source;
	}

	@Column(name = "IMPROVE_NOTICE_NO", length = 256)
	@Comment("整改通知单编号")
	public String getImproveNoticeNo() {
		return improveNoticeNo;
	}

	public void setImproveNoticeNo(String improveNoticeNo) {
		this.improveNoticeNo = improveNoticeNo;
	}
	
	@Column(name = "IMPROVE_NOTICE_SOURCE_NO", length = 256)
	@Comment("整改通知单来源编号")
	public String getImproveNoticeSourceNo() {
		return improveNoticeSourceNo;
	}

	public void setImproveNoticeSourceNo(String improveNoticeSourceNo) {
		this.improveNoticeSourceNo = improveNoticeSourceNo;
	}

	@Column(name = "IMPROVE_NOTICE_TYPE", length = 50)
	@Comment("系统级(SYS),分子公司级(SUB2)")
	public String getImproveNoticeType() {
		return improveNoticeType;
	}
	
	public void setImproveNoticeType(String improveNoticeType) {
		this.improveNoticeType = improveNoticeType;
	}

	@Column(name = "ADDRESS", length = 512)
	@Comment("审计地点, 检查地点")
	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	@Column(name = "DESCRIPTION", length = 4000)
	@Comment("说明")
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	@Column(name = "OPERATOR", length = 64)
	@Comment("执行单位(安监机构的ID)")
	public String getOperator() {
		return operator;
	}

	public void setOperator(String operator) {
		this.operator = operator;
	}

//	@Column(name = "IMPROVE_UNIT", length = 50)
//	@Comment("private String improveUnit;")
//	public String getImproveUnit() {
//		return improveUnit;
//	}
//
//	public void setImproveUnit(String improveUnit) {
//		this.improveUnit = improveUnit;
//	}

	@Column(name = "STATUS", length = 50)
	@Comment("状态(下发，未下发，结案)")
	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	@Column(name = "CHECK_GROUP_MEMBERS", length = 512)
	@Comment("检查组成员")
	public String getCheckGroupMembers() {
		return checkGroupMembers;
	}

	public void setCheckGroupMembers(String checkGroupMembers) {
		this.checkGroupMembers = checkGroupMembers;
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
	@JoinColumn(name = "CREATOR_ID")
	@Comment("创建人")
	public UserDO getCreator() {
		return creator;
	}

	public void setCreator(UserDO creator) {
		this.creator = creator;
	}

	@ManyToOne
	@JoinColumn(name = "LASTUPDATER_ID")
	@Comment("更新人")
	public UserDO getLastUpdater() {
		return lastUpdater;
	}

	public void setLastUpdater(UserDO lastUpdater) {
		this.lastUpdater = lastUpdater;
	}

	@OneToMany(mappedBy = "improveNotice")
	@Comment("问题列表")
	public Set<ImproveNoticeIssueDO> getImproveNoticeIssues() {
		return improveNoticeIssues;
	}

	public void setImproveNoticeIssues(Set<ImproveNoticeIssueDO> improveNoticeIssues) {
		this.improveNoticeIssues = improveNoticeIssues;
	}

	@Column(name = "TRACE_NAME", length = 255)
	@Comment("跟踪表名称")
	public String getTraceName() {
		return traceName;
	}

	public void setTraceName(String traceName) {
		this.traceName = traceName;
	}

	@Column(name = "TRACE_NO", length = 255)
	@Comment("跟踪表编号")
	public String getTraceNo() {
		return traceNo;
	}

	public void setTraceNo(String traceNo) {
		this.traceNo = traceNo;
	}

	@Column(name = "CHECK_START_DATE", columnDefinition = "DATE")
	@Comment("检查开始日期")
	public Date getCheckStartDate() {
		return checkStartDate;
	}

	public void setCheckStartDate(Date checkStartDate) {
		this.checkStartDate = checkStartDate;
	}
	
	@Column(name = "CHECK_END_DATE", columnDefinition = "DATE")
	@Comment("检查结束日期")
	public Date getCheckEndDate() {
		return checkEndDate;
	}
	
	public void setCheckEndDate(Date checkEndDate) {
		this.checkEndDate = checkEndDate;
	}

	@Column(name = "REPLY_DEAD_LINE", columnDefinition = "DATE")
	@Comment("回复期限")
	public Date getReplyDeadLine() {
		return replyDeadLine;
	}

	public void setReplyDeadLine(Date replyDeadLine) {
		this.replyDeadLine = replyDeadLine;
	}

	@Column(name = "IMPROVE_NOTICE_TRANSACTOR", length = 255)
	@Comment("整改通知单经办人")
	public String getImproveNoticeTransactor() {
		return improveNoticeTransactor;
	}

	public void setImproveNoticeTransactor(String improveNoticeTransactor) {
		this.improveNoticeTransactor = improveNoticeTransactor;
	}

	@Column(name = "IMPROVE_NOTICE_TRANSACTOR_TEL")
	@Comment("整改通知单经办人联系方式")
	public String getImproveNoticeTransactorTel() {
		return improveNoticeTransactorTel;
	}

	public void setImproveNoticeTransactorTel(String improveNoticeTransactorTel) {
		this.improveNoticeTransactorTel = improveNoticeTransactorTel;
	}

//	@Column(name = "EXECUTIVE")
//	@Comment("private String executive;")
//	public String getExecutive() {
//		return executive;
//	}
//
//	public void setExecutive(String executive) {
//		this.executive = executive;
//	}

//	@Column(name = "EXECUTIVE_TEL")
//	@Comment("private String executiveTel;")
//	public String getExecutiveTel() {
//		return executiveTel;
//	}
//
//	public void setExecutiveTel(String executiveTel) {
//		this.executiveTel = executiveTel;
//	}

	@Column(name = "TASK_ID")
	@Comment("工作单的id(适用从工作单生成的整改通知单)")
	public Integer getTaskId() {
		return taskId;
	}

	public void setTaskId(Integer taskId) {
		this.taskId = taskId;
	}

	@Column(name = "WORK_NO", length = 256)
	@Comment("工作单编号(适用从工作单生成的整改通知单)")
	public String getWorkNo() {
		return workNo;
	}

	public void setWorkNo(String workNo) {
		this.workNo = workNo;
	}

	@OneToMany(mappedBy = "improveNotice")
	@Comment("处理人")
	public Set<ImproveNoticeFlowUserDO> getFlowUsers() {
		return flowUsers;
	}

	public void setFlowUsers(Set<ImproveNoticeFlowUserDO> flowUsers) {
		this.flowUsers = flowUsers;
	}

	@Column(name = "AUDIT_OPINION", length = 256)
	@Comment("审核意见")
	public String getAuditOpinion() {
		return auditOpinion;
	}

	public void setAuditOpinion(String auditOpinion) {
		this.auditOpinion = auditOpinion;
	}

	@Column(name = "DISTRIBUTE_DATE", columnDefinition = "DATE")
	@Comment("下发整改通知单子单的时间")
	public Date getDistributeDate() {
		return distributeDate;
	}

	public void setDistributeDate(Date distributeDate) {
		this.distributeDate = distributeDate;
	}

	@Transient
	@Override
	public String getDisplayName() {
		return "整改通知单" + (improveNoticeNo == null ? "" : improveNoticeNo);
	}

}
