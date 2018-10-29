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
 * 重点监控故障 重点监控
 */
@Entity
@Table(name = "ECMR_M_MONIT")
@Comment("QAR 重点监控")
public class MonitDO implements Serializable {

	private static final long serialVersionUID = 3935120696526989778L;

	/** 主键 */
	private Integer monit_id;

	/** 机型 */
	private String actype;

	/** 机号 */
	private String tail_no;

	/** ata章节 */
	private String ata;

	/** 创建人 */
	private String creator;

	/** 创建日期 */
	private Date create_date;

	/** 是否为疑难故障 */
	private String if_difficult;

	/** 控制人 */
	private String controller;

	/** 状态 */
	private String status;

	/** 关闭人 */
	private String closer;

	/** 关闭日期 */
	private Date close_date;

	/** 审核意见 */
	private String confirm_contents;

	/** 审核人 */
	private String confirm_person;

	/** 审核日期 */
	private Date confirm_date;

	/** 控制单位 */
	private Integer control_dept;

	/** 说明 */
	private String description;

	/** 关闭原因 */
	private String close_reason;

	/** 营运人 */
	private Integer airway_id;

	/** #N/A */
	private Integer close_times;

	/** #N/A */
	private Date frist_date;

	/** 疑难故障总结状态 */
	private String yngzzj_status;

	/** 更新日期 */
	private Date update_date;

	@Id
	@Column
	@Comment("主键")
	public Integer getMonit_id() {
		return monit_id;
	}

	public void setMonit_id(Integer monit_id) {
		this.monit_id = monit_id;
	}

	@Column(length = 20)
	@Comment("机型")
	public String getActype() {
		return actype;
	}

	public void setActype(String actype) {
		this.actype = actype;
	}

	@Column(length = 20)
	@Comment("机号")
	public String getTail_no() {
		return tail_no;
	}

	public void setTail_no(String tail_no) {
		this.tail_no = tail_no;
	}

	@Column(length = 20)
	@Comment("ata章节")
	public String getAta() {
		return ata;
	}

	public void setAta(String ata) {
		this.ata = ata;
	}

	@Column(length = 100)
	@Comment("创建人")
	public String getCreator() {
		return creator;
	}

	public void setCreator(String creator) {
		this.creator = creator;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("创建日期")
	public Date getCreate_date() {
		return create_date;
	}

	public void setCreate_date(Date create_date) {
		this.create_date = create_date;
	}

	@Column(length = 5)
	@Comment("是否为疑难故障")
	public String getIf_difficult() {
		return if_difficult;
	}

	public void setIf_difficult(String if_difficult) {
		this.if_difficult = if_difficult;
	}

	@Column(length = 100)
	@Comment("控制人")
	public String getController() {
		return controller;
	}

	public void setController(String controller) {
		this.controller = controller;
	}

	@Column(length = 20)
	@Comment("状态")
	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	@Column(length = 100)
	@Comment("关闭人")
	public String getCloser() {
		return closer;
	}

	public void setCloser(String closer) {
		this.closer = closer;
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

	@Column(length = 2000)
	@Comment("审核意见")
	public String getConfirm_contents() {
		return confirm_contents;
	}

	public void setConfirm_contents(String confirm_contents) {
		this.confirm_contents = confirm_contents;
	}

	@Column(length = 100)
	@Comment("审核人")
	public String getConfirm_person() {
		return confirm_person;
	}

	public void setConfirm_person(String confirm_person) {
		this.confirm_person = confirm_person;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("审核日期")
	public Date getConfirm_date() {
		return confirm_date;
	}

	public void setConfirm_date(Date confirm_date) {
		this.confirm_date = confirm_date;
	}

	@Column
	@Comment("控制单位")
	public Integer getControl_dept() {
		return control_dept;
	}

	public void setControl_dept(Integer control_dept) {
		this.control_dept = control_dept;
	}

	@Column(length = 2000)
	@Comment("说明")
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	@Column(length = 2000)
	@Comment("关闭原因")
	public String getClose_reason() {
		return close_reason;
	}

	public void setClose_reason(String close_reason) {
		this.close_reason = close_reason;
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
	@Comment("#N/A")
	public Integer getClose_times() {
		return close_times;
	}

	public void setClose_times(Integer close_times) {
		this.close_times = close_times;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("#N/A")
	public Date getFrist_date() {
		return frist_date;
	}

	public void setFrist_date(Date frist_date) {
		this.frist_date = frist_date;
	}

	@Column(length = 20)
	@Comment("疑难故障总结状态")
	public String getYngzzj_status() {
		return yngzzj_status;
	}

	public void setYngzzj_status(String yngzzj_status) {
		this.yngzzj_status = yngzzj_status;
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
