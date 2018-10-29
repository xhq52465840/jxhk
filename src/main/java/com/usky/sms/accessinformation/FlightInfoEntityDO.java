
package com.usky.sms.accessinformation;
import org.hibernate.cfg.Comment;

import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.flightmovementinfo.FlightInfoDO;

@Entity
@Table(name = "T_FLIGHT_INFO_ENTITY")
@Comment("航班和安全信息关联表")
public class FlightInfoEntityDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 450483798611510206L;
	
	/** 安全信息 **/
	private ActivityDO activity;
	
	/** 航班信息 **/
	private FlightInfoDO flightInfo;
	
	/** 飞行阶段  **/
	private DictionaryDO flightPhase;
	
	@ManyToOne
	@JoinColumn(name = "ACTIVITY_ID")
	@Comment("安全信息")
	public ActivityDO getActivity() {
		return activity;
	}
	
	public void setActivity(ActivityDO activity) {
		this.activity = activity;
	}
	
	@ManyToOne
	@JoinColumn(name = "flight_info")
	@Comment("航班信息")
	public FlightInfoDO getFlightInfo() {
		return flightInfo;
	}
	
	public void setFlightInfo(FlightInfoDO flightInfo) {
		this.flightInfo = flightInfo;
	}
	
	@ManyToOne
	@JoinColumn(name = "flight_phase")
	@Comment("飞行阶段")
	public DictionaryDO getFlightPhase() {
		return flightPhase;
	}
	
	public void setFlightPhase(DictionaryDO flightPhase) {
		this.flightPhase = flightPhase;
	}
	
}
