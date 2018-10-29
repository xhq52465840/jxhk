package com.usky.sms.navigation;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.user.UserDO;

/**
 * 应用程序导航栏
 */

@Entity
@Table(name = "T_NAVIGATION")
@Comment("应用程序导航栏")
public class NavigationDO extends AbstractBaseDO {

	private static final long serialVersionUID = -2806315105742480800L;// 序列
	
	/** 名称 */
	private String name;
	
	/** URL */
	private String url;
	
	/** 状态  隐藏与显示 */
	private String status;
	
	/** 存放用户组的id */
	private String usergroup;
	
	/** 创建人 */
	private UserDO creator;
	
	/** 更新人 */
	private UserDO updater;
	

	@Column(length = 50, nullable = false)
	@Comment("名称")
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@Column(length = 255)
	@Comment("URL")
	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	@Column(length=50)
	@Comment("状态  隐藏与显示")
	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	@Column(length = 50)
	@Comment("存放用户组的id")
	public String getUsergroup() {
		return usergroup;
	}

	public void setUsergroup(String usergroup) {
		this.usergroup = usergroup;
	}
	@ManyToOne
	@JoinColumn(name = "CREATOR_ID")
	@Comment("创建人")
	public UserDO getCreator() {
		return creator;
	}

	public void setCreator(UserDO creator) {
		this.creator = creator;
	}
	@ManyToOne
	@JoinColumn(name = "UPDATER_ID")
	@Comment("更新人")
	public UserDO getUpdater() {
		return updater;
	}

	public void setUpdater(UserDO updater) {
		this.updater = updater;
	}

}
