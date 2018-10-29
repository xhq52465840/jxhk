package com.usky.sms.aircraftType;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "T_AIRCRAFT_MODEL")
@Comment("机型")
public class AircraftModelDO extends AbstractBaseDO {

	private static final long serialVersionUID = 318541080798665495L;

	/** 机型类型 */
	private String code;

	/** 机型系列 */
	private String familycode;
	
	/** 机型厂商 */
	private String manufacturer;

	/** 创建人 */
	private UserDO creator;

	/** 更新人 */
	private UserDO lastUpdater;

	@Column(name = "CODE", length = 50)
	@Comment("机型类型")
	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	@Column(name = "FAMILYCODE", length = 50)
	@Comment("机型系列")
	public String getFamilycode() {
		return familycode;
	}

	public void setFamilycode(String familycode) {
		this.familycode = familycode;
	}

	@Column(name = "MANUFACTURER", length = 50)
	@Comment("机型厂商")
	public String getManufacturer() {
		return manufacturer;
	}

	public void setManufacturer(String manufacturer) {
		this.manufacturer = manufacturer;
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
	@Comment("更新人")
	public UserDO getLastUpdater() {
		return lastUpdater;
	}

	public void setLastUpdater(UserDO lastUpdater) {
		this.lastUpdater = lastUpdater;
	}

}
