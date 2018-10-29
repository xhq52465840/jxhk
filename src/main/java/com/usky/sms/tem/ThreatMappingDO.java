
package com.usky.sms.tem;
import org.hibernate.cfg.Comment;

import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.tem.threat.ThreatDO;

@Entity
@Table(name = "T_THREAT_MAPPING")
@Comment("TEM明细行（威胁）")
public class ThreatMappingDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -4808686684167686065L;
	
	/** 对应的tem */
	private TemDO tem;
	
	/** 对应的威胁 */
	private ThreatDO threat;
	
	@ManyToOne
	@JoinColumn(name = "TEM_ID")
	@Comment("对应的tem")
	public TemDO getTem() {
		return tem;
	}
	
	public void setTem(TemDO tem) {
		this.tem = tem;
	}
	
	@ManyToOne
	@JoinColumn(name = "THREAT_ID")
	@Comment("对应的威胁")
	public ThreatDO getThreat() {
		return threat;
	}
	
	public void setThreat(ThreatDO threat) {
		this.threat = threat;
	}
	
}
