package com.usky.sms.flightmovementinfo.Maintenance;

import org.hibernate.cfg.Comment;
import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

/*
 * 
 * 飞机
 */
@Entity
@Table(name = "ECMR_U_AIRCRAFT")
@Comment("飞机")
public class AircraftDO implements Serializable {

	private static final long serialVersionUID = 6283843541155372556L;
	
	/** ID */
	private Integer aircraft_id;
	
	/** 飞机编号 */
	private String tail_no;
	
	/** Manufacture */
	private String msn;
	
	/** 机型，对应表U_AIRCRAFT_TYPE的AIRCRAFT_TYPE字段。 */
	private String aircraft_type;
	
	/** 执管单位 */
	private Integer maint_dept_id;
	
	/** 飞机发动机型号，即发动机类型（U_ENGINE_TYPE的MODEL） */
	private String engine_type_model;
	
	/** APU型号 */
	private String apu_type;
	
	/** 出厂日期 */
	private Date exit_factory_date;
	
	/** 交付日期 */
	private Date delivery_date;
	
	/** 发动机装机数 */
	private Integer engine_count;
	
	/** 是否执行II类运行，"YES"/"NO"。 */
	private String run_type;
	
	/** 转移或卖出标记，"TRANSFER"表示转移，"SOLD"卖出。"NORMAL"是未转移也未卖出 */
	private String trans_flag;
	
	/**  手册代码 */
	private String manual_code;
	
	/** 飞机描述 */
	private String aircraft_description;
	
	/** 标识记录是否有效，VALID--有效，INVALID--无效。 */
	private String validity;
	
	/** 机队序号 */
	private String fsn;
	
	/** 营运人 */
	private Integer airway_id;
	
	/** 飞机状态（在用INUSE、在册INBOOK、准备引进PREPARE、退租SURRENDER) */
	private String status;
	
	/** ID */
	private Double init_tsn;
	
	/** ID */
	private Double init_tso;
	
	/** ID */
	private Double init_tsr;
	
	/** ID */
	private Double init_csn;
	
	/** ID */
	private Double init_cso;
	
	/** ID */
	private Double init_csr;
	
	/** #N/A */
	private String aircraft_batch;
	
	/** #N/A */
	private String wire_marking;
	
	/** 飞机制造商(英文名) */
	private Integer aircraft_manufacturer;
	
	/** #N/A */
	private Integer engine_manufacturer;
	
	/** #N/A */
	private Integer apu_manufacturer;
	
	/** 飞机制造商代码(数字) */
	private String aircraft_manufacturer_code;
	
	/** 线号（适用波音，其他用NA） */
	private String wire_no;
	
	/** 用户有效码 */
	private String user_variable_no;
	
	/** 更新日期 */
	private Date update_date;

	@Id
	@Column
	@Comment("ID")
	public Integer getAircraft_id() {
		return aircraft_id;
	}

	public void setAircraft_id(Integer aircraft_id) {
		this.aircraft_id = aircraft_id;
	}

	@Column(length = 10)
	@Comment("飞机编号")
	public String getTail_no() {
		return tail_no;
	}

	public void setTail_no(String tail_no) {
		this.tail_no = tail_no;
	}

	@Column(length = 50)
	@Comment("Manufacture")
	public String getMsn() {
		return msn;
	}

	public void setMsn(String msn) {
		this.msn = msn;
	}

	@Column(length = 30)
	@Comment("机型，对应表U_AIRCRAFT_TYPE的AIRCRAFT_TYPE字段。")
	public String getAircraft_type() {
		return aircraft_type;
	}

	public void setAircraft_type(String aircraft_type) {
		this.aircraft_type = aircraft_type;
	}

	@Column
	@Comment("执管单位")
	public Integer getMaint_dept_id() {
		return maint_dept_id;
	}

	public void setMaint_dept_id(Integer maint_dept_id) {
		this.maint_dept_id = maint_dept_id;
	}

	@Column(length = 30)
	@Comment("飞机发动机型号，即发动机类型（U_ENGINE_TYPE的MODEL）")
	public String getEngine_type_model() {
		return engine_type_model;
	}

	public void setEngine_type_model(String engine_type_model) {
		this.engine_type_model = engine_type_model;
	}

	@Column(length = 50)
	@Comment("APU型号")
	public String getApu_type() {
		return apu_type;
	}

	public void setApu_type(String apu_type) {
		this.apu_type = apu_type;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("出厂日期")
	public Date getExit_factory_date() {
		return exit_factory_date;
	}

	public void setExit_factory_date(Date exit_factory_date) {
		this.exit_factory_date = exit_factory_date;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("交付日期")
	public Date getDelivery_date() {
		return delivery_date;
	}

	public void setDelivery_date(Date delivery_date) {
		this.delivery_date = delivery_date;
	}

	@Column
	@Comment("发动机装机数")
	public Integer getEngine_count() {
		return engine_count;
	}

	public void setEngine_count(Integer engine_count) {
		this.engine_count = engine_count;
	}

	@Column(length = 10)
	@Comment("是否执行II类运行，'YES'/'NO'。")
	public String getRun_type() {
		return run_type;
	}

	public void setRun_type(String run_type) {
		this.run_type = run_type;
	}

	@Column(length = 10)
	@Comment("转移或卖出标记，'TRANSFER'表示转移，'SOLD'卖出。'NORMAL'是未转移也未卖出")
	public String getTrans_flag() {
		return trans_flag;
	}

	public void setTrans_flag(String trans_flag) {
		this.trans_flag = trans_flag;
	}

	@Column(length = 50)
	@Comment("手册代码")
	public String getManual_code() {
		return manual_code;
	}

	public void setManual_code(String manual_code) {
		this.manual_code = manual_code;
	}

	@Column(length = 300)
	@Comment("飞机描述")
	public String getAircraft_description() {
		return aircraft_description;
	}

	public void setAircraft_description(String aircraft_description) {
		this.aircraft_description = aircraft_description;
	}

	@Column(length = 10)
	@Comment("标识记录是否有效，VALID--有效，INVALID--无效。")
	public String getValidity() {
		return validity;
	}

	public void setValidity(String validity) {
		this.validity = validity;
	}

	@Column(length = 50)
	@Comment("机队序号")
	public String getFsn() {
		return fsn;
	}

	public void setFsn(String fsn) {
		this.fsn = fsn;
	}

	@Column
	@Comment("营运人")
	public Integer getAirway_id() {
		return airway_id;
	}

	public void setAirway_id(Integer airway_id) {
		this.airway_id = airway_id;
	}

	@Column(length = 50)
	@Comment("飞机状态（在用INUSE、在册INBOOK、准备引进PREPARE、退租SURRENDER)")
	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	@Column
	@Comment("ID")
	public Double getInit_tsn() {
		return init_tsn;
	}

	public void setInit_tsn(Double init_tsn) {
		this.init_tsn = init_tsn;
	}

	@Column
	@Comment("ID")
	public Double getInit_tso() {
		return init_tso;
	}

	public void setInit_tso(Double init_tso) {
		this.init_tso = init_tso;
	}

	@Column
	@Comment("ID")
	public Double getInit_tsr() {
		return init_tsr;
	}

	public void setInit_tsr(Double init_tsr) {
		this.init_tsr = init_tsr;
	}

	@Column
	@Comment("ID")
	public Double getInit_csn() {
		return init_csn;
	}

	public void setInit_csn(Double init_csn) {
		this.init_csn = init_csn;
	}

	@Column
	@Comment("ID")
	public Double getInit_cso() {
		return init_cso;
	}

	public void setInit_cso(Double init_cso) {
		this.init_cso = init_cso;
	}

	@Column
	@Comment("ID")
	public Double getInit_csr() {
		return init_csr;
	}

	public void setInit_csr(Double init_csr) {
		this.init_csr = init_csr;
	}

	@Column(length = 100)
	@Comment("#N/A")
	public String getAircraft_batch() {
		return aircraft_batch;
	}

	public void setAircraft_batch(String aircraft_batch) {
		this.aircraft_batch = aircraft_batch;
	}

	@Column(length = 50)
	@Comment("#N/A")
	public String getWire_marking() {
		return wire_marking;
	}

	public void setWire_marking(String wire_marking) {
		this.wire_marking = wire_marking;
	}

	@Column
	@Comment("飞机制造商(英文名)")
	public Integer getAircraft_manufacturer() {
		return aircraft_manufacturer;
	}

	public void setAircraft_manufacturer(Integer aircraft_manufacturer) {
		this.aircraft_manufacturer = aircraft_manufacturer;
	}

	@Column
	@Comment("#N/A")
	public Integer getEngine_manufacturer() {
		return engine_manufacturer;
	}

	public void setEngine_manufacturer(Integer engine_manufacturer) {
		this.engine_manufacturer = engine_manufacturer;
	}

	@Column
	@Comment("#N/A")
	public Integer getApu_manufacturer() {
		return apu_manufacturer;
	}

	public void setApu_manufacturer(Integer apu_manufacturer) {
		this.apu_manufacturer = apu_manufacturer;
	}

	@Column(length = 20)
	@Comment("飞机制造商代码(数字)")
	public String getAircraft_manufacturer_code() {
		return aircraft_manufacturer_code;
	}

	public void setAircraft_manufacturer_code(String aircraft_manufacturer_code) {
		this.aircraft_manufacturer_code = aircraft_manufacturer_code;
	}

	@Column(length = 50)
	@Comment("线号（适用波音，其他用NA）")
	public String getWire_no() {
		return wire_no;
	}

	public void setWire_no(String wire_no) {
		this.wire_no = wire_no;
	}

	@Column(length = 50)
	@Comment("用户有效码")
	public String getUser_variable_no() {
		return user_variable_no;
	}

	public void setUser_variable_no(String user_variable_no) {
		this.user_variable_no = user_variable_no;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("更新日期")
	public Date getUpdate_date() {
		return update_date;
	}

	public void setUpdate_date(Date update_date) {
		this.update_date = update_date;
	}

}
