package com.usky.sms.aircraftType;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.user.UserDO;

/**
 * @deprecated
 * @see {@link com.usky.sms.aircraftType.AircraftModelDO}
*/
@Deprecated
@Entity
@Table(name = "T_AIRCRAFT_TYPE_DICTIONARY")
@Comment("机型字典")
public class AircraftTypeDictionaryDO extends AbstractBaseDO {

	private static final long serialVersionUID = 9057763938685185345L;

	/** 大机型 **/
	private String aircraftType;

	/** 小机型 **/
	private String aircrafts;

	/** 创建人 **/
	private UserDO creator;

	/** 最后更新人 **/
	private UserDO lastUpdater;

	@Comment("大机型")
	public String getAircraftType() {
		return aircraftType;
	}

	@Column(name = "aircraft_type", length = 50)
	public void setAircraftType(String aircraftType) {
		this.aircraftType = aircraftType;
	}

	@Column(length = 4000)
	@Comment("小机型")
	public String getAircrafts() {
		return aircrafts;
	}

	public void setAircrafts(String aircrafts) {
		this.aircrafts = aircrafts;
	}

	@ManyToOne
	@JoinColumn(name = "CREATOR_ID")
	@Comment("创建人")
	public UserDO getCreator() {
		return creator;
	}

	public void setCreator(UserDO creator) {
		this.creator = creator;
	}

	@ManyToOne
	@JoinColumn(name = "LASTUPDATER_ID")
	@Comment("最后更新人")
	public UserDO getLastUpdater() {
		return lastUpdater;
	}

	public void setLastUpdater(UserDO lastUpdater) {
		this.lastUpdater = lastUpdater;
	}

}
