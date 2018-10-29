
package com.usky.sms.accessinformation;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;
import com.usky.sms.dictionary.DictionaryDO;

@Entity
@Table(name = "T_GROUND_STAFF_ENTITY")
@Comment("地面人员")
public class GroundStaffEntityDO extends AbstractBaseDO implements IDisplayable{
	
	private static final long serialVersionUID = -8678941432280684741L;
	
	/** 安全信息主键  **/
	private ActivityDO activity;
	
	/** 姓名  **/
	private String userName;
	
	/** 工种  **/
	private DictionaryDO workType;
	
	/** 描述  **/
	private String description;
	
	@ManyToOne
	@JoinColumn(name = "ACTIVITY_ID")
	@Comment("安全信息主键")
	public ActivityDO getActivity() {
		return activity;
	}
	
	public void setActivity(ActivityDO activity) {
		this.activity = activity;
	}
	
	@ManyToOne
	@JoinColumn(name = "work_type")	
	@Comment("工种")
	public DictionaryDO getWorkType() {
		return workType;
	}	
	
	public void setWorkType(DictionaryDO workType) {
		this.workType = workType;
	}
	
	@Column(length = 4000)
	@Comment("描述")
	public String getDescription() {
		return description;
	}
	
	public void setDescription(String description) {
		this.description = description;
	}

	@Column(name="user_name",length = 100)
	@Comment("姓名")
	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}	
	
	@Override
	@Transient
	public String getDisplayName() {
		return this.getUserName();
	}
}
