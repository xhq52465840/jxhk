package com.usky.sms.eiosa;

import org.hibernate.cfg.Comment;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "e_iosa_isarp_assessment")
@Comment("EIOSA表")
public class IsarpAssessmentsDO extends AbstractBaseDO{
	
	 /**
	 * 
	 */
	private static final long serialVersionUID = 672877665236752077L;
	private Long  creator;         
	 private Long last_modifier;
	 private IsarpDO isarpId;
	 private AssessmentsDO assessNameId;
	@Comment("")
	public Long getCreator() {
		return creator;
	}
	public void setCreator(Long creator) {
		this.creator = creator;
	}
	@Comment("")
	public Long getLast_modifier() {
		return last_modifier;
	}
	
	public void setLast_modifier(Long last_modifier) {
		this.last_modifier = last_modifier;
	}
	@ManyToOne
	@JoinColumn(name = "isarpId")
	@Comment("")
	public IsarpDO getIsarpId() {
		return isarpId;
	}
	public void setIsarpId(IsarpDO isarpId) {
		this.isarpId = isarpId;
	}
	@ManyToOne
	@JoinColumn(name = "assessNameId")
	@Comment("")
	public AssessmentsDO getAssessNameId() {
		return assessNameId;
	}
	public void setAssessNameId(AssessmentsDO assessNameId) {
		this.assessNameId = assessNameId;
	}
	 

}
