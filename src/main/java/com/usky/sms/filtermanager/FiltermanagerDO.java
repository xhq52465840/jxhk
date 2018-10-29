package com.usky.sms.filtermanager;

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
@Table(name = "T_FILTERMANAGER")
@Comment("过滤器管理")
public class FiltermanagerDO extends AbstractBaseDO implements IDisplayable {
	/**
	 * 过滤器管理
	 */
	private static final long serialVersionUID = -8866372882729325794L;

	/** 名称 */
	private String name;

	/** 过滤器规则 */
	private String filterRule;

	/** 收藏人列表 主键逗号隔开 */
	private String charnelThose;// 收藏人列表 主键逗号隔开

	/** 分享群体 ,U@#1,G@#, */
	private String paladin;// 分享群体 ,U@#1,G@#,
		
	/** 创建人 */
	private UserDO creator;
	
	/** 更新日期 */
	private UserDO lastUpdater;
	
	/** 描述 */
	private String description;
	
	
	@Column(length = 50)		
	@Comment("名称")
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
	
	@Column(name = "filter_rule",length = 1000)
	@Comment("过滤器规则")
	public String getFilterRule() {
		return filterRule;
	}

	public void setFilterRule(String filterRule) {
		this.filterRule = filterRule;
	}

	@Column(name = "charnel_those",length = 1000)
	@Comment("收藏人列表 主键逗号隔开")
	public String getCharnelThose() {
		return charnelThose;
	}

	public void setCharnelThose(String charnelThose) {
		this.charnelThose = charnelThose;
	}

	@Column(length = 1000)
	@Comment("分享群体 ,U@#1,G@#,")
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
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "lastUpdater")	
	@Comment("更新日期")
	public UserDO getLastUpdater() {
		return lastUpdater;
	}

	public void setLastUpdater(UserDO lastUpdater) {
		this.lastUpdater = lastUpdater;
	}
	
	@Column(length = 1000)
	@Comment("描述")
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	@Override
	@Transient
	public String getDisplayName() {
		return this.getName();
	}
}
