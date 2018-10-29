package com.usky.sms.eiosa;

import org.hibernate.cfg.Comment;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "e_iosa_isarp_history")
@Comment("EIOSA表")
public class IsarpHistoryDO extends AbstractBaseDO{
	private UserDO creator;
	private UserDO last_modifier;
	private transient IsarpDO curIsarpId;
	private Integer preIsarpId;
	private Integer firstIsarpId;
	
	@ManyToOne
	@JoinColumn(name = "CREATOR")
	@Comment("")
	public UserDO getCreator() {
		return creator;
	}
	public void setCreator(UserDO creator) {
		this.creator = creator;
	}
	@ManyToOne
	@JoinColumn(name = "last_modifier")
	@Comment("")
	public UserDO getLast_modifier() {
		return last_modifier;
	}
	public void setLast_modifier(UserDO last_modifier) {
		this.last_modifier = last_modifier;
	}
	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "curIsarpId")
	@Comment("")
	public IsarpDO getCurIsarpId() {
		return curIsarpId;
	}
	public void setCurIsarpId(IsarpDO curIsarpId) {
		this.curIsarpId = curIsarpId;
	}
	@Comment("")
	public Integer getPreIsarpId() {
		return preIsarpId;
	}
	public void setPreIsarpId(Integer preIsarpId) {
		this.preIsarpId = preIsarpId;
	}
	@Comment("")
	public Integer getFirstIsarpId() {
		return firstIsarpId;
	}
	public void setFirstIsarpId(Integer firstIsarpId) {
		this.firstIsarpId = firstIsarpId;
	}
	

}
