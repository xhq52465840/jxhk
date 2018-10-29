package com.usky.sms.flightmovementinfo;

import org.hibernate.cfg.Comment;
import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.IdClass;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

/**
 * 客舱服务排班
 */
@Entity
@Table(name = "YXW_TB_CABINCREWSCHEDULEINFO")
@IdClass(CabinCrewScheduleInfoId.class)
@Comment("QAR 客舱服务排班")
public class CabinCrewScheduleInfoDO implements Serializable {
	private static final long serialVersionUID = -2210183594274700371L;

	private Integer flight_plan_id;
	private Integer staff_id;
	private Integer flightInfoID;
	private String org_code;
	private String carrier;
	private String flight_no;
	private String flight_flag;
	private String ac_type;
	private String ac_no;
	private Date flight_date;
	private Date schedule_depart_time;
	private Date schedule_arrival_time;
	private String depart_port_code3;
	private String arrival_port_code3;
	private String post;
	private String rank;
	private String level;
	private String companyCode;
	private String cabin_task_no;
	private Integer state;
	private Date addTime;
	private Date updTime;
	private String isArchived;
	private Date sms_update_time;
	private Date created;
	private Date last_update;

	@Id
	@Column
	@Comment("")
	public Integer getFlight_plan_id() {
		return flight_plan_id;
	}

	public void setFlight_plan_id(Integer flight_plan_id) {
		this.flight_plan_id = flight_plan_id;
	}

	@Id
	@Column
	@Comment("")
	public Integer getStaff_id() {
		return staff_id;
	}

	public void setStaff_id(Integer staff_id) {
		this.staff_id = staff_id;
	}

	@Id
	@Column
	@Comment("")
	public Integer getFlightInfoID() {
		return flightInfoID;
	}

	public void setFlightInfoID(Integer flightInfoID) {
		this.flightInfoID = flightInfoID;
	}

	@Column(length = 20)
	@Comment("")
	public String getOrg_code() {
		return org_code;
	}

	public void setOrg_code(String org_code) {
		this.org_code = org_code;
	}

	@Column(length = 8)
	@Comment("")
	public String getCarrier() {
		return carrier;
	}

	public void setCarrier(String carrier) {
		this.carrier = carrier;
	}

	@Column(length = 20)
	@Comment("")
	public String getFlight_no() {
		return flight_no;
	}

	public void setFlight_no(String flight_no) {
		this.flight_no = flight_no;
	}

	@Column(length = 1)
	@Comment("")
	public String getFlight_flag() {
		return flight_flag;
	}

	public void setFlight_flag(String flight_flag) {
		this.flight_flag = flight_flag;
	}

	@Column(length = 10)
	@Comment("")
	public String getAc_type() {
		return ac_type;
	}

	public void setAc_type(String ac_type) {
		this.ac_type = ac_type;
	}

	@Column(length = 10)
	@Comment("")
	public String getAc_no() {
		return ac_no;
	}

	public void setAc_no(String ac_no) {
		this.ac_no = ac_no;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getFlight_date() {
		return flight_date;
	}

	public void setFlight_date(Date flight_date) {
		this.flight_date = flight_date;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getSchedule_depart_time() {
		return schedule_depart_time;
	}

	public void setSchedule_depart_time(Date schedule_depart_time) {
		this.schedule_depart_time = schedule_depart_time;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getSchedule_arrival_time() {
		return schedule_arrival_time;
	}

	public void setSchedule_arrival_time(Date schedule_arrival_time) {
		this.schedule_arrival_time = schedule_arrival_time;
	}

	@Column(length = 10)
	@Comment("")
	public String getDepart_port_code3() {
		return depart_port_code3;
	}

	public void setDepart_port_code3(String depart_port_code3) {
		this.depart_port_code3 = depart_port_code3;
	}

	@Column(length = 10)
	@Comment("")
	public String getArrival_port_code3() {
		return arrival_port_code3;
	}

	public void setArrival_port_code3(String arrival_port_code3) {
		this.arrival_port_code3 = arrival_port_code3;
	}

	@Column(length = 20)
	@Comment("")
	public String getPost() {
		return post;
	}

	public void setPost(String post) {
		this.post = post;
	}

	@Column(length = 20)
	@Comment("")
	public String getRank() {
		return rank;
	}

	public void setRank(String rank) {
		this.rank = rank;
	}

	@Column(name = "`LEVEL`", length = 20)
	@Comment("")
	public String getLevel() {
		return level;
	}

	public void setLevel(String level) {
		this.level = level;
	}

	@Column(length = 20)
	@Comment("")
	public String getCompanyCode() {
		return companyCode;
	}

	public void setCompanyCode(String companyCode) {
		this.companyCode = companyCode;
	}

	@Column(length = 20)
	@Comment("")
	public String getCabin_task_no() {
		return cabin_task_no;
	}

	public void setCabin_task_no(String cabin_task_no) {
		this.cabin_task_no = cabin_task_no;
	}

	@Column
	@Comment("")
	public Integer getState() {
		return state;
	}

	public void setState(Integer state) {
		this.state = state;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getAddTime() {
		return addTime;
	}

	public void setAddTime(Date addTime) {
		this.addTime = addTime;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getUpdTime() {
		return updTime;
	}

	public void setUpdTime(Date updTime) {
		this.updTime = updTime;
	}

	@Column(length = 1)
	@Comment("")
	public String getIsArchived() {
		return isArchived;
	}

	public void setIsArchived(String isArchived) {
		this.isArchived = isArchived;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getSms_update_time() {
		return sms_update_time;
	}

	public void setSms_update_time(Date sms_update_time) {
		this.sms_update_time = sms_update_time;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getCreated() {
		return created;
	}

	public void setCreated(Date created) {
		this.created = created;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getLast_update() {
		return last_update;
	}

	public void setLast_update(Date last_update) {
		this.last_update = last_update;
	}

}
