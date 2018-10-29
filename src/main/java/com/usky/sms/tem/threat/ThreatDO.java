package com.usky.sms.tem.threat;

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
import com.usky.sms.tem.control.ControlDO;
import com.usky.sms.tem.insecurity.InsecurityDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "t_threat")
@Comment("威胁")
public class ThreatDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = 2852368139452780527L;
	
	/** 编号 */
	private String num;
	
	/** 名称 */
	private String name;
	
	/** 一级分类 */
	private String category;
	
	/** 二级分类 */
	private String classification;
	
	/** 备注 */
	private String comment;
	
	/** 对应的不安全状态 */
	private Set<InsecurityDO> insecuritys;
	
	/** 对应的控制措施 */
	private Set<ControlDO> controls;
	
	/** 系统分类 */
	private DictionaryDO system;
	
	/** 风险等级P */
	private Integer riskLevelP;
	
	/** 风险等级S */
	private Integer riskLevelS;
	
	/** 创建人 */
	private UserDO creator;
	
	/** 最后更新人 */
	private UserDO lastUpdater;


	
	@Column(name = "RISK_LEVEL_P")
	@Comment("风险等级P")
	public Integer getRiskLevelP() {
		return riskLevelP;
	}

	public void setRiskLevelP(Integer riskLevelP) {
		this.riskLevelP = riskLevelP;
	}
	
	@Column(name = "RISK_LEVEL_S")
	@Comment("风险等级S")
	public Integer getRiskLevelS() {
		return riskLevelS;
	}

	public void setRiskLevelS(Integer riskLevelS) {
		this.riskLevelS = riskLevelS;
	}

	

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
	
	@Column(length = 50)
	@Comment("一级分类")
	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}
	
	@Column(length = 50)
	@Comment("二级分类")
	public String getClassification() {
		return classification;
	}

	public void setClassification(String classification) {
		this.classification = classification;
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
	@JoinTable(name = "t_threat_insecurity", joinColumns = @JoinColumn(name = "threat_id"), inverseJoinColumns = @JoinColumn(name = "insecurity_id"))
	@Comment("对应的不安全状态")
	public Set<InsecurityDO> getInsecuritys() {
		return insecuritys;
	}

	public void setInsecuritys(Set<InsecurityDO> insecuritys) {
		this.insecuritys = insecuritys;
	}

	@ManyToMany
	@JoinTable(name = "t_control_threat", joinColumns = @JoinColumn(name = "threat_id"), inverseJoinColumns = @JoinColumn(name = "control_id"))
	@Comment("对应的控制措施")
	public Set<ControlDO> getControls() {
		return controls;
	}

	public void setControls(Set<ControlDO> controls) {
		this.controls = controls;
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
	
	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (null == obj) {
			return false;
		}
		if (!(obj instanceof ThreatDO)) {
			return false;
		}
		final ThreatDO threat = (ThreatDO) obj;
		if (this.getId().equals(threat.getId())) {
			return true;
		}
		return false;
	}

	@Override
	public int hashCode() {
		return this.getId().hashCode();
	}
}
