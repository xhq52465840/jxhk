
package com.usky.sms.unit;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.activity.ActivityOperation;
import com.usky.sms.activity.type.ActivityTypeDO;
import com.usky.sms.activity.type.ActivityTypeDao;
import com.usky.sms.activity.type.ActivityTypeSchemeDO;
import com.usky.sms.activity.type.ActivityTypeSchemeMappingDO;
import com.usky.sms.activity.type.ActivityTypeSchemeMappingDao;
import com.usky.sms.avatar.AvatarDO;
import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.config.Config;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.core.TransactionHelper;
import com.usky.sms.field.FieldLayoutDO;
import com.usky.sms.field.FieldLayoutDao;
import com.usky.sms.field.FieldLayoutItemDO;
import com.usky.sms.field.FieldLayoutItemDao;
import com.usky.sms.field.FieldLayoutSchemeDO;
import com.usky.sms.field.FieldLayoutSchemeEntityDO;
import com.usky.sms.field.FieldLayoutSchemeEntityDao;
import com.usky.sms.field.FieldRegister;
import com.usky.sms.field.screen.ActivityTypeFieldScreenSchemeDO;
import com.usky.sms.field.screen.ActivityTypeFieldScreenSchemeEntityDO;
import com.usky.sms.field.screen.ActivityTypeFieldScreenSchemeEntityDao;
import com.usky.sms.field.screen.FieldScreenDO;
import com.usky.sms.field.screen.FieldScreenLayoutItemDO;
import com.usky.sms.field.screen.FieldScreenLayoutItemDao;
import com.usky.sms.field.screen.FieldScreenSchemeDO;
import com.usky.sms.field.screen.FieldScreenSchemeDao;
import com.usky.sms.field.screen.FieldScreenSchemeItemDO;
import com.usky.sms.field.screen.FieldScreenSchemeItemDao;
import com.usky.sms.organization.OrganizationCache;
import com.usky.sms.organization.OrganizationDao;
import com.usky.sms.organization.OrganizationItem;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.renderer.RendererRegister;
import com.usky.sms.role.RoleDO;
import com.usky.sms.role.RoleDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;
import com.usky.sms.user.UserGroupDO;
import com.usky.sms.user.UserGroupDao;
import com.usky.sms.user.UserHistoryItemDO;
import com.usky.sms.user.UserHistoryItemDao;
import com.usky.sms.uwf.WfSetup;
import com.usky.sms.workflow.WorkflowSchemeDao;
import com.usky.sms.workflow.WorkflowSchemeEntityDO;
import com.usky.sms.workflow.WorkflowSchemeEntityDao;

public class UnitService extends AbstractService {
	
	private Config config;
	
	@Autowired
	private ActivityTypeDao activityTypeDao;
	
	@Autowired
	private ActivityTypeSchemeMappingDao activityTypeSchemeMappingDao;
	
	@Autowired
	private ActivityTypeFieldScreenSchemeEntityDao activityTypeFieldScreenSchemeEntityDao;
	
	@Autowired
	private FieldLayoutDao fieldLayoutDao;
	
	@Autowired
	private FieldLayoutItemDao fieldLayoutItemDao;
	
	@Autowired
	private FieldLayoutSchemeEntityDao fieldLayoutSchemeEntityDao;
	
	@Autowired
	private FieldRegister fieldRegister;
	
	@Autowired
	private FieldScreenLayoutItemDao fieldScreenLayoutItemDao;
	
	@Autowired
	private FieldScreenSchemeDao fieldScreenSchemeDao;
	
	@Autowired
	private FieldScreenSchemeItemDao fieldScreenSchemeItemDao;
	
	@Autowired
	private OrganizationCache organizationCache;
	
	@Autowired
	private OrganizationDao organizationDao;
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	
	@Autowired
	private RoleDao roleDao;
	
	@Autowired
	private TransactionHelper transactionHelper;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private UnitConfigDao unitConfigDao;
	
	@Autowired
	private UnitRoleActorDao unitRoleActorDao;
	
	@Autowired
	private UserDao userDao;
	
	@Autowired
	private UserGroupDao userGroupDao;
	
	@Autowired
	private UserHistoryItemDao userHistoryItemDao;
	
	@Autowired
	private WorkflowSchemeDao workflowSchemeDao;
	
	@Autowired
	private WorkflowSchemeEntityDao workflowSchemeEntityDao;
	
	public UnitService() {
		super();
		this.config = Config.getInstance();
	}
	
	public void getRecentUnits(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			List<UserHistoryItemDO> items = userHistoryItemDao.getRecentUnits(0, 10, PermissionSets.VIEW_UNIT.getName());
			List<Map<String, Object>> unitMaps = new ArrayList<Map<String, Object>>();
			for (UserHistoryItemDO item : items) {
				int unitId = Integer.parseInt(item.getEntityId());
				UnitDO unit = unitDao.internalGetById(unitId);
				unitMaps.add(unitDao.convert(unit));
			}
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(unitMaps, request));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getUnitActivityTypeScheme(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			// TODO: 优化逻辑
			Integer id = Integer.parseInt(request.getParameter("unit"));
			UnitConfigDO config = unitConfigDao.getByUnitId(id);
			ActivityTypeSchemeDO activityTypeScheme = config.getActivityTypeScheme();
			List<ActivityTypeSchemeMappingDO> mappings = activityTypeSchemeMappingDao.getByActivityTypeSchemeId(activityTypeScheme.getId());
			List<ActivityTypeFieldScreenSchemeEntityDO> activityTypeFieldScreenSchemeEntities = activityTypeFieldScreenSchemeEntityDao.getSortedSchemesByActivityTypeFieldScreenSchemeId(config.getActivityTypeFieldScreenScheme().getId());
			List<FieldLayoutSchemeEntityDO> fieldLayoutSchemeEntities = fieldLayoutSchemeEntityDao.getByFieldLayoutSchemeId(config.getFieldLayoutScheme().getId());
			List<WorkflowSchemeEntityDO> workflowSchemeEntities = workflowSchemeDao.getByWorkflowSchemeId(config.getWorkflowScheme().getId());
			List<Map<String, Object>> activityTypeMaps = new ArrayList<Map<String, Object>>();
			for (ActivityTypeSchemeMappingDO mapping : mappings) {
				Map<String, Object> activityTypeMap = new HashMap<String, Object>();
				ActivityTypeDO type = mapping.getType();
				activityTypeMap.put("name", type.getName());
				activityTypeMap.put("description", type.getDescription());
				activityTypeMap.put("url", type.getUrl());
				
				ActivityTypeFieldScreenSchemeEntityDO activityTypeFieldScreenSchemeEntity = null;
				ActivityTypeFieldScreenSchemeEntityDO defaultActivityTypeFieldScreenSchemeEntity = null;
				for (ActivityTypeFieldScreenSchemeEntityDO entity : activityTypeFieldScreenSchemeEntities) {
					ActivityTypeDO entityType = entity.getType();
					if (entityType == null) {
						defaultActivityTypeFieldScreenSchemeEntity = entity;
						continue;
					}
					if (type.getId().equals(entityType.getId())) {
						activityTypeFieldScreenSchemeEntity = entity;
						break;
					}
				}
				if (activityTypeFieldScreenSchemeEntity == null) activityTypeFieldScreenSchemeEntity = defaultActivityTypeFieldScreenSchemeEntity;
				FieldScreenSchemeDO fieldScreenScheme = activityTypeFieldScreenSchemeEntity.getFieldScreenScheme();
				activityTypeMap.put("screenId", fieldScreenScheme.getId());
				activityTypeMap.put("screenName", fieldScreenScheme.getName());
				
				FieldLayoutSchemeEntityDO fieldLayoutSchemeEntity = null;
				FieldLayoutSchemeEntityDO defaultFieldLayoutSchemeEntity = null;
				for (FieldLayoutSchemeEntityDO entity : fieldLayoutSchemeEntities) {
					ActivityTypeDO entityType = entity.getType();
					if (entityType == null) {
						defaultFieldLayoutSchemeEntity = entity;
						continue;
					}
					if (type.getId().equals(entityType.getId())) {
						fieldLayoutSchemeEntity = entity;
						break;
					}
				}
				if (fieldLayoutSchemeEntity == null) fieldLayoutSchemeEntity = defaultFieldLayoutSchemeEntity;
				FieldLayoutDO fieldLayout = fieldLayoutSchemeEntity.getLayout();
				activityTypeMap.put("fieldId", fieldLayout.getId());
				activityTypeMap.put("fieldName", fieldLayout.getName());
				
				WorkflowSchemeEntityDO workflowSchemeEntity = null;
				WorkflowSchemeEntityDO defaultWorkflowSchemeEntity = null;
				for (WorkflowSchemeEntityDO entity : workflowSchemeEntities) {
					ActivityTypeDO entityType = entity.getType();
					if (entityType == null) {
						defaultWorkflowSchemeEntity = entity;
						continue;
					}
					if (type.getId().equals(entityType.getId())) {
						workflowSchemeEntity = entity;
						break;
					}
				}
				if (workflowSchemeEntity == null) workflowSchemeEntity = defaultWorkflowSchemeEntity;
				@SuppressWarnings("unchecked")
				Map<String, Object> workflowMap = ((List<Map<String, Object>>) transactionHelper.doInTransaction(new WfSetup(), "GetSetupList", workflowSchemeEntity.getWorkflow())).get(0);
				activityTypeMap.put("workflow", workflowMap);
				
				activityTypeMaps.add(activityTypeMap);
			}
			boolean isAdmin = permissionSetDao.hasPermission(PermissionSets.ADMIN.getName());
			Map<String, Object> data = new HashMap<String, Object>();
			data.put("id", activityTypeScheme.getId());
			data.put("config", config.getId());
			data.put("name", activityTypeScheme.getName());
			data.put("unitName", config.getUnit().getName());
			data.put("action", isAdmin ? new String[] { "编辑安全信息类型", "使用不同的方案" } : new String[] { "使用不同的方案" });
			data.put("schemes", activityTypeMaps);
			data.put("admin", isAdmin);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
			//		} catch (SMSException e) {
			//			e.printStackTrace();
			//			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getUnitConfigSummary(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			int unitId = Integer.parseInt(request.getParameter("unit"));
			Map<String, Object> configMap = unitConfigDao.convert(unitConfigDao.getByUnitId(unitId));
			UnitDO unit = unitDao.internalGetById(unitId);
			configMap.put("unitDescription", unit.getDescription());
			UserDO unitResponsibleUser = unit.getResponsibleUser();
			configMap.put("unitResponsibleUser", unitResponsibleUser.getId());
			configMap.put("unitResponsibleUserUsername", unitResponsibleUser.getUsername());
			configMap.put("unitResponsibleUserFullname", unitResponsibleUser.getFullname());
			AvatarDO avatar = unit.getAvatar();
			if (avatar == null) {
				configMap.put("unitResponsibleUserAvatarUrl", config.getUnitAvatarWebPath() + "/" + config.getDefaultUnitAvatar());
			} else {
				configMap.put("unitResponsibleUserAvatar", avatar.getId());
				configMap.put("unitResponsibleUserAvatarUrl", config.getUnitAvatarWebPath() + "/" + avatar.getFileName());
			}
			
			int activityTypeSchemeId = (Integer) configMap.get("activityTypeScheme");
			List<Map<String, Object>> activityTypeMaps = new ArrayList<Map<String, Object>>();
			for (ActivityTypeSchemeMappingDO mapping : activityTypeSchemeMappingDao.getByActivityTypeSchemeId(activityTypeSchemeId)) {
				activityTypeMaps.add(activityTypeDao.convert(mapping.getType()));
			}
			configMap.put("activityTypeSchemeTypes", activityTypeMaps);
			
			int activityTypeFieldScreenSchemeId = (Integer) configMap.get("activityTypeFieldScreenScheme");
			List<Map<String, Object>> fieldScreenSchemeMaps = new ArrayList<Map<String, Object>>();
			for (ActivityTypeFieldScreenSchemeEntityDO entity : activityTypeFieldScreenSchemeEntityDao.getSortedSchemesByActivityTypeFieldScreenSchemeId(activityTypeFieldScreenSchemeId)) {
				int id = entity.getFieldScreenScheme().getId();
				Map<String, Object> fieldScreenSchemeMap = null;
				for (Map<String, Object> map : fieldScreenSchemeMaps) {
					if (id == (Integer) map.get("id")) {
						fieldScreenSchemeMap = map;
						break;
					}
				}
				if (fieldScreenSchemeMap == null) {
					fieldScreenSchemeMap = fieldScreenSchemeDao.convert(entity.getFieldScreenScheme());
					fieldScreenSchemeMaps.add(fieldScreenSchemeMap);
				}
				if (entity.getType() == null) fieldScreenSchemeMap.put("default", true);
			}
			configMap.put("activityTypeFieldScreenSchemeSchemes", fieldScreenSchemeMaps);
			
			int fieldLayoutSchemeId = (Integer) configMap.get("fieldLayoutScheme");
			List<Map<String, Object>> fieldLayoutMaps = new ArrayList<Map<String, Object>>();
			for (FieldLayoutSchemeEntityDO entity : fieldLayoutSchemeEntityDao.getByFieldLayoutSchemeId(fieldLayoutSchemeId)) {
				int id = entity.getLayout().getId();
				Map<String, Object> fieldLayoutMap = null;
				for (Map<String, Object> map : fieldLayoutMaps) {
					if (id == (Integer) map.get("id")) {
						fieldLayoutMap = map;
						break;
					}
				}
				if (fieldLayoutMap == null) {
					fieldLayoutMap = fieldLayoutDao.convert(entity.getLayout());
					fieldLayoutMaps.add(fieldLayoutMap);
				}
				if (entity.getType() == null) fieldLayoutMap.put("default", true);
			}
			configMap.put("fieldLayoutSchemeLayouts", fieldLayoutMaps);
			
			int workflowSchemeId = (Integer) configMap.get("workflowScheme");
			List<Map<String, Object>> workflowMaps = new ArrayList<Map<String, Object>>();
			List<String> workflowIds = new ArrayList<String>();
			for (WorkflowSchemeEntityDO entity : workflowSchemeEntityDao.getByWorkflowSchemeId(workflowSchemeId)) {
				String id = entity.getWorkflow();
				if (workflowIds.contains(id)) continue;
				workflowIds.add(id);
				@SuppressWarnings("unchecked")
				Map<String, Object> workflowMap = ((List<Map<String, Object>>) transactionHelper.doInTransaction(new WfSetup(), "GetSetupList", id)).get(0);
				workflowMaps.add(workflowMap);
			}
			configMap.put("workflows", workflowMaps);
			
			configMap.put("admin", permissionSetDao.hasPermission(PermissionSets.ADMIN.getName()));
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", configMap);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getUnitFieldScheme(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			int id = Integer.parseInt(request.getParameter("unit"));
			UnitConfigDO config = unitConfigDao.getByUnitId(id);
			ActivityTypeSchemeDO activityTypeScheme = config.getActivityTypeScheme();
			List<ActivityTypeSchemeMappingDO> mappings = activityTypeSchemeMappingDao.getByActivityTypeSchemeId(activityTypeScheme.getId());
			FieldLayoutSchemeDO fieldLayoutScheme = config.getFieldLayoutScheme();
			List<FieldLayoutSchemeEntityDO> fieldLayoutSchemeEntities = fieldLayoutSchemeEntityDao.getByFieldLayoutSchemeId(fieldLayoutScheme.getId());
			List<FieldScreenLayoutItemDO> fieldScreenLayoutItems = fieldScreenLayoutItemDao.getAllList();
			Map<String, List<Map<String, Object>>> keyScreensMap = new HashMap<String, List<Map<String, Object>>>();
			for (FieldScreenLayoutItemDO item : fieldScreenLayoutItems) {
				String key = item.getKey();
				List<Map<String, Object>> screenMaps = keyScreensMap.get(key);
				if (screenMaps == null) {
					screenMaps = new ArrayList<Map<String, Object>>();
					keyScreensMap.put(key, screenMaps);
				}
				Map<String, Object> screenMap = new HashMap<String, Object>();
				FieldScreenDO screen = item.getTab().getScreen();
				screenMap.put("id", screen.getId());
				screenMap.put("name", screen.getName());
				screenMaps.add(screenMap);
			}
			List<Map<String, Object>> fieldLayoutSchemeMaps = new ArrayList<Map<String, Object>>();
			Map<Integer, Map<String, Object>> fieldLayoutSchemeIdMap = new HashMap<Integer, Map<String, Object>>();
			Map<String, Object> defaultFieldLayoutSchemeMap = new HashMap<String, Object>();
			boolean hasDefault = false;
			for (FieldLayoutSchemeEntityDO entity : fieldLayoutSchemeEntities) {
				ActivityTypeDO type = entity.getType();
				if (type != null) {
					boolean contains = false;
					for (ActivityTypeSchemeMappingDO mapping : mappings) {
						if (mapping.getType().getId().equals(type.getId())) {
							mappings.remove(mapping);
							contains = true;
							break;
						}
					}
					if (!contains) continue;
				}
				FieldLayoutDO fieldLayout = entity.getLayout();
				Map<String, Object> fieldLayoutSchemeMap = fieldLayoutSchemeIdMap.get(fieldLayout.getId());
				if (fieldLayoutSchemeMap == null) {
					fieldLayoutSchemeMap = new HashMap<String, Object>();
					fieldLayoutSchemeMap.put("id", fieldLayout.getId());
					fieldLayoutSchemeMap.put("name", fieldLayout.getName());
					List<Map<String, Object>> unitMaps = new ArrayList<Map<String, Object>>();
					List<UnitDO> units = unitDao.getByFieldLayoutId(fieldLayout.getId());
					for (UnitDO unit : units) {
						Map<String, Object> unitMap = new HashMap<String, Object>();
						unitMap.put("id", unit.getId());
						unitMap.put("name", unit.getName());
						if (unit.getAvatar() == null) {
							unitMap.put("avatar", this.config.getUnitAvatarWebPath() + "/" + this.config.getDefaultUnitAvatar());
						} else {
							unitMap.put("avatar", this.config.getUnitAvatarWebPath() + "/" + unit.getAvatar().getFileName());
						}
						unitMaps.add(unitMap);
					}
					fieldLayoutSchemeMap.put("units", unitMaps);
					List<Map<String, Object>> itemMaps = new ArrayList<Map<String, Object>>();
					List<FieldLayoutItemDO> items = fieldLayoutItemDao.getByFieldLayoutId(fieldLayout.getId());
					for (FieldLayoutItemDO item : items) {
						Map<String, Object> itemMap = new HashMap<String, Object>();
						String key = item.getKey();
						itemMap.put("name", fieldRegister.getFieldName(key));
						itemMap.put("description", fieldRegister.getFieldDescription(key));
						itemMap.put("required", item.getRequired());
						String renderer = item.getRenderer();
						itemMap.put("renderer", renderer);
						itemMap.put("rendererName", RendererRegister.getRendererName(renderer));
						itemMap.put("screens", keyScreensMap.get(key));
						itemMaps.add(itemMap);
					}
					fieldLayoutSchemeMap.put("scheme", itemMaps);
					fieldLayoutSchemeMaps.add(fieldLayoutSchemeMap);
					fieldLayoutSchemeIdMap.put(fieldLayout.getId(), fieldLayoutSchemeMap);
				}
				if (type == null) {
					fieldLayoutSchemeMap.put("default", true);
					hasDefault = true;
					if (fieldLayoutSchemeMap.get("activityTypes") == null) fieldLayoutSchemeMap.put("activityTypes", new ArrayList<Map<String, Object>>());
					defaultFieldLayoutSchemeMap = fieldLayoutSchemeMap;
				} else {
					if (fieldLayoutSchemeMap.get("default") == null) fieldLayoutSchemeMap.put("default", false);
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> fieldScreenSchemeActivityTypes = (List<Map<String, Object>>) fieldLayoutSchemeMap.get("activityTypes");
					if (fieldScreenSchemeActivityTypes == null) {
						fieldScreenSchemeActivityTypes = new ArrayList<Map<String, Object>>();
						fieldLayoutSchemeMap.put("activityTypes", fieldScreenSchemeActivityTypes);
					}
					Map<String, Object> activityTypeMap = new HashMap<String, Object>();
					activityTypeMap.put("name", type.getName());
					activityTypeMap.put("url", type.getUrl());
					ActivityTypeDO defaultType = activityTypeScheme.getDefaultType();
					activityTypeMap.put("default", defaultType != null && defaultType.getId().equals(type.getId()));
					fieldScreenSchemeActivityTypes.add(activityTypeMap);
				}
			}
			@SuppressWarnings("unchecked")
			List<Object> defaultActivityTypes = (List<Object>) defaultFieldLayoutSchemeMap.get("activityTypes");
			if (hasDefault && CollectionUtils.isNotEmpty(mappings)) {
				for (ActivityTypeSchemeMappingDO mapping : mappings) {
					ActivityTypeDO type = mapping.getType();
					Map<String, Object> activityTypeMap = new HashMap<String, Object>();
					activityTypeMap.put("name", type.getName());
					activityTypeMap.put("url", type.getUrl());
					ActivityTypeDO defaultType = activityTypeScheme.getDefaultType();
					activityTypeMap.put("default", defaultType != null && defaultType.getId().equals(type.getId()));
					defaultActivityTypes.add(activityTypeMap);
				}
			} else if (defaultActivityTypes.size() == 0) {
				fieldLayoutSchemeMaps.remove(defaultFieldLayoutSchemeMap);
			}
			boolean isAdmin = permissionSetDao.hasPermission(PermissionSets.ADMIN.getName());
			Map<String, Object> data = new HashMap<String, Object>();
			data.put("id", fieldLayoutScheme.getId());
			data.put("config", config.getId());
			data.put("name", fieldLayoutScheme.getName());
			data.put("action", isAdmin ? new String[] { "修改栏目", "使用不同的方案" } : new String[] { "使用不同的方案" });
			data.put("schemes", fieldLayoutSchemeMaps);
			data.put("admin", isAdmin);
			
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
	
	public void getUnitRoles(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			int id = Integer.parseInt(request.getParameter("unit"));
			List<RoleDO> roles = roleDao.getAllList();
			Collections.sort(roles, new Comparator<RoleDO>() {
				
				public int compare(RoleDO a, RoleDO b) {
					return a.getName().compareTo(b.getName());
				}
				
			});
			List<UnitRoleActorDO> actors = unitRoleActorDao.getByUnitId(id);
			Map<Integer, List<UnitRoleActorDO>> roleIdActorMap = new HashMap<Integer, List<UnitRoleActorDO>>();
			for (UnitRoleActorDO actor : actors) {
				int roleId = actor.getRole().getId();
				List<UnitRoleActorDO> roleActors = roleIdActorMap.get(roleId);
				if (roleActors == null) {
					roleActors = new ArrayList<UnitRoleActorDO>();
					roleIdActorMap.put(roleId, roleActors);
				}
				roleActors.add(actor);
			}
			List<Map<String, Object>> roleMaps = new ArrayList<Map<String, Object>>();
			for (RoleDO role : roles) {
				Map<String, Object> roleMap = new HashMap<String, Object>();
				roleMap.put("id", role.getId());
				roleMap.put("name", role.getName());
				if (!roleIdActorMap.containsKey(role.getId())) {
					if (!role.isDeleted()) roleMaps.add(roleMap);
					continue;
				}
				roleMaps.add(roleMap);
				List<Map<String, Object>> userMaps = new ArrayList<Map<String, Object>>();
				List<Map<String, Object>> userGroupMaps = new ArrayList<Map<String, Object>>();
				List<String> userIds = new ArrayList<String>();
				List<String> userGroupIds = new ArrayList<String>();
				for (UnitRoleActorDO actor : roleIdActorMap.get(role.getId())) {
					String type = actor.getType();
					String parameter = actor.getParameter();
					if ("USER".equals(type)) {
						userIds.add(parameter);
					} else if ("USER_GROUP".equals(type)) {
						userGroupIds.add(parameter);
					}
				}
				List<UserDO> users = new ArrayList<UserDO>();
				if (userIds.size() > 0){
					users.addAll((List<UserDO>) userDao.internalGetByIds((String[])userIds.toArray(new String[userIds.size()])));
				}
				List<UserGroupDO> userGroups = new ArrayList<UserGroupDO>();
				if (userGroupIds.size() > 0){
					userGroups.addAll((List<UserGroupDO>) userGroupDao.internalGetByIds((String[])userGroupIds.toArray(new String[userGroupIds.size()])));
				}
				for (UserDO user : users){
					Map<String, Object> userMap = new HashMap<String, Object>();
					userMap.put("id", user.getId());
					userMap.put("username", user.getUsername());
					userMap.put("fullname", user.getFullname());
					AvatarDO avatar = user.getAvatar();
					if (avatar == null) {
						userMap.put("avatarUrl", config.getUserAvatarWebPath() + "/" + config.getUnknownUserAvatar());
					} else {
						userMap.put("avatar", avatar.getId());
						userMap.put("avatarUrl", config.getUserAvatarWebPath() + "/" + avatar.getFileName());
					}
					userMaps.add(userMap);
				}
				for (UserGroupDO userGroup : userGroups){
					Map<String, Object> userGroupMap = new HashMap<String, Object>();
					userGroupMap.put("id", userGroup.getId());
					userGroupMap.put("name", userGroup.getName());
					userGroupMaps.add(userGroupMap);
				}
				roleMap.put("users", userMaps);
				roleMap.put("userGroups", userGroupMaps);
			}
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", roleMaps);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getUnits(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String unitName = request.getParameter("unitName");
			List<UnitDO> units = unitDao.getUnits(PermissionSets.VIEW_UNIT.getName(), unitName);
			List<Map<String, Object>> unitMaps = unitDao.convert(units, Arrays.asList("id", "name", "nameEn", "avatar", "code", "responsibleUser", "category", "description"));
			organizationCache.forceReload();
			for (Map<String, Object> unitMap : unitMaps) {
				List<OrganizationItem> items = organizationCache.getItemsByUnitId((Integer) unitMap.get("id"));
				List<Map<String, Object>> organizationMaps = new ArrayList<Map<String, Object>>();
				if (items != null) {
					for (OrganizationItem item : items) {
						Map<String, Object> organizationMap = organizationDao.convert(item.getOrganization(), Arrays.asList("id", "name", "nameEn"), true, false);
						organizationMap.put("path", item.getPath());
						organizationMaps.add(organizationMap);
					}
				}
				unitMap.put("organization", organizationMaps);
			}
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", unitMaps);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getUnitScreenScheme(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			int id = Integer.parseInt(request.getParameter("unit"));
			UnitConfigDO config = unitConfigDao.getByUnitId(id);
			ActivityTypeSchemeDO activityTypeScheme = config.getActivityTypeScheme();
			List<ActivityTypeSchemeMappingDO> mappings = activityTypeSchemeMappingDao.getByActivityTypeSchemeId(activityTypeScheme.getId());
			ActivityTypeFieldScreenSchemeDO activityTypeFieldScreenScheme = config.getActivityTypeFieldScreenScheme();
			List<ActivityTypeFieldScreenSchemeEntityDO> entities = activityTypeFieldScreenSchemeEntityDao.getSortedSchemesByActivityTypeFieldScreenSchemeId(activityTypeFieldScreenScheme.getId());
			List<Map<String, Object>> fieldScreenSchemeMaps = new ArrayList<Map<String, Object>>();
			Map<Integer, Map<String, Object>> fieldScreenSchemeIdMap = new HashMap<Integer, Map<String, Object>>();
			Map<String, Object> defaultFieldScreenSchemeMap = new HashMap<String, Object>();
			boolean hasDefault = false;
			for (ActivityTypeFieldScreenSchemeEntityDO entity : entities) {
				ActivityTypeDO type = entity.getType();
				if (type != null) {
					boolean contains = false;
					for (ActivityTypeSchemeMappingDO mapping : mappings) {
						if (mapping.getType().getId().equals(type.getId())) {
							mappings.remove(mapping);
							contains = true;
							break;
						}
					}
					if (!contains) continue;
				}
				FieldScreenSchemeDO fieldScreenScheme = entity.getFieldScreenScheme();
				Map<String, Object> fieldScreenSchemeMap = fieldScreenSchemeIdMap.get(fieldScreenScheme.getId());
				if (fieldScreenSchemeMap == null) {
					fieldScreenSchemeMap = new HashMap<String, Object>();
					fieldScreenSchemeMap.put("id", fieldScreenScheme.getId());
					fieldScreenSchemeMap.put("name", fieldScreenScheme.getName());
					List<Map<String, Object>> unitMaps = new ArrayList<Map<String, Object>>();
					List<UnitDO> units = unitDao.getByFieldScreenSchemeId(fieldScreenScheme.getId());
					for (UnitDO unit : units) {
						Map<String, Object> unitMap = new HashMap<String, Object>();
						unitMap.put("id", unit.getId());
						unitMap.put("name", unit.getName());
						if (unit.getAvatar() == null) {
							unitMap.put("avatar", this.config.getUnitAvatarWebPath() + "/" + this.config.getDefaultUnitAvatar());
						} else {
							unitMap.put("avatar", this.config.getUnitAvatarWebPath() + "/" + unit.getAvatar().getFileName());
						}
						unitMaps.add(unitMap);
					}
					fieldScreenSchemeMap.put("units", unitMaps);
					List<Map<String, Object>> operationMaps = new ArrayList<Map<String, Object>>();
					List<FieldScreenSchemeItemDO> items = fieldScreenSchemeItemDao.getByFieldScreenSchemeId(fieldScreenScheme.getId());
					FieldScreenSchemeItemDO defaultItem = null;
					for (FieldScreenSchemeItemDO item : items) {
						if (StringUtils.isEmpty(item.getOperation())) {
							defaultItem = item;
							break;
						}
					}
					for (ActivityOperation operation : ActivityOperation.values()) {
						Map<String, Object> operationMap = new HashMap<String, Object>();
						operationMap.put("name", operation.getName());
						operationMaps.add(operationMap);
						FieldScreenDO screen = null;
						for (FieldScreenSchemeItemDO item : items) {
							if (item.getOperation() != null && item.getOperation().equals(operation.name())) {
								screen = item.getScreen();
								break;
							}
						}
						if (screen == null && defaultItem != null) screen = defaultItem.getScreen();
						if (screen != null) {
							operationMap.put("screenId", screen.getId());
							operationMap.put("screenName", screen.getName());
						}
					}
					fieldScreenSchemeMap.put("scheme", operationMaps);
					fieldScreenSchemeMaps.add(fieldScreenSchemeMap);
					fieldScreenSchemeIdMap.put(fieldScreenScheme.getId(), fieldScreenSchemeMap);
				}
				if (type == null) {
					fieldScreenSchemeMap.put("default", true);
					hasDefault = true;
					if (fieldScreenSchemeMap.get("activityTypes") == null) fieldScreenSchemeMap.put("activityTypes", new ArrayList<Map<String, Object>>());
					defaultFieldScreenSchemeMap = fieldScreenSchemeMap;
				} else {
					if (fieldScreenSchemeMap.get("default") == null) fieldScreenSchemeMap.put("default", false);
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> fieldScreenSchemeActivityTypes = (List<Map<String, Object>>) fieldScreenSchemeMap.get("activityTypes");
					if (fieldScreenSchemeActivityTypes == null) {
						fieldScreenSchemeActivityTypes = new ArrayList<Map<String, Object>>();
						fieldScreenSchemeMap.put("activityTypes", fieldScreenSchemeActivityTypes);
					}
					Map<String, Object> activityTypeMap = new HashMap<String, Object>();
					activityTypeMap.put("name", type.getName());
					activityTypeMap.put("url", type.getUrl());
					ActivityTypeDO defaultType = activityTypeScheme.getDefaultType();
					activityTypeMap.put("default", defaultType != null && defaultType.getId().equals(type.getId()));
					fieldScreenSchemeActivityTypes.add(activityTypeMap);
				}
			}
			@SuppressWarnings("unchecked")
			List<Object> defaultActivityTypes = (List<Object>) defaultFieldScreenSchemeMap.get("activityTypes");
			if (hasDefault && CollectionUtils.isNotEmpty(mappings)) {
				for (ActivityTypeSchemeMappingDO mapping : mappings) {
					ActivityTypeDO type = mapping.getType();
					Map<String, Object> activityTypeMap = new HashMap<String, Object>();
					activityTypeMap.put("name", type.getName());
					activityTypeMap.put("url", type.getUrl());
					ActivityTypeDO defaultType = activityTypeScheme.getDefaultType();
					activityTypeMap.put("default", defaultType != null && defaultType.getId().equals(type.getId()));
					defaultActivityTypes.add(activityTypeMap);
				}
			} else if (defaultActivityTypes.size() == 0) {
				fieldScreenSchemeMaps.remove(defaultFieldScreenSchemeMap);
			}
			boolean isAdmin = permissionSetDao.hasPermission(PermissionSets.ADMIN.getName());
			Map<String, Object> data = new HashMap<String, Object>();
			data.put("id", activityTypeFieldScreenScheme.getId());
			data.put("config", config.getId());
			data.put("name", activityTypeFieldScreenScheme.getName());
			data.put("action", isAdmin ? new String[] { "修改界面", "使用不同的方案" } : new String[] { "使用不同的方案" });
			data.put("schemes", fieldScreenSchemeMaps);
			data.put("admin", isAdmin);
			
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
	
	public void addActivityTypeSchemeForUnit(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			int unitId = Integer.parseInt(request.getParameter("unit"));
			String obj = request.getParameter("obj");
			Map<String, Object> objMap = gson.fromJson(obj, new TypeToken<Map<String, Object>>() {}.getType());
			unitDao.addActivityTypeSchemeForUnit(unitId, objMap);
			
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
	
	/**
	 * 获取当前用户所在的安监机构
	 * 
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void getUnitsByCurrentUser(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			UserDO user = UserContext.getUser();
			List<UnitDO> units = unitDao.getUnitsByUser(user);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(unitDao.convert(units), request));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void setUnitRoles(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String obj = request.getParameter("obj");
			Map<String, Object> objMap = gson.fromJson(obj, new TypeToken<Map<String, Object>>() {}.getType());
			int unitId = ((Number) objMap.get("unit")).intValue();
			if (objMap.containsKey("roles")) {
				@SuppressWarnings("unchecked")
				List<Number> roles =((List<Number>) objMap.get("roles"));
				roles = roles == null ? new ArrayList<Number>() : roles;
				int userId = ((Number) objMap.get("user")).intValue();
				unitRoleActorDao.setUnitRoles(unitId, roles, userId);
			} else {
				int roleId = ((Number) objMap.get("role")).intValue();
				@SuppressWarnings("unchecked")
				List<Number> users = (List<Number>) objMap.get("users");
				@SuppressWarnings("unchecked")
				List<Number> userGroups = (List<Number>) objMap.get("userGroups");
				unitRoleActorDao.setUnitRoles(unitId, roleId, users, userGroups);
			}
			
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
	
	/**
	 * 获取用户角色所在安监机构及用户所在组织对应的安监机构
	 */
	public void getUserUnits(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String term = request.getParameter("term");
			List<UnitDO> units = unitDao.getUserUnits(UserContext.getUser(), term, true);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(unitDao.convert(units, Arrays.asList(new String[]{"id", "name"}), false), request));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void setActivityTypeDao(ActivityTypeDao activityTypeDao) {
		this.activityTypeDao = activityTypeDao;
	}
	
	public void setActivityTypeSchemeMappingDao(ActivityTypeSchemeMappingDao activityTypeSchemeMappingDao) {
		this.activityTypeSchemeMappingDao = activityTypeSchemeMappingDao;
	}
	
	public void setActivityTypeFieldScreenSchemeEntityDao(ActivityTypeFieldScreenSchemeEntityDao activityTypeFieldScreenSchemeEntityDao) {
		this.activityTypeFieldScreenSchemeEntityDao = activityTypeFieldScreenSchemeEntityDao;
	}
	
	public void setFieldLayoutDao(FieldLayoutDao fieldLayoutDao) {
		this.fieldLayoutDao = fieldLayoutDao;
	}
	
	public void setFieldLayoutItemDao(FieldLayoutItemDao fieldLayoutItemDao) {
		this.fieldLayoutItemDao = fieldLayoutItemDao;
	}
	
	public void setFieldLayoutSchemeEntityDao(FieldLayoutSchemeEntityDao fieldLayoutSchemeEntityDao) {
		this.fieldLayoutSchemeEntityDao = fieldLayoutSchemeEntityDao;
	}
	
	public void setFieldRegister(FieldRegister fieldRegister) {
		this.fieldRegister = fieldRegister;
	}
	
	public void setFieldScreenLayoutItemDao(FieldScreenLayoutItemDao fieldScreenLayoutItemDao) {
		this.fieldScreenLayoutItemDao = fieldScreenLayoutItemDao;
	}
	
	public void setFieldScreenSchemeDao(FieldScreenSchemeDao fieldScreenSchemeDao) {
		this.fieldScreenSchemeDao = fieldScreenSchemeDao;
	}
	
	public void setFieldScreenSchemeItemDao(FieldScreenSchemeItemDao fieldScreenSchemeItemDao) {
		this.fieldScreenSchemeItemDao = fieldScreenSchemeItemDao;
	}
	
	public void setOrganizationCache(OrganizationCache organizationCache) {
		this.organizationCache = organizationCache;
	}
	
	public void setOrganizationDao(OrganizationDao organizationDao) {
		this.organizationDao = organizationDao;
	}
	
	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}
	
	public void setRoleDao(RoleDao roleDao) {
		this.roleDao = roleDao;
	}
	
	public void setTransactionHelper(TransactionHelper transactionHelper) {
		this.transactionHelper = transactionHelper;
	}
	
	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}
	
	public void setUnitConfigDao(UnitConfigDao unitConfigDao) {
		this.unitConfigDao = unitConfigDao;
	}
	
	public void setUnitRoleActorDao(UnitRoleActorDao unitRoleActorDao) {
		this.unitRoleActorDao = unitRoleActorDao;
	}
	
	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}
	
	public void setUserGroupDao(UserGroupDao userGroupDao) {
		this.userGroupDao = userGroupDao;
	}
	
	public void setUserHistoryItemDao(UserHistoryItemDao userHistoryItemDao) {
		this.userHistoryItemDao = userHistoryItemDao;
	}
	
	public void setWorkflowSchemeDao(WorkflowSchemeDao workflowSchemeDao) {
		this.workflowSchemeDao = workflowSchemeDao;
	}
	
	public void setWorkflowSchemeEntityDao(WorkflowSchemeEntityDao workflowSchemeEntityDao) {
		this.workflowSchemeEntityDao = workflowSchemeEntityDao;
	}
	
}
