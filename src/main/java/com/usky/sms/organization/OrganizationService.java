
package com.usky.sms.organization;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.activity.ActivityDO;
import com.usky.sms.activity.ActivityDao;
import com.usky.sms.common.NumberHelper;
import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;

@SuppressWarnings("unused")
public class OrganizationService extends AbstractService {
	
	@Autowired
	private OrganizationDao organizationDao;
	
	@Autowired
	private DictionaryDao dictionaryDao;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private UserDao userDao;
	
	@Autowired
	private ActivityDao activityDao;
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void updateAllOrg(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String objs = request.getParameter("objs");
			int unitId = request.getParameter("unitId") == null ? null : Integer.parseInt(request.getParameter("unitId"));
			UnitDO unit = unitDao.internalGetById(unitId);
			organizationDao.updateAll(unit, objs);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", null);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void modifyOrganization(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String paramType = request.getParameter("paramType");
			OrganizationDO newOrganization = null;
			String obj = request.getParameter("obj");
			Map<String, Object> map = gson.fromJson(obj, new TypeToken<Map<String, Object>>() {}.getType());
			Integer previousId = (Double) map.get("previousParent") == null ? null : ((Double) map.get("previousParent")).intValue();
			OrganizationDO previous = previousId == null ? null : organizationDao.internalGetById(previousId);
			// 返回页面的组织ID
			Integer organizationId = null;
			if ("addOrganization".equals(paramType)) { // 新增组织
				newOrganization = parseParam(map);
				if (null != newOrganization.getParent()) {
					if (null != organizationDao.getSubOrganizationByName(newOrganization.getParent(), newOrganization.getName())) {
						throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "该组织已存在！");
					}
				}
				organizationDao.addOrganization(newOrganization, previous);
				organizationId = newOrganization.getId();
			} else if ("updateOrganization".equals(paramType)) { // 更新组织
				// 待被更新的组织
				String oldOrganizationId = request.getParameter("dataobjectid");
				if (StringUtils.isBlank(oldOrganizationId)) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "组织ID不能为空！");
				}
				OrganizationDO oldOrganization = organizationDao.internalGetById(Integer.parseInt(oldOrganizationId));
				if (null == oldOrganization) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "该组织[ID:" + oldOrganizationId + "]不存在！");
				}
				String operate = request.getParameter("operate") == null ? null : request.getParameter("operate");
				if (null == operate) {
					newOrganization = parseParam(map);
					// 目录名改变了或者父目录变了需要进行判断目录名是否重复
					if ((!newOrganization.getName().equals(oldOrganization.getName())) || ((null != newOrganization.getParent() && null != oldOrganization.getParent()) && (!newOrganization.getParent().equals(oldOrganization.getParent())))) {
						if (null != organizationDao.getSubOrganizationByName(newOrganization.getParent(), newOrganization.getName())) {
							throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "该组织已存在！");
						}
					}
					// 组织名
					oldOrganization.setName(newOrganization.getName());
					// 所属系统
					oldOrganization.setSystems(newOrganization.getSystems());
					// 组织编号
					oldOrganization.setDeptCode(newOrganization.getDeptCode());
					// 组织编号描述
					oldOrganization.setDeptCodeDesc(newOrganization.getDeptCodeDesc());
					// 安监机构
					oldOrganization.setUnit(newOrganization.getUnit());
					// 组织层级
					oldOrganization.setOlevel(newOrganization.getOlevel());
					// 英文名称
					oldOrganization.setNameEn(newOrganization.getNameEn());
					OrganizationDO newParent = newOrganization.getParent();
					OrganizationDO oldParent = oldOrganization.getParent();
					if ((null != newParent && newParent.equals(oldParent)) || (newParent == oldParent)) { // 同父组织下的更新
						organizationDao.updateOrganizationToSameParent(oldOrganization, previous);
					} else {// 不同父组织下的更新
						organizationDao.updateOrganizationToDiffParent(oldOrganization, previous, newOrganization.getParent());
					}
				} else { // 对组织成员的操作
					Set<UserDO> oldUsers = oldOrganization.getUsers();
					@SuppressWarnings("unchecked")
					List<Double> userIds = (List<Double>) map.get("users");
					if (null != userIds && !userIds.isEmpty()) {
						List<UserDO> users = userDao.getAllUserById(converDoubleListToIntegerList(userIds));
						if ("addUsers".equals(operate)) { // 增加成员		
							oldUsers.addAll(users);
						} else if ("deleteUsers".equals(operate)) { //删除成员
							oldUsers.removeAll(users);
						}
						oldOrganization.setUsers(oldUsers);
						organizationDao.update(oldOrganization);
					}
				}
				organizationId = oldOrganization.getId();
			}
			
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("organizationId", organizationId);
			
			ResponseHelper.output(response, result);
			
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/**
	 * 获取所有的组织
	 * 
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void getAllOrganizations(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String name = request.getParameter("name");
			name = StringUtils.isBlank(name) ? null : name;
			
			Integer unitId = null;
			String activityId = request.getParameter("activity");
			if (!StringUtils.isBlank(activityId)) {
				ActivityDO activity = activityDao.internalGetById(Integer.parseInt(activityId));
				if (null != activity && null != activity.getUnit()) {
					unitId = activity.getUnit().getId();
				}
			}
			List<OrganizationDO> organizations = organizationDao.getAllOrganizations(name, unitId);
			List<OrganizationDO> parents = new ArrayList<OrganizationDO>();
			
			// 通过unitid查找组织时，将是叶子节点的所有父节点也查找出来
			if (null == name && null != unitId) {
				for (OrganizationDO organization : organizations) {
					while (null != organization.getParent()) {
						organization = organization.getParent();
						if (!organizations.contains(organization) && !parents.contains(organization)) {
							parents.add(organization);
						}
					}
				}
				organizations.addAll(parents);
			}
			
			List<Map<String, Object>> dataList = new ArrayList<Map<String, Object>>();
			for (OrganizationDO organization : organizations) {
				Map<String, Object> map = new HashMap<String, Object>();
				if (null == name && null != unitId) {
					map.put("isSpecifyUnit", organization.getUnit() != null && organization.getUnit().getId().equals(unitId) ? true : false);
				}
				map.put("id", organization.getId());
				map.put("name", organization.getName());
				map.put("parentId", organization.getParent() == null ? null : organization.getParent().getId());
				dataList.add(map);
			}
			
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", PageHelper.getPagedResult(dataList, request));
			
			ResponseHelper.output(response, result);
			
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getOrganizationByUserId(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			int userId = request.getParameter("userId")==null?0:Integer.parseInt(request.getParameter("userId"));
			List<HashMap<String,Object>> list = organizationDao.getOrganizationByUserId(userId);
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", list);		
			ResponseHelper.output(response, result);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/**
	 * 获取一个组织下可添加的用户列表
	 * 
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void getAddableUsersForOrganization(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String organizationId = request.getParameter("organizationId");
			if (StringUtils.isBlank(organizationId)) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "组织ID不能为空！");
			}
			OrganizationDO organization = organizationDao.internalGetById(Integer.parseInt(organizationId));
			
			String userName = request.getParameter("userName");
			
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", organizationDao.getAddableUsersForOrganization(organization, userName));
			
			ResponseHelper.output(response, result);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getSysTemByUser(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			List<DictionaryDO> list = organizationDao.getSysTemByUser();
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", dictionaryDao.convert(list));
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getOrganizationsByParent(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			Integer parentId = StringUtils.isBlank(request.getParameter("parentId")) ? null :  Integer.parseInt(request.getParameter("parentId"));
			String name = request.getParameter("name");
			List<Map<String, Object>> organizations = organizationDao.getByParent(parentId, name);
			
			// 去除当前组织
			String currentOrganizationId = request.getParameter("currentOrganizationId");
			for (Map<String, Object> map : organizations) {
				if (map.get("id").toString().equals(currentOrganizationId)) {
					organizations.remove(map);
					break;
				}
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", organizations);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getOrganizationMembers(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			int organizationId = Integer.parseInt(request.getParameter("organization"));
			List<?> members = organizationDao.getMembers(organizationId);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", members);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getByUnit(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			Integer unitId = Integer.parseInt(request.getParameter("unitId"));
			UnitDO unit = new UnitDO();
			unit.setId(unitId);
			List<OrganizationDO> listOrg = organizationDao.getByUnit(unit);
			List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
			for (OrganizationDO organizationDO : listOrg) {
				Map<String,Object> map = new HashMap<String, Object>();
				map.put("id", organizationDO.getId());
				map.put("parentId", organizationDO.getParent() == null ? null : organizationDO.getParent().getId());
				map.put("name",organizationDO.getName());
				list.add(map);
			}			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			if (!"Y".equals(request.getParameter("nologin"))){
				map.put("managable", permissionSetDao.hasUnitPermission(unitId,PermissionSets.MANAGE_UNIT.getName()));
			}
			map.put("data", list);
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
	 * 获取具有查看安监机构对应的组织
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void getOrganizationsByViewUnit(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			@SuppressWarnings("unchecked")
			List<Integer> unitIds = NumberHelper.convertToIntegerList(gson.fromJson(request.getParameter("unitIds"), List.class));
			if (unitIds == null || unitIds.isEmpty()) {
				unitIds = unitDao.getUnitIds(PermissionSets.VIEW_UNIT.getName());
			}
			String term = request.getParameter("term");
			List<OrganizationDO> listOrg = null;
			if (unitIds.isEmpty()) {
				listOrg = Collections.emptyList();
			} else {
				listOrg = organizationDao.getByUnitIds(unitIds, term);
			}
			List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
			for (OrganizationDO organizationDO : listOrg) {
				Map<String,Object> map = new HashMap<String, Object>();
				map.put("id", organizationDO.getId());
				map.put("parentId", organizationDO.getParent() == null ? null : organizationDO.getParent().getId());
				map.put("name",organizationDO.getName());
				list.add(map);
			}			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(list, request));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getByUnitforEm(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String  unitId = request.getParameter("unitId");
			List<OrganizationDO> list = organizationDao.getByUnitforEm(unitId);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", organizationDao.convert(list, Arrays.asList(new String[]{"id", "name", "nameByLanguage", "nameEn"}), false));
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
	 * 解析页面传过来的参数赋值给组织对象<br>
	 * 赋值的有：组织名、上级组织、所属系统、成员、组织层级
	 * 
	 * @param map
	 * @return
	 */
	private OrganizationDO parseParam(Map<String, Object> map) {
		OrganizationDO organization = new OrganizationDO();
		// 组织名(不可空)
		String name = (String) map.get("name");
		if (StringUtils.isBlank(name)) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "组织名不能为空！");
		}
		organization.setName(name);
		
		// 父组织id(可空)
		Double parentId = (Double) map.get("parent");
		// 父组织
		OrganizationDO parent = null;
		if (null != parentId) {
			parent = organizationDao.internalGetById(parentId.intValue());
		}
		
//		if (null == parentId || null == (parent = organizationDao.internalGetById(parentId))) {
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "上级组织不能为空！");
//		}
		organization.setParent(parent);
		//组织编号
		String deptCode = (String) map.get("deptCode");
		if (StringUtils.isBlank(deptCode)) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "组织编号不能为空！");
		}
		//		if(organizationDao.validateDeptCode(deptCode) > 0){
		//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "此组织编号已存在！");
		//		}
		organization.setDeptCode(deptCode);
		//组织编号描述
		String deptCodeDesc = (String) map.get("deptCodeDesc");
		organization.setDeptCodeDesc(deptCodeDesc);
		// 所属系统
		@SuppressWarnings("unchecked")
		List<Integer> systemIds = converDoubleListToIntegerList((List<Double>) map.get("systems"));
		if (null != systemIds && !systemIds.isEmpty()) {
			List<DictionaryDO> systems = dictionaryDao.getByIds(systemIds);
			organization.setSystems(new HashSet<DictionaryDO>(systems));
		} else {
			organization.setSystems(null);
		}
		// 安监机构
		if (null != map.get("unit")) {
			Integer unitId = ((Double) map.get("unit")).intValue();
			UnitDO unit = new UnitDO();
			unit.setId(unitId);
			organization.setUnit(unit);
		}
		// 组织层级
		if (null != map.get("olevel")) {
			String olevel = (String) map.get("olevel");
			organization.setOlevel(olevel);
		}
		return organization;
	}
	
	/**
	 * 将Double的list转换成Integer的list
	 * 
	 * @param list
	 * @return
	 */
	private List<Integer> converDoubleListToIntegerList(List<Double> list) {
		if (null == list) {
			return null;
		}
		List<Integer> result = new ArrayList<Integer>();
		for (Double d : list) {
			result.add(d.intValue());
		}
		return result;
	}
	
	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}
	
	public void setOrganizationDao(OrganizationDao organizationDao) {
		this.organizationDao = organizationDao;
	}
	
	public void setDictionaryDao(DictionaryDao dictionaryDao) {
		this.dictionaryDao = dictionaryDao;
	}
	
	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}
	
	public void setActivityDao(ActivityDao activityDao) {
		this.activityDao = activityDao;
	}
	
	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}
	
}
