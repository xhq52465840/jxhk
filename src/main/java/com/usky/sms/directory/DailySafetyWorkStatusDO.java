package com.usky.sms.directory;

import org.hibernate.cfg.Comment;
import java.util.Date;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;
import com.usky.sms.file.FileDO;
import com.usky.sms.safetyreview.AssessmentCommentDO;
import com.usky.sms.safetyreview.EnumDailySafetyWorkStatus;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.user.UserDO;

/**
 * 日常安全工作情况
 *
 */
@Entity
@Table(name = "T_DAILY_SAFETY_WORK_STATUS")
public class DailySafetyWorkStatusDO extends AbstractBaseDO implements IDisplayable {

	private static final long serialVersionUID = -5369362333725464385L;
	
	/** 所属目录 */
	private DirectoryDO directory;
	
	/** 创建者 */
	private UserDO creator;
	
	/** 描述 */
	private String description;
	
	/** 状态(已发布、未发布,默认未发布) */
	private String status = EnumDailySafetyWorkStatus.UN_RELEASE.toString();
	
	/** 发布时间 */
	private Date releaseDate;
	
	/** 年份 */
	private Integer year;
	
	/** 季度(1,2,3,4) */
	private Integer season;

	/** 安监机构 */
	private UnitDO unit;
	
	/** 考核内容 */
	private AssessmentCommentDO assessmentComment;
	
	/** 下属附件 */
	private List<FileDO> attachments;

	/**
	 * @return the directory
	 */
	@ManyToOne
	@JoinColumn(name = "DIRECTORY_ID")
	@Comment("所属目录")
	public DirectoryDO getDirectory() {
		return directory;
	}

	/**
	 * @param directory the directory to set
	 */
	public void setDirectory(DirectoryDO directory) {
		this.directory = directory;
	}

	@ManyToOne
	@JoinColumn(name = "creator")
	@Comment("创建者")
	public UserDO getCreator() {
		return creator;
	}

	public void setCreator(UserDO creator) {
		this.creator = creator;
	}

	@Column(length=4000)
	@Comment("描述")
	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}


	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	@Column(name = "RELEASE_DATE", columnDefinition = "DATE")
	@Comment("发布时间")
	public Date getReleaseDate() {
		return releaseDate;
	}

	public void setReleaseDate(Date releaseDate) {
		this.releaseDate = releaseDate;
	}

	@Column(name = "YEAR")
	@Comment("年份")
	public Integer getYear() {
		return year;
	}

	public void setYear(Integer year) {
		this.year = year;
	}

	@Column(name = "SEASON")
	@Comment("季度(1,2,3,4)")
	public Integer getSeason() {
		return season;
	}

	public void setSeason(Integer season) {
		this.season = season;
	}

	/**
	 * @return the unit
	 */
	@ManyToOne
	@JoinColumn(name = "UNIT_ID")
	@Comment("安监机构")
	public UnitDO getUnit() {
		return unit;
	}

	/**
	 * @param unit
	 *            the unit to set
	 */
	public void setUnit(UnitDO unit) {
		this.unit = unit;
	}

	/**
	 * @return the assessmentCommentDO
	 */
	@ManyToOne
	@JoinColumn(name="ASSESSMENTCOMMENT_ID")
	@Comment("考核内容")
	public AssessmentCommentDO getAssessmentComment() {
		return assessmentComment;
	}

	/**
	 * @param assessmentComment the assessmentComment to set
	 */
	public void setAssessmentComment(AssessmentCommentDO assessmentComment) {
		this.assessmentComment = assessmentComment;
	}

	/**
	 * @return the attachments
	 */
	@Transient
	@Comment("下属附件")
	public List<FileDO> getAttachments() {
		return attachments;
	}

	/**
	 * @param attachments the attachments to set
	 */
	public void setAttachments(List<FileDO> attachments) {
		this.attachments = attachments;
	}

	@Override
	@Transient
	public String getDisplayName() {
		return this.getUnit().getDisplayName();
	}

}
