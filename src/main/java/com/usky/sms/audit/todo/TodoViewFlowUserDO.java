package com.usky.sms.audit.todo;

import org.hibernate.cfg.Comment;
import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.usky.sms.core.IDisplayable;
import com.usky.sms.user.UserDO;

/**
 * 审计待办
 * @author zheng.xl
 * 
 *  create or replace view a_todo_user as
	select u.plan_id id,
	       u.flow_user_id user_id,
	       'flowUser' user_type
	  from a_plan_flow_user u
	  where u.deleted = '0'
	  union
	select t.task_id id,
	       t.flow_user_id user_id,
	       'flowUser' user_type
	  from a_task_flow_user t
	  where t.deleted = '0'
	  union
	select c.check_id id,
	       c.flow_user_id user_id,
	       'flowUser' user_type
	  from a_check_flow_user c
	  where c.deleted = '0'
	  union
	select i.improve_id id,
	       i.flow_user_id user_id,
	       'flowUser' user_type
	  from a_improve_flow_user i
	  where i.deleted = '0'
	
	--整改转发
	  union
	select cl.improve_id id,
	       iiu.transactor_id user_id,
	       'transmittedUser' user_type
	  from a_check_list cl left join A_IMPROVE_ITEM_USER iiu on (cl.id = iiu.check_list_id)
	  where cl.deleted = '0' and cl.improve_item_status = '1' and iiu.deleted = '0'
	--整改通知单子单
	  union
	select s.sub_improve_notice_id id,
	       s.flow_user_id user_id,
	       'flowUser' user_type
	  from a_sub_improve_notice_flow_user s
	  where s.deleted = '0'
	with read only
	;
 *
 */
@Entity
@Table(name="A_TODO_USER")
public class TodoViewFlowUserDO implements Serializable, IDisplayable {

	private static final long serialVersionUID = -2884888981134732891L;
	
	/** 主键 */
	private Integer id;
	
	/** 处理人的类型 */
	private String userType;
	
	/** 待办对象 */
	private UserDO user;

	@Id
	@Column(name="ID")
	@Comment("主键")
	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	@Column(name="USER_TYPE")
	@Comment("处理人的类型")
	public String getUserType() {
		return userType;
	}

	public void setUserType(String userType) {
		this.userType = userType;
	}

	@ManyToOne
	@JoinColumn(name="USER_ID")
	@Comment("待办对象")
	public UserDO getUser() {
		return user;
	}

	public void setUser(UserDO user) {
		this.user = user;
	}

	@Override
	@Transient
	public String getDisplayName() {
		return null;
	}
	

}
