package com.usky.sms.flightmovementinfo;

import java.io.Serializable;

import javax.persistence.Column;

public class CabinCrewScheduleInfoId implements Serializable {
	private static final long serialVersionUID = 6115850262094505894L;
	private Integer flight_plan_id;
	private Integer staff_id;
	private Integer flightInfoID;

	@Column
	public Integer getFlight_plan_id() {
		return flight_plan_id;
	}

	public void setFlight_plan_id(Integer flight_plan_id) {
		this.flight_plan_id = flight_plan_id;
	}

	@Column
	public Integer getStaff_id() {
		return staff_id;
	}

	public void setStaff_id(Integer staff_id) {
		this.staff_id = staff_id;
	}

	@Column
	public Integer getFlightInfoID() {
		return flightInfoID;
	}

	public void setFlightInfoID(Integer flightInfoID) {
		this.flightInfoID = flightInfoID;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result
				+ ((flightInfoID == null) ? 0 : flightInfoID.hashCode());
		result = prime * result
				+ ((flight_plan_id == null) ? 0 : flight_plan_id.hashCode());
		result = prime * result
				+ ((staff_id == null) ? 0 : staff_id.hashCode());
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
		CabinCrewScheduleInfoId other = (CabinCrewScheduleInfoId) obj;
		if (flightInfoID == null) {
			if (other.flightInfoID != null)
				return false;
		} else if (!flightInfoID.equals(other.flightInfoID))
			return false;
		if (flight_plan_id == null) {
			if (other.flight_plan_id != null)
				return false;
		} else if (!flight_plan_id.equals(other.flight_plan_id))
			return false;
		if (staff_id == null) {
			if (other.staff_id != null)
				return false;
		} else if (!staff_id.equals(other.staff_id))
			return false;
		return true;
	}

}
