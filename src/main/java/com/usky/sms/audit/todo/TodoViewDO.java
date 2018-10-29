package com.usky.sms.audit.todo;

import org.hibernate.cfg.Comment;
import java.io.Serializable;
import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;
import javax.persistence.Transient;

import com.usky.sms.core.IDisplayable;
import com.usky.sms.user.UserDO;

/**
 * 审计待办
 * @author zheng.xl
	create or replace view a_todo as
	select distinct p.id,
	       '审计计划' todo_what,
	       'plan' todo_name,
	       p.plan_type todo_type,
	       p.plan_name todo_title,
	       to_char(p.year) todo_num,
	       p.operator todo_unit,
	       p.flow_status,
	       p.flow_step,
	       p.created,
	       p.last_update,
	       p.creator
	from a_plan p left join a_plan_flow_user flowuser on (p.id = flowuser.plan_id)
	where p.deleted = '0' and flowuser.flow_user_id is not null
	  union
	select distinct t.id,
	       '工作单' todo_what,
	       'task' todo_name,
	       t.plan_type todo_type,
	       t.work_name todo_title,
	       t.work_no todo_num,
	       t.target todo_unit,
	       t.flow_status,
	       t.flow_step,
	       t.created,
	       t.last_update,
	       t.creator
	from a_task t left join a_task_flow_user flowuser on (t.id = flowuser.task_id)
	where t.deleted = '0' and flowuser.flow_user_id is not null and t.plan_type <> 'SPOT' and t.plan_type <> 'SPEC'
	  union
	select distinct c.id,
	     '检查单' todo_what,
	     'check' todo_name,
	     t.plan_type todo_type,
	     c.check_name todo_title,
	     c.check_no todo_num,
	     c.target todo_unit,
	     c.flow_status,
	     c.flow_step,
	     c.created,
	     c.last_update,
	     c.CREATOR_ID creator
	from a_check c left join a_check_flow_user flowuser on (c.id = flowuser.check_id) left join a_task t on (c.task_id = t.id)
	where c.deleted = '0' and flowuser.flow_user_id is not null and t.plan_type <> 'SPOT' and t.plan_type <> 'SPEC'
	  union
	select distinct i.id,
	       '整改单' todo_what,
	       'improve' todo_name,
	       t.plan_type todo_type,
	       i.improveName todo_title,
	       i.improveNo todo_num,
	       i.target todo_unit,
	       i.flowStatus,
	       i.flowStep,
	       i.created,
	       i.last_update,
	       i.CREATOR_ID creator
	from a_improve i left join a_improve_flow_user flowuser on (i.id = flowuser.improve_id) left join a_task t on (i.task_id = t.id)
	where i.deleted = '0' and flowuser.flow_user_id is not null
	  union
	-- 整改通知单子单
	select distinct sin.id,
	       '整改通知单' todo_what,
	       'subImproveNotice' todo_name,
	       imn.source todo_type,
	       concat('整改通知单',imn.IMPROVE_NOTICE_NO) todo_title,
	       imn.IMPROVE_NOTICE_NO todo_num,
	       sin.improve_unit todo_unit,
	       sin.flow_status,
	       sin.flow_step,
	       sin.created,
	       sin.last_update,
	       imn.creator_id creator
	from a_sub_improve_notice sin left join a_sub_improve_notice_flow_user flowuser on (sin.id = flowuser.sub_improve_notice_id)
	left join a_improve_notice imn on (sin.improve_notice_id = imn.id）
	where sin.deleted = '0' and flowuser.flow_user_id is not null
	with read only
	;

 *
 */
@Entity
@Table(name="A_TODO")
public class TodoViewDO implements Serializable, IDisplayable {

	private static final long serialVersionUID = -2884888981134732891L;
	
	/** 主键 */
	private Integer id;
	
	/** 待办对象 */
	private String todoWhat;
	
	/** 待办对象对应的object名称 */
	private String todoName;
	
	/** 待办类型 */
	private String todoType;
	
	/** 待办标题 */
	private String todoTitle;
	
	/** 待办编号 */
	private String todoNum;
	
	/** 待办对应的安监机构 */
	private String todoUnit;
	
	/** 流程状态 */
	private String flowStatus;
	
	/** 流程节点 */
	private String flowStep;
	
	/** 创建时间 */
	private Date created;
	
	/** 更新时间 */
	private Date lastUpdate;
	
	/** 创建人 */
	private UserDO creator;
	
	/** 处理人类型 */
	private String userType;

	@Id
	@Comment("主键")
	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	@Column(name="TODO_WHAT")
	@Comment("待办对象")
	public String getTodoWhat() {
		return todoWhat;
	}

	public void setTodoWhat(String todoWhat) {
		this.todoWhat = todoWhat;
	}

	@Column(name="TODO_NAME")
	@Comment("待办对象对应的object名称")
	public String getTodoName() {
		return todoName;
	}

	public void setTodoName(String todoName) {
		this.todoName = todoName;
	}

	@Column(name="TODO_TYPE")
	@Comment("待办类型")
	public String getTodoType() {
		return todoType;
	}

	public void setTodoType(String todoType) {
		this.todoType = todoType;
	}

	@Column(name="TODO_TITLE")
	@Comment("待办标题")
	public String getTodoTitle() {
		return todoTitle;
	}

	public void setTodoTitle(String todoTitle) {
		this.todoTitle = todoTitle;
	}

	@Column(name="TODO_NUM")
	@Comment("待办编号")
	public String getTodoNum() {
		return todoNum;
	}

	public void setTodoNum(String todoNum) {
		this.todoNum = todoNum;
	}

	@Column(name="TODO_UNIT")
	@Comment("待办对应的安监机构")
	public String getTodoUnit() {
		return todoUnit;
	}

	public void setTodoUnit(String todoUnit) {
		this.todoUnit = todoUnit;
	}

	@Column(name="FLOW_STATUS")
	@Comment("流程状态")
	public String getFlowStatus() {
		return flowStatus;
	}

	public void setFlowStatus(String flowStatus) {
		this.flowStatus = flowStatus;
	}

	@Column(name="FLOW_STEP")
	@Comment("流程节点")
	public String getFlowStep() {
		return flowStep;
	}

	public void setFlowStep(String flowStep) {
		this.flowStep = flowStep;
	}

	@Column(name = "CREATED", columnDefinition = "DATE")
	@Temporal(TemporalType.TIMESTAMP)
	@Comment("创建时间")
	public Date getCreated() {
		return created;
	}

	public void setCreated(Date created) {
		this.created = created;
	}

	@Column(name = "LAST_UPDATE", columnDefinition = "DATE")
	@Temporal(TemporalType.TIMESTAMP)
	@Comment("更新时间")
	public Date getLastUpdate() {
		return lastUpdate;
	}

	public void setLastUpdate(Date lastUpdate) {
		this.lastUpdate = lastUpdate;
	}

	@ManyToOne
	@JoinColumn(name="CREATOR")
	@Comment("创建人")
	public UserDO getCreator() {
		return creator;
	}

	public void setCreator(UserDO creator) {
		this.creator = creator;
	}

	@Transient
	@Comment("处理人类型")
	public String getUserType() {
		return userType;
	}

	public void setUserType(String userType) {
		this.userType = userType;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (null == obj) {
			return false;
		}
		if (!(obj instanceof TodoViewDO)) {
			return false;
		}
		final TodoViewDO todoView = (TodoViewDO) obj;
		if (this.getId().equals(todoView.getId())) {
			return true;
		}
		return false;
	}

	@Override
	public int hashCode() {
		return this.getId().hashCode();
	}

	@Override
	@Transient
	public String getDisplayName() {
		return null;
	}
	

}
