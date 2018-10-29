package com.usky.sms.bulletin;

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
@Table(name = "T_BULLETIN")
@Comment("公告栏")
public class BulletinDO extends AbstractBaseDO implements IDisplayable {

	/**
	 * 公告栏
	 */
	private static final long serialVersionUID = -7801637939398938058L;

	/** 公告内容 **/
	private String content;

	/** 可见度 **/
	private String visibility;
		
	/** 创建人 **/
	private UserDO creator;
	
	/** 最后更新人 **/
	private UserDO lastUpdater;
		
	@Column(length = 1000)
	@Comment("公告内容")
	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}
	
	@Column(length = 10)
	@Comment("可见度")
	public String getVisibility() {
		return visibility;
	}

	public void setVisibility(String visibility) {
		this.visibility = visibility;
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
	@JoinColumn(name = "last_updater")
	@Comment("最后更新人")
	public UserDO getLastUpdater() {
		return lastUpdater;
	}

	public void setLastUpdater(UserDO lastUpdater) {
		this.lastUpdater = lastUpdater;
	}
	
	@Override
	@Transient
	public String getDisplayName() {
		return this.getContent();
	}	
}
