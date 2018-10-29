package com.usky.sms.eiosa;



public class IsarpReport {
public IsarpReport(){}
  
  public IsarpReport(String sectionName,String acronyms,String charpter,String section, String isarp, String text, String chapter, String flowStatus, String conformity) {  
  
   
    this.section = section;  
    this.isarp = isarp;  		
    this.text = text;  
    this.chapter = chapter;  
    this.flowStatus = flowStatus;  
    this.conformity = conformity; 
    this.sectionName=sectionName;
    this.acronyms = acronyms;
    this.charpter = charpter;
  } 
  
 
  private String section;
  private String isarp;
  private String text;
  private String chapter;
  private String flowStatus;
  private String conformity;
  private String sectionName;
  private String acronyms;
  private String charpter;
 



	public String getSectionName() {
	return sectionName;
}

public void setSectionName(String sectionName) {
	this.sectionName = sectionName;
}

	public String getAcronyms() {
		return acronyms;
	}

	public void setAcronyms(String acronyms) {
		this.acronyms = acronyms;
	}

	public String getCharpter() {
		return charpter;
	}

	public void setCharpter(String charpter) {
		this.charpter = charpter;
	}




public String getSection() {
    return section;
  }

  public void setSection(String section) {
    this.section = section;
  }

  public String getIsarp() {
    return isarp;
  }

  public void setIsarp(String isarp) {
    this.isarp = isarp;
  }

  public String getText() {
    return text;
  }

  public void setText(String text) {
    this.text = text;
  }

  public String getChapter() {
    return chapter;
  }

  public void setChapter(String chapter) {
    this.chapter = chapter;
  }

  public String getFlowStatus() {
    return flowStatus;
  }

  public void setFlowStatus(String flowStatus) {
    this.flowStatus = flowStatus;
  }

  public String getConformity() {
    return conformity;
  }

  public void setConformity(String conformity) {
    this.conformity = conformity;
  }
  
}
