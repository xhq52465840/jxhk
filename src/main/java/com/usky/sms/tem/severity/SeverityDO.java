package com.usky.sms.tem.severity;

import org.hibernate.cfg.Comment;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.user.UserDO;

/**
 * 严重程度
 * @author Administrator
 *
 */
@Entity
@Table(name = "T_SEVERITY")
@Comment("严重程度")
public class SeverityDO extends AbstractBaseDO {
	private static final long serialVersionUID = -2272804993925880037L;

	/** 名称 */
	private String name;

	/** 条款 */
	private Set<ProvisionDO> provisions;

	/** 备注 */
	private String comment;

	/** 创建人 */
	private UserDO creator;

	/** 最后更新人 */
	private UserDO lastUpdater;

	@Column(length = 255)
	@Comment("名称")
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@OneToMany(mappedBy = "severity")
	@Comment("条款")
	public Set<ProvisionDO> getProvisions() {
		return provisions;
	}

	public void setProvisions(Set<ProvisionDO> provisions) {
		this.provisions = provisions;
	}

	@Column(name="`comment`", length = 2000)
	@Comment("备注")
	public String getComment() {
		return comment;
	}

	public void setComment(String comment) {
		this.comment = comment;
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
	@Comment("最后更新人")
	public UserDO getLastUpdater() {
		return lastUpdater;
	}

	public void setLastUpdater(UserDO lastUpdater) {
		this.lastUpdater = lastUpdater;
	}

}
