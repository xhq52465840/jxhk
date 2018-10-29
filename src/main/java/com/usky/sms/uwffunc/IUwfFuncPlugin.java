package com.usky.sms.uwffunc;

import java.util.Collection;
import java.util.Map;


public interface IUwfFuncPlugin {
	/** 回写处理人 */
	public void writeUser(Integer id, String[] userIds);
	
	/** 回写状态 */
	public void setStatus(Integer id, Integer statusId, Map<String, Object> attributes);
	
	/** 通过安监机构的角色选人(单选) */
	public Collection<Integer> getUserByUnitRole(Integer id, Integer roleId);
	
	/** 通过安监机构的角色选人(多选) */
	public Collection<Integer> getUserByUnitRoles(Integer id, Collection<Integer> roleIds);
	
	/** 通过组织的角色选人(单选) */
	public Collection<Integer> getUserByOrganizationRole(Integer id, Integer roleId, String field);
	
	/** 通过组织的角色选人(多选) */
	public Collection<Integer> getUserByOrganizationRoles(Integer id, Collection<Integer> roleIds, String field);
	
	/** 发送待办信息 */
	public void sendTodoMsg(Integer id, Collection<Integer> userIds, Collection<String> sendingModes);
	
	/** 发送反馈信息 */
	public void sendFeedbackMsg(Integer id, Collection<String> sendingModes);
}
