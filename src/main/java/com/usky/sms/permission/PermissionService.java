
package com.usky.sms.permission;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.config.Config;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.role.RoleDO;
import com.usky.sms.role.RoleDao;
import com.usky.sms.unit.UnitConfigDO;
import com.usky.sms.unit.UnitConfigDao;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;
import com.usky.sms.user.UserGroupDO;
import com.usky.sms.user.UserGroupDao;
import com.usky.sms.user.UserService;
import com.usky.sms.user.UserType;

public class PermissionService extends AbstractService {
	
	private Config config;
	
	@Autowired
	private PermissionSchemeDao permissionSchemeDao;
	
	@Autowired
	private PermissionSchemeItemDao permissionSchemeItemDao;
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private UnitConfigDao unitConfigDao;
	
	@Autowired
	private UserService userService;
	
	@Autowired
	private UserDao userDao;
	
	@Autowired
	private RoleDao roleDao;
	
	@Autowired
	private UserGroupDao userGroupDao;
	
	public PermissionService() {
		super();
		this.config = Config.getInstance();
	}
	
	public void copyPermissionScheme(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			Integer id = Integer.parseInt(request.getParameter("permissionScheme"));
			String name = request.getParameter("name");
			String description = request.getParameter("description");
			permissionSchemeDao.copy(id, name, description);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getPermissionSchemePermissionSet(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			boolean manage = Boolean.parseBoolean(request.getParameter("manage"));
			Integer unitId = null;
			int schemeId;
			UnitConfigDO config = null;
			String permissionSchemeName;
			if (manage) {
				schemeId = Integer.parseInt(request.getParameter("permissionScheme"));
				permissionSchemeName = permissionSchemeDao.internalGetById(schemeId).getName();
			} else {
				unitId = Integer.parseInt(request.getParameter("unit"));
				config = unitConfigDao.getByUnitId(unitId);
				schemeId = config.getPermissionScheme().getId();
				permissionSchemeName = config.getPermissionScheme().getName();
			}
			List<Map<String, Object>> permissionSetMaps = permissionSetDao.convert(permissionSetDao.getNonGlobalPermissionSet());
			List<PermissionSchemeItemDO> items = permissionSchemeItemDao.getByPermissionSchemeId(schemeId);
			Map<Integer, List<Map<String, Object>>> idMap = new HashMap<Integer, List<Map<String, Object>>>();
			Map<String, Object> nameMap = this.getObjMap();
			for (PermissionSchemeItemDO item : items) {
				Integer id = item.getPermissionSet().getId();
				List<Map<String, Object>> idList = idMap.get(id);
				if (idList == null) {
					idList = new ArrayList<Map<String, Object>>();
					idMap.put(id, idList);
				}
				Map<String, Object> map = new HashMap<String, Object>();
				map.put("id", item.getId());
				UserType type = UserType.valueOf(item.getType());
				map.put("type", type.getName());
				String parameter = item.getParameter();
				if (parameter != null && parameter.trim().length() > 0) {
					map.put("parameter", userService.getUserTypeValueName(type, parameter, nameMap));
				}
				idList.add(map);
			}
			for (Map<String, Object> permissionSetMap : permissionSetMaps) {
				permissionSetMap.put("items", idMap.get(permissionSetMap.get("id")));
			}
			List<UnitDO> units = unitDao.getByPermissionSchemeId(schemeId);
			List<Map<String, Object>> unitMaps = new ArrayList<Map<String, Object>>();
			for (UnitDO unit : units) {
				Map<String, Object> unitMap = new HashMap<String, Object>();
				unitMap.put("id", unit.getId());
				unitMap.put("name", unit.getName());
				unitMap.put("code", unit.getCode());
				if (unit.getAvatar() == null) {
					unitMap.put("avatar", this.config.getUnitAvatarWebPath() + "/" + this.config.getDefaultUnitAvatar());
				} else {
					unitMap.put("avatar", this.config.getUnitAvatarWebPath() + "/" + unit.getAvatar().getFileName());
				}
				unitMaps.add(unitMap);
			}
			Map<String, Object> data = new HashMap<String, Object>();
			data.put("id", schemeId);
			data.put("name", permissionSchemeName);
			data.put("permissionSets", PageHelper.getPagedResult(permissionSetMaps, request));
			data.put("units", unitMaps);
			if (!manage) {
				boolean isAdmin = permissionSetDao.hasPermission(PermissionSets.ADMIN.getName());
				data.put("action", isAdmin ? new String[] { "修改权限", "使用不同的方案" } : new String[] { "使用不同的方案" });
				data.put("config", config.getId());
				data.put("admin", isAdmin);
			}
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	private Map<String, Object> getObjMap() {
		Map<String, Object> nameMap = new HashMap<String, Object>();
		List<UserDO> users = userDao.getList();
		for (UserDO user : users) {
			nameMap.put(UserType.USER.toString() + user.getId(), user.getFullname());
		}
		List<RoleDO> roles = roleDao.getAllList();
		for (RoleDO role : roles) {
			nameMap.put(UserType.ROLE.toString() + role.getId(), role.getName());
		}
		List<UserGroupDO> groups = userGroupDao.getAllList();
		for (UserGroupDO group : groups) {
			nameMap.put(UserType.USER_GROUP.toString() + group.getId(), group.getName());
		}
		return nameMap;
	}
	
	public void getURGP(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String name = request.getParameter("name")==null?"":request.getParameter("name").toString();
			String pname = request.getParameter("pname")==null?"":request.getParameter("pname").toString();
			String type = request.getParameter("type");
			List<Map<String, Object>> list = permissionSchemeItemDao.getURGP(name, pname, type);
			List<Map<String,Object>> ulist = new ArrayList<Map<String,Object>>();
			for (Map<String, Object> u : list) {
				String tempId = u.get("ID")+"";
				String tempname = u.get("NAME")+"";
				Map<String,Object> temMap = new HashMap<String, Object>();
				temMap.put("ID", tempId);
				temMap.put("NAME", tempname);
				if(!ulist.contains(temMap)){
					ulist.add(temMap);
				}
			}
			List<Map<String,Object>> finalList = new ArrayList<Map<String,Object>>();
			for (Map<String,Object> u : ulist) {
				Map<String,Object> map = new HashMap<String,Object>();
				List<Map<String, Object>> clist = new ArrayList<Map<String, Object>>();
				map.put("ID", u.get("ID"));
				map.put("NAME", u.get("NAME"));
				for (Map<String, Object> p : list) {
					String tempName = p.get("NAME")+"";
					if(u.get("NAME").equals(tempName)){
						Map<String,Object> cmap = new HashMap<String,Object>();
						String tempPid = p.get("PID")+"";
						String tempPname = p.get("PNAME")+"";
						String tempScope = p.get("SCOPE")+"";
						cmap.put("PID", tempPid);
						cmap.put("PNAME", tempPname);
						cmap.put("SCOPE", tempScope);
						clist.add(cmap);
					}				
				}				
				map.put("PERMISSION", clist);
				finalList.add(map);
			}	
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", finalList);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void setPermissionSchemeDao(PermissionSchemeDao permissionSchemeDao) {
		this.permissionSchemeDao = permissionSchemeDao;
	}
	
	public void setPermissionSchemeItemDao(PermissionSchemeItemDao permissionSchemeItemDao) {
		this.permissionSchemeItemDao = permissionSchemeItemDao;
	}
	
	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}
	
	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}
	
	public void setUnitConfigDao(UnitConfigDao unitConfigDao) {
		this.unitConfigDao = unitConfigDao;
	}
	
	public void setUserService(UserService userService) {
		this.userService = userService;
	}

	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}

	public void setRoleDao(RoleDao roleDao) {
		this.roleDao = roleDao;
	}

	public void setUserGroupDao(UserGroupDao userGroupDao) {
		this.userGroupDao = userGroupDao;
	}
	
}
