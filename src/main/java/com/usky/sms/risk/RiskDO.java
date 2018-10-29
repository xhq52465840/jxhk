
package com.usky.sms.risk;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "T_RISK")
@Comment("风险分析")
public class RiskDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -9082256999635197135L;
	
	/** 关联的安全信息 */
	private ActivityDO activity;
	
	/** 安全信息编号 */
	private String code;
	
	/** 风险分析概要 */
	private String rsummary;

	/** 风险分析描述 */
	private String rdescription;
	
	/** 状态 完成、新建 */
	private String status;
	
	/** 创建人 */
	private UserDO creator;
	
	/** 分析人 */
	private String riskAnalysts;
	
	/** 系统分析 */
	private String systems;
	
	/** 风险管理中的任务分配 */
	private RiskTaskDO riskTask;
	
	/** 风险分析的编号 */
	private String riskNo;
	
	@ManyToOne
	@JoinColumn(name = "ACTIVITY_ID")
	@Comment("关联的安全信息")
	public ActivityDO getActivity() {
		return activity;
	}
	
	public void setActivity(ActivityDO activity) {
		this.activity = activity;
	}
	
	@Column(length = 60)
	@Comment("安全信息编号")
	public String getCode() {
		return code;
	}
	
	public void setCode(String code) {
		this.code = code;
	}

	@Column(length = 255)
	@Comment("风险分析概要")
	public String getRsummary() {
		return rsummary;
	}

	public void setRsummary(String rsummary) {
		this.rsummary = rsummary;
	}

	@Column(length = 2000)
	@Comment("风险分析描述")
	public String getRdescription() {
		return rdescription;
	}

	public void setRdescription(String rdescription) {
		this.rdescription = rdescription;
	}

	@Column(length = 10)
	@Comment("状态 完成、新建")
	public String getStatus() {
		return status;
	}
	
	public void setStatus(String status) {
		this.status = status;
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
	
	@Column(length = 100)
	@Comment("分析人")
	public String getRiskAnalysts() {
		return riskAnalysts;
	}
	
	public void setRiskAnalysts(String riskAnalysts) {
		this.riskAnalysts = riskAnalysts;
	}
	
	@Column(length = 1000)
	@Comment("系统分析")
	public String getSystems() {
		return systems;
	}
	
	public void setSystems(String systems) {
		this.systems = systems;
	}

	@ManyToOne
	@JoinColumn(name = "RISK_TASK")
	@Comment("风险管理中的任务分配")
	public RiskTaskDO getRiskTask() {
		return riskTask;
	}

	public void setRiskTask(RiskTaskDO riskTask) {
		this.riskTask = riskTask;
	}

	@Column(name = "RISK_NO", length = 20)
	@Comment("风险分析的编号")
	public String getRiskNo() {
		return riskNo;
	}

	public void setRiskNo(String riskNo) {
		this.riskNo = riskNo;
	}
	
	
	
}
