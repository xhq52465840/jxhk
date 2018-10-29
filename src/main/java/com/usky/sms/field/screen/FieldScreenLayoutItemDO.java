
package com.usky.sms.field.screen;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_FIELD_SCREEN_LAYOUT_ITEM")
@Comment("页面中的详细字段")
public class FieldScreenLayoutItemDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 2446506605073151838L;
	
	/** 字段关联：customfield_+自定字段T_CUSTOM_FIELD主键、crossUnits其它安监机构、description描述、label标签、priority优先级、processors当前处理人、summary详细描述、status状态 */
	private String key;
	
	/** 排序 */
	private Integer sequence;
	
	/** 标签页 */
	private FieldScreenTabDO tab;
	
	@Column(name = "`key`", length = 50)
	@Comment("字段关联：customfield_+自定字段T_CUSTOM_FIELD主键、crossUnits其它安监机构、description描述、label标签、priority优先级、processors当前处理人、summary详细描述、status状态")
	public String getKey() {
		return key;
	}
	
	public void setKey(String key) {
		this.key = key;
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
	@JoinColumn(name = "TAB_ID")
	@Comment("标签页")
	public FieldScreenTabDO getTab() {
		return tab;
	}
	
	public void setTab(FieldScreenTabDO tab) {
		this.tab = tab;
	}
	
}
