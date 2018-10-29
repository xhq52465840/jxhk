
package com.usky.sms.activity.type;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;

@Entity
@Table(name = "T_ACTIVITY_TYPE_SCHEME")
@Comment("信息类型方案")
public class ActivityTypeSchemeDO extends AbstractBaseDO implements IDisplayable {
	
	private static final long serialVersionUID = 9071982639611398453L;
	
	/** 名称 */
	private String name;
	
	/** 描述 */
	private String description;
	
	/** 默认信息类型主键 */
	private ActivityTypeDO defaultType;
	
	/** 是否系统默认 */
	private String type;
	
	@Column(length = 255, unique = true, nullable = false)
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
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "default_type")
	@Comment("默认信息类型主键")
	public ActivityTypeDO getDefaultType() {
		return defaultType;
	}
	
	public void setDefaultType(ActivityTypeDO defaultType) {
		this.defaultType = defaultType;
	}
	
	@Column(length = 50)
	public String getType() {
		return type;
	}
	
	public void setType(String type) {
		this.type = type;
	}

	@Transient
	@Override
    public String getDisplayName() {
	    return this.getName();
    }
	
}
