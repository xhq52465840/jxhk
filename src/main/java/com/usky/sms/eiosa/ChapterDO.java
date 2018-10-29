package com.usky.sms.eiosa;

import org.hibernate.cfg.Comment;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
@Entity
@Table(name = "e_iosa_chapter")
@Comment("EIOSA表")
public class ChapterDO extends AbstractBaseDO{
	/**
	 * 
	 */
	private static final long serialVersionUID = 8897826170750765688L;
	private Integer creator;
	private Integer last_modifier;
	private String dec;
	private DocumentsDO documentid;
	private Integer isarpId;
	
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
	@JoinColumn(name = "documentid")
	@Comment("")
	public DocumentsDO getDocumentid() {
		return documentid;
	}
	public void setDocumentid(DocumentsDO documentid) {
		this.documentid = documentid;
	}
	@Comment("")
	public Integer getIsarpId() {
		return isarpId;
	}
	public void setIsarpId(Integer isarpId) {
		this.isarpId = isarpId;
	}
	@Comment("")
	public String getDec() {
		return dec;
	}
	public void setDec(String dec) {
		this.dec = dec;
	}
}
