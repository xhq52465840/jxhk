package com.usky.sms.audit.check;

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

import com.usky.sms.audit.task.TaskDO;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "A_CHECK")
@Comment("检查单")
public class CheckDO extends AbstractBaseDO implements IDisplayable {

	private static final long serialVersionUID = -1947723208905613569L;

	/** 工作单 */
	private TaskDO task;

	/** 专业 */
	private DictionaryDO checkType;

	/** 检查单名称 */
	private String checkName;

	/** 检查单编号 */
	private String checkNo;

	/** 审计开始日期 */
	private Date startDate;

	/** 审计结束日期 */
	private Date endDate;

	/** 审计对象 */
	private String target;

	/** 审计地点 */
	private String address;

	/** 审计组员 */
	private String member;

	/** 备注 */
	private String remark;

	/** 备注2 */
	private String remark2;

	/** 状态 */
	private String status;
	
	/** 工作流 */
	private String flowId;

	/** 流程状态名称 */
	private String flowStatus;

	/** 流程节点 */
	private String flowStep;

	/** 流程处理人 */
	private Set<CheckFlowUserDO> flowUsers;

	/** 创建人 */
	private UserDO creator;

	/** 更新人 */
	private UserDO lastUpdater;

	/** 反馈记录 */
	private String record;

	/** 检查小结 */
	private String result;

	/** 检查单 */
	private Set<CheckListDO> checkLists;

	/** 检查单提交人 */
	private String commitUser;

	@ManyToOne
	@JoinColumn(name = "TASK_ID")
	@Comment("工作单")
	public TaskDO getTask() {
		return task;
	}

	public void setTask(TaskDO task) {
		this.task = task;
	}

	@ManyToOne
	@JoinColumn(name = "check_type")
	@Comment("专业")
	public DictionaryDO getCheckType() {
		return checkType;
	}

	public void setCheckType(DictionaryDO checkType) {
		this.checkType = checkType;
	}

	@Column(name = "check_name", length = 64)
	@Comment("检查单名称")
	public String getCheckName() {
		return checkName;
	}

	public void setCheckName(String checkName) {
		this.checkName = checkName;
	}

	@Column(name = "check_no", length = 64)
	@Comment("检查单编号")
	public String getCheckNo() {
		return checkNo;
	}

	public void setCheckNo(String checkNo) {
		this.checkNo = checkNo;
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
	@Comment("审计结束日期")
	public Date getEndDate() {
		return endDate;
	}

	public void setEndDate(Date endDate) {
		this.endDate = endDate;
	}

	@Column(length = 32)
	@Comment("审计对象")
	public String getTarget() {
		return target;
	}

	public void setTarget(String target) {
		this.target = target;
	}

	@Column(length = 512)
	@Comment("审计地点")
	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	@Column(length = 256)
	@Comment("审计组员")
	public String getMember() {
		return member;
	}

	public void setMember(String member) {
		this.member = member;
	}

	@Column(length = 4000)
	@Comment("备注")
	public String getRemark() {
		return remark;
	}

	public void setRemark(String remark) {
		this.remark = remark;
	}

	@Column(length = 4000)
	@Comment("备注2")
	public String getRemark2() {
		return remark2;
	}

	public void setRemark2(String remark2) {
		this.remark2 = remark2;
	}

	@Column(length = 1)
	@Comment("状态")
	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	@Column(name = "flow_id", length = 32)
	@Comment("工作流")
	public String getFlowId() {
		return flowId;
	}

	public void setFlowId(String flowId) {
		this.flowId = flowId;
	}

	@Column(name = "flow_status", length = 32)
	@Comment("流程状态名称")
	public String getFlowStatus() {
		return flowStatus;
	}

	public void setFlowStatus(String flowStatus) {
		this.flowStatus = flowStatus;
	}

	@Column(name = "flow_step", length = 32)
	@Comment("流程节点")
	public String getFlowStep() {
		return flowStep;
	}

	public void setFlowStep(String flowStep) {
		this.flowStep = flowStep;
	}

	@OneToMany(mappedBy = "check")
	@Comment("流程处理人")
	public Set<CheckFlowUserDO> getFlowUsers() {
		return flowUsers;
	}

	public void setFlowUsers(Set<CheckFlowUserDO> flowUsers) {
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

	@Column(length = 4000)
	@Comment("反馈记录")
	public String getRecord() {
		return record;
	}

	public void setRecord(String record) {
		this.record = record;
	}

	@Column(length = 4000)
	@Comment("检查小结")
	public String getResult() {
		return result;
	}

	public void setResult(String result) {
		this.result = result;
	}

	@OneToMany(mappedBy = "check")
	@Comment("检查单")
	public Set<CheckListDO> getCheckLists() {
		return checkLists;
	}

	public void setCheckLists(Set<CheckListDO> checkLists) {
		this.checkLists = checkLists;
	}

	@Column(name = "COMMIT_USER", length = 50)
	@Comment("检查单提交人")
	public String getCommitUser() {
		return commitUser;
	}

	public void setCommitUser(String commitUser) {
		this.commitUser = commitUser;
	}

	@Transient
	@Override
	public String getDisplayName() {
		return checkName;
	}

}
