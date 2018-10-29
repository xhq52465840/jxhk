package com.usky.sms.qar;

import org.hibernate.cfg.Comment;
import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "qar_sta_proc")
@Comment("QAR表")
public class QarStaProDO implements Serializable{

	private static final long serialVersionUID = 323995357999717422L;

	/** 主键 */
	private Integer id;
	
	/** 英文描述 */
	private String pro_desc;
	
	/** 程序编号 */
	private String pro_no;
	
	/** 版本号 */
	private Integer ver_no;
	
	private String belong_station;

	@Column(length = 300)
	@Comment("英文描述")
	public String getPro_desc() {
		return pro_desc;
	}

	public void setPro_desc(String pro_desc) {
		this.pro_desc = pro_desc;
	}

	@Column(length = 30)
	@Comment("程序编号")
	public String getPro_no() {
		return pro_no;
	}

	public void setPro_no(String pro_no) {
		this.pro_no = pro_no;
	}

	@Column
	@Comment("版本号")
	public Integer getVer_no() {
		return ver_no;
	}

	public void setVer_no(Integer ver_no) {
		this.ver_no = ver_no;
	}

	@Column(length = 30)
	@Comment("")
	public String getBelong_station() {
		return belong_station;
	}

	public void setBelong_station(String belong_station) {
		this.belong_station = belong_station;
	}

	@Id
	@Column
	@Comment("主键")
	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}
	
}
