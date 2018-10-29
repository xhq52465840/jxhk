package com.usky.sms.safetyreview.inst;

import org.hibernate.cfg.Comment;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;

/**
 * 分值标准实例
 */
@Entity
@Table(name = "T_SCORE_STANDARD_INST")
@Comment("分值标准实例")
public class ScoreStandardInstDO extends AbstractBaseDO implements Comparable<ScoreStandardInstDO>,IDisplayable{
	
	private static final long serialVersionUID = -7945666974508253259L;

	/** 考核内容 */
	private AssessmentCommentInstDO assessmentCommentInst;
	
	/** 最小值(默认0) */
	private Double min = 0.0;
	
	/** 最大值 */
	private Double max;
	
	/** 描述 */
	private String description;
	
	/** 详细 */
	private Set<ScoreStandardDetailInstDO> details;

	@OneToOne
	@JoinColumn(name = "COMMENT_INST_ID")
	@Comment("考核内容")
	public AssessmentCommentInstDO getAssessmentCommentInst() {
		return assessmentCommentInst;
	}

	public void setAssessmentCommentInst(AssessmentCommentInstDO assessmentCommentInst) {
		this.assessmentCommentInst = assessmentCommentInst;
	}

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

	@OneToMany(mappedBy = "scoreStandardInst")
	@Comment("详细")
	public Set<ScoreStandardDetailInstDO> getDetails() {
		return details;
	}

	public void setDetails(Set<ScoreStandardDetailInstDO> details) {
		this.details = details;
	}

	@Override
	public int compareTo(ScoreStandardInstDO o) {
		return this.getId().compareTo(o.getId());
	}

	@Override
	@Transient
	public String getDisplayName() {	
		return "";
	}
}
