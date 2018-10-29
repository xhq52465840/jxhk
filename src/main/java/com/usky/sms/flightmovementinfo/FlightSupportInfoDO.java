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

@Entity
@Table(name = "YXW_TB_FLIGHTSUPPORTINFO")
@Comment("QAR")
public class FlightSupportInfoDO implements Serializable {

	private static final long serialVersionUID = 9159293248260606426L;

	private Integer flightInfoId;

	private Integer foisid;

	private String carrier;

	private String flightNo;

	private String suffix;

	private String tailNo;

	private Date flightUTCDate;

	private Date flightBJDate;

	private String deptAirport;

	private Date std;

	private String handLingGrad;

	private String checkInCounter;

	private Date countEropenUTCTime;

	private Date counterCloseUTCTime;

	private String deptTerminal;

	private String deptbay;

	private String deptGate;

	private String arrbay;

	private String arrGate;

	private String arrteminal;

	private Integer deicingStatus;

	private Date deicingUTCTime;

	private Integer vipCarStatus;

	private Date vipCarUTCTime;

	private Integer ferrybusstatus;

	private Date ferrybusUTCTime;

	private String bagclaim;

	private Integer state;

	private Date addTime;

	private Date updTime;

	private String idArchived;

	private Date cdmetd;

	private Date sms_date_Time;

	@Id
	@Column
	@Comment("")
	public Integer getFlightInfoId() {
		return flightInfoId;
	}

	public void setFlightInfoId(Integer flightInfoId) {
		this.flightInfoId = flightInfoId;
	}

	@Column
	@Comment("")
	public Integer getFoisid() {
		return foisid;
	}

	public void setFoisid(Integer foisid) {
		this.foisid = foisid;
	}

	@Column(length = 3)
	@Comment("")
	public String getCarrier() {
		return carrier;
	}

	public void setCarrier(String carrier) {
		this.carrier = carrier;
	}

	@Column(length = 6)
	@Comment("")
	public String getFlightNo() {
		return flightNo;
	}

	public void setFlightNo(String flightNo) {
		this.flightNo = flightNo;
	}

	@Column(length = 1)
	@Comment("")
	public String getSuffix() {
		return suffix;
	}

	public void setSuffix(String suffix) {
		this.suffix = suffix;
	}

	@Column(length = 5)
	@Comment("")
	public String getTailNo() {
		return tailNo;
	}

	public void setTailNo(String tailNo) {
		this.tailNo = tailNo;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getFlightUTCDate() {
		return flightUTCDate;
	}

	public void setFlightUTCDate(Date flightUTCDate) {
		this.flightUTCDate = flightUTCDate;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getFlightBJDate() {
		return flightBJDate;
	}

	public void setFlightBJDate(Date flightBJDate) {
		this.flightBJDate = flightBJDate;
	}

	@Column(length = 3)
	@Comment("")
	public String getDeptAirport() {
		return deptAirport;
	}

	public void setDeptAirport(String deptAirport) {
		this.deptAirport = deptAirport;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getStd() {
		return std;
	}

	public void setStd(Date std) {
		this.std = std;
	}

	@Column(length = 8)
	@Comment("")
	public String getHandLingGrad() {
		return handLingGrad;
	}

	public void setHandLingGrad(String handLingGrad) {
		this.handLingGrad = handLingGrad;
	}

	@Column(length = 10)
	@Comment("")
	public String getCheckInCounter() {
		return checkInCounter;
	}

	public void setCheckInCounter(String checkInCounter) {
		this.checkInCounter = checkInCounter;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getCountEropenUTCTime() {
		return countEropenUTCTime;
	}

	public void setCountEropenUTCTime(Date countEropenUTCTime) {
		this.countEropenUTCTime = countEropenUTCTime;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getCounterCloseUTCTime() {
		return counterCloseUTCTime;
	}

	public void setCounterCloseUTCTime(Date counterCloseUTCTime) {
		this.counterCloseUTCTime = counterCloseUTCTime;
	}

	@Column(length = 10)
	@Comment("")
	public String getDeptTerminal() {
		return deptTerminal;
	}

	public void setDeptTerminal(String deptTerminal) {
		this.deptTerminal = deptTerminal;
	}

	@Column(length = 10)
	@Comment("")
	public String getDeptbay() {
		return deptbay;
	}

	public void setDeptbay(String deptbay) {
		this.deptbay = deptbay;
	}

	@Column(length = 50)
	@Comment("")
	public String getDeptGate() {
		return deptGate;
	}

	public void setDeptGate(String deptGate) {
		this.deptGate = deptGate;
	}

	@Column(length = 10)
	@Comment("")
	public String getArrbay() {
		return arrbay;
	}

	public void setArrbay(String arrbay) {
		this.arrbay = arrbay;
	}

	@Column(length = 50)
	@Comment("")
	public String getArrGate() {
		return arrGate;
	}

	public void setArrGate(String arrGate) {
		this.arrGate = arrGate;
	}

	@Column(length = 10)
	@Comment("")
	public String getArrteminal() {
		return arrteminal;
	}

	public void setArrteminal(String arrteminal) {
		this.arrteminal = arrteminal;
	}

	@Column
	@Comment("")
	public Integer getDeicingStatus() {
		return deicingStatus;
	}

	public void setDeicingStatus(Integer deicingStatus) {
		this.deicingStatus = deicingStatus;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getDeicingUTCTime() {
		return deicingUTCTime;
	}

	public void setDeicingUTCTime(Date deicingUTCTime) {
		this.deicingUTCTime = deicingUTCTime;
	}

	@Column
	@Comment("")
	public Integer getVipCarStatus() {
		return vipCarStatus;
	}

	public void setVipCarStatus(Integer vipCarStatus) {
		this.vipCarStatus = vipCarStatus;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getVipCarUTCTime() {
		return vipCarUTCTime;
	}

	public void setVipCarUTCTime(Date vipCarUTCTime) {
		this.vipCarUTCTime = vipCarUTCTime;
	}

	@Column
	@Comment("")
	public Integer getFerrybusstatus() {
		return ferrybusstatus;
	}

	public void setFerrybusstatus(Integer ferrybusstatus) {
		this.ferrybusstatus = ferrybusstatus;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getFerrybusUTCTime() {
		return ferrybusUTCTime;
	}

	public void setFerrybusUTCTime(Date ferrybusUTCTime) {
		this.ferrybusUTCTime = ferrybusUTCTime;
	}

	@Column(length = 10)
	@Comment("")
	public String getBagclaim() {
		return bagclaim;
	}

	public void setBagclaim(String bagclaim) {
		this.bagclaim = bagclaim;
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
	public String getIdArchived() {
		return idArchived;
	}

	public void setIdArchived(String idArchived) {
		this.idArchived = idArchived;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getCdmetd() {
		return cdmetd;
	}

	public void setCdmetd(Date cdmetd) {
		this.cdmetd = cdmetd;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getSms_date_Time() {
		return sms_date_Time;
	}

	public void setSms_date_Time(Date sms_date_Time) {
		this.sms_date_Time = sms_date_Time;
	}

}
