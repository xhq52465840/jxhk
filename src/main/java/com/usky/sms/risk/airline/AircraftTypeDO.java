
package com.usky.sms.risk.airline;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_AIRCRAFT_TYPE")
@Comment("航线信息中的机型信息")
public class AircraftTypeDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 5640926427873884825L;
	
	/** 航线信息 */
	private AirlineInfoDO airlineInfo;
	
	/** 机型 */
	private String type;
	
	/** 排序 */
	private Integer sequence;
	
	@ManyToOne
	@JoinColumn(name = "airline_info")
	@Comment("航线信息")
	public AirlineInfoDO getAirlineInfo() {
		return airlineInfo;
	}
	
	public void setAirlineInfo(AirlineInfoDO airlineInfo) {
		this.airlineInfo = airlineInfo;
	}
	
	@Column(length = 30)
	@Comment("机型")
	public String getType() {
		return type;
	}
	
	public void setType(String type) {
		this.type = type;
	}
	
	@Column
	@Comment("排序")
	public Integer getSequence() {
		return sequence;
	}
	
	public void setSequence(Integer sequence) {
		this.sequence = sequence;
	}
	
}
