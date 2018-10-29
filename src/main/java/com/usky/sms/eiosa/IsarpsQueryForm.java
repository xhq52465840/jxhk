package com.usky.sms.eiosa;

import java.io.Serializable;

public class IsarpsQueryForm implements Serializable {
	private static final long serialVersionUID = 1L;
	private String sectionId;
	private String isarpNo;
	private String status;
	private String conformity;
	private String assessmentType;
	private String showMine;
	
	public String getSectionId() {
		return sectionId;
	}
	public void setSection(String section) {
		this.sectionId = section;
	}
	public String getIsarpNo() {
		return isarpNo;
	}
	public void setIsarpNo(String isarpNo) {
		this.isarpNo = isarpNo;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public String getConformity() {
		return conformity;
	}
	public void setConformity(String conformity) {
		this.conformity = conformity;
	}
	
	public String getAssessmentType() {
		return assessmentType;
	}
	public void setAssessmentType(String assessmentType) {
		this.assessmentType = assessmentType;
	}
	public String getShowMine() {
		return showMine;
	}
	public void setShowMine(String showMine) {
		this.showMine = showMine;
	}
	
	
	
}