package com.usky.sms.dashboard;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_GADGET_INS_PARAM")
@Comment("看板参数配置")
public class GadgetInsParamDO extends AbstractBaseDO {

	private static final long serialVersionUID = 7481736433064269293L;

	/** 每个页面（tab页）的路径 **/
	private String url; 

	/** 过滤参数 **/
	private String filterParam; 

	/** 单击参数 **/
	private String clickParam;
	
	/** 描述 **/
	private String description;
	
	/** 参数类型 **/
	private String clickParamType;

	@Column(name = "URL",length = 255)
	@Comment("每个页面（tab页）的路径")
	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	@Column(name = "FILTER_PARAM",length = 4000)
	@Comment("过滤参数")
	public String getFilterParam() {
		return filterParam;
	}

	public void setFilterParam(String filterParam) {
		this.filterParam = filterParam;
	}

	@Column(name = "CLICK_PARAM",length = 4000)
	@Comment("单击参数")
	public String getClickParam() {
		return clickParam;
	}

	public void setClickParam(String clickParam) {
		this.clickParam = clickParam;
	}

	@Column(length = 255)
	@Comment("描述")
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	@Column(name = "CLICK_PARAM_TYPE",length = 255)
	@Comment("参数类型")
	public String getClickParamType() {
		return clickParamType;
	}

	public void setClickParamType(String clickParamType) {
		this.clickParamType = clickParamType;
	}
}
