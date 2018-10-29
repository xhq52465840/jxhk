package com.usky.sms.losa;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

/**
 * 业务字典表
 */
@Entity
@Table(name = "l_dict_type")
@Comment("LOSA 业务字典表")
public class DictTypeDO extends AbstractBaseDO{

	private static final long serialVersionUID = -1268419487818567936L;
	
	/** 创建人 */
	private Long creator;
	
	/** 更新人 */
	private Long lastModifier;
	
	/** 类型 */
	private String type;
	
	/** 描述 */
	private String typeDescription;
	
	/** 是否有效 */
	private Long validity;
	
	@Column(name = "CREATOR")
	@Comment("创建人")
	public Long getCreator() {
		return creator;
	}

	public void setCreator(Long creator) {
		this.creator = creator;
	}

	@Column(name = "LAST_MODIFIER")
	@Comment("更新人")
	public Long getLastModifier() {
		return lastModifier;
	}

	public void setLastModifier(Long lastModifier) {
		this.lastModifier = lastModifier;
	}

	@Column(name = "TYPE")
	@Comment("类型")
	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	@Column(name = "TYPE_DESCRIPTION")
	@Comment("描述")
	public String getTypeDescription() {
		return typeDescription;
	}

	public void setTypeDescription(String typeDescription) {
		this.typeDescription = typeDescription;
	}

	@Column(name = "VALIDITY")
	@Comment("是否有效")
	public Long getValidity() {
		return validity;
	}

	public void setValidity(Long validity) {
		this.validity = validity;
	}

}
