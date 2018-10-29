package com.usky.sms.safetyreview.inst;

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
 * 分值标准详细实例
 */
@Entity
@Table(name = "T_SCORE_STANDARD_DETAIL_INST")
@Comment("分值标准详细实例")
public class ScoreStandardDetailInstDO extends AbstractBaseDO implements Comparable<ScoreStandardDetailInstDO>, IDisplayable{
	
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
	private ScoreStandardInstDO scoreStandardInst;

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
	@JoinColumn(name = "STANDARD_INST_ID")
	@Fetch(FetchMode.JOIN)
	@Comment("对应的评分标准")
	public ScoreStandardInstDO getScoreStandardInst() {
		return scoreStandardInst;
	}

	public void setScoreStandardInst(ScoreStandardInstDO scoreStandardInst) {
		this.scoreStandardInst = scoreStandardInst;
	}

	@Override
	public int compareTo(ScoreStandardDetailInstDO o) {
		// 按左区间的升序进行排序
		return this.getLeftInterval().compareTo(o.getLeftInterval());
	}
	
	@Override
	@Transient
	public String getDisplayName() {
		return this.getExpression();
	}
}
