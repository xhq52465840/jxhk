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
 * 客舱服务人员
 */
@Entity
@Table(name = "YXW_TM_CR_CABINCREWMEMBER")
@Comment("QAR 客舱服务人员")
public class CabinCrewMemberDO implements Serializable {

	private static final long serialVersionUID = -8747300862466787825L;

	private Integer staff_ID;
	private String org_code;
	private String cancel_sign;
	private String staff_name;
	private String eng_surname;
	private String eng_name;
	private String sex;
	private String nationality;
	private String board_card_no;
	private String eng_native_place;
	private String eng_family_address;
	private String mobile_tel;
	private String level;
	private String rank;
	private String aero_unit_code;
	private String passport_status;
	private String lock_1;
	private String lock_2;
	private String passport_code;
	private String grant_date;
	private String passport_expiry;
	private String birthday;
	private String visa_code;
	private String companyCode;
	private Integer state;
	private Date addTime;
	private Date updtime;
	private String isArchived;
	private Date sms_update_time;

	@Id
	@Column
	@Comment("")
	public Integer getStaff_ID() {
		return staff_ID;
	}

	public void setStaff_ID(Integer staff_ID) {
		this.staff_ID = staff_ID;
	}
	
	@Column(length = 20)
	@Comment("")
	public String getOrg_code() {
		return org_code;
	}

	public void setOrg_code(String org_code) {
		this.org_code = org_code;
	}

	@Column(length = 10)
	@Comment("")
	public String getCancel_sign() {
		return cancel_sign;
	}

	public void setCancel_sign(String cancel_sign) {
		this.cancel_sign = cancel_sign;
	}

	@Column(length = 50)
	@Comment("")
	public String getStaff_name() {
		return staff_name;
	}

	public void setStaff_name(String staff_name) {
		this.staff_name = staff_name;
	}

	@Column(length = 100)
	@Comment("")
	public String getEng_surname() {
		return eng_surname;
	}

	public void setEng_surname(String eng_surname) {
		this.eng_surname = eng_surname;
	}

	@Column(length = 100)
	@Comment("")
	public String getEng_name() {
		return eng_name;
	}

	public void setEng_name(String eng_name) {
		this.eng_name = eng_name;
	}

	@Column(length = 2)
	@Comment("")
	public String getSex() {
		return sex;
	}

	public void setSex(String sex) {
		this.sex = sex;
	}

	@Column(length = 50)
	@Comment("")
	public String getNationality() {
		return nationality;
	}

	public void setNationality(String nationality) {
		this.nationality = nationality;
	}

	@Column(length = 50)
	@Comment("")
	public String getBoard_card_no() {
		return board_card_no;
	}

	public void setBoard_card_no(String board_card_no) {
		this.board_card_no = board_card_no;
	}

	@Column(length = 500)
	@Comment("")
	public String getEng_native_place() {
		return eng_native_place;
	}

	public void setEng_native_place(String eng_native_place) {
		this.eng_native_place = eng_native_place;
	}

	@Column(length = 1024)
	@Comment("")
	public String getEng_family_address() {
		return eng_family_address;
	}

	public void setEng_family_address(String eng_family_address) {
		this.eng_family_address = eng_family_address;
	}

	@Column(length = 50)
	@Comment("")
	public String getMobile_tel() {
		return mobile_tel;
	}

	public void setMobile_tel(String mobile_tel) {
		this.mobile_tel = mobile_tel;
	}

	@Column(name = "`LEVEL`",length = 20)
	@Comment("")
	public String getLevel() {
		return level;
	}

	public void setLevel(String level) {
		this.level = level;
	}

	@Column(length = 50)
	@Comment("")
	public String getRank() {
		return rank;
	}

	public void setRank(String rank) {
		this.rank = rank;
	}

	@Column(length = 20)
	@Comment("")
	public String getAero_unit_code() {
		return aero_unit_code;
	}

	public void setAero_unit_code(String aero_unit_code) {
		this.aero_unit_code = aero_unit_code;
	}

	@Column(length = 1)
	@Comment("")
	public String getPassport_status() {
		return passport_status;
	}

	public void setPassport_status(String passport_status) {
		this.passport_status = passport_status;
	}

	@Column(length = 1)
	@Comment("")
	public String getLock_1() {
		return lock_1;
	}

	public void setLock_1(String lock_1) {
		this.lock_1 = lock_1;
	}

	@Column(length = 1)
	@Comment("")
	public String getLock_2() {
		return lock_2;
	}

	public void setLock_2(String lock_2) {
		this.lock_2 = lock_2;
	}

	@Column(length = 20)
	@Comment("")
	public String getPassport_code() {
		return passport_code;
	}

	public void setPassport_code(String passport_code) {
		this.passport_code = passport_code;
	}

	@Column(length = 27)
	@Comment("")
	public String getGrant_date() {
		return grant_date;
	}

	public void setGrant_date(String grant_date) {
		this.grant_date = grant_date;
	}

	@Column(length = 27)
	@Comment("")
	public String getPassport_expiry() {
		return passport_expiry;
	}

	public void setPassport_expiry(String passport_expiry) {
		this.passport_expiry = passport_expiry;
	}

	@Column(length = 27)
	@Comment("")
	public String getBirthday() {
		return birthday;
	}

	public void setBirthday(String birthday) {
		this.birthday = birthday;
	}

	@Column(length = 20)
	@Comment("")
	public String getVisa_code() {
		return visa_code;
	}

	public void setVisa_code(String visa_code) {
		this.visa_code = visa_code;
	}

	@Column(length = 20)
	@Comment("")
	public String getCompanyCode() {
		return companyCode;
	}

	public void setCompanyCode(String companyCode) {
		this.companyCode = companyCode;
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
	public Date getUpdtime() {
		return updtime;
	}

	public void setUpdtime(Date updtime) {
		this.updtime = updtime;
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
