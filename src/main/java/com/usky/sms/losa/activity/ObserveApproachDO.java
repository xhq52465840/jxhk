package com.usky.sms.losa.activity;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;


/**
 * 观察活动下稳定进近参数表
 */
@Entity
@Table(name = "L_OBSERVE_APPROACH")
@Comment("观察活动下稳定进近参数表")
public class ObserveApproachDO extends AbstractBaseDO{

	private static final long serialVersionUID = 549471905132246366L;

	/** 创建人 */
	private Integer creator;

	/** 更新人 */
	private Integer lastModifier;

	/** 观察活动ID */
	private Integer observeId;

	/** 目标空速误差在-5至+15之间(1500英尺) */
	private boolean targetAirspeedAbove1500;

	/** 垂直速度≤1000 ft/min(1500英尺) */
	private boolean verticalVelocity1500;

	/** 稳定的发动机功率(1500英尺) */
	private boolean runningEngine1500;

	/** 着陆构型（襟缝翼位置/起落架放下）(1500英尺) */
	private boolean loadingType1500;

	/** 稳定的航向道跟踪或着陆航迹(1500英尺) */
	private boolean stableCrouse1500;

	/** 稳定的下滑道跟踪或下降率(1500英尺) */
	private boolean stableSlop1500;

	/** 目标空速误差在-5至+15之间(1000英尺) */
	private boolean targetAirspeedAbove1000;

	/** 垂直速度≤1000 ft/min(1000英尺) */
	private boolean verticalVelocity1000;

	/** 稳定的发动机功率(1000英尺) */
	private boolean runningEngine1000;

	/** 着陆构型（襟缝翼位置/起落架放下）(1000英尺) */
	private boolean loadingType1000;

	/** 稳定的航向道跟踪或着陆航迹(1000英尺) */
	private boolean stableCrouse1000;

	/** 稳定的下滑道跟踪或下降率(1000英尺) */
	private boolean stableSlop1000;

	/** 目标空速误差在-5至+15之间(500英尺) */
	private boolean targetAirspeedAbove500;

	/** 垂直速度≤1000 ft/min(500英尺) */
	private boolean verticalVelocity500;

	/** 稳定的发动机功率(500英尺) */
	private boolean runningEngine500;

	/** 着陆构型（襟缝翼位置/起落架放下）(500英尺) */
	private boolean loadingType500;

	/** 稳定的航向道跟踪或着陆航迹(500英尺) */
	private boolean stableCrouse500;

	/** 稳定的下滑道跟踪或下降率(500英尺) */
	private boolean stableSlop500;

	/** 进近次数 */
	private Integer approachTime;
	
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

	@Column(name = "OBSERVE_ID")
	@Comment("观察活动ID")
	public Integer getObserveId() {
		return observeId;
	}

	public void setObserveId(Integer observeId) {
		this.observeId = observeId;
	}

	@Column(name = "TARGET_AIRSPEED_ABOVE_1500")
	@Comment("目标空速误差在-5至+15之间(1500英尺)")
	public boolean isTargetAirspeedAbove1500() {
		return targetAirspeedAbove1500;
	}

	public void setTargetAirspeedAbove1500(boolean targetAirspeedAbove1500) {
		this.targetAirspeedAbove1500 = targetAirspeedAbove1500;
	}

	@Column(name = "VERTICAL_VELOCITY_1500")
	@Comment("垂直速度≤1000 ft/min(1500英尺)")
	public boolean isVerticalVelocity1500() {
		return verticalVelocity1500;
	}

	public void setVerticalVelocity1500(boolean verticalVelocity1500) {
		this.verticalVelocity1500 = verticalVelocity1500;
	}

	@Column(name = "RUNNING_ENGINE_1500")
	@Comment("稳定的发动机功率(1500英尺)")
	public boolean isRunningEngine1500() {
		return runningEngine1500;
	}

	public void setRunningEngine1500(boolean runningEngine1500) {
		this.runningEngine1500 = runningEngine1500;
	}

	@Column(name = "LOADING＿TYPE_1500")
	@Comment("着陆构型（襟缝翼位置/起落架放下）(1500英尺)")
	public boolean isLoadingType1500() {
		return loadingType1500;
	}

	public void setLoadingType1500(boolean loadingType1500) {
		this.loadingType1500 = loadingType1500;
	}

	@Column(name = "STABLE_CROUSE_1500")
	@Comment("稳定的航向道跟踪或着陆航迹(1500英尺)")
	public boolean isStableCrouse1500() {
		return stableCrouse1500;
	}

	public void setStableCrouse1500(boolean stableCrouse1500) {
		this.stableCrouse1500 = stableCrouse1500;
	}

	@Column(name = "STABLE_SLOP_1500")
	@Comment("稳定的下滑道跟踪或下降率(1500英尺)")
	public boolean isStableSlop1500() {
		return stableSlop1500;
	}

	public void setStableSlop1500(boolean stableSlop1500) {
		this.stableSlop1500 = stableSlop1500;
	}

	@Column(name = "TARGET_AIRSPEED_ABOVE_1000")
	@Comment("目标空速误差在-5至+15之间(1000英尺)")
	public boolean isTargetAirspeedAbove1000() {
		return targetAirspeedAbove1000;
	}

	public void setTargetAirspeedAbove1000(boolean targetAirspeedAbove1000) {
		this.targetAirspeedAbove1000 = targetAirspeedAbove1000;
	}

	@Column(name = "VERTICAL_VELOCITY_1000")
	@Comment("垂直速度≤1000 ft/min(1000英尺)")
	public boolean isVerticalVelocity1000() {
		return verticalVelocity1000;
	}

	public void setVerticalVelocity1000(boolean verticalVelocity1000) {
		this.verticalVelocity1000 = verticalVelocity1000;
	}

	@Column(name = "RUNNING_ENGINE_1000")
	@Comment("稳定的发动机功率(1000英尺)")
	public boolean isRunningEngine1000() {
		return runningEngine1000;
	}

	public void setRunningEngine1000(boolean runningEngine1000) {
		this.runningEngine1000 = runningEngine1000;
	}

	@Column(name = "LOADING＿TYPE_1000")
	@Comment("着陆构型（襟缝翼位置/起落架放下）(1000英尺)")
	public boolean isLoadingType1000() {
		return loadingType1000;
	}

	public void setLoadingType1000(boolean loadingType1000) {
		this.loadingType1000 = loadingType1000;
	}

	@Column(name = "STABLE_CROUSE_1000")
	@Comment("稳定的航向道跟踪或着陆航迹(1000英尺)")
	public boolean isStableCrouse1000() {
		return stableCrouse1000;
	}

	public void setStableCrouse1000(boolean stableCrouse1000) {
		this.stableCrouse1000 = stableCrouse1000;
	}

	@Column(name = "STABLE_SLOP_1000")
	@Comment("稳定的下滑道跟踪或下降率(1000英尺)")
	public boolean isStableSlop1000() {
		return stableSlop1000;
	}

	public void setStableSlop1000(boolean stableSlop1000) {
		this.stableSlop1000 = stableSlop1000;
	}

	@Column(name = "TARGET_AIRSPEED_ABOVE_500")
	@Comment("目标空速误差在-5至+15之间(500英尺)")
	public boolean isTargetAirspeedAbove500() {
		return targetAirspeedAbove500;
	}

	public void setTargetAirspeedAbove500(boolean targetAirspeedAbove500) {
		this.targetAirspeedAbove500 = targetAirspeedAbove500;
	}

	@Column(name = "VERTICAL_VELOCITY_500")
	@Comment("垂直速度≤1000 ft/min(500英尺)")
	public boolean isVerticalVelocity500() {
		return verticalVelocity500;
	}

	public void setVerticalVelocity500(boolean verticalVelocity500) {
		this.verticalVelocity500 = verticalVelocity500;
	}

	@Column(name = "RUNNING_ENGINE_500")
	@Comment("稳定的发动机功率(500英尺)")
	public boolean isRunningEngine500() {
		return runningEngine500;
	}

	public void setRunningEngine500(boolean runningEngine500) {
		this.runningEngine500 = runningEngine500;
	}

	@Column(name = "LOADING＿TYPE_500")
	@Comment("着陆构型（襟缝翼位置/起落架放下）(500英尺)")
	public boolean isLoadingType500() {
		return loadingType500;
	}

	public void setLoadingType500(boolean loadingType500) {
		this.loadingType500 = loadingType500;
	}

	@Column(name = "STABLE_CROUSE_500")
	@Comment("稳定的航向道跟踪或着陆航迹(500英尺)")
	public boolean isStableCrouse500() {
		return stableCrouse500;
	}

	public void setStableCrouse500(boolean stableCrouse500) {
		this.stableCrouse500 = stableCrouse500;
	}

	@Column(name = "STABLE_SLOP_500")
	@Comment("稳定的下滑道跟踪或下降率(500英尺)")
	public boolean isStableSlop500() {
		return stableSlop500;
	}

	public void setStableSlop500(boolean stableSlop500) {
		this.stableSlop500 = stableSlop500;
	}

	@Column(name = "APPROACH_TIME")
	@Comment("进近次数")
	public Integer getApproachTime() {
		return approachTime;
	}

	public void setApproachTime(Integer approachTime) {
		this.approachTime = approachTime;
	}

}
