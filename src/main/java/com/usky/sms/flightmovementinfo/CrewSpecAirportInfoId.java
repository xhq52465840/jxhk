package com.usky.sms.flightmovementinfo;

import java.io.Serializable;

import javax.persistence.Column;

public class CrewSpecAirportInfoId implements Serializable {

	private static final long serialVersionUID = 4106181338363578297L;
	private String p_code;
	private String airport_code;
	private String valid_flag;
	private String rank_no;

	@Column(length = 10)
	public String getP_code() {
		return p_code;
	}

	public void setP_code(String p_code) {
		this.p_code = p_code;
	}

	@Column(length = 3)
	public String getAirport_code() {
		return airport_code;
	}

	public void setAirport_code(String airport_code) {
		this.airport_code = airport_code;
	}

	@Column(length = 1)
	public String getValid_flag() {
		return valid_flag;
	}

	public void setValid_flag(String valid_flag) {
		this.valid_flag = valid_flag;
	}

	@Column(length = 20)
	public String getRank_no() {
		return rank_no;
	}

	public void setRank_no(String rank_no) {
		this.rank_no = rank_no;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result
				+ ((airport_code == null) ? 0 : airport_code.hashCode());
		result = prime * result + ((p_code == null) ? 0 : p_code.hashCode());
		result = prime * result + ((rank_no == null) ? 0 : rank_no.hashCode());
		result = prime * result
				+ ((valid_flag == null) ? 0 : valid_flag.hashCode());
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
		CrewSpecAirportInfoId other = (CrewSpecAirportInfoId) obj;
		if (airport_code == null) {
			if (other.airport_code != null)
				return false;
		} else if (!airport_code.equals(other.airport_code))
			return false;
		if (p_code == null) {
			if (other.p_code != null)
				return false;
		} else if (!p_code.equals(other.p_code))
			return false;
		if (rank_no == null) {
			if (other.rank_no != null)
				return false;
		} else if (!rank_no.equals(other.rank_no))
			return false;
		if (valid_flag == null) {
			if (other.valid_flag != null)
				return false;
		} else if (!valid_flag.equals(other.valid_flag))
			return false;
		return true;
	}

}
