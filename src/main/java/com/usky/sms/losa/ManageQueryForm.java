package com.usky.sms.losa;

import java.io.Serializable;

public class ManageQueryForm implements Serializable {
	private static final long serialVersionUID = 1L;
	private String s_schemeName;
	private String s_impleUnitId;
	private String s_schemeType;
	private String p_flightId;
	private String p_observerId;
	private String p_depAirportNo;
	private String p_arrAirportNo;
	private String p_observeDate;
	private String p_observeDateTo;
	private String isAll;
	private String f_org_code;
	public String getS_schemeName() {
		return s_schemeName;
	}
	public void setS_schemeName(String s_schemeName) {
		this.s_schemeName = s_schemeName;
	}
	public String getS_impleUnitId() {
		return s_impleUnitId;
	}
	public void setS_impleUnitId(String s_impleUnitId) {
		this.s_impleUnitId = s_impleUnitId;
	}
	public String getS_schemeType() {
		return s_schemeType;
	}
	public void setS_schemeType(String s_schemeType) {
		this.s_schemeType = s_schemeType;
	}
	public String getP_flightId() {
		return p_flightId;
	}
	public void setP_flightId(String p_flightId) {
		this.p_flightId = p_flightId;
	}
	public String getP_observerId() {
		return p_observerId;
	}
	public void setP_observerId(String p_observerId) {
		this.p_observerId = p_observerId;
	}
	public String getP_depAirportNo() {
		return p_depAirportNo;
	}
	public void setP_depAirportNo(String p_depAirportNo) {
		this.p_depAirportNo = p_depAirportNo;
	}
	public String getP_arrAirportNo() {
		return p_arrAirportNo;
	}
	public void setP_arrAirportNo(String p_arrAirportNo) {
		this.p_arrAirportNo = p_arrAirportNo;
	}
	public String getP_observeDate() {
		return p_observeDate;
	}
	public void setP_observeDate(String p_observeDate) {
		this.p_observeDate = p_observeDate;
	}
	public String getP_observeDateTo() {
		return p_observeDateTo;
	}
	public void setP_observeDateTo(String p_observeDateTo) {
		this.p_observeDateTo = p_observeDateTo;
	}
  public String getIsAll() {
    return isAll;
  }
  public void setIsAll(String isAll) {
    this.isAll = isAll;
  }
  public String getF_org_code() {
    return f_org_code;
  }
  public void setF_org_code(String f_org_code) {
    this.f_org_code = f_org_code;
  }

}