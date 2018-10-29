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
import javax.persistence.Transient;

/**
 * 机组人员
 */
@Entity
@Table(name = "YXW_TM_CR_FLIGHTCREWMEMBER")
@Comment("QAR 机组人员")
public class FlightCrewMemberDO implements Serializable {
	private static final long serialVersionUID = 3453650845019856528L;
	private String flightCrewMemberID;
	private String p_code;
	private Integer fxw_id;
	private String work_no;
	private String c_name;
	private String py_abbr;
	private String e_first_name;
	private String e_name;
	private Date birth_date;
	private String sex;
	private String id_no;
	private String companyCode;
	private String dep_code;
	private String is_ground;
	private String post_duty;
	private String post_rank;
	private Date work_date;
	private String college;
	private Date en_date;
	private Date grad_date;
	private String culture;
	private String speciality;
	private String work_type;
	private String address;
	private String phone;
	private String office_tel;
	private String mobil_no;
	private String tall;
	private String mate_yn;
	private Date party_date;
	private String nativer;
	private String party;
	private String weight;
	private Date enter_date;
	private String en_native;
	private String born_in;
	private String e_born_in;
	private String en_address;
	private String valid_flag;
	private String board_no;
	private String icao_bng;
	private Date icao_check_date;
	private Date icao_over_date;
	private String temp_filiale;
	private String hlname;
	private String filiale;
	private Integer state;
	private Date addTime;
	private Date updTime;
	private String isArchived;
	private Date sms_update_time;

	@Id
	@Column(length = 36)
	@Comment("")
	public String getFlightCrewMemberID() {
		return flightCrewMemberID;
	}

	public void setFlightCrewMemberID(String flightCrewMemberID) {
		this.flightCrewMemberID = flightCrewMemberID;
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
	public Integer getFxw_id() {
		return fxw_id;
	}

	public void setFxw_id(Integer fxw_id) {
		this.fxw_id = fxw_id;
	}

	@Column(length = 20)
	@Comment("")
	public String getWork_no() {
		return work_no;
	}

	public void setWork_no(String work_no) {
		this.work_no = work_no;
	}

	@Column(length = 50)
	@Comment("")
	public String getC_name() {
		return c_name;
	}

	public void setC_name(String c_name) {
		this.c_name = c_name;
	}

	@Column(length = 100)
	@Comment("")
	public String getPy_abbr() {
		return py_abbr;
	}

	public void setPy_abbr(String py_abbr) {
		this.py_abbr = py_abbr;
	}

	@Column(length = 30)
	@Comment("")
	public String getE_first_name() {
		return e_first_name;
	}

	public void setE_first_name(String e_first_name) {
		this.e_first_name = e_first_name;
	}

	@Column(length = 50)
	@Comment("")
	public String getE_name() {
		return e_name;
	}

	public void setE_name(String e_name) {
		this.e_name = e_name;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getBirth_date() {
		return birth_date;
	}

	public void setBirth_date(Date birth_date) {
		this.birth_date = birth_date;
	}

	@Column(length = 20)
	@Comment("")
	public String getSex() {
		return sex;
	}

	public void setSex(String sex) {
		this.sex = sex;
	}

	@Column(length = 50)
	@Comment("")
	public String getId_no() {
		return id_no;
	}

	public void setId_no(String id_no) {
		this.id_no = id_no;
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
	public String getDep_code() {
		return dep_code;
	}

	public void setDep_code(String dep_code) {
		this.dep_code = dep_code;
	}

	@Column(length = 20)
	@Comment("")
	public String getIs_ground() {
		return is_ground;
	}

	public void setIs_ground(String is_ground) {
		this.is_ground = is_ground;
	}

	@Column(length = 20)
	@Comment("")
	public String getPost_duty() {
		return post_duty;
	}

	public void setPost_duty(String post_duty) {
		this.post_duty = post_duty;
	}

	@Column(length = 20)
	@Comment("")
	public String getPost_rank() {
		return post_rank;
	}

	public void setPost_rank(String post_rank) {
		this.post_rank = post_rank;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getWork_date() {
		return work_date;
	}

	public void setWork_date(Date work_date) {
		this.work_date = work_date;
	}

	@Column(length = 30)
	@Comment("")
	public String getCollege() {
		return college;
	}

	public void setCollege(String college) {
		this.college = college;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getEn_date() {
		return en_date;
	}

	public void setEn_date(Date en_date) {
		this.en_date = en_date;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getGrad_date() {
		return grad_date;
	}

	public void setGrad_date(Date grad_date) {
		this.grad_date = grad_date;
	}

	@Column(length = 30)
	@Comment("")
	public String getCulture() {
		return culture;
	}

	public void setCulture(String culture) {
		this.culture = culture;
	}

	@Column(length = 30)
	@Comment("")
	public String getSpeciality() {
		return speciality;
	}

	public void setSpeciality(String speciality) {
		this.speciality = speciality;
	}

	@Column(length = 30)
	@Comment("")
	public String getWork_type() {
		return work_type;
	}

	public void setWork_type(String work_type) {
		this.work_type = work_type;
	}

	@Transient
	@Comment("")
	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	@Column(length = 20)
	@Comment("")
	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	@Column(length = 20)
	@Comment("")
	public String getOffice_tel() {
		return office_tel;
	}

	public void setOffice_tel(String office_tel) {
		this.office_tel = office_tel;
	}

	@Column(length = 20)
	@Comment("")
	public String getMobil_no() {
		return mobil_no;
	}

	public void setMobil_no(String mobil_no) {
		this.mobil_no = mobil_no;
	}

	@Column(length = 20)
	@Comment("")
	public String getTall() {
		return tall;
	}

	public void setTall(String tall) {
		this.tall = tall;
	}

	@Column(length = 20)
	@Comment("")
	public String getMate_yn() {
		return mate_yn;
	}

	public void setMate_yn(String mate_yn) {
		this.mate_yn = mate_yn;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getParty_date() {
		return party_date;
	}

	public void setParty_date(Date party_date) {
		this.party_date = party_date;
	}

	@Column(length = 20, name = "native")
	@Comment("")
	public String getNativer() {
		return nativer;
	}

	public void setNativer(String nativer) {
		this.nativer = nativer;
	}

	@Column(length = 20)
	@Comment("")
	public String getParty() {
		return party;
	}

	public void setParty(String party) {
		this.party = party;
	}

	@Column(length = 20)
	@Comment("")
	public String getWeight() {
		return weight;
	}

	public void setWeight(String weight) {
		this.weight = weight;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getEnter_date() {
		return enter_date;
	}

	public void setEnter_date(Date enter_date) {
		this.enter_date = enter_date;
	}

	@Column(length = 20)
	@Comment("")
	public String getEn_native() {
		return en_native;
	}

	public void setEn_native(String en_native) {
		this.en_native = en_native;
	}

	@Column(length = 20)
	@Comment("")
	public String getBorn_in() {
		return born_in;
	}

	public void setBorn_in(String born_in) {
		this.born_in = born_in;
	}

	@Column(length = 50)
	@Comment("")
	public String getE_born_in() {
		return e_born_in;
	}

	public void setE_born_in(String e_born_in) {
		this.e_born_in = e_born_in;
	}

	@Column(length = 200)
	@Comment("")
	public String getEn_address() {
		return en_address;
	}

	public void setEn_address(String en_address) {
		this.en_address = en_address;
	}

	@Column(length = 20)
	@Comment("")
	public String getValid_flag() {
		return valid_flag;
	}

	public void setValid_flag(String valid_flag) {
		this.valid_flag = valid_flag;
	}

	@Column(length = 20)
	@Comment("")
	public String getBoard_no() {
		return board_no;
	}

	public void setBoard_no(String board_no) {
		this.board_no = board_no;
	}

	@Column(length = 10)
	@Comment("")
	public String getIcao_bng() {
		return icao_bng;
	}

	public void setIcao_bng(String icao_bng) {
		this.icao_bng = icao_bng;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getIcao_check_date() {
		return icao_check_date;
	}

	public void setIcao_check_date(Date icao_check_date) {
		this.icao_check_date = icao_check_date;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getIcao_over_date() {
		return icao_over_date;
	}

	public void setIcao_over_date(Date icao_over_date) {
		this.icao_over_date = icao_over_date;
	}

	@Column(length = 20)
	@Comment("")
	public String getTemp_filiale() {
		return temp_filiale;
	}

	public void setTemp_filiale(String temp_filiale) {
		this.temp_filiale = temp_filiale;
	}

	@Column(length = 20)
	@Comment("")
	public String getHlname() {
		return hlname;
	}

	public void setHlname(String hlname) {
		this.hlname = hlname;
	}

	@Column(length = 20)
	public String getFiliale() {
		return filiale;
	}

	public void setFiliale(String filiale) {
		this.filiale = filiale;
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
