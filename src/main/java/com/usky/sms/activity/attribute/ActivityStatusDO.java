
package com.usky.sms.activity.attribute;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_ACTIVITY_STATUS")
@Comment("安全信息状态")
public class ActivityStatusDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -9074490655969456034L;
	
	/** 名称 */
	private String name;
	
	/** 描述 */
	private String description;
	
	/** 分类 */
	private String category;
	
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
	
	@Column(length = 50)
	@Comment("分类")
	public String getCategory() {
		return category;
	}
	
	public void setCategory(String category) {
		this.category = category;
	}
	
}
