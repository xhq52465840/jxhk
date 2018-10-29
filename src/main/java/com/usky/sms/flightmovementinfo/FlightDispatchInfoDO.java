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
 * 航班签派情况(包含燃油)
 */

@Entity
@Table(name = "YXW_TB_FLIGHTDISPATCHINFO")
@Comment("QAR 航班签派情况(包含燃油)")
public class FlightDispatchInfoDO implements Serializable {
	private static final long serialVersionUID = 194847990155166188L;
	private Integer flightInfoID;
	private String dispatchDesk;
	private String dispatcher;
	private Date releaseTime;
	private String releaseMessage;
	private Date secondReleaseTime;
	private Double planBlockOffFuel;
	private Double planTakeOffFuel;
	private Double planLandingFuel;
	private Double planBlockOnFuel;
	private Double planAltnFuel;
	private Double realBlockOffFuel;
	private Double realTakeOffFuel;
	private Double realLandingFuel;
	private Double realBlockOnFuel;
	private String deptAltnFirstAirport;
	private String deptAltnSecondAirport;
	private String routeAltnFirstAirport;
	private String routeAltnSecondAirport;
	private String arrAltnFirstAirport;
	private String arrAltnsecondAirport;
	private String routes;
	private Integer state;
	private Date addTime;
	private Date updTime;
	private String isArchived;
	private Double adjustedMTOW;
	private Double burn;
	private Double finalBlockOffFuel;
	private Double finalBlockOnFuel;
	private Double finalLandingFuel;
	private Double finalSavedFuel;
	private Double finalTakeOffFuel;
	private Double landingWeight;
	private Double maxLandingWeight;
	private Double maxPLCapability;
	private Double maxZeroFuelWeight;
	private Double newAddedFuel;
	private Double operatingEmptyWeight;
	private Double payloadO;
	private Double retentionFuel;
	private Double takeOffWeight;
	private Double zeroFuelWeight;
	private Integer pampfuel;
	private String planRouteNum;
	private Double routeDistance;
	private Date sms_update_time;
	private Double plantakeofffuel_ktl;

	@Id
	@Column
	@Comment("")
	public Integer getFlightInfoID() {
		return flightInfoID;
	}

	public void setFlightInfoID(Integer flightInfoID) {
		this.flightInfoID = flightInfoID;
	}

	@Column(length = 10)
	@Comment("")
	public String getDispatchDesk() {
		return dispatchDesk;
	}

	public void setDispatchDesk(String dispatchDesk) {
		this.dispatchDesk = dispatchDesk;
	}

	@Column(length = 50)
	@Comment("")
	public String getDispatcher() {
		return dispatcher;
	}

	public void setDispatcher(String dispatcher) {
		this.dispatcher = dispatcher;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getReleaseTime() {
		return releaseTime;
	}

	public void setReleaseTime(Date releaseTime) {
		this.releaseTime = releaseTime;
	}

	@Transient
	@Comment("")
	public String getReleaseMessage() {
		return releaseMessage;
	}

	public void setReleaseMessage(String releaseMessage) {
		this.releaseMessage = releaseMessage;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getSecondReleaseTime() {
		return secondReleaseTime;
	}

	public void setSecondReleaseTime(Date secondReleaseTime) {
		this.secondReleaseTime = secondReleaseTime;
	}

	@Column
	@Comment("")
	public Double getPlanBlockOffFuel() {
		return planBlockOffFuel;
	}

	public void setPlanBlockOffFuel(Double planBlockOffFuel) {
		this.planBlockOffFuel = planBlockOffFuel;
	}

	@Column
	@Comment("")
	public Double getPlanTakeOffFuel() {
		return planTakeOffFuel;
	}

	public void setPlanTakeOffFuel(Double planTakeOffFuel) {
		this.planTakeOffFuel = planTakeOffFuel;
	}

	@Column
	@Comment("")
	public Double getPlanLandingFuel() {
		return planLandingFuel;
	}

	public void setPlanLandingFuel(Double planLandingFuel) {
		this.planLandingFuel = planLandingFuel;
	}

	@Column
	@Comment("")
	public Double getPlanBlockOnFuel() {
		return planBlockOnFuel;
	}

	public void setPlanBlockOnFuel(Double planBlockOnFuel) {
		this.planBlockOnFuel = planBlockOnFuel;
	}

	@Column
	@Comment("")
	public Double getPlanAltnFuel() {
		return planAltnFuel;
	}

	public void setPlanAltnFuel(Double planAltnFuel) {
		this.planAltnFuel = planAltnFuel;
	}

	@Column
	@Comment("")
	public Double getRealBlockOffFuel() {
		return realBlockOffFuel;
	}

	public void setRealBlockOffFuel(Double realBlockOffFuel) {
		this.realBlockOffFuel = realBlockOffFuel;
	}

	@Column
	@Comment("")
	public Double getRealTakeOffFuel() {
		return realTakeOffFuel;
	}

	public void setRealTakeOffFuel(Double realTakeOffFuel) {
		this.realTakeOffFuel = realTakeOffFuel;
	}

	@Column
	@Comment("")
	public Double getRealLandingFuel() {
		return realLandingFuel;
	}

	public void setRealLandingFuel(Double realLandingFuel) {
		this.realLandingFuel = realLandingFuel;
	}

	@Column
	@Comment("")
	public Double getRealBlockOnFuel() {
		return realBlockOnFuel;
	}

	public void setRealBlockOnFuel(Double realBlockOnFuel) {
		this.realBlockOnFuel = realBlockOnFuel;
	}

	@Column(length = 4)
	@Comment("")
	public String getDeptAltnFirstAirport() {
		return deptAltnFirstAirport;
	}

	public void setDeptAltnFirstAirport(String deptAltnFirstAirport) {
		this.deptAltnFirstAirport = deptAltnFirstAirport;
	}

	@Column(length = 4)
	@Comment("")
	public String getDeptAltnSecondAirport() {
		return deptAltnSecondAirport;
	}

	public void setDeptAltnSecondAirport(String deptAltnSecondAirport) {
		this.deptAltnSecondAirport = deptAltnSecondAirport;
	}

	@Column(length = 4)
	@Comment("")
	public String getRouteAltnFirstAirport() {
		return routeAltnFirstAirport;
	}

	public void setRouteAltnFirstAirport(String routeAltnFirstAirport) {
		this.routeAltnFirstAirport = routeAltnFirstAirport;
	}

	@Column(length = 4)
	@Comment("")
	public String getRouteAltnSecondAirport() {
		return routeAltnSecondAirport;
	}

	public void setRouteAltnSecondAirport(String routeAltnSecondAirport) {
		this.routeAltnSecondAirport = routeAltnSecondAirport;
	}

	@Column(length = 4)
	@Comment("")
	public String getArrAltnFirstAirport() {
		return arrAltnFirstAirport;
	}

	public void setArrAltnFirstAirport(String arrAltnFirstAirport) {
		this.arrAltnFirstAirport = arrAltnFirstAirport;
	}

	@Column(length = 4)
	@Comment("")
	public String getArrAltnsecondAirport() {
		return arrAltnsecondAirport;
	}

	public void setArrAltnsecondAirport(String arrAltnsecondAirport) {
		this.arrAltnsecondAirport = arrAltnsecondAirport;
	}

	@Column(length = 500)
	@Comment("")
	public String getRoutes() {
		return routes;
	}

	public void setRoutes(String routes) {
		this.routes = routes;
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
	public Double getAdjustedMTOW() {
		return adjustedMTOW;
	}

	public void setAdjustedMTOW(Double adjustedMTOW) {
		this.adjustedMTOW = adjustedMTOW;
	}

	@Column
	@Comment("")
	public Double getBurn() {
		return burn;
	}

	public void setBurn(Double burn) {
		this.burn = burn;
	}

	@Column
	@Comment("")
	public Double getFinalBlockOffFuel() {
		return finalBlockOffFuel;
	}

	public void setFinalBlockOffFuel(Double finalBlockOffFuel) {
		this.finalBlockOffFuel = finalBlockOffFuel;
	}

	@Column
	@Comment("")
	public Double getFinalBlockOnFuel() {
		return finalBlockOnFuel;
	}

	public void setFinalBlockOnFuel(Double finalBlockOnFuel) {
		this.finalBlockOnFuel = finalBlockOnFuel;
	}

	@Column
	@Comment("")
	public Double getFinalLandingFuel() {
		return finalLandingFuel;
	}

	public void setFinalLandingFuel(Double finalLandingFuel) {
		this.finalLandingFuel = finalLandingFuel;
	}

	@Column
	@Comment("")
	public Double getFinalSavedFuel() {
		return finalSavedFuel;
	}

	public void setFinalSavedFuel(Double finalSavedFuel) {
		this.finalSavedFuel = finalSavedFuel;
	}

	@Column
	@Comment("")
	public Double getFinalTakeOffFuel() {
		return finalTakeOffFuel;
	}

	public void setFinalTakeOffFuel(Double finalTakeOffFuel) {
		this.finalTakeOffFuel = finalTakeOffFuel;
	}

	@Column
	@Comment("")
	public Double getLandingWeight() {
		return landingWeight;
	}

	public void setLandingWeight(Double landingWeight) {
		this.landingWeight = landingWeight;
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
	public Double getMaxPLCapability() {
		return maxPLCapability;
	}

	public void setMaxPLCapability(Double maxPLCapability) {
		this.maxPLCapability = maxPLCapability;
	}

	@Column
	@Comment("")
	public Double getMaxZeroFuelWeight() {
		return maxZeroFuelWeight;
	}

	public void setMaxZeroFuelWeight(Double maxZeroFuelWeight) {
		this.maxZeroFuelWeight = maxZeroFuelWeight;
	}

	@Column
	@Comment("")
	public Double getNewAddedFuel() {
		return newAddedFuel;
	}

	public void setNewAddedFuel(Double newAddedFuel) {
		this.newAddedFuel = newAddedFuel;
	}

	@Column
	@Comment("")
	public Double getOperatingEmptyWeight() {
		return operatingEmptyWeight;
	}

	public void setOperatingEmptyWeight(Double operatingEmptyWeight) {
		this.operatingEmptyWeight = operatingEmptyWeight;
	}

	@Column
	@Comment("")
	public Double getPayloadO() {
		return payloadO;
	}

	public void setPayloadO(Double payloadO) {
		this.payloadO = payloadO;
	}

	@Column
	@Comment("")
	public Double getRetentionFuel() {
		return retentionFuel;
	}

	public void setRetentionFuel(Double retentionFuel) {
		this.retentionFuel = retentionFuel;
	}

	@Column
	@Comment("")
	public Double getTakeOffWeight() {
		return takeOffWeight;
	}

	public void setTakeOffWeight(Double takeOffWeight) {
		this.takeOffWeight = takeOffWeight;
	}

	@Column
	public Double getZeroFuelWeight() {
		return zeroFuelWeight;
	}

	public void setZeroFuelWeight(Double zeroFuelWeight) {
		this.zeroFuelWeight = zeroFuelWeight;
	}

	@Column
	@Comment("")
	public Integer getPampfuel() {
		return pampfuel;
	}

	public void setPampfuel(Integer pampfuel) {
		this.pampfuel = pampfuel;
	}

	@Column(length = 50)
	@Comment("")
	public String getPlanRouteNum() {
		return planRouteNum;
	}

	public void setPlanRouteNum(String planRouteNum) {
		this.planRouteNum = planRouteNum;
	}

	@Column
	@Comment("")
	public Double getRouteDistance() {
		return routeDistance;
	}

	public void setRouteDistance(Double routeDistance) {
		this.routeDistance = routeDistance;
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

	@Column
	@Comment("")
	public Double getPlantakeofffuel_ktl() {
		return plantakeofffuel_ktl;
	}

	public void setPlantakeofffuel_ktl(Double plantakeofffuel_ktl) {
		this.plantakeofffuel_ktl = plantakeofffuel_ktl;
	}

}
