
package com.usky.sms.workflow;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.activity.ActivityDao;
import com.usky.sms.activity.type.ActivityTypeDO;
import com.usky.sms.activity.type.ActivityTypeDao;
import com.usky.sms.activity.type.ActivityTypeSchemeMappingDO;
import com.usky.sms.activity.type.ActivityTypeSchemeMappingDao;
import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.config.Config;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.core.TransactionHelper;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.sync.SynchronizeService;
import com.usky.sms.unit.UnitConfigDO;
import com.usky.sms.unit.UnitConfigDao;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.uwf.WfSetup;

public class WorkflowService extends AbstractService {
	
	private Config config;
	
	@Autowired
	private ActivityDao activityDao;
	
	@Autowired
	private ActivityTypeDao activityTypeDao;
	
	@Autowired
	private ActivityTypeSchemeMappingDao activityTypeSchemeMappingDao;
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	
	@Autowired
	private TransactionHelper transactionHelper;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private UnitConfigDao unitConfigDao;
	
	@Autowired
	private WorkflowSchemeDao workflowSchemeDao;
	
	@Autowired
	private WorkflowSchemeEntityDao workflowSchemeEntityDao;
	
	@Autowired
	private SynchronizeService synchronizeService;
	
	public WorkflowService() {
		super();
		this.config = Config.getInstance();
	}
	
	public void copyWorkflowScheme(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			Integer id = Integer.parseInt(request.getParameter("workflowScheme"));
			String name = request.getParameter("name");
			String description = request.getParameter("description");
			workflowSchemeDao.copy(id, name, description);
			
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
	
	public void operate(HttpServletRequest request, HttpServletResponse response) throws Exception {
		int id = Integer.parseInt(request.getParameter("id"));
		String dataobject = request.getParameter("dataobject");
		try {
			String action = request.getParameter("action") == null ? "" : request.getParameter("action");
			@SuppressWarnings("unchecked")
			Map<String, Object> actionUsers = gson.fromJson(request.getParameter("actionUsers"), Map.class);
			Map<String, Object> objmap = new HashMap<String, Object>();
			objmap.put("id", id);
			objmap.put("dataobject", dataobject);
			objmap.put("actionUsers", actionUsers);
			Boolean result = workflowSchemeDao.operate(action, gson.toJson(objmap));
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", result);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} finally {
			if ("activity".equals(dataobject)) {
				ActivityDO activity = activityDao.internalGetById(id);
				List<ActivityDO> activities = new ArrayList<ActivityDO>();
				activities.add(activity);
				synchronizeService.synchronizeActivityWithThreads(activities, false);
			}
			
		}
	}
	
	public void getDistributableEntities(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String unit = request.getParameter("unit");
			List<ActivityTypeSchemeMappingDO> mappings = null;
			if (unit != null) {
				int unitId = Integer.parseInt(unit);
				UnitConfigDO config = unitConfigDao.getByUnitId(unitId);
				mappings = activityTypeSchemeMappingDao.getByActivityTypeSchemeId(config.getActivityTypeScheme().getId());
			}
			int schemeId = Integer.parseInt(request.getParameter("workflowScheme"));
			String workflow = request.getParameter("workflow");
			List<Map<String, Object>> typeMaps = new ArrayList<Map<String, Object>>();
			List<ActivityTypeDO> types;
			if (unit == null) {
				types = activityTypeDao.getAllList();
			} else {
				types = new ArrayList<ActivityTypeDO>();
				for (ActivityTypeSchemeMappingDO mapping : mappings) {
					types.add(mapping.getType());
				}
			}
			List<WorkflowSchemeEntityDO> entities = workflowSchemeEntityDao.getByWorkflowSchemeId(schemeId);
			Map<Integer, WorkflowSchemeEntityDO> typeEntityMap = new HashMap<Integer, WorkflowSchemeEntityDO>();
			WorkflowSchemeEntityDO defaultEntity = null;
			for (WorkflowSchemeEntityDO entity : entities) {
				if (workflow.equals(entity.getWorkflow())) {
					if (entity.getType() != null) typeEntityMap.put(entity.getType().getId(), null);
				} else if (entity.getType() == null) {
					defaultEntity = entity;
				} else {
					typeEntityMap.put(entity.getType().getId(), entity);
				}
			}
			if (unit == null && defaultEntity != null) {
				Map<String, Object> typeMap = new HashMap<String, Object>();
				@SuppressWarnings("unchecked")
				Map<String, Object> workflowMap = ((List<Map<String, Object>>) transactionHelper.doInTransaction(new WfSetup(), "GetSetupList", defaultEntity.getWorkflow())).get(0);
				typeMap.put("workflow", workflowMap);
				typeMaps.add(typeMap);
			}
			for (ActivityTypeDO type : types) {
				WorkflowSchemeEntityDO entity = typeEntityMap.get(type.getId());
				if (typeEntityMap.containsKey(type.getId()) && entity == null) continue;
				if (unit != null && entity == null) {
					if (defaultEntity == null) continue;
					entity = defaultEntity;
				}
				Map<String, Object> typeMap = activityTypeDao.convert(type);
				if (entity != null) {
					@SuppressWarnings("unchecked")
					Map<String, Object> workflowMap = ((List<Map<String, Object>>) transactionHelper.doInTransaction(new WfSetup(), "GetSetupList", entity.getWorkflow())).get(0);
					typeMap.put("workflow", workflowMap);
				}
				typeMaps.add(typeMap);
			}
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", typeMaps);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getWorkflowActivityStatusLog(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			int activityId = Integer.parseInt(request.getParameter("activity"));
			ActivityDO activity = activityDao.internalGetById(activityId);
			@SuppressWarnings("unchecked")
			List<Map<String, Object>> result = (List<Map<String, Object>>) transactionHelper.doInTransaction(new WfSetup(), "GetWfActivityStatusLog", activity.getWorkflowId());
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", result);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getWorkflowByUnitAndType(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			int unitId = Integer.parseInt(request.getParameter("unit"));
			int typeId = Integer.parseInt(request.getParameter("type"));
			WorkflowSchemeEntityDO entity = workflowSchemeEntityDao.getByUnitAndType(unitId, typeId);
			if (entity == null) entity = workflowSchemeEntityDao.getByUnitAndNullType(unitId);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", entity.getWorkflow());
			map.put("admin", permissionSetDao.hasPermission(PermissionSets.ADMIN.getName()));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getWorkflowSchemeEntities(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			boolean manage = Boolean.parseBoolean(request.getParameter("manage"));
			Integer unitId = null;
			int schemeId;
			UnitConfigDO config = null;
			WorkflowSchemeDO scheme;
			List<ActivityTypeSchemeMappingDO> mappings = null;
			if (manage) {
				schemeId = Integer.parseInt(request.getParameter("workflowScheme"));
				scheme = workflowSchemeDao.internalGetById(schemeId);
			} else {
				unitId = Integer.parseInt(request.getParameter("unit"));
				config = unitConfigDao.getByUnitId(unitId);
				scheme = config.getWorkflowScheme();
				schemeId = scheme.getId();
				mappings = activityTypeSchemeMappingDao.getByActivityTypeSchemeId(config.getActivityTypeScheme().getId());
			}
			List<WorkflowSchemeEntityDO> entities = workflowSchemeEntityDao.getByWorkflowSchemeId(schemeId);
			List<Map<String, Object>> workflowMaps = new ArrayList<Map<String, Object>>();
			Map<String, Map<String, Object>> idWorkflowMap = new HashMap<String, Map<String, Object>>();
			Map<String, Object> defaultWorkflowMap = null;
			for (WorkflowSchemeEntityDO entity : entities) {
				ActivityTypeDO type = entity.getType();
				if (!manage && type != null) {
					boolean contains = false;
					for (ActivityTypeSchemeMappingDO mapping : mappings) {
						if (type.getId().intValue() == mapping.getType().getId()) {
							mappings.remove(mapping);
							contains = true;
							break;
						}
					}
					if (!contains) continue;
				}
				String id = entity.getWorkflow();
				Map<String, Object> workflowMap = idWorkflowMap.get(id);
				if (workflowMap == null) {
					@SuppressWarnings("unchecked")
					List<Map<String, Object>> list = (List<Map<String, Object>>) transactionHelper.doInTransaction(new WfSetup(), "GetSetupList", id);
					workflowMap = list.get(0);
					idWorkflowMap.put(id, workflowMap);
					workflowMaps.add(workflowMap);
				}
				if (!manage && type == null) defaultWorkflowMap = workflowMap;
				@SuppressWarnings("unchecked")
				List<Map<String, Object>> typeMaps = (List<Map<String, Object>>) workflowMap.get("types");
				if (typeMaps == null) {
					typeMaps = new ArrayList<Map<String, Object>>();
					workflowMap.put("types", typeMaps);
				}
				Map<String, Object> typeMap = type == null ? new HashMap<String, Object>() : activityTypeDao.convert(type);
				typeMap.put("entityId", entity.getId());
				if (type == null) {
					if (manage) typeMaps.add(0, typeMap);
				} else {
					typeMaps.add(typeMap);
				}
			}
			if (!manage && defaultWorkflowMap != null) {
				@SuppressWarnings("unchecked")
				List<Map<String, Object>> typeMaps = (List<Map<String, Object>>) defaultWorkflowMap.get("types");
				if (typeMaps.size() == 0 && mappings.size() == 0) workflowMaps.remove(defaultWorkflowMap);
				for (ActivityTypeSchemeMappingDO mapping : mappings) {
					typeMaps.add(activityTypeDao.convert(mapping.getType()));
				}
			}
			List<UnitDO> units = unitDao.getByWorkflowSchemeId(schemeId);
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
			data.put("name", scheme.getName());
			data.put("description", scheme.getDescription());
			data.put("workflows", PageHelper.getPagedResult(workflowMaps, request));
			data.put("units", unitMaps);
			if (!manage) {
				data.put("config", config.getId());
				data.put("admin", permissionSetDao.hasPermission(PermissionSets.ADMIN.getName()));
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
	
	/**
	 * 获取工作流当前节点的属性的map
	 * @param workflowId
	 * @return
	 */
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public Map<String, Object> getWorkflowNodeAttributes(String workflowId) {
		if (workflowId == null) return null;
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> attributes = (List<Map<String, Object>>) transactionHelper.doInTransaction(new WfSetup(), "GetCurrentNodeAttributes", workflowId);
		Map<String, Object> map = new HashMap<String, Object>();
		// 将list里的map放在一个map里
		for (Map<String, Object> attribute : attributes) {
			map.put((String) attribute.get("ATTR_NAME"), attribute.get("ATTR_VALUE"));
		}
		return map;
	}
	
	/**
	 * 获取流程可操作列表
	 * @param workflowId
	 * @return
	 */
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getActions(String workflowId) {
		if (workflowId == null) return null;
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> actions = (List<Map<String, Object>>) transactionHelper.doInTransaction(new WfSetup(), "GetUserPathList", UserContext.getUserId().toString(), workflowId);
		return actions;
	}
	
	/**
	 * 获取流程可操作列表及其属性
	 * @param workflowId
	 * @return
	 */
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getActionsWithAttributes(String workflowId) {
		if (workflowId == null) return null;
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> actions = (List<Map<String, Object>>) transactionHelper.doInTransaction(new WfSetup(), "GetUserPathListWithAttibutes", UserContext.getUserId().toString(), workflowId);
		return actions;
	}
	
	/**
	 * 获取流程所有操作列表及其属性
	 * @param workflowId
	 * @return
	 */
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getAllActionsWithAttributes(String workflowId) {
		if (workflowId == null) return null;
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> actions = (List<Map<String, Object>>) transactionHelper.doInTransaction(new WfSetup(), "GetPathListWithAttibutes", "", workflowId);
		return actions;
	}
	
	/**
	 * 获取流程的日志
	 * @param workflowId
	 * @return
	 */
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getWorkflowLogs(String flowId){
		if (flowId != null) {
			@SuppressWarnings("unchecked")
			List<Map<String, Object>> workflowLogs = (List<Map<String, Object>>) transactionHelper.doInTransaction(new WfSetup(), "GetWfActivityStatusLog", flowId);
			return workflowLogs;
		}
		return null;
	}
	
	/**
	 * 获取流程的日志和当前状态及处理人
	 * @param workflowId
	 * @return
	 */
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getWorkflowLogsAndCurrentStatus(String flowId){
		if (flowId != null) {
			@SuppressWarnings("unchecked")
			List<Map<String, Object>> workflowLogs = (List<Map<String, Object>>) transactionHelper.doInTransaction(new WfSetup(), "getWfActivityStatusLogAndCurrentStatus", flowId);
			return workflowLogs;
		}
		return null;
	}
	
	/**
	 * 获取工作流模板
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public void getWorkflowTemplates(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String name = request.getParameter("name") == null ? "" : request.getParameter("name");
			@SuppressWarnings("unchecked")
			List<Map<String, Object>> workflows = (List<Map<String, Object>>) transactionHelper.doInTransaction(new WfSetup(), "getWorkflowTemplates", name);
			
			for (Map<String, Object> workflow : workflows) {
				workflow.put("id", (String) workflow.get("wt_id"));
			}
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", workflows);
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
	 * 取指定路径的下一节点的处理人
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void getNextStepProcessors(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			if (request.getParameter("action") == null) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "参数action不能为空");
			}
			String action = request.getParameter("action");
			String dataobject = request.getParameter("dataobject");
			Map<String, Object> objmap = new HashMap<String, Object>();
			objmap.put("dataobject", dataobject);
			@SuppressWarnings("unchecked")
			Map<String, Object> pathInfo = (Map<String, Object>) transactionHelper.doInTransaction(new WfSetup(), "getNextStepProcessors", UserContext.getUserId().toString(), action, gson.toJson(objmap));
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", pathInfo);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void setActivityDao(ActivityDao activityDao) {
		this.activityDao = activityDao;
	}
	
	public void setActivityTypeDao(ActivityTypeDao activityTypeDao) {
		this.activityTypeDao = activityTypeDao;
	}
	
	public void setActivityTypeSchemeMappingDao(ActivityTypeSchemeMappingDao activityTypeSchemeMappingDao) {
		this.activityTypeSchemeMappingDao = activityTypeSchemeMappingDao;
	}
	
	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
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
	
	public void setWorkflowSchemeDao(WorkflowSchemeDao workflowSchemeDao) {
		this.workflowSchemeDao = workflowSchemeDao;
	}
	
	public void setWorkflowSchemeEntityDao(WorkflowSchemeEntityDao workflowSchemeEntityDao) {
		this.workflowSchemeEntityDao = workflowSchemeEntityDao;
	}

	public void setSynchronizeService(SynchronizeService synchronizeService) {
		this.synchronizeService = synchronizeService;
	}
}
