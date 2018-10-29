
package com.usky.sms.tem;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.tem.control.ControlDO;

@Entity
@Table(name = "T_CONTROL_MEASURE")
@Comment("tem中控制措施实例")
public class ControlMeasureDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 7594406337185380177L;
	
	/** 威胁实例 */
	private ThreatMappingDO threat;
	
	/** 差错实例 */
	private ErrorMappingDO error;
	
	/** 控制措施 */
	private ControlDO control;
	
	/** 状态(未发布、未落实、落实) */
	private String status;
	
	@ManyToOne
	@JoinColumn(name = "THREAT_ID")
	@Comment("威胁实例")
	public ThreatMappingDO getThreat() {
		return threat;
	}
	
	public void setThreat(ThreatMappingDO threat) {
		this.threat = threat;
	}
	
	@ManyToOne
	@JoinColumn(name = "ERROR_ID")
	@Comment("差错实例")
	public ErrorMappingDO getError() {
		return error;
	}
	
	public void setError(ErrorMappingDO error) {
		this.error = error;
	}
	
	@ManyToOne
	@JoinColumn(name = "CONTROL_ID")
	@Comment("控制措施")
	public ControlDO getControl() {
		return control;
	}
	
	public void setControl(ControlDO control) {
		this.control = control;
	}
	
	@Column(length = 10)
	@Comment("状态(未发布、未落实、落实)")
	public String getStatus() {
		return status;
	}
	
	public void setStatus(String status) {
		this.status = status;
	}
	
}
