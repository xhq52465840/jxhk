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
 * 暂缓项目
 */
@Entity
@Table(name = "ECMR_M_DEFERRED_REPAIR")
@Comment("QAR 暂缓项目")
public class DeferredPepairDO implements Serializable {

	private static final long serialVersionUID = 4680520802212518548L;

	/** 主键 */
	private Integer dri_id;

	/** 编号 */
	private String task_code;

	/** 机型（冗余） */
	private String task_actype;

	/** 机号 */
	private String tail_no;

	/** ATA章节 */
	private String chapter;

	/** 机场地点（冗余） */
	private Integer airport;

	/** 发生日期（冗余） */
	private Date happen_date;

	/** 报告部门 */
	private Integer report_dept;

	/** 报告人 */
	private String reporter;

	/** 监控间隔 */
	private String control_space;

	/** 监控方案 */
	private String control_scheme;

	/** 修复期限 */
	private String resolve_limit;

	/** 修复方案/放行依据 */
	private String resolvent;

	/** 故障描述/损伤情况 */
	private String info;

	/** 录入人 */
	private Integer creator;

	/** 录入日期 */
	private Date create_time;

	/** 最后修改人 */
	private Integer operator;

	/** 最后修改日期 */
	private Date last_modify;

	/** 状态 */
	private String status;

	/** 关闭日期 */
	private Date close_date;

	/** 是否必检 */
	private String is_check;

	/** 必检工程师 */
	private String check_engineer;

	/** 必检日期 */
	private Date check_date;

	/** 撤消记录 */
	private String cnl_record;

	/** 撤消工作者 */
	private String cnl_operator;

	/** 撤消检查者 */
	private String cnl_checker;

	/** 撤消日期 */
	private Date cnl_date;

	/** 关闭备注 */
	private String cls_remark;

	/** 关闭工程师 */
	private String cls_engineer;

	/** 关闭日期 */
	private Date cls_date;

	/** 是否有限制， 00无限制（默认）， 01有限制 */
	private String has_limit;

	/** 限制是否已被确认， OPEN未确认（默认）， CLOSED已确认 */
	private String limit_confirm;

	/** 此项是否被转入过PPC，00没有转过（默认）， 01已被转过 */
	private String to_ppc;

	/** 转PPC操作人 */
	private Integer to_ppc_operator;

	/** 转PPC日期 */
	private Date to_ppc_date;

	/** 维护类别 */
	private Integer maint_type;

	/** 关闭人 */
	private Integer close_user;

	/** 取消原因 */
	private String cancel_reason;

	/** #N/A */
	private String has_jgss;

	/** 营运人 */
	private Integer airway_id;

	/** 损伤位置 */
	private String ss_position;

	/** 依据文件 */
	private String basis_document;

	/** 更新日期 */
	private Date update_date;

	@Id
	@Column
	@Comment("主键")
	public Integer getDri_id() {
		return dri_id;
	}

	public void setDri_id(Integer dri_id) {
		this.dri_id = dri_id;
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
	@Comment("机型（冗余）")
	public String getTask_actype() {
		return task_actype;
	}

	public void setTask_actype(String task_actype) {
		this.task_actype = task_actype;
	}

	@Column(length = 10)
	@Comment("机号")
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
	@Comment("机场地点（冗余）")
	public Integer getAirport() {
		return airport;
	}

	public void setAirport(Integer airport) {
		this.airport = airport;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("发生日期（冗余）")
	public Date getHappen_date() {
		return happen_date;
	}

	public void setHappen_date(Date happen_date) {
		this.happen_date = happen_date;
	}

	@Column
	@Comment("报告部门")
	public Integer getReport_dept() {
		return report_dept;
	}

	public void setReport_dept(Integer report_dept) {
		this.report_dept = report_dept;
	}

	@Column(length = 60)
	@Comment("报告人")
	public String getReporter() {
		return reporter;
	}

	public void setReporter(String reporter) {
		this.reporter = reporter;
	}

	@Column(length = 30)
	@Comment("监控间隔")
	public String getControl_space() {
		return control_space;
	}

	public void setControl_space(String control_space) {
		this.control_space = control_space;
	}

	@Column(length = 1500)
	@Comment("监控方案")
	public String getControl_scheme() {
		return control_scheme;
	}

	public void setControl_scheme(String control_scheme) {
		this.control_scheme = control_scheme;
	}

	@Column(length = 60)
	@Comment("修复期限")
	public String getResolve_limit() {
		return resolve_limit;
	}

	public void setResolve_limit(String resolve_limit) {
		this.resolve_limit = resolve_limit;
	}

	@Column(length = 1500)
	@Comment("修复方案/放行依据")
	public String getResolvent() {
		return resolvent;
	}

	public void setResolvent(String resolvent) {
		this.resolvent = resolvent;
	}

	@Column(length = 900)
	@Comment("故障描述/损伤情况")
	public String getInfo() {
		return info;
	}

	public void setInfo(String info) {
		this.info = info;
	}

	@Column
	@Comment("录入人")
	public Integer getCreator() {
		return creator;
	}

	public void setCreator(Integer creator) {
		this.creator = creator;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("录入日期")
	public Date getCreate_time() {
		return create_time;
	}

	public void setCreate_time(Date create_time) {
		this.create_time = create_time;
	}

	@Column
	@Comment("最后修改人")
	public Integer getOperator() {
		return operator;
	}

	public void setOperator(Integer operator) {
		this.operator = operator;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("最后修改日期")
	public Date getLast_modify() {
		return last_modify;
	}

	public void setLast_modify(Date last_modify) {
		this.last_modify = last_modify;
	}

	@Column(length = 10)
	@Comment("状态")
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

	@Column(length = 10)
	@Comment("是否必检")
	public String getIs_check() {
		return is_check;
	}

	public void setIs_check(String is_check) {
		this.is_check = is_check;
	}

	@Column(length = 60)
	@Comment("必检工程师")
	public String getCheck_engineer() {
		return check_engineer;
	}

	public void setCheck_engineer(String check_engineer) {
		this.check_engineer = check_engineer;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("必检日期")
	public Date getCheck_date() {
		return check_date;
	}

	public void setCheck_date(Date check_date) {
		this.check_date = check_date;
	}

	@Column(length = 300)
	@Comment("撤消记录")
	public String getCnl_record() {
		return cnl_record;
	}

	public void setCnl_record(String cnl_record) {
		this.cnl_record = cnl_record;
	}

	@Column(length = 60)
	@Comment("撤消工作者")
	public String getCnl_operator() {
		return cnl_operator;
	}

	public void setCnl_operator(String cnl_operator) {
		this.cnl_operator = cnl_operator;
	}

	@Column(length = 60)
	@Comment("撤消检查者")
	public String getCnl_checker() {
		return cnl_checker;
	}

	public void setCnl_checker(String cnl_checker) {
		this.cnl_checker = cnl_checker;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("撤消日期")
	public Date getCnl_date() {
		return cnl_date;
	}

	public void setCnl_date(Date cnl_date) {
		this.cnl_date = cnl_date;
	}

	@Column(length = 300)
	@Comment("关闭备注")
	public String getCls_remark() {
		return cls_remark;
	}

	public void setCls_remark(String cls_remark) {
		this.cls_remark = cls_remark;
	}

	@Column(length = 60)
	@Comment("关闭工程师")
	public String getCls_engineer() {
		return cls_engineer;
	}

	public void setCls_engineer(String cls_engineer) {
		this.cls_engineer = cls_engineer;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("关闭日期")
	public Date getCls_date() {
		return cls_date;
	}

	public void setCls_date(Date cls_date) {
		this.cls_date = cls_date;
	}

	@Column(length = 10)
	@Comment("是否有限制， 00无限制（默认）， 01有限制")
	public String getHas_limit() {
		return has_limit;
	}

	public void setHas_limit(String has_limit) {
		this.has_limit = has_limit;
	}

	@Column(length = 10)
	@Comment("限制是否已被确认， OPEN未确认（默认）， CLOSED已确认")
	public String getLimit_confirm() {
		return limit_confirm;
	}

	public void setLimit_confirm(String limit_confirm) {
		this.limit_confirm = limit_confirm;
	}

	@Column(length = 30)
	@Comment("此项是否被转入过PPC，00没有转过（默认）， 01已被转过")
	public String getTo_ppc() {
		return to_ppc;
	}

	public void setTo_ppc(String to_ppc) {
		this.to_ppc = to_ppc;
	}

	@Column
	@Comment("转PPC操作人")
	public Integer getTo_ppc_operator() {
		return to_ppc_operator;
	}

	public void setTo_ppc_operator(Integer to_ppc_operator) {
		this.to_ppc_operator = to_ppc_operator;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("转PPC日期")
	public Date getTo_ppc_date() {
		return to_ppc_date;
	}

	public void setTo_ppc_date(Date to_ppc_date) {
		this.to_ppc_date = to_ppc_date;
	}

	@Column
	@Comment("维护类别")
	public Integer getMaint_type() {
		return maint_type;
	}

	public void setMaint_type(Integer maint_type) {
		this.maint_type = maint_type;
	}

	@Column
	@Comment("关闭人")
	public Integer getClose_user() {
		return close_user;
	}

	public void setClose_user(Integer close_user) {
		this.close_user = close_user;
	}

	@Column(length = 4000)
	@Comment("取消原因")
	public String getCancel_reason() {
		return cancel_reason;
	}

	public void setCancel_reason(String cancel_reason) {
		this.cancel_reason = cancel_reason;
	}

	@Column(length = 10)
	@Comment("#N/A")
	public String getHas_jgss() {
		return has_jgss;
	}

	public void setHas_jgss(String has_jgss) {
		this.has_jgss = has_jgss;
	}

	@Column
	@Comment("营运人")
	public Integer getAirway_id() {
		return airway_id;
	}

	public void setAirway_id(Integer airway_id) {
		this.airway_id = airway_id;
	}

	@Column(length = 200)
	@Comment("损伤位置")
	public String getSs_position() {
		return ss_position;
	}

	public void setSs_position(String ss_position) {
		this.ss_position = ss_position;
	}

	@Column(length = 200)
	@Comment("依据文件")
	public String getBasis_document() {
		return basis_document;
	}

	public void setBasis_document(String basis_document) {
		this.basis_document = basis_document;
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
