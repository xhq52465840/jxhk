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
 * 舱单
 */
@Entity
@Table(name = "YXW_TM_LSP_LOADSHEET")
@Comment("QAR 舱单")
public class LoadSheetDO implements Serializable {

	private static final long serialVersionUID = -3131449377316553687L;

	private String reportID;

	private Integer flightInfoID;

	private String tailNo;

	private String flightNo;

	private String deptAirport;

	private String arrAirport;

	private Date flightDate;

	private Date flightBJDate;

	private String flightLayout;

	private Integer compartmentsTotalLoad;

	private Integer compartmentsLoad1;

	private Integer compartmentsLoad2;

	private Integer compartmentsLoad3;

	private Integer compartmentsLoad4;

	private Integer compartmentsLoad5;

	private Integer passengerWeight;

	private Integer adultPassenger;

	private Integer childPassenger;

	private Integer babyPassenger;

	private Integer fstCheckInPax;

	private Integer busCheckInPax;

	private Integer encCheckInPax;

	private Double maxZeroFuel;

	private Double maxTakeOffWeight;

	private Double maxLandingWeight;

	private Integer seating0A;

	private Integer seating0B;

	private Integer seating0C;

	private Double bag;

	private Double tra;

	private Double trafer;

	private Double trapos;

	private Double trabag;

	private Double tratra;

	private Double bagp;

	private Double ttl;

	private Double cab;

	private Double dryWeight;

	private Double actualZeroFuel;

	private Double takeOffFuel;

	private Double takeOffActualWeight;

	private Double tripFuel;

	private Double actualLandingWeight;

	private Double bw;

	private Double bi;

	private Double fre;

	private Double pos;

	private Double maxTrafficLoad;

	private Double totalTrafficLoad;

	private Double underLoadBeforeLMC;

	private String source;

	private Date sendTime;

	private Integer state;

	private Date addTime;

	private Date updTime;

	private String isArchived;

	private Date localtime;

	private Date sms_update_time;

	@Id
	@Column(length = 36)
	@Comment("")
	public String getReportID() {
		return reportID;
	}

	public void setReportID(String reportID) {
		this.reportID = reportID;
	}

	@Column
	@Comment("")
	public Integer getFlightInfoID() {
		return flightInfoID;
	}

	public void setFlightInfoID(Integer flightInfoID) {
		this.flightInfoID = flightInfoID;
	}

	@Column(length = 5)
	@Comment("")
	public String getTailNo() {
		return tailNo;
	}

	public void setTailNo(String tailNo) {
		this.tailNo = tailNo;
	}

	@Column(length = 10)
	@Comment("")
	public String getFlightNo() {
		return flightNo;
	}

	public void setFlightNo(String flightNo) {
		this.flightNo = flightNo;
	}

	@Column(length = 3)
	@Comment("")
	public String getDeptAirport() {
		return deptAirport;
	}

	public void setDeptAirport(String deptAirport) {
		this.deptAirport = deptAirport;
	}

	@Column(length = 3)
	@Comment("")
	public String getArrAirport() {
		return arrAirport;
	}

	public void setArrAirport(String arrAirport) {
		this.arrAirport = arrAirport;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getFlightDate() {
		return flightDate;
	}

	public void setFlightDate(Date flightDate) {
		this.flightDate = flightDate;
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

	@Column(length = 15)
	@Comment("")
	public String getFlightLayout() {
		return flightLayout;
	}

	public void setFlightLayout(String flightLayout) {
		this.flightLayout = flightLayout;
	}

	@Column
	@Comment("")
	public Integer getCompartmentsTotalLoad() {
		return compartmentsTotalLoad;
	}

	public void setCompartmentsTotalLoad(Integer compartmentsTotalLoad) {
		this.compartmentsTotalLoad = compartmentsTotalLoad;
	}

	@Column
	@Comment("")
	public Integer getCompartmentsLoad1() {
		return compartmentsLoad1;
	}

	public void setCompartmentsLoad1(Integer compartmentsLoad1) {
		this.compartmentsLoad1 = compartmentsLoad1;
	}

	@Column
	@Comment("")
	public Integer getCompartmentsLoad2() {
		return compartmentsLoad2;
	}

	public void setCompartmentsLoad2(Integer compartmentsLoad2) {
		this.compartmentsLoad2 = compartmentsLoad2;
	}

	@Column
	@Comment("")
	public Integer getCompartmentsLoad3() {
		return compartmentsLoad3;
	}

	public void setCompartmentsLoad3(Integer compartmentsLoad3) {
		this.compartmentsLoad3 = compartmentsLoad3;
	}

	@Column
	@Comment("")
	public Integer getCompartmentsLoad4() {
		return compartmentsLoad4;
	}

	public void setCompartmentsLoad4(Integer compartmentsLoad4) {
		this.compartmentsLoad4 = compartmentsLoad4;
	}

	@Column
	@Comment("")
	public Integer getCompartmentsLoad5() {
		return compartmentsLoad5;
	}

	public void setCompartmentsLoad5(Integer compartmentsLoad5) {
		this.compartmentsLoad5 = compartmentsLoad5;
	}

	@Column
	@Comment("")
	public Integer getPassengerWeight() {
		return passengerWeight;
	}

	public void setPassengerWeight(Integer passengerWeight) {
		this.passengerWeight = passengerWeight;
	}

	@Column
	@Comment("")
	public Integer getAdultPassenger() {
		return adultPassenger;
	}

	public void setAdultPassenger(Integer adultPassenger) {
		this.adultPassenger = adultPassenger;
	}

	@Column
	@Comment("")
	public Integer getChildPassenger() {
		return childPassenger;
	}

	public void setChildPassenger(Integer childPassenger) {
		this.childPassenger = childPassenger;
	}

	@Column
	@Comment("")
	public Integer getBabyPassenger() {
		return babyPassenger;
	}

	public void setBabyPassenger(Integer babyPassenger) {
		this.babyPassenger = babyPassenger;
	}

	@Column
	@Comment("")
	public Integer getFstCheckInPax() {
		return fstCheckInPax;
	}

	public void setFstCheckInPax(Integer fstCheckInPax) {
		this.fstCheckInPax = fstCheckInPax;
	}

	@Column
	@Comment("")
	public Integer getBusCheckInPax() {
		return busCheckInPax;
	}

	public void setBusCheckInPax(Integer busCheckInPax) {
		this.busCheckInPax = busCheckInPax;
	}

	@Column
	@Comment("")
	public Integer getEncCheckInPax() {
		return encCheckInPax;
	}

	public void setEncCheckInPax(Integer encCheckInPax) {
		this.encCheckInPax = encCheckInPax;
	}

	@Column
	@Comment("")
	public Double getMaxZeroFuel() {
		return maxZeroFuel;
	}

	public void setMaxZeroFuel(Double maxZeroFuel) {
		this.maxZeroFuel = maxZeroFuel;
	}

	@Column
	@Comment("")
	public Double getMaxTakeOffWeight() {
		return maxTakeOffWeight;
	}

	public void setMaxTakeOffWeight(Double maxTakeOffWeight) {
		this.maxTakeOffWeight = maxTakeOffWeight;
	}

	@Column
	@Comment("")
	public Double getMaxLandingWeight() {
		return maxLandingWeight;
	}

	public void setMaxLandingWeight(Double maxLandingWeight) {
		this.maxLandingWeight = maxLandingWeight;
	}

	@Column
	@Comment("")
	public Integer getSeating0A() {
		return seating0A;
	}

	public void setSeating0A(Integer seating0a) {
		seating0A = seating0a;
	}

	@Column
	@Comment("")
	public Integer getSeating0B() {
		return seating0B;
	}

	public void setSeating0B(Integer seating0b) {
		seating0B = seating0b;
	}

	@Column
	@Comment("")
	public Integer getSeating0C() {
		return seating0C;
	}

	public void setSeating0C(Integer seating0c) {
		seating0C = seating0c;
	}

	@Column
	@Comment("")
	public Double getBag() {
		return bag;
	}

	public void setBag(Double bag) {
		this.bag = bag;
	}

	@Column
	@Comment("")
	public Double getTra() {
		return tra;
	}

	public void setTra(Double tra) {
		this.tra = tra;
	}

	@Column
	@Comment("")
	public Double getTrafer() {
		return trafer;
	}

	public void setTrafer(Double trafer) {
		this.trafer = trafer;
	}

	@Column
	@Comment("")
	public Double getTrapos() {
		return trapos;
	}

	public void setTrapos(Double trapos) {
		this.trapos = trapos;
	}

	@Column
	@Comment("")
	public Double getTrabag() {
		return trabag;
	}

	public void setTrabag(Double trabag) {
		this.trabag = trabag;
	}

	@Column
	@Comment("")
	public Double getTratra() {
		return tratra;
	}

	public void setTratra(Double tratra) {
		this.tratra = tratra;
	}

	@Column
	@Comment("")
	public Double getBagp() {
		return bagp;
	}

	public void setBagp(Double bagp) {
		this.bagp = bagp;
	}

	@Column
	@Comment("")
	public Double getTtl() {
		return ttl;
	}

	public void setTtl(Double ttl) {
		this.ttl = ttl;
	}

	@Column
	@Comment("")
	public Double getCab() {
		return cab;
	}

	public void setCab(Double cab) {
		this.cab = cab;
	}

	@Column
	@Comment("")
	public Double getDryWeight() {
		return dryWeight;
	}

	public void setDryWeight(Double dryWeight) {
		this.dryWeight = dryWeight;
	}

	@Column
	@Comment("")
	public Double getActualZeroFuel() {
		return actualZeroFuel;
	}

	public void setActualZeroFuel(Double actualZeroFuel) {
		this.actualZeroFuel = actualZeroFuel;
	}

	@Column
	@Comment("")
	public Double getTakeOffFuel() {
		return takeOffFuel;
	}

	public void setTakeOffFuel(Double takeOffFuel) {
		this.takeOffFuel = takeOffFuel;
	}

	@Column
	@Comment("")
	public Double getTakeOffActualWeight() {
		return takeOffActualWeight;
	}

	public void setTakeOffActualWeight(Double takeOffActualWeight) {
		this.takeOffActualWeight = takeOffActualWeight;
	}

	@Column
	@Comment("")
	public Double getTripFuel() {
		return tripFuel;
	}

	public void setTripFuel(Double tripFuel) {
		this.tripFuel = tripFuel;
	}

	@Column
	@Comment("")
	public Double getActualLandingWeight() {
		return actualLandingWeight;
	}

	public void setActualLandingWeight(Double actualLandingWeight) {
		this.actualLandingWeight = actualLandingWeight;
	}

	@Column
	@Comment("")
	public Double getBw() {
		return bw;
	}

	public void setBw(Double bw) {
		this.bw = bw;
	}

	@Column
	@Comment("")
	public Double getBi() {
		return bi;
	}

	public void setBi(Double bi) {
		this.bi = bi;
	}

	@Column
	@Comment("")
	public Double getFre() {
		return fre;
	}

	public void setFre(Double fre) {
		this.fre = fre;
	}

	@Column
	public Double getPos() {
		return pos;
	}

	public void setPos(Double pos) {
		this.pos = pos;
	}

	@Column
	@Comment("")
	public Double getMaxTrafficLoad() {
		return maxTrafficLoad;
	}

	public void setMaxTrafficLoad(Double maxTrafficLoad) {
		this.maxTrafficLoad = maxTrafficLoad;
	}

	@Column
	@Comment("")
	public Double getTotalTrafficLoad() {
		return totalTrafficLoad;
	}

	public void setTotalTrafficLoad(Double totalTrafficLoad) {
		this.totalTrafficLoad = totalTrafficLoad;
	}

	@Column
	@Comment("")
	public Double getUnderLoadBeforeLMC() {
		return underLoadBeforeLMC;
	}

	public void setUnderLoadBeforeLMC(Double underLoadBeforeLMC) {
		this.underLoadBeforeLMC = underLoadBeforeLMC;
	}

	@Column(length = 10)
	@Comment("")
	public String getSource() {
		return source;
	}

	public void setSource(String source) {
		this.source = source;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getSendTime() {
		return sendTime;
	}

	public void setSendTime(Date sendTime) {
		this.sendTime = sendTime;
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
	public Date getLocaltime() {
		return localtime;
	}

	public void setLocaltime(Date localtime) {
		this.localtime = localtime;
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
