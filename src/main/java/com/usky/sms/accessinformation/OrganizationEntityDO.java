
package com.usky.sms.accessinformation;
import org.hibernate.cfg.Comment;

import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.organization.OrganizationDO;

@Entity
@Table(name = "T_ORGANIZATION_ENTITY")
@Comment("信息获取中的单位信息")
public class OrganizationEntityDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 5966730385117300662L;
	
	/** 安全信息主键  **/
	private ActivityDO activity;
	
	/** 组织主键  **/
	private OrganizationDO organization;
	
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
	@JoinColumn(name = "ORGANIZATION_ID")
	@Comment("组织主键")
	public OrganizationDO getOrganization() {
		return organization;
	}
	
	public void setOrganization(OrganizationDO organization) {
		this.organization = organization;
	}
	
}
