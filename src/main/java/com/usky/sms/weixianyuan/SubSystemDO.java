package com.usky.sms.weixianyuan;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.dictionary.DictionaryDO;

@Entity
@Table(name = "T_SUB_SYSTEM")
@Comment("危险源相关表")
public class SubSystemDO extends AbstractBaseDO {

	private static final long serialVersionUID = 1375562815183382895L;

	private DictionaryDO sysType;

	private String name;

	private String description;
	
	@ManyToOne
	@JoinColumn(name="SYS_TYPE")
	@Comment("")
	public DictionaryDO getSysType() {
		return sysType;
	}

	public void setSysType(DictionaryDO sysType) {
		this.sysType = sysType;
	}

	@Column(length = 255)
	@Comment("")
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@Column(length = 4000)
	@Comment("")
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}
	
}
