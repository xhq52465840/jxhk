package com.usky.sms.audit.task;

import java.util.ArrayList;
import java.util.List;

import com.usky.sms.core.BaseDao;
import com.usky.sms.user.UserDO;

public class TaskFlowUserDao extends BaseDao<TaskFlowUserDO> {

	protected TaskFlowUserDao() {
		super(TaskFlowUserDO.class);
	}
	
	@SuppressWarnings("unchecked")
	public List<UserDO> getUsersByTaskId(Integer taskId){
		if (null == taskId) {
			return new ArrayList<UserDO>();
		}
		return (List<UserDO>) this.query("select t.user from TaskFlowUserDO t where t.deleted = false and t.task.id = ?", taskId);
	}
	
	@SuppressWarnings("unchecked")
	public List<TaskFlowUserDO> getByTaskId(Integer taskId){
		if (null == taskId) {
			return new ArrayList<TaskFlowUserDO>();
		}
		return (List<TaskFlowUserDO>) this.query("select t from TaskFlowUserDO t where t.deleted = false and t.task.id = ?", taskId);
	}

}
