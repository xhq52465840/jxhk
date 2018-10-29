package com.usky.sms.flightmovementinfo;

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
 * 排班计划
 */
@Entity
@Table(name = "YXW_TB_FLIGHTCREWSCHEDULEINFO")
@Comment("QAR 排班计划")
public class FlightCrewScheduleInfoDO implements Serializable {
	private static final long serialVersionUID = 6330645825947709908L;
	private String flightCrewInfoID;
	private String p_code;
	private Integer flightInfoID;
	private Date flight_date;
	private String fxw_id;
	private String rank_no;
	private String rank_name;
	private String crew_link_line;
	private Integer fjs_order;
	private String id_no;
	private String ts_flag;
	private String ac_type;
	private String flight_flag;
	private String companyCode;
	private String source;
	private Integer state;
	private Date addTime;
	private Date updTime;
	private String isArchived;
	private Integer rec_id;
	private Integer crewflightid;
	private Date sms_update_time;

	@Id
	@Column(length = 36)
	@Comment("")
	public String getFlightCrewInfoID() {
		return flightCrewInfoID;
	}

	public void setFlightCrewInfoID(String flightCrewInfoID) {
		this.flightCrewInfoID = flightCrewInfoID;
	}

	@Column(length = 20)
	@Comment("")
	public String getP_code() {
		return p_code;
	}

	public void setP_code(String p_code) {
		this.p_code = p_code;
	}

	@Column
	@Comment("")
	public Integer getFlightInfoID() {
		return flightInfoID;
	}

	public void setFlightInfoID(Integer flightInfoID) {
		this.flightInfoID = flightInfoID;
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

	@Column(length = 20)
	@Comment("")
	public String getFxw_id() {
		return fxw_id;
	}

	public void setFxw_id(String fxw_id) {
		this.fxw_id = fxw_id;
	}

	@Column(length = 20)
	@Comment("")
	public String getRank_no() {
		return rank_no;
	}

	public void setRank_no(String rank_no) {
		this.rank_no = rank_no;
	}

	@Column(length = 20)
	@Comment("")
	public String getRank_name() {
		return rank_name;
	}

	public void setRank_name(String rank_name) {
		this.rank_name = rank_name;
	}

	@Column(length = 20)
	@Comment("")
	public String getCrew_link_line() {
		return crew_link_line;
	}

	public void setCrew_link_line(String crew_link_line) {
		this.crew_link_line = crew_link_line;
	}

	@Column
	@Comment("")
	public Integer getFjs_order() {
		return fjs_order;
	}

	public void setFjs_order(Integer fjs_order) {
		this.fjs_order = fjs_order;
	}

	@Column(length = 50)
	@Comment("")
	public String getId_no() {
		return id_no;
	}

	public void setId_no(String id_no) {
		this.id_no = id_no;
	}

	@Column(length = 10)
	@Comment("")
	public String getTs_flag() {
		return ts_flag;
	}

	public void setTs_flag(String ts_flag) {
		this.ts_flag = ts_flag;
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
	public String getFlight_flag() {
		return flight_flag;
	}

	public void setFlight_flag(String flight_flag) {
		this.flight_flag = flight_flag;
	}

	@Column(length = 10)
	@Comment("")
	public String getCompanyCode() {
		return companyCode;
	}

	public void setCompanyCode(String companyCode) {
		this.companyCode = companyCode;
	}

	@Column(length = 10)
	@Comment("")
	public String getSource() {
		return source;
	}

	public void setSource(String source) {
		this.source = source;
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

	@Column
	@Comment("")
	public Integer getRec_id() {
		return rec_id;
	}

	public void setRec_id(Integer rec_id) {
		this.rec_id = rec_id;
	}

	@Column
	@Comment("")
	public Integer getCrewflightid() {
		return crewflightid;
	}

	public void setCrewflightid(Integer crewflightid) {
		this.crewflightid = crewflightid;
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

}
