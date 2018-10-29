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
 * 护照签证信息
 */
@Entity
@Table(name = "YXW_TB_CABINLICENCEINFO")
@Comment("护照签证信息")
public class CabinLicenceInfoDO implements Serializable {

	private static final long serialVersionUID = -3752864122141374380L;

	private String lisenceInfoID;
	private String staffID;
	private String passportType;
	private String passportCode;
	private String visaCode;
	private String visaType;
	private String paspoortName;
	private Date passportValidDate;
	private String visaName;
	private Date visaValidDate;
	private Integer state;
	private Date addTime;
	private Date updTime;
	private String isArchived;
	private Date sms_update_time;

	@Id
	@Column(length = 36)
	@Comment("")
	public String getLisenceInfoID() {
		return lisenceInfoID;
	}

	public void setLisenceInfoID(String lisenceInfoID) {
		this.lisenceInfoID = lisenceInfoID;
	}

	@Column(length = 20)
	@Comment("")
	public String getStaffID() {
		return staffID;
	}

	public void setStaffID(String staffID) {
		this.staffID = staffID;
	}

	@Column(length = 10)
	@Comment("")
	public String getPassportType() {
		return passportType;
	}

	public void setPassportType(String passportType) {
		this.passportType = passportType;
	}

	@Column(length = 10)
	@Comment("")
	public String getPassportCode() {
		return passportCode;
	}

	public void setPassportCode(String passportCode) {
		this.passportCode = passportCode;
	}

	@Column(length = 10)
	@Comment("")
	public String getVisaCode() {
		return visaCode;
	}

	public void setVisaCode(String visaCode) {
		this.visaCode = visaCode;
	}

	@Column(length = 10)
	@Comment("")
	public String getVisaType() {
		return visaType;
	}

	public void setVisaType(String visaType) {
		this.visaType = visaType;
	}

	@Column(length = 20)
	@Comment("")
	public String getPaspoortName() {
		return paspoortName;
	}

	public void setPaspoortName(String paspoortName) {
		this.paspoortName = paspoortName;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getPassportValidDate() {
		return passportValidDate;
	}

	public void setPassportValidDate(Date passportValidDate) {
		this.passportValidDate = passportValidDate;
	}

	@Column(length = 10)
	@Comment("")
	public String getVisaName() {
		return visaName;
	}

	public void setVisaName(String visaName) {
		this.visaName = visaName;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getVisaValidDate() {
		return visaValidDate;
	}

	public void setVisaValidDate(Date visaValidDate) {
		this.visaValidDate = visaValidDate;
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

}
