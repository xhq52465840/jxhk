
package com.usky.sms.field.screen;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_FIELD_SCREEN_SCHEME_ITEM")
@Comment("界面方案明细")
public class FieldScreenSchemeItemDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 8889808172996528352L;
	
	/** 操作类型MODIFY、CREATE、VIEW */
	private String operation;
	
	/** 界面 */
	private FieldScreenDO screen;
	
	/** 界面方案 */
	private FieldScreenSchemeDO scheme;
	
	@Column(length = 20)
	@Comment("操作类型MODIFY、CREATE、VIEW")
	public String getOperation() {
		return operation;
	}
	
	public void setOperation(String operation) {
		this.operation = operation;
	}
	
	@ManyToOne
	@JoinColumn(name = "SCREEN_ID")
	@Comment("界面")
	public FieldScreenDO getScreen() {
		return screen;
	}
	
	public void setScreen(FieldScreenDO screen) {
		this.screen = screen;
	}
	
	@ManyToOne
	@JoinColumn(name = "SCHEME_ID")
	@Comment("界面方案")
	public FieldScreenSchemeDO getScheme() {
		return scheme;
	}
	
	public void setScheme(FieldScreenSchemeDO scheme) {
		this.scheme = scheme;
	}
	
}
