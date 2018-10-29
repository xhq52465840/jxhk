package com.usky.sms.eiosa;

import java.io.Serializable;

public class DocumentsQueryForm implements Serializable {

	private static final long serialVersionUID = 3868207404419430110L;
	private String sectionId;	
	private String docname;
	
	public String getSectionId() {
		return sectionId;
	}
	public void setSectionId(String sectionId) {
		this.sectionId = sectionId;
	}
	public String getReviewed() {
		return docname;
	}
	public void setReviewed(String reviewed) {
		this.docname = reviewed;
	}
	
}