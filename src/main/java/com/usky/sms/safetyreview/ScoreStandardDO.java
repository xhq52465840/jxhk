package com.usky.sms.safetyreview;

import org.hibernate.cfg.Comment;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;
import com.usky.sms.user.UserDO;

/**
 * 分值标准
 */
@Entity
@Table(name = "T_SCORE_STANDARD")
@Comment("分值标准")
public class ScoreStandardDO extends AbstractBaseDO implements Comparable<ScoreStandardDO>,IDisplayable{
	
	private static final long serialVersionUID = 5707267450582238159L;
	
	/** 考核内容 */
	private AssessmentCommentDO assessmentComment;
	
	/** 最小值 */
	private Double min;
	
	/** 最大值 */
	private Double max;
	
	/** 描述 */
	private String description; 
	
	/** 详细 */
	private Set<ScoreStandardDetailDO> details;
	
	/** 创建人 */
	private UserDO creator;
	
	/** 更新人 */
	private UserDO updater;

	@ManyToOne
	@JoinColumn(name = "COMMENT_ID")
	@Comment("考核内容")
	public AssessmentCommentDO getAssessmentComment() {
		return assessmentComment;
	}

	public void setAssessmentComment(AssessmentCommentDO assessmentComment) {
		this.assessmentComment = assessmentComment;
	}

	@Comment("最小值")
	public Double getMin() {
		return min;
	}

	public void setMin(Double min) {
		this.min = min;
	}

	@Comment("最大值")
	public Double getMax() {
		return max;
	}

	public void setMax(Double max) {
		this.max = max;
	}
	
	@Column(name = "DESCRIPTION")
	@Comment("描述")
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	@OneToMany(mappedBy = "scoreStandard")
	@Comment("详细")
	public Set<ScoreStandardDetailDO> getDetails() {
		return details;
	}

	public void setDetails(Set<ScoreStandardDetailDO> details) {
		this.details = details;
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
	public int compareTo(ScoreStandardDO o) {
		return this.getId().compareTo(o.getId());
	}

	@Override
	@Transient
	public String getDisplayName() {	
		return "";
	}
}
