package com.usky.sms.losa.scheme;

import org.hibernate.cfg.Comment;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

/**
 * 审计方案表
 */
@Entity
@Table(name = "l_scheme")
@Comment("LOSA 审计方案表")
public class SchemeDO extends AbstractBaseDO{

	private static final long serialVersionUID = 436768307327529087L;
	
	/** 创建人 */
	private Long creator;
	
	/** 更新人 */
	private Long lastModifier;
	
	/** 方案编号 */
	private String schemeNo;
	
	/** 方案类型 */
	private String schemeType;
	
	/**  */
	private Integer impleUnitId;
	
	/** 方案主题 */
	private String schemeSubject;
	
	/** 开始日期 */
	private Date startDate;
	
	/** 结束日期 */
	private Date endDate;
	
	/** 方案描述 */
	private String schemeDesc;
	
	/** 状态 */
	private String status;

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

	@Column(name = "SCHEME_NO")
	@Comment("方案编号")
	public String getSchemeNo() {
		return schemeNo;
	}

	public void setSchemeNo(String schemeNo) {
		this.schemeNo = schemeNo;
	}

	@Column(name = "SCHEME_TYPE")
	@Comment("方案类型")
	public String getSchemeType() {
		return schemeType;
	}

	public void setSchemeType(String schemeType) {
		this.schemeType = schemeType;
	}

	@Column(name = "IMPLE_UNIT_ID")
	@Comment("")
	public Integer getImpleUnitId() {
		return impleUnitId;
	}

	public void setImpleUnitId(Integer impleUnitId) {
		this.impleUnitId = impleUnitId;
	}

	@Column(name = "SCHEME_SUBJECT")
	@Comment("方案主题")
	public String getSchemeSubject() {
		return schemeSubject;
	}

	public void setSchemeSubject(String schemeSubject) {
		this.schemeSubject = schemeSubject;
	}

	@Column(name = "START_DATE")
	@Comment("开始日期")
	public Date getStartDate() {
		return startDate;
	}

	public void setStartDate(Date startDate) {
		this.startDate = startDate;
	}

	@Column(name = "END_DATE")
	@Comment("结束日期")
	public Date getEndDate() {
		return endDate;
	}

	public void setEndDate(Date endDate) {
		this.endDate = endDate;
	}

	@Column(name = "SCHEME_DESC")
	@Comment("方案描述")
	public String getSchemeDesc() {
		return schemeDesc;
	}

	public void setSchemeDesc(String schemeDesc) {
		this.schemeDesc = schemeDesc;
	}

	@Column(name = "STATUS")
	@Comment("状态")
	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

}
