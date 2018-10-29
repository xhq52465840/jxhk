package com.usky.sms.eiosa;

import java.io.Serializable;

public class ReportQueryForm implements Serializable {
	private static final long serialVersionUID = 1L;
	private String repNo;
	private String repDate;
	private String repDateto;
	private String repStatus;
	public String getRepNo() {
		return repNo;
	}
	public void setRepNo(String repNo) {
		this.repNo = repNo;
	}
	public String getRepDate() {
		return repDate;
	}
	public void setRepDate(String repDate) {
		this.repDate = repDate;
	}
	
	public String getRepDateto() {
		return repDateto;
	}
	public void setRepDateto(String repDateto) {
		this.repDateto = repDateto;
	}
	public String getRepStatus() {
		return repStatus;
	}
	public void setRepStatus(String repStatus) {
		this.repStatus = repStatus;
	}
	
	
	
	
	
}