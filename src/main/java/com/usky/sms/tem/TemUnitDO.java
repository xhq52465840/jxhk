
package com.usky.sms.tem;
import org.hibernate.cfg.Comment;

import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.unit.UnitDO;

@Entity
@Table(name = "T_TEM_UNIT")
@Comment("跨安监分析TEM")
public class TemUnitDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 5789506897478913307L;
	
	/** 对应的安全信息 */
	private ActivityDO activity;
	
	/** 对应的安监机构 */
	private UnitDO unit;
	
	@ManyToOne
	@JoinColumn(name = "ACTIVITY_ID")
	@Comment("对应的安全信息")
	public ActivityDO getActivity() {
		return activity;
	}
	
	public void setActivity(ActivityDO activity) {
		this.activity = activity;
	}
	
	@ManyToOne
	@JoinColumn(name = "UNIT_ID")
	@Comment("对应的安监机构")
	public UnitDO getUnit() {
		return unit;
	}
	
	public void setUnit(UnitDO unit) {
		this.unit = unit;
	}
	
}
