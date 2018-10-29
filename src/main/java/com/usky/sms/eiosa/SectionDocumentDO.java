package com.usky.sms.eiosa;

import org.hibernate.cfg.Comment;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "e_iosa_section_document")
@Comment("EIOSA表")
public class SectionDocumentDO extends AbstractBaseDO{
	
	 /**
	 * 
	 */
	private static final long serialVersionUID = 5141990410498126949L;
	private Integer  creator;         
	 private Integer last_modifier; 
	 private IosaSectionDO sectionId;
	 private Integer   documentId;
	 private Integer   validity;
	 
	@Comment("")
	public Integer getValidity() {
		return validity;
	}
	public void setValidity(Integer validity) {
		this.validity = validity;
	}
	
	@Comment("")
	public Integer getCreator() {
		return creator;
	}
	public void setCreator(Integer creator) {
		this.creator = creator;
	}
	@Comment("")
	public Integer getLast_modifier() {
		return last_modifier;
	}
	public void setLast_modifier(Integer last_modifier) {
		this.last_modifier = last_modifier;
	}
	@ManyToOne
	@JoinColumn(name = "sectionId")
	@Comment("")
	public IosaSectionDO getSectionId() {
		return sectionId;
	}
	public void setSectionId(IosaSectionDO sectionId) {
		this.sectionId = sectionId;
	}
	@Comment("")
	public Integer getDocumentId() {
		return documentId;
	}
	public void setDocumentId(Integer documentId) {
		this.documentId = documentId;
	}
	
	 

}
