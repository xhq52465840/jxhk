package com.usky.sms.flightmovementinfo;

import org.hibernate.cfg.Comment;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import com.usky.sms.core.AbstractBaseDO;

/**
 * 起降机场
 */
@Entity
@Table(name = "yxw_tb_airport")
@Comment("QAR 起降机场")
public class AirportDO extends AbstractBaseDO implements Comparable<AirportDO>{

	private static final long serialVersionUID = 5481113545403158715L;
	
	private String iCaoCode;// 机场四字码
	private String iATACode;// 机场三字码
	private String shortName;
	private String fullName;
	private String shortEnName;
	private String fullEnName;
	private String countryCode;
	private String provinceName;
	private String provinceEnName;
	private String cityName;
	private String cityEnName;
	private String fir;//飞行情报区
	private String arc;//飞行区等级
	private String longitude;//经度
	private String latitude;//维度
	private String longitudeText;//经度文本
	private String latitudeText;//纬度文本
	private Integer timeZone;//标高
	private Integer timeZoneMinutes;
	private Double elevation;
	private Integer delayBuffer;//延误时间
	private Date curfewStart;
	private Date curfewEnd;
	private String allowTODangerousGoods;
	private String allowLDDangerousGoods;
	private String regionType;//地区类型
	private String isJoinAirport;//军民合用机场
	private String isOperativeAirport;//运行机场
	private String isBaseAirport;//基地机场
	private String isMajorAirport;//主要机场
	private String isTLAirport;//起降机场
	private String isALTNAirport;//备降机场
	private String isETOpsAirport;//ETOPS运行机场
	private String isPolarAirport;//极地机场
	private Integer plateauAirportCategory;//高原机场类型
	private Integer operationCategory;//机场类型
	private String remark;// 2000备注
	private Integer state;//状态值
	private Date addTime;
	private Date updTime;
	private Integer delayTime;
	private Date SMS_DATE_TIME;

	@Column(length = 4)
	@Comment("机场四字码")
	public String getiCaoCode() {
		return iCaoCode;
	}

	public void setiCaoCode(String iCaoCode) {
		this.iCaoCode = iCaoCode;
	}

	@Column(length = 3)
	@Comment("机场三字码")
	public String getiATACode() {
		return iATACode;
	}

	public void setiATACode(String iATACode) {
		this.iATACode = iATACode;
	}

	@Column(length = 20)
	@Comment("机场三字码")
	public String getShortName() {
		return shortName;
	}

	public void setShortName(String shortName) {
		this.shortName = shortName;
	}

	@Column(length = 40)
	@Comment("")
	public String getFullName() {
		return fullName;
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

	@Column(length = 50)
	@Comment("")
	public String getShortEnName() {
		return shortEnName;
	}

	public void setShortEnName(String shortEnName) {
		this.shortEnName = shortEnName;
	}

	@Column(length = 60)
	@Comment("")
	public String getFullEnName() {
		return fullEnName;
	}

	public void setFullEnName(String fullEnName) {
		this.fullEnName = fullEnName;
	}

	@Column(length = 2)
	@Comment("")
	public String getCountryCode() {
		return countryCode;
	}

	public void setCountryCode(String countryCode) {
		this.countryCode = countryCode;
	}

	@Column(length = 50)
	@Comment("")
	public String getProvinceName() {
		return provinceName;
	}

	public void setProvinceName(String provinceName) {
		this.provinceName = provinceName;
	}

	@Column(length = 100)
	@Comment("")
	public String getProvinceEnName() {
		return provinceEnName;
	}

	public void setProvinceEnName(String provinceEnName) {
		this.provinceEnName = provinceEnName;
	}

	@Column(length = 20)
	@Comment("")
	public String getCityName() {
		return cityName;
	}

	public void setCityName(String cityName) {
		this.cityName = cityName;
	}

	@Column(length = 50)
	@Comment("")
	public String getCityEnName() {
		return cityEnName;
	}

	public void setCityEnName(String cityEnName) {
		this.cityEnName = cityEnName;
	}

	@Column(length = 4)
	@Comment("飞行情报区")
	public String getFir() {
		return fir;
	}

	public void setFir(String fir) {
		this.fir = fir;
	}

	@Column(length = 2)
	@Comment("飞行区等级")
	public String getArc() {
		return arc;
	}

	public void setArc(String arc) {
		this.arc = arc;
	}

	@Column
	@Comment("经度")
	public String getLongitude() {
		return longitude;
	}

	public void setLongitude(String longitude) {
		this.longitude = longitude;
	}

	@Column
	@Comment("维度")
	public String getLatitude() {
		return latitude;
	}

	public void setLatitude(String latitude) {
		this.latitude = latitude;
	}

	@Column(length = 10)
	@Comment("经度文本")
	public String getLongitudeText() {
		return longitudeText;
	}

	public void setLongitudeText(String longitudeText) {
		this.longitudeText = longitudeText;
	}

	@Column(length = 10)
	@Comment("纬度文本")
	public String getLatitudeText() {
		return latitudeText;
	}

	public void setLatitudeText(String latitudeText) {
		this.latitudeText = latitudeText;
	}

	@Column
	@Comment("标高")
	public Integer getTimeZone() {
		return timeZone;
	}

	public void setTimeZone(Integer timeZone) {
		this.timeZone = timeZone;
	}

	@Column
	@Comment("标高")
	public Integer getTimeZoneMinutes() {
		return timeZoneMinutes;
	}

	public void setTimeZoneMinutes(Integer timeZoneMinutes) {
		this.timeZoneMinutes = timeZoneMinutes;
	}

	@Column
	@Comment("")
	public Double getElevation() {
		return elevation;
	}

	public void setElevation(Double elevation) {
		this.elevation = elevation;
	}

	@Column
	@Comment("延误时间")
	public Integer getDelayBuffer() {
		return delayBuffer;
	}

	public void setDelayBuffer(Integer delayBuffer) {
		this.delayBuffer = delayBuffer;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("延误时间")
	public Date getCurfewStart() {
		return curfewStart;
	}

	public void setCurfewStart(Date curfewStart) {
		this.curfewStart = curfewStart;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getCurfewEnd() {
		return curfewEnd;
	}

	public void setCurfewEnd(Date curfewEnd) {
		this.curfewEnd = curfewEnd;
	}

	@Column(length = 1)
	@Comment("")
	public String getAllowTODangerousGoods() {
		return allowTODangerousGoods;
	}

	public void setAllowTODangerousGoods(String allowTODangerousGoods) {
		this.allowTODangerousGoods = allowTODangerousGoods;
	}

	@Column(length = 1)
	@Comment("")
	public String getAllowLDDangerousGoods() {
		return allowLDDangerousGoods;
	}

	public void setAllowLDDangerousGoods(String allowLDDangerousGoods) {
		this.allowLDDangerousGoods = allowLDDangerousGoods;
	}

	@Column(length = 1)
	@Comment("地区类型")
	public String getRegionType() {
		return regionType;
	}

	public void setRegionType(String regionType) {
		this.regionType = regionType;
	}

	@Column(length = 1)
	@Comment("军民合用机场")
	public String getIsJoinAirport() {
		return isJoinAirport;
	}

	public void setIsJoinAirport(String isJoinAirport) {
		this.isJoinAirport = isJoinAirport;
	}

	@Column(length = 1)
	@Comment("运行机场")
	public String getIsOperativeAirport() {
		return isOperativeAirport;
	}

	public void setIsOperativeAirport(String isOperativeAirport) {
		this.isOperativeAirport = isOperativeAirport;
	}

	@Column(length = 1)
	@Comment("基地机场")
	public String getIsBaseAirport() {
		return isBaseAirport;
	}

	public void setIsBaseAirport(String isBaseAirport) {
		this.isBaseAirport = isBaseAirport;
	}

	@Column(length = 1)
	@Comment("主要机场")
	public String getIsMajorAirport() {
		return isMajorAirport;
	}

	public void setIsMajorAirport(String isMajorAirport) {
		this.isMajorAirport = isMajorAirport;
	}

	@Column(length = 1)
	@Comment("起降机场")
	public String getIsTLAirport() {
		return isTLAirport;
	}

	public void setIsTLAirport(String isTLAirport) {
		this.isTLAirport = isTLAirport;
	}

	@Column(length = 1)
	@Comment("备降机场")
	public String getIsALTNAirport() {
		return isALTNAirport;
	}

	public void setIsALTNAirport(String isALTNAirport) {
		this.isALTNAirport = isALTNAirport;
	}

	@Column(length = 1)
	@Comment("ETOPS运行机场")
	public String getIsETOpsAirport() {
		return isETOpsAirport;
	}

	public void setIsETOpsAirport(String isETOpsAirport) {
		this.isETOpsAirport = isETOpsAirport;
	}

	@Column(length = 1)
	@Comment("极地机场")
	public String getIsPolarAirport() {
		return isPolarAirport;
	}

	public void setIsPolarAirport(String isPolarAirport) {
		this.isPolarAirport = isPolarAirport;
	}

	@Column
	@Comment("高原机场类型")
	public Integer getPlateauAirportCategory() {
		return plateauAirportCategory;
	}

	public void setPlateauAirportCategory(Integer plateauAirportCategory) {
		this.plateauAirportCategory = plateauAirportCategory;
	}

	@Column
	@Comment("机场类型")
	public Integer getOperationCategory() {
		return operationCategory;
	}

	public void setOperationCategory(Integer operationCategory) {
		this.operationCategory = operationCategory;
	}

	@Column(length = 500)
	@Comment("2000备注")
	public String getRemark() {
		return remark;
	}

	public void setRemark(String remark) {
		this.remark = remark;
	}

	@Column
	@Comment("状态值")
	public Integer getState() {
		return state;
	}

	public void setState(Integer state) {
		this.state = state;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("状态值")
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

	@Column
	@Comment("")
	public Integer getDelayTime() {
		return delayTime;
	}

	public void setDelayTime(Integer delayTime) {
		this.delayTime = delayTime;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getSMS_DATE_TIME() {
		return SMS_DATE_TIME;
	}

	public void setSMS_DATE_TIME(Date sMS_DATE_TIME) {
		SMS_DATE_TIME = sMS_DATE_TIME;
	}

	@Override
	public int compareTo(AirportDO o) {
		if (iCaoCode != null && o.getiCaoCode() != null) {
			return iCaoCode.compareTo(o.getiCaoCode());
		} else if (iATACode != null && o.getiATACode() != null) {
			return iATACode.compareTo(o.getiATACode());
		}
		return 0;
	}

}
