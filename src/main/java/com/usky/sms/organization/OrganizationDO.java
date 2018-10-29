
package com.usky.sms.organization;
import org.hibernate.cfg.Comment;

import java.util.Locale;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.http.session.SessionContext;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "T_ORGANIZATION")
@Comment("组织")
public class OrganizationDO extends AbstractBaseDO implements IDisplayable {
	
	private static final long serialVersionUID = -7205473481848426613L;
	
	/** 名称 */
	private String name;
	
	/** 英文名称 */
	private String nameEn;
	
	/** 描述 */
	private String description;
	
	/** 级别 */
	private String olevel;
	
	/** 父组织 */
	private OrganizationDO parent;
	
	/** 安监机构 */
	private UnitDO unit;
	
	/** 用户 */
	private Set<UserDO> users;
	
	/** 所属系统 */
	private Set<DictionaryDO> systems;
	
	/** 排序 */
	private Integer sortKey;
	
	/** 组织编号 */
	private String deptCode;
	
	/** 组织编号描述 */
	private String deptCodeDesc;
	
	private String nameByLanguage;
	
	@Transient
	@Comment("")
	public String getNameByLanguage() {
		if (Locale.ENGLISH.getLanguage().equals((String) SessionContext.getAttribute("locale"))) {
			return nameEn == null ? name : nameEn;
		} else {
			return name;
		}
	}
	
	@Column(name="`name`", length = 255, nullable = false)
	@Comment("名称")
	public String getName() {
		return name;
	}
	
	public void setName(String name) {
		this.name = name;
	}

	@Column(length = 5)
	@Comment("级别")
	public String getOlevel() {
		return olevel;
	}

	public void setOlevel(String olevel) {
		this.olevel = olevel;
	}

	@Column(length = 255)
	@Comment("描述")
	public String getDescription() {
		return description;
	}
	
	public void setDescription(String description) {
		this.description = description;
	}
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "PARENT_ID")
	@Comment("父组织")
	public OrganizationDO getParent() {
		return parent;
	}
	
	public void setParent(OrganizationDO parent) {
		this.parent = parent;
	}
	
	@ManyToMany(fetch = FetchType.LAZY)
	@JoinTable(name = "T_USER_ORGANIZATION", joinColumns = @JoinColumn(name = "ORGANIZATION_ID"), inverseJoinColumns = @JoinColumn(name = "USER_ID"))
	@Comment("用户")
	public Set<UserDO> getUsers() {
		return users;
	}
	
	public void setUsers(Set<UserDO> users) {
		this.users = users;
	}
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "`unit`")
	@Comment("安监机构")
	public UnitDO getUnit() {
		return unit;
	}

	public void setUnit(UnitDO unit) {
		this.unit = unit;
	}

	/**
	 * @return the systems
	 */
	@ManyToMany
	@JoinTable(name = "T_ORGANIZATION_SYSTEM", joinColumns = @JoinColumn(name = "ORGANIZATION_ID"), inverseJoinColumns = @JoinColumn(name = "SYSTEM_ID"))
	@Comment("所属系统")
	public Set<DictionaryDO> getSystems() {
		return systems;
	}

	/**
	 * @param systems the systems to set
	 */
	public void setSystems(Set<DictionaryDO> systems) {
		this.systems = systems;
	}

	/**
	 * @return the sortKey
	 */
	@Comment("排序")
	public Integer getSortKey() {
		return sortKey;
	}

	/**
	 * @param sortKey the sortKey to set
	 */
	public void setSortKey(Integer sortKey) {
		this.sortKey = sortKey;
	}

	
	@Column(length = 20)
	@Comment("组织编号")
	public String getDeptCode() {
		return deptCode;
	}

	public void setDeptCode(String deptCode) {
		this.deptCode = deptCode;
	}
	
	@Column(length = 50)
	@Comment("组织编号描述")
	public String getDeptCodeDesc() {
		return deptCodeDesc;
	}

	public void setDeptCodeDesc(String deptCodeDesc) {
		this.deptCodeDesc = deptCodeDesc;
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
	@Transient
	public String getDisplayName() {
		return this.getName();
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (null == obj) {
			return false;
		}
		if (!(obj instanceof OrganizationDO)) {
			return false;
		}
		final OrganizationDO organization = (OrganizationDO) obj;
		if (this.getId().equals(organization.getId())) {
			return true;
		}
		return false;
	}

	@Override
	public int hashCode() {
		return this.getId().hashCode();
	}
}
