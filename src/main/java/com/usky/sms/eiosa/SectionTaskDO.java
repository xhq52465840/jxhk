package com.usky.sms.eiosa;

import org.hibernate.cfg.Comment;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.audit.auditor.AuditorDO;
import com.usky.sms.core.AbstractBaseDO;
@Entity
@Table(name = "e_iosa_section_task")
@Comment("EIOSA表")
public class SectionTaskDO extends AbstractBaseDO{

	/**
	 * 
	 */
	private static final long serialVersionUID = 2285196532476581821L;
	private Integer  creator;         
	private Integer last_modifier;
	
	private Integer targetId;
	private AuditorDO  dealerId;
	private Integer   type;
	private Integer   validity;
	@Comment("")
	public Integer getCreator() {
		return creator;
	}
	public void setCreator(Integer creator) {
		this.creator = creator;
	}
	@Comment("")
	public Integer getLast_modifier() {
		return last_modifier;
	}
	public void setLast_modifier(Integer last_modifier) {
		this.last_modifier = last_modifier;
	}
	
	@Comment("")
	public Integer getTargetId() {
		return targetId;
	}
	public void setTargetId(Integer targetId) {
		this.targetId = targetId;
	}
	@ManyToOne
	@JoinColumn(name = "dealerId")
	@Comment("")
	public AuditorDO getDealerId() {
		return dealerId;
	}
	public void setDealerId(AuditorDO dealerId) {
		this.dealerId = dealerId;
	}
	@Comment("")
	public Integer getType() {
		return type;
	}
	public void setType(Integer type) {
		this.type = type;
	}
	@Comment("")
	public Integer getValidity() {
		return validity;
	}
	public void setValidity(Integer validity) {
		this.validity = validity;
	}
	
	
	
}
