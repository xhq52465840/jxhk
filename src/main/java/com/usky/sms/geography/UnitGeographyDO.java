package com.usky.sms.geography;

import org.hibernate.cfg.Comment;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;
import com.usky.sms.unit.UnitDO;

@Entity
@Table(name = "T_UNIT_GEOGRAPHY")
@Comment("安监机构与地理位置的关联")
public class UnitGeographyDO extends AbstractBaseDO implements IDisplayable {

	private static final long serialVersionUID = -4415846687309545445L;

	/** 安监机构 */
	private UnitDO unit;

	/** 地理位置 */
	private GeographyDO geography;

	public UnitGeographyDO(){
		
	}

	/**
	 * @return the unit
	 */
	@OneToOne
	@JoinColumn(name="UNIT_ID")
	@Comment("安监机构")
	public UnitDO getUnit() {
		return unit;
	}

	/**
	 * @param unit the unit to set
	 */
	public void setUnit(UnitDO unit) {
		this.unit = unit;
	}

	/**
	 * @return the geography
	 */
	@OneToOne
	@JoinColumn(name="GEOGRAPHY_ID")
	@Comment("地理位置")
	public GeographyDO getGeography() {
		return geography;
	}

	/**
	 * @param geography the geography to set
	 */
	public void setGeography(GeographyDO geography) {
		this.geography = geography;
	}

	@Transient
	@Override
	public String getDisplayName() {
		return "";
	}
}
