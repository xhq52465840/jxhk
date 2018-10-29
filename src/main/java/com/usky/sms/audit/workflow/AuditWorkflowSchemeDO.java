package com.usky.sms.audit.workflow;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "A_AUDIT_WORKFLOW_SCHEME")
@Comment("审计工作流配置")
public class AuditWorkflowSchemeDO extends AbstractBaseDO {

	private static final long serialVersionUID = -5003559867026817995L;

	/** 审计信息类型名称 */
	private String auditInfoType;
	
	/** 工作流模板(ID) */
	private String workflowTemplate;

	@Column(name = "AUDIT_INFO_TYPE", length = 100, nullable = false)
	@Comment("审计信息类型名称")
	public String getAuditInfoType() {
		return auditInfoType;
	}

	public void setAuditInfoType(String auditInfoType) {
		this.auditInfoType = auditInfoType;
	}

	@Column(name = "WORKFLOW_TEMPLATE", length = 50)
	@Comment("工作流模板(ID)")
	public String getWorkflowTemplate() {
		return workflowTemplate;
	}

	public void setWorkflowTemplate(String workflowTemplate) {
		this.workflowTemplate = workflowTemplate;
	}
	
	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (null == obj) {
			return false;
		}
		if (!(obj instanceof AuditWorkflowSchemeDO)) {
			return false;
		}
		final AuditWorkflowSchemeDO auditWorkflowScheme = (AuditWorkflowSchemeDO) obj;
		if (this.getId().equals(auditWorkflowScheme.getId())) {
			return true;
		}
		return false;
	}

	@Override
	public int hashCode() {
		return this.getId().hashCode();
	}
	
}
