
package com.usky.sms.unit;
import org.hibernate.cfg.Comment;

import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import com.usky.sms.activity.security.ActivitySecuritySchemeDO;
import com.usky.sms.activity.type.ActivityTypeSchemeDO;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.field.FieldLayoutSchemeDO;
import com.usky.sms.field.screen.ActivityTypeFieldScreenSchemeDO;
import com.usky.sms.notification.NotificationSchemeDO;
import com.usky.sms.permission.PermissionSchemeDO;
import com.usky.sms.workflow.WorkflowSchemeDO;

@Entity
@Table(name = "T_UNIT_CONFIG")
@Comment("安监机构配置")
public class UnitConfigDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 8429463549440210425L;
	
	/** 安监机构 */
	private UnitDO unit;
	
	/** 信息类型方案 */
	private ActivityTypeSchemeDO activityTypeScheme;
	
	/** 信息类型界面方案 */
	private ActivityTypeFieldScreenSchemeDO activityTypeFieldScreenScheme;
	
	/** 字段方案 */
	private FieldLayoutSchemeDO fieldLayoutScheme;
	
	/** 权限方案 */
	private PermissionSchemeDO permissionScheme;
	
	/** 通知方案 */
	private NotificationSchemeDO notificationScheme;
	
	/** 工作流方案 */
	private WorkflowSchemeDO workflowScheme;
	
	/** 信息安全方案 */
	private ActivitySecuritySchemeDO activitySecurityScheme;
	
	@OneToOne
	@JoinColumn(name = "UNIT_ID")
	@Comment("安监机构")
	public UnitDO getUnit() {
		return unit;
	}
	
	public void setUnit(UnitDO unit) {
		this.unit = unit;
	}
	
	@ManyToOne
	@JoinColumn(name = "activity_type_scheme")
	@Comment("信息类型方案")
	public ActivityTypeSchemeDO getActivityTypeScheme() {
		return activityTypeScheme;
	}
	
	public void setActivityTypeScheme(ActivityTypeSchemeDO activityTypeScheme) {
		this.activityTypeScheme = activityTypeScheme;
	}
	
	@ManyToOne
	@JoinColumn(name = "atype_field_screen_scheme")
	@Comment("信息类型界面方案")
	public ActivityTypeFieldScreenSchemeDO getActivityTypeFieldScreenScheme() {
		return activityTypeFieldScreenScheme;
	}
	
	public void setActivityTypeFieldScreenScheme(ActivityTypeFieldScreenSchemeDO activityTypeFieldScreenScheme) {
		this.activityTypeFieldScreenScheme = activityTypeFieldScreenScheme;
	}
	
	@ManyToOne
	@JoinColumn(name = "field_layout_scheme")
	@Comment("字段方案")
	public FieldLayoutSchemeDO getFieldLayoutScheme() {
		return fieldLayoutScheme;
	}
	
	public void setFieldLayoutScheme(FieldLayoutSchemeDO fieldLayoutScheme) {
		this.fieldLayoutScheme = fieldLayoutScheme;
	}
	
	@ManyToOne
	@JoinColumn(name = "permission_scheme")
	@Comment("权限方案")
	public PermissionSchemeDO getPermissionScheme() {
		return permissionScheme;
	}
	
	public void setPermissionScheme(PermissionSchemeDO permissionScheme) {
		this.permissionScheme = permissionScheme;
	}
	
	@ManyToOne
	@JoinColumn(name = "notification_scheme")
	@Comment("通知方案")
	public NotificationSchemeDO getNotificationScheme() {
		return notificationScheme;
	}
	
	public void setNotificationScheme(NotificationSchemeDO notificationScheme) {
		this.notificationScheme = notificationScheme;
	}
	
	@ManyToOne
	@JoinColumn(name = "workflow_scheme")
	@Comment("工作流方案")
	public WorkflowSchemeDO getWorkflowScheme() {
		return workflowScheme;
	}
	
	public void setWorkflowScheme(WorkflowSchemeDO workflowScheme) {
		this.workflowScheme = workflowScheme;
	}
	
	@ManyToOne
	@JoinColumn(name = "activity_security_scheme")
	@Comment("信息安全方案")
	public ActivitySecuritySchemeDO getActivitySecurityScheme() {
		return activitySecurityScheme;
	}
	
	public void setActivitySecurityScheme(ActivitySecuritySchemeDO activitySecurityScheme) {
		this.activitySecurityScheme = activitySecurityScheme;
	}
	
}
