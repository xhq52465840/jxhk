package com.usky.sms.eiosa.report;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class Conformance {
    private String section;
    private String no;
    private String text;
    private Date lastdate;
    private String username;
    private String documentation;
    private String assessment;
    private String reason;
    private String rootcause;
    private String taken;
    private String no_sort;
    private List auditorActions = new ArrayList();

    public Conformance() {
    }

    public Conformance(String section, String no, String text, Date lastdate, String username, String documentation, String assessment, String reason, String rootcause, String taken, String no_sort) {
        this.section = section;
        this.no = no;
        this.text = text;
        this.lastdate = lastdate;
        this.username = username;
        this.documentation = documentation;
        this.assessment = assessment;
        this.reason = reason;
        this.rootcause = rootcause;
        this.taken = taken;
        this.no_sort = no_sort;
    }

    public void addAuditorAction(String auditorAction) {
      auditorActions.add(auditorAction);
    }

    public int getAuditorActionsSize() {
        return auditorActions.size();
    }

    public String getNo() {
      return no;
    }

    public void setNo(String no) {
      this.no = no;
    }

    public String getText() {
      return text;
    }

    public void setText(String text) {
      this.text = text;
    }

    public Date getLastdate() {
      return lastdate;
    }

    public void setLastdate(Date lastdate) {
      this.lastdate = lastdate;
    }

    public String getUsername() {
      return username;
    }

    public void setUsername(String username) {
      this.username = username;
    }

    public String getDocumentation() {
      return documentation;
    }

    public void setDocumentation(String documentation) {
      this.documentation = documentation;
    }

    public String getAssessment() {
      return assessment;
    }

    public void setAssessment(String assessment) {
      this.assessment = assessment;
    }

    public String getReason() {
      return reason;
    }

    public void setReason(String reason) {
      this.reason = reason;
    }

    public String getRootcause() {
      return rootcause;
    }

    public void setRootcause(String rootcause) {
      this.rootcause = rootcause;
    }

    public String getTaken() {
      return taken;
    }

    public void setTaken(String taken) {
      this.taken = taken;
    }

    public List<AuditorAction> getAuditorActions() {
      return auditorActions;
    }

    public void setAuditorActions(List<AuditorAction> auditorActions) {
      this.auditorActions = auditorActions;
    }

    public String getNo_sort() {
      return no_sort;
    }

    public void setNo_sort(String no_sort) {
      this.no_sort = no_sort;
    }

    public String getSection() {
      return section;
    }

    public void setSection(String section) {
      this.section = section;
    }
    
}
