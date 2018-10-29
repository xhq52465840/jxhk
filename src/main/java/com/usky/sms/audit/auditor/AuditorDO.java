package com.usky.sms.audit.auditor;

import org.hibernate.cfg.Comment;
import java.util.Date;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserGroupDO;

@Entity
@Table(name = "A_AUDITOR")
@Comment("审计员")
public class AuditorDO extends AbstractBaseDO {

	private static final long serialVersionUID = 7206304380101648191L;

	/** 对应的用户 */
	private UserDO user;

	/** 对应的用户组 */
	private UserGroupDO userGroup;

	/** 用户类型 不安全事件调查员,风险管理员,信息管理员,审计监察员 */
	private String userType;

	/** 编号 */
	private String auditorNo;

	/** 性别 */
	private String sex;

	/** 所属单位 */
	private UnitDO unit;

	/** 所属部门  */
	private String department;

	/** 职务 */
	private String duties;

	/** 岗位 */
	private String quarters;

	/** 办公电话 */
	private String officeTel;

	/** 传真电话 */
	private String faxNumber;

	/** 手机电话 */
	private String cellTel;

	/** 电子邮箱 */
	private String email;

	/** 政治面貌 */
	private String political;

	/** 名族 */
	private String nationalist;

	/** 文化程度 */
	private String education;

	/** 籍贯 */
	private String recruitment;

	/** 身份证号码 */
	private String cardNo;

	/** 家庭住址 */
	private String address;

	/** 安全监察证编号 */
	private String safeNo;

	/** 首次受聘日期 */
	private Date hiredDate;

	/** 此审计员作为一级审计员的专业*/
	private Set<DictionaryDO> system;

	/** 此审计员作为二级审计员的专业 */
	private Set<DictionaryDO> system2;

	/** 此审计员作为三级审计员的专业 */
	private Set<DictionaryDO> system3;

	/** 创建人 */
	private UserDO creator;

	/** 更新人 */
	private UserDO updater;

	/** 级别：1一级、2二级 */
	private Integer param;

	/** 拼音 */
	private String spell;

	@ManyToOne
	@JoinColumn(name = "USER_ID")
	@Comment("对应的用户")
	public UserDO getUser() {
		return user;
	}

	public void setUser(UserDO user) {
		this.user = user;
	}

	@ManyToOne
	@JoinColumn(name = "USERGROUP_ID")
	@Comment("对应的用户组")
	public UserGroupDO getUserGroup() {
		return userGroup;
	}

	public void setUserGroup(UserGroupDO userGroup) {
		this.userGroup = userGroup;
	}

	@Column(name = "USER_TYPE", length = 500)
	@Comment("用户类型 不安全事件调查员,风险管理员,信息管理员,审计监察员")
	public String getUserType() {
		return userType;
	}

	public void setUserType(String userType) {
		this.userType = userType;
	}

	@Column(name = "auditor_no", length = 500)
	@Comment("编号")
	public String getAuditorNo() {
		return auditorNo;
	}

	public void setAuditorNo(String auditorNo) {
		this.auditorNo = auditorNo;
	}

	@Column(length = 50)
	@Comment("性别")
	public String getSex() {
		return sex;
	}

	public void setSex(String sex) {
		this.sex = sex;
	}

	@ManyToOne
	@JoinColumn(name = "UNIT_ID")
	@Comment("所属单位")
	public UnitDO getUnit() {
		return unit;
	}

	public void setUnit(UnitDO unit) {
		this.unit = unit;
	}

	@Column(length = 500)
	@Comment("所属部门")
	public String getDepartment() {
		return department;
	}

	public void setDepartment(String department) {
		this.department = department;
	}

	@Column(length = 500)
	@Comment("职务")
	public String getDuties() {
		return duties;
	}

	public void setDuties(String duties) {
		this.duties = duties;
	}

	@Column(length = 500)
	@Comment("岗位")
	public String getQuarters() {
		return quarters;
	}

	public void setQuarters(String quarters) {
		this.quarters = quarters;
	}

	@Column(length = 100)
	@Comment("办公电话")
	public String getOfficeTel() {
		return officeTel;
	}

	public void setOfficeTel(String officeTel) {
		this.officeTel = officeTel;
	}

	@Column(length = 100)
	@Comment("传真电话")
	public String getFaxNumber() {
		return faxNumber;
	}

	public void setFaxNumber(String faxNumber) {
		this.faxNumber = faxNumber;
	}

	@Column(length = 50)
	@Comment("手机电话")
	public String getCellTel() {
		return cellTel;
	}

	public void setCellTel(String cellTel) {
		this.cellTel = cellTel;
	}

	@Column(length = 100)
	@Comment("电子邮箱")
	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	@Column(length = 100)
	@Comment("政治面貌")
	public String getPolitical() {
		return political;
	}

	public void setPolitical(String political) {
		this.political = political;
	}

	@Column(length = 500)
	@Comment("名族")
	public String getNationalist() {
		return nationalist;
	}

	public void setNationalist(String nationalist) {
		this.nationalist = nationalist;
	}

	@Column(length = 100)
	@Comment("文化程度")
	public String getEducation() {
		return education;
	}

	public void setEducation(String education) {
		this.education = education;
	}

	@Column(length = 500)
	@Comment("籍贯")
	public String getRecruitment() {
		return recruitment;
	}

	public void setRecruitment(String recruitment) {
		this.recruitment = recruitment;
	}

	@Column(length = 100)
	@Comment("身份证号码")
	public String getCardNo() {
		return cardNo;
	}

	public void setCardNo(String cardNo) {
		this.cardNo = cardNo;
	}

	@Column(length = 500)
	@Comment("家庭住址")
	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	@Column(length = 500)
	@Comment("安全监察证编号")
	public String getSafeNo() {
		return safeNo;
	}

	public void setSafeNo(String safeNo) {
		this.safeNo = safeNo;
	}

	@Column(name = "hired_date", columnDefinition = "DATE")
	@Comment("首次受聘日期")
	public Date getHiredDate() {
		return hiredDate;
	}

	public void setHiredDate(Date hiredDate) {
		this.hiredDate = hiredDate;
	}

	@ManyToMany
	@JoinTable(name = "A_AUDITOR_SYSTEM", joinColumns = @JoinColumn(name = "AUDITOR_ID"), inverseJoinColumns = @JoinColumn(name = "SYSTEM_ID"))
	@Comment("此审计员作为一级审计员的专业")
	public Set<DictionaryDO> getSystem() {
		return system;
	}

	public void setSystem(Set<DictionaryDO> system) {
		this.system = system;
	}

	@ManyToMany
	@JoinTable(name = "A_AUDITOR_SYSTEM_2", joinColumns = @JoinColumn(name = "AUDITOR_ID"), inverseJoinColumns = @JoinColumn(name = "SYSTEM_ID"))
	@Comment("此审计员作为二级审计员的专业")
	public Set<DictionaryDO> getSystem2() {
		return system2;
	}

	public void setSystem2(Set<DictionaryDO> system2) {
		this.system2 = system2;
	}

	@ManyToMany
	@JoinTable(name = "A_AUDITOR_SYSTEM_3", joinColumns = @JoinColumn(name = "AUDITOR_ID"), inverseJoinColumns = @JoinColumn(name = "SYSTEM_ID"))
	@Comment("此审计员作为三级审计员的专业")
	public Set<DictionaryDO> getSystem3() {
		return system3;
	}

	public void setSystem3(Set<DictionaryDO> system3) {
		this.system3 = system3;
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

	@Column
	@Comment("级别：1一级、2二级")
	public Integer getParam() {
		return param;
	}

	public void setParam(Integer param) {
		this.param = param;
	}

	@Column(length = 100)
	@Comment("拼音")
	public String getSpell() {
		return spell;
	}

	public void setSpell(String spell) {
		this.spell = spell;
	}

}
