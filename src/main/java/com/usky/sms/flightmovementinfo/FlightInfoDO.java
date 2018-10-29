package com.usky.sms.flightmovementinfo;

import org.hibernate.cfg.Comment;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.Transient;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "yxw_tb_flightmovementinfo")
@Comment("QAR 航班信息")
public class FlightInfoDO extends AbstractBaseDO {

	private static final long serialVersionUID = -7707998909599617826L;

	private Integer flightInfoID;// 航班ID

	private String tailNO;// 机号

	private Integer foisid;// 现保系统航班ID

	private String carrier;// 承运人代码

	private String flightNO;// 航班号

	private String suffix;

	private String fleetCode;

	private Date flightUTCDate;// 航班日期(北京时间)

	private Date flightBJDate;// 航班日期(BJ)

	private String planDeptAirport;// 计划起飞机场三字码

	private String planArrAirport;// 计划到达机场三字码

	private String deptAirport;// 实际起飞机场三字码

	private String arrAirport;// 实际到达机场三字码
	
	/** 计划起飞机场四字码 */
	private String planDeptAirportCaoCode;
	
	/** 计划到达机场四字码 */
	private String planArrAirportCaoCode;
	
	/** 实际起飞机场四字码 */
	private String deptAirportCaoCode;
	
	/** 实际到达机场四字码 */
	private String arrAirportCaoCode;

	private Date std;// 计划起飞时间（北京时间）

	private Date sta;// 计划到达时间(北京时间)

	private Date etd;// 预计起飞时间(北京时间)

	private Date eta;// 预计到达时间(北京时间)

	private Date atd;// 实际起飞时间(北京时间)

	private Date ata;// 实际到达时间(北京时间)

	private String carrierCode;

	private String publishCarrierCode;

	private Date cdmetd;// CDM预飞时间

	private Integer cdmSeq;// CDM排队顺序

	private String statusCode;// 航班状态(计划取消 D,恢复 R, 动态取消 C)

	private String reasonRemark;// 延误原因说明

	private String flightServiceType;// 航班类型(正班，加班，包机)

	private Date cabinCloseTime;// 关客舱门时间(北京时间)

	private Date cargoClosetime;// 关货舱门时间(北京时间)

	private Date BlockOffTime;// 撤轮档时间(北京时间)

	private Date takeOffTime;// 起飞时间(北京时间)

	private Date landingTime;// 落地时间(北京时间)

	private Date blockOnTime;// 上轮档时间(北京时间)

	private Date cabinOpenTime;// 开客舱门时间(北京时间)

	private Date cargoOpenTime;// 开货舱门时间(北京时间)

	private String internationalFlight;// 航班类型(I国际,D国内)

	private String isReturnFlight;// 是否为返航航班

	private String isDelayFlight;

	private Integer delayTime;

	private Integer flyState;

	private Integer flightStatus;
	
	/** 桥位号 */
	private String deptBay;

	private String isAltnFlight;

	private Date cancelTime;

	private String flgPatch;

	private Integer state;// 状态值(正常(0)、删除(1))

	private Date addTime;// 添加时间

	private Date updTime;// 修改时间

	private String isArchived;// 是否已存档

	private Date timestamp;

	private String flightlinearea;

	private Date SMS_UPDATE_TIME;
	
	@Column
	@Comment("航班ID")
	public Integer getFlightInfoID() {
		return flightInfoID;
	}

	public void setFlightInfoID(Integer flightInfoID) {
		this.flightInfoID = flightInfoID;
	}

	@Column(length = 5)
	@Comment("机号")
	public String getTailNO() {
		return tailNO;
	}

	public void setTailNO(String tailNO) {
		this.tailNO = tailNO;
	}

	@Column
	@Comment("现保系统航班ID")
	public Integer getFoisid() {
		return foisid;
	}

	public void setFoisid(Integer foisid) {
		this.foisid = foisid;
	}

	@Column(length = 4)
	@Comment("承运人代码")
	public String getCarrier() {
		return carrier;
	}

	public void setCarrier(String carrier) {
		this.carrier = carrier;
	}

	@Column(length = 6)
	@Comment("航班号")
	public String getFlightNO() {
		return flightNO;
	}

	public void setFlightNO(String flightNO) {
		this.flightNO = flightNO;
	}

	@Column(length = 1)
	@Comment("")
	public String getSuffix() {
		return suffix;
	}

	public void setSuffix(String suffix) {
		this.suffix = suffix;
	}

	@Column(length = 10)
	@Comment("")
	public String getFleetCode() {
		return fleetCode;
	}

	public void setFleetCode(String fleetCode) {
		this.fleetCode = fleetCode;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("航班日期(北京时间)")
	public Date getFlightUTCDate() {
		return flightUTCDate;
	}

	public void setFlightUTCDate(Date flightUTCDate) {
		this.flightUTCDate = flightUTCDate;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("航班日期(BJ)")
	public Date getFlightBJDate() {
		return flightBJDate;
	}

	public void setFlightBJDate(Date flightBJDate) {
		this.flightBJDate = flightBJDate;
	}

	@Column(length = 3)
	@Comment("实际起飞机场三字码")
	public String getPlanDeptAirport() {
		return planDeptAirport;
	}

	public void setPlanDeptAirport(String planDeptAirport) {
		this.planDeptAirport = planDeptAirport;
	}

	@Column(length = 3)
	@Comment("实际到达机场三字码")
	public String getPlanArrAirport() {
		return planArrAirport;
	}

	public void setPlanArrAirport(String planArrAirport) {
		this.planArrAirport = planArrAirport;
	}

	@Column(length = 3)
	public String getDeptAirport() {
		return deptAirport;
	}

	public void setDeptAirport(String deptAirport) {
		this.deptAirport = deptAirport;
	}

	@Column(length = 3)
	public String getArrAirport() {
		return arrAirport;
	}

	public void setArrAirport(String arrAirport) {
		this.arrAirport = arrAirport;
	}

	@Column(name = "PLAN_DPT_APT_CAO_CD", length = 4)
	@Comment("实际起飞机场四字码")
	public String getPlanDeptAirportCaoCode() {
		return planDeptAirportCaoCode;
	}

	public void setPlanDeptAirportCaoCode(String planDeptAirportCaoCode) {
		this.planDeptAirportCaoCode = planDeptAirportCaoCode;
	}

	@Column(name = "PLAN_ARR_APT_CAO_CD", length = 4)
	@Comment("实际到达机场四字码")
	public String getPlanArrAirportCaoCode() {
		return planArrAirportCaoCode;
	}

	public void setPlanArrAirportCaoCode(String planArrAirportCaoCode) {
		this.planArrAirportCaoCode = planArrAirportCaoCode;
	}

	@Column(name = "DPT_APT_CAO_CD", length = 4)
	public String getDeptAirportCaoCode() {
		return deptAirportCaoCode;
	}

	public void setDeptAirportCaoCode(String deptAirportCaoCode) {
		this.deptAirportCaoCode = deptAirportCaoCode;
	}

	@Column(name = "ARR_APT_CAO_CD", length = 4)
	public String getArrAirportCaoCode() {
		return arrAirportCaoCode;
	}

	public void setArrAirportCaoCode(String arrAirportCaoCode) {
		this.arrAirportCaoCode = arrAirportCaoCode;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("计划起飞时间（北京时间）")
	public Date getStd() {
		return std;
	}

	public void setStd(Date std) {
		this.std = std;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("计划到达时间(北京时间)")
	public Date getSta() {
		return sta;
	}

	public void setSta(Date sta) {
		this.sta = sta;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("预计起飞时间(北京时间)")
	public Date getEtd() {
		return etd;
	}

	public void setEtd(Date etd) {
		this.etd = etd;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("预计到达时间(北京时间)")
	public Date getEta() {
		return eta;
	}

	public void setEta(Date eta) {
		this.eta = eta;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("实际起飞时间(北京时间)")
	public Date getAtd() {
		return atd;
	}

	public void setAtd(Date atd) {
		this.atd = atd;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("实际到达时间(北京时间)")
	public Date getAta() {
		return ata;
	}

	public void setAta(Date ata) {
		this.ata = ata;
	}

	@Column(length = 5)
	@Comment("")
	public String getCarrierCode() {
		return carrierCode;
	}

	public void setCarrierCode(String carrierCode) {
		this.carrierCode = carrierCode;
	}

	@Column(length = 5)
	@Comment("")
	public String getPublishCarrierCode() {
		return publishCarrierCode;
	}

	public void setPublishCarrierCode(String publishCarrierCode) {
		this.publishCarrierCode = publishCarrierCode;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("CDM预飞时间")
	public Date getCdmetd() {
		return cdmetd;
	}

	public void setCdmetd(Date cdmetd) {
		this.cdmetd = cdmetd;
	}

	@Column
	@Comment("CDM排队顺序")
	public Integer getCdmSeq() {
		return cdmSeq;
	}

	public void setCdmSeq(Integer cdmSeq) {
		this.cdmSeq = cdmSeq;
	}

	@Column(length = 1)
	@Comment("航班状态(计划取消 D,恢复 R, 动态取消 C)")
	public String getStatusCode() {
		return statusCode;
	}

	public void setStatusCode(String statusCode) {
		this.statusCode = statusCode;
	}

	@Transient
	// @Column(length = 255)
	@Comment("延误原因说明")
	public String getReasonRemark() {
		return reasonRemark;
	}

	public void setReasonRemark(String reasonRemark) {
		this.reasonRemark = reasonRemark;
	}

	@Column(length = 1)
	@Comment("航班类型(正班，加班，包机)")
	public String getFlightServiceType() {
		return flightServiceType;
	}

	public void setFlightServiceType(String flightServiceType) {
		this.flightServiceType = flightServiceType;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("关客舱门时间(北京时间)")
	public Date getCabinCloseTime() {
		return cabinCloseTime;
	}

	public void setCabinCloseTime(Date cabinCloseTime) {
		this.cabinCloseTime = cabinCloseTime;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("关货舱门时间(北京时间)")
	public Date getCargoClosetime() {
		return cargoClosetime;
	}

	public void setCargoClosetime(Date cargoClosetime) {
		this.cargoClosetime = cargoClosetime;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("撤轮档时间(北京时间)")
	public Date getBlockOffTime() {
		return BlockOffTime;
	}

	public void setBlockOffTime(Date blockOffTime) {
		BlockOffTime = blockOffTime;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("起飞时间(北京时间)")
	public Date getTakeOffTime() {
		return takeOffTime;
	}

	public void setTakeOffTime(Date takeOffTime) {
		this.takeOffTime = takeOffTime;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("落地时间(北京时间)")
	public Date getLandingTime() {
		return landingTime;
	}

	public void setLandingTime(Date landingTime) {
		this.landingTime = landingTime;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("上轮档时间(北京时间)")
	public Date getBlockOnTime() {
		return blockOnTime;
	}

	public void setBlockOnTime(Date blockOnTime) {
		this.blockOnTime = blockOnTime;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("开客舱门时间(北京时间)")
	public Date getCabinOpenTime() {
		return cabinOpenTime;
	}

	public void setCabinOpenTime(Date cabinOpenTime) {
		this.cabinOpenTime = cabinOpenTime;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("开货舱门时间(北京时间)")
	public Date getCargoOpenTime() {
		return cargoOpenTime;
	}

	public void setCargoOpenTime(Date cargoOpenTime) {
		this.cargoOpenTime = cargoOpenTime;
	}

	@Column(length = 1)
	@Comment("航班类型(I国际,D国内)")
	public String getInternationalFlight() {
		return internationalFlight;
	}

	public void setInternationalFlight(String internationalFlight) {
		this.internationalFlight = internationalFlight;
	}

	@Column(length = 1)
	@Comment("是否为返航航班")
	public String getIsReturnFlight() {
		return isReturnFlight;
	}

	public void setIsReturnFlight(String isReturnFlight) {
		this.isReturnFlight = isReturnFlight;
	}

	@Column(length = 1)
	@Comment("")
	public String getIsDelayFlight() {
		return isDelayFlight;
	}

	public void setIsDelayFlight(String isDelayFlight) {
		this.isDelayFlight = isDelayFlight;
	}

	@Column
	@Comment("")
	public Integer getDelayTime() {
		return delayTime;
	}

	public void setDelayTime(Integer delayTime) {
		this.delayTime = delayTime;
	}

	@Column
	@Comment("状态值(正常(0)、删除(1))")
	public Integer getFlyState() {
		return flyState;
	}

	public void setFlyState(Integer flyState) {
		this.flyState = flyState;
	}

	@Column
	@Comment("")
	public Integer getFlightStatus() {
		return flightStatus;
	}

	public void setFlightStatus(Integer flightStatus) {
		this.flightStatus = flightStatus;
	}

	@Column(name = "DEPT_BAY")
	@Comment("桥位号")
	public String getDeptBay() {
		return deptBay;
	}

	public void setDeptBay(String deptBay) {
		this.deptBay = deptBay;
	}

	@Column(length = 1)
	@Comment("")
	public String getIsAltnFlight() {
		return isAltnFlight;
	}

	public void setIsAltnFlight(String isAltnFlight) {
		this.isAltnFlight = isAltnFlight;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getCancelTime() {
		return cancelTime;
	}

	public void setCancelTime(Date cancelTime) {
		this.cancelTime = cancelTime;
	}

	@Column(length = 1)
	@Comment("")
	public String getFlgPatch() {
		return flgPatch;
	}

	public void setFlgPatch(String flgPatch) {
		this.flgPatch = flgPatch;
	}

	@Column
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
	@Comment("")
	public Date getTimestamp() {
		return timestamp;
	}

	public void setTimestamp(Date timestamp) {
		this.timestamp = timestamp;
	}

	@Column(length = 50)
	@Comment("")
	public String getFlightlinearea() {
		return flightlinearea;
	}

	public void setFlightlinearea(String flightlinearea) {
		this.flightlinearea = flightlinearea;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getSMS_UPDATE_TIME() {
		return SMS_UPDATE_TIME;
	}

	public void setSMS_UPDATE_TIME(Date sMS_UPDATE_TIME) {
		SMS_UPDATE_TIME = sMS_UPDATE_TIME;
	}

}
