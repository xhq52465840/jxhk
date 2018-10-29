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

import com.usky.sms.audit.base.ItemDO;
import com.usky.sms.audit.improve.ImproveDO;
import com.usky.sms.audit.task.TaskDO;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "A_CHECK_LIST")
@Comment("检查单列表")
public class CheckListDO extends AbstractBaseDO {

	private static final long serialVersionUID = -6204096032481466752L;

	/** 检查单 */
	private CheckDO check;

	/** 工作单 */
	private TaskDO task;

	/** 整改单 */
	private ImproveDO improve;

	/** 备注 */
	private String remark;

	/** 检查单 */
	private ItemDO item;

	/** 审计专业 */
	private DictionaryDO itemProfession;

	/** 审计要点 */
	private String itemPoint;

	/** 审计依据 */
	private String itemAccording;

	/** 审计提示 */
	private String itemPrompt;

	/** 检查项分值 */
	private Integer itemValue;

	/** 附件 */
	private String auditFiles;

	/** 存放整改反馈记录上传的签批件的ID(以逗号隔开) */
	private String improveItemFiles;

	/** 审计记录 */
	private String auditRecord;

	/** 审计结论 */
	private DictionaryDO auditResult;

	/**审计结论权重 */
	private DictionaryDO auditWeight;

	/**检查单分值 */
	private Integer auditValue;

	/** 整改完成日期 */
	private Date improveDate;

	/** 整改期限 */
	private Date improveLastDate;

	/** 检查单 */
	private String improveUnit;

	/** 整改额外责任单位 */
	private String improveUnit2;

	/** 航站责任单位 */
	private String termResponsibilityUnit;

	/** 整改说明原因 */
	private String improveReason;

	/** 整改措施 */
	private String improveMeasure;

	/** 整改审核 */
	private String improveCheck;

	/** 整改完成情况 */
	private String improveRemark;

	/** 分配建议 */
	private String confirmRemark;

	/** 验证情况 */
	private String verification;

	/** 验证人 */
	private String confirmMan;

	/** 验证期限 */
	private Date confirmLastDate;

	/** 验证日期 */
	private Date confirmDate;

	/** 验证结论 */
	private String confirmResult;

	/** 状态 */
	private String status;

	/** 创建人 */
	private UserDO creator;

	/** 更新人 */
	private UserDO lastUpdater;

	/** 整改项状态:0:整改下发;1:整改转发;2:措施制定;3:预案上报;4:预案通过;5:预案拒绝;6:暂时无法完成;7:整改完成 */
	private Integer improveItemStatus;

	/** 整改当前处理人 */
	private Set<ImproveItemUserDO> improveItemUsers;
	
	/** 跟踪状态：1:完成验证;2:未按时完成验证：3：暂时无法完成 */
	private String traceItemStatus;

	/**4:完成情况，5:整改完成，6:已指派，7:通过*/
	private String traceFlowStatus;

	/** 审计总结 */
	private String auditSummary;

	/** 整改责任人 */
	private String improveResponsiblePerson;

	/** 审核意见 */
	private String auditOpinion;

	/** 原因类型 */
	private String auditReasonId;

	@ManyToOne
	@JoinColumn(name = "CHECK_ID")
	@Comment("检查单")
	public CheckDO getCheck() {
		return check;
	}

	public void setCheck(CheckDO check) {
		this.check = check;
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

	@ManyToOne
	@JoinColumn(name = "IMPROVE_ID")
	@Comment("整改单")
	public ImproveDO getImprove() {
		return improve;
	}

	public void setImprove(ImproveDO improve) {
		this.improve = improve;
	}

	@Column(length = 4000)
	@Comment("备注")
	public String getRemark() {
		return remark;
	}

	public void setRemark(String remark) {
		this.remark = remark;
	}

	@ManyToOne
	@JoinColumn(name = "ITEM_ID")
	@Comment("检查单")
	public ItemDO getItem() {
		return item;
	}

	public void setItem(ItemDO item) {
		this.item = item;
	}

	@ManyToOne
	@JoinColumn(name = "item_profession")
	@Comment("审计专业")
	public DictionaryDO getItemProfession() {
		return itemProfession;
	}

	public void setItemProfession(DictionaryDO itemProfession) {
		this.itemProfession = itemProfession;
	}

	@Column(name = "item_point", length = 4000)
	@Comment("审计要点")
	public String getItemPoint() {
		return itemPoint;
	}

	public void setItemPoint(String itemPoint) {
		this.itemPoint = itemPoint;
	}

	@Column(name = "item_according", length = 4000)
	@Comment("审计依据")
	public String getItemAccording() {
		return itemAccording;
	}

	public void setItemAccording(String itemAccording) {
		this.itemAccording = itemAccording;
	}

	@Column(name = "item_prompt", length = 4000)
	@Comment("审计提示")
	public String getItemPrompt() {
		return itemPrompt;
	}

	public void setItemPrompt(String itemPrompt) {
		this.itemPrompt = itemPrompt;
	}

	@Column
	@Comment("检查项分值")
	public Integer getItemValue() {
		return itemValue;
	}

	public void setItemValue(Integer itemValue) {
		this.itemValue = itemValue;
	}

	@Column(name = "audit_files", length = 1024)
	@Comment("附件")
	public String getAuditFiles() {
		return auditFiles;
	}

	public void setAuditFiles(String auditFiles) {
		this.auditFiles = auditFiles;
	}

	@Column(name = "IMPROVE_ITEM_FILES", length = 1024)
	@Comment("存放整改反馈记录上传的签批件的ID(以逗号隔开)")
	public String getImproveItemFiles() {
		return improveItemFiles;
	}

	public void setImproveItemFiles(String improveItemFiles) {
		this.improveItemFiles = improveItemFiles;
	}

	@Column(name = "audit_record", length = 4000)
	@Comment("审计记录")
	public String getAuditRecord() {
		return auditRecord;
	}

	public void setAuditRecord(String auditRecord) {
		this.auditRecord = auditRecord;
	}

	@ManyToOne
	@JoinColumn(name = "audit_result")
	@Comment("审计结论")
	public DictionaryDO getAuditResult() {
		return auditResult;
	}

	public void setAuditResult(DictionaryDO auditResult) {
		this.auditResult = auditResult;
	}

	@ManyToOne
	@JoinColumn(name = "audit_weight")
	@Comment("审计结论权重")
	public DictionaryDO getAuditWeight() {
		return auditWeight;
	}

	public void setAuditWeight(DictionaryDO auditWeight) {
		this.auditWeight = auditWeight;
	}

	@Column
	@Comment("检查单分值")
	public Integer getAuditValue() {
		return auditValue;
	}

	public void setAuditValue(Integer auditValue) {
		this.auditValue = auditValue;
	}

	@Column(name = "improve_date", columnDefinition = "DATE")
	@Comment("整改完成日期")
	public Date getImproveDate() {
		return improveDate;
	}

	public void setImproveDate(Date improveDate) {
		this.improveDate = improveDate;
	}

	@Column(name = "improve_lastdate", columnDefinition = "DATE")
	@Comment("整改期限")
	public Date getImproveLastDate() {
		return improveLastDate;
	}

	public void setImproveLastDate(Date improveLastDate) {
		this.improveLastDate = improveLastDate;
	}

	@Column(name = "improve_unit", length = 20)
	@Comment("检查单")
	public String getImproveUnit() {
		return improveUnit;
	}

	public void setImproveUnit(String improveUnit) {
		this.improveUnit = improveUnit;
	}

	@Column(name = "improve_unit2", length = 20)
	@Comment("整改额外责任单位")
	public String getImproveUnit2() {
		return improveUnit2;
	}

	public void setImproveUnit2(String improveUnit2) {
		this.improveUnit2 = improveUnit2;
	}

	@Column(name = "term_responsibility_unit", length = 100)
	@Comment("航站责任单位")
	public String getTermResponsibilityUnit() {
		return termResponsibilityUnit;
	}

	public void setTermResponsibilityUnit(String termResponsibilityUnit) {
		this.termResponsibilityUnit = termResponsibilityUnit;
	}

	@Column(name = "improve_reason", length = 4000)
	@Comment("整改说明原因")
	public String getImproveReason() {
		return improveReason;
	}

	public void setImproveReason(String improveReason) {
		this.improveReason = improveReason;
	}

	@Column(name = "improve_measure", length = 4000)
	@Comment("整改措施")
	public String getImproveMeasure() {
		return improveMeasure;
	}

	public void setImproveMeasure(String improveMeasure) {
		this.improveMeasure = improveMeasure;
	}

	@Column(name = "improve_check", length = 4000)
	@Comment("整改审核")
	public String getImproveCheck() {
		return improveCheck;
	}

	public void setImproveCheck(String improveCheck) {
		this.improveCheck = improveCheck;
	}

	@Column(name = "improve_remark", length = 4000)
	@Comment("整改完成情况")
	public String getImproveRemark() {
		return improveRemark;
	}

	public void setImproveRemark(String improveRemark) {
		this.improveRemark = improveRemark;
	}

	@Column(name = "confirm_remark", length = 4000)
	@Comment("分配建议")
	public String getConfirmRemark() {
		return confirmRemark;
	}

	public void setConfirmRemark(String confirmRemark) {
		this.confirmRemark = confirmRemark;
	}

	@Column(length = 4000)
	@Comment("验证情况")
	public String getVerification() {
		return verification;
	}

	public void setVerification(String verification) {
		this.verification = verification;
	}

	@Column(name = "confirm_man", length = 256)
	@Comment("验证人")
	public String getConfirmMan() {
		return confirmMan;
	}

	public void setConfirmMan(String confirmMan) {
		this.confirmMan = confirmMan;
	}

	@Column(name = "confirm_lastdate", columnDefinition = "DATE")
	@Comment("验证期限")
	public Date getConfirmLastDate() {
		return confirmLastDate;
	}

	public void setConfirmLastDate(Date confirmLastDate) {
		this.confirmLastDate = confirmLastDate;
	}

	@Column(name = "confirm_date", columnDefinition = "DATE")
	@Comment("验证日期")
	public Date getConfirmDate() {
		return confirmDate;
	}

	public void setConfirmDate(Date confirmDate) {
		this.confirmDate = confirmDate;
	}

	@Column(name = "confirm_result", length = 128)
	@Comment("验证结论")
	public String getConfirmResult() {
		return confirmResult;
	}

	public void setConfirmResult(String confirmResult) {
		this.confirmResult = confirmResult;
	}

	@Column(length = 1)
	@Comment("状态")
	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
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

	@Column(name = "IMPROVE_ITEM_STATUS")
	@Comment("整改项状态:0:整改下发;1:整改转发;2:措施制定;3:预案上报;4:预案通过;5:预案拒绝;6:暂时无法完成;7:整改完成")
	public Integer getImproveItemStatus() {
		return improveItemStatus;
	}

	public void setImproveItemStatus(Integer improveItemStatus) {
		this.improveItemStatus = improveItemStatus;
	}

	@OneToMany(mappedBy = "checkList")
	@Comment("整改当前处理人")
	public Set<ImproveItemUserDO> getImproveItemUsers() {
		return improveItemUsers;
	}

	public void setImproveItemUsers(Set<ImproveItemUserDO> improveItemUsers) {
		this.improveItemUsers = improveItemUsers;
	}

	@Column(length = 10)
	@Comment("跟踪状态：1:完成验证;2:未按时完成验证：3：暂时无法完成")
	public String getTraceItemStatus() {
		return traceItemStatus;
	}

	public void setTraceItemStatus(String traceItemStatus) {
		this.traceItemStatus = traceItemStatus;
	}

	@Column(length = 10)
	@Comment("4:完成情况，5:整改完成，6:已指派，7:通过")
	public String getTraceFlowStatus() {
		return traceFlowStatus;
	}

	public void setTraceFlowStatus(String traceFlowStatus) {
		this.traceFlowStatus = traceFlowStatus;
	}

	@Column(length = 4000)
	@Comment("审计总结")
	public String getAuditSummary() {
		return auditSummary;
	}

	public void setAuditSummary(String auditSummary) {
		this.auditSummary = auditSummary;
	}

	@Column(name = "IMPROVE_RESPONSIBLE_PERSON", length = 128)
	@Comment("整改责任人")
	public String getImproveResponsiblePerson() {
		return improveResponsiblePerson;
	}

	public void setImproveResponsiblePerson(String improveResponsiblePerson) {
		this.improveResponsiblePerson = improveResponsiblePerson;
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
	@Comment("原因类型")
	public String getAuditReasonId() {
		return auditReasonId;
	}

	public void setAuditReasonId(String auditReasonId) {
		this.auditReasonId = auditReasonId;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (null == obj) {
			return false;
		}
		if (!(obj instanceof CheckListDO)) {
			return false;
		}
		final CheckListDO checkList = (CheckListDO) obj;
		if (this.getId().equals(checkList.getId())) {
			return true;
		}
		return false;
	}

	@Override
	public int hashCode() {
		return this.getId().hashCode();
	}

}
