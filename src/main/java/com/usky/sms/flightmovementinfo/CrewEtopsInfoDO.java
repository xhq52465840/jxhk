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
 * 具备的ETOPS能力
 */
@Entity
@Table(name = "YXW_TB_CREWETOPSINFO")
@IdClass(CrewEtopsInfoId.class)
@Comment("QAR 具备的ETOPS能力")
public class CrewEtopsInfoDO implements Serializable {
	private static final long serialVersionUID = -8383206252030610686L;
	private String p_code;
	private String aera_code;
	private String ac_type;
	private String valid_flag;
	private String bm_name;
	private Date first_date;
	private Date last_date;
	private Integer state;
	private Date addtime;
	private Date updTime;
	private String isArchived;
	private Date sms_update_time;

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
	@Column(length = 10)
	@Comment("")
	public String getAera_code() {
		return aera_code;
	}

	public void setAera_code(String aera_code) {
		this.aera_code = aera_code;
	}

	@Id
	@Column(length = 5)
	@Comment("")
	public String getAc_type() {
		return ac_type;
	}

	public void setAc_type(String ac_type) {
		this.ac_type = ac_type;
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

	@Column(length = 20)
	@Comment("")
	public String getBm_name() {
		return bm_name;
	}

	public void setBm_name(String bm_name) {
		this.bm_name = bm_name;
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
	public Date getAddtime() {
		return addtime;
	}

	public void setAddtime(Date addtime) {
		this.addtime = addtime;
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

}
