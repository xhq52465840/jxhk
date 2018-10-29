package com.usky.sms.qar;

import org.hibernate.cfg.Comment;
import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

@Entity
@Table(name = "qar_flight_list")
@Comment("QAR表")
public class QarFlightListDO implements Serializable {

	private static final long serialVersionUID = 3301535851012743225L;

	/** 主键 */
	private Integer id;
	
	/** 机号 */
	private String ac_tail;
	
	/** 航空公司编号 */
	private String airline_code;
	
	/** 到达机场 */
	private String arrival_airport;
	
	/** 起飞机场 */
	private String departure_airport;
	
	/** 飞行显示状态 */
	private String display_status;
	
	/** 时长 */
	private String duration;
	
	/** 文件号 */
	private Integer file_no;
	
	/** 航班号 */
	private String flight_no;
	
	/** 航班类型 */
	private String flight_type;
	
	/** 降落跑道 */
	private String landing_runway;
	
	/** 媒体号 */
	private Integer media_no;
	
	/** 修订等级 */
	private Integer modification_level;
	
	/** 备注*/
	private String notes;
	
	/** 参数品质 */
	private Float parameter_quality;
	
	/** 记录类型 */
	private String recorder_type;
	
	/** 起飞日期 */
	private Date start_date;
	
	/** 起飞跑道 */
	private String takeoff_runway;
	
	/** 类型编号 */
	private String tape_no;
	
	/** 版本号 */
	private Integer version_no;
	
	private String yxw_flight_no;
	
	private Integer flight_info_id;
	
	private String belong_station;
	
	private Date time_stamp;
	
	private Integer crewflightid;
	
	/** 事件有效率 */
	private Integer recorder_quality;

	@Column(length = 30)
	@Comment("机号")
	public String getAc_tail() {
		return ac_tail;
	}

	public void setAc_tail(String ac_tail) {
		this.ac_tail = ac_tail;
	}

	@Column(length = 30)
	@Comment("航空公司编号")
	public String getAirline_code() {
		return airline_code;
	}

	public void setAirline_code(String airline_code) {
		this.airline_code = airline_code;
	}

	@Column(length = 30)
	@Comment("到达机场")
	public String getArrival_airport() {
		return arrival_airport;
	}

	public void setArrival_airport(String arrival_airport) {
		this.arrival_airport = arrival_airport;
	}

	@Column(length = 30)
	@Comment("起飞机场")
	public String getDeparture_airport() {
		return departure_airport;
	}

	public void setDeparture_airport(String departure_airport) {
		this.departure_airport = departure_airport;
	}

	@Column(length = 30)
	@Comment("飞行显示状态")
	public String getDisplay_status() {
		return display_status;
	}

	public void setDisplay_status(String display_status) {
		this.display_status = display_status;
	}

	@Column(length = 30)
	@Comment("时长")
	public String getDuration() {
		return duration;
	}

	public void setDuration(String duration) {
		this.duration = duration;
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
	@Comment("航班号")
	public String getFlight_no() {
		return flight_no;
	}

	public void setFlight_no(String flight_no) {
		this.flight_no = flight_no;
	}

	@Column(length = 30)
	@Comment("航班类型")
	public String getFlight_type() {
		return flight_type;
	}

	public void setFlight_type(String flight_type) {
		this.flight_type = flight_type;
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
	@Comment("媒体号")
	public Integer getMedia_no() {
		return media_no;
	}

	public void setMedia_no(Integer media_no) {
		this.media_no = media_no;
	}

	@Column
	@Comment("修订等级")
	public Integer getModification_level() {
		return modification_level;
	}

	public void setModification_level(Integer modification_level) {
		this.modification_level = modification_level;
	}

	@Column(length = 30)
	@Comment("备注")
	public String getNotes() {
		return notes;
	}

	public void setNotes(String notes) {
		this.notes = notes;
	}

	@Column
	@Comment("参数品质")
	public Float getParameter_quality() {
		return parameter_quality;
	}

	public void setParameter_quality(Float parameter_quality) {
		this.parameter_quality = parameter_quality;
	}

	@Column(length = 30)
	@Comment("记录类型")
	public String getRecorder_type() {
		return recorder_type;
	}

	public void setRecorder_type(String recorder_type) {
		this.recorder_type = recorder_type;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("起飞日期")
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

	@Column(length = 30)
	@Comment("类型编号")
	public String getTape_no() {
		return tape_no;
	}

	public void setTape_no(String tape_no) {
		this.tape_no = tape_no;
	}

	@Column
	@Comment("版本号")
	public Integer getVersion_no() {
		return version_no;
	}

	public void setVersion_no(Integer version_no) {
		this.version_no = version_no;
	}

	@Column(length = 30)
	@Comment("")
	public String getYxw_flight_no() {
		return yxw_flight_no;
	}

	public void setYxw_flight_no(String yxw_flight_no) {
		this.yxw_flight_no = yxw_flight_no;
	}

	@Column
	@Comment("")
	public Integer getFlight_info_id() {
		return flight_info_id;
	}

	public void setFlight_info_id(Integer flight_info_id) {
		this.flight_info_id = flight_info_id;
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

	@Column
	@Comment("")
	public Integer getCrewflightid() {
		return crewflightid;
	}

	public void setCrewflightid(Integer crewflightid) {
		this.crewflightid = crewflightid;
	}

	@Column
	@Comment("事件有效率")
	public Integer getRecorder_quality() {
		return recorder_quality;
	}

	public void setRecorder_quality(Integer recorder_quality) {
		this.recorder_quality = recorder_quality;
	}

	@Id
	@Column
	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

}
