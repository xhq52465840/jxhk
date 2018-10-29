package com.usky.sms.safetyreview.inst;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.safetyreview.EnumMethanolStatus;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.user.UserDO;

/**
 * 评审表实例
 */
@Entity
@Table(name = "T_METHANOL_INST")
@Comment("评审表实例")
public class MethanolInstDO extends AbstractBaseDO implements Comparable<MethanolInstDO>{

	private static final long serialVersionUID = -420526521797815963L;
	
	/** 评审年份 */
	private Integer year;
	
	/** 评审季度(1,2,3,4) */
	private Integer season;

	/** 总分(默认0.0) */
	private Double score = 0.0;

	/** 状态(新建、待审核、完成、关闭) */
	private String status = EnumMethanolStatus.NEW.toString();

	/** 安检机构 */
	private UnitDO unit;
	
	/** 创建人 */
	private UserDO creator;
	
	/** 备注 */
	private String remark;
	
	/** 是否延期 */
	private boolean delay = false;
	
	/** 评审小组成员 */
	private String reviewer;
	
	@Column(nullable = false)
	@Comment("评审年份")
	public Integer getYear() {
		return year;
	}

	public void setYear(Integer year) {
		this.year = year;
	}

	@Column(nullable = false)
	@Comment("评审季度(1,2,3,4)")
	public Integer getSeason() {
		return season;
	}

	public void setSeason(Integer season) {
		this.season = season;
	}
	
	@Column(nullable = false)
	public Double getScore() {
		return score;
	}

	public void setScore(Double score) {
		this.score = score;
	}

	@Column(length = 20)
	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	@ManyToOne
	@JoinColumn(name = "UNIT_ID")
	@Comment("安检机构")
	public UnitDO getUnit() {
		return unit;
	}

	public void setUnit(UnitDO unit) {
		this.unit = unit;
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

	@Comment("备注")
	public String getRemark() {
		return remark;
	}

	public void setRemark(String remark) {
		this.remark = remark;
	}
	
	@Column(name = "DELAY", columnDefinition = "NUMBER(1) DEFAULT 0")
	public boolean isDelay() {
		return delay;
	}

	public void setDelay(boolean delay) {
		this.delay = delay;
	}

	@Column(name = "REVIEWER")
	@Comment("评审小组成员")
	public String getReviewer() {
		return reviewer;
	}

	public void setReviewer(String reviewer) {
		this.reviewer = reviewer;
	}

	@Override
	public int compareTo(MethanolInstDO o) {
		return this.getId().compareTo(o.getId());
	}
}
