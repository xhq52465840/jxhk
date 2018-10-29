
package com.usky.sms.activity.attribute;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_ACTIVITY_RESOLUTION")
@Comment("解决结果字典")
public class ActivityResolutionDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 4328699430517492252L;
	
	/** 名称 */
	private String name;
	
	/** 描述 */
	private String description;
	
	/** 排序 */
	private Integer sequence;
	
	/** 1表示默认选中 */
	private Boolean defaultValue = false;
	
	@Column(length = 50, unique = true, nullable = false)
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
	
	@Column(name = "`default`")
	public Boolean getDefaultValue() {
		return defaultValue;
	}
	
	public void setDefaultValue(Boolean defaultValue) {
		this.defaultValue = defaultValue;
	}
	
}
