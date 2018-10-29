
package com.usky.sms.risk.airline;
import org.hibernate.cfg.Comment;

import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.unit.UnitDO;

@Entity
@Table(name = "T_AIRLINE_INFO")
@Comment("风险管理实例中的航线")
public class AirlineInfoDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -3172902919674623757L;
	
	/** 对应的安全信息 */
	private ActivityDO activity;
	
	/** 起飞机场四字码 */
	private String departureAirport;
	
	/** 到达机场四字码 */
	private String arrivalAirport;
	
	/** 起飞机场名称 */
	private String departureAirportName;
	
	/** 到达机场名称 */
	private String arrivalAirportName;
	
	/** 经停 */
	private List<StopoverDO> stopovers;
	
	/** 安监机构 */
	private UnitDO unit;
	
	/** 航线信息中的机型信息 */
	private List<AircraftTypeDO> types;
	
	@ManyToOne
	@JoinColumn(name = "ACTIVITY_ID")
	@Comment("对应的安全信息")
	public ActivityDO getActivity() {
		return activity;
	}
	
	public void setActivity(ActivityDO activity) {
		this.activity = activity;
	}
	
	@Column(name = "departure_airport", length = 4)
	@Comment("起飞机场四字码")
	public String getDepartureAirport() {
		return departureAirport;
	}
	
	public void setDepartureAirport(String departureAirport) {
		this.departureAirport = departureAirport;
	}
	
	@Column(name = "arrival_airport", length = 4)
	@Comment("到达机场四字码")
	public String getArrivalAirport() {
		return arrivalAirport;
	}
	
	public void setArrivalAirport(String arrivalAirport) {
		this.arrivalAirport = arrivalAirport;
	}
	
	@Column(name = "departure_airport_name", length = 60)
	@Comment("起飞机场名称")
	public String getDepartureAirportName() {
		return departureAirportName;
	}
	
	public void setDepartureAirportName(String departureAirportName) {
		this.departureAirportName = departureAirportName;
	}
	
	@Column(name = "arrival_airport_name", length = 60)
	@Comment("到达机场名称")
	public String getArrivalAirportName() {
		return arrivalAirportName;
	}
	
	public void setArrivalAirportName(String arrivalAirportName) {
		this.arrivalAirportName = arrivalAirportName;
	}
	
	@OneToMany(mappedBy = "airlineInfo")
	@Comment("经停")
	public List<StopoverDO> getStopovers() {
		return stopovers;
	}
	
	public void setStopovers(List<StopoverDO> stopovers) {
		this.stopovers = stopovers;
	}
	
	@ManyToOne
	@JoinColumn(name = "UNIT_ID")
	@Comment("安监机构")
	public UnitDO getUnit() {
		return unit;
	}
	
	public void setUnit(UnitDO unit) {
		this.unit = unit;
	}
	
	@OneToMany(mappedBy = "airlineInfo")
	@Comment("航线信息中的机型信息")
	public List<AircraftTypeDO> getTypes() {
		return types;
	}
	
	public void setTypes(List<AircraftTypeDO> types) {
		this.types = types;
	}
	
}
