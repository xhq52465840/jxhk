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
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "T_MATRIX")
@Comment("风险矩阵")
public class MatrixDO extends AbstractBaseDO implements IDisplayable {

	private static final long serialVersionUID = -7717362468430316603L;

	/** 名称 */
	private String name;

	/** 描述 */
	private String description;
	
	/** 状态 启用禁用 */
	private String status;
	
	/** 是否发布 */
	private String publish;
		
	/** 创建人 */
	private UserDO creator;
	
	/** 最后更新人 */
	private UserDO lastUpdater;
	
	@Column(length = 50)
	@Comment("名称")
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
	
	@Column(length = 2000)
	@Comment("描述")
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}
	
	@Column(length = 20)
	@Comment("状态 启用禁用")
	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}
		
	@Column(length = 20)
	@Comment("是否发布")
	public String getPublish() {
		return publish;
	}

	public void setPublish(String publish) {
		this.publish = publish;
	}

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "creator")
	@Comment("创建人")
	public UserDO getCreator() {
		return creator;
	}

	public void setCreator(UserDO creator) {
		this.creator = creator;
	}
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "last_updater")
	@Comment("最后更新人")
	public UserDO getLastUpdater() {
		return lastUpdater;
	}

	public void setLastUpdater(UserDO lastUpdater) {
		this.lastUpdater = lastUpdater;
	}

	@Override
	@Transient
	public String getDisplayName() {
		return this.getName();
	}	
}
