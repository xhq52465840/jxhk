package com.usky.sms.flightmovementinfo.Maintenance;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import org.hibernate.cfg.Comment;

/**
 * 不正常事件
 */
@Entity
@Table(name = "ECMR_M_BZCSJ")
@Comment("QAR 不正常事件")
public class BzcsjDO implements Serializable {

	private static final long serialVersionUID = 8393196283468277233L;

	/** 不正常事件主键 */
	private Integer bzcsj_id;

	/** 航班号 */
	private String flight_no;

	/** 机号 */
	private String tail_no;

	/** 换机机号 */
	private String change_tail_no;

	/** 计划到达 */
	private String plan_city;

	/** 实际到达 */
	private String act_city;

	/** 计划离港 */
	private String plan_airport;

	/** 实际离港 */
	private String act_airport;

	/** 发生日期 */
	private Date mat_date;

	/** 发生地点 */
	private Integer mat_airport;

	/** 任务种类 */
	private String job_type;

	/** 发生阶段 */
	private String mat_phase;

	/** 维护类别 */
	private String maint_type;

	/** 报告来源 */
	private String mat_src;

	/** 延误时间 */
	private Integer delay;

	/** 涉及主要ATA章节（4位） */
	private String ata;

	/** 航班正常性 */
	private Integer hb_zcx;

	/** 排故开始时间 */
	private String pg_beg_time;

	/** 排故结束时间 */
	private String pg_end_time;

	/** 是否可按MEL放行 */
	private String mel_fangxing;

	/** 放行依据 */
	private String fangxing_yj;

	/** 是否属于使用困难 */
	private String use_kunnan;

	/** ETOPS故障信息 */
	private String etops_kn_info;

	/** 起飞后时间 */
	private String etops_flight_time;

	/** ECAM警告信息 */
	private String etops_warn_info;

	/** 飞机构型 */
	private String etops_fjgx;

	/** 故障描述 */
	private String mat_desc;

	/** 报告人 */
	private String mat_desc_rpter;

	/** 处理情况 */
	private String mat_chuli;

	/** 报告人 */
	private String mat_chuli_rpter;

	/** 最终排故措施 */
	private String mat_cs;

	/** 报告人 */
	private String mat_cs_rpter;

	/** 故障件名称 */
	private String mat_piece_name;

	/** 件号 */
	private String mat_piece_no;

	/** 序号 */
	private String mat_piece_ser;

	/** 填报人 */
	private String bzcsj_rpter;

	/** 填报日期 */
	private Date bzcsj_rpt_date;

	/** 地点 */
	private String bzcsj_rpt_airport;

	/** 审核人 */
	private String bzcsj_checker;

	/** 审核日期 */
	private Date bzcsj_check_date;

	/** 分析及总结 */
	private String bzcsj_fx;

	/** 造成延误的主要原因及预防／改进措施 */
	private String bzcsj_cs;

	/** 故障件信息[件名/件号/序号/上次装机日期/上次故障原因/本次使用时间/修理厂家] */
	private String bzcsj_piece_info;

	/** 审核人 */
	private Integer bzcsj_examer;

	/** 审核日期 */
	private Date bzcsj_exam_date;

	/** 录入日期 */
	private Date create_time;

	/** 录入人 */
	private Integer creator;

	/** 修改人 */
	private Integer operator;

	/** 修改日期 */
	private Date last_modify;

	/** 运行类使用困难事件范围 */
	private String kn_info_yunxing;

	/** 结构类使用困难事件结构 */
	private String kn_info_jiegou;

	/** 现象 */
	private String xianxiang;

	/** 措施 */
	private String cuoshi;

	/** 不正常事件编号 */
	private String bzcsj_no;

	/** 机型 */
	private String actype;

	/** 交换机型 */
	private String change_actype;

	/** #N/A */
	private String fx_reporter;

	/** #N/A */
	private Date fx_date;

	/** #N/A */
	private String fx_checker;

	/** #N/A */
	private Date fx_chk_date;

	/** 有效性确认 */
	private String affirm_flag;

	/** 有效性确认人 */
	private Integer affirm_operator;

	/** 有效性确认时间 */
	private Date affirm_time;

	/**  */
	private Integer maint_manhour;

	/**  */
	private Integer manhour_cost;

	/**  */
	private Integer external_trust_cost;

	/**  */
	private Integer material_cost;

	/** 部件修理-更换部件（名称/件号/序号） */
	private String change_parts;

	/**  */
	private Integer repair_cost;

	/** AOG天数 */
	private Integer aog_days;

	/** 事件原因 */
	private Integer event_reason;

	/** 营运人 */
	private Integer airway_id;

	/** 方案编制费用 */
	private Integer programming_cost;

	/** 执管单位 */
	private Integer manage_dept;

	/** 发生地单位 */
	private Integer occur_dept;

	/** 单项考核单位1 */
	private Integer single_check_unit;

	/** 单项考核单位2 */
	private Integer single_check_unit2;

	/** 考核原因 */
	private String check_reason;

	/** 考核人 */
	private String checker;

	/** 考核时间 */
	private Date check_date;

	/** 更新时间 */
	private Date update_date;

	@Id
	@Column
	@Comment("不正常事件主键")
	public Integer getBzcsj_id() {
		return bzcsj_id;
	}

	public void setBzcsj_id(Integer bzcsj_id) {
		this.bzcsj_id = bzcsj_id;
	}

	@Column(length = 30)
	@Comment("航班号")
	public String getFlight_no() {
		return flight_no;
	}

	public void setFlight_no(String flight_no) {
		this.flight_no = flight_no;
	}

	@Column(length = 30)
	@Comment("机号")
	public String getTail_no() {
		return tail_no;
	}

	public void setTail_no(String tail_no) {
		this.tail_no = tail_no;
	}

	@Column(length = 30)
	@Comment("换机机号")
	public String getChange_tail_no() {
		return change_tail_no;
	}

	public void setChange_tail_no(String change_tail_no) {
		this.change_tail_no = change_tail_no;
	}

	@Column(length = 30)
	@Comment("计划到达")
	public String getPlan_city() {
		return plan_city;
	}

	public void setPlan_city(String plan_city) {
		this.plan_city = plan_city;
	}

	@Column(length = 30)
	@Comment("实际到达")
	public String getAct_city() {
		return act_city;
	}

	public void setAct_city(String act_city) {
		this.act_city = act_city;
	}

	@Column(length = 30)
	@Comment("计划离港")
	public String getPlan_airport() {
		return plan_airport;
	}

	public void setPlan_airport(String plan_airport) {
		this.plan_airport = plan_airport;
	}

	@Column(length = 30)
	@Comment("实际离港")
	public String getAct_airport() {
		return act_airport;
	}

	public void setAct_airport(String act_airport) {
		this.act_airport = act_airport;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("发生日期")
	public Date getMat_date() {
		return mat_date;
	}

	public void setMat_date(Date mat_date) {
		this.mat_date = mat_date;
	}

	@Column
	@Comment("发生地点")
	public Integer getMat_airport() {
		return mat_airport;
	}

	public void setMat_airport(Integer mat_airport) {
		this.mat_airport = mat_airport;
	}

	@Column(length = 30)
	@Comment("任务种类")
	public String getJob_type() {
		return job_type;
	}

	public void setJob_type(String job_type) {
		this.job_type = job_type;
	}

	@Column(length = 30)
	@Comment("发生阶段")
	public String getMat_phase() {
		return mat_phase;
	}

	public void setMat_phase(String mat_phase) {
		this.mat_phase = mat_phase;
	}

	@Column(length = 30)
	@Comment("维护类别")
	public String getMaint_type() {
		return maint_type;
	}

	public void setMaint_type(String maint_type) {
		this.maint_type = maint_type;
	}

	@Column(length = 30)
	@Comment("报告来源")
	public String getMat_src() {
		return mat_src;
	}

	public void setMat_src(String mat_src) {
		this.mat_src = mat_src;
	}

	@Column
	@Comment("延误时间")
	public Integer getDelay() {
		return delay;
	}

	public void setDelay(Integer delay) {
		this.delay = delay;
	}

	@Column(length = 30)
	@Comment("涉及主要ATA章节（4位）")
	public String getAta() {
		return ata;
	}

	public void setAta(String ata) {
		this.ata = ata;
	}

	@Column
	@Comment("航班正常性")
	public Integer getHb_zcx() {
		return hb_zcx;
	}

	public void setHb_zcx(Integer hb_zcx) {
		this.hb_zcx = hb_zcx;
	}

	@Column(length = 30)
	@Comment("排故开始时间")
	public String getPg_beg_time() {
		return pg_beg_time;
	}

	public void setPg_beg_time(String pg_beg_time) {
		this.pg_beg_time = pg_beg_time;
	}

	@Column(length = 30)
	@Comment("排故结束时间")
	public String getPg_end_time() {
		return pg_end_time;
	}

	public void setPg_end_time(String pg_end_time) {
		this.pg_end_time = pg_end_time;
	}

	@Column(length = 30)
	@Comment("是否可按MEL放行")
	public String getMel_fangxing() {
		return mel_fangxing;
	}

	public void setMel_fangxing(String mel_fangxing) {
		this.mel_fangxing = mel_fangxing;
	}

	@Column(length = 100)
	@Comment("放行依据")
	public String getFangxing_yj() {
		return fangxing_yj;
	}

	public void setFangxing_yj(String fangxing_yj) {
		this.fangxing_yj = fangxing_yj;
	}

	@Column(length = 30)
	@Comment("是否属于使用困难")
	public String getUse_kunnan() {
		return use_kunnan;
	}

	public void setUse_kunnan(String use_kunnan) {
		this.use_kunnan = use_kunnan;
	}

	@Column(length = 30)
	@Comment("ETOPS故障信息")
	public String getEtops_kn_info() {
		return etops_kn_info;
	}

	public void setEtops_kn_info(String etops_kn_info) {
		this.etops_kn_info = etops_kn_info;
	}

	@Column(length = 30)
	@Comment("起飞后时间")
	public String getEtops_flight_time() {
		return etops_flight_time;
	}

	public void setEtops_flight_time(String etops_flight_time) {
		this.etops_flight_time = etops_flight_time;
	}

	@Column(length = 100)
	@Comment("ECAM警告信息")
	public String getEtops_warn_info() {
		return etops_warn_info;
	}

	public void setEtops_warn_info(String etops_warn_info) {
		this.etops_warn_info = etops_warn_info;
	}

	@Column(length = 30)
	@Comment("飞机构型")
	public String getEtops_fjgx() {
		return etops_fjgx;
	}

	public void setEtops_fjgx(String etops_fjgx) {
		this.etops_fjgx = etops_fjgx;
	}

	@Column(length = 900)
	@Comment("故障描述")
	public String getMat_desc() {
		return mat_desc;
	}

	public void setMat_desc(String mat_desc) {
		this.mat_desc = mat_desc;
	}

	@Column(length = 30)
	@Comment("报告人")
	public String getMat_desc_rpter() {
		return mat_desc_rpter;
	}

	public void setMat_desc_rpter(String mat_desc_rpter) {
		this.mat_desc_rpter = mat_desc_rpter;
	}

	@Column(length = 1500)
	@Comment("处理情况")
	public String getMat_chuli() {
		return mat_chuli;
	}

	public void setMat_chuli(String mat_chuli) {
		this.mat_chuli = mat_chuli;
	}

	@Column(length = 30)
	@Comment("报告人")
	public String getMat_chuli_rpter() {
		return mat_chuli_rpter;
	}

	public void setMat_chuli_rpter(String mat_chuli_rpter) {
		this.mat_chuli_rpter = mat_chuli_rpter;
	}

	@Column(length = 2000)
	@Comment("最终排故措施")
	public String getMat_cs() {
		return mat_cs;
	}

	public void setMat_cs(String mat_cs) {
		this.mat_cs = mat_cs;
	}

	@Column(length = 30)
	@Comment("报告人")
	public String getMat_cs_rpter() {
		return mat_cs_rpter;
	}

	public void setMat_cs_rpter(String mat_cs_rpter) {
		this.mat_cs_rpter = mat_cs_rpter;
	}

	@Column(length = 30)
	@Comment("故障件名称")
	public String getMat_piece_name() {
		return mat_piece_name;
	}

	public void setMat_piece_name(String mat_piece_name) {
		this.mat_piece_name = mat_piece_name;
	}

	@Column(length = 30)
	@Comment("件号")
	public String getMat_piece_no() {
		return mat_piece_no;
	}

	public void setMat_piece_no(String mat_piece_no) {
		this.mat_piece_no = mat_piece_no;
	}

	@Column(length = 30)
	@Comment("序号")
	public String getMat_piece_ser() {
		return mat_piece_ser;
	}

	public void setMat_piece_ser(String mat_piece_ser) {
		this.mat_piece_ser = mat_piece_ser;
	}

	@Column(length = 30)
	@Comment("填报人")
	public String getBzcsj_rpter() {
		return bzcsj_rpter;
	}

	public void setBzcsj_rpter(String bzcsj_rpter) {
		this.bzcsj_rpter = bzcsj_rpter;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("填报日期")
	public Date getBzcsj_rpt_date() {
		return bzcsj_rpt_date;
	}

	public void setBzcsj_rpt_date(Date bzcsj_rpt_date) {
		this.bzcsj_rpt_date = bzcsj_rpt_date;
	}

	@Column(length = 30)
	@Comment("地点")
	public String getBzcsj_rpt_airport() {
		return bzcsj_rpt_airport;
	}

	public void setBzcsj_rpt_airport(String bzcsj_rpt_airport) {
		this.bzcsj_rpt_airport = bzcsj_rpt_airport;
	}

	@Column(length = 30)
	@Comment("考核人")
	public String getBzcsj_checker() {
		return bzcsj_checker;
	}

	public void setBzcsj_checker(String bzcsj_checker) {
		this.bzcsj_checker = bzcsj_checker;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("考核时间")
	public Date getBzcsj_check_date() {
		return bzcsj_check_date;
	}

	public void setBzcsj_check_date(Date bzcsj_check_date) {
		this.bzcsj_check_date = bzcsj_check_date;
	}

	@Column(length = 3000)
	@Comment("分析及总结")
	public String getBzcsj_fx() {
		return bzcsj_fx;
	}

	public void setBzcsj_fx(String bzcsj_fx) {
		this.bzcsj_fx = bzcsj_fx;
	}

	@Column(length = 3000)
	@Comment("造成延误的主要原因及预防／改进措施")
	public String getBzcsj_cs() {
		return bzcsj_cs;
	}

	public void setBzcsj_cs(String bzcsj_cs) {
		this.bzcsj_cs = bzcsj_cs;
	}

	@Column(length = 1500)
	@Comment("故障件信息[件名/件号/序号/上次装机日期/上次故障原因/本次使用时间/修理厂家]")
	public String getBzcsj_piece_info() {
		return bzcsj_piece_info;
	}

	public void setBzcsj_piece_info(String bzcsj_piece_info) {
		this.bzcsj_piece_info = bzcsj_piece_info;
	}

	@Column
	@Comment("审核人")
	public Integer getBzcsj_examer() {
		return bzcsj_examer;
	}

	public void setBzcsj_examer(Integer bzcsj_examer) {
		this.bzcsj_examer = bzcsj_examer;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("审核日期")
	public Date getBzcsj_exam_date() {
		return bzcsj_exam_date;
	}

	public void setBzcsj_exam_date(Date bzcsj_exam_date) {
		this.bzcsj_exam_date = bzcsj_exam_date;
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
	@Comment("录入人")
	public Integer getCreator() {
		return creator;
	}

	public void setCreator(Integer creator) {
		this.creator = creator;
	}

	@Column
	@Comment("修改人")
	public Integer getOperator() {
		return operator;
	}

	public void setOperator(Integer operator) {
		this.operator = operator;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("修改日期")
	public Date getLast_modify() {
		return last_modify;
	}

	public void setLast_modify(Date last_modify) {
		this.last_modify = last_modify;
	}

	@Column(length = 900)
	@Comment("运行类使用困难事件范围")
	public String getKn_info_yunxing() {
		return kn_info_yunxing;
	}

	public void setKn_info_yunxing(String kn_info_yunxing) {
		this.kn_info_yunxing = kn_info_yunxing;
	}

	@Column(length = 900)
	@Comment("结构类使用困难事件结构")
	public String getKn_info_jiegou() {
		return kn_info_jiegou;
	}

	public void setKn_info_jiegou(String kn_info_jiegou) {
		this.kn_info_jiegou = kn_info_jiegou;
	}

	@Column(length = 900)
	@Comment("现象")
	public String getXianxiang() {
		return xianxiang;
	}

	public void setXianxiang(String xianxiang) {
		this.xianxiang = xianxiang;
	}

	@Column(length = 900)
	@Comment("措施")
	public String getCuoshi() {
		return cuoshi;
	}

	public void setCuoshi(String cuoshi) {
		this.cuoshi = cuoshi;
	}

	@Column(length = 50)
	@Comment("不正常事件编号")
	public String getBzcsj_no() {
		return bzcsj_no;
	}

	public void setBzcsj_no(String bzcsj_no) {
		this.bzcsj_no = bzcsj_no;
	}

	@Column(length = 30)
	@Comment("机型")
	public String getActype() {
		return actype;
	}

	public void setActype(String actype) {
		this.actype = actype;
	}

	@Column(length = 30)
	@Comment("交换机型")
	public String getChange_actype() {
		return change_actype;
	}

	public void setChange_actype(String change_actype) {
		this.change_actype = change_actype;
	}

	@Column(length = 30)
	@Comment("#N/A")
	public String getFx_reporter() {
		return fx_reporter;
	}

	public void setFx_reporter(String fx_reporter) {
		this.fx_reporter = fx_reporter;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("#N/A")
	public Date getFx_date() {
		return fx_date;
	}

	public void setFx_date(Date fx_date) {
		this.fx_date = fx_date;
	}

	@Column(length = 30)
	@Comment("#N/A")
	public String getFx_checker() {
		return fx_checker;
	}

	public void setFx_checker(String fx_checker) {
		this.fx_checker = fx_checker;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("#N/A")
	public Date getFx_chk_date() {
		return fx_chk_date;
	}

	public void setFx_chk_date(Date fx_chk_date) {
		this.fx_chk_date = fx_chk_date;
	}

	@Column(length = 10)
	@Comment("有效性确认")
	public String getAffirm_flag() {
		return affirm_flag;
	}

	public void setAffirm_flag(String affirm_flag) {
		this.affirm_flag = affirm_flag;
	}

	@Column
	@Comment("有效性确认人")
	public Integer getAffirm_operator() {
		return affirm_operator;
	}

	public void setAffirm_operator(Integer affirm_operator) {
		this.affirm_operator = affirm_operator;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("有效性确认时间")
	public Date getAffirm_time() {
		return affirm_time;
	}

	public void setAffirm_time(Date affirm_time) {
		this.affirm_time = affirm_time;
	}

	@Column
	@Comment("")
	public Integer getMaint_manhour() {
		return maint_manhour;
	}

	public void setMaint_manhour(Integer maint_manhour) {
		this.maint_manhour = maint_manhour;
	}

	@Column
	@Comment("")
	public Integer getManhour_cost() {
		return manhour_cost;
	}

	public void setManhour_cost(Integer manhour_cost) {
		this.manhour_cost = manhour_cost;
	}

	@Column
	@Comment("")
	public Integer getExternal_trust_cost() {
		return external_trust_cost;
	}

	public void setExternal_trust_cost(Integer external_trust_cost) {
		this.external_trust_cost = external_trust_cost;
	}

	@Column
	@Comment("")
	public Integer getMaterial_cost() {
		return material_cost;
	}

	public void setMaterial_cost(Integer material_cost) {
		this.material_cost = material_cost;
	}

	@Column(length = 900)
	@Comment("部件修理-更换部件（名称/件号/序号）")
	public String getChange_parts() {
		return change_parts;
	}

	public void setChange_parts(String change_parts) {
		this.change_parts = change_parts;
	}

	@Column
	@Comment("")
	public Integer getRepair_cost() {
		return repair_cost;
	}

	public void setRepair_cost(Integer repair_cost) {
		this.repair_cost = repair_cost;
	}

	@Column
	@Comment("AOG天数")
	public Integer getAog_days() {
		return aog_days;
	}

	public void setAog_days(Integer aog_days) {
		this.aog_days = aog_days;
	}

	@Column
	@Comment("事件原因")
	public Integer getEvent_reason() {
		return event_reason;
	}

	public void setEvent_reason(Integer event_reason) {
		this.event_reason = event_reason;
	}

	@Column
	@Comment("营运人")
	public Integer getAirway_id() {
		return airway_id;
	}

	public void setAirway_id(Integer airway_id) {
		this.airway_id = airway_id;
	}

	@Column
	@Comment("方案编制费用")
	public Integer getProgramming_cost() {
		return programming_cost;
	}

	public void setProgramming_cost(Integer programming_cost) {
		this.programming_cost = programming_cost;
	}

	@Column
	@Comment("执管单位")
	public Integer getManage_dept() {
		return manage_dept;
	}

	public void setManage_dept(Integer manage_dept) {
		this.manage_dept = manage_dept;
	}

	@Column
	@Comment("发生地单位")
	public Integer getOccur_dept() {
		return occur_dept;
	}

	public void setOccur_dept(Integer occur_dept) {
		this.occur_dept = occur_dept;
	}

	@Column
	@Comment("单项考核单位1")
	public Integer getSingle_check_unit() {
		return single_check_unit;
	}

	public void setSingle_check_unit(Integer single_check_unit) {
		this.single_check_unit = single_check_unit;
	}

	@Column
	@Comment("单项考核单位2")
	public Integer getSingle_check_unit2() {
		return single_check_unit2;
	}

	public void setSingle_check_unit2(Integer single_check_unit2) {
		this.single_check_unit2 = single_check_unit2;
	}

	@Column(length = 256)
	@Comment("考核原因")
	public String getCheck_reason() {
		return check_reason;
	}

	public void setCheck_reason(String check_reason) {
		this.check_reason = check_reason;
	}

	@Column(length = 30)
	public String getChecker() {
		return checker;
	}

	public void setChecker(String checker) {
		this.checker = checker;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	public Date getCheck_date() {
		return check_date;
	}

	public void setCheck_date(Date check_date) {
		this.check_date = check_date;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("更新时间")
	public Date getUpdate_date() {
		return update_date;
	}

	public void setUpdate_date(Date update_date) {
		this.update_date = update_date;
	}

}
