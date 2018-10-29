package com.usky.sms.qar;

import org.hibernate.cfg.Comment;
import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import com.usky.sms.flightmovementinfo.AirportDO;

@Entity
@Table(name = "qar_event_list")
@Comment("QAR表")
public class QarEventListDO implements Serializable {

	private static final long serialVersionUID = 407698836823901677L;

	/** 主键 */
	private Integer id;
	
	/** 机号 */
	private String ac_tail;
	
	/** 航空公司编码 */
	private String airline_code;
	
//	/** 到达机场 */
//	private String arrival_airport;
	
	/** 平均差值 */
	private Float average_gap;
	
//	/** 起飞机场 */
//	private String departure_airport;
	
	/** 事件有效性 */
	private String event_validity;
	
	/** 超限时间 */
	private Integer exceedance_duration;
	
	/** 文件号 */
	private Integer file_no;
	
	/** 飞行显示状态 */
	private String flight_display_status;
	
	/** 航班号 */
	private String flight_no;
	
	/** 飞行阶段编号 */
	private Integer flight_phase_no;
	
	private Integer flight_table_id;
	
	/** 降落跑道 */
	private String landing_runway;
	
	/** 限制值 */
	private Float limit_value;
	
	/** 最大值 */
	private Float maximum_value;
	
	/** 注意 */
	private String notes;
	
	/** 程序编号 */
	private String procedure_no;
	
	/** 程序类型 */
	private String procedure_type;
	
	/** 事件等级 */
	private String severity_class_no;
	
	private String sta_pro_table_id;
	
	/** 起飞时间 */
	private Date start_date;
	
	/** 起飞跑道 */
	private String takeoff_runway;
	
	/** 峰值 */
	private Integer time_to_peak;
	
	private String belong_station;
	
	private Date time_stamp;
	
	private Date qar_update_time;
	
	private AirportDO airportDO;
	
	private AirportDO airportDO2;

	@Column(length = 30)
	@Comment("机号")
	public String getAc_tail() {
		return ac_tail;
	}

	public void setAc_tail(String ac_tail) {
		this.ac_tail = ac_tail;
	}

	@Column(length = 30)
	@Comment("航空公司编码")
	public String getAirline_code() {
		return airline_code;
	}

	public void setAirline_code(String airline_code) {
		this.airline_code = airline_code;
	}
//
//	@Column(length = 30)
//	@Comment("@Comment('@Comment('private String arrival_airport;')')")
//	public String getArrival_airport() {
//		return arrival_airport;
//	}
//
//	public void setArrival_airport(String arrival_airport) {
//		this.arrival_airport = arrival_airport;
//	}

	@Column
	@Comment("平均差值")
	public Float getAverage_gap() {
		return average_gap;
	}

	public void setAverage_gap(Float average_gap) {
		this.average_gap = average_gap;
	}

//	@Column(length = 30)
//	@Comment("private String departure_airport;")
//	public String getDeparture_airport() {
//		return departure_airport;
//	}
//
//	public void setDeparture_airport(String departure_airport) {
//		this.departure_airport = departure_airport;
//	}

	@Column(length = 30)
	@Comment("事件有效性")
	public String getEvent_validity() {
		return event_validity;
	}

	public void setEvent_validity(String event_validity) {
		this.event_validity = event_validity;
	}

	@Column
	@Comment("超限时间")
	public Integer getExceedance_duration() {
		return exceedance_duration;
	}

	public void setExceedance_duration(Integer exceedance_duration) {
		this.exceedance_duration = exceedance_duration;
	}

	@Column
	@Comment("文件号")
	public Integer getFile_no() {
		return file_no;
	}

	public void setFile_no(Integer file_no) {
		this.file_no = file_no;
	}

	@Column(length = 30)
	@Comment("飞行显示状态")
	public String getFlight_display_status() {
		return flight_display_status;
	}

	public void setFlight_display_status(String flight_display_status) {
		this.flight_display_status = flight_display_status;
	}

	@Column(length = 30)
	@Comment("航班号")
	public String getFlight_no() {
		return flight_no;
	}

	public void setFlight_no(String flight_no) {
		this.flight_no = flight_no;
	}

	@Column
	@Comment("飞行阶段编号")
	public Integer getFlight_phase_no() {
		return flight_phase_no;
	}

	public void setFlight_phase_no(Integer flight_phase_no) {
		this.flight_phase_no = flight_phase_no;
	}

	@Column
	@Comment("")
	public Integer getFlight_table_id() {
		return flight_table_id;
	}

	public void setFlight_table_id(Integer flight_table_id) {
		this.flight_table_id = flight_table_id;
	}

	@Column(length = 30)
	@Comment("降落跑道")
	public String getLanding_runway() {
		return landing_runway;
	}

	public void setLanding_runway(String landing_runway) {
		this.landing_runway = landing_runway;
	}

	@Column
	@Comment("最大值")
	public Float getMaximum_value() {
		return maximum_value;
	}

	public void setMaximum_value(Float maximum_value) {
		this.maximum_value = maximum_value;
	}

	@Column(length = 30)
	@Comment("注意")
	public String getNotes() {
		return notes;
	}

	public void setNotes(String notes) {
		this.notes = notes;
	}

	@Column(length = 30)
	@Comment("程序编号")
	public String getProcedure_no() {
		return procedure_no;
	}

	public void setProcedure_no(String procedure_no) {
		this.procedure_no = procedure_no;
	}

	@Column(length = 30)
	@Comment("程序类型")
	public String getProcedure_type() {
		return procedure_type;
	}

	public void setProcedure_type(String procedure_type) {
		this.procedure_type = procedure_type;
	}

	@Column(length = 30)
	@Comment("事件等级")
	public String getSeverity_class_no() {
		return severity_class_no;
	}

	public void setSeverity_class_no(String severity_class_no) {
		this.severity_class_no = severity_class_no;
	}

	@Column(length = 30)
	@Comment("")
	public String getSta_pro_table_id() {
		return sta_pro_table_id;
	}

	public void setSta_pro_table_id(String sta_pro_table_id) {
		this.sta_pro_table_id = sta_pro_table_id;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("起飞时间")
	public Date getStart_date() {
		return start_date;
	}

	public void setStart_date(Date start_date) {
		this.start_date = start_date;
	}

	@Column(length = 30)
	@Comment("起飞跑道")
	public String getTakeoff_runway() {
		return takeoff_runway;
	}

	public void setTakeoff_runway(String takeoff_runway) {
		this.takeoff_runway = takeoff_runway;
	}

	@Column
	@Comment("峰值")
	public Integer getTime_to_peak() {
		return time_to_peak;
	}

	public void setTime_to_peak(Integer time_to_peak) {
		this.time_to_peak = time_to_peak;
	}

	@Column(length = 30)
	@Comment("")
	public String getBelong_station() {
		return belong_station;
	}

	public void setBelong_station(String belong_station) {
		this.belong_station = belong_station;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getTime_stamp() {
		return time_stamp;
	}

	public void setTime_stamp(Date time_stamp) {
		this.time_stamp = time_stamp;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("")
	public Date getQar_update_time() {
		return qar_update_time;
	}

	public void setQar_update_time(Date qar_update_time) {
		this.qar_update_time = qar_update_time;
	}

	@Id
	@Column
	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	@Column
	@Comment("限制值")
	public Float getLimit_value() {
		return limit_value;
	}

	public void setLimit_value(Float limit_value) {
		this.limit_value = limit_value;
	}

	@ManyToOne
	@JoinColumn(name = "arrival_airport",referencedColumnName="iCaoCode") 
	@Comment("")
	public AirportDO getAirportDO() {
		return airportDO;
	}

	public void setAirportDO(AirportDO airportDO) {
		this.airportDO = airportDO;
	}

	@ManyToOne
	@JoinColumn(name = "departure_airport",referencedColumnName="iCaoCode") 
	@Comment("")
	public AirportDO getAirportDO2() {
		return airportDO2;
	}

	public void setAirportDO2(AirportDO airportDO2) {
		this.airportDO2 = airportDO2;
	}

}
