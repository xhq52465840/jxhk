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
@Table(name = "T_PERSPECTIVES")
@Comment("风险矩阵观察视角")
public class PerspectivesDO extends AbstractBaseDO implements IDisplayable {	

	private static final long serialVersionUID = 728022839644751759L;

	/** 角度描述 */
	private String title;
	
	/** 风险矩阵 */
	private MatrixDO matrix;
	
	@Column(length = 255)
	@Comment("角度描述")
	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
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
		return this.getTitle();
	}	
}
