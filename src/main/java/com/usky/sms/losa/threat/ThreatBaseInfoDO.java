package com.usky.sms.losa.threat;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "L_THREAT_BASEINFO")
@Comment("LOSA")
public class ThreatBaseInfoDO extends AbstractBaseDO{
	
	private static final long serialVersionUID = -4292177726460011753L;
	
	/** 创建人 */
	private Long creator;
	
	/** 更新人 */
	private Long lastModifier;
	
	/** 编号 */
	private String number;
	
	/** 名称 */
	private String name;
	
	/** 父节点 */
	private Integer parentNode;
	
	/** temid */
	private Integer TemId;
	
	@Column(name = "CREATOR")
	@Comment("创建人")
	public Long getCreator() {
		return creator;
	}

	public void setCreator(Long creator) {
		this.creator = creator;
	}

	@Column(name = "LAST_MODIFIER")
	@Comment("更新人")
	public Long getLastModifier() {
		return lastModifier;
	}

	public void setLastModifier(Long lastModifier) {
		this.lastModifier = lastModifier;
	}

	@Column(name = "NUM")
	@Comment("编号")
	public String getNumber() {
		return number;
	}

	public void setNumber(String number) {
		this.number = number;
	}

	@Column(name = "NAME")
	@Comment("名称")
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@Column(name = "PARENT_NODE")
	@Comment("父节点")
	public Integer getParentNode() {
		return parentNode;
	}

	public void setParentNode(Integer parentNode) {
		this.parentNode = parentNode;
	}

	@Column(name = "TEM_ID")
	@Comment("temid")
	public Integer getTemId() {
		return TemId;
	}

	public void setTemId(Integer temId) {
		TemId = temId;
	}

}
