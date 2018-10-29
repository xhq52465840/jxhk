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
@Table(name = "T_AIDS")
@Comment("风险矩阵决策帮助")
public class AidsDO extends AbstractBaseDO implements IDisplayable {

	private static final long serialVersionUID = 4697766463432124732L;
	
	/** 可能性严重性 */
	private RangeDO range;

	/** 观察视角 */
	private PerspectivesDO perspectives;

	/** 描述  */
	private String description;
	
	/** 主表 */
	private MatrixDO matrix;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "`range`")
	@Comment("可能性严重性")
	public RangeDO getRange() {
		return range;
	}

	public void setRange(RangeDO range) {
		this.range = range;
	}
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "perspectives")
	@Comment("观察视角")
	public PerspectivesDO getPerspectives() {
		return perspectives;
	}

	public void setPerspectives(PerspectivesDO perspectives) {
		this.perspectives = perspectives;
	}

	@Column(length = 20)
	@Comment("描述")
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "matrix")
	@Comment("主表")
	public MatrixDO getMatrix() {
		return matrix;
	}

	public void setMatrix(MatrixDO matrix) {
		this.matrix = matrix;
	}
	
	@Override
	@Transient
	public String getDisplayName() {
		return this.getDescription();
	}
}
