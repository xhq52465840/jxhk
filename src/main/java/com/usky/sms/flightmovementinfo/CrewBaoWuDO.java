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
 * 具备报务能力
 */
@Entity
@Table(name = "YXW_TB_CREWBAOWU")
@Comment("具备报务能力")
public class CrewBaoWuDO implements Serializable {
	private static final long serialVersionUID = -7447973844533119148L;
	private String p_code;
	private String aera_code;
	private String bm_name;
	private Date first_date;
	private Date last_date;
	private String valid_flag;
	private String ac_type;
	private Integer state;// 状态值(正常(0)、删除(1))
	private Date addTime;// 添加时间
	private Date updTime;// 修改时间
	private String isArchived;// 是否已存档
	private Date sms_update_time;

	
	@Column(length = 10)
	@Comment("")
	public String getP_code() {
		return p_code;
	}

	public void setP_code(String p_code) {
		this.p_code = p_code;
	}
	@Id
	@Column(length = 5)
	@Comment("")
	public String getAera_code() {
		return aera_code;
	}

	public void setAera_code(String aera_code) {
		this.aera_code = aera_code;
	}

	@Column(length = 50)
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

	@Column(length = 1)
	@Comment("")
	public String getValid_flag() {
		return valid_flag;
	}

	public void setValid_flag(String valid_flag) {
		this.valid_flag = valid_flag;
	}

	@Column(length = 50)
	@Comment("")
	public String getAc_type() {
		return ac_type;
	}

	public void setAc_type(String ac_type) {
		this.ac_type = ac_type;
	}

	@Column
	@Comment("状态值(正常(0)、删除(1))")
	public Integer getState() {
		return state;
	}

	public void setState(Integer state) {
		this.state = state;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("添加时间")
	public Date getAddTime() {
		return addTime;
	}

	public void setAddTime(Date addTime) {
		this.addTime = addTime;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("修改时间")
	public Date getUpdTime() {
		return updTime;
	}

	public void setUpdTime(Date updTime) {
		this.updTime = updTime;
	}

	@Column(length = 1)
	@Comment("是否已存档")
	public String getIsArchived() {
		return isArchived;
	}

	public void setIsArchived(String isArchived) {
		this.isArchived = isArchived;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("是否已存档")
	public Date getSms_update_time() {
		return sms_update_time;
	}

	public void setSms_update_time(Date sms_update_time) {
		this.sms_update_time = sms_update_time;
	}

}
