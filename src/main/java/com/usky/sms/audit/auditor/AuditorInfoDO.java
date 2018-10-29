package com.usky.sms.audit.auditor;

import org.hibernate.cfg.Comment;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "A_AUDITOR_INFO")
@Comment("审计员信息")
public class AuditorInfoDO extends AbstractBaseDO {

	private static final long serialVersionUID = -8245571854166046421L;

	/** 个人（职务）、培训记录（内容摘要）、情况记录（名称）、审计情况（备注） */
	private String content; 

	/** 个人（所在单位及部门）、培训记录（培训机构）、情况记录（颁证机构）、审计情况（受审单位） */
	private String department;

	/** 审计情况(专业) */
	private String profession; 

	/** 培训日期 */
	private String eventDate;

	/** 个人（PERSONAL）、培训记录（TRAIN）、情况记录（SITUATION）、审计情况（AUDIT）、风险管理员（RISK）、不安全事件调查员（SAFE），信息管理员（INFO） */
	private String type;

	/** 审计员 */
	private AuditorDO auditor;

	/** 创建人 */
	private UserDO creator;

	/** 更新人 */
	private UserDO updater;
	
	/** 专为培训记录用：开始时间 **/
	private String startDate;
	
	/** 专为培训记录用 ：结束时间**/
	private String endDate;
	
	/** 专为培训记录用：教员  **/
	private String teacher;
	
	/** 专为培训记录用：经理 **/
	private String manager;
	

	@Column(name = "`CONTENT`", length = 200)
	@Comment("个人（职务）、培训记录（内容摘要）、情况记录（名称）、审计情况（备注）")
	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	@Column(length = 200)
	@Comment("个人（所在单位及部门）、培训记录（培训机构）、情况记录（颁证机构）、审计情况（受审单位）")
	public String getDepartment() {
		return department;
	}

	public void setDepartment(String department) {
		this.department = department;
	}

	@Column(length = 200)
	@Comment("审计情况(专业)")
	public String getProfession() {
		return profession;
	}

	public void setProfession(String profession) {
		this.profession = profession;
	}

	@Column(name = "EVENT_DATE", length = 200)
	@Comment("培训日期")
	public String getEventDate() {
		return eventDate;
	}

	public void setEventDate(String eventDate) {
		this.eventDate = eventDate;
	}

	@Column(name = "`TYPE`", length = 50)
	@Comment("个人（PERSONAL）、培训记录（TRAIN）、情况记录（SITUATION）、审计情况（AUDIT）、风险管理员（RISK）、不安全事件调查员（SAFE），信息管理员（INFO）")
	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	@ManyToOne
	@JoinColumn(name = "AUDITOR_ID")
	@Comment("审计员")
	public AuditorDO getAuditor() {
		return auditor;
	}

	public void setAuditor(AuditorDO auditor) {
		this.auditor = auditor;
	}

	@ManyToOne
	@JoinColumn(name = "CREATOR_ID")
	@Comment("创建人")
	public UserDO getCreator() {
		return creator;
	}

	public void setCreator(UserDO creator) {
		this.creator = creator;
	}

	@ManyToOne
	@JoinColumn(name = "UPDATER_ID")
	@Comment("更新人")
	public UserDO getUpdater() {
		return updater;
	}

	public void setUpdater(UserDO updater) {
		this.updater = updater;
	}

	@Column(name = "START_DATE", length = 50)
	@Comment("专为培训记录用：开始时间")
	public String getStartDate() {
		return startDate;
	}

	public void setStartDate(String startDate) {
		this.startDate = startDate;
	}

	@Column(name = "END_DATE", length = 50)
	@Comment("专为培训记录用 ：结束时间")
	public String getEndDate() {
		return endDate;
	}

	public void setEndDate(String endDate) {
		this.endDate = endDate;
	}

	@Column(length = 100)
	@Comment("专为培训记录用：教员")
	public String getTeacher() {
		return teacher;
	}

	public void setTeacher(String teacher) {
		this.teacher = teacher;
	}

	@Column(length = 100)
	@Comment("专为培训记录用：经理")
	public String getManager() {
		return manager;
	}

	public void setManager(String manager) {
		this.manager = manager;
	}

}
