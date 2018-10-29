
package com.usky.sms.custom;
import org.hibernate.cfg.Comment;

import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.activity.type.ActivityTypeDO;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.unit.UnitDO;

@Entity
@Table(name = "T_CUSTOM_FIELD_CONFIG_SCHEME")
@Comment("自定义字段默认值配置")
public class CustomFieldConfigSchemeDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 7879562244313725397L;
	
	/** 名称 */
	private String name;
	
	/** 描述 */
	private String description;
	
	/** 自定义字段 */
	private CustomFieldDO field;
	
	/** 安全信息类型 */
	private Set<ActivityTypeDO> activityTypes;
	
	/** 安监机构 */
	private Set<UnitDO> units;
	
	/** 是否默认默认值配置 */
	private String type;
	
	/** 自定义字段默认值 */
	private String defaultValue;
	
	@Column(length = 255)
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

	@ManyToOne
	@JoinColumn(name = "FIELD_ID")
	@Comment("自定义字段")
	public CustomFieldDO getField() {
		return field;
	}
	
	public void setField(CustomFieldDO field) {
		this.field = field;
	}

	@ManyToMany
	@JoinTable(name = "T_CFCSCHEME_ATYPE", joinColumns = @JoinColumn(name = "CFCSCHEME_ID"), inverseJoinColumns = @JoinColumn(name = "ACTIVITY_TYPE_ID"))
	@Comment("安全信息类型")
	public Set<ActivityTypeDO> getActivityTypes() {
		return activityTypes;
	}
	
	public void setActivityTypes(Set<ActivityTypeDO> acitivityTypes) {
		this.activityTypes = acitivityTypes;
	}
	
	@ManyToMany
	@JoinTable(name = "T_CFCSCHEME_UNIT", joinColumns = @JoinColumn(name = "CFCSCHEME_ID"), inverseJoinColumns = @JoinColumn(name = "UNIT_ID"))
	@Comment("安监机构")
	public Set<UnitDO> getUnits() {
		return units;
	}
	
	public void setUnits(Set<UnitDO> units) {
		this.units = units;
	}
	
	@Column(length = 50)
	@Comment("是否默认默认值配置")
	public String getType() {
		return type;
	}
	
	public void setType(String type) {
		this.type = type;
	}
	
	@Column(name = "default_value", length = 255)
	@Comment("自定义字段默认值")
	public String getDefaultValue() {
		return defaultValue;
	}
	
	public void setDefaultValue(String defaultValue) {
		this.defaultValue = defaultValue;
	}
	
}
