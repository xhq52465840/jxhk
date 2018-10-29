package com.usky.sms.qar;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "qar_event_bo_by_map")
@Comment("QAR表")
public class QarEventDO extends AbstractBaseDO implements Comparable<QarEventDO>{

	private static final long serialVersionUID = -3445158217379364297L;
	
	/** 机场 */
	private String airport;
	
	/** 维度 */
	private Double latitude;
	
	/** 经度 */
	private Double longitude;
	
	/** 年 */
	private String theYear;
	
	/** 月 */
	private String theMonth;
	
	/** 数量 */
	private Integer theCount;
	
	/** Unstabilized 不稳定渐进  high_rate 低空下降率大 */
	private String type;

	@Override
	public int compareTo(QarEventDO arg0) {
		return arg0.getId()-this.getId();
	}

	@Column(length = 200)
	@Comment("机场")
	public String getAirport() {
		return airport;
	}

	public void setAirport(String airport) {
		this.airport = airport;
	}

	@Column
	@Comment("维度")
	public Double getLatitude() {
		return latitude;
	}

	public void setLatitude(Double latitude) {
		this.latitude = latitude;
	}

	@Column
	@Comment("经度")
	public Double getLongitude() {
		return longitude;
	}

	public void setLongitude(Double longitude) {
		this.longitude = longitude;
	}

	@Column
	@Comment("年")
	public String getTheYear() {
		return theYear;
	}

	public void setTheYear(String theYear) {
		this.theYear = theYear;
	}

	@Column
	@Comment("月")
	public String getTheMonth() {
		return theMonth;
	}

	public void setTheMonth(String theMonth) {
		this.theMonth = theMonth;
	}

	@Column
	@Comment("数量")
	public Integer getTheCount() {
		return theCount;
	}

	public void setTheCount(Integer theCount) {
		this.theCount = theCount;
	}

	@Column(length = 200)
	@Comment("Unstabilized 不稳定渐进  high_rate 低空下降率大")
	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

}
