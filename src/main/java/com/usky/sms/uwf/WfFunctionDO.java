package com.usky.sms.uwf;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.comm.Utility;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;

@Entity
@Table(name = "T_WF_FUNCTION")
@Comment("工作流插件功能")
public class WfFunctionDO  extends AbstractBaseDO implements IDisplayable {
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	/** 名称 */
	private String name;
	
	/** 页面显示名称 */
	private String show_name;
	
	/** 类型(选人、结果处理、校验条件、触发条件) */
	private String type;
	
	/** 描述 */
	private String description;
	
	/** 对应的uui的组件 */
	private String umodule;
	
	/** 是否激活状态(Y) */
	private String active;
	
	/** 调用的方法(全路径) */
	private String call_func;
	
	/** 备注 */
	private String remark;
	
	@Column(length = 1)
	@Comment("是否激活状态(Y)")
	public String getActive() {
		return active;
	}

	public void setActive(String active) {
		if (Utility.IsEmpty(active))
			active = "Y";
		this.active = active;
	}

	@Column(length = 500)
	@Comment("对应的uui的组件")
	public String getUmodule() {
		return umodule;
	}

	public void setUmodule(String umodule) {
		this.umodule = umodule;
	}
	
	@Column(length = 50, nullable = false)
	@Comment("名称")
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@Column(length = 200, nullable = false, unique = true)
	@Comment("页面显示名称")
	public String getShowName() {
		return show_name;
	}

	public void setShowName(String show_name) {
		this.show_name = show_name;
	}

	@Column(length = 50, nullable = false)
	@Comment("类型(选人、结果处理、校验条件、触发条件)")
	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	@Column(length = 255)
	@Comment("描述")
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}
	
	@Column(length = 500)
	@Comment("调用的方法(全路径)")
	public String getCallFunc() {
		return call_func;
	}

	public void setCallFunc(String call) {
		this.call_func = call;
	}

	@Column(length = 500)
	@Comment("备注")
	public String getRemark() {
		return remark;
	}

	public void setRemark(String remark) {
		this.remark = remark;
	}

	@Override
	@Transient
	public String getDisplayName() {
		return this.getName();
	}	
}
