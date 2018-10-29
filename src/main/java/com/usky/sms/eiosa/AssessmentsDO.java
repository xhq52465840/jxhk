package com.usky.sms.eiosa;

import org.hibernate.cfg.Comment;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "e_iosa_assessment")
@Comment("EIOSA表")
public class AssessmentsDO extends AbstractBaseDO{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -4754587446223589413L;
	private Long  creator;         
	private Long last_modifier;
	private String text;
	private String type;
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
	@Comment("")
	public String getText() {
		return text;
	}
	public void setText(String text) {
		this.text = text;
	}
	@Comment("")
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	

}
