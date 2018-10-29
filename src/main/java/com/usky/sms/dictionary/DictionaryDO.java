
package com.usky.sms.dictionary;
import org.hibernate.cfg.Comment;

import java.util.Locale;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;
import com.usky.sms.http.session.SessionContext;

@Entity
@Table(name = "T_DICTIONARY")
@Comment("数据字典")
public class DictionaryDO extends AbstractBaseDO implements IDisplayable {
	
	private static final long serialVersionUID = -6257828090747108684L;
	
	/** 过滤参数 **/
	private String name;
	
	/** key值 **/
	private String key;
	
	/** 实际值 **/
	private String value;
	
	/** 类型 **/
	private String type;
	
	/** 标识 **/
	private String sign;
	
	/** 更新人 **/
	private String updateBy;
	
	/** 英文名称 */
	private String nameEn;
	
	/** 过滤参数 **/
	private String nameByLanguage;
		
	@Transient
	@Comment("过滤参数")
	public String getNameByLanguage() {
		if (Locale.ENGLISH.getLanguage().equals((String) SessionContext.getAttribute("locale"))) {
			return nameEn == null ? name : nameEn;
		} else {
			return name;
		}
	}
	
	@Column(length = 50)
	@Comment("过滤参数")
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	@Column(name = "`key`", length = 50)
	@Comment("key值")
	public String getKey() {
		return key;
	}
	
	public void setKey(String key) {
		this.key = key;
	}
	
	@Column(length = 50)
	@Comment("实际值")
	public String getValue() {
		return value;
	}
	
	public void setValue(String value) {
		this.value = value;
	}
	
	@Column(length = 10)
	@Comment("类型")
	public String getType() {
		return type;
	}
	
	public void setType(String type) {
		this.type = type;
	}
	
	@Column(length = 10)
	@Comment("标识")
	public String getSign() {
		return sign;
	}
	
	public void setSign(String sign) {
		this.sign = sign;
	}
	
	@Column(name = "update_by", length = 50)
	@Comment("更新人")
	public String getUpdateBy() {
		return updateBy;
	}
	
	public void setUpdateBy(String updateBy) {
		this.updateBy = updateBy;
	}
	
	@Column(name = "NAME_EN")
	@Comment("英文名称")
	public String getNameEn() {
		return nameEn;
	}

	public void setNameEn(String nameEn) {
		this.nameEn = nameEn;
	}
	
	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (null == obj) {
			return false;
		}
		if (!(obj instanceof DictionaryDO)) {
			return false;
		}
		final DictionaryDO dic = (DictionaryDO) obj;
		if (this.getId().equals(dic.getId())) {
			return true;
		}
		return false;
	}

	@Override
	public int hashCode() {
		return this.getId().hashCode();
	}
	
	@Override
	@Transient
	public String getDisplayName() {
		return this.getNameByLanguage();
	}
	
}
