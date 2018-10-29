package com.usky.sms.outview;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

/**
 * 小工具颜色
 */
@Entity
@Table(name = "T_TOOL_COLOR")
@Comment("小工具颜色")
public class ToolColorDO extends AbstractBaseDO {

	private static final long serialVersionUID = 7489814674963620722L;
	
	/** 名称 如：色彩1 */
	private String name;
	
	/** 颜色编号 如：#14892c */
	private String colorNum;
	
	/** 每个功能的标识 */
	private String flag;

	@Column(length = 255)
	@Comment("名称 如：色彩1")
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@Column(length = 255)
	@Comment("颜色编号 如：#14892c")
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
