package com.usky.sms.flightmovementinfo.Maintenance;

import org.hibernate.cfg.Comment;
import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

/**
 * 故障保留
 */
@Entity
@Table(name = "ECMR_M_DEFERRED_DEFECT")
@Comment("QAR 故障保留")
public class DeferredDefectDO implements Serializable {

	private static final long serialVersionUID = -7356339662756930473L;

	/** 主键 */
	private Integer ddf_id;

	/** 编号 */
	private String task_code;

	/** 机型 */
	private String task_actype;

	/** 飞机编号 */
	private String tail_no;

	/** ATA章节 */
	private String chapter;

	/** 发生地点 */
	private Integer airport;

	/** 申请签字日期 */
	private Date apply_date;

	/** 申请人 */
	private String proposer;

	/** 保留类型 */
	private String ddf_type;

	/** 保留原因 */
	private Integer reasons;

	/** 故障描述/损伤情况 */
	private String info;

	/** 机务维护程序 */
	private String mechanical_work;

	/** 机组操作程序 */
	private String aircrew_work;

	/** 技术记录单号(基本) */
	private String log_no;

	/** 保留依据 */
	private String basis;

	/** 运行操作限制 */
	private String operation_limit;

	/** 备注 */
	private String remarks;

	/** 批准时间 */
	private Date approve_date;

	/** 批准人 */
	private String approver;

	/** 批准修复时限起 */
	private String limit_begin;

	/** 批准修复时限止 */
	private String limit_end;

	/** 飞行小时 */
	private String fh;

	/** 起落次数 */
	private String ld;

	/** 发动机循环次数 */
	private String eng_cycle;

	/** 维修实施单位 */
	private Integer maintain_unit;

	/** 创建人 */
	private Integer creator;

	/** 创建时间 */
	private Date create_time;

	/** 操作人 */
	private Integer operator;

	/** 最后更改时间 */
	private Date last_modify;

	/** 关闭状态 */
	private String status;

	/** 关闭日期 */
	private Date close_date;

	/** 是否有限制 */
	private String has_limit;

	/** 限制确认 */
	private String limit_confirm;

	/** 延期修复时限起 */
	private String defer_begin;

	/** 延期修复时限止 */
	private String defer_end;

	/** 延期修复批准人（适航部门批准人） */
	private String defer_approver;

	/** 延期修复批准日期 */
	private Date defer_approve_date;

	/** 关闭操作人 */
	private Integer closer;

	/** 是否需要航材 */
	private String need_material;

	/** 技术记录单号(撤销) */
	private String close_log_no;

	/** 到期日期 */
	private Date expire_date;

	/** 此项是否被转过无航材 */
	private String to_whc;

	/** 是否转PPC */
	private String to_ppc;

	/** 转PPC的操作人 */
	private Integer to_ppc_operator;

	/** 转PPC时的日期 */
	private Date to_ppc_date;

	/** 关闭的单据批准人，非关闭操作人 */
	private String closeby;

	/** 取消原因 */
	private String cancel_reason;

	/** xx */
	private Date sys_close_date;

	/** xx */
	private Integer sys_closer;

	/** 是否审核 */
	private String check_flag;

	/** 检查时间 */
	private Date check_date;

	/** 审核人 */
	private Integer check_user;

	/** 是否跟踪00=否，01=是 */
	private String mntr_flag;

	/** 跟踪内容 */
	private String mntr_content;

	/** 跟踪备注 */
	private String mntr_note;

	/** 是否延期 */
	private String defer_flag;

	/** #N/A */
	private Date sys_defer_date;

	/** 注销地点 */
	private Integer cancel_place;

	/** 营运人 */
	private Integer airway_id;

	/** YES/NO */
	private String aoc;

	/** 审批意见 */
	private String reason;

	/** 申请人ID */
	private Integer proposer_id;

	/** 批准人ID */
	private Integer approver_id;

	/** 更新日期 */
	private Date update_date;

	@Id
	@Column
	@Comment("主键")
	public Integer getDdf_id() {
		return ddf_id;
	}

	public void setDdf_id(Integer ddf_id) {
		this.ddf_id = ddf_id;
	}

	@Column(length = 50)
	@Comment("编号")
	public String getTask_code() {
		return task_code;
	}

	public void setTask_code(String task_code) {
		this.task_code = task_code;
	}

	@Column(length = 50)
	@Comment("机型")
	public String getTask_actype() {
		return task_actype;
	}

	public void setTask_actype(String task_actype) {
		this.task_actype = task_actype;
	}

	@Column(length = 10)
	@Comment("飞机编号")
	public String getTail_no() {
		return tail_no;
	}

	public void setTail_no(String tail_no) {
		this.tail_no = tail_no;
	}

	@Column(length = 10)
	@Comment("ATA章节")
	public String getChapter() {
		return chapter;
	}

	public void setChapter(String chapter) {
		this.chapter = chapter;
	}

	@Column
	@Comment("发生地点")
	public Integer getAirport() {
		return airport;
	}

	public void setAirport(Integer airport) {
		this.airport = airport;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("申请签字日期")
	public Date getApply_date() {
		return apply_date;
	}

	public void setApply_date(Date apply_date) {
		this.apply_date = apply_date;
	}

	@Column(length = 60)
	@Comment("申请人")
	public String getProposer() {
		return proposer;
	}

	public void setProposer(String proposer) {
		this.proposer = proposer;
	}

	@Column(length = 30)
	@Comment("保留类型")
	public String getDdf_type() {
		return ddf_type;
	}

	public void setDdf_type(String ddf_type) {
		this.ddf_type = ddf_type;
	}

	@Column
	@Comment("保留原因")
	public Integer getReasons() {
		return reasons;
	}

	public void setReasons(Integer reasons) {
		this.reasons = reasons;
	}

	@Column(length = 900)
	@Comment("故障描述/损伤情况")
	public String getInfo() {
		return info;
	}

	public void setInfo(String info) {
		this.info = info;
	}

	@Column(length = 900)
	@Comment("机务维护程序")
	public String getMechanical_work() {
		return mechanical_work;
	}

	public void setMechanical_work(String mechanical_work) {
		this.mechanical_work = mechanical_work;
	}

	@Column(length = 900)
	@Comment("机组操作程序")
	public String getAircrew_work() {
		return aircrew_work;
	}

	public void setAircrew_work(String aircrew_work) {
		this.aircrew_work = aircrew_work;
	}

	@Column(length = 30)
	@Comment("技术记录单号(基本)")
	public String getLog_no() {
		return log_no;
	}

	public void setLog_no(String log_no) {
		this.log_no = log_no;
	}

	@Column(length = 300)
	@Comment("保留依据")
	public String getBasis() {
		return basis;
	}

	public void setBasis(String basis) {
		this.basis = basis;
	}

	@Column(length = 900)
	@Comment("运行操作限制")
	public String getOperation_limit() {
		return operation_limit;
	}

	public void setOperation_limit(String operation_limit) {
		this.operation_limit = operation_limit;
	}

	@Column(length = 900)
	@Comment("备注")
	public String getRemarks() {
		return remarks;
	}

	public void setRemarks(String remarks) {
		this.remarks = remarks;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("批准时间")
	public Date getApprove_date() {
		return approve_date;
	}

	public void setApprove_date(Date approve_date) {
		this.approve_date = approve_date;
	}

	@Column(length = 60)
	@Comment("批准人")
	public String getApprover() {
		return approver;
	}

	public void setApprover(String approver) {
		this.approver = approver;
	}

	@Comment("批准修复时限起")
	public String getLimit_begin() {
		return limit_begin;
	}

	public void setLimit_begin(String limit_begin) {
		this.limit_begin = limit_begin;
	}

	@Comment("批准修复时限止")
	public String getLimit_end() {
		return limit_end;
	}

	public void setLimit_end(String limit_end) {
		this.limit_end = limit_end;
	}

	@Column(length = 20)
	@Comment("飞行小时")
	public String getFh() {
		return fh;
	}

	public void setFh(String fh) {
		this.fh = fh;
	}

	@Column(length = 20)
	@Comment("起落次数")
	public String getLd() {
		return ld;
	}

	public void setLd(String ld) {
		this.ld = ld;
	}

	@Column(length = 10)
	@Comment("发动机循环次数")
	public String getEng_cycle() {
		return eng_cycle;
	}

	public void setEng_cycle(String eng_cycle) {
		this.eng_cycle = eng_cycle;
	}

	@Column
	@Comment("维修实施单位")
	public Integer getMaintain_unit() {
		return maintain_unit;
	}

	public void setMaintain_unit(Integer maintain_unit) {
		this.maintain_unit = maintain_unit;
	}

	@Column
	@Comment("创建人")
	public Integer getCreator() {
		return creator;
	}

	public void setCreator(Integer creator) {
		this.creator = creator;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("创建时间")
	public Date getCreate_time() {
		return create_time;
	}

	public void setCreate_time(Date create_time) {
		this.create_time = create_time;
	}

	@Column
	@Comment("操作人")
	public Integer getOperator() {
		return operator;
	}

	public void setOperator(Integer operator) {
		this.operator = operator;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("最后更改时间")
	public Date getLast_modify() {
		return last_modify;
	}

	public void setLast_modify(Date last_modify) {
		this.last_modify = last_modify;
	}

	@Column(length = 20)
	@Comment("关闭状态")
	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("关闭日期")
	public Date getClose_date() {
		return close_date;
	}

	public void setClose_date(Date close_date) {
		this.close_date = close_date;
	}

	@Column(length = 20)
	@Comment("是否有限制")
	public String getHas_limit() {
		return has_limit;
	}

	public void setHas_limit(String has_limit) {
		this.has_limit = has_limit;
	}

	@Column(length = 20)
	@Comment("限制确认")
	public String getLimit_confirm() {
		return limit_confirm;
	}

	public void setLimit_confirm(String limit_confirm) {
		this.limit_confirm = limit_confirm;
	}

	@Comment("延期修复时限起")
	public String getDefer_begin() {
		return defer_begin;
	}

	public void setDefer_begin(String defer_begin) {
		this.defer_begin = defer_begin;
	}

	@Comment("延期修复时限止")
	public String getDefer_end() {
		return defer_end;
	}

	public void setDefer_end(String defer_end) {
		this.defer_end = defer_end;
	}

	@Column(length = 60)
	@Comment("延期修复批准人（适航部门批准人）")
	public String getDefer_approver() {
		return defer_approver;
	}

	public void setDefer_approver(String defer_approver) {
		this.defer_approver = defer_approver;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("延期修复批准日期")
	public Date getDefer_approve_date() {
		return defer_approve_date;
	}

	public void setDefer_approve_date(Date defer_approve_date) {
		this.defer_approve_date = defer_approve_date;
	}

	@Column
	@Comment("关闭操作人")
	public Integer getCloser() {
		return closer;
	}

	public void setCloser(Integer closer) {
		this.closer = closer;
	}

	@Column(length = 20)
	@Comment("是否需要航材")
	public String getNeed_material() {
		return need_material;
	}

	public void setNeed_material(String need_material) {
		this.need_material = need_material;
	}

	@Column(length = 30)
	@Comment("技术记录单号(撤销)")
	public String getClose_log_no() {
		return close_log_no;
	}

	public void setClose_log_no(String close_log_no) {
		this.close_log_no = close_log_no;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("到期日期")
	public Date getExpire_date() {
		return expire_date;
	}

	public void setExpire_date(Date expire_date) {
		this.expire_date = expire_date;
	}

	@Column(length = 30)
	@Comment("此项是否被转过无航材")
	public String getTo_whc() {
		return to_whc;
	}

	public void setTo_whc(String to_whc) {
		this.to_whc = to_whc;
	}

	@Column(length = 30)
	@Comment("是否转PPC")
	public String getTo_ppc() {
		return to_ppc;
	}

	public void setTo_ppc(String to_ppc) {
		this.to_ppc = to_ppc;
	}

	@Column
	@Comment("转PPC的操作人")
	public Integer getTo_ppc_operator() {
		return to_ppc_operator;
	}

	public void setTo_ppc_operator(Integer to_ppc_operator) {
		this.to_ppc_operator = to_ppc_operator;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("转PPC时的日期")
	public Date getTo_ppc_date() {
		return to_ppc_date;
	}

	public void setTo_ppc_date(Date to_ppc_date) {
		this.to_ppc_date = to_ppc_date;
	}

	@Column(length = 60)
	@Comment("关闭的单据批准人，非关闭操作人")
	public String getCloseby() {
		return closeby;
	}

	public void setCloseby(String closeby) {
		this.closeby = closeby;
	}

	@Column(length = 4000)
	@Comment("审批意见")
	public String getCancel_reason() {
		return cancel_reason;
	}

	public void setCancel_reason(String cancel_reason) {
		this.cancel_reason = cancel_reason;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("xx")
	public Date getSys_close_date() {
		return sys_close_date;
	}

	public void setSys_close_date(Date sys_close_date) {
		this.sys_close_date = sys_close_date;
	}

	@Column
	@Comment("xx")
	public Integer getSys_closer() {
		return sys_closer;
	}

	public void setSys_closer(Integer sys_closer) {
		this.sys_closer = sys_closer;
	}

	@Column(length = 2)
	@Comment("是否审核")
	public String getCheck_flag() {
		return check_flag;
	}

	public void setCheck_flag(String check_flag) {
		this.check_flag = check_flag;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("检查时间")
	public Date getCheck_date() {
		return check_date;
	}

	public void setCheck_date(Date check_date) {
		this.check_date = check_date;
	}

	@Column
	@Comment("审核人")
	public Integer getCheck_user() {
		return check_user;
	}

	public void setCheck_user(Integer check_user) {
		this.check_user = check_user;
	}

	@Column(length = 2)
	@Comment("是否跟踪00=否，01=是")
	public String getMntr_flag() {
		return mntr_flag;
	}

	public void setMntr_flag(String mntr_flag) {
		this.mntr_flag = mntr_flag;
	}

	@Column(length = 500)
	@Comment("跟踪内容")
	public String getMntr_content() {
		return mntr_content;
	}

	public void setMntr_content(String mntr_content) {
		this.mntr_content = mntr_content;
	}

	@Column(length = 500)
	@Comment("跟踪备注")
	public String getMntr_note() {
		return mntr_note;
	}

	public void setMntr_note(String mntr_note) {
		this.mntr_note = mntr_note;
	}

	@Column(length = 2)
	@Comment("是否延期")
	public String getDefer_flag() {
		return defer_flag;
	}

	public void setDefer_flag(String defer_flag) {
		this.defer_flag = defer_flag;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("#N/A")
	public Date getSys_defer_date() {
		return sys_defer_date;
	}

	public void setSys_defer_date(Date sys_defer_date) {
		this.sys_defer_date = sys_defer_date;
	}

	@Column
	@Comment("注销地点")
	public Integer getCancel_place() {
		return cancel_place;
	}

	public void setCancel_place(Integer cancel_place) {
		this.cancel_place = cancel_place;
	}

	@Column
	@Comment("营运人")
	public Integer getAirway_id() {
		return airway_id;
	}

	public void setAirway_id(Integer airway_id) {
		this.airway_id = airway_id;
	}

	@Column(length = 5)
	@Comment("YES/NO")
	public String getAoc() {
		return aoc;
	}

	public void setAoc(String aoc) {
		this.aoc = aoc;
	}

	@Column(length = 4000)
	public String getReason() {
		return reason;
	}

	public void setReason(String reason) {
		this.reason = reason;
	}

	@Column
	@Comment("申请人ID")
	public Integer getProposer_id() {
		return proposer_id;
	}

	public void setProposer_id(Integer proposer_id) {
		this.proposer_id = proposer_id;
	}

	@Column
	@Comment("批准人ID")
	public Integer getApprover_id() {
		return approver_id;
	}

	public void setApprover_id(Integer approver_id) {
		this.approver_id = approver_id;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("更新日期")
	public Date getUpdate_date() {
		return update_date;
	}

	public void setUpdate_date(Date update_date) {
		this.update_date = update_date;
	}

}
