package com.usky.sms.tem.consequence;

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
import com.usky.sms.tem.insecurity.InsecurityDO;
import com.usky.sms.user.UserDO;

/**
 * 重大风险
 * @author Administrator
 *
 */
@Entity
@Table(name = "T_CONSEQUENCE")
@Comment("重大风险")
public class ConsequenceDO extends AbstractBaseDO {

	private static final long serialVersionUID = -6122057432666504943L;
	
	/** 编号 */
	private String num;
	
	/** 名称 */
	private String name;
	
	/** 备注 */
	private String comment;
	
	/** 不安全状态 */
	private Set<InsecurityDO> insecuritys;
	
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
	@JoinTable(name = "T_CONSEQUENCE_INSECURITY", joinColumns = @JoinColumn(name = "consequence_id"), inverseJoinColumns = @JoinColumn(name = "insecurity_id"))
	@Comment("不安全状态")
	public Set<InsecurityDO> getInsecuritys() {
		return insecuritys;
	}

	public void setInsecuritys(Set<InsecurityDO> insecuritys) {
		this.insecuritys = insecuritys;
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
