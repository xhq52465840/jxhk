package com.usky.sms.audit.padfunc;

import org.hibernate.cfg.Comment;
import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.IdClass;
import javax.persistence.Table;

/**
 * 审计处理过的工作单、检查单、整改单、审计报告的视图
 * create or replace view a_has_completed as
	select a.id check_id,
	       w.user_id user_id,
	       max(w.last_update) last_update
	 from  wf_activity_status w
	 join  a_check a
	  on   w.activity_id = a.id
	 group by a.id ,w.user_id
	 union
	 select a.id check_id,
	       w.user_id user_id,
	       max(w.last_update) last_update
	 from  wf_activity_status w
	 join  a_task a
	  on   w.activity_id = a.id
	 group by a.id ,w.user_id
	 union
	 select a.id check_id,
	       w.user_id user_id,
	       max(w.last_update) last_update
	 from  wf_activity_status w
	 join  a_improve a
	  on   w.activity_id = a.id
	 group by a.id ,w.user_id;
 * @author Administrator
 *
 */
@Entity
@Table(name = "A_HAS_COMPLETED")
@IdClass(HasCompletedId.class)
public class HasCompletedDO implements Serializable {

	private static final long serialVersionUID = -1453344173956253667L;

	private Integer checkId;

	private Integer userId;
	
	private Date lastUpdate;

	@Id
	@Column(name = "CHECK_ID")
	@Comment("")
	public Integer getCheckId() {
		return checkId;
	}

	public void setCheckId(Integer checkId) {
		this.checkId = checkId;
	}

	@Id
	@Column(name = "USER_ID")
	@Comment("")
	public Integer getUserId() {
		return userId;
	}

	public void setUserId(Integer userId) {
		this.userId = userId;
	}
	@Column(name = "LAST_UPDATE", columnDefinition = "DATE")
	@Comment("")
	public Date getLastUpdate() {
		return lastUpdate;
	}

	public void setLastUpdate(Date lastUpdate) {
		this.lastUpdate = lastUpdate;
	}
	
	

}
