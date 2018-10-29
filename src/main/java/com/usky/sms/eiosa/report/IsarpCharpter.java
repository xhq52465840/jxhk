package com.usky.sms.eiosa.report;

import java.util.Date;

public class IsarpCharpter {
public IsarpCharpter(){}
  
  public IsarpCharpter(String section, String isarp, String text, String chapter, String flowStatus, String conformity) {  
    super();  
    this.section = section;  
    this.isarp = isarp;  
    this.text = text;  
    this.chapter = chapter;  
    this.flowStatus = flowStatus;  
    this.conformity = conformity;  
  } 
  
  private String section;
  private String isarp;
  private String text;
  private String chapter;
  private String flowStatus;
  private String conformity;
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
