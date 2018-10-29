package com.usky.sms.eiosa;

import org.hibernate.cfg.Comment;
import java.util.Date;

import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.Transient;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "E_IOSA_ISARP_ACTION")
@Comment("EIOSA表")
public class IsarpActionDO extends AbstractBaseDO {

	/**
	 * 
	 */
	private static final long serialVersionUID = -3456821388856853625L;
	private Integer creator;
	private Integer last_modifier;
	private String auditors;
	private String reports;
	private transient IosaCodeDO status;
	private String typename;
	private String title;
	private Integer isarpid;
	private Integer libtype;
	private Integer baseid;
	private Date auditDate;
	private String auditDate_string;
	private String aaid;
	private Integer newadd;
	
	@Column
	@Comment("")
	public Integer getCreator() {
		return creator;
	}
	
	public void setCreator(Integer creator) {
		this.creator = creator;
	}
	@Column
	@Comment("")
	public Integer getLast_modifier() {
		return last_modifier;
	}

	public void setLast_modifier(Integer last_modifier) {
		this.last_modifier = last_modifier;
	}

	@Column
	@Comment("")
	public String getAuditors() {
		return auditors;
	}

	public void setAuditors(String auditors) {
		this.auditors = auditors;
	}
	@Column
	@Comment("")
	public String getReports() {
		return reports;
	}

	public void setReports(String reports) {
		this.reports = reports;
	}
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "status")
	@Comment("")
	public IosaCodeDO getStatus() {
		return status;
	}

	public void setStatus(IosaCodeDO status) {
		this.status = status;
	}

	@Column
	@Comment("")
	public String getTypename() {
		return typename;
	}

	public void setTypename(String typename) {
		this.typename = typename;
	}
	@Column
	@Comment("")
	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}
	@Column
	@Comment("")
	public Integer getIsarpid() {
		return isarpid;
	}

	public void setIsarpid(Integer isarpid) {
		this.isarpid = isarpid;
	}

	@Column
	@Comment("")
	public Integer getLibtype() {
		return libtype;
	}

	public void setLibtype(Integer libtype) {
		this.libtype = libtype;
	}
	@Column
	@Comment("")
	public Integer getBaseid() {
		return baseid;
	}

	public void setBaseid(Integer baseid) {
		this.baseid = baseid;
	}
	
	@Basic
	@Column(columnDefinition = "DATE")
	@Temporal(TemporalType.TIMESTAMP)
	@Comment("")
	public Date getAuditDate() {
		return auditDate;
	}

	public void setAuditDate(Date auditDate) {
		this.auditDate = auditDate;
	}

	@Transient
	@Comment("")
	public String getAuditDate_string() {
		return auditDate_string;
	}

	public void setAuditDate_string(String auditDate_string) {
		this.auditDate_string = auditDate_string;
	}

	@Comment("")
	public String getAaid() {
		return aaid;
	}

	public void setAaid(String aaid) {
		this.aaid = aaid;
	}

	@Column
	@Comment("")
	public Integer getNewadd() {
		return newadd;
	}

	public void setNewadd(Integer newadd) {
		this.newadd = newadd;
	}
	
	

}
