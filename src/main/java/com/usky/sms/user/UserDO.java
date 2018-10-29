
package com.usky.sms.user;
import org.hibernate.cfg.Comment;

import java.util.Date;
import java.util.Set;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.OneToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.avatar.AvatarDO;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.IDisplayable;

@Entity
@Table(name = "T_USER")
@Comment("用户")
public class UserDO extends AbstractBaseDO implements IDisplayable {
	
	private static final long serialVersionUID = -2252673633263970500L;
	
	/** 用户名 */
	private String username;
	
	/** 密码 */
	private String password;
	
	/** 姓名 */
	private String fullname;
	
	/** 邮箱 */
	private String email;
	
	/** 最后登录时间 */
	private Date lastLogin;
	
	/** 登录次数 */
	private Integer loginCount;
	
	/** 默认发送邮件的格式 */
	private String emailFormat;
	
	/** 安全信息导航每页显示的信息数量 */
	private String pageDisplayNum;
	
	/** 过滤器和面板的默认共享模式 私有 */
	private String defaultAccess;
	
	/** 通知用户他们自己的变更 */
	private String emailUser;
	
	/** 自动关注自己的安全信息 是 否 */
	private String autoWatch;
	
	/** 状态 正常 */
	private String status;
	
	/** 类型（来源） */
	private String type;
	
	/** 头像 */
	private AvatarDO avatar;
	
	/** 用户组 */
	private transient Set<UserGroupDO> userGroups;
	
	/** 个人的安全信息的列布局 */
	private String columns;
	
	/** 联系电话 */
	private String telephoneNumber;
	
	/** oa系统中的部门名称（全路径名） */
	private String oaDeptName;
	
	/** 员工编号（NC系统的人员PK） */
	private String pkPsnbasdoc;
	
	/** 1：男; 0:女 */
	private Integer sex;
	
	/** 岗位 */
	private String jobName;
	
	/** 学历 */
	private String education;
	
	/** 毕业院校 */
	private String school;
	
	/** 出生日期 */
	private String birthDate;
	
	/** 是否在职(true:在职; false:离职) */
	private boolean onTheJob;
	
	/** 身份证 */
	private String identity;
	
	@Column(length = 255, unique = true, nullable = false)
	@Comment("用户名")
	public String getUsername() {
		return username;
	}
	
	public void setUsername(String username) {
		this.username = username;
	}
	
	@Column(name="`password`", length = 50)
	@Comment("密码")
	public String getPassword() {
		return password;
	}
	
	public void setPassword(String password) {
		this.password = password;
	}
	
	@Column(length = 255, nullable = false)
	@Comment("姓名")
	public String getFullname() {
		return fullname;
	}
	
	public void setFullname(String fullname) {
		this.fullname = fullname;
	}
	
	@Column(length = 255)
	@Comment("邮箱")
	public String getEmail() {
		return email;
	}
	
	public void setEmail(String email) {
		this.email = email;
	}
	
	@Column(name = "last_login")
	@Comment("最后登录时间")
	public Date getLastLogin() {
		return lastLogin;
	}
	
	public void setLastLogin(Date lastLogin) {
		this.lastLogin = lastLogin;
	}
	
	@Column(name = "login_count")
	@Comment("登录次数")
	public Integer getLoginCount() {
		return loginCount;
	}
	
	public void setLoginCount(Integer loginCount) {
		this.loginCount = loginCount;
	}
	
	@Column(name = "email_format", length = 10)
	@Comment("默认发送邮件的格式")
	public String getEmailFormat() {
		return emailFormat;
	}
	
	public void setEmailFormat(String emailFormat) {
		this.emailFormat = emailFormat;
	}
	
	@Column(name = "page_display_num", length = 10)
	@Comment("安全信息导航每页显示的信息数量")
	public String getPageDisplayNum() {
		return pageDisplayNum;
	}
	
	public void setPageDisplayNum(String pageDisplayNum) {
		this.pageDisplayNum = pageDisplayNum;
	}
	
	@Column(name = "default_access", length = 10)
	@Comment("过滤器和面板的默认共享模式 私有")
	public String getDefaultAccess() {
		return defaultAccess;
	}
	
	public void setDefaultAccess(String defaultAccess) {
		this.defaultAccess = defaultAccess;
	}
	
	@Column(name = "email_user", length = 10)
	@Comment("通知用户他们自己的变更")
	public String getEmailUser() {
		return emailUser;
	}
	
	public void setEmailUser(String emailUser) {
		this.emailUser = emailUser;
	}
	
	@Column(name = "auto_watch", length = 10)
	@Comment("自动关注自己的安全信息 是 否")
	public String getAutoWatch() {
		return autoWatch;
	}
	
	public void setAutoWatch(String autoWatch) {
		this.autoWatch = autoWatch;
	}
	
	@Column(length = 10)
	@Comment("状态 正常")
	public String getStatus() {
		return status;
	}
	
	public void setStatus(String status) {
		this.status = status;
	}
	
	@Column(name="`type`", length = 10)
	@Comment("类型（来源）")
	public String getType() {
		return type;
	}
	
	public void setType(String type) {
		this.type = type;
	}
	
	@OneToOne
	@JoinColumn(name = "AVATAR_ID")
	@Comment("头像")
	public AvatarDO getAvatar() {
		return avatar;
	}
	
	public void setAvatar(AvatarDO avatar) {
		this.avatar = avatar;
	}
	
	@ManyToMany
	@JoinTable(name = "T_USER_USER_GROUP", joinColumns = @JoinColumn(name = "USER_ID"), inverseJoinColumns = @JoinColumn(name = "USER_GROUP_ID"))
	@Comment("用户组")
	public Set<UserGroupDO> getUserGroups() {
		return userGroups;
	}
	
	public void setUserGroups(Set<UserGroupDO> userGroups) {
		this.userGroups = userGroups;
	}
	
	@Column(length = 4000)
	@Comment("个人的安全信息的列布局")
	public String getColumns() {
		return columns;
	}

	public void setColumns(String columns) {
		this.columns = columns;
	}
	
	@Column(name = "TELEPHONE_NUMBER", length = 100)
	@Comment("联系电话")
	public String getTelephoneNumber() {
		return telephoneNumber;
	}
	
	public void setTelephoneNumber(String telephoneNumber) {
		this.telephoneNumber = telephoneNumber;
	}

	@Column(name = "OA_DEPT_NAME")
	@Comment("oa系统中的部门名称（全路径名）")
	public String getOaDeptName() {
		return oaDeptName;
	}

	public void setOaDeptName(String oaDeptName) {
		this.oaDeptName = oaDeptName;
	}

	@Column(name = "PK_PSNBASDOC")
	@Comment("员工编号（NC系统的人员PK）")
	public String getPkPsnbasdoc() {
		return pkPsnbasdoc;
	}

	public void setPkPsnbasdoc(String pkPsnbasdoc) {
		this.pkPsnbasdoc = pkPsnbasdoc;
	}

	@Column(name = "SEX")
	@Comment("1：男; 0:女")
	public Integer getSex() {
		return sex;
	}

	public void setSex(Integer sex) {
		this.sex = sex;
	}

	@Column(name = "JOB_NAME", length = 200)
	@Comment("岗位")
	public String getJobName() {
		return jobName;
	}

	public void setJobName(String jobName) {
		this.jobName = jobName;
	}

	@Column(name = "EDUCATION", length = 200)
	@Comment("学历")
	public String getEducation() {
		return education;
	}

	public void setEducation(String education) {
		this.education = education;
	}

	@Column(name = "SCHOOL", length = 200)
	@Comment("毕业院校")
	public String getSchool() {
		return school;
	}

	public void setSchool(String school) {
		this.school = school;
	}

	@Column(name = "BIRTH_DATE", length = 20)
	@Comment("出生日期")
	public String getBirthDate() {
		return birthDate;
	}

	public void setBirthDate(String birthDate) {
		this.birthDate = birthDate;
	}

	@Column(name = "ON_THE_JOB")
	@Comment("是否在职(true:在职; false:离职)")
	public boolean isOnTheJob() {
		return onTheJob;
	}

	public void setOnTheJob(boolean onTheJob) {
		this.onTheJob = onTheJob;
	}

	@Column(name = "IDENTITY")
	@Comment("身份证")
	public String getIdentity() {
		return identity;
	}

	public void setIdentity(String identity) {
		this.identity = identity;
	}

	@Override
	@Transient
	public String getDisplayName() {
		return this.getFullname() + "(" + this.getUsername() + ")";
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (null == obj) {
			return false;
		}
		if (!(obj instanceof UserDO)) {
			return false;
		}
		final UserDO user = (UserDO) obj;
		if ((this.getId() != null && this.getId().equals(user.getId())) || (this.getUsername() != null && this.getUsername().equals(user.getUsername()))) {
			return true;
		}
		return false;
	}

	@Override
	public int hashCode() {
		return this.getId().hashCode();
	}
	
}
