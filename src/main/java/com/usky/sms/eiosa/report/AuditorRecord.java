package com.usky.sms.eiosa.report;

public class AuditorRecord {
  public AuditorRecord(){}
  
  public AuditorRecord(String name, String title, String status, String audited) {  
    super();  
    this.name = name;  
    this.title = title;  
    this.status = status;  
    this.audited = audited;  
  } 
  
  private String name;
  private String title;
  private String status;
  private String audited;
  public String getName() {
    return name;
  }
  public void setName(String name) {
    this.name = name;
  }
  public String getTitle() {
    return title;
  }
  public void setTitle(String title) {
    this.title = title;
  }
  public String getStatus() {
    return status;
  }
  public void setStatus(String status) {
    this.status = status;
  }
  public String getAudited() {
    return audited;
  }
  public void setAudited(String audited) {
    this.audited = audited;
  }
}
