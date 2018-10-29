
package com.usky.sms.custom;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;

@Entity
@Table(name = "T_CUSTOM_FIELD")
@Comment("自定义字段")
public class CustomFieldDO extends AbstractBaseDO implements IDisplayable {
	
	private static final long serialVersionUID = 4439024249544945411L;
	
	/** 名称 */
	private String name;
	
	/** 描述 */
	private String description;
	
	/** 字段类型 */
	private CustomFieldTypeDO type;
	
	/** 配置 */
	private String config;
	
	/** 是否能作为搜索条件进行搜索 */
	private String searcher;
	
	/** 是否能作为搜索条件进行搜索 */
	private boolean searchable = false;
	
	/** 是否作为安全信息查询的显示列 */
	private boolean display = false;
	
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
	
	@ManyToOne
	@JoinColumn(name = "type")
	@Comment("字段类型")
	public CustomFieldTypeDO getType() {
		return type;
	}
	
	public void setType(CustomFieldTypeDO type) {
		this.type = type;
	}
	
	@Column(length = 255)
	@Comment("配置")
	public String getConfig() {
		return config;
	}
	
	public void setConfig(String config) {
		this.config = config;
	}
	
	@Column(length = 255)
	@Comment("是否能作为搜索条件进行搜索")
	public String getSearcher() {
		return searcher;
	}
	
	public void setSearcher(String searcher) {
		this.searcher = searcher;
	}
	
	@Column(name = "SEARCHABLE", columnDefinition = "NUMBER(1) DEFAULT 0", nullable = false)
	public boolean isSearchable() {
		return searchable;
	}

	public void setSearchable(boolean searchable) {
		this.searchable = searchable;
	}

	@Column(name = "DISPLAY", columnDefinition = "NUMBER(1) DEFAULT 0", nullable = false)
	public boolean isDisplay() {
		return display;
	}

	public void setDisplay(boolean display) {
		this.display = display;
	}

	@Transient
	@Override
	public String getDisplayName() {
		return this.getName();
	}
	
}
