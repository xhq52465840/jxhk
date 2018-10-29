
package com.usky.sms.flightmovementinfo;
import org.hibernate.cfg.Comment;

import java.io.Serializable;
import java.util.Date;

import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

/**
 * 机场天气
 */
@Entity
@Table(name = "yxw_tb_airportmeteoreports")
@Comment("QAR 机场天气")
public class AirportMeteorologyReportDO implements Serializable {
	
	private static final long serialVersionUID = 3497848130038781980L;
	
	private String reportID;
	
	private String iCaoCode;
	
	private String code3;
	
	private Date reportUTCTime;
	
	private Integer reportType;
	
	private String isAuto;
	
	private Integer alertLevel;
	
	private Integer windDirection;
	
	private Integer windSpeed;
	
	private String cloudDetail;// 200
	
	private String isSKC;
	
	private String isNSC;
	
	private String isCAVOK;
	
	private String windshift;
	
	private Integer visualDistance;
	
	private String weather;// 100
	
	private String weatherText;// 200
	
	private String rvr;// 500
	
	private String message;// 2000
	
	private String cnMessage;// 3600
	
	private String redAlertStandard;// 600
	
	private String orangeAlertStandard;// 600
	
	private String blueAlertStandard;// 600
	
	private Integer state;
	
	private Date addTime;
	
	private Date updtime;
	
	private String isArchived;
	
	private Date sms_update_time;
	
	private Double temperature;// 53
	
	private Double dewPoint;// 53
	
	@Id
	@Column(length = 36)
	@Comment("")
	public String getReportID() {
		return reportID;
	}
	
	public void setReportID(String reportID) {
		this.reportID = reportID;
	}
	
	@Column(length = 4)
	@Comment("")
	public String getiCaoCode() {
		return iCaoCode;
	}
	
	public void setiCaoCode(String iCaoCode) {
		this.iCaoCode = iCaoCode;
	}
	
	@Column(length = 3)
	@Comment("")
	public String getCode3() {
		return code3;
	}
	
	public void setCode3(String code3) {
		this.code3 = code3;
	}
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getReportUTCTime() {
		return reportUTCTime;
	}
	
	public void setReportUTCTime(Date reportUTCTime) {
		this.reportUTCTime = reportUTCTime;
	}
	
	@Column
	@Comment("")
	public Integer getReportType() {
		return reportType;
	}
	
	public void setReportType(Integer reportType) {
		this.reportType = reportType;
	}
	
	@Column(length = 1)
	@Comment("")
	public String getIsAuto() {
		return isAuto;
	}
	
	public void setIsAuto(String isAuto) {
		this.isAuto = isAuto;
	}
	
	@Column
	@Comment("")
	public Integer getAlertLevel() {
		return alertLevel;
	}
	
	public void setAlertLevel(Integer alertLevel) {
		this.alertLevel = alertLevel;
	}
	
	@Column
	@Comment("")
	public Integer getWindDirection() {
		return windDirection;
	}
	
	public void setWindDirection(Integer windDirection) {
		this.windDirection = windDirection;
	}
	
	@Column
	@Comment("")
	public Integer getWindSpeed() {
		return windSpeed;
	}
	
	public void setWindSpeed(Integer windSpeed) {
		this.windSpeed = windSpeed;
	}
	
	@Column(length = 200)
	@Comment("200")
	public String getCloudDetail() {
		return cloudDetail;
	}
	
	public void setCloudDetail(String cloudDetail) {
		this.cloudDetail = cloudDetail;
	}
	
	@Column(length = 1)
	@Comment("")
	public String getIsSKC() {
		return isSKC;
	}
	
	public void setIsSKC(String isSKC) {
		this.isSKC = isSKC;
	}
	
	@Column(length = 1)
	@Comment("")
	public String getIsNSC() {
		return isNSC;
	}
	
	public void setIsNSC(String isNSC) {
		this.isNSC = isNSC;
	}
	
	@Column(length = 1)
	@Comment("")
	public String getIsCAVOK() {
		return isCAVOK;
	}
	
	public void setIsCAVOK(String isCAVOK) {
		this.isCAVOK = isCAVOK;
	}
	
	@Column(length = 20)
	@Comment("")
	public String getWindshift() {
		return windshift;
	}
	
	public void setWindshift(String windshift) {
		this.windshift = windshift;
	}
	
	@Column
	@Comment("")
	public Integer getVisualDistance() {
		return visualDistance;
	}
	
	public void setVisualDistance(Integer visualDistance) {
		this.visualDistance = visualDistance;
	}
	
	@Column(length = 100)
	@Comment("100")
	public String getWeather() {
		return weather;
	}
	
	public void setWeather(String weather) {
		this.weather = weather;
	}
	
	@Column(length = 200)
	@Comment("200")
	public String getWeatherText() {
		return weatherText;
	}
	
	public void setWeatherText(String weatherText) {
		this.weatherText = weatherText;
	}
	
	@Column(length = 500)
	@Comment("500")
	public String getRvr() {
		return rvr;
	}
	
	public void setRvr(String rvr) {
		this.rvr = rvr;
	}
	
	@Column(length = 2000)
	@Comment("2000")
	public String getMessage() {
		return message;
	}
	
	public void setMessage(String message) {
		this.message = message;
	}
	
	@Lob
	@Basic(fetch = FetchType.EAGER)
	@Column(name = "CNMESSAGE", columnDefinition = "CLOB", nullable = true)
	@Comment("3600")
	public String getCnMessage() {
		return cnMessage;
	}
	
	public void setCnMessage(String cnMessage) {
		this.cnMessage = cnMessage;
	}
	
	@Column(length = 600)
	@Comment("600")
	public String getRedAlertStandard() {
		return redAlertStandard;
	}
	
	public void setRedAlertStandard(String redAlertStandard) {
		this.redAlertStandard = redAlertStandard;
	}
	
	@Column(length = 600)
	@Comment("600")
	public String getOrangeAlertStandard() {
		return orangeAlertStandard;
	}
	
	public void setOrangeAlertStandard(String orangeAlertStandard) {
		this.orangeAlertStandard = orangeAlertStandard;
	}
	
	@Column(length = 600)
	@Comment("600")
	public String getBlueAlertStandard() {
		return blueAlertStandard;
	}
	
	public void setBlueAlertStandard(String blueAlertStandard) {
		this.blueAlertStandard = blueAlertStandard;
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
	public Date getUpdtime() {
		return updtime;
	}
	
	public void setUpdtime(Date updtime) {
		this.updtime = updtime;
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
	public Date getSms_update_time() {
		return sms_update_time;
	}
	
	public void setSms_update_time(Date sms_update_time) {
		this.sms_update_time = sms_update_time;
	}
	
	@Column
	@Comment("53")
	public Double getTemperature() {
		return temperature;
	}
	
	public void setTemperature(Double temperature) {
		this.temperature = temperature;
	}
	
	@Column
	@Comment("53")
	public Double getDewPoint() {
		return dewPoint;
	}
	
	public void setDewPoint(Double dewPoint) {
		this.dewPoint = dewPoint;
	}
	
}
