package com.usky.sms.qar;

import org.hibernate.cfg.Comment;
public class QarQueryDO implements Comparable<QarEventDO>{

	private String airline;

	@Comment("")
	public String getAirline() {
		return airline;
	}

	public void setAirline(String airline) {
		this.airline = airline;
	}

	@Override
	public int compareTo(QarEventDO arg0) {
		return 0;
	}
}
