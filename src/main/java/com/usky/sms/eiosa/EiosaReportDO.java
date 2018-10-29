package com.usky.sms.eiosa;

import org.hibernate.cfg.Comment;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
@Entity
@Table(name = "e_iosa_report")
public class EiosaReportDO extends AbstractBaseDO{

	/**
	 * 
	 */
	private static final long serialVersionUID = -6643134222648892664L;
    private Long creator;
	private Long lastModifier;
	private String repNO;
	private String  repStatus ;
	private String front;
	private String notice;
	private String declaraction ;
	private Date  repDate ;
	private Double  libType;
	private Long   baseId;
	private String title;
	
	@Comment("")
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	@Comment("")
	public Long getCreator() {
		return creator;
	}
	public void setCreator(Long creator) {
		this.creator = creator;
	}
	@Column(name = "last_modifier")
	@Comment("")
	public Long getLastModifier() {
		return lastModifier;
	}
	public void setLastModifier(Long lastModifier) {
		this.lastModifier = lastModifier;
	}
	@Comment("")
	public String getRepNO() {
		return repNO;
	}
	public void setRepNO(String repNO) {
		this.repNO = repNO;
	}
	
	public String getRepStatus() {
		return repStatus;
	}
	public void setRepStatus(String repStatus) {
		this.repStatus = repStatus;
	}
	@Comment("")
	public String getFront() {
		return front;
	}
	public void setFront(String front) {
		this.front = front;
	}
	@Comment("")
	public String getNotice() {
		return notice;
	}
	public void setNotice(String notice) {
		this.notice = notice;
	}
	public String getDeclaraction() {
		return declaraction;
	}
	public void setDeclaraction(String declaraction) {
		this.declaraction = declaraction;
	}
	public Date getRepDate() {
		return repDate;
	}
	public void setRepDate(Date repDate) {
		this.repDate = repDate;
	}
	
	
	@Comment("")
	public Double getLibType() {
		return libType;
	}
	public void setLibType(Double libType) {
		this.libType = libType;
	}
	@Comment("")
	public Long getBaseId() {
		return baseId;
	}
	public void setBaseId(Long baseId) {
		this.baseId = baseId;
	}
	
}
