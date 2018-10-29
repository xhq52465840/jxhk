
package com.usky.sms.menu;
import org.hibernate.cfg.Comment;

import java.util.Locale;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.http.session.SessionContext;

@Entity
@Table(name = "T_MENU")
@Comment("菜单")
public class MenuDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 6023199871436952544L;
	
	/** 名称 */
	private String name;
	
	/** 英文名称 */
	private String nameEn;
	
	/** url */
	private String url;
	
	/** 类型(NAV,SYS,USER,USER等) */
	private String type;
	
	/** 父菜单 */
	private MenuDO parent;
	
	/** 权重(排序) */
	private Integer weight;
	
	@Column(length = 50)
	@Comment("名称")
	public String getName() {
		if (Locale.ENGLISH.getLanguage().equals((String) SessionContext.getAttribute("locale"))) {
			return nameEn;
		} else {
			return name;
		}
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	@Column(name = "NAME_EN")
	@Comment("英文名称")
	public String getNameEn() {
		return nameEn;
	}

	public void setNameEn(String nameEn) {
		this.nameEn = nameEn;
	}

	@Column(length = 255)
	@Comment("url")
	public String getUrl() {
		return url;
	}
	
	public void setUrl(String url) {
		this.url = url;
	}
	
	@Column(length = 50)
	@Comment("类型(NAV,SYS,USER,USER等)")
	public String getType() {
		return type;
	}
	
	public void setType(String type) {
		this.type = type;
	}
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "parent")
	@Comment("父菜单")
	public MenuDO getParent() {
		return parent;
	}
	
	public void setParent(MenuDO parent) {
		this.parent = parent;
	}
	
	@Column
	@Comment("权重(排序)")
	public Integer getWeight() {
		return weight;
	}
	
	public void setWeight(Integer weight) {
		this.weight = weight;
	}
	
}
