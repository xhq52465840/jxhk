package com.usky.sms.eiosa;

import org.hibernate.cfg.Comment;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.user.UserDO;
@Entity
@Table(name = "e_iosa_isarp")
@Comment("EIOSA表")
public class IsarpDO extends AbstractBaseDO{

	/**
	 * 
	 */
	private static final long serialVersionUID = -3199251028807765512L;
	
	 private Integer  creator;         
	 private transient UserDO last_modifier;     
	 private transient IosaSectionDO  sectionId;
	 private transient Set<OperateLogDO>  operateLogDO;
	 private transient Set<SectionTaskDO> sectionTask;
	 private transient Set<ChapterDO> charpter;
	 private transient AssessmentsDO assessment;      
	 private  String  reason;           
	 private  String rootCause;     
	 private  String  taken;      
	 private  String comments;   
	 private  IosaCodeDO  status;
	 private  String  no;
	 private Integer levels;
	 private   Integer    parentId;
	 private  String text;
	 private  String guidance;
	 private Integer libType;
	 private Integer baseId;
	 private String no_sort;
	
	@Comment("")
	public Integer getCreator() {
		return creator;
	}
	public void setCreator(Integer creator) {
		this.creator = creator;
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
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "sectionId")
	@Comment("")
	public IosaSectionDO getSectionId() {
		return sectionId;
	}
	public void setSectionId(IosaSectionDO sectionId) {
		this.sectionId = sectionId;
	}
	
	@Comment("")
	public String getReason() {
		return reason;
	}
	public void setReason(String reason) {
		this.reason = reason;
	}
	@Comment("")
	public String getRootCause() {
		return rootCause;
	}
	public void setRootCause(String rootCause) {
		this.rootCause = rootCause;
	}
	@Comment("")
	public String getTaken() {
		return taken;
	}
	public void setTaken(String taken) {
		this.taken = taken;
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
	@Comment("")
	public String getComments() {
		return comments;
	}
	public void setComments(String comments) {
		this.comments = comments;
	}
	@Comment("")
	public String getText() {
		return text;
	}
	public void setText(String text) {
		this.text = text;
	}
	 @Column(updatable = false)
	@Comment("")
	public String getGuidance() {
		return guidance;
	}
	public void setGuidance(String guidance) {
		this.guidance = guidance;
	}
	
	@Comment("")
	public Integer getLibType() {
		return libType;
	}
	public void setLibType(Integer libType) {
		this.libType = libType;
	}
	
	
	@Comment("")
	public Integer getBaseId() {
		return baseId;
	}
	public void setBaseId(Integer baseId) {
		this.baseId = baseId;
	}
	@Comment("")
	public String getNo() {
		return no;
	}
	public void setNo(String no) {
		this.no = no;
	}
	@Comment("")
	public Integer getLevels() {
		return levels;
	}
	public void setLevels(Integer levels) {
		this.levels = levels;
	}
	@Comment("")
	public Integer getParentId() {
		return parentId;
	}
	public void setParentId(Integer parentId) {
		this.parentId = parentId;
	}
	@OneToMany(mappedBy = "targetId",fetch = FetchType.LAZY)
	@Comment("")
	public Set<OperateLogDO> getOperateLogDO() {
		return operateLogDO;
	}
	public void setOperateLogDO(Set<OperateLogDO> operateLogDO) {
		this.operateLogDO = operateLogDO;
	}
	@OneToMany(mappedBy = "targetId",fetch = FetchType.LAZY)
	@Comment("")
	public Set<SectionTaskDO> getSectionTask() {
		return sectionTask;
	}
	
	public void setSectionTask(Set<SectionTaskDO> sectionTask) {
		this.sectionTask = sectionTask;
	}
	@OneToMany(mappedBy = "isarpId",fetch = FetchType.LAZY)
	@Comment("")
	public Set<ChapterDO> getCharpter() {
		return charpter;
	}
	public void setCharpter(Set<ChapterDO> charpter) {
		this.charpter = charpter;
	}
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "assessment")
	@Comment("")
	public AssessmentsDO getAssessment() {
		return assessment;
	}
	public void setAssessment(AssessmentsDO assessment) {
		this.assessment = assessment;
	}
	@Comment("")
	public String getNo_sort() {
		return no_sort;
	}
	public void setNo_sort(String no_sort) {
		this.no_sort = no_sort;
	}
	
	
	
	

}
