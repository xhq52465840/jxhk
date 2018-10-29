package com.usky.sms.losa;

import org.hibernate.cfg.Comment;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;

@Entity
@Table(name = "L_ATTACHMENT")
@Comment("LOSA 附件")
public class AttachmentDO extends AbstractBaseDO {

	private static final long serialVersionUID = 6340428371677270322L;

	/** 文件上传者ID */
	private Integer creator;

	/** 文件上传者名字 */
	private String creatorName;

	/** 更新人 */
	private Integer lastModifier;

	/** 文件大小 */
	private String attachSize;

	/** 文件显示名称 */
	private String attachShowName;

	/** 观察活动ID */
	private Integer activityId;

	/** 附件类型 */
	private String attachType;

	/** 保存路径 */
	private String attachUrl;

	/** 本地id */
	private Long localId;

	/** 更新时间 */
	private Date updateTime;

	/** 附件在服务器中的名称 */
	private String attachServerName;

	@Column(name = "CREATOR")
	@Comment("文件上传者ID")
	public Integer getCreator() {
		return creator;
	}

	public void setCreator(Integer creator) {
		this.creator = creator;
	}

	@Column(name = "LAST_MODIFIER")
	@Comment("更新人")
	public Integer getLastModifier() {
		return lastModifier;
	}

	public void setLastModifier(Integer lastModifier) {
		this.lastModifier = lastModifier;
	}

	@Column(name = "OBSERVE_ID")
	@Comment("观察活动ID")
	public Integer getActivityId() {
		return activityId;
	}

	@Column(name = "ATTACH_SIZE")
	@Comment("文件大小")
	public String getAttachSize() {
		return attachSize;
	}

	public void setAttachSize(String attachSize) {
		this.attachSize = attachSize;
	}

	@Column(name = "ATTACH_SHOW_NAME")
	@Comment("文件显示名称")
	public String getAttachShowName() {
		return attachShowName;
	}

	public void setAttachShowName(String attachShowName) {
		this.attachShowName = attachShowName;
	}

	public void setActivityId(Integer activityId) {
		this.activityId = activityId;
	}

	@Column(name = "ATTACH_TYPE")
	@Comment("附件类型")
	public String getAttachType() {
		return attachType;
	}

	public void setAttachType(String attachType) {
		this.attachType = attachType;
	}

	@Column(name = "SAVE_PATH")
	@Comment("保存路径")
	public String getAttachUrl() {
		return attachUrl;
	}

	public void setAttachUrl(String attachUrl) {
		this.attachUrl = attachUrl;
	}

	@Column(name = "APP_ID")
	@Comment("本地id")
	public Long getLocalId() {
		return localId;
	}

	public void setLocalId(Long localId) {
		this.localId = localId;
	}

	@Column(name = "UPDATE_TIME")
	@Comment("更新时间")
	public Date getUpdateTime() {
		return updateTime;
	}

	public void setUpdateTime(Date updateTime) {
		this.updateTime = updateTime;
	}

	@Column(name = "CREAT_NAME")
	@Comment("文件上传者名字")
	public String getCreatorName() {
		return creatorName;
	}

	public void setCreatorName(String creatorName) {
		this.creatorName = creatorName;
	}

	@Column(name = "ATTACH_SERVER_NAME")
	@Comment("附件在服务器中的名称")
	public String getAttachServerName() {
		return attachServerName;
	}

	public void setAttachServerName(String attachServerName) {
		this.attachServerName = attachServerName;
	}

}
