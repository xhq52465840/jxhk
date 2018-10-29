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
import javax.persistence.Transient;

/**
 * 具备特殊机场能力
 */
@Entity
@Table(name = "YXW_TB_CREWSPECAIRPORTINFO")
@IdClass(CrewSpecAirportInfoId.class)
@Comment("QAR 具备特殊机场能力")
public class CrewSpecAirportInfoDO implements Serializable {
	private static final long serialVersionUID = -6312218070774957949L;
	private String p_code;
	private String valid_flag;
	private String rank_no;
	private String airport_code;
	private String chinese_name;
	private String rank_name;
	private Date first_date;
	private Date last_date;
	private Integer state;
	private Date addTime;
	private Date updTime;
	private String isArchived;
	private Date sms_update_time;
	
	/** 城市code */
	private String cityCode;

	/** 城市中文名称 */
	private String cityNameCn;
	
	@Id
	@Column(length = 10)
	@Comment("")
	public String getP_code() {
		return p_code;
	}

	public void setP_code(String p_code) {
		this.p_code = p_code;
	}

	@Id
	@Column(length = 1)
	@Comment("")
	public String getValid_flag() {
		return valid_flag;
	}

	public void setValid_flag(String valid_flag) {
		this.valid_flag = valid_flag;
	}

	@Id
	@Column(length = 20)
	@Comment("")
	public String getRank_no() {
		return rank_no;
	}

	public void setRank_no(String rank_no) {
		this.rank_no = rank_no;
	}

	@Id
	@Column(length = 3)
	@Comment("")
	public String getAirport_code() {
		return airport_code;
	}

	public void setAirport_code(String airport_code) {
		this.airport_code = airport_code;
	}

	@Column(length = 20)
	@Comment("")
	public String getChinese_name() {
		return chinese_name;
	}

	public void setChinese_name(String chinese_name) {
		this.chinese_name = chinese_name;
	}

	@Column(length = 20)
	@Comment("")
	public String getRank_name() {
		return rank_name;
	}

	public void setRank_name(String rank_name) {
		this.rank_name = rank_name;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getFirst_date() {
		return first_date;
	}

	public void setFirst_date(Date first_date) {
		this.first_date = first_date;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getLast_date() {
		return last_date;
	}

	public void setLast_date(Date last_date) {
		this.last_date = last_date;
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

	@Transient
	@Comment("城市code")
	public String getCityCode() {
		return cityCode;
	}

	public void setCityCode(String cityCode) {
		this.cityCode = cityCode;
	}

	@Transient
	@Comment("城市中文名称")
	public String getCityNameCn() {
		return cityNameCn;
	}

	public void setCityNameCn(String cityNameCn) {
		this.cityNameCn = cityNameCn;
	}

}
