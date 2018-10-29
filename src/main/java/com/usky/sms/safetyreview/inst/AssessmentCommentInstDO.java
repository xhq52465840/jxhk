package com.usky.sms.safetyreview.inst;

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

/**
 * 考核内容实例
 */
@Entity
@Table(name = "T_ASSESSMENT_COMMENT_INST")
@Comment("考核内容实例")
public class AssessmentCommentInstDO extends AbstractBaseDO implements
		Comparable<AssessmentCommentInstDO>,IDisplayable{
	
	private static final long serialVersionUID = 8043791861538094914L;
	
	/** 考核内容说明 */
	private String description;
	
//	/** 分值标准 */
//	private ScoreStandardInstDO scoreStandardInst;
	
	/** 考核项目 */
	private AssessmentProjectInstDO assessmentProjectInst;
	
	/** 字典中考核内容的ID(关联日常工作情况时使用) */
	private Integer assessmentCommentTemplateId;
	
	/** 考核来源(A:安全信息，R:资料上传，O:人工) */
	private String type;
	
	/** 对应的过滤器id */
	private Integer filterId;
	
	/** 过滤器条件 */
	private String filterRule;
	
	/** 评分标准描述 */
	private String standardSummary;
	
	@Column(length = 255)
	@Comment("考核内容说明")
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

//	@OneToOne
//	@JoinColumn(name = "STANDARD_INST_ID")
//	@Fetch(FetchMode.JOIN)
//	@Comment("private ScoreStandardInstDO scoreStandardInst;")
//	public ScoreStandardInstDO getScoreStandardInst() {
//		return scoreStandardInst;
//	}
//
//	public void setScoreStandardInst(ScoreStandardInstDO scoreStandardInst) {
//		this.scoreStandardInst = scoreStandardInst;
//	}

	@ManyToOne
	@JoinColumn(name = "PROJECT_INST_ID")
	@Fetch(FetchMode.JOIN)
	@Comment("考核项目")
	public AssessmentProjectInstDO getAssessmentProjectInst() {
		return assessmentProjectInst;
	}

	public void setAssessmentProjectInst(AssessmentProjectInstDO assessmentProjectInst) {
		this.assessmentProjectInst = assessmentProjectInst;
	}

	@Comment("字典中考核内容的ID(关联日常工作情况时使用)")
	public Integer getAssessmentCommentTemplateId() {
		return assessmentCommentTemplateId;
	}

	public void setAssessmentCommentTemplateId(Integer assessmentCommentTemplateId) {
		this.assessmentCommentTemplateId = assessmentCommentTemplateId;
	}

	@Column(length = 20)
	@Comment("考核来源(A:安全信息，R:资料上传，O:人工)")
	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}
	
	@Comment("对应的过滤器id")
	public Integer getFilterId() {
		return filterId;
	}

	public void setFilterId(Integer filterId) {
		this.filterId = filterId;
	}

	@Column(name = "FILTER_RULE", length = 4000)
	@Comment("过滤器条件")
	public String getFilterRule() {
		return filterRule;
	}

	public void setFilterRule(String filterRule) {
		this.filterRule = filterRule;
	}
	
	@Column(name = "STANDARD_SUMMARY")
	@Comment("评分标准描述")
	public String getStandardSummary() {
		return standardSummary;
	}

	public void setStandardSummary(String standardSummary) {
		this.standardSummary = standardSummary;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (null == obj) {
			return false;
		}
		if (!(obj instanceof AssessmentCommentInstDO)) {
			return false;
		}
		final AssessmentCommentInstDO assessmentCommentInst = (AssessmentCommentInstDO) obj;
		if (this.getId().equals(assessmentCommentInst.getId())) {
			return true;
		}
		return false;
	}

	@Override
	public int hashCode() {
		return this.getId().hashCode();
	}

	@Override
	public int compareTo(AssessmentCommentInstDO o) {
		return this.getId().compareTo(o.getId());
	}

	@Override
	@Transient
	public String getDisplayName() {	
		return this.description;
	}
}
