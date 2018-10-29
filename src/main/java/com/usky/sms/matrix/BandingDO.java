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
@Table(name = "T_BANDING")
@Comment("风险色带")
public class BandingDO extends AbstractBaseDO implements IDisplayable {

	private static final long serialVersionUID = 6491733658664939810L;

	/** 描述 低，中，高 */
	private String title;
	
	/** 色块 */
	private String color;
	
	/** 处理方式 */
	private String handle;
	
	/** 描述 */
	private String description;
	
	/** 风险矩阵 */
	private MatrixDO matrix;
	
	@Column(length = 20)
	@Comment("描述 低，中，高")
	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}
	
	@Column(length = 20)
	@Comment("色块")
	public String getColor() {
		return color;
	}

	public void setColor(String color) {
		this.color = color;
	}
	
	@Column(length = 20)
	@Comment("处理方式")
	public String getHandle() {
		return handle;
	}

	public void setHandle(String handle) {
		this.handle = handle;
	}

	@Column(length = 2000)
	@Comment("描述")
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
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
