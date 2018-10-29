package com.usky.sms.losa.activity;

import java.io.Serializable;

public class ObserverQueryForm implements Serializable {
	private static final long serialVersionUID = 1L;
	private String observerName;
	private String respName;
	private String observerOrg;
	private String observerPost;
	private String observerAircraftType;
	private String observerFXWID;
	private String observerStatus;
	public String getObserverName() {
		return observerName;
	}
	public void setObserverName(String observerName) {
		this.observerName = observerName;
	}
	public String getRespName() {
		return respName;
	}
	public void setRespName(String respName) {
		this.respName = respName;
	}
	public String getObserverOrg() {
		return observerOrg;
	}
	public void setObserverOrg(String observerOrg) {
		this.observerOrg = observerOrg;
	}
	public String getObserverPost() {
		return observerPost;
	}
	public void setObserverPost(String observerPost) {
		this.observerPost = observerPost;
	}
	public String getObserverAircraftType() {
		return observerAircraftType;
	}
	public void setObserverAircraftType(String observerAircraftType) {
		this.observerAircraftType = observerAircraftType;
	}
	public String getObserverFXWID() {
		return observerFXWID;
	}
	public void setObserverFXWID(String observerFXWID) {
		this.observerFXWID = observerFXWID;
	}
	public String getObserverStatus() {
		return observerStatus;
	}
	public void setObserverStatus(String observerStatus) {
		this.observerStatus = observerStatus;
	}
	
	
	
	
}