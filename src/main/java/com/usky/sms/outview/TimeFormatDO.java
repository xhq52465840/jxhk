package com.usky.sms.outview;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

/**
 * 日期/时间格式
 */
@Entity
@Table(name = "T_TIME_FORMAT")
@Comment("日期/时间格式")
public class TimeFormatDO extends AbstractBaseDO {

	private static final long serialVersionUID = -6483513840248432967L;
	
	/** 时间/日期格式名称 */
	private String name;
	
	/** 格式 */
	private String pattern;

	@Column(length = 255)
	@Comment("时间/日期格式名称")
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@Column(length = 255)
	@Comment("格式")
	public String getPattern() {
		return pattern;
	}

	public void setPattern(String pattern) {
		this.pattern = pattern;
	}

}
