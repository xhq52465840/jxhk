package com.usky.sms.audit.plan;

import org.hibernate.cfg.Comment;
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
import com.usky.sms.user.UserDO;

/**
 * 审计计划工作单表
 * 
 * @author zheng.xl
 *
 */
@Entity
@Table(name = "A_PLAN")
@Comment("审计计划")
public class PlanDO extends AbstractBaseDO implements IDisplayable {

	private static final long serialVersionUID = -2884888981134732891L;

	/** 审计计划类型:SYS公司级;SUB2分子公司二级;SUB3部门三级;TERM航站审计;SPOT现场审计;OC运控;SPEC专项审计; */
	private String planType;

	/** 检查类型(现场检查和专项检查使用，区分系统级和分子公司级) */
	private String checkType;

	/** 审计年份 */
	private Integer year;

	/** 流程状态名称:草拟,一级审批,完成 */
	private String flowStatus;

	/** 流程节点:0,1,2...节点;done完成 */
	private String flowStep;

	/** 流程处理人 */
	private Set<PlanFlowUserDO> flowUsers;

	/** 状态:Y有效 */
	private String status;

	/** 审计工作单表 */
	private Set<TaskDO> tasks;

	/** 创建人 */
	private UserDO creator;

	/** 修改人 */
	private UserDO lastUpdater;

	/** 流程实例ID */
	private String flowId;

	/** 计划名称 */
	private String planName;

	/** 审计实施主体:安监总部、分子公司、3级部门... */
	private String operator;
	
	/** 计划的时间段 (逗号隔开，在专项检查中使用)*/
	private String planTime;

	@Column(name = "PLAN_TYPE", length = 32)
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

	@Column(name = "YEAR")
	@Comment("审计年份")
	public Integer getYear() {
		return year;
	}

	public void setYear(Integer year) {
		this.year = year;
	}

	@Column(name = "FLOW_STATUS", length = 32)
	@Comment("流程状态名称:草拟,一级审批,完成")
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

	@OneToMany(mappedBy = "plan")
	@Comment("流程处理人")
	public Set<PlanFlowUserDO> getFlowUsers() {
		return flowUsers;
	}

	public void setFlowUsers(Set<PlanFlowUserDO> flowUsers) {
		this.flowUsers = flowUsers;
	}

	@Column(name = "STATUS", length = 1)
	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	@OneToMany(mappedBy = "plan")
	@Comment("审计工作单表")
	public Set<TaskDO> getTasks() {
		return tasks;
	}

	public void setTasks(Set<TaskDO> tasks) {
		this.tasks = tasks;
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

	@Column(name = "PLAN_NAME", length = 256)
	@Comment("计划名称")
	public String getPlanName() {
		return planName;
	}

	public void setPlanName(String planName) {
		this.planName = planName;
	}

	@Column(name = "OPERATOR", length = 64)
	@Comment("审计实施主体:安监总部、分子公司、3级部门...")
	public String getOperator() {
		return operator;
	}

	public void setOperator(String operator) {
		this.operator = operator;
	}

	@Column(name = "PLAN_TIME", length = 256)
	@Comment("计划的时间段 (逗号隔开，在专项检查中使用)")
	public String getPlanTime() {
		return planTime;
	}

	public void setPlanTime(String planTime) {
		this.planTime = planTime;
	}

	@Transient
	@Override
	public String getDisplayName() {
		return planName;
	}

}
