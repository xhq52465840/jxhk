
package com.usky.sms.test;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_TEST")
@Comment("测试")
public class TestDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -1141055482258339468L;
	
	/** 名称 */
	private String name;
	
	@Column(length = 50)
	@Comment("名称")
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
}
