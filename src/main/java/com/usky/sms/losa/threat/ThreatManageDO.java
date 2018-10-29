
package com.usky.sms.losa.threat;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.hibernate.cfg.Comment;

import com.usky.sms.core.AbstractBaseDO;
@Entity
@Table(name = "L_THREAT_WORK_MANAGE")
@Comment("LOSA")
public class ThreatManageDO extends AbstractBaseDO{

	private static final long serialVersionUID = 4213204221320025797L;

	/** 创建人 */
	private Integer creator;
	
	/** 更新人 */
	private Integer lastModifier;
	
	/** 威胁代号 */
	private String threatCode;
	
	/** 描述该威胁 */
	private String threatDesc;
	
	/** 威胁类型 */
	private ThreatBaseInfoDO threatType;
	
	/** 威胁编号 */
	private ThreatBaseInfoDO threatNumber;
	
	/** 行阶段 */
	private String flightProcedure;
	
	/** 是否得到有效管理 */
	private String isDealValidity;
	
	/** 机组对该威胁是如何管理或者管理不当的？ */
	private String theMeasuresForThreat;
	
	/** 观察活动ID */
	private Integer activityId;
	
	/** 本地ID */
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
	
	@Column(name = "THREAT_CODE")
	@Comment("威胁代号")
	public String getThreatCode() {
		return threatCode;
	}
	public void setThreatCode(String threatCode) {
		this.threatCode = threatCode;
	}
	@Column(name = "THREAT_DESC")
	@Comment("描述该威胁")
	public String getThreatDesc() {
		return threatDesc;
	}
	public void setThreatDesc(String threatDesc) {
		this.threatDesc = threatDesc;
	}
	@ManyToOne
	@JoinColumn(name = "THREAT_TYPE",referencedColumnName="num")
	@Comment("威胁类型")
	public ThreatBaseInfoDO getThreatType() {
		return threatType;
	}
	public void setThreatType(ThreatBaseInfoDO threatType) {
		this.threatType = threatType;
	}
	@ManyToOne
	@JoinColumn(name = "THREAT_NUMBER",referencedColumnName="num")
	@Comment("威胁编号")
	public ThreatBaseInfoDO getThreatNumber() {
		return threatNumber;
	}
	public void setThreatNumber(ThreatBaseInfoDO threatNumber) {
		this.threatNumber = threatNumber;
	}
	@Column(name = "FLIGHT_PROCEDURE")
	@Comment("行阶段")
	public String getFlightProcedure() {
		return flightProcedure;
	}
	public void setFlightProcedure(String flightProcedure) {
		this.flightProcedure = flightProcedure;
	}
	@Column(name = "IS_DEAL_VALIDITY")
	@Comment("是否得到有效管理")
	public String getIsDealValidity() {
		return isDealValidity;
	}
	public void setIsDealValidity(String isDealValidity) {
		this.isDealValidity = isDealValidity;
	}
	@Column(name = "THE_MEASURES_FOR_THREAT")
	@Comment("机组对该威胁是如何管理或者管理不当的？")
	public String getTheMeasuresForThreat() {
		return theMeasuresForThreat;
	}
	public void setTheMeasuresForThreat(String theMeasuresForThreat) {
		this.theMeasuresForThreat = theMeasuresForThreat;
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
	
	
	

}
