
package com.usky.sms.user;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.orm.hibernate3.HibernateTemplate;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.audit.EnumAuditRole;
import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.custom.CustomFieldDao;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.role.RoleDao;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.unit.UnitRoleActorDao;

public class UserService extends AbstractService {
	
	@Autowired
	private CustomFieldDao customFieldDao;
	
	@Autowired
	private RoleDao roleDao;
	
	@Autowired
	private UserDao userDao;
	
	@Autowired
	private UserGroupDao userGroupDao;
	
	@Autowired
	private DictionaryDao dictionaryDao;
	
	@Autowired
	private UnitRoleActorDao unitRoleActorDao;
	
	@Autowired
	private UnitDao unitDao;
	
	public String getUserTypeValueName(UserType type, String id) {
		switch (type) {
			case USER:
				return userDao.internalGetById(Integer.parseInt(id)).getFullname();
			case USER_GROUP:
				return userGroupDao.internalGetById(Integer.parseInt(id)).getName();
			case ROLE:
				return roleDao.internalGetById(Integer.parseInt(id)).getName();
			case CUSTOM_USER_FIELD:
			case CUSTOM_USER_GROUP_FIELD:
				return customFieldDao.internalGetById(Integer.parseInt(id)).getName();
			default:
				return null;
		}
	}
	
	
	public String getUserTypeValueName(UserType type, String id, Map<String, Object> objMap) {
		switch (type) {
		case USER:
		case USER_GROUP:
		case ROLE:
			return (String) (objMap.get(type.toString() + id) == null ? "" : objMap.get(type.toString() + id));
		case CUSTOM_USER_FIELD:
		case CUSTOM_USER_GROUP_FIELD:
			return customFieldDao.internalGetById(Integer.parseInt(id)).getName();
		default:
			return null;
		}
	}
	
	public void getYxwUser(HttpServletRequest request,HttpServletResponse response) {
		try {
			String username = request.getParameter("username")==null?"":request.getParameter("username").toString();
			String fullname = request.getParameter("fullname")==null?"":request.getParameter("fullname").toString();
			String orgId = request.getParameter("orgId");
			List<Map<String, Object>> list = userDao.getYxwUser(username, fullname,orgId);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data",list);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void saveYxwUser(HttpServletRequest request,HttpServletResponse response) {
		try {
			String userMap = request.getParameter("userMap");
			Map<String, Object> yxwUserMap = gson.fromJson(userMap, new TypeToken<Map<String, Object>>() {}.getType());
			UserDO user = userDao.saveYxwUser(yxwUserMap);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data",userDao.convert(user));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getUserIdNameByGroupId(HttpServletRequest request,HttpServletResponse response) {
		try {
			Integer groupId = request.getParameter("groupId")==null?0:Integer.parseInt(request.getParameter("groupId"));		
			List<Map<String,Object>> userList = userGroupDao.getUserIdNameByGroupId(groupId);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data",userList);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/**
	 * 通过用户组名查询用户信息
	 * @param request
	 * @param response
	 */
	public void getUserIdNameByGroupName(HttpServletRequest request,HttpServletResponse response) {
		try {
			String groupName = request.getParameter("groupName");
			String userName = request.getParameter("userName");
			List<UserDO> userList = userGroupDao.getUserIdNameByGroupName(groupName, userName);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(userDao.convert(userList, Arrays.asList(new String[]{"id", "username", "fullname", "avatar"}), false), request));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/**
	 * 通过用户组在数据字典里对应的key名查询用户信息
	 * @param request
	 * @param response
	 */
	public void getUserIdNameByGroupKey(HttpServletRequest request,HttpServletResponse response) {
		try {
			String groupKey = request.getParameter("groupKey");
			String userName = request.getParameter("userName");
			DictionaryDO dic = dictionaryDao.getByTypeAndKey("审计角色", groupKey);
			if (null == dic) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "数据字典中没有配置类型为审计角色，key为" + groupKey + "的记录!");
			}
			
			List<UserDO> userList = userGroupDao.getUserIdNameByGroupName(dic.getName(), userName);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(userDao.convert(userList, Arrays.asList(new String[]{"id", "username", "fullname", "avatar"}), false), request));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/**
	 * 通过用户组在数据字典里对应的key名查询用户信息
	 * @param request
	 * @param response
	 */
	public void getUserIdNameByRoleKey(HttpServletRequest request,HttpServletResponse response) {
		try {
			String roleKey = request.getParameter("roleKey");
			String userName = request.getParameter("userName");
			String unitId = request.getParameter("unitId");
			String orgId = request.getParameter("orgId");
			DictionaryDO dic = dictionaryDao.getByTypeAndKey("审计角色", roleKey);
			if (null == dic) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "数据字典中没有配置类型为审计角色，key为" + roleKey + "的记录!");
			}
			
			List<UserDO> userList = null;
			if (unitId != null) {
				userList = unitRoleActorDao.getUsersByUnitIdAndRoleName(Integer.parseInt(unitId), dic.getName(), userName);
			} else if (orgId != null) {
				userList = unitRoleActorDao.getUsersByOrgIdAndRoleName(Integer.parseInt(orgId), dic.getName(), userName);
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(userDao.convert(userList, Arrays.asList(new String[]{"id", "username", "fullname", "avatar"}), false), request));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	/**
	 * 通过安监机构ids和角色ids获取用户信息
	 * @param request
	 * @param response
	 */
	public void getUsersByUnitIdsAndRoleIds(HttpServletRequest request,HttpServletResponse response) {
		try {
			List<Integer> roleIds = gson.fromJson(request.getParameter("roleIds"), new TypeToken<List<Integer>>() {}.getType());
			List<Integer> unitIds = gson.fromJson(request.getParameter("unitIds"), new TypeToken<List<Integer>>() {}.getType());
			List<UserDO> users = unitRoleActorDao.getUsersByUnitIdsAndRoleIds(unitIds, roleIds);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(userDao.convert(users, Arrays.asList(new String[]{"id", "username", "fullname", "avatar"}), false), request));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/**
	 * 将给定安监机构下的角色的所有用户和与给定安监机构相关的组织下的所有用户返回, 按名称排序
	 * @param request
	 * @param response
	 */
	public void getUsersByUnitIds(HttpServletRequest request,HttpServletResponse response) {
		try {
			List<Integer> unitIds = gson.fromJson(request.getParameter("unitIds"), new TypeToken<List<Integer>>() {}.getType());
			if (unitIds == null || unitIds.isEmpty()) {
				unitIds = unitDao.getUnitIds(PermissionSets.VIEW_UNIT.getName());
			}
			String term = request.getParameter("term");
			boolean excludeOrgUsers = Boolean.parseBoolean((String) request.getParameter("excludeOrgUsers"));
			List<UserDO> users = userDao.getByUnit(unitIds, excludeOrgUsers, term);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(userDao.convert(users, Arrays.asList(new String[]{"id", "username", "fullname", "avatar"}), false), request));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	/**
	 * 根据当前用户角色和当前用户部门 获取部门下的用户信息或者是
	 * @param request
	 * @param response
	 */
	public void getDeptUsersByRoles(HttpServletRequest request,HttpServletResponse response) {
		try {
			String checkGrade = request.getParameter("checkGrade");
			String term =request.getParameter("userName");
			String unitName = request.getParameter("unitName");
			List<Integer> unitId = unitDao.getUnitIds(PermissionSets.VIEW_UNIT.getName(), unitName);
			String roleName=EnumAuditRole.SECOND_GRADE_CHECKER.getName();
			List<UserDO> users =null;
			if(checkGrade!=null || !checkGrade.isEmpty()) {
				users = userDao.getUsersByRoleIdAndUnitId(checkGrade,request,term,unitId,roleName);
				
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(userDao.convert(users, Arrays.asList(new String[]{"id", "username", "fullname", "avatar"}), false), request));
			ResponseHelper.output(response, map);
			
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch(Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void setCustomFieldDao(CustomFieldDao customFieldDao) {
		this.customFieldDao = customFieldDao;
	}
	
	public void setRoleDao(RoleDao roleDao) {
		this.roleDao = roleDao;
	}
	
	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}
	
	public void setUserGroupDao(UserGroupDao userGroupDao) {
		this.userGroupDao = userGroupDao;
	}

	public void setDictionaryDao(DictionaryDao dictionaryDao) {
		this.dictionaryDao = dictionaryDao;
	}

	public void setUnitRoleActorDao(UnitRoleActorDao unitRoleActorDao) {
		this.unitRoleActorDao = unitRoleActorDao;
	}

	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}
	
}
