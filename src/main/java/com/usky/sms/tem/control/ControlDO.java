package com.usky.sms.tem.control;

import org.hibernate.cfg.Comment;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;
import com.usky.sms.tem.error.ErrorDO;
import com.usky.sms.tem.threat.ThreatDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "T_CONTROL")
@Comment("控制措施")
public class ControlDO extends AbstractBaseDO implements IDisplayable {

	private static final long serialVersionUID = 8661989594406941614L;
	
	/** 编号 */
	private String number;
	
	/** 标题 */
	private String title;
	
	/** 备注 */
	private String comment;
	
	/** 威胁 */
	private Set<ThreatDO> threats;
	
	/** 差错 */
	private Set<ErrorDO> errors;
	
	/** 创建人 */
	private UserDO creator;
	
	/** 最后更新人 */
	private UserDO lastUpdater;

	@Column(name = "`number`", length = 50)
	@Comment("编号")
	public String getNumber() {
		return number;
	}

	public void setNumber(String number) {
		this.number = number;
	}

	@Column(length = 255)
	@Comment("标题")
	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	@Column(name = "`comment`", length = 200)
	@Comment("备注")
	public String getComment() {
		return comment;
	}

	public void setComment(String comment) {
		this.comment = comment;
	}

	@ManyToMany
	@JoinTable(name = "T_CONTROL_THREAT", joinColumns = @JoinColumn(name = "control_id"), inverseJoinColumns = @JoinColumn(name = "threat_id"))
	@Comment("威胁")
	public Set<ThreatDO> getThreats() {
		return threats;
	}

	public void setThreats(Set<ThreatDO> threats) {
		this.threats = threats;
	}

	@ManyToMany
	@JoinTable(name = "T_CONTROL_ERROR", joinColumns = @JoinColumn(name = "control_id"), inverseJoinColumns = @JoinColumn(name = "error_id"))
	@Comment("差错")
	public Set<ErrorDO> getErrors() {
		return errors;
	}

	public void setErrors(Set<ErrorDO> errors) {
		this.errors = errors;
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
	
	@Override
	@Transient
	public String getDisplayName() {
		return this.getNumber()+ "-" + this.getTitle();
	}

}
