
package com.usky.sms.field.screen;
import org.hibernate.cfg.Comment;

import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.activity.type.ActivityTypeDO;
import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_ATYPE_FSCREEN_SENTITY")
@Comment("安全信息类型与界面方案的关联配置")
public class ActivityTypeFieldScreenSchemeEntityDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 8218774998873011305L;
	
	/** 安全信息类型 */
	private ActivityTypeDO type;
	
	/** 界面方案 */
	private FieldScreenSchemeDO fieldScreenScheme;
	
	/** 安全信息类型界面方案 */
	private ActivityTypeFieldScreenSchemeDO scheme;
	
	@ManyToOne
	@JoinColumn(name = "TYPE_ID")
	@Comment("安全信息类型")
	public ActivityTypeDO getType() {
		return type;
	}
	
	public void setType(ActivityTypeDO type) {
		this.type = type;
	}
	
	@ManyToOne
	@JoinColumn(name = "field_screen_scheme")
	@Comment("安全信息类型界面方案")
	public FieldScreenSchemeDO getFieldScreenScheme() {
		return fieldScreenScheme;
	}
	
	public void setFieldScreenScheme(FieldScreenSchemeDO fieldScreenScheme) {
		this.fieldScreenScheme = fieldScreenScheme;
	}
	
	@ManyToOne
	@JoinColumn(name = "SCHEME_ID")
	public ActivityTypeFieldScreenSchemeDO getScheme() {
		return scheme;
	}
	
	public void setScheme(ActivityTypeFieldScreenSchemeDO scheme) {
		this.scheme = scheme;
	}
	
}
