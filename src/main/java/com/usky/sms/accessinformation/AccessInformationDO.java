
package com.usky.sms.accessinformation;
import org.hibernate.cfg.Comment;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_ACCESS_INFORMATION")
@Comment("信息获取中的发生时间")
public class AccessInformationDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 3373681398459913956L;
	
	/** 安全信息 */
	private ActivityDO activity;
	
	 /** 发生日期 **/
	private Date occurredDate;
	
	@OneToOne
	@JoinColumn(name = "ACTIVITY_ID")
	@Comment("安全信息")
	public ActivityDO getActivity() {
		return activity;
	}
	
	public void setActivity(ActivityDO activity) {
		this.activity = activity;
	}
	
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "occurred_date", columnDefinition = "DATE")
	@Comment("发生日期")
	public Date getOccurredDate() {
		return occurredDate;
	}
	
	public void setOccurredDate(Date occurredDate) {
		this.occurredDate = occurredDate;
	}
	
}
