package com.usky.sms.report;

import java.io.Serializable;

import javax.persistence.Column;

public class FlightCrewEventId implements Serializable {

	private static final long serialVersionUID = 8998876467937229619L;

	private String flight_date;

	private String p_code;

	private String rank_name;

	private String dep_code;

	@Column(length = 6)
	public String getFlight_date() {
		return flight_date;
	}

	public void setFlight_date(String flight_date) {
		this.flight_date = flight_date;
	}

	@Column(length = 20)
	public String getP_code() {
		return p_code;
	}

	public void setP_code(String p_code) {
		this.p_code = p_code;
	}

	@Column(length = 20)
	public String getRank_name() {
		return rank_name;
	}

	public void setRank_name(String rank_name) {
		this.rank_name = rank_name;
	}

	@Column(length = 20)
	public String getDep_code() {
		return dep_code;
	}

	public void setDep_code(String dep_code) {
		this.dep_code = dep_code;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result
				+ ((dep_code == null) ? 0 : dep_code.hashCode());
		result = prime * result
				+ ((flight_date == null) ? 0 : flight_date.hashCode());
		result = prime * result + ((p_code == null) ? 0 : p_code.hashCode());
		result = prime * result
				+ ((rank_name == null) ? 0 : rank_name.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		FlightCrewEventId other = (FlightCrewEventId) obj;
		if (dep_code == null) {
			if (other.dep_code != null)
				return false;
		} else if (!dep_code.equals(other.dep_code))
			return false;
		if (flight_date == null) {
			if (other.flight_date != null)
				return false;
		} else if (!flight_date.equals(other.flight_date))
			return false;
		if (p_code == null) {
			if (other.p_code != null)
				return false;
		} else if (!p_code.equals(other.p_code))
			return false;
		if (rank_name == null) {
			if (other.rank_name != null)
				return false;
		} else if (!rank_name.equals(other.rank_name))
			return false;
		return true;
	}

	
	
}
