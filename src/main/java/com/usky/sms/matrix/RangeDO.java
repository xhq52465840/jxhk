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
@Table(name = "T_RANGE")
@Comment("风险矩阵范围间隔")
public class RangeDO extends AbstractBaseDO implements IDisplayable {

	private static final long serialVersionUID = -5488057015006313597L;

	/** 分值 */
	private String source;
	
	/** 风格，是数字还是字母char：digit	 */
	private String style;
	
	/** 类型，可能性还是严重性 */
	private String type;
	
	/** 主表 */
	private MatrixDO matrix;
	
	@Column(length = 20)
	@Comment("分值")
	public String getSource() {
		return source;
	}
	
	public void setSource(String source) {
		this.source = source;
	}

	@Column(length = 20)
	@Comment("风格，是数字还是字母char：digit")
	public String getStyle() {
		return style;
	}

	public void setStyle(String style) {
		this.style = style;
	}	
	
	@Column(length = 20)
	@Comment("类型，可能性还是严重性")
	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
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
		return this.getSource();
	}
}
