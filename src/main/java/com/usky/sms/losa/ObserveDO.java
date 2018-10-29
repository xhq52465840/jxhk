package com.usky.sms.losa;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import org.hibernate.cfg.Comment;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "L_OBSERVE")
@Comment("LOSA 观察")
public class ObserveDO extends AbstractBaseDO {

	private static final long serialVersionUID = -4214697321646348561L;

	/** 创建人 */
	private Integer creator;

	/** 更新人 */
	private Integer lastModifier;

	/** 观察员的身份证明（编号） */
	private String identifyNumber;

	/** 机组观察活动编号 */
	private Long currentNumber;

	/** 观察活动编号 */
	private String activityNumber;

	/** 航班号 */
	private String flightNO;

	/** 航班日期 */
	private Date flightDate;

	/** 总机组观察活动编号 */
	private Long totalNumber;

	/** 本次观察是否观察到威胁？ */
	private boolean isExtThreat;

	/** 本次观察是否观察到威胁及次数？次数 */
	private Long threatNumber;

	/** 本次观察是否观察到差错 */
	private boolean isExtError;

	/** 本次观察是否观察到差错及次数?次数 */
	private Long errorNumber;

	/** 起降机场起飞机场 */
	private String depAirport;

	/** 起降机场降落机场 */
	private String arrAirport;

	/** 航空器型号 */
	private String aircraftType;

	/** 操纵飞机的驾驶员-机长 */
	private String aircraftCaptain;

	/** 操纵飞机的驾驶员-副驾驶 */
	private String aircraftCopilot;

	/** 航空器推出时间（UTC） */
	private Long depTime;

	/** 航空器到达停机位时间（UTC） */
	private Long arrTime;

	/** 从航空器推出至到达停机位的时间（小时：分钟） */
	private String timeForGetReady;

	/** 是否延迟离场？ */
	private String isDelay;

	/** 延迟时间（小时：分钟） */
	private String delayTime;

	/** 所属分公司-机长1 */
	private String companyCaptain1;

	/** 总经历时间-机长1 */
	private Long fullTimeCaptain1;

	/** 机长1机长飞行时间 */
	private Long CaptainFlyTime1;

	/** 本机型经历时间-机长1 */
	private Long thisAircraftTimeCaptain1;

	/** 在电传飞机上的经历时间-机长1 */
	private Long telexAircraftTimeCaptain1;

	/** 所属分公司-机长2 */
	private String companyCaptain2;

	/** 总经历时间-机长2 */
	private Long fullTimeCaptain2;

	/** 机长2机长飞行时间 */
	private Long CaptainFlyTime2;

	/** 本机型经历时间-机长2 */
	private Long thisAircraftTimeCaptain2;

	/** 在电传飞机上的经历时间-机长2 */
	private Long telexAircraftTimeCaptain2;

	/** 第一副驾驶所属分公司 */
	private String companyCopilot1;

	/** 第一副驾驶总经历时间 */
	private Long fullTimeCopilot1;

	/** 第一副驾驶本机型经历时间 */
	private Long thisAircraftTimeCopilot1;

	/** 第一副驾驶在电传飞机上的经历时间 */
	private Long telexAircraftTimeCopilot1;

	/** 第二副驾驶所属分公司 */
	private String companyCopilot2;

	/** 第二副驾驶总经历时间 */
	private Long fullTimeCopilot2;

	/** 第二副驾驶本机型经历时间 */
	private Long thisAircraftTimeCopilot2;

	/** 第二副驾驶在电传飞机上的经历时间 */
	private Long telexAircraftTimeCopilot2;

	/** 观察员位置人员职责 */
	private String dutyOfObserver;

	/** 机组相互熟悉程度-该机组共同飞行的第一个航段 */
	private String firstLegOfCrew;

	/** 机组相互熟悉程度-叙述 */
	private String beforeLeaveDesc;

	/** 离场前/滑出-SOP标准简令 */
	private String beforeLeaveBriefing;

	/** 离场前/滑出-规定的计划 */
	private String beforeLeavePlan;

	/** 离场前/滑出-工作任务分配 */
	private String beforeLeaveWorkDistribute;

	/** 离场前/滑出-应急管理 */
	private String beforeLevelEmergencyMeasure;

	/** 离场前/滑出-监控/交叉检查 */
	private String beforeLevelCheck;

	/** 离场前/滑出-工作任务管理 */
	private String beforeLevelWorkManage;

	/** 离场前/滑出-警觉性 */
	private String beforeLevelAlertness;

	/** 离场前/滑出-自动设备的管理 */
	private String beforeLevelAutoManage;

	/** 离场前/滑出-计划的评估 */
	private String beforeLevelPlanAssess;

	/** 离场前/滑出-询问 */
	private String beforeLevelQuestion;

	/** 离场前/滑出-自信 */
	private String beforeLevelConfidence;

	/** 起飞/爬升-叙述 */
	private String takeOffDesc;

	/** 起飞/爬升-监控/交叉检查 */
	private String takeOffCheck;

	/** 起飞/爬升-工作任务管理 */
	private String takeOffWorkManage;

	/** 起飞/爬升-警觉性 */
	private String takeOffAlertness;

	/** 起飞/爬升-自动设备的管理 */
	private String takeOffAutoManage;

	/** 起飞/爬升-计划的评估 */
	private String takeOffPlanAssess;

	/** 起飞/爬升-询问 */
	private String takeOffQuestion;

	/** 起飞/爬升-自信 */
	private String takeOffConfidence;

	/** 巡航-叙述 */
	private String cruiseDesc;

	/** 下降/进近/着陆技术工作单-是否在到达下降顶点（TOD）之前作出了进近简令？（是/否） */
	private boolean isMadeBriefingBeforeTod;

	/** 下降/进近/着陆技术工作单-机组是否在到达飞行管理系统（FMS）的TOD时或在此之前开始下降的？（是/否） */
	private boolean isDroBeforeTod;

	/** 下降/进近/着陆技术工作单-该航空器是否大幅度高于/低于飞行管理系统的垂直轨迹或标准的垂直轨迹？（是/否） */
	private boolean isBigMarginFly;

	/** 下降/进近/着陆技术工作单-何种进近？ */
	private String theAppoachType;

	/** 下降/进近/着陆技术工作单-进近备份或者类型 */
	private String theAppoachDesc;

	/** 下降/进近/着陆技术工作单-进近：人工飞行还是自动飞行？ */
	private String theAppoachArtificialOrAut;

	/** 下降/进近/着陆技术工作单-该航空器是否大幅高于/低于所期望的下降垂直轨迹？（是/否） */
	private boolean isBigMarginAbroveExpect;

	/** 下降/进近/着陆技术工作单-在放襟翼期间，襟翼是否被“正常”的放下？ */
	private String isFlapNormal;

	/** 下降/进近/着陆技术工作单-天气（选一） */
	private String theWeatherType;

	/** 下降/进近/着陆技术工作单-目标空速误差在-5至+15之间(above1500) */
	private boolean theTatgetAirspeedAbove1500;

	/** 下降/进近/着陆技术工作单-垂直速度≤1000 */
	private boolean theVerticalVelocity1500;

	/** 下降/进近/着陆技术工作单-发动机运转(above1500) */
	private boolean theRunningEngine1500;

	/** 下降/进近/着陆技术工作单-着陆构型（襟缝翼位置/起落架放下）(above1500) */
	private boolean loadingType1500;

	/** 高于机场标高1500英尺稳定的航向道跟踪或着陆航迹 */
	private boolean stableCrouse1500;

	/** 高于机场标高1500英尺稳定的下滑道跟踪或下降率 */
	private boolean stableSlop1500;

	/** 下降/进近/着陆技术工作单-目标空速误差在-5至+15之间(above1000) */
	private boolean theTatgetAirspeedAbove1000;

	/** 下降/进近/着陆技术工作单-垂直速度≤1000 */
	private boolean theVerticalVelocity1000;

	/** 下降/进近/着陆技术工作单-发动机运转(above1000) */
	private boolean theRunningEngine1000;

	/** 下降/进近/着陆技术工作单-着陆构型（襟缝翼位置/起落架放下）(above1000) */
	private boolean loadingType1000;

	/** 高于机场标高1000英尺稳定的航向道跟踪或着陆航迹 */
	private boolean stableCrouse1000;

	/** 高于机场标高1000英尺稳定的下滑道跟踪或下降率 */
	private boolean stableSlop1000;

	/** 下降/进近/着陆技术工作单-目标空速误差在-5至+15之间(above500) */
	private boolean theTatgetAirspeedAbove500;

	/** 下降/进近/着陆技术工作单-垂直速度≤1000 */
	private boolean theVerticalVelocity500;

	/** 下降/进近/着陆技术工作单-发动机运转(above500) */
	private boolean theRunningEngine500;

	/** 下降/进近/着陆技术工作单-着陆构型（襟缝翼位置/起落架放下）(above500) */
	private boolean loadingType500;

	/** 高于机场标高500英尺稳定的航向道跟踪或着陆航迹 */
	private boolean stableCrouse500;

	/** 高于机场标高500英尺稳定的下滑道跟踪或下降率 */
	private boolean stableSlop500;

	/** 下降/进近/着陆技术工作单-叙述 */
	private String dropDesc;

	/** 下降/进近/着陆-SOP标准简令 */
	private String loadingBriefing;

	/** 下降/进近/着陆-规定的计划 */
	private String loadingPlan;

	/** 下降/进近/着陆-工作任务分配 */
	private String loadingWorkDistribute;

	/** 下降/进近/着陆-应急管理机 */
	private String loadingEmergencyMeasure;

	/** 下降/进近/着陆-监控/交叉检查 */
	private String loadingCheck;

	/** 下降/进近/着陆-工作任务管理 */
	private String loadingWorkManage;

	/** 下降/进近/着陆-警觉性 */
	private String loadingAlertness;

	/** 下降/进近/着陆-自动设备的管理 */
	private String loadingAutoManage;

	/** 下降/进近/着陆-计划的评估 */
	private String loadingPlanAssess;

	/** 下降/进近/着陆-询问 */
	private String loadingQuestion;

	/** 下降/进近/着陆-自信 */
	private String loadingConfidence;

	/** 整个飞行-叙述 */
	private String theFlightDesc;

	/** 整个飞行-沟通环境 */
	private String theFlightCommunicationEnvir;

	/** 整个飞行-领导能力 */
	private String theFlightLeadership;

	/** 整个飞行-在该城市对的第一个航段中，你是否观察了飞行乘务员的简令？ */
	private String theFlightIsExtBrifing;

	/** 整个飞行-评分 */
	private String theFlightScore;

	/** 对机组有效性的贡献机长 */
	private String contributionOfCaptain;

	/** 对机组有效性的贡献副驾驶 */
	private String contributionOfPolit;

	/** 整个飞行-机组工作的整体有效性 */
	private String theFlightCrewValidity;

	/** 航线计划ID */
	private Integer planId;

	/** 观察活动状态 */
	private String activityStatus;

	/** 观察活动更新时间 */
	private Date activityUpdateTime;

	/** 离场前/滑出-规章及操作程序的遵守 */
	private String beforeLevelRuleOrder;

	/** 起飞/爬升-规章及操作程序的遵守 */
	private String takeoffRuleOrder;

	/** 下降/进近/着陆-规章及操作程序的遵守 */
	private String loadingRuleOrder;

	/** 下降/进近/着陆技术工作单-是否复飞 */
	private boolean isGoFly;

	/** 复飞- 目标空速误差在-5至+15之间 */
	private boolean goFlyTatgetAirspeedAbove1500;

	/** 复飞-垂直速度≤1000 ft/min */
	private boolean goFlyVerticalVelocity1500;

	/** 复飞-稳定的发动机功率 */
	private boolean goFlyRunningEngine1500;

	/** 复飞-着陆构型（襟缝翼位置/起落架放下） */
	private boolean goFlyLoadingType1500;

	/** 复飞- 稳定的航向道跟踪或着陆航迹 */
	private boolean goFlyStableCrouse1500;

	/** 复飞-稳定的下滑道跟踪或下降率 */
	private boolean goFlyStableSlop1500;

	/** 复飞-目标空速误差在-5至+15之间 */
	private String goFlyTatgetAirspeedAbove1000;

	/** 复飞-垂直速度≤1000 ft/min */
	private boolean goFlyVerticalVelocity1000;

	/** 复飞-稳定的发动机功率 */
	private boolean goFlyRunningEngine1000;

	/** 复飞-着陆构型（襟缝翼位置/起落架放下） */
	private boolean goFlyLoadingType1000;

	/** 复飞-稳定的航向道跟踪或着陆航迹 */
	private boolean goFlyStableCrouse1000;

	/** 复飞-稳定的下滑道跟踪或下降率 */
	private boolean goFlyStableSlop1000;

	/** 复飞-目标空速误差在-5至+15之间 */
	private boolean goFlyTatgetAirspeedAbove500;

	/** 复飞-垂直速度≤1000 ft/min */
	private boolean goFlyVerticalVelocity500;

	/** 复飞-稳定的发动机功率 */
	private boolean goFlyRunningEngine500;

	/** 复飞-着陆构型（襟缝翼位置/起落架放下） */
	private boolean goFlyLoadingType500;

	/** 复飞-稳定的航向道跟踪或着陆航迹 */
	private boolean goFlyStableCrouse500;

	/** 复飞-稳定的下滑道跟踪或下降率 */
	private boolean goFlyStableSlop500;

	/** 整个飞行-法规手册熟悉程度 */
	private String kownRuleLevel;

	/** 整个飞行-规范标准的执行情况 */
	private String implementRule;

	/** 整个飞行-决策能力 */
	private String decisionAbility;

	/** 整个飞行-管理与飞行技能 */
	private String manageFlightAbility;

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

	@Column(name = "IDENTIFY_NUMBER")
	@Comment("观察员的身份证明（编号）")
	public String getIdentifyNumber() {
		return identifyNumber;
	}

	public void setIdentifyNumber(String identifyNumber) {
		this.identifyNumber = identifyNumber;
	}

	@Column(name = "CURRENT_NUMBER")
	@Comment("机组观察活动编号")
	public Long getCurrentNumber() {
		return currentNumber;
	}

	public void setCurrentNumber(Long currentNumber) {
		this.currentNumber = currentNumber;
	}

	@Column(name = "ACTIVITY_NUMBER")
	@Comment("观察活动编号")
	public String getActivityNumber() {
		return activityNumber;
	}

	public void setActivityNumber(String activityNumber) {
		this.activityNumber = activityNumber;
	}

	@Column(name = "TOTAL_NUMBER")
	@Comment("总机组观察活动编号")
	public Long getTotalNumber() {
		return totalNumber;
	}

	public void setTotalNumber(Long totalNumber) {
		this.totalNumber = totalNumber;
	}

	@Column(name = "IS_EXT_THREAT")
	@Comment("本次观察是否观察到威胁？")
	public boolean getIsExtThreat() {
		return isExtThreat;
	}

	public void setIsExtThreat(boolean isExtThreat) {
		this.isExtThreat = isExtThreat;
	}

	@Column(name = "THREAT_NUMBER")
	@Comment("本次观察是否观察到威胁及次数？次数")
	public Long getThreatNumber() {
		return threatNumber;
	}

	public void setThreatNumber(Long threatNumber) {
		this.threatNumber = threatNumber;
	}

	@Column(name = "IS_EXT_ERROR")
	@Comment("本次观察是否观察到差错")
	public boolean getIsExtError() {
		return isExtError;
	}

	public void setIsExtError(boolean isExtError) {
		this.isExtError = isExtError;
	}

	@Column(name = "ERROR_NUMBER")
	@Comment("本次观察是否观察到差错及次数?次数")
	public Long getErrorNumber() {
		return errorNumber;
	}

	public void setErrorNumber(Long errorNumber) {
		this.errorNumber = errorNumber;
	}

	@Column(name = "DEP_AIRPORT")
	@Comment("起降机场起飞机场")
	public String getDepAirport() {
		return depAirport;
	}

	public void setDepAirport(String depAirport) {
		this.depAirport = depAirport;
	}

	@Column(name = "ARR_AIRPORT")
	@Comment("起降机场降落机场")
	public String getArrAirport() {
		return arrAirport;
	}

	public void setArrAirport(String arrAirport) {
		this.arrAirport = arrAirport;
	}

	@Column(name = "AIRCRAFT_TYPE")
	@Comment("航空器型号")
	public String getAircraftType() {
		return aircraftType;
	}

	public void setAircraftType(String aircraftType) {
		this.aircraftType = aircraftType;
	}

	@Column(name = "AIRCRAFT_CAPTAIN")
	@Comment("操纵飞机的驾驶员-机长")
	public String getAircraftCaptain() {
		return aircraftCaptain;
	}

	public void setAircraftCaptain(String aircraftCaptain) {
		this.aircraftCaptain = aircraftCaptain;
	}

	@Column(name = "AIRCRAFT_COPILOT")
	@Comment("操纵飞机的驾驶员-副驾驶")
	public String getAircraftCopilot() {
		return aircraftCopilot;
	}

	public void setAircraftCopilot(String aircraftCopilot) {
		this.aircraftCopilot = aircraftCopilot;
	}

	@Column(name = "DEP_TIME")
	@Comment("航空器推出时间（UTC）")
	public Long getDepTime() {
		return depTime;
	}

	public void setDepTime(Long depTime) {
		this.depTime = depTime;
	}

	@Column(name = "ARR_TIME")
	@Comment("航空器到达停机位时间（UTC）")
	public Long getArrTime() {
		return arrTime;
	}

	public void setArrTime(Long arrTime) {
		this.arrTime = arrTime;
	}

	@Column(name = "TIME_FOR_GET_READY")
	@Comment("从航空器推出至到达停机位的时间（小时：分钟）")
	public String getTimeForGetReady() {
		return timeForGetReady;
	}

	public void setTimeForGetReady(String timeForGetReady) {
		this.timeForGetReady = timeForGetReady;
	}

	@Column(name = "IS_DELAY")
	@Comment("是否延迟离场？")
	public String getIsDelay() {
		return isDelay;
	}

	public void setIsDelay(String isDelay) {
		this.isDelay = isDelay;
	}

	@Column(name = "DELAY_TIME")
	@Comment("延迟时间（小时：分钟）")
	public String getDelayTime() {
		return delayTime;
	}

	public void setDelayTime(String delayTime) {
		this.delayTime = delayTime;
	}

	@Column(name = "COMPANY_CAPTAIN1")
	@Comment("所属分公司-机长1")
	public String getCompanyCaptain1() {
		return companyCaptain1;
	}

	public void setCompanyCaptain1(String companyCaptain1) {
		this.companyCaptain1 = companyCaptain1;
	}

	@Column(name = "FULL_TIME_CAPTAIN1")
	@Comment("总经历时间-机长1")
	public Long getFullTimeCaptain1() {
		return fullTimeCaptain1;
	}

	public void setFullTimeCaptain1(Long fullTimeCaptain1) {
		this.fullTimeCaptain1 = fullTimeCaptain1;
	}

	@Column(name = "CAPTAIN_FLY_TIME1")
	@Comment("机长1机长飞行时间")
	public Long getCaptainFlyTime1() {
		return CaptainFlyTime1;
	}

	public void setCaptainFlyTime1(Long captainFlyTime1) {
		CaptainFlyTime1 = captainFlyTime1;
	}

	@Column(name = "THIS_AIRCRAFT_TIME_CAPTAIN1")
	@Comment("本机型经历时间-机长1")
	public Long getThisAircraftTimeCaptain1() {
		return thisAircraftTimeCaptain1;
	}

	public void setThisAircraftTimeCaptain1(Long thisAircraftTimeCaptain1) {
		this.thisAircraftTimeCaptain1 = thisAircraftTimeCaptain1;
	}

	@Column(name = "TELEX_AIRCRAFT_TIME_CAPTAIN1")
	@Comment("在电传飞机上的经历时间-机长1")
	public Long getTelexAircraftTimeCaptain1() {
		return telexAircraftTimeCaptain1;
	}

	public void setTelexAircraftTimeCaptain1(Long telexAircraftTimeCaptain1) {
		this.telexAircraftTimeCaptain1 = telexAircraftTimeCaptain1;
	}

	@Column(name = "COMPANY_CAPTAIN2")
	@Comment("所属分公司-机长2")
	public String getCompanyCaptain2() {
		return companyCaptain2;
	}

	public void setCompanyCaptain2(String companyCaptain2) {
		this.companyCaptain2 = companyCaptain2;
	}

	@Column(name = "FULL_TIME_CAPTAIN2")
	@Comment("总经历时间-机长2")
	public Long getFullTimeCaptain2() {
		return fullTimeCaptain2;
	}

	public void setFullTimeCaptain2(Long fullTimeCaptain2) {
		this.fullTimeCaptain2 = fullTimeCaptain2;
	}

	@Column(name = "CAPTAIN_FLY_TIME2")
	@Comment("机长2机长飞行时间")
	public Long getCaptainFlyTime2() {
		return CaptainFlyTime2;
	}

	public void setCaptainFlyTime2(Long captainFlyTime2) {
		CaptainFlyTime2 = captainFlyTime2;
	}

	@Column(name = "THIS_AIRCRAFT_TIME_CAPTAIN2")
	@Comment("本机型经历时间-机长2")
	public Long getThisAircraftTimeCaptain2() {
		return thisAircraftTimeCaptain2;
	}

	public void setThisAircraftTimeCaptain2(Long thisAircraftTimeCaptain2) {
		this.thisAircraftTimeCaptain2 = thisAircraftTimeCaptain2;
	}

	@Column(name = "TELEX_AIRCRAFT_TIME_CAPTAIN2")
	@Comment("在电传飞机上的经历时间-机长2")
	public Long getTelexAircraftTimeCaptain2() {
		return telexAircraftTimeCaptain2;
	}

	public void setTelexAircraftTimeCaptain2(Long telexAircraftTimeCaptain2) {
		this.telexAircraftTimeCaptain2 = telexAircraftTimeCaptain2;
	}

	@Column(name = "COMPANY_COPILOT1")
	@Comment("第一副驾驶所属分公司")
	public String getCompanyCopilot1() {
		return companyCopilot1;
	}

	public void setCompanyCopilot1(String companyCopilot1) {
		this.companyCopilot1 = companyCopilot1;
	}

	@Column(name = "FULL_TIME_COPILOT1")
	@Comment("第一副驾驶总经历时间")
	public Long getFullTimeCopilot1() {
		return fullTimeCopilot1;
	}

	public void setFullTimeCopilot1(Long fullTimeCopilot1) {
		this.fullTimeCopilot1 = fullTimeCopilot1;
	}

	@Column(name = "THIS_AIRCRAFT_TIME_COPILOT1")
	@Comment("第一副驾驶本机型经历时间")
	public Long getThisAircraftTimeCopilot1() {
		return thisAircraftTimeCopilot1;
	}

	public void setThisAircraftTimeCopilot1(Long thisAircraftTimeCopilot1) {
		this.thisAircraftTimeCopilot1 = thisAircraftTimeCopilot1;
	}

	@Column(name = "TELEX_AIRCRAFT_TIME_COPILOT1")
	@Comment("第一副驾驶在电传飞机上的经历时间")
	public Long getTelexAircraftTimeCopilot1() {
		return telexAircraftTimeCopilot1;
	}

	public void setTelexAircraftTimeCopilot1(Long telexAircraftTimeCopilot1) {
		this.telexAircraftTimeCopilot1 = telexAircraftTimeCopilot1;
	}

	@Column(name = "COMPANY_COPILOT2")
	@Comment("第二副驾驶所属分公司")
	public String getCompanyCopilot2() {
		return companyCopilot2;
	}

	public void setCompanyCopilot2(String companyCopilot2) {
		this.companyCopilot2 = companyCopilot2;
	}

	@Column(name = "FULL_TIME_COPILOT2")
	@Comment("第二副驾驶总经历时间")
	public Long getFullTimeCopilot2() {
		return fullTimeCopilot2;
	}

	public void setFullTimeCopilot2(Long fullTimeCopilot2) {
		this.fullTimeCopilot2 = fullTimeCopilot2;
	}

	@Column(name = "THIS_AIRCRAFT_TIME_COPILOT2")
	@Comment("第二副驾驶本机型经历时间")
	public Long getThisAircraftTimeCopilot2() {
		return thisAircraftTimeCopilot2;
	}

	public void setThisAircraftTimeCopilot2(Long thisAircraftTimeCopilot2) {
		this.thisAircraftTimeCopilot2 = thisAircraftTimeCopilot2;
	}

	@Column(name = "TELEX_AIRCRAFT_TIME_COPILOT2")
	@Comment("第二副驾驶在电传飞机上的经历时间")
	public Long getTelexAircraftTimeCopilot2() {
		return telexAircraftTimeCopilot2;
	}

	public void setTelexAircraftTimeCopilot2(Long telexAircraftTimeCopilot2) {
		this.telexAircraftTimeCopilot2 = telexAircraftTimeCopilot2;
	}

	@Column(name = "DUTY_OF_OBSERVER")
	@Comment("观察员位置人员职责")
	public String getDutyOfObserver() {
		return dutyOfObserver;
	}

	public void setDutyOfObserver(String dutyOfObserver) {
		this.dutyOfObserver = dutyOfObserver;
	}

	@Column(name = "FIRST_LEG_OF_CREW")
	@Comment("机组相互熟悉程度-该机组共同飞行的第一个航段")
	public String getFirstLegOfCrew() {
		return firstLegOfCrew;
	}

	public void setFirstLegOfCrew(String firstLegOfCrew) {
		this.firstLegOfCrew = firstLegOfCrew;
	}

	@Column(name = "BEFORE_LEAVE_DESC")
	@Comment("机组相互熟悉程度-叙述")
	public String getBeforeLeaveDesc() {
		return beforeLeaveDesc;
	}

	public void setBeforeLeaveDesc(String beforeLeaveDesc) {
		this.beforeLeaveDesc = beforeLeaveDesc;
	}

	@Column(name = "BEFORE_LEAVE_BRIEFING")
	@Comment("离场前/滑出-SOP标准简令")
	public String getBeforeLeaveBriefing() {
		return beforeLeaveBriefing;
	}

	public void setBeforeLeaveBriefing(String beforeLeaveBriefing) {
		this.beforeLeaveBriefing = beforeLeaveBriefing;
	}

	@Column(name = "BEFORE_LEAVE_PLAN")
	@Comment("离场前/滑出-规定的计划")
	public String getBeforeLeavePlan() {
		return beforeLeavePlan;
	}

	public void setBeforeLeavePlan(String beforeLeavePlan) {
		this.beforeLeavePlan = beforeLeavePlan;
	}

	@Column(name = "BEFORE_LEAVE_WORK_DISTRIBUTE")
	@Comment("离场前/滑出-工作任务分配")
	public String getBeforeLeaveWorkDistribute() {
		return beforeLeaveWorkDistribute;
	}

	public void setBeforeLeaveWorkDistribute(String beforeLeaveWorkDistribute) {
		this.beforeLeaveWorkDistribute = beforeLeaveWorkDistribute;
	}

	@Column(name = "BEFORE_LEVEL_EMERGENCY_MEASURE")
	@Comment("离场前/滑出-应急管理")
	public String getBeforeLevelEmergencyMeasure() {
		return beforeLevelEmergencyMeasure;
	}

	public void setBeforeLevelEmergencyMeasure(String beforeLevelEmergencyMeasure) {
		this.beforeLevelEmergencyMeasure = beforeLevelEmergencyMeasure;
	}

	@Column(name = "BEFORE_LEVEL_CHECK")
	@Comment("离场前/滑出-监控/交叉检查")
	public String getBeforeLevelCheck() {
		return beforeLevelCheck;
	}

	public void setBeforeLevelCheck(String beforeLevelCheck) {
		this.beforeLevelCheck = beforeLevelCheck;
	}

	@Column(name = "BEFORE_LEVEL_WORK_MANAGE")
	@Comment("离场前/滑出-工作任务管理")
	public String getBeforeLevelWorkManage() {
		return beforeLevelWorkManage;
	}

	public void setBeforeLevelWorkManage(String beforeLevelWorkManage) {
		this.beforeLevelWorkManage = beforeLevelWorkManage;
	}

	@Column(name = "BEFORE_LEVEL_ALERTNESS")
	@Comment("离场前/滑出-警觉性")
	public String getBeforeLevelAlertness() {
		return beforeLevelAlertness;
	}

	public void setBeforeLevelAlertness(String beforeLevelAlertness) {
		this.beforeLevelAlertness = beforeLevelAlertness;
	}

	@Column(name = "BEFORE_LEVEL_AUTO_MANAGE")
	@Comment("离场前/滑出-自动设备的管理")
	public String getBeforeLevelAutoManage() {
		return beforeLevelAutoManage;
	}

	public void setBeforeLevelAutoManage(String beforeLevelAutoManage) {
		this.beforeLevelAutoManage = beforeLevelAutoManage;
	}

	@Column(name = "BEFORE_LEVEL_PLAN_ASSESS")
	@Comment("离场前/滑出-计划的评估")
	public String getBeforeLevelPlanAssess() {
		return beforeLevelPlanAssess;
	}

	public void setBeforeLevelPlanAssess(String beforeLevelPlanAssess) {
		this.beforeLevelPlanAssess = beforeLevelPlanAssess;
	}

	@Column(name = "BEFORE_LEVEL_QUESTION")
	@Comment("离场前/滑出-询问")
	public String getBeforeLevelQuestion() {
		return beforeLevelQuestion;
	}

	public void setBeforeLevelQuestion(String beforeLevelQuestion) {
		this.beforeLevelQuestion = beforeLevelQuestion;
	}

	@Column(name = "BEFORE_LEVEL_CONFIDENCE")
	@Comment("离场前/滑出-自信")
	public String getBeforeLevelConfidence() {
		return beforeLevelConfidence;
	}

	public void setBeforeLevelConfidence(String beforeLevelConfidence) {
		this.beforeLevelConfidence = beforeLevelConfidence;
	}

	@Column(name = "TAKE_OFF_DESC")
	@Comment("起飞/爬升-叙述")
	public String getTakeOffDesc() {
		return takeOffDesc;
	}

	public void setTakeOffDesc(String takeOffDesc) {
		this.takeOffDesc = takeOffDesc;
	}

	@Column(name = "TAKE_OFF_CHECK")
	@Comment("起飞/爬升-监控/交叉检查")
	public String getTakeOffCheck() {
		return takeOffCheck;
	}

	public void setTakeOffCheck(String takeOffCheck) {
		this.takeOffCheck = takeOffCheck;
	}

	@Column(name = "TAKE_OFF_WORK_MANAGE")
	@Comment("起飞/爬升-工作任务管理")
	public String getTakeOffWorkManage() {
		return takeOffWorkManage;
	}

	public void setTakeOffWorkManage(String takeOffWorkManage) {
		this.takeOffWorkManage = takeOffWorkManage;
	}

	@Column(name = "TAKE_OFF_ALERTNESS")
	@Comment("起飞/爬升-警觉性")
	public String getTakeOffAlertness() {
		return takeOffAlertness;
	}

	public void setTakeOffAlertness(String takeOffAlertness) {
		this.takeOffAlertness = takeOffAlertness;
	}

	@Column(name = "TAKE_OFF_AUTO_MANAGE")
	@Comment("起飞/爬升-自动设备的管理")
	public String getTakeOffAutoManage() {
		return takeOffAutoManage;
	}

	public void setTakeOffAutoManage(String takeOffAutoManage) {
		this.takeOffAutoManage = takeOffAutoManage;
	}

	@Column(name = "TAKE_OFF_PLAN_ASSESS")
	@Comment("起飞/爬升-计划的评估")
	public String getTakeOffPlanAssess() {
		return takeOffPlanAssess;
	}

	public void setTakeOffPlanAssess(String takeOffPlanAssess) {
		this.takeOffPlanAssess = takeOffPlanAssess;
	}

	@Column(name = "TAKE_OFF_QUESTION")
	@Comment("起飞/爬升-询问")
	public String getTakeOffQuestion() {
		return takeOffQuestion;
	}

	public void setTakeOffQuestion(String takeOffQuestion) {
		this.takeOffQuestion = takeOffQuestion;
	}

	@Column(name = "TAKE_OFF_CONFIDENCE")
	@Comment("起飞/爬升-自信")
	public String getTakeOffConfidence() {
		return takeOffConfidence;
	}

	public void setTakeOffConfidence(String takeOffConfidence) {
		this.takeOffConfidence = takeOffConfidence;
	}

	@Column(name = "CRUISE_DESC")
	@Comment("巡航-叙述")
	public String getCruiseDesc() {
		return cruiseDesc;
	}

	public void setCruiseDesc(String cruiseDesc) {
		this.cruiseDesc = cruiseDesc;
	}

	@Column(name = "IS_MADE_BRIEFING_BEFORE_TOD")
	@Comment("下降/进近/着陆技术工作单-是否在到达下降顶点（TOD）之前作出了进近简令？（是/否）")
	public boolean getIsMadeBriefingBeforeTod() {
		return isMadeBriefingBeforeTod;
	}

	public void setIsMadeBriefingBeforeTod(boolean isMadeBriefingBeforeTod) {
		this.isMadeBriefingBeforeTod = isMadeBriefingBeforeTod;
	}

	@Column(name = "IS_DRO_BEFORE_TOD")
	@Comment("下降/进近/着陆技术工作单-机组是否在到达飞行管理系统（FMS）的TOD时或在此之前开始下降的？（是/否）")
	public boolean getIsDroBeforeTod() {
		return isDroBeforeTod;
	}

	public void setIsDroBeforeTod(boolean isDroBeforeTod) {
		this.isDroBeforeTod = isDroBeforeTod;
	}

	@Column(name = "IS_BIG_MARGIN_FLY")
	@Comment("下降/进近/着陆技术工作单-该航空器是否大幅度高于/低于飞行管理系统的垂直轨迹或标准的垂直轨迹？（是/否）")
	public boolean getIsBigMarginFly() {
		return isBigMarginFly;
	}

	public void setIsBigMarginFly(boolean isBigMarginFly) {
		this.isBigMarginFly = isBigMarginFly;
	}

	@Column(name = "THE_APPROACH_TYPE")
	@Comment("下降/进近/着陆技术工作单-何种进近？")
	public String getTheAppoachType() {
		return theAppoachType;
	}

	public void setTheAppoachType(String theAppoachType) {
		this.theAppoachType = theAppoachType;
	}

	@Column(name = "THE_APPROACH_DESC")
	@Comment("下降/进近/着陆技术工作单-进近备份或者类型")
	public String getTheAppoachDesc() {
		return theAppoachDesc;
	}

	public void setTheAppoachDesc(String theAppoachDesc) {
		this.theAppoachDesc = theAppoachDesc;
	}

	@Column(name = "THE_APPROACH_ARTIFICIAL_OR_AUT")
	@Comment("下降/进近/着陆技术工作单-进近：人工飞行还是自动飞行？")
	public String getTheAppoachArtificialOrAut() {
		return theAppoachArtificialOrAut;
	}

	public void setTheAppoachArtificialOrAut(String theAppoachArtificialOrAut) {
		this.theAppoachArtificialOrAut = theAppoachArtificialOrAut;
	}

	@Column(name = "IS_BIG_MARGIN_ABROVE_EXPECT")
	@Comment("下降/进近/着陆技术工作单-该航空器是否大幅高于/低于所期望的下降垂直轨迹？（是/否）")
	public boolean getIsBigMarginAbroveExpect() {
		return isBigMarginAbroveExpect;
	}

	public void setIsBigMarginAbroveExpect(boolean isBigMarginAbroveExpect) {
		this.isBigMarginAbroveExpect = isBigMarginAbroveExpect;
	}

	@Column(name = "IS_FLAP_NORMAL")
	@Comment("下降/进近/着陆技术工作单-在放襟翼期间，襟翼是否被“正常”的放下？")
	public String getIsFlapNormal() {
		return isFlapNormal;
	}

	public void setIsFlapNormal(String isFlapNormal) {
		this.isFlapNormal = isFlapNormal;
	}

	@Column(name = "THE_WEATHER_TYPE")
	@Comment("下降/进近/着陆技术工作单-天气（选一）")
	public String getTheWeatherType() {
		return theWeatherType;
	}

	public void setTheWeatherType(String theWeatherType) {
		this.theWeatherType = theWeatherType;
	}

	@Column(name = "THE_TARGET_AIRSPEED_ABOVE_1500")
	@Comment("下降/进近/着陆技术工作单-目标空速误差在-5至+15之间(above1500)")
	public boolean getTheTatgetAirspeedAbove1500() {
		return theTatgetAirspeedAbove1500;
	}

	public void setTheTatgetAirspeedAbove1500(boolean theTatgetAirspeedAbove1500) {
		this.theTatgetAirspeedAbove1500 = theTatgetAirspeedAbove1500;
	}

	@Column(name = "THE_VERTICAL_VELOCITY_1500")
	@Comment("下降/进近/着陆技术工作单-垂直速度≤1000")
	public boolean getTheVerticalVelocity1500() {
		return theVerticalVelocity1500;
	}

	public void setTheVerticalVelocity1500(boolean theVerticalVelocity1500) {
		this.theVerticalVelocity1500 = theVerticalVelocity1500;
	}

	@Column(name = "THE_RUNNING_ENGINE_1500")
	@Comment("下降/进近/着陆技术工作单-发动机运转(above1500)")
	public boolean getTheRunningEngine1500() {
		return theRunningEngine1500;
	}

	public void setTheRunningEngine1500(boolean theRunningEngine1500) {
		this.theRunningEngine1500 = theRunningEngine1500;
	}

	@Column(name = "LOADING＿TYPE_1500")
	@Comment("下降/进近/着陆技术工作单-着陆构型（襟缝翼位置/起落架放下）(above1500)")
	public boolean getLoadingType1500() {
		return loadingType1500;
	}

	public void setLoadingType1500(boolean loadingType1500) {
		this.loadingType1500 = loadingType1500;
	}

	@Column(name = "STABLE_CROUSE_1500")
	@Comment("高于机场标高1500英尺稳定的航向道跟踪或着陆航迹")
	public boolean getStableCrouse1500() {
		return stableCrouse1500;
	}

	public void setStableCrouse1500(boolean stableCrouse1500) {
		this.stableCrouse1500 = stableCrouse1500;
	}

	@Column(name = "STABLE_SLOP_1500")
	@Comment("高于机场标高1500英尺稳定的下滑道跟踪或下降率")
	public boolean getStableSlop1500() {
		return stableSlop1500;
	}

	public void setStableSlop1500(boolean stableSlop1500) {
		this.stableSlop1500 = stableSlop1500;
	}

	@Column(name = "THE_TARGET_AIRSPEED_ABOVE_1000")
	@Comment("下降/进近/着陆技术工作单-目标空速误差在-5至+15之间(above1000)")
	public boolean getTheTatgetAirspeedAbove1000() {
		return theTatgetAirspeedAbove1000;
	}

	public void setTheTatgetAirspeedAbove1000(boolean theTatgetAirspeedAbove1000) {
		this.theTatgetAirspeedAbove1000 = theTatgetAirspeedAbove1000;
	}

	@Column(name = "THE_VERTICAL_VELOCITY_1000")
	@Comment("下降/进近/着陆技术工作单-垂直速度≤1000")
	public boolean getTheVerticalVelocity1000() {
		return theVerticalVelocity1000;
	}

	public void setTheVerticalVelocity1000(boolean theVerticalVelocity1000) {
		this.theVerticalVelocity1000 = theVerticalVelocity1000;
	}

	@Column(name = "THE_RUNNING_ENGINE_1000")
	@Comment("下降/进近/着陆技术工作单-发动机运转(above1000)")
	public boolean getTheRunningEngine1000() {
		return theRunningEngine1000;
	}

	public void setTheRunningEngine1000(boolean theRunningEngine1000) {
		this.theRunningEngine1000 = theRunningEngine1000;
	}

	@Column(name = "LOADING＿TYPE_1000")
	@Comment("下降/进近/着陆技术工作单-着陆构型（襟缝翼位置/起落架放下）(above1000)")
	public boolean getLoadingType1000() {
		return loadingType1000;
	}

	public void setLoadingType1000(boolean loadingType1000) {
		this.loadingType1000 = loadingType1000;
	}

	@Column(name = "STABLE_CROUSE_1000")
	@Comment("高于机场标高1000英尺稳定的航向道跟踪或着陆航迹")
	public boolean getStableCrouse1000() {
		return stableCrouse1000;
	}

	public void setStableCrouse1000(boolean stableCrouse1000) {
		this.stableCrouse1000 = stableCrouse1000;
	}

	@Column(name = "STABLE_SLOP_1000")
	@Comment("高于机场标高1000英尺稳定的下滑道跟踪或下降率")
	public boolean getStableSlop1000() {
		return stableSlop1000;
	}

	public void setStableSlop1000(boolean stableSlop1000) {
		this.stableSlop1000 = stableSlop1000;
	}

	@Column(name = "THE_TARGET_AIRSPEED_ABOVE_500")
	@Comment("下降/进近/着陆技术工作单-目标空速误差在-5至+15之间(above500)")
	public boolean getTheTatgetAirspeedAbove500() {
		return theTatgetAirspeedAbove500;
	}

	public void setTheTatgetAirspeedAbove500(boolean theTatgetAirspeedAbove500) {
		this.theTatgetAirspeedAbove500 = theTatgetAirspeedAbove500;
	}

	@Column(name = "THE_VERTICAL_VELOCITY_500")
	@Comment("下降/进近/着陆技术工作单-垂直速度≤1000")
	public boolean getTheVerticalVelocity500() {
		return theVerticalVelocity500;
	}

	public void setTheVerticalVelocity500(boolean theVerticalVelocity500) {
		this.theVerticalVelocity500 = theVerticalVelocity500;
	}

	@Column(name = "THE_RUNNING_ENGINE_500")
	@Comment("下降/进近/着陆技术工作单-发动机运转(above500)")
	public boolean getTheRunningEngine500() {
		return theRunningEngine500;
	}

	public void setTheRunningEngine500(boolean theRunningEngine500) {
		this.theRunningEngine500 = theRunningEngine500;
	}

	@Column(name = "LOADING＿TYPE_500")
	@Comment("下降/进近/着陆技术工作单-着陆构型（襟缝翼位置/起落架放下）(above500)")
	public boolean getLoadingType500() {
		return loadingType500;
	}

	public void setLoadingType500(boolean loadingType500) {
		this.loadingType500 = loadingType500;
	}

	@Column(name = "STABLE_CROUSE_500")
	@Comment("高于机场标高500英尺稳定的航向道跟踪或着陆航迹")
	public boolean getStableCrouse500() {
		return stableCrouse500;
	}

	public void setStableCrouse500(boolean stableCrouse500) {
		this.stableCrouse500 = stableCrouse500;
	}

	@Column(name = "STABLE_SLOP_500")
	@Comment("高于机场标高500英尺稳定的下滑道跟踪或下降率")
	public boolean getStableSlop500() {
		return stableSlop500;
	}

	public void setStableSlop500(boolean stableSlop500) {
		this.stableSlop500 = stableSlop500;
	}

	@Column(name = "DROP_DESC")
	@Comment("下降/进近/着陆技术工作单-叙述")
	public String getDropDesc() {
		return dropDesc;
	}

	public void setDropDesc(String dropDesc) {
		this.dropDesc = dropDesc;
	}

	@Column(name = "LOADING_BRIEFING")
	@Comment("下降/进近/着陆-SOP标准简令")
	public String getLoadingBriefing() {
		return loadingBriefing;
	}

	public void setLoadingBriefing(String loadingBriefing) {
		this.loadingBriefing = loadingBriefing;
	}

	@Column(name = "LOADING_PLAN")
	@Comment("下降/进近/着陆-规定的计划")
	public String getLoadingPlan() {
		return loadingPlan;
	}

	public void setLoadingPlan(String loadingPlan) {
		this.loadingPlan = loadingPlan;
	}

	@Column(name = "LOADING_WORK_DISTRIBUTE")
	@Comment("下降/进近/着陆-工作任务分配")
	public String getLoadingWorkDistribute() {
		return loadingWorkDistribute;
	}

	public void setLoadingWorkDistribute(String loadingWorkDistribute) {
		this.loadingWorkDistribute = loadingWorkDistribute;
	}

	@Column(name = "LOADING_EMERGENCY_MEASURE")
	@Comment("下降/进近/着陆-应急管理机")
	public String getLoadingEmergencyMeasure() {
		return loadingEmergencyMeasure;
	}

	public void setLoadingEmergencyMeasure(String loadingEmergencyMeasure) {
		this.loadingEmergencyMeasure = loadingEmergencyMeasure;
	}

	@Column(name = "LOADING_CHECK")
	@Comment("下降/进近/着陆-监控/交叉检查")
	public String getLoadingCheck() {
		return loadingCheck;
	}

	public void setLoadingCheck(String loadingCheck) {
		this.loadingCheck = loadingCheck;
	}

	@Column(name = "LOADING_WORK_MANAGE")
	@Comment("下降/进近/着陆-工作任务管理")
	public String getLoadingWorkManage() {
		return loadingWorkManage;
	}

	public void setLoadingWorkManage(String loadingWorkManage) {
		this.loadingWorkManage = loadingWorkManage;
	}

	@Column(name = "LOADING_ALERTNESS")
	@Comment("下降/进近/着陆-警觉性")
	public String getLoadingAlertness() {
		return loadingAlertness;
	}

	public void setLoadingAlertness(String loadingAlertness) {
		this.loadingAlertness = loadingAlertness;
	}

	@Column(name = "LOADING_AUTO_MANAGE")
	@Comment("下降/进近/着陆-自动设备的管理")
	public String getLoadingAutoManage() {
		return loadingAutoManage;
	}

	public void setLoadingAutoManage(String loadingAutoManage) {
		this.loadingAutoManage = loadingAutoManage;
	}

	@Column(name = "LOADING_PLAN_ASSESS")
	@Comment("下降/进近/着陆-计划的评估")
	public String getLoadingPlanAssess() {
		return loadingPlanAssess;
	}

	public void setLoadingPlanAssess(String loadingPlanAssess) {
		this.loadingPlanAssess = loadingPlanAssess;
	}

	@Column(name = "LOADING_QUESTION")
	@Comment("下降/进近/着陆-询问")
	public String getLoadingQuestion() {
		return loadingQuestion;
	}

	public void setLoadingQuestion(String loadingQuestion) {
		this.loadingQuestion = loadingQuestion;
	}

	@Column(name = "LOADING_CONFIDENCE")
	@Comment("下降/进近/着陆-自信")
	public String getLoadingConfidence() {
		return loadingConfidence;
	}

	public void setLoadingConfidence(String loadingConfidence) {
		this.loadingConfidence = loadingConfidence;
	}

	@Column(name = "THE_FLIGHT_DESC")
	@Comment("整个飞行-叙述")
	public String getTheFlightDesc() {
		return theFlightDesc;
	}

	public void setTheFlightDesc(String theFlightDesc) {
		this.theFlightDesc = theFlightDesc;
	}

	@Column(name = "THE_FLIGHT_COMMUNICATION_ENVIR")
	@Comment("整个飞行-沟通环境")
	public String getTheFlightCommunicationEnvir() {
		return theFlightCommunicationEnvir;
	}

	public void setTheFlightCommunicationEnvir(String theFlightCommunicationEnvir) {
		this.theFlightCommunicationEnvir = theFlightCommunicationEnvir;
	}

	@Column(name = "THE_FLIGHT_LEADERSHIP")
	@Comment("整个飞行-领导能力")
	public String getTheFlightLeadership() {
		return theFlightLeadership;
	}

	public void setTheFlightLeadership(String theFlightLeadership) {
		this.theFlightLeadership = theFlightLeadership;
	}

	@Column(name = "THE_FLIGHT_IS_EXT_BRIFING")
	@Comment("整个飞行-在该城市对的第一个航段中，你是否观察了飞行乘务员的简令？")
	public String getTheFlightIsExtBrifing() {
		return theFlightIsExtBrifing;
	}

	public void setTheFlightIsExtBrifing(String theFlightIsExtBrifing) {
		this.theFlightIsExtBrifing = theFlightIsExtBrifing;
	}

	@Column(name = "THE_FLIGHT_SCORE")
	@Comment("整个飞行-评分")
	public String getTheFlightScore() {
		return theFlightScore;
	}

	public void setTheFlightScore(String theFlightScore) {
		this.theFlightScore = theFlightScore;
	}

	@Column(name = "CONTRIBUTION_OF_CAPTAIN")
	@Comment("对机组有效性的贡献机长")
	public String getContributionOfCaptain() {
		return contributionOfCaptain;
	}

	public void setContributionOfCaptain(String contributionOfCaptain) {
		this.contributionOfCaptain = contributionOfCaptain;
	}

	@Column(name = "CONTRIBUTION_OF_POLIT")
	@Comment("对机组有效性的贡献副驾驶")
	public String getContributionOfPolit() {
		return contributionOfPolit;
	}

	public void setContributionOfPolit(String contributionOfPolit) {
		this.contributionOfPolit = contributionOfPolit;
	}

	@Column(name = "THE_FLIGHT_CREW_VALIDITY")
	@Comment("整个飞行-机组工作的整体有效性")
	public String getTheFlightCrewValidity() {
		return theFlightCrewValidity;
	}

	public void setTheFlightCrewValidity(String theFlightCrewValidity) {
		this.theFlightCrewValidity = theFlightCrewValidity;
	}

	@Column(name = "ACTIVITY_UPDATE_DATE")
	@Comment("观察活动更新时间")
	public Date getActivityUpdateTime() {
		return activityUpdateTime;
	}

	public void setActivityUpdateTime(Date activityUpdateTime) {
		this.activityUpdateTime = activityUpdateTime;
	}

	@Column(name = "PLAN_ID")
	@Comment("航线计划ID")
	public Integer getPlanId() {
		return planId;
	}

	public void setPlanId(Integer planId) {
		this.planId = planId;
	}

	@Column(name = "ACTIVITY_STATUS")
	@Comment("观察活动状态")
	public String getActivityStatus() {
		return activityStatus;
	}

	public void setActivityStatus(String activityStatus) {
		this.activityStatus = activityStatus;
	}

	@Comment("航班号")
	public String getFlightNO() {
		return flightNO;
	}

	public void setFlightNO(String flightNO) {
		this.flightNO = flightNO;
	}

	@Comment("航班日期")
	public Date getFlightDate() {
		return flightDate;
	}

	public void setFlightDate(Date flightDate) {
		this.flightDate = flightDate;
	}

	@Comment("离场前/滑出-规章及操作程序的遵守")
	public String getBeforeLevelRuleOrder() {
		return beforeLevelRuleOrder;
	}

	public void setBeforeLevelRuleOrder(String beforeLevelRuleOrder) {
		this.beforeLevelRuleOrder = beforeLevelRuleOrder;
	}

	@Comment("起飞/爬升-规章及操作程序的遵守")
	public String getTakeoffRuleOrder() {
		return takeoffRuleOrder;
	}

	public void setTakeoffRuleOrder(String takeoffRuleOrder) {
		this.takeoffRuleOrder = takeoffRuleOrder;
	}

	@Comment("下降/进近/着陆-规章及操作程序的遵守")
	public String getLoadingRuleOrder() {
		return loadingRuleOrder;
	}

	public void setLoadingRuleOrder(String loadingRuleOrder) {
		this.loadingRuleOrder = loadingRuleOrder;
	}

	@Comment("复飞- 目标空速误差在-5至+15之间")
	public boolean getGoFlyTatgetAirspeedAbove1500() {
		return goFlyTatgetAirspeedAbove1500;
	}

	public void setGoFlyTatgetAirspeedAbove1500(boolean goFlyTatgetAirspeedAbove1500) {
		this.goFlyTatgetAirspeedAbove1500 = goFlyTatgetAirspeedAbove1500;
	}

	@Comment("复飞-垂直速度≤1000 ft/min")
	public boolean getGoFlyVerticalVelocity1500() {
		return goFlyVerticalVelocity1500;
	}

	public void setGoFlyVerticalVelocity1500(boolean goFlyVerticalVelocity1500) {
		this.goFlyVerticalVelocity1500 = goFlyVerticalVelocity1500;
	}

	@Comment("复飞-稳定的发动机功率")
	public boolean getGoFlyRunningEngine1500() {
		return goFlyRunningEngine1500;
	}

	public void setGoFlyRunningEngine1500(boolean goFlyRunningEngine1500) {
		this.goFlyRunningEngine1500 = goFlyRunningEngine1500;
	}

	@Comment("复飞-着陆构型（襟缝翼位置/起落架放下）")
	public boolean getGoFlyLoadingType1500() {
		return goFlyLoadingType1500;
	}

	public void setGoFlyLoadingType1500(boolean goFlyLoadingType1500) {
		this.goFlyLoadingType1500 = goFlyLoadingType1500;
	}

	@Comment("复飞- 稳定的航向道跟踪或着陆航迹")
	public boolean getGoFlyStableCrouse1500() {
		return goFlyStableCrouse1500;
	}

	public void setGoFlyStableCrouse1500(boolean goFlyStableCrouse1500) {
		this.goFlyStableCrouse1500 = goFlyStableCrouse1500;
	}

	@Comment("复飞-稳定的下滑道跟踪或下降率")
	public boolean getGoFlyStableSlop1500() {
		return goFlyStableSlop1500;
	}

	public void setGoFlyStableSlop1500(boolean goFlyStableSlop1500) {
		this.goFlyStableSlop1500 = goFlyStableSlop1500;
	}

	@Comment("复飞-目标空速误差在-5至+15之间")
	public String getGoFlyTatgetAirspeedAbove1000() {
		return goFlyTatgetAirspeedAbove1000;
	}

	public void setGoFlyTatgetAirspeedAbove1000(String goFlyTatgetAirspeedAbove1000) {
		this.goFlyTatgetAirspeedAbove1000 = goFlyTatgetAirspeedAbove1000;
	}

	@Comment("复飞-垂直速度≤1000 ft/min")
	public boolean getGoFlyVerticalVelocity1000() {
		return goFlyVerticalVelocity1000;
	}

	public void setGoFlyVerticalVelocity1000(boolean goFlyVerticalVelocity1000) {
		this.goFlyVerticalVelocity1000 = goFlyVerticalVelocity1000;
	}

	@Comment("复飞-稳定的发动机功率")
	public boolean getGoFlyRunningEngine1000() {
		return goFlyRunningEngine1000;
	}

	public void setGoFlyRunningEngine1000(boolean goFlyRunningEngine1000) {
		this.goFlyRunningEngine1000 = goFlyRunningEngine1000;
	}

	@Comment("复飞-着陆构型（襟缝翼位置/起落架放下）")
	public boolean getGoFlyLoadingType1000() {
		return goFlyLoadingType1000;
	}

	public void setGoFlyLoadingType1000(boolean goFlyLoadingType1000) {
		this.goFlyLoadingType1000 = goFlyLoadingType1000;
	}

	@Comment("复飞-稳定的航向道跟踪或着陆航迹")
	public boolean getGoFlyStableCrouse1000() {
		return goFlyStableCrouse1000;
	}

	public void setGoFlyStableCrouse1000(boolean goFlyStableCrouse1000) {
		this.goFlyStableCrouse1000 = goFlyStableCrouse1000;
	}

	@Comment("复飞-稳定的下滑道跟踪或下降率")
	public boolean getGoFlyStableSlop1000() {
		return goFlyStableSlop1000;
	}

	public void setGoFlyStableSlop1000(boolean goFlyStableSlop1000) {
		this.goFlyStableSlop1000 = goFlyStableSlop1000;
	}

	@Comment("复飞-目标空速误差在-5至+15之间")
	public boolean getGoFlyTatgetAirspeedAbove500() {
		return goFlyTatgetAirspeedAbove500;
	}

	public void setGoFlyTatgetAirspeedAbove500(boolean goFlyTatgetAirspeedAbove500) {
		this.goFlyTatgetAirspeedAbove500 = goFlyTatgetAirspeedAbove500;
	}

	@Comment("复飞-垂直速度≤1000 ft/min")
	public boolean getGoFlyVerticalVelocity500() {
		return goFlyVerticalVelocity500;
	}

	public void setGoFlyVerticalVelocity500(boolean goFlyVerticalVelocity500) {
		this.goFlyVerticalVelocity500 = goFlyVerticalVelocity500;
	}

	@Comment("复飞-稳定的发动机功率")
	public boolean getGoFlyRunningEngine500() {
		return goFlyRunningEngine500;
	}

	public void setGoFlyRunningEngine500(boolean goFlyRunningEngine500) {
		this.goFlyRunningEngine500 = goFlyRunningEngine500;
	}

	@Comment("复飞-着陆构型（襟缝翼位置/起落架放下）")
	public boolean getGoFlyLoadingType500() {
		return goFlyLoadingType500;
	}

	public void setGoFlyLoadingType500(boolean goFlyLoadingType500) {
		this.goFlyLoadingType500 = goFlyLoadingType500;
	}

	@Comment("复飞-稳定的航向道跟踪或着陆航迹")
	public boolean getGoFlyStableCrouse500() {
		return goFlyStableCrouse500;
	}

	public void setGoFlyStableCrouse500(boolean goFlyStableCrouse500) {
		this.goFlyStableCrouse500 = goFlyStableCrouse500;
	}

	@Comment("复飞-稳定的下滑道跟踪或下降率")
	public boolean getGoFlyStableSlop500() {
		return goFlyStableSlop500;
	}

	public void setGoFlyStableSlop500(boolean goFlyStableSlop500) {
		this.goFlyStableSlop500 = goFlyStableSlop500;
	}

	@Comment("整个飞行-法规手册熟悉程度")
	public String getKownRuleLevel() {
		return kownRuleLevel;
	}

	public void setKownRuleLevel(String kownRuleLevel) {
		this.kownRuleLevel = kownRuleLevel;
	}

	@Comment("整个飞行-规范标准的执行情况")
	public String getImplementRule() {
		return implementRule;
	}

	public void setImplementRule(String implementRule) {
		this.implementRule = implementRule;
	}

	@Comment("整个飞行-决策能力")
	public String getDecisionAbility() {
		return decisionAbility;
	}

	public void setDecisionAbility(String decisionAbility) {
		this.decisionAbility = decisionAbility;
	}

	@Comment("整个飞行-管理与飞行技能")
	public String getManageFlightAbility() {
		return manageFlightAbility;
	}

	public void setManageFlightAbility(String manageFlightAbility) {
		this.manageFlightAbility = manageFlightAbility;
	}

	@Comment("下降/进近/着陆技术工作单-是否复飞")
	public boolean getIsGoFly() {
		return isGoFly;
	}

	public void setIsGoFly(boolean isGoFly) {
		this.isGoFly = isGoFly;
	}

}
