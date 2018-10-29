
package com.usky.sms.risk;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.organization.OrganizationDO;

@Entity
@Table(name = "T_RISK_TASK")
@Comment("风险管理中的任务分配")
public class RiskTaskDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -6383173362221390495L;
	
	/** 安全信息 */
	private ActivityDO activity;
	
	/** 组织 */
	private OrganizationDO organization;
	
	/** 类型 Y已发布 N未发布 */
	private String type;
	
	/** 排序 */
	private Integer sequence;
	
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
	@JoinColumn(name = "ORGANIZATION_ID")
	@Comment("组织")
	public OrganizationDO getOrganization() {
		return organization;
	}
	
	public void setOrganization(OrganizationDO organization) {
		this.organization = organization;
	}
	
	@Column(length = 10)
	@Comment("类型 Y已发布 N未发布")
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
