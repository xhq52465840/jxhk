package com.usky.sms.columnlayout;

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
@Table(name = "T_COLUMN_LAYOUT")
@Comment("页面布局")
public class ColumnLayoutDO extends AbstractBaseDO implements IDisplayable {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	/** 用户 **/
	private UserDO user_id;
	
	/** 查询 **/
	private int searchRequest;
	
	/** 名称 **/
	private String name;
	
	@Column(length = 50)
	@Comment("名称")
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "user_id")
	@Comment("用户")
	public UserDO getUser_id() {
		return user_id;
	}

	public void setUser_id(UserDO user_id) {
		this.user_id = user_id;
	}

	@Column(length = 11)
	@Comment("查询")
	public int getSearchRequest() {
		return searchRequest;
	}

	public void setSearchRequest(int searchRequest) {
		this.searchRequest = searchRequest;
	}

	@Override
	@Transient
	public String getDisplayName() {
		return this.getName();
	}
}
