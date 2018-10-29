
package com.usky.sms.entity;
import org.hibernate.cfg.Comment;

import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_TABLE")
@Comment("无用表")
public class EntityDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 4346002415574125900L;
	/** 名称 */
	private String name;
	
	/** 字段 */
	private List<EntityFieldDO> fields;
	
	@Column(length = 50)
	@Comment("名称")
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	@OneToMany(mappedBy = "entity")
	@Comment("字段")
	public List<EntityFieldDO> getFields() {
		return fields;
	}
	
	public void setFields(List<EntityFieldDO> fields) {
		this.fields = fields;
	}
	
}
