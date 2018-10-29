package com.usky.sms.losa.plan;

import org.hibernate.cfg.Comment;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

/**
 * 审计计划表
 */
@Entity
@Table(name = "l_plan")
@Comment("LOSA 审计计划表")
public class TaskPlanDO extends AbstractBaseDO{

	private static final long serialVersionUID = -1033434333241943329L;
	
	/** 创建人 */
	private Integer creator;
	
	/** 更新人 */
	private Integer lastModifier;
	
	/** 计划状态 */
	private String planStatus;
	
	/** 计划编号 */
	private String planNo;
	
	/** 航班id */
	private Integer flightId;
	
	/** 方案 */
	private Integer schemeId;
	
	/** 计划发布时间 */
	private Date planPulishTime;
	
	/** 观察日期 */
	private Date observeDate;
	
	/** 观察员 */
	private Integer observerId;
	
	/** 计划描述 */
	private String planDescription;
	
	/** 废弃原因 */
	private String abandonReason;
	
	/** 起飞机场 */
	private String depAirportNo;
	
	/** 达到机场 */
	private String arrAirportNo;
	
	/**  */
	private String flyNo;
	
	/** 观察员编号 */
	private String observerNo;
	
	/** 飞机号 */
	private String aircraftNo;

	@Column(name = "CREATOR")
	@Comment("创建人")
	public Integer getCreator() {
		return creator;
	}

	public void setCreator(Integer creator) {
		this.creator = creator;
	}

	@Column(name = "LAST_MODIFIER")
	@Comment("更新人")
	public Integer getLastModifier() {
		return lastModifier;
	}

	public void setLastModifier(Integer lastModifier) {
		this.lastModifier = lastModifier;
	}

	@Column(name = "PLAN_STATUS")
	@Comment("计划状态")
	public String getPlanStatus() {
		return planStatus;
	}

	public void setPlanStatus(String planStatus) {
		this.planStatus = planStatus;
	}

	@Column(name = "PLAN_NO")
	@Comment("计划编号")
	public String getPlanNo() {
		return planNo;
	}

	public void setPlanNo(String planNo) {
		this.planNo = planNo;
	}

	@Column(name = "FLIGHT_ID")
	@Comment("航班id")
	public Integer getFlightId() {
		return flightId;
	}

	public void setFlightId(Integer flightId) {
		this.flightId = flightId;
	}

	@Column(name = "SCHEME_ID")
	@Comment("方案")
	public Integer getSchemeId() {
		return schemeId;
	}

	public void setSchemeId(Integer schemeId) {
		this.schemeId = schemeId;
	}

	@Column(name = "PLAN_PUBLISH_TIME")
	@Comment("计划发布时间")
	public Date getPlanPulishTime() {
		return planPulishTime;
	}

	public void setPlanPulishTime(Date planPulishTime) {
		this.planPulishTime = planPulishTime;
	}

	@Column(name = "OBSERVE_DATE")
	@Comment("观察日期")
	public Date getObserveDate() {
		return observeDate;
	}

	public void setObserveDate(Date observeDate) {
		this.observeDate = observeDate;
	}

	@Column(name = "OBSERVER_ID")
	@Comment("观察员")
	public Integer getObserverId() {
		return observerId;
	}

	public void setObserverId(Integer observerId) {
		this.observerId = observerId;
	}

	@Column(name = "PLAN_DESCRIPTION")
	@Comment("计划描述")
	public String getPlanDescription() {
		return planDescription;
	}

	public void setPlanDescription(String planDescription) {
		this.planDescription = planDescription;
	}

	@Column(name = "ABANDON_REASON")
	@Comment("废弃原因")
	public String getAbandonReason() {
		return abandonReason;
	}

	public void setAbandonReason(String abandonReason) {
		this.abandonReason = abandonReason;
	}

	@Column(name = "DEP_AIRPORT_NO")
	@Comment("起飞机场")
	public String getDepAirportNo() {
		return depAirportNo;
	}

	public void setDepAirportNo(String depAirportNo) {
		this.depAirportNo = depAirportNo;
	}

	@Column(name = "ARR_AIRPORT_NO")
	@Comment("达到机场")
	public String getArrAirportNo() {
		return arrAirportNo;
	}

	public void setArrAirportNo(String arrAirportNo) {
		this.arrAirportNo = arrAirportNo;
	}

	@Column(name = "FLIGHT_NO")
	@Comment("")
	public String getFlyNo() {
		return flyNo;
	}

	public void setFlyNo(String flyNo) {
		this.flyNo = flyNo;
	}

	@Column(name = "OBSERVER_NO")
	@Comment("观察员编号")
	public String getObserverNo() {
		return observerNo;
	}

	public void setObserverNo(String observerNo) {
		this.observerNo = observerNo;
	}

	@Column(name = "AIRCRAFT_NO")
	@Comment("飞机号")
	public String getAircraftNo() {
		return aircraftNo;
	}

	public void setAircraftNo(String aircraftNo) {
		this.aircraftNo = aircraftNo;
	}

}
