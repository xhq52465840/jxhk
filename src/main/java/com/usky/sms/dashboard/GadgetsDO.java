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
@Table(name = "T_GADGETS")
@Comment("看板库")
public class GadgetsDO extends AbstractBaseDO implements IDisplayable {

	private static final long serialVersionUID = -6101542562635312596L;

	/** 标题 **/
	private String title;
	
	/** 类型 **/
	private String type;

	/** 缩略图 **/
	private String thumbnail;

	/** 描述 **/
	private String description;

	/** URL **/
	private String url;

	/** 创建人 **/
	private UserDO creator;
	
	@Column(length = 50)
	@Comment("标题")
	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}
	
	@Column(length = 50)
	@Comment("类型")
	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}
	
	@Column(length = 255)
	@Comment("缩略图")
	public String getThumbnail() {
		return thumbnail;
	}

	public void setThumbnail(String thumbnail) {
		this.thumbnail = thumbnail;
	}
	
	@Column(length = 1000)
	@Comment("描述")
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}
	
	@Column(length = 1000)
	@Comment("URL")
	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
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

	@Override
	@Transient
	public String getDisplayName() {
		return this.getTitle();
	}
}
