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

@Entity
@Table(name = "T_COLUMN_LAYOUT_ITEM")
@Comment("字段布局配置")
public class ColumnLayoutItemDO extends AbstractBaseDO implements IDisplayable {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	/** 名称 */
	private String name;
	
	/** 字段的布局 */
	private ColumnLayoutDO layout;
	
	/** 位置 */
	private int position;
	
	@Column(length = 50)
	@Comment("名称")
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "layout")
	@Comment("字段的布局")
	public ColumnLayoutDO getLayout() {
		return layout;
	}

	public void setLayout(ColumnLayoutDO layout) {
		this.layout = layout;
	}

	@Column(length = 11)
	@Comment("位置")
	public int getPosition() {
		return position;
	}

	public void setPosition(int position) {
		this.position = position;
	}

	@Override
	@Transient
	public String getDisplayName() {
		return this.getName();
	}
}
