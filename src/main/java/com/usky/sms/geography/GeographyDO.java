package com.usky.sms.geography;

import org.hibernate.cfg.Comment;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;

@Entity
@Table(name = "T_GEOGRAPHY")
@Comment("地理位置")
public class GeographyDO extends AbstractBaseDO implements IDisplayable {

	private static final long serialVersionUID = -4415846687309545445L;

	/** 省 */
	private String province;

	/** 市 */
	private String city;

	/** 经度 */
	private Double longitude;

	/** 纬度 */
	private Double latitude;
	
	public GeographyDO(){
		
	}

	public GeographyDO(String province, String city, Double longitude, Double latitude) {
		this.province = province;
		this.city = city;
		this.longitude = longitude;
		this.latitude = latitude;
	}

	/**
	 * @return the province
	 */
	@Comment("省")
	public String getProvince() {
		return province;
	}

	/**
	 * @param province
	 *            the province to set
	 */
	public void setProvince(String province) {
		this.province = province;
	}

	/**
	 * @return the city
	 */
	@Comment("市")
	public String getCity() {
		return city;
	}

	/**
	 * @param city
	 *            the city to set
	 */
	public void setCity(String city) {
		this.city = city;
	}

	/**
	 * @return 经度
	 */
	@Comment("经度")
	public Double getLongitude() {
		return longitude;
	}

	/**
	 * @param 经度
	 */
	public void setLongitude(Double longitude) {
		this.longitude = longitude;
	}

	/**
	 * @return 纬度
	 */
	@Comment("纬度")
	public Double getLatitude() {
		return latitude;
	}

	/**
	 * @param 纬度
	 */
	public void setLatitude(Double latitude) {
		this.latitude = latitude;
	}

	@Override
	public int hashCode() {
		return this.getId().hashCode();
	}

	@Transient
	@Override
	public String getDisplayName() {
		return province + city;
	}
}
