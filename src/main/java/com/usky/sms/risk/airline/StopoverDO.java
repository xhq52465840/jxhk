
package com.usky.sms.risk.airline;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_STOPOVER")
@Comment("风险管理实例中航线信息中的经停机场")
public class StopoverDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 6036886980974372657L;
	
	/** 航线信息 */
	private AirlineInfoDO airlineInfo;
	
	/** 机场四字码 */
	private String airport;
	
	/** 机场名称 */
	private String airportName;
	
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
	
	@Column(length = 4)
	@Comment("机场四字码")
	public String getAirport() {
		return airport;
	}
	
	public void setAirport(String airport) {
		this.airport = airport;
	}
	
	@Column(name = "airport_name", length = 60)
	@Comment("机场名称")
	public String getAirportName() {
		return airportName;
	}
	
	public void setAirportName(String airportName) {
		this.airportName = airportName;
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
