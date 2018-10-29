package com.usky.sms.safetyreview.inst;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;

/**
 * 完成情况及分数实例
 */
@Entity
@Table(name = "T_COMPLETION_INST")
@Comment("完成情况及分数实例")
public class CompletionInstDO extends AbstractBaseDO implements Comparable<CompletionInstDO>,IDisplayable{
	
	private static final long serialVersionUID = 2928187402637739201L;
	
	/** 完成情况 */
	private String complete;
	
	/** 得分(默认0.0) */
	private Double score = 0.0;
	
	/** 备注 */
	private String remark;
	
	/** 考核内容实例 */
	private AssessmentCommentInstDO assessmentCommentInst;
	
	/** 状态(默认:UN_COMPLETE（未完成）) */
	private String status = EnumCompletionInstStatus.UN_COMPLETE.toString();

	@Column(length = 2000)
	@Comment("完成情况")
	public String getComplete() {
		return complete;
	}

	public void setComplete(String complete) {
		this.complete = complete;
	}

	@Column
	public Double getScore() {
		return score;
	}

	public void setScore(Double score) {
		this.score = score;
	}

	@OneToOne
	@JoinColumn(name = "COMMENT_INST_ID")
	@Comment("考核内容实例")
	public AssessmentCommentInstDO getAssessmentCommentInst() {
		return assessmentCommentInst;
	}

	public void setAssessmentCommentInst(AssessmentCommentInstDO assessmentCommentInst) {
		this.assessmentCommentInst = assessmentCommentInst;
	}

	@Column(length = 2000)
	@Comment("备注")
	public String getRemark() {
		return remark;
	}

	public void setRemark(String remark) {
		this.remark = remark;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	@Override
	@Transient
	public int compareTo(CompletionInstDO o) {
		return this.getId().compareTo(o.getId());
	}

	@Override
	@Transient
	public String getDisplayName() {	
		return this.complete+"@#"+this.score;
	}
}
