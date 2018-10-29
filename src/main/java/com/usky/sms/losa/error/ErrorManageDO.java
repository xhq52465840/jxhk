package com.usky.sms.losa.error;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.losa.UnexceptStatusBaseInfoDO;
import com.usky.sms.losa.threat.ThreatBaseInfoDO;
@Entity
@Table(name = "L_ERROR_WORK_MANAGE")
@Comment("LOSA")
public class ErrorManageDO extends AbstractBaseDO{

	private static final long serialVersionUID = 2540813117306797428L;
	
	/** 创建人 */
	private Integer creator;
	
	/** 更新人 */
	private Integer lastModifier;
	
	/** 差错代号 */
	private String errorCode;
	
	/** 描述机组的差错和相应的非预期航空器状态 */
	private String errorDesc;
	
	/** 飞行阶段 */
	private String flightProcedure;
	
	/** 差错类型 */
	private ErrorBaseInfoDO errorType;
	
	/** 差错类型细分 */
	private ErrorBaseInfoDO errorTypeItem;
	
	/** 差错编号（使用编号本） */
	private ErrorBaseInfoDO errorNumber;
	
	/** 谁导致了这一差错 */
	private String thePersonCauseError;
	
	/** 谁发现了这一差错 */
	private String thePersonFoundError;
	
	/** 机组对差错的反应 */
	private String crewPesponseForError;
	
	/** 差错的后果 */
	private String theConsequencesOfError;
	
	/** 是否与威胁相关？（如是，则填入威胁类型） */
	private ThreatBaseInfoDO isRelateThreatType;
	
	/** 机组对这一差错是如何管理或管理不当的？ */
	private String isDealError;
	
	/** 非预期的航空器状态类型 */
	private UnexceptStatusBaseInfoDO unexceptAircraftType;
	
	/** 非预期的航空器状态编号 */
	private UnexceptStatusBaseInfoDO unexceptAircraftNumber;
	
	/** 谁发现了这一状态 */
	private String thePersonFoundStatus;
	
	/** 非预期航空器状态的后果 */
	private String theConsequencesofUnexceptAi;
	
	/** 是否与威胁相关？（如是，则填入威胁编号） */
	private ThreatBaseInfoDO isRelateThreatNumber;
	
	/** 观察活动ID */
	private Integer activityId;
	
	/** 本地ID */
	private Long localId;
	
	/** 机组对非预期航空器状态的反应 */
	private String  crewResponseForUnexceptAir;

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

	@Column(name = "ERROR_CODE")
	@Comment("差错代号")
	public String getErrorCode() {
		return errorCode;
	}

	public void setErrorCode(String errorCode) {
		this.errorCode = errorCode;
	}

	@Column(name = "ERROR_DESC")
	@Comment("描述机组的差错和相应的非预期航空器状态")
	public String getErrorDesc() {
		return errorDesc;
	}

	public void setErrorDesc(String errorDesc) {
		this.errorDesc = errorDesc;
	}

	@Column(name = "FLIGHT_PROCEDURE")
	@Comment("飞行阶段")
	public String getFlightProcedure() {
		return flightProcedure;
	}

	public void setFlightProcedure(String flightProcedure) {
		this.flightProcedure = flightProcedure;
	}

	@ManyToOne
	@JoinColumn(name = "ERROR_TYPE", referencedColumnName = "num")
	@Comment("差错类型")
	public ErrorBaseInfoDO getErrorType() {
		return errorType;
	}

	public void setErrorType(ErrorBaseInfoDO errorType) {
		this.errorType = errorType;
	}

	@ManyToOne
	@JoinColumn(name = "ERROR_TYPE_ITEM", referencedColumnName = "num")
	@Comment("差错类型细分")
	public ErrorBaseInfoDO getErrorTypeItem() {
		return errorTypeItem;
	}

	public void setErrorTypeItem(ErrorBaseInfoDO errorTypeItem) {
		this.errorTypeItem = errorTypeItem;
	}

	@ManyToOne
	@JoinColumn(name = "ERROR_NUMBER", referencedColumnName = "num")
	@Comment("差错编号（使用编号本）")
	public ErrorBaseInfoDO getErrorNumber() {
		return errorNumber;
	}

	public void setErrorNumber(ErrorBaseInfoDO errorNumber) {
		this.errorNumber = errorNumber;
	}

	@Column(name = "THE_PERSON_CAUSE_ERROR")
	@Comment("谁导致了这一差错")
	public String getThePersonCauseError() {
		return thePersonCauseError;
	}

	public void setThePersonCauseError(String thePersonCauseError) {
		this.thePersonCauseError = thePersonCauseError;
	}

	@Column(name = "THE_PERSON_FOUND_ERROR")
	@Comment("谁发现了这一差错")
	public String getThePersonFoundError() {
		return thePersonFoundError;
	}

	public void setThePersonFoundError(String thePersonFoundError) {
		this.thePersonFoundError = thePersonFoundError;
	}

	@Column(name = "CREW_RESPONSE_OF_ERROR")
	@Comment("机组对差错的反应")
	public String getCrewPesponseForError() {
		return crewPesponseForError;
	}

	public void setCrewPesponseForError(String crewPesponseForError) {
		this.crewPesponseForError = crewPesponseForError;
	}

	@Column(name = "THE_CONSEQUENCES_OF_ERROR")
	@Comment("差错的后果")
	public String getTheConsequencesOfError() {
		return theConsequencesOfError;
	}

	public void setTheConsequencesOfError(String theConsequencesOfError) {
		this.theConsequencesOfError = theConsequencesOfError;
	}

	@ManyToOne
	@JoinColumn(name = "IS_RELATE_THREAT_TYPE", referencedColumnName = "num")
	@Comment("是否与威胁相关？（如是，则填入威胁类型）")
	public ThreatBaseInfoDO getIsRelateThreatType() {
		return isRelateThreatType;
	}

	public void setIsRelateThreatType(ThreatBaseInfoDO isRelateThreatType) {
		this.isRelateThreatType = isRelateThreatType;
	}

	@Column(name = "IS_DEAL_ERROR")
	@Comment("机组对这一差错是如何管理或管理不当的？")
	public String getIsDealError() {
		return isDealError;
	}

	public void setIsDealError(String isDealError) {
		this.isDealError = isDealError;
	}

	@ManyToOne
	@JoinColumn(name = "UNEXCEPT_AIRCRAFT_TYPE", referencedColumnName = "num")
	@Comment("非预期的航空器状态类型")
	public UnexceptStatusBaseInfoDO getUnexceptAircraftType() {
		return unexceptAircraftType;
	}

	public void setUnexceptAircraftType(UnexceptStatusBaseInfoDO unexceptAircraftType) {
		this.unexceptAircraftType = unexceptAircraftType;
	}

	@ManyToOne
	@JoinColumn(name = "UNEXPECT_AIRCRAFT_NUMBER", referencedColumnName = "num")
	@Comment("非预期的航空器状态编号")
	public UnexceptStatusBaseInfoDO getUnexceptAircraftNumber() {
		return unexceptAircraftNumber;
	}

	public void setUnexceptAircraftNumber(UnexceptStatusBaseInfoDO unexceptAircraftNumber) {
		this.unexceptAircraftNumber = unexceptAircraftNumber;
	}

	@Column(name = "THE_PERSON_FOUND_STATUS")
	@Comment("谁发现了这一状态")
	public String getThePersonFoundStatus() {
		return thePersonFoundStatus;
	}

	public void setThePersonFoundStatus(String thePersonFoundStatus) {
		this.thePersonFoundStatus = thePersonFoundStatus;
	}

	@Column(name = "THE_CONSEQUENCESOF_UNEXCEPT_AI")
	@Comment("非预期航空器状态的后果")
	public String getTheConsequencesofUnexceptAi() {
		return theConsequencesofUnexceptAi;
	}

	public void setTheConsequencesofUnexceptAi(String theConsequencesofUnexceptAi) {
		this.theConsequencesofUnexceptAi = theConsequencesofUnexceptAi;
	}

	@ManyToOne
	@JoinColumn(name = "IS_RELATE_THREAT_NUMBER", referencedColumnName = "num")
	@Comment("是否与威胁相关？（如是，则填入威胁编号）")
	public ThreatBaseInfoDO getIsRelateThreatNumber() {
		return isRelateThreatNumber;
	}

	public void setIsRelateThreatNumber(ThreatBaseInfoDO isRelateThreatNumber) {
		this.isRelateThreatNumber = isRelateThreatNumber;
	}

	@Column(name = "OBSERVE_ID")
	@Comment("观察活动ID")
	public Integer getActivityId() {
		return activityId;
	}

	public void setActivityId(Integer activityId) {
		this.activityId = activityId;
	}

	@Column(name = "APP_ID")
	@Comment("本地ID")
	public Long getLocalId() {
		return localId;
	}

	public void setLocalId(Long localId) {
		this.localId = localId;
	}

	@Column(name = "CREW_RESPONSE_FOR_UNEXCEPT_AIR")
	@Comment("机组对非预期航空器状态的反应")
	public String getCrewResponseForUnexceptAir() {
		return crewResponseForUnexceptAir;
	}

	public void setCrewResponseForUnexceptAir(String crewResponseForUnexceptAir) {

		this.crewResponseForUnexceptAir = crewResponseForUnexceptAir;
	}

}
