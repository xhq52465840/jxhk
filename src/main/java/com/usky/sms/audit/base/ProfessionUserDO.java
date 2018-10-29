package com.usky.sms.audit.base;

import org.hibernate.cfg.Comment;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "A_PROFESSION_USER")
@Comment("专业用户")
public class ProfessionUserDO extends AbstractBaseDO {

	private static final long serialVersionUID = 4296735080477599527L;

	/** 状态 */
	private String status;

	/** 用户 */
	private Set<UserDO> users;

	/** 专业 */
	private DictionaryDO profession;

	/** 创建人 */
	private UserDO creator;

	/** 更新人 */
	private UserDO lastUpdater;

	/** 安监机构 */
	private UnitDO unit;

	@Column(length = 1)
	@Comment("状态")
	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	@OneToMany
	@JoinTable(name = "A_PROFESSION_USER_USER", joinColumns = @JoinColumn(name = "A_PROFESSION_USER_ID"), inverseJoinColumns = @JoinColumn(name = "USER_ID"))
	@Comment("用户")
	public Set<UserDO> getUsers() {
		return users;
	}

	public void setUsers(Set<UserDO> users) {
		this.users = users;
	}

	@OneToOne
	@JoinColumn(name = "PROFESSION_ID")
	@Comment("专业")
	public DictionaryDO getProfession() {
		return profession;
	}

	public void setProfession(DictionaryDO profession) {
		this.profession = profession;
	}

	@ManyToOne
	@JoinColumn(name = "CREATOR_ID")
	@Comment("创建人")
	public UserDO getCreator() {
		return creator;
	}

	public void setCreator(UserDO creator) {
		this.creator = creator;
	}

	@ManyToOne
	@JoinColumn(name = "LASTUPDATER_ID")
	@Comment("更新人")
	public UserDO getLastUpdater() {
		return lastUpdater;
	}

	public void setLastUpdater(UserDO lastUpdater) {
		this.lastUpdater = lastUpdater;
	}

	@ManyToOne
	@JoinColumn(name = "UNIT_ID")
	@Comment("安监机构")
	public UnitDO getUnit() {
		return unit;
	}

	public void setUnit(UnitDO unit) {
		this.unit = unit;
	}

}
