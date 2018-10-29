
package com.usky.sms.accessinformation;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.dictionary.DictionaryDO;

@Entity
@Table(name = "T_VEHICLE_INFO_ENTITY")
@Comment("车辆信息")
public class VehicleInfoEntityDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 844827765783420022L;
	
	/** 安全信息主键  **/
	private ActivityDO activity;
	
	/** 车辆类型  **/
	private DictionaryDO vehicleInfo;
	
	/** 牌号  **/
	private String num;
	
	/** 描述  **/
	private String description;
	
	@ManyToOne
	@JoinColumn(name = "ACTIVITY_ID")
	@Comment("安全信息主键")
	public ActivityDO getActivity() {
		return activity;
	}
	
	public void setActivity(ActivityDO activity) {
		this.activity = activity;
	}
	
	@ManyToOne
	@JoinColumn(name = "vehicle_info")
	@Comment("车辆类型")
	public DictionaryDO getVehicleInfo() {
		return vehicleInfo;
	}
	
	public void setVehicleInfo(DictionaryDO vehicleInfo) {
		this.vehicleInfo = vehicleInfo;
	}
	
	@Column(length = 20)
	@Comment("牌号")
	public String getNum() {
		return num;
	}
	
	public void setNum(String num) {
		this.num = num;
	}
	
	@Column(length = 4000)
	@Comment("描述")
	public String getDescription() {
		return description;
	}
	
	public void setDescription(String description) {
		this.description = description;
	}
	
}
