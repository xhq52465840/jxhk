
package com.usky.sms.accessinformation;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.dictionary.DictionaryDO;

@Entity
@Table(name = "T_MAINTAIN_TOOL_ENTITY")
@Comment("维护工具")
public class MaintainToolEntityDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -8678941432280684741L;
	
	/** 安全信息主键  **/
	private ActivityDO activity;
	
	/** 维护工具  **/
	private DictionaryDO maintainTool;
	
	/** 描述  **/
	private String description;
	
	@ManyToOne
	@JoinColumn(name = "ACTIVITY_ID")
	@Comment("安全信息主键")
	public ActivityDO getActivity() {
		return activity;
	}
	
	public void setActivity(ActivityDO activity) {
		this.activity = activity;
	}
	
	@ManyToOne
	@JoinColumn(name = "maintain_tool")
	@Comment("维护工具")
	public DictionaryDO getMaintainTool() {
		return maintainTool;
	}
	
	public void setMaintainTool(DictionaryDO maintainTool) {
		this.maintainTool = maintainTool;
	}
	
	@Column(length = 4000)
	@Comment("描述")
	public String getDescription() {
		return description;
	}
	
	public void setDescription(String description) {
		this.description = description;
	}
	
}
