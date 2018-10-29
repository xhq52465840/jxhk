package com.usky.sms.safetyreview;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;

/**
 * 分值标准详细
 */
@Entity
@Table(name = "T_SCORE_STANDARD_DETAIL")
@Comment("分值标准详细")
public class ScoreStandardDetailDO extends AbstractBaseDO implements Comparable<ScoreStandardDetailDO>, IDisplayable{
	
	private static final long serialVersionUID = -8225411509697649667L;

	/** 左区间 */
	private Integer leftInterval;
	
	/** 右区间 */
	private Integer rightInterval;
	
	/** 数学表达式 */
	private String expression;
	
	/** 描述 */
	private String description;
	
	/** 对应的评分标准 */
	private ScoreStandardDO scoreStandard;

	@Column(name = "LEFT_INTERVAL", nullable = false)
	@Comment("左区间")
	public Integer getLeftInterval() {
		return leftInterval;
	}

	public void setLeftInterval(Integer leftInterval) {
		this.leftInterval = leftInterval;
	}
	
	@Column(name = "RIGHT_INTERVAL")
	@Comment("右区间")
	public Integer getRightInterval() {
		return rightInterval;
	}

	public void setRightInterval(Integer rightInterval) {
		this.rightInterval = rightInterval;
	}

	@Column(name = "EXPRESSION", nullable = false)
	@Comment("数学表达式")
	public String getExpression() {
		return expression;
	}

	public void setExpression(String expression) {
		this.expression = expression;
	}

	@Comment("描述")
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	@ManyToOne
	@JoinColumn(name = "STANDARD_ID")
	@Fetch(FetchMode.JOIN)
	@Comment("对应的评分标准")
	public ScoreStandardDO getScoreStandard() {
		return scoreStandard;
	}

	public void setScoreStandard(ScoreStandardDO scoreStandard) {
		this.scoreStandard = scoreStandard;
	}

	@Override
	// 按左区间的升序进行排序
	public int compareTo(ScoreStandardDetailDO o) {
		return this.getLeftInterval().compareTo(o.getLeftInterval());
	}
	
	@Override
	@Transient
	public String getDisplayName() {
		return this.getDescription();
	}

}
