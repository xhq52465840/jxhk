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
 * 考核项目
 */
@Entity
@Table(name = "T_ASSESSMENT_PROJECT")
@Comment("考核项目")
public class AssessmentProjectDO extends AbstractBaseDO implements IDisplayable{
	
	private static final long serialVersionUID = 7192163910346062438L;
	
	/** 项目名称 */
	private String name;
	
	/** 考核内容 */
	private Set<AssessmentCommentDO> assessmentComments;
	
	/** 创建人 */
	private UserDO creator;
	
	/** 更新人 */
	private UserDO updater;

	@Column(length = 255)
	@Comment("项目名称")
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@OneToMany(mappedBy = "assessmentProject")
	@Comment("考核内容")
	public Set<AssessmentCommentDO> getAssessmentComments() {
		return assessmentComments;
	}

	public void setAssessmentComments(
			Set<AssessmentCommentDO> assessmentComments) {
		this.assessmentComments = assessmentComments;
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
	@Transient
	public String getDisplayName() {	
		return this.name;
	}
}
