
package com.usky.sms.unit;
import org.hibernate.cfg.Comment;

import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;

@Entity
@Table(name = "T_UNIT_CATEGORY")
@Comment("安监机构类别")
public class UnitCategoryDO extends AbstractBaseDO implements IDisplayable {
	
	private static final long serialVersionUID = 1491670433427973660L;
	
	/** 名称 */
	private String name;
	
	/** 描述 */
	private String description;
	
	/** 安监机构 */
	private Set<UnitDO> units;
	
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
	
	@OneToMany(mappedBy = "category")
	@Comment("安监机构")
	public Set<UnitDO> getUnits() {
		return units;
	}
	
	public void setUnits(Set<UnitDO> units) {
		this.units = units;
	}
	
	@Transient
	@Override
	public String getDisplayName() {
		return this.getName();
	}
	
}
