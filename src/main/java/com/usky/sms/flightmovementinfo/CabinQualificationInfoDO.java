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
 * 飞行资格
 *
 */
@Entity
@Table(name = "YXW_TB_CABINQUALIFICATIONINFO")
@Comment("QAR 飞行资格")
public class CabinQualificationInfoDO implements Serializable {

	private static final long serialVersionUID = -3411290231845247443L;

	private String staffID;
	private String staffName;
	private String stewLevel;
	private String isInspector;
	private String isTeacher;
	private String isSpecial;
	private String announcerLevel;
	private String isAnnouncer;
	private String announcerLanguage;
	private String isSafety;
	private String licenceCode;
	private Integer state;
	private Date addTime;
	private Date updTime;
	private String isArchived;
	private Date sms_update_time;
	@Id
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
	public String getStaffName() {
		return staffName;
	}

	public void setStaffName(String staffName) {
		this.staffName = staffName;
	}

	@Column(length = 20)
	@Comment("")
	public String getStewLevel() {
		return stewLevel;
	}

	public void setStewLevel(String stewLevel) {
		this.stewLevel = stewLevel;
	}

	@Column(length = 5)
	@Comment("")
	public String getIsInspector() {
		return isInspector;
	}

	public void setIsInspector(String isInspector) {
		this.isInspector = isInspector;
	}

	@Column(length = 5)
	@Comment("")
	public String getIsTeacher() {
		return isTeacher;
	}

	public void setIsTeacher(String isTeacher) {
		this.isTeacher = isTeacher;
	}

	@Column(length = 5)
	@Comment("")
	public String getIsSpecial() {
		return isSpecial;
	}

	public void setIsSpecial(String isSpecial) {
		this.isSpecial = isSpecial;
	}

	@Column(length = 5)
	@Comment("")
	public String getAnnouncerLevel() {
		return announcerLevel;
	}

	public void setAnnouncerLevel(String announcerLevel) {
		this.announcerLevel = announcerLevel;
	}

	@Column(length = 5)
	@Comment("")
	public String getIsAnnouncer() {
		return isAnnouncer;
	}

	public void setIsAnnouncer(String isAnnouncer) {
		this.isAnnouncer = isAnnouncer;
	}

	@Column(length = 20)
	@Comment("")
	public String getAnnouncerLanguage() {
		return announcerLanguage;
	}

	public void setAnnouncerLanguage(String announcerLanguage) {
		this.announcerLanguage = announcerLanguage;
	}

	@Column(length = 5)
	@Comment("")
	public String getIsSafety() {
		return isSafety;
	}

	public void setIsSafety(String isSafety) {
		this.isSafety = isSafety;
	}

	@Column(length = 5)
	@Comment("")
	public String getLicenceCode() {
		return licenceCode;
	}

	public void setLicenceCode(String licenceCode) {
		this.licenceCode = licenceCode;
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
