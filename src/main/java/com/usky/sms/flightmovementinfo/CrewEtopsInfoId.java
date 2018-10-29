package com.usky.sms.flightmovementinfo;

import java.io.Serializable;

import javax.persistence.Column;

public class CrewEtopsInfoId implements Serializable {
	private static final long serialVersionUID = 3732264785145994254L;
	private String p_code;
	private String aera_code;
	private String ac_type;
	private String valid_flag;

	@Column(length = 10)
	public String getP_code() {
		return p_code;
	}

	public void setP_code(String p_code) {
		this.p_code = p_code;
	}

	@Column(length = 10)
	public String getAera_code() {
		return aera_code;
	}

	public void setAera_code(String aera_code) {
		this.aera_code = aera_code;
	}

	@Column(length = 5)
	public String getAc_type() {
		return ac_type;
	}

	public void setAc_type(String ac_type) {
		this.ac_type = ac_type;
	}

	@Column(length = 1)
	public String getValid_flag() {
		return valid_flag;
	}

	public void setValid_flag(String valid_flag) {
		this.valid_flag = valid_flag;
	}

	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result + ((ac_type == null) ? 0 : ac_type.hashCode());
		result = prime * result
				+ ((aera_code == null) ? 0 : aera_code.hashCode());
		result = prime * result + ((p_code == null) ? 0 : p_code.hashCode());
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
		CrewEtopsInfoId other = (CrewEtopsInfoId) obj;
		if (ac_type == null) {
			if (other.ac_type != null)
				return false;
		} else if (!ac_type.equals(other.ac_type))
			return false;
		if (aera_code == null) {
			if (other.aera_code != null)
				return false;
		} else if (!aera_code.equals(other.aera_code))
			return false;
		if (p_code == null) {
			if (other.p_code != null)
				return false;
		} else if (!p_code.equals(other.p_code))
			return false;
		if (valid_flag == null) {
			if (other.valid_flag != null)
				return false;
		} else if (!valid_flag.equals(other.valid_flag))
			return false;
		return true;
	}

}
