package com.usky.sms.tem.insecurity;

import org.hibernate.cfg.Comment;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.tem.consequence.ConsequenceDO;
import com.usky.sms.tem.error.ErrorDO;
import com.usky.sms.tem.threat.ThreatDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "T_INSECURITY")
@Comment("不安全状态")
public class InsecurityDO extends AbstractBaseDO {

	private static final long serialVersionUID = 49587860083145778L;
	
	/** 编号 */
	private String num;
	
	/** 名称 */
	private String name;
	
	/** 备注 */
	private String comment;
	
	/** 重大风险（后果） */
	private Set<ConsequenceDO> consequences;
	
	/** 威胁 */
	private Set<ThreatDO> threats;
	
	/** 差错 */
	private Set<ErrorDO> errors;
	
	/** 系统分类 */
	private DictionaryDO system;
	
	/** 创建人 */
	private UserDO creator;
	
	/** 最后更新人 */
	private UserDO lastUpdater;
	
	@Column(name = "NUM", length = 100)
	@Comment("编号")
	public String getNum() {
		return num;
	}

	public void setNum(String num) {
		this.num = num;
	}

	@Column(name = "`name`", length = 255)
	@Comment("名称")
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@Column(name = "`comment`", length = 2000)
	@Comment("备注")
	public String getComment() {
		return comment;
	}

	public void setComment(String comment) {
		this.comment = comment;
	}

	@ManyToMany
	@JoinTable(name = "T_CONSEQUENCE_INSECURITY", joinColumns = @JoinColumn(name = "insecurity_id"), inverseJoinColumns = @JoinColumn(name = "consequence_id"))
	@Comment("重大风险（后果）")
	public Set<ConsequenceDO> getConsequences() {
		return consequences;
	}

	public void setConsequences(Set<ConsequenceDO> consequences) {
		this.consequences = consequences;
	}

	@ManyToMany
	@JoinTable(name = "T_THREAT_INSECURITY", joinColumns = @JoinColumn(name = "insecurity_id"), inverseJoinColumns = @JoinColumn(name = "threat_id"))
	@Comment("威胁")
	public Set<ThreatDO> getThreats() {
		return threats;
	}

	public void setThreats(Set<ThreatDO> threats) {
		this.threats = threats;
	}

	@ManyToMany
	@JoinTable(name = "T_ERROR_INSECURITY", joinColumns = @JoinColumn(name = "insecurity_id"), inverseJoinColumns = @JoinColumn(name = "error_id"))
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

	@ManyToOne
	@JoinColumn(name = "SYSTEM_ID")
	@Comment("系统分类")
	public DictionaryDO getSystem() {
		return system;
	}

	public void setSystem(DictionaryDO system) {
		this.system = system;
	}

}
