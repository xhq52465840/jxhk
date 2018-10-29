package com.usky.sms.safetyreview;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;
import com.usky.sms.filtermanager.FiltermanagerDO;
import com.usky.sms.user.UserDO;

/**
 * 考核内容
 */
@Entity
@Table(name = "T_ASSESSMENT_COMMENT")
@Comment("考核内容")
public class AssessmentCommentDO extends AbstractBaseDO implements
		Comparable<AssessmentCommentDO>,IDisplayable{
	
	private static final long serialVersionUID = 8043791861538094914L;
	
	/** 考核内容说明 */
	private String description;
	
	/** 考核项目 */
	private AssessmentProjectDO assessmentProject;
	
	/** 考核来源(A:安全信息，R:资料上传，O:人工) */
	private String type;
	
	/** 对应的过滤器 */
	private FiltermanagerDO filter;
	
	/** 评分标准描述 */
	private String standardSummary;
	
	/** 创建人 */
	private UserDO creator;
	
	/** 更新人 */
	private UserDO updater;

	@Column(length = 255)
	@Comment("考核内容说明")
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	@ManyToOne
	@JoinColumn(name = "PROJECT_ID")
	@Fetch(FetchMode.JOIN)
	@Comment("考核项目")
	public AssessmentProjectDO getAssessmentProject() {
		return assessmentProject;
	}

	public void setAssessmentProject(AssessmentProjectDO assessmentProject) {
		this.assessmentProject = assessmentProject;
	}
	
	@Column(length = 20)
	@Comment("考核来源(A:安全信息，R:资料上传，O:人工)")
	public String getType() {
		return type;
	}
	
	public void setType(String type) {
		this.type = type;
	}
	
	@ManyToOne
	@JoinColumn(name = "FILTER_ID")
	@Comment("对应的过滤器")
	public FiltermanagerDO getFilter() {
		return filter;
	}
	
	public void setFilter(FiltermanagerDO filter) {
		this.filter = filter;
	}

	@Column(name = "STANDARD_SUMMARY")
	@Comment("评分标准描述")
	public String getStandardSummary() {
		return standardSummary;
	}

	public void setStandardSummary(String standardSummary) {
		this.standardSummary = standardSummary;
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
	@JoinColumn(name = "UPDATER_ID")
	@Comment("更新人")
	public UserDO getUpdater() {
		return updater;
	}

	public void setUpdater(UserDO updater) {
		this.updater = updater;
	}
	
	@Override
	public int compareTo(AssessmentCommentDO o) {
		return this.getId().compareTo(o.getId());
	}

	@Override
	@Transient
	public String getDisplayName() {	
		return this.description;
	}

}
