package com.usky.sms.weixianyuan;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_DANGEROUS_SOURCE")
@Comment("危险源相关表")
public class DangerousSourceDO extends AbstractBaseDO{

	private static final long serialVersionUID = 4552076329134995294L;

	private String code;
	
	private String description;
	
	private String beforep;
	
	private String befores;
	
	private String beforer;
	
	private String beforel;
	
	private String afterp;
	
	private String afters;
	
	private String afterr;
	
	private String afterl;
	
	private String future;
	
	private SysFlowDO sysFlow;

	@Column(length = 50)
	@Comment("")
	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	@Column(length = 1000)
	@Comment("")
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	@Column(length = 50)
	@Comment("")
	public String getBeforep() {
		return beforep;
	}

	public void setBeforep(String beforep) {
		this.beforep = beforep;
	}

	@Column(length = 50)
	@Comment("")
	public String getBefores() {
		return befores;
	}

	public void setBefores(String befores) {
		this.befores = befores;
	}

	@Column(length = 50)
	@Comment("")
	public String getBeforer() {
		return beforer;
	}

	public void setBeforer(String beforer) {
		this.beforer = beforer;
	}
	
	@Column(length = 50)
	@Comment("")
	public String getBeforel() {
		return beforel;
	}

	public void setBeforel(String beforel) {
		this.beforel = beforel;
	}

	@Column(length = 50)
	@Comment("")
	public String getAfterp() {
		return afterp;
	}

	public void setAfterp(String afterp) {
		this.afterp = afterp;
	}

	@Column(length = 50)
	@Comment("")
	public String getAfters() {
		return afters;
	}

	public void setAfters(String afters) {
		this.afters = afters;
	}

	@Column(length = 50)
	@Comment("")
	public String getAfterr() {
		return afterr;
	}

	public void setAfterr(String afterr) {
		this.afterr = afterr;
	}
	
	@Column(length = 50)
	@Comment("")
	public String getAfterl() {
		return afterl;
	}

	public void setAfterl(String afterl) {
		this.afterl = afterl;
	}

	@Column(length = 50)
	@Comment("")
	public String getFuture() {
		return future;
	}

	public void setFuture(String future) {
		this.future = future;
	}

	@ManyToOne
	@JoinColumn(name="SYS_FLOW")
	@Comment("")
	public SysFlowDO getSysFlow() {
		return sysFlow;
	}

	public void setSysFlow(SysFlowDO sysFlow) {
		this.sysFlow = sysFlow;
	} 
}
