package com.usky.sms.flightmovementinfo;

import org.hibernate.cfg.Comment;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

/**
 * 飞机
 */
@Entity
@Table(name = "t_air_plane")
public class AirPlaneDO extends AbstractBaseDO {

	private static final long serialVersionUID = 5481113545403158715L;

	/** 机号 */
	private String tailNo;

	/** 长机型 */
	private String typeLong;

	/** 短机型 */
	private String typeShort;

	/** 最大起飞重量 */
	private Double maxDepartWeight;

	/** 最大着陆重量 */
	private Double maxLandfallWeight;

	/** 在册开始日期 */
	private Date startDate;

	/** 在册结束日期 */
	private Date endDate;

	/** 承运人 */
	private String carrier;

	@Column(name = "TAIL_NO")
	@Comment("机号")
	public String getTailNo() {
		return tailNo;
	}

	public void setTailNo(String tailNo) {
		this.tailNo = tailNo;
	}

	@Column(name = "TYPE_LONG")
	@Comment("长机型")
	public String getTypeLong() {
		return typeLong;
	}

	public void setTypeLong(String typeLong) {
		this.typeLong = typeLong;
	}

	@Column(name = "TYPE_SHORT")
	@Comment("短机型")
	public String getTypeShort() {
		return typeShort;
	}

	public void setTypeShort(String typeShort) {
		this.typeShort = typeShort;
	}

	@Column(name = "MAX_DEPART_WEIGHT")
	@Comment("最大起飞重量")
	public Double getMaxDepartWeight() {
		return maxDepartWeight;
	}

	public void setMaxDepartWeight(Double maxDepartWeight) {
		this.maxDepartWeight = maxDepartWeight;
	}

	@Column(name = "MAX_LANDFALL_WEIGHT")
	@Comment("最大着陆重量")
	public Double getMaxLandfallWeight() {
		return maxLandfallWeight;
	}

	public void setMaxLandfallWeight(Double maxLandfallWeight) {
		this.maxLandfallWeight = maxLandfallWeight;
	}

	@Column(name = "START_DATE", columnDefinition = "DATE")
	@Comment("在册开始日期")
	public Date getStartDate() {
		return startDate;
	}

	public void setStartDate(Date startDate) {
		this.startDate = startDate;
	}

	@Column(name = "END_DATE", columnDefinition = "DATE")
	@Comment("在册结束日期")
	public Date getEndDate() {
		return endDate;
	}

	public void setEndDate(Date endDate) {
		this.endDate = endDate;
	}

	@Column(name = "CARRIER")
	@Comment("承运人")
	public String getCarrier() {
		return carrier;
	}

	public void setCarrier(String carrier) {
		this.carrier = carrier;
	}

}
