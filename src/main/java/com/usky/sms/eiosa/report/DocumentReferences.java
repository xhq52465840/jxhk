package com.usky.sms.eiosa.report;

import java.util.Date;

public class DocumentReferences {
  public DocumentReferences(){}
  
  public DocumentReferences(String reviewed, String acronyms, String version, String type, Date date, String ORG, String FLT, String DSP, String MNT, String CAB, String GRH, String CGO, String SEC) {  
    super();  
    this.reviewed = reviewed;  
    this.acronyms = acronyms;  
    this.version = version;  
    this.type = type;  
    this.date = date;  
    this.ORG = ORG;  
    this.FLT = FLT;  
    this.DSP = DSP;  
    this.MNT = MNT;  
    this.CAB = CAB;  
    this.GRH = GRH;  
    this.CGO = CGO;  
    this.SEC = SEC;  
  } 
  
  private String reviewed;
  private String acronyms;
  private String version;
  private String type;
  private Date date;
  private String ORG;
  private String FLT;
  private String DSP;
  private String MNT;
  private String CAB;
  private String GRH;
  private String CGO;
  private String SEC;
  
  public String getReviewed() {
    return reviewed;
  }

  public void setReviewed(String reviewed) {
    this.reviewed = reviewed;
  }

  public String getAcronyms() {
    return acronyms;
  }

  public void setAcronyms(String acronyms) {
    this.acronyms = acronyms;
  }

  public String getVersion() {
    return version;
  }

  public void setVersion(String version) {
    this.version = version;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public Date getDate() {
    return date;
  }

  public void setDate(Date date) {
    this.date = date;
  }

  public String getORG() {
    return ORG;
  }

  public void setORG(String oRG) {
    ORG = oRG;
  }

  public String getFLT() {
    return FLT;
  }

  public void setFLT(String fLT) {
    FLT = fLT;
  }

  public String getDSP() {
    return DSP;
  }

  public void setDSP(String dSP) {
    DSP = dSP;
  }

  public String getMNT() {
    return MNT;
  }

  public void setMNT(String mNT) {
    MNT = mNT;
  }

  public String getCAB() {
    return CAB;
  }

  public void setCAB(String cAB) {
    CAB = cAB;
  }

  public String getGRH() {
    return GRH;
  }

  public void setGRH(String gRH) {
    GRH = gRH;
  }

  public String getCGO() {
    return CGO;
  }

  public void setCGO(String cGO) {
    CGO = cGO;
  }

  public String getSEC() {
    return SEC;
  }

  public void setSEC(String sEC) {
    SEC = sEC;
  }

}
