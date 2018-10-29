package com.usky.sms.weixianyuan;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_SYS_FLOW")
@Comment("危险源相关表")
public class SysFlowDO extends AbstractBaseDO {

	private static final long serialVersionUID = 4857535701867172896L;

	private String name;
	
	private String slevel;
	
	private SysFlowDO parent;
	
	private SubSystemDO subSystem;

	@Column(length = 255)
	@Comment("")
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@Column(length = 10)
	@Comment("")
	public String getSlevel() {
		return slevel;
	}

	public void setSlevel(String slevel) {
		this.slevel = slevel;
	}
	
	@ManyToOne
	@JoinColumn(name = "PARENT_ID")
	@Comment("")
	public SysFlowDO getParent() {
		return parent;
	}

	public void setParent(SysFlowDO parent) {
		this.parent = parent;
	}

	@ManyToOne
	@JoinColumn(name="SUB_SYSTEM")
	@Comment("")
	public SubSystemDO getSubSystem() {
		return subSystem;
	}

	public void setSubSystem(SubSystemDO subSystem) {
		this.subSystem = subSystem;
	}

}
