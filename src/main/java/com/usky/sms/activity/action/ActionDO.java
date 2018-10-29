
package com.usky.sms.activity.action;
import org.hibernate.cfg.Comment;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.role.RoleDO;
import com.usky.sms.user.UserDO;

@Entity
@Table(name = "T_ACTION")
@Comment("备注")
public class ActionDO extends AbstractBaseDO {
	
	private static final long serialVersionUID = -8898359138793225037L;
	
	/** 安全信息主键  **/
	private ActivityDO activity;
	
	/** 备注人主键  **/
	private UserDO author;
	
	/** 类型  **/
	private String type;
	
	/** 备注级别  **/
	private String level;
	
	/** 角色主键  **/
	private RoleDO role;
	
	/** 备注的信息内容  **/
	private String body;
	
	/** 最后更新人主键  **/
	private UserDO updatedAuthor;
	
	/** 编号  **/
	private Integer num;
	
	@ManyToOne
	@JoinColumn(name = "ACTIVITY_ID")
	@Comment("安全信息主键")
	public ActivityDO getActivity() {
		return activity;
	}
	
	public void setActivity(ActivityDO activity) {
		this.activity = activity;
	}
	
	@ManyToOne
	@JoinColumn(name = "AUTHOR_ID")
	@Comment("备注人主键")
	public UserDO getAuthor() {
		return author;
	}
	
	public void setAuthor(UserDO author) {
		this.author = author;
	}
	
	@Column(name="`type`", length = 20)
	@Comment("类型")
	public String getType() {
		return type;
	}
	
	public void setType(String type) {
		this.type = type;
	}
	
	@Column(name="`level`", length = 20)
	@Comment("备注级别")
	public String getLevel() {
		return level;
	}
	
	public void setLevel(String level) {
		this.level = level;
	}
	
	@ManyToOne
	@JoinColumn(name = "ROLE_ID")
	@Comment("角色主键")
	public RoleDO getRole() {
		return role;
	}
	
	public void setRole(RoleDO role) {
		this.role = role;
	}
	
	@Column(name="`body`", length = 4000, columnDefinition = "clob")
	@Comment("备注的信息内容")
	public String getBody() {
		return body;
	}
	
	public void setBody(String body) {
		this.body = body;
	}
	
	@ManyToOne
	@JoinColumn(name = "UPDATEDAUTHOR_ID")
	@Comment("最后更新人主键")
	public UserDO getUpdatedAuthor() {
		return updatedAuthor;
	}
	
	public void setUpdatedAuthor(UserDO updatedAuthor) {
		this.updatedAuthor = updatedAuthor;
	}
	
	@Column
	@Comment("编号")
	public Integer getNum() {
		return num;
	}
	
	public void setNum(Integer num) {
		this.num = num;
	}
	
}
