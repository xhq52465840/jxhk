package com.usky.sms.tem.severity;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.user.UserDO;

/**
 * 条款
 */
@Entity
@Table(name = "T_PROVISION")
@Comment("条款")
public class ProvisionDO extends AbstractBaseDO {

	private static final long serialVersionUID = 5858702531337497686L;
	
	/** 名称 */
	private String name;
	
	/** 分数 */
	private Integer score;
	
	/** 对应的严重程度 */
	private SeverityDO severity;
	
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

	@Column
	@Comment("分数")
	public Integer getScore() {
		return score;
	}

	public void setScore(Integer score) {
		this.score = score;
	}

	@ManyToOne
	@JoinTable(name = "T_SEVERITY_PROVISION", joinColumns = @JoinColumn(name = "provision_id"), inverseJoinColumns = @JoinColumn(name = "severity_id"))
	@Comment("对应的严重程度")
	public SeverityDO getSeverity() {
		return severity;
	}

	public void setSeverity(SeverityDO severity) {
		this.severity = severity;
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
