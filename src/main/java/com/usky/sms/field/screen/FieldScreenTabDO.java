
package com.usky.sms.field.screen;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_FIELD_SCREEN_TAB")
@Comment("界面标签页")
public class FieldScreenTabDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -5989679661513824694L;
	
	/** 名称 */
	private String name;
	
	/** 描述 */
	private String description;
	
	/** 排序 */
	private Integer sequence;
	
	/** 界面主键 */
	private FieldScreenDO screen;
	
	@Column(length = 50)
	@Comment("名称")
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	@Column(length = 255)
	@Comment("描述")
	public String getDescription() {
		return description;
	}
	
	public void setDescription(String description) {
		this.description = description;
	}
	
	@Column
	@Comment("排序")
	public Integer getSequence() {
		return sequence;
	}
	
	public void setSequence(Integer sequence) {
		this.sequence = sequence;
	}
	
	@ManyToOne
	@JoinColumn(name = "SCREEN_ID")
	@Comment("界面主键")
	public FieldScreenDO getScreen() {
		return screen;
	}
	
	public void setScreen(FieldScreenDO screen) {
		this.screen = screen;
	}
	
}
