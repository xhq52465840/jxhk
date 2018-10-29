package com.usky.sms.eiosa;

import org.hibernate.cfg.Comment;
import java.util.Date;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import org.hibernate.annotations.Where;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.losa.AttachmentDO;
import com.usky.sms.user.UserDO;
@Entity
@Table(name = "e_iosa_document_libary")
@Comment("EIOSA表")
public class DocumentsDO extends AbstractBaseDO{

	/**
	 * 
	 */
	private static final long serialVersionUID = -2740069128463831089L;
	private UserDO creator;
	private UserDO last_modifier;
	private String reviewed;
	private String acronyms;
	private String versionno;
	private String type;
	private Date docdate;
	private Integer used;
	//private CharpterDO charpterDO;
	private Integer reportId;
    private List<AttachmentDO> attachmentList;
	

	/**@ManyToOne
	@JoinColumn(name = "isarpId")
	public IsarpDO getIsarpId() {
		return isarpId;
	}
	public void setIsarpId(IsarpDO isarpId) {
		this.isarpId = isarpId;
	}*/
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "CREATOR")
	@Comment("")
	public UserDO getCreator() {
		return creator;
	}
	public void setCreator(UserDO creator) {
		this.creator = creator;
	}
	@Comment("")
	public Integer getUsed() {
		return used;
	}
	public void setUsed(Integer used) {
		this.used = used;
	}
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "last_modifier")
	@Comment("")
	public UserDO getLast_modifier() {
		return last_modifier;
	}
	public void setLast_modifier(UserDO last_modifier) {
		this.last_modifier = last_modifier;
	}
	@Column
	@Comment("")
	public String getReviewed() {
		return reviewed;
	}
	public void setReviewed(String reviewed) {
		this.reviewed = reviewed;
	}
	@Column
	@Comment("")
	public String getAcronyms() {
		return acronyms;
	}
	public void setAcronyms(String acronyms) {
		this.acronyms = acronyms;
	}
	@Column
	@Comment("")
	public String getVersionno() {
		return versionno;
	}
	public void setVersionno(String versionno) {
		this.versionno = versionno;
	}
	@Column
	@Comment("")
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	@Column
	@Comment("")
	public Date getDocdate() {
		return docdate;
	}
	public void setDocdate(Date docdate) {
		this.docdate = docdate;
	}
	@Comment("private CharpterDO charpterDO;")
	public Integer getReportId() {
		return reportId;
	}
	public void setReportId(Integer reportId) {
		this.reportId = reportId;
	}

	
	@OneToMany(targetEntity = AttachmentDO.class,  
    		mappedBy = "activityId", fetch = FetchType.LAZY)
    @Where(clause="DELETED = 0")
	@Comment("")
	public List<AttachmentDO> getAttachmentList() {
		return attachmentList;
	}
	public void setAttachmentList(List<AttachmentDO> attachmentList) {
		this.attachmentList = attachmentList;
	}	
	

}
