
package com.usky.sms.processor;
import org.hibernate.cfg.Comment;

import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "T_PROCESSOR")
@Comment("安全信息处理人")
public class ProcessorDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -6789780290166025583L;
	
	/** 安全信息 */
	private ActivityDO activity;
	
	/** 处理人 */
	private UserDO user;
	
	@ManyToOne
	@JoinColumn(name = "ACTIVITY_ID")
	@Comment("安全信息")
	public ActivityDO getActivity() {
		return activity;
	}
	
	public void setActivity(ActivityDO activity) {
		this.activity = activity;
	}
	
	@ManyToOne
	@JoinColumn(name = "USER_ID")
	@Comment("处理人")
	public UserDO getUser() {
		return user;
	}
	
	public void setUser(UserDO user) {
		this.user = user;
	}
	
}
