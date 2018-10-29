package com.usky.sms.audit.improvenotice;

import org.hibernate.cfg.Comment;
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
 * 整改通知单子单
 * @author zheng.xl
 *
 */
@Entity
@Table(name = "A_SUB_IMPROVE_NOTICE")
@Comment("整改通知单子单")
public class SubImproveNoticeDO extends AbstractBaseDO implements IDisplayable {

	private static final long serialVersionUID = 6928282042918236398L;

	/** 所属整改通知单 */
	private ImproveNoticeDO improveNotice;
	
	/** 执行单位(安监机构的ID) */
//	private String operator;

	/** 负责单位（以逗号隔开，UT代表unit的ID，DP代表组织的ID） */
	private String improveUnit;
	
	/** 问题列表 */
	private Set<ImproveNoticeIssueDO> improveNoticeIssues;

	/** 负责人 */
	private String executive;
	
	/** 负责人联系方式 */
	private String executiveTel;

	/** 流程状态名称:草拟,一级审批,完成*/
	private String flowStatus;
	
	/** 流程节点:0,1,2...节点;done完成*/
	private String flowStep;

	/** 流程实例ID */
	private String flowId;
	
	/** 流程处理人*/
	private Set<SubImproveNoticeFlowUserDO> flowUsers;

	/** 创建人 */
	private UserDO creator;

	/** 更新人 */
	private UserDO lastUpdater;
	
	/** 状态(结案) */
	private String status;

	@ManyToOne
	@JoinColumn(name = "IMPROVE_NOTICE_ID")
	@Comment("所属整改通知单")
	public ImproveNoticeDO getImproveNotice() {
		return improveNotice;
	}

	public void setImproveNotice(ImproveNoticeDO improveNotice) {
		this.improveNotice = improveNotice;
	}

//	@Column(name = "OPERATOR", length = 64)
//	@Comment("@Comment('@Comment('@Comment('private String operator;')')')")
//	public String getOperator() {
//		return operator;
//	}
//
//	public void setOperator(String operator) {
//		this.operator = operator;
//	}

	@Column(name = "IMPROVE_UNIT", length = 50)
	@Comment("负责单位（以逗号隔开，UT代表unit的ID，DP代表组织的ID）")
	public String getImproveUnit() {
		return improveUnit;
	}

	public void setImproveUnit(String improveUnit) {
		this.improveUnit = improveUnit;
	}


	@OneToMany(mappedBy = "subImproveNotice")
	@Comment("问题列表")
	public Set<ImproveNoticeIssueDO> getImproveNoticeIssues() {
		return improveNoticeIssues;
	}

	public void setImproveNoticeIssues(Set<ImproveNoticeIssueDO> improveNoticeIssues) {
		this.improveNoticeIssues = improveNoticeIssues;
	}

	@Column(name = "EXECUTIVE")
	@Comment("负责人")
	public String getExecutive() {
		return executive;
	}

	public void setExecutive(String executive) {
		this.executive = executive;
	}

	@Column(name = "EXECUTIVE_TEL")
	@Comment("负责人联系方式")
	public String getExecutiveTel() {
		return executiveTel;
	}

	public void setExecutiveTel(String executiveTel) {
		this.executiveTel = executiveTel;
	}

	@Column(name="FLOW_STATUS", length=32)
	@Comment("流程状态名称:草拟,一级审批,完成")
	public String getFlowStatus() {
		return flowStatus;
	}

	public void setFlowStatus(String flowStatus) {
		this.flowStatus = flowStatus;
	}

	@Column(name="FLOW_STEP", length=32)
	@Comment("流程节点:0,1,2...节点;done完成")
	public String getFlowStep() {
		return flowStep;
	}

	public void setFlowStep(String flowStep) {
		this.flowStep = flowStep;
	}

	@Column(name="FLOW_ID", length=32)
	@Comment("流程实例ID")
	public String getFlowId() {
		return flowId;
	}

	public void setFlowId(String flowId) {
		this.flowId = flowId;
	}

	@OneToMany(mappedBy = "subImproveNotice")
	@Comment("流程处理人")
	public Set<SubImproveNoticeFlowUserDO> getFlowUsers() {
		return flowUsers;
	}

	public void setFlowUsers(Set<SubImproveNoticeFlowUserDO> flowUsers) {
		this.flowUsers = flowUsers;
	}

	@ManyToOne
	@JoinColumn(name="CREATOR")
	@Comment("创建人")
	public UserDO getCreator() {
		return creator;
	}

	public void setCreator(UserDO creator) {
		this.creator = creator;
	}

	@ManyToOne
	@JoinColumn(name="LAST_UPDATER")
	@Comment("更新人")
	public UserDO getLastUpdater() {
		return lastUpdater;
	}

	public void setLastUpdater(UserDO lastUpdater) {
		this.lastUpdater = lastUpdater;
	}
	
	@Column(name = "STATUS", length = 50)
	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}
	
	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (null == obj) {
			return false;
		}
		if (!(obj instanceof SubImproveNoticeDO)) {
			return false;
		}
		final SubImproveNoticeDO subImproveNotice = (SubImproveNoticeDO) obj;
		if (this.getId().equals(subImproveNotice.getId())) {
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
		return "整改通知单" + (improveNotice.getImproveNoticeNo() == null ? "" : improveNotice.getImproveNoticeNo());
	}

}
