package com.usky.sms.safetyreview.inst;

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

/**
 * 考核项目实例
 */
@Entity
@Table(name = "T_ASSESSMENT_PROJECT_INST")
@Comment("考核项目实例")
public class AssessmentProjectInstDO extends AbstractBaseDO implements IDisplayable{

	private static final long serialVersionUID = 7192163910346062438L;

	/** 项目名称 */
	private String name;
	
	/** 所属评审单 */
	private MethanolInstDO methanolInst;

	/** 考核内容 */
	private Set<AssessmentCommentInstDO> assessmentCommentInsts;

	@Column(length = 255)
	@Comment("项目名称")
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@ManyToOne
	@JoinColumn(name = "METHANOL_INST_ID")
	@Comment("所属评审单")
	public MethanolInstDO getMethanolInst() {
		return methanolInst;
	}

	public void setMethanolInst(MethanolInstDO methanolInst) {
		this.methanolInst = methanolInst;
	}

	@OneToMany(mappedBy = "assessmentProjectInst")
	@Comment("考核内容")
	public Set<AssessmentCommentInstDO> getAssessmentCommentInsts() {
		return assessmentCommentInsts;
	}

	public void setAssessmentCommentInsts(Set<AssessmentCommentInstDO> assessmentCommentInsts) {
		this.assessmentCommentInsts = assessmentCommentInsts;
	}

	@Override
	@Transient
	public String getDisplayName() {	
		return this.name;
	}
}
