package com.usky.sms.eiosa.report;

import java.util.Date;

public class AuditorAction {
  public AuditorAction(){}
  
  public AuditorAction(Date created, String username2, String reports, String aaid, String status) {  
    super();  
    this.created = created;  
    this.username2 = username2;  
    this.reports = reports;  
    this.aaid = aaid;  
    this.status = status;  
  } 
  
  private Date created;
  private String username2;
  private String reports;
  private String aaid;
  private String status;
  public Date getCreated() {
    return created;
  }

  public void setCreated(Date created) {
    this.created = created;
  }

  public String getUsername2() {
    return username2;
  }

  public void setUsername2(String username2) {
    this.username2 = username2;
  }

  public String getReports() {
    return reports;
  }

  public void setReports(String reports) {
    this.reports = reports;
  }

  public String getAaid() {
    return aaid;
  }

  public void setAaid(String aaid) {
    this.aaid = aaid;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String status) {
    this.status = status;
  }
  
}
