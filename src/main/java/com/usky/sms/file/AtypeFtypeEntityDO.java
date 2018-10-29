package com.usky.sms.file;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.activity.type.ActivityTypeDO;
import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "T_ATYPE_FTYPE_ENTITY")
@Comment("安全信息附件类型配置")
public class AtypeFtypeEntityDO extends AbstractBaseDO {

	private static final long serialVersionUID = -3827554604767989698L;

	/** 安全信息类型 */
	private ActivityTypeDO activityType;

	/** 文件类型key */
	private int fileTypeKey;

	/** 文件类型名称 */
	private String fileTypeName;

	/** 默认类型 */
	private String defaultType;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "ACTIVITY_TYPE")
	@Comment("安全信息类型")
	public ActivityTypeDO getActivityType() {
		return activityType;
	}

	public void setActivityType(ActivityTypeDO activityType) {
		this.activityType = activityType;
	}

	@Column(name = "FILE_TYPE_KEY")
	@Comment("文件类型key")
	public int getFileTypeKey() {
		return fileTypeKey;
	}

	public void setFileTypeKey(int fileTypeKey) {
		this.fileTypeKey = fileTypeKey;
	}

	@Column(name = "FILE_TYPE_NAME", length = 50)
	@Comment("文件类型名称")
	public String getFileTypeName() {
		return fileTypeName;
	}

	public void setFileTypeName(String fileTypeName) {
		this.fileTypeName = fileTypeName;
	}

	@Column(name = "DEFAULT_TYPE", length = 10)
	@Comment("默认类型")
	public String getDefaultType() {
		return defaultType;
	}

	public void setDefaultType(String defaultType) {
		this.defaultType = defaultType;
	}

}
