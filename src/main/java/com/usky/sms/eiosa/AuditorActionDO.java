package com.usky.sms.eiosa;

import org.hibernate.cfg.Comment;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.audit.auditor.AuditorDO;
import com.usky.sms.core.AbstractBaseDO;
@Entity
@Table(name = "E_IOSA_AUDITOR_ACTION")
@Comment("EIOSA表")
public class AuditorActionDO extends AbstractBaseDO{
	/**
	 * 
	 */
	private static final long serialVersionUID = 5204718834077328727L;
	private Integer creator;
	private Integer last_modifier;
	private IsarpActionDO actionId;
	private AuditorDO auditorId ;
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
	@ManyToOne
	@JoinColumn(name = "actionId")
	@Comment("")
	public IsarpActionDO getActionId() {
		return actionId;
	}
	public void setActionId(IsarpActionDO actionId) {
		this.actionId = actionId;
	}
	@ManyToOne
	@JoinColumn(name = "auditorId")
	public AuditorDO getAuditorId() {
		return auditorId;
	}
	public void setAuditorId(AuditorDO auditorId) {
		this.auditorId = auditorId;
	}
	
	
	
	

}
