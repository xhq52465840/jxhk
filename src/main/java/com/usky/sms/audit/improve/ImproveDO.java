package com.usky.sms.audit.improve;

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

import com.usky.sms.audit.check.CheckListDO;
import com.usky.sms.audit.task.TaskDO;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "A_IMPROVE")
@Comment("整改单")
public class ImproveDO extends AbstractBaseDO implements IDisplayable {

	private static final long serialVersionUID = 6928282042918236398L;

	/** 整改来源:AUDIT审计;BUREAU局方;SAFA;INT国际;COMPANY公司;OTHER其它 */
	private String source; // 

	/** 工作单 */
	private TaskDO task;

	/** 整改编号 */
	private String improveNo; // 

	/** 整改名称 */
	private String improveName; // 

	/** 审计实施主体:安监总部、分子公司、3级部门... */
	private String operator;

	/** 审计对象key:安监机构、分子公司部门、三级部、航站、现场... */
	private String target;

	/**  审计开始日期 */
	private Date startDate;

	/** 工作单结束日期 */
	private Date endDate;

	/** 地址 */
	private String address;

	/** 经办人 */
	private Set<TransactorDO> transactor;

	/** 经办人电话 */
	private String transactorTel;

	/** 整改联系人*/
	private String improver;

	/** 整改联系人电话 */
	private String improverTel;

	/** 备注 */
	private String remark;

	/** 附件IDs:在t_file表中的ID,json格式 */
	private String files;

	/** 状态 */
	private String status;

	/** 流程实例 */
	private String flowId;

	/** 流程状态名称:草拟,一级审批,完成 */
	private String flowStatus;

	/** 流程节点:0,1,2...节点;done完成 */
	private String flowStep;

	/** 流程处理人 */
	private Set<ImproveFlowUserDO> flowUsers;

	/** 创建人 */
	private UserDO creator;

	/** 更新人 */
	private UserDO lastUpdater;

	/** 检查单 */
	private Set<CheckListDO> checkLists;

	/** 跟踪表名称 */
	private String traceName;

	/** 跟踪表编号 */
	private String traceNo;
	
	/** 检查日期 */
	private Date checkDate;
	
	/** 整改时限 */
	private Date improveDeadLine;
	
	/** 回复期限 */
	private Date replyDeadLine;
	
	/** 审计组员(生成整改单时从checkLists对应的check的commitUser的汇总(去重，以逗号隔开)) */
	private String member;

	/** 生成跟踪表时间 */
	private Date generateTraceDate;
	
	/** 责任单位 */
	private String improveUnit;

	@Column(length = 256)
	@Comment("整改来源:AUDIT审计;BUREAU局方;SAFA;INT国际;COMPANY公司;OTHER其它")
	public String getSource() {
		return source;
	}

	public void setSource(String source) {
		this.source = source;
	}

	@ManyToOne
	@JoinColumn(name = "TASK_ID")
	@Comment("工作单")
	public TaskDO getTask() {
		return task;
	}

	public void setTask(TaskDO task) {
		this.task = task;
	}

	@Column(length = 256)
	@Comment("整改编号")
	public String getImproveNo() {
		return improveNo;
	}

	public void setImproveNo(String improveNo) {
		this.improveNo = improveNo;
	}

	@Column(length = 256)
	@Comment("整改名称")
	public String getImproveName() {
		return improveName;
	}

	public void setImproveName(String improveName) {
		this.improveName = improveName;
	}

	@Column(length = 64)
	@Comment("审计实施主体:安监总部、分子公司、3级部门...")
	public String getOperator() {
		return operator;
	}

	public void setOperator(String operator) {
		this.operator = operator;
	}

	@Column(length = 64)
	@Comment("审计对象key:安监机构、分子公司部门、三级部、航站、现场...")
	public String getTarget() {
		return target;
	}

	public void setTarget(String target) {
		this.target = target;
	}

	@Column(name = "start_date", columnDefinition = "DATE")
	@Comment("审计开始日期")
	public Date getStartDate() {
		return startDate;
	}

	public void setStartDate(Date startDate) {
		this.startDate = startDate;
	}

	@Column(name = "end_date", columnDefinition = "DATE")
	@Comment("工作单结束日期")
	public Date getEndDate() {
		return endDate;
	}

	public void setEndDate(Date endDate) {
		this.endDate = endDate;
	}

	@Column(length = 512)
	@Comment("地址")
	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	@OneToMany(mappedBy = "improve")
	@Comment("经办人")
	public Set<TransactorDO> getTransactor() {
		return transactor;
	}

	public void setTransactor(Set<TransactorDO> transactor) {
		this.transactor = transactor;
	}

	@Column(name = "TTEL", length = 64)
	@Comment("经办人电话")
	public String getTransactorTel() {
		return transactorTel;
	}

	public void setTransactorTel(String transactorTel) {
		this.transactorTel = transactorTel;
	}

	@Column(length = 64)
	@Comment("整改联系人")
	public String getImprover() {
		return improver;
	}

	public void setImprover(String improver) {
		this.improver = improver;
	}

	@Column(name = "ITEL", length = 64)
	@Comment("整改联系人电话")
	public String getImproverTel() {
		return improverTel;
	}

	public void setImproverTel(String improverTel) {
		this.improverTel = improverTel;
	}

	@Column(length = 4000)
	@Comment("备注")
	public String getRemark() {
		return remark;
	}

	public void setRemark(String remark) {
		this.remark = remark;
	}

	@Column(length = 1024)
	@Comment("附件IDs:在t_file表中的ID,json格式")
	public String getFiles() {
		return files;
	}

	public void setFiles(String files) {
		this.files = files;
	}

	@Column(length = 1)
	@Comment("状态")
	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	@Column(length = 32)
	@Comment("流程实例")
	public String getFlowId() {
		return flowId;
	}

	public void setFlowId(String flowId) {
		this.flowId = flowId;
	}

	@Column(length = 32)
	@Comment("流程状态名称:草拟,一级审批,完成")
	public String getFlowStatus() {
		return flowStatus;
	}

	public void setFlowStatus(String flowStatus) {
		this.flowStatus = flowStatus;
	}

	@Column(length = 32)
	@Comment("流程节点:0,1,2...节点;done完成")
	public String getFlowStep() {
		return flowStep;
	}

	public void setFlowStep(String flowStep) {
		this.flowStep = flowStep;
	}

	@OneToMany(mappedBy = "improve")
	@Comment("流程处理人")
	public Set<ImproveFlowUserDO> getFlowUsers() {
		return flowUsers;
	}

	public void setFlowUsers(Set<ImproveFlowUserDO> flowUsers) {
		this.flowUsers = flowUsers;
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

	@OneToMany(mappedBy = "improve")
	@Comment("检查单")
	public Set<CheckListDO> getCheckLists() {
		return checkLists;
	}

	public void setCheckLists(Set<CheckListDO> checkLists) {
		this.checkLists = checkLists;
	}

	@Column(length = 255)
	@Comment("跟踪表名称")
	public String getTraceName() {
		return traceName;
	}

	public void setTraceName(String traceName) {
		this.traceName = traceName;
	}

	@Column(length = 255)
	@Comment("跟踪表编号")
	public String getTraceNo() {
		return traceNo;
	}

	public void setTraceNo(String traceNo) {
		this.traceNo = traceNo;
	}

	@Column(name = "CHECK_DATE", columnDefinition = "DATE")
	@Comment("检查日期")
	public Date getCheckDate() {
		return checkDate;
	}

	public void setCheckDate(Date checkDate) {
		this.checkDate = checkDate;
	}

	@Column(name = "IMPROVE_DEAD_LINE", columnDefinition = "DATE")
	@Comment("整改时限")
	public Date getImproveDeadLine() {
		return improveDeadLine;
	}

	public void setImproveDeadLine(Date improveDeadLine) {
		this.improveDeadLine = improveDeadLine;
	}

	@Column(name = "REPLY_DEAD_LINE", columnDefinition = "DATE")
	@Comment("回复期限")
	public Date getReplyDeadLine() {
		return replyDeadLine;
	}

	public void setReplyDeadLine(Date replyDeadLine) {
		this.replyDeadLine = replyDeadLine;
	}

	@Column(name = "MEMBER", length = 2560)
	@Comment("审计组员(生成整改单时从checkLists对应的check的commitUser的汇总(去重，以逗号隔开))")
	public String getMember() {
		return member;
	}

	public void setMember(String member) {
		this.member = member;
	}

	@Column(name = "GENERATE_TRACE_DATE", columnDefinition = "DATE")
	@Comment("生成跟踪表时间")
	public Date getGenerateTraceDate() {
		return generateTraceDate;
	}

	public void setGenerateTraceDate(Date generateTraceDate) {
		this.generateTraceDate = generateTraceDate;
	}

	@Column(name = "IMPROVE_UNIT", length = 20)
	@Comment("责任单位")
	public String getImproveUnit() {
		return improveUnit;
	}

	public void setImproveUnit(String improveUnit) {
		this.improveUnit = improveUnit;
	}

	@Transient
	@Override
	public String getDisplayName() {
		return improveName;
	}

}
