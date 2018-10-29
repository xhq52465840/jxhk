
package com.usky.sms.unit;
import org.hibernate.cfg.Comment;

import java.util.Locale;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.avatar.AvatarDO;
import com.usky.sms.core.AbstractHistorizableBaseDO;
import com.usky.sms.core.IDisplayable;
import com.usky.sms.http.session.SessionContext;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "T_UNIT")
@Comment("安监机构")
public class UnitDO extends AbstractHistorizableBaseDO implements IDisplayable {
	
	private static final long serialVersionUID = 1170792674745345253L;
	
	/** 名称 */
	private String name;
	
	/** 英文名称 */
	private String nameEn;
	
	/** 机构代码 */
	private String code;
	
	/** 描述 */
	private String description;
	
	/** 机构头像 */
	private AvatarDO avatar;
	
	/** 机构类别 */
	private UnitCategoryDO category;
	
	/** 责任人 */
	private UserDO responsibleUser;
	
	/** 此机构下有多少条安全信息 */
	private Integer count;
	
	/** 名称 */
	private String nameByLanguage;
	
	@Transient
	@Comment("名称")
	public String getNameByLanguage() {
		if (Locale.ENGLISH.getLanguage().equals((String) SessionContext.getAttribute("locale"))) {
			return nameEn == null ? name : nameEn;
		} else {
			return name;
		}
	}
	
	@Column(length = 50, nullable = false)
	@Comment("名称")
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}
	
	@Column(length = 50, nullable = false)
	@Comment("机构代码")
	public String getCode() {
		return code;
	}
	
	public void setCode(String code) {
		this.code = code;
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
	@JoinColumn(name = "AVATAR_ID")
	@Comment("机构头像")
	public AvatarDO getAvatar() {
		return avatar;
	}
	
	public void setAvatar(AvatarDO avatar) {
		this.avatar = avatar;
	}
	
	@ManyToOne
	@JoinColumn(name = "CATEGORY_ID")
	@Comment("机构类别")
	public UnitCategoryDO getCategory() {
		return category;
	}
	
	public void setCategory(UnitCategoryDO category) {
		this.category = category;
	}
	
	@ManyToOne
	@JoinColumn(name = "responsible_user")
	@Comment("责任人")
	public UserDO getResponsibleUser() {
		return responsibleUser;
	}
	
	public void setResponsibleUser(UserDO responsibleUser) {
		this.responsibleUser = responsibleUser;
	}
	
	@Column
	@Comment("此机构下有多少条安全信息")
	public Integer getCount() {
		return count;
	}
	
	public void setCount(Integer count) {
		this.count = count;
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
		if (!(obj instanceof UnitDO)) {
			return false;
		}
		final UnitDO unit = (UnitDO) obj;
		if (this.getId().equals(unit.getId())) {
			return true;
		}
		return false;
	}

	@Override
	public int hashCode() {
		return this.getId().hashCode();
	}
	
	@Transient
	@Override
	public String getDisplayName() {
		return this.getName();
	}
	
}
