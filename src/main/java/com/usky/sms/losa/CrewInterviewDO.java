package com.usky.sms.losa;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "L_CREW_INTERVIEW")
@Comment("LOSA")
public class CrewInterviewDO extends AbstractBaseDO {

	private static final long serialVersionUID = 5590176827351764343L;

	/** 创建人 */
	private Integer creator;

	/** 更新人 */
	private Integer lastModifier;

	/** 训练和在航线运行中发生的实际情况之间存在的差异 */
	private String theDiffBetweenTraAndAct;

	/** 差异的原因 */
	private String theReasonBetweenTraAndAct;

	/** 其他机组成员在标准化方面情况 */
	private String theConditionOfOtherCrew;

	/** 程序性不遵守行为的原因 */
	private String theReasonOfOtherCrew;

	/** 最大的自动化“问题” */
	private String theAutoProblemOfTheAircra;

	/** 飞行运行 */
	private String flightOperation;

	/** 签派 */
	private String dispatch;

	/** 机场和空中交通管制 */
	private String airportAndControl;

	/** 标准操作程序 */
	private String standardProcedure;

	/** 观察活动编号 */
	private Integer activityId;

	/** 其他访谈问题 */
	private String otherQuestion;

	/** 本地id */
	private Long localId;

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

	@Column(name = "THE_DIFF_BETWEEN_TRA_AND_ACT")
	@Comment("训练和在航线运行中发生的实际情况之间存在的差异")
	public String getTheDiffBetweenTraAndAct() {
		return theDiffBetweenTraAndAct;
	}

	public void setTheDiffBetweenTraAndAct(String theDiffBetweenTraAndAct) {
		this.theDiffBetweenTraAndAct = theDiffBetweenTraAndAct;
	}

	@Column(name = "THE_REASON_BETWEEN_TRA_AND_ACT")
	@Comment("差异的原因")
	public String getTheReasonBetweenTraAndAct() {
		return theReasonBetweenTraAndAct;
	}

	public void setTheReasonBetweenTraAndAct(String theReasonBetweenTraAndAct) {
		this.theReasonBetweenTraAndAct = theReasonBetweenTraAndAct;
	}

	@Column(name = "THE_CONDITION_OF_OTHER_CREW")
	@Comment("其他机组成员在标准化方面情况")
	public String getTheConditionOfOtherCrew() {
		return theConditionOfOtherCrew;
	}

	public void setTheConditionOfOtherCrew(String theConditionOfOtherCrew) {
		this.theConditionOfOtherCrew = theConditionOfOtherCrew;
	}

	@Column(name = "THE_REASON_OF_OTHER_CREW")
	@Comment("程序性不遵守行为的原因")
	public String getTheReasonOfOtherCrew() {
		return theReasonOfOtherCrew;
	}

	public void setTheReasonOfOtherCrew(String theReasonOfOtherCrew) {
		this.theReasonOfOtherCrew = theReasonOfOtherCrew;
	}

	@Column(name = "THE_AUTO_PROBLEM_OF_THE_AIRCRA")
	@Comment("最大的自动化“问题”")
	public String getTheAutoProblemOfTheAircra() {
		return theAutoProblemOfTheAircra;
	}

	public void setTheAutoProblemOfTheAircra(String theAutoProblemOfTheAircra) {
		this.theAutoProblemOfTheAircra = theAutoProblemOfTheAircra;
	}

	@Column(name = "FLIGHT_OPERATION")
	@Comment("飞行运行")
	public String getFlightOperation() {
		return flightOperation;
	}

	public void setFlightOperation(String flightOperation) {
		this.flightOperation = flightOperation;
	}

	@Column(name = "DISPATCH")
	@Comment("签派")
	public String getDispatch() {
		return dispatch;
	}

	public void setDispatch(String dispatch) {
		this.dispatch = dispatch;
	}

	@Column(name = "AIRPORT_AND_CONTROL")
	@Comment("机场和空中交通管制")
	public String getAirportAndControl() {
		return airportAndControl;
	}

	public void setAirportAndControl(String airportAndControl) {
		this.airportAndControl = airportAndControl;
	}

	@Column(name = "STANDARD_PROCEDURE")
	@Comment("标准操作程序")
	public String getStandardProcedure() {
		return standardProcedure;
	}

	public void setStandardProcedure(String standardProcedure) {
		this.standardProcedure = standardProcedure;
	}

	@Column(name = "OBSERVE_ID")
	@Comment("观察活动编号")
	public Integer getActivityId() {
		return activityId;
	}

	public void setActivityId(Integer activityId) {
		this.activityId = activityId;
	}

	@Column(name = "OTHER_QUESTION")
	@Comment("其他访谈问题")
	public String getOtherQuestion() {
		return otherQuestion;
	}

	public void setOtherQuestion(String otherQuestion) {
		this.otherQuestion = otherQuestion;
	}

	@Column(name = "APP_ID")
	@Comment("本地id")
	public Long getLocalId() {
		return localId;
	}

	public void setLocalId(Long localId) {
		this.localId = localId;
	}

}
