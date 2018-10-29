package com.usky.sms.weixianyuan;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_AFTERMATH")
@Comment("危险源相关表")
public class AfterMathDO extends AbstractBaseDO {

	private static final long serialVersionUID = -2504704937332645040L;

	private String description;
	
	private DangerousSourceDO dangerousSource;

	@Column(length = 1000)
	@Comment("")
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	@ManyToOne
	@JoinColumn(name="DANGER_SOURCE")
	@Comment("")
	public DangerousSourceDO getDangerousSource() {
		return dangerousSource;
	}

	public void setDangerousSource(DangerousSourceDO dangerousSource) {
		this.dangerousSource = dangerousSource;
	}
	
}
