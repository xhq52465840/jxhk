package com.usky.sms.matrix;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;

@Entity
@Table(name = "T_COEFFICIENT")
@Comment("风险系数")
public class CoefficientDO extends AbstractBaseDO implements IDisplayable {		

	private static final long serialVersionUID = 4596835100646821427L;

	/** 系数 */
	private String score;
	
	/** 色带 */
	private BandingDO banding;
	
	/** 可能性 */
	private String possible;
	
	/** 严重性 */
	private String serious;
	
	/** 风险矩阵 */
	private MatrixDO matrix;
	
	@Column(length = 20)
	@Comment("系数")
	public String getScore() {
		return score;
	}

	public void setScore(String score) {
		this.score = score;
	}
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "banding")
	@Comment("色带")
	public BandingDO getBanding() {
		return banding;
	}

	public void setBanding(BandingDO banding) {
		this.banding = banding;
	}
		
	@Column(length = 10)
	@Comment("可能性")
	public String getPossible() {
		return possible;
	}

	public void setPossible(String possible) {
		this.possible = possible;
	}
	
	@Column(length = 10)
	@Comment("严重性")
	public String getSerious() {
		return serious;
	}

	public void setSerious(String serious) {
		this.serious = serious;
	}

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "matrix")
	@Comment("风险矩阵")
	public MatrixDO getMatrix() {
		return matrix;
	}

	public void setMatrix(MatrixDO matrix) {
		this.matrix = matrix;
	}

	@Override
	@Transient
	public String getDisplayName() {
		return this.getScore();
	}
}
