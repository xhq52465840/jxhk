package com.usky.sms.outview;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
/**
 * 颜色
 */
@Entity
@Table(name = "T_COLOR")
@Comment("颜色")
public class ColorDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -3146320535232561846L;
	
	/** 颜色菜单名称 如：页头高亮背景颜色 */
	private String name;
	
	/** 颜色编号 如：#296CA3 */
	private String colorNum;
	
	/** 每个功能的标识 */
	private String flag;

	@Column(length = 255)
	@Comment("颜色菜单名称 如：页头高亮背景颜色")
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@Column(length = 255)
	@Comment("颜色编号 如：#296CA3")
	public String getColorNum() {
		return colorNum;
	}

	public void setColorNum(String colorNum) {
		this.colorNum = colorNum;
	}
	@Column(length = 50)
	@Comment("每个功能的标识")
	public String getFlag() {
		return flag;
	}

	public void setFlag(String flag) {
		this.flag = flag;
	}
	
	

}
