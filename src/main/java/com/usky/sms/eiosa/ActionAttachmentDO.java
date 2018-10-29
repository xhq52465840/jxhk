package com.usky.sms.eiosa;

import org.hibernate.cfg.Comment;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;
@Entity
@Table(name = "e_iosa_isarp_attachs")
@Comment("EIOSA表")
public class ActionAttachmentDO extends AbstractBaseDO{

	/**
	 * 
	 */
	private static final long serialVersionUID = -5744118630067095538L;
	
	private Long actionId;
	private String attachShowName;
	private String attachServerName;
	private String Url;
	private String attachSize;
	private  UserDO auditor;
	private  UserDO  updataAuditor;
	
	@Comment("")
	public Long getActionId() {
		return actionId;
	}
	public void setActionId(Long actionId) {
		this.actionId = actionId;
	}
	@Comment("")
	public String getAttachShowName() {
		return attachShowName;
	}
	public void setAttachShowName(String attachShowName) {
		this.attachShowName = attachShowName;
	}
	@Comment("")
	public String getAttachServerName() {
		return attachServerName;
	}
	public void setAttachServerName(String attachServerName) {
		this.attachServerName = attachServerName;
	}
	@Comment("")
	public String getUrl() {
		return Url;
	}
	public void setUrl(String url) {
		Url = url;
	}
	@Comment("")
	public String getAttachSize() {
		return attachSize;
	}
	public void setAttachSize(String attachSize) {
		this.attachSize = attachSize;
	}
	@ManyToOne
	@JoinColumn(name = "creator")
	@Comment("")
	public UserDO getAuditor() {
		return auditor;
	}
	public void setAuditor(UserDO auditor) {
		this.auditor = auditor;
	}
	@ManyToOne
	@JoinColumn(name = "last_modifier")
	@Comment("")
	public UserDO getUpdataAuditor() {
		return updataAuditor;
	}
	public void setUpdataAuditor(UserDO updataAuditor) {
		this.updataAuditor = updataAuditor;
	}
	
	
	
     
}
