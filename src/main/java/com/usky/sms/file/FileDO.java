package com.usky.sms.file;

import org.hibernate.cfg.Comment;
import java.util.Date;

import javax.persistence.Basic;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.Transient;

import org.springframework.beans.factory.annotation.Required;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;
import com.usky.sms.directory.DirectoryDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "T_FILE")
@Comment("附件")
public class FileDO extends AbstractBaseDO implements IDisplayable {

	private static final long serialVersionUID = -3578387885551223137L;

	/** 客户端显示的文件名  */
	private String fileName;

	/** 类型  */
	private String type;

	/** 服务器端文件的相对对路径(带文件名) */
	private String relativePath;

	/** 标签  */
	private String tag;

	/**
	 * 文件的容量大小： 超过1M的以MB为单位,超过1K的以KB为单位,否则以B为单位
	 */
	private String size;

	/** 上传者  */
	private UserDO uploadUser;

	/** 上传日期  */
	private Date uploadTime;

	/** 目录  */
	private DirectoryDO directory;
	
	/** 类别 1：自定义, 2:安全评审， 3:安全信息 */
	private Integer sourceType;
	
	/** 附件来源ID,如：安全信息的activityId，安全评审完成情况的ID */
	private Integer source;
	
	/** 描述  */
	private String description;

	@Comment("客户端显示的文件名")
	public String getFileName() {
		return fileName;
	}

	public void setFileName(String fileName) {
		this.fileName = fileName;
	}

	@Column(name = "`TYPE`")
	@Comment("类型")
	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	@Column(length = 2000)
	@Comment("服务器端文件的相对对路径(带文件名)")
	public String getRelativePath() {
		return relativePath;
	}

	public void setRelativePath(String relativePath) {
		this.relativePath = relativePath;
	}

	@ManyToOne
	@JoinColumn(name = "UPLOAD_USER")
	@Comment("上传者")
	public UserDO getUploadUser() {
		return uploadUser;
	}

	public void setUploadUser(UserDO uploadUser) {
		this.uploadUser = uploadUser;
	}

	@Basic
	@Column(columnDefinition = "DATE")
	@Temporal(TemporalType.TIMESTAMP)
	@Comment("上传日期")
	public Date getUploadTime() {
		return uploadTime;
	}

	public void setUploadTime(Date uploadTime) {
		this.uploadTime = uploadTime;
	}

	@ManyToOne
	@JoinColumn(name = "DIRECTORY_ID")
	@Comment("目录")
	public DirectoryDO getDirectory() {
		return directory;
	}

	public void setDirectory(DirectoryDO directory) {
		this.directory = directory;
	}

	@Comment("标签")
	public String getTag() {
		return tag;
	}

	public void setTag(String tag) {
		this.tag = tag;
	}

	/**
	 * @return the size
	 */
	@Column(name = "`SIZE`")
	@Comment("文件的容量大小： 超过1M的以MB为单位,超过1K的以KB为单位,否则以B为单位")
	public String getSize() {
		return size;
	}

	/**
	 * @param size
	 *            the size to set
	 */
	public void setSize(String size) {
		this.size = size;
	}

	/**
	 * @return the sourceType
	 */
	@Required
	@Comment("类别 1：自定义, 2:安全评审， 3:安全信息")
	public Integer getSourceType() {
		return sourceType;
	}

	/**
	 * @param sourceType the sourceType to set
	 */
	public void setSourceType(Integer sourceType) {
		this.sourceType = sourceType;
	}

	/**
	 * @return the source
	 */
	@Comment("附件来源ID,如：安全信息的activityId，安全评审完成情况的ID")
	public Integer getSource() {
		return source;
	}

	/**
	 * @param source the source to set
	 */
	public void setSource(Integer source) {
		this.source = source;
	}
	
	@Column(length = 4000)
	@Comment("描述")
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	@Override
	@Transient
	public String getDisplayName() {
		return this.getFileName();
	}

}
