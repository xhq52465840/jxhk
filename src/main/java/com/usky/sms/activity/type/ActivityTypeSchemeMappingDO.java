
package com.usky.sms.activity.type;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_ACTIVITY_TYPE_SCHEME_MAPPING")
@Comment("安全信息类型方案和类型关系表")
public class ActivityTypeSchemeMappingDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 7737200804316995697L;
	
	/** 安全信息类型方案主键 */
	private ActivityTypeSchemeDO scheme;
	
	/** 安全信息类型主键 */
	private ActivityTypeDO type;
	
	/** 排序 */
	private Integer typeOrder;
	
	@ManyToOne
	@JoinColumn(name = "SCHEME_ID")
	@Comment("安全信息类型方案主键")
	public ActivityTypeSchemeDO getScheme() {
		return scheme;
	}
	
	public void setScheme(ActivityTypeSchemeDO scheme) {
		this.scheme = scheme;
	}
	
	@ManyToOne
	@JoinColumn(name = "TYPE_ID")
	@Comment("安全信息类型主键")
	public ActivityTypeDO getType() {
		return type;
	}
	
	public void setType(ActivityTypeDO type) {
		this.type = type;
	}
	
	@Column(name = "type_order")
	@Comment("排序")
	public Integer getTypeOrder() {
		return typeOrder;
	}
	
	public void setTypeOrder(Integer typeOrder) {
		this.typeOrder = typeOrder;
	}
	
}
