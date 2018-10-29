
package com.usky.sms.workflow;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.activity.type.ActivityTypeDO;
import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_WORKFLOW_SCHEME_ENTITY")
@Comment("工作流信息类型和方案关联表")
public class WorkflowSchemeEntityDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -7793858721841687962L;
	
	/** 工作流方案 */
	private WorkflowSchemeDO scheme;
	
	/** 工作流 */
	private String workflow;
	
	/** 安全信息类型 */
	private ActivityTypeDO type;
	
	@ManyToOne
	@JoinColumn(name = "SCHEME_ID")
	@Comment("工作流方案")
	public WorkflowSchemeDO getScheme() {
		return scheme;
	}
	
	public void setScheme(WorkflowSchemeDO scheme) {
		this.scheme = scheme;
	}
	
	@Column(length = 50)
	@Comment("工作流")
	public String getWorkflow() {
		return workflow;
	}
	
	public void setWorkflow(String workflow) {
		this.workflow = workflow;
	}
	
	@ManyToOne
	@JoinColumn(name = "TYPE_ID")
	@Comment("安全信息类型")
	public ActivityTypeDO getType() {
		return type;
	}
	
	public void setType(ActivityTypeDO type) {
		this.type = type;
	}
	
}
