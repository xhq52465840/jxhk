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
@Table(name = "T_DASHBOARD")
@Comment("主看板")
public class DashboardDO extends AbstractBaseDO implements IDisplayable {
	
	private static final long serialVersionUID = 4533085187807876209L;

	/** 名称 **/
	private String name;

	/** 描述 **/
	private String description;

	/** 布局 **/
	private String layout;

	/** 收藏人列表 主键逗号隔开 **/
	private String charnelThose;

	/** 分享群体 USER-1,2,3,4@#GROUP-,3,4,1,4@#RULE-4,1,3 **/
	private String paladin;
		
	/** 创建人 **/
	private UserDO creator;
	
	/** 默认 **/
	private String smsdefault;
	
	@Column(length = 50)
	@Comment("名称")
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
	
	@Column(length = 1000)
	@Comment("描述")
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}
	
	@Column(length = 50)
	@Comment("布局")
	public String getLayout() {
		return layout;
	}

	public void setLayout(String layout) {
		this.layout = layout;
	}
	
	@Column(name = "charnel_those",length = 4000)
	@Comment("收藏人列表 主键逗号隔开")
	public String getCharnelThose() {
		return charnelThose;
	}

	public void setCharnelThose(String charnelThose) {
		this.charnelThose = charnelThose;
	}
	
	@Column(length = 1000)
	@Comment("分享群体 USER-1,2,3,4@#GROUP-,3,4,1,4@#RULE-4,1,3")
	public String getPaladin() {
		return paladin;
	}

	public void setPaladin(String paladin) {
		this.paladin = paladin;
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
	
	@Comment("默认")
	public String getSmsdefault() {
		return smsdefault;
	}

	public void setSmsdefault(String smsdefault) {
		this.smsdefault = smsdefault;
	}

	@Override
	@Transient
	public String getDisplayName() {
		return this.getName();
	}
}
