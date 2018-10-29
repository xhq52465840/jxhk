package com.usky.sms.dashboard;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "T_GADGETINS")
@Comment("看板库实例")
public class GadgetsinstanceDO extends AbstractBaseDO implements IDisplayable {
	
	private static final long serialVersionUID = -120852290379171629L;	

	/** 看板 **/
	private GadgetsDO gadgets;

	/** 创建人 **/
	private UserDO creator;

	/** URL **/
	private String urlparam;
	
	/** 位置 **/
	private String position;
	
	/** 主看板 **/
	private DashboardDO dashboard;
	
	/** 过滤参数 **/
	private String filterparam;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "gadgets")
	@Comment("看板")
	public GadgetsDO getGadgets() {
		return gadgets;
	}

	public void setGadgets(GadgetsDO gadgets) {
		this.gadgets = gadgets;
	}
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "creator")
	@Comment("创建人")
	public UserDO getCreator() {
		return creator;
	}

	public void setCreator(UserDO creator) {
		this.creator = creator;
	}
	
	@Column(length = 4000)
	@Comment("URL")
	public String getUrlparam() {
		return urlparam;
	}

	public void setUrlparam(String urlparam) {
		this.urlparam = urlparam;
	}

	@Column(length = 255)
	@Comment("位置")
	public String getPosition() {
		return position;
	}

	public void setPosition(String position) {
		this.position = position;
	}	
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "dashboard")
	@Comment("主看板")
	public DashboardDO getDashboard() {
		return dashboard;
	}

	public void setDashboard(DashboardDO dashboard) {
		this.dashboard = dashboard;
	}
	
	@Column(length = 4000)
	@Comment("过滤参数")
	public String getFilterparam() {
		return filterparam;
	}

	public void setFilterparam(String filterparam) {
		this.filterparam = filterparam;
	}

	@Override
	@Transient
	public String getDisplayName() {
		return this.getUrlparam();
	}
}
