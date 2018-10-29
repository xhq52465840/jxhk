package com.usky.sms.eiosa;

import org.hibernate.cfg.Comment;

import java.util.Date;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinTable;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.JoinColumn;

import com.usky.sms.core.AbstractBaseDO;
@Entity
@Table(name = "e_iosa_section")
@Comment("EIOSA表")
public class IosaSectionDO extends AbstractBaseDO{

	/**
	 * 
	 */
	private static final long serialVersionUID = -8188918010402962910L;
	
	 private Integer creator;          
	 private Integer last_modifier;     
	 private Integer   reportId;          
	 private String  Appliction;        
	 private String   sectionName;      
	 private String  guidance;   
	 private String  discipline;
	 private String applicability;
	 private String sectionFullName;
	 private String sectionNo;
	 private Date  startDate;
	 private Date  endDate;
	 private transient Set<SectionTaskDO> sectionTask;
	 private Integer chiefAuditor;
	 
	@OneToMany(mappedBy = "targetId")
	@Comment("")
	public Set<SectionTaskDO> getSectionTask() {
		return sectionTask;
	}
	public void setSectionTask(Set<SectionTaskDO> sectionTask) {
		this.sectionTask = sectionTask;
	}
	@Comment("")
	public Integer getCreator() {
		return creator;
	}
	public void setCreator(Integer creator) {
		this.creator = creator;
	}
	@Column(name = "last_modifier")
	@Comment("")
	public Integer getLast_modifier() {
		return last_modifier;
	}
	public void setLast_modifier(Integer last_modifier) {
		this.last_modifier = last_modifier;
	}
	@Comment("")
	public Integer getReportId() {
		return reportId;
	}
	public void setReportId(Integer reportId) {
		this.reportId = reportId;
	}
	
	
	
	@Comment("")
	public String getAppliction() {
		return Appliction;
	}
	public void setAppliction(String appliction) {
		Appliction = appliction;
	}
	@Comment("")
	public String getSectionName() {
		return sectionName;
	}
	public void setSectionName(String sectionName) {
		this.sectionName = sectionName;
	}
	@Comment("")
	public String getGuidance() {
		return guidance;
	}
	public void setGuidance(String guidance) {
		this.guidance = guidance;
	}
	@Comment("")
	public String getDiscipline() {
		return discipline;
	}
	public void setDiscipline(String discipline) {
		this.discipline = discipline;
	}
	@Comment("")
	public String getApplicability() {
		return applicability;
	}
	public void setApplicability(String applicability) {
		this.applicability = applicability;
	}
	@Comment("")
	public String getSectionFullName() {
		return sectionFullName;
	}
	public void setSectionFullName(String sectionFullName) {
		this.sectionFullName = sectionFullName;
	}
	@Comment("")
	public String getSectionNo() {
		return sectionNo;
	}
	public void setSectionNo(String sectionNo) {
		this.sectionNo = sectionNo;
	}
	@Comment("")
	public Date getStartDate() {
		return startDate;
	}
	public void setStartDate(Date startDate) {
		this.startDate = startDate;
	}
	@Comment("")
	public Date getEndDate() {
		return endDate;
	}
	public void setEndDate(Date endDate) {
		this.endDate = endDate;
	}
	@Comment("")
	public Integer getChiefAuditor() {
		return chiefAuditor;
	}
	public void setChiefAuditor(Integer chiefAuditor) {
		this.chiefAuditor = chiefAuditor;
	}

	 
	 

}
