
package com.usky.sms.activity.attribute;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_ACTIVITY_PRIORITY")
@Comment("安全信息优先级字典")
public class ActivityPriorityDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -7513119790257193065L;
	
	/** 优先级名称 */
	private String name;
	
	/** 优先级描述 */
	private String description;
	
	/** 排序 */
	private Integer sequence;
	
	/** 图标 */
	private String url;
	
	/** 优先级的颜色 */
	private String color;
	
	/** 1表示默认选中 */
	private Boolean defaultValue = false;
	
	@Column(length = 50, unique = true, nullable = false)
	@Comment("优先级名称")
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	@Column(length = 255)
	@Comment("优先级描述")
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
	
	@Column(length = 255)
	@Comment("图标")
	public String getUrl() {
		return url;
	}
	
	public void setUrl(String url) {
		this.url = url;
	}
	
	@Column(length = 50)
	@Comment("优先级的颜色")
	public String getColor() {
		return color;
	}
	
	public void setColor(String color) {
		this.color = color;
	}
	
	@Column(name = "`default`")
	public Boolean getDefaultValue() {
		return defaultValue;
	}
	
	public void setDefaultValue(Boolean defaultValue) {
		this.defaultValue = defaultValue;
	}
	
}
