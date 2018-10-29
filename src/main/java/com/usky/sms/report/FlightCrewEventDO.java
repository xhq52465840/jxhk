package com.usky.sms.report;

import org.hibernate.cfg.Comment;
import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.IdClass;
import javax.persistence.Table;

/**
 * 运行网 部门飞行小时数
 */
@Entity
@Table(name = "QAR_FLIGHT_CREW_EVENT")
@IdClass(FlightCrewEventId.class)
@Comment("运行网 部门飞行小时数")
public class FlightCrewEventDO implements Serializable {

	private static final long serialVersionUID = -1611857226368392891L;

	private String flight_date;

	private String p_code;

	private String rank_name;

	private String dep_code;

	private String companycode;

	private Integer event_count;

	private Integer flight_count;

	private Double fly_time;

	@Id
	@Column(length = 6)
	@Comment("")
	public String getFlight_date() {
		return flight_date;
	}

	public void setFlight_date(String flight_date) {
		this.flight_date = flight_date;
	}

	@Id
	@Column(length = 20)
	@Comment("")
	public String getP_code() {
		return p_code;
	}

	public void setP_code(String p_code) {
		this.p_code = p_code;
	}

	@Id
	@Column(length = 20)
	@Comment("")
	public String getRank_name() {
		return rank_name;
	}

	public void setRank_name(String rank_name) {
		this.rank_name = rank_name;
	}

	@Id
	@Column(length = 20)
	@Comment("")
	public String getDep_code() {
		return dep_code;
	}

	public void setDep_code(String dep_code) {
		this.dep_code = dep_code;
	}

	@Column(length = 20)
	@Comment("")
	public String getCompanycode() {
		return companycode;
	}

	public void setCompanycode(String companycode) {
		this.companycode = companycode;
	}

	@Column
	@Comment("")
	public Integer getEvent_count() {
		return event_count;
	}

	public void setEvent_count(Integer event_count) {
		this.event_count = event_count;
	}

	@Column
	@Comment("")
	public Integer getFlight_count() {
		return flight_count;
	}

	public void setFlight_count(Integer flight_count) {
		this.flight_count = flight_count;
	}

	@Column
	@Comment("")
	public Double getFly_time() {
		return fly_time;
	}

	public void setFly_time(Double fly_time) {
		this.fly_time = fly_time;
	}

}
