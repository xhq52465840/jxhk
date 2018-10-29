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
@Table(name = "yxw_tb_company")
@Comment("QAR表")
public class QarCompanyDO implements Serializable {

	private static final long serialVersionUID = -1867791346564704342L;

	private Integer orger_index;
	
	/** 航线代码 */
	private String airlines_code;
	
	/** 公司名称 */
	private String company_name;
	
	/** 状态 */
	private Integer state;
	
	/** 创建时间 */
	private Date add_time;
	
	/** 更新时间 */
	private Date upd_time;
	
	/** 机场代码 */
	private String base_airport_code;
	
	/** 公司代码 */
	private String company_code;

	@Id
	@Column
	@Comment("")
	public Integer getOrger_index() {
		return orger_index;
	}

	public void setOrger_index(Integer orger_index) {
		this.orger_index = orger_index;
	}

	@Column(length = 100)
	@Comment("航线代码")
	public String getAirlines_code() {
		return airlines_code;
	}

	public void setAirlines_code(String airlines_code) {
		this.airlines_code = airlines_code;
	}

	@Column(length = 100)
	@Comment("公司名称")
	public String getCompany_name() {
		return company_name;
	}

	public void setCompany_name(String company_name) {
		this.company_name = company_name;
	}

	@Column
	@Comment("状态")
	public Integer getState() {
		return state;
	}

	public void setState(Integer state) {
		this.state = state;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("创建时间")
	public Date getAdd_time() {
		return add_time;
	}

	public void setAdd_time(Date add_time) {
		this.add_time = add_time;
	}

	@Temporal(TemporalType.TIMESTAMP)
	@Column(columnDefinition = "DATE")
	@Comment("更新时间")
	public Date getUpd_time() {
		return upd_time;
	}

	public void setUpd_time(Date upd_time) {
		this.upd_time = upd_time;
	}

	@Column(length = 100)
	@Comment("机场代码")
	public String getBase_airport_code() {
		return base_airport_code;
	}

	public void setBase_airport_code(String base_airport_code) {
		this.base_airport_code = base_airport_code;
	}

	@Column(length = 100)
	@Comment("公司代码")
	public String getCompany_code() {
		return company_code;
	}

	public void setCompany_code(String company_code) {
		this.company_code = company_code;
	}

}
