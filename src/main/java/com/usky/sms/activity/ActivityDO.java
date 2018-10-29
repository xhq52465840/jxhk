package com.usky.sms.activity;

import org.hibernate.cfg.Comment;
import java.util.Date;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import com.usky.sms.activity.attribute.ActivityPriorityDO;
import com.usky.sms.activity.attribute.ActivityResolutionDO;
import com.usky.sms.activity.attribute.ActivityStatusDO;
import com.usky.sms.activity.security.ActivitySecurityLevelDO;
import com.usky.sms.activity.type.ActivityTypeDO;
import com.usky.sms.core.AbstractHistorizableBaseDO;
import com.usky.sms.custom.CustomFieldValueDO;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "T_ACTIVITY")
@Comment("安全信息")
public class ActivityDO extends AbstractHistorizableBaseDO {

	private static final long serialVersionUID = -8407391669434975129L;

	/** 安监机构 */
	private UnitDO unit;

	/** 类型 */
	private ActivityTypeDO type;

	/** 状态 */
	private ActivityStatusDO status;

	/** 优先级 */
	private ActivityPriorityDO priority;

	/** 解决结果 */
	private ActivityResolutionDO resolution;

	/** 安全级别 */
	private ActivitySecurityLevelDO security;

	/** 标题摘要 */
	private String summary;

	/** 信息详细描述 */
	private String description;

	/** 分配人 */
	private UserDO assignee;
	/** 创建人 */
	private UserDO creator;

	/** 报告人 */
	private UserDO reporter;

	/** 自定义字段的value */
	private Set<CustomFieldValueDO> values;

	/** 信息编号后几位 */
	private Integer num;
	
	/** 工作流实例 */
	private String workflowId;
	
	/** 是否发布 */
	private boolean release = false;
	
	/** 是否发布 */
	private Date releaseDate;
	
	/** 源安全信息的ID */
	private Integer originActivityId;
	
	@ManyToOne
	@JoinColumn(name = "UNIT_ID")
	@Comment("安监机构")
	public UnitDO getUnit() {
		return unit;
	}

	public void setUnit(UnitDO unit) {
		this.unit = unit;
	}

	@ManyToOne
	@JoinColumn(name = "TYPE_ID")
	@Comment("类型")
	public ActivityTypeDO getType() {
		return type;
	}

	public void setType(ActivityTypeDO type) {
		this.type = type;
	}

	@ManyToOne
	@JoinColumn(name = "STATUS_ID")
	@Comment("状态")
	public ActivityStatusDO getStatus() {
		return status;
	}

	public void setStatus(ActivityStatusDO status) {
		this.status = status;
	}

	@ManyToOne
	@JoinColumn(name = "PRIORITY_ID")
	@Comment("优先级")
	public ActivityPriorityDO getPriority() {
		return priority;
	}

	public void setPriority(ActivityPriorityDO priority) {
		this.priority = priority;
	}

	@ManyToOne
	@JoinColumn(name = "RESOLUTION_ID")
	@Comment("解决结果")
	public ActivityResolutionDO getResolution() {
		return resolution;
	}

	public void setResolution(ActivityResolutionDO resolution) {
		this.resolution = resolution;
	}

	@ManyToOne
	@JoinColumn(name = "SECURITY_ID")
	@Comment("安全级别")
	public ActivitySecurityLevelDO getSecurity() {
		return security;
	}

	public void setSecurity(ActivitySecurityLevelDO security) {
		this.security = security;
	}

	@Column(length = 255)
	@Comment("标题摘要")
	public String getSummary() {
		return summary;
	}

	public void setSummary(String summary) {
		this.summary = summary;
	}

	@Column(length = 2000)
	@Comment("信息详细描述")
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	@ManyToOne
	@JoinColumn(name = "ASSIGNEE_ID")
	@Comment("分配人")
	public UserDO getAssignee() {
		return assignee;
	}

	public void setAssignee(UserDO assignee) {
		this.assignee = assignee;
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

	@ManyToOne
	@JoinColumn(name = "REPORTER_ID")
	@Comment("报告人")
	public UserDO getReporter() {
		return reporter;
	}

	public void setReporter(UserDO reporter) {
		this.reporter = reporter;
	}

	@OneToMany(mappedBy = "activity")
	@Comment("自定义字段的value")
	public Set<CustomFieldValueDO> getValues() {
		return values;
	}

	public void setValues(Set<CustomFieldValueDO> values) {
		this.values = values;
	}

	@Column
	@Comment("信息编号后几位")
	public Integer getNum() {
		return num;
	}
	
	public void setNum(Integer num) {
		this.num = num;
	}
	
	@Column(name = "workflow_id", length = 12)
	@Comment("工作流实例")
	public String getWorkflowId() {
		return workflowId;
	}
	
	public void setWorkflowId(String workflowId) {
		this.workflowId = workflowId;
	}
	
	@Column(name = "RELEASE", columnDefinition = "NUMBER(1) DEFAULT 0", nullable = false)
	public boolean isRelease() {
		return release;
	}

	public void setRelease(boolean release) {
		this.release = release;
	}

	@Column(name = "RELEASE_DATE")
	@Comment("是否发布")
	public Date getReleaseDate() {
		return releaseDate;
	}

	public void setReleaseDate(Date releaseDate) {
		this.releaseDate = releaseDate;
	}

	@Column(name = "ORIGIN_ACTIVITY_ID")
	@Comment("源安全信息的ID")
	public Integer getOriginActivityId() {
		return originActivityId;
	}

	public void setOriginActivityId(Integer originActivityId) {
		this.originActivityId = originActivityId;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (null == obj) {
			return false;
		}
		if (!(obj instanceof ActivityDO)) {
			return false;
		}
		final ActivityDO activity = (ActivityDO) obj;
		if (this.getId().equals(activity.getId())) {
			return true;
		}
		return false;
	}

	@Override
	public int hashCode() {
		return this.getId().hashCode();
	}
	
}
