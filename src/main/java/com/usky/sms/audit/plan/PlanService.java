
package com.usky.sms.audit.plan;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.audit.EnumAuditRole;
import com.usky.sms.audit.improve.ImproveDO;
import com.usky.sms.audit.improve.ImproveDao;
import com.usky.sms.audit.improvenotice.ImproveNoticeDO;
import com.usky.sms.audit.improvenotice.ImproveNoticeDao;
import com.usky.sms.audit.task.TaskDO;
import com.usky.sms.audit.task.TaskDao;
import com.usky.sms.common.DateHelper;
import com.usky.sms.common.NumberHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.organization.OrganizationDO;
import com.usky.sms.organization.OrganizationDao;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.unit.UnitRoleActorDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.workflow.WorkflowService;

public class PlanService extends AbstractService {
	
	@Autowired
	private PlanDao planDao;
	
	@Autowired
	private TaskDao taskDao;
	
	@Autowired
	private DictionaryDao dictionaryDao;
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	
	@Autowired
	private WorkflowService workflowService;
	
	@Autowired
	private ImproveDao improveDao;
	
	@Autowired
	private OrganizationDao organizationDao;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private UnitRoleActorDao unitRoleActorDao;
	
	@Autowired
	private ImproveNoticeDao improveNoticeDao;
	
	public void getPlanByYearAndType(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String obj = request.getParameter("obj");
			Map<String, Object> objMap = gson.fromJson(obj,  new TypeToken<Map<String, Object>>() {}.getType());
			@SuppressWarnings("unchecked")
			List<Integer> years = objMap.get("year") == null ? null : doubelListToIntegerList((List<Double>)objMap.get("year"));
			String planType = objMap.get("planType") == null ? null : objMap.get("planType").toString();
			String checkType = objMap.get("checkType") == null ? null : objMap.get("checkType").toString();
			String operator = objMap.get("operator") == null ? null : objMap.get("operator").toString();
			@SuppressWarnings("unchecked")
			List<Integer> targetIds = objMap.get("targetIds") == null ? null : doubelListToIntegerList((List<Double>)objMap.get("targetIds"));
			if (null == years) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "参数年不能为空！");
			}
			if (null == planType) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "参数类型不能为空！");
			}
			List<PlanDO> plans = planDao.getPlanByYearAndType(years, planType, checkType, operator);
			List<Map<String, Object>> targets = planDao.getTargetMaps(plans, planType, checkType, operator, targetIds);
			List<Map<String, Object>> planMaps = new ArrayList<Map<String,Object>>();
			// 遍历每个计划表
			for (PlanDO plan : plans) {
				// 将targets克隆一份
				List<Map<String, Object>> planTargets = new ArrayList<Map<String,Object>>();
				for (Map<String, Object> target : targets) {
					Map<String, Object> planTarget = new HashMap<String, Object>();
					planTarget.putAll(target);
					planTargets.add(planTarget);
				}
				Set<TaskDO> tasks = plan.getTasks();
				List<ImproveNoticeDO> improveNotices = null;
				List<ImproveDO> improves = null;
				if (EnumPlanType.SPEC.toString().equals(planType) || EnumPlanType.SPOT.toString().equals(planType)) { // 现场检查和专项检查时一个工作单对应整改通知单
					improveNotices = improveNoticeDao.getByPlanId(plan.getId());
				}else{
					improves = improveDao.getByPlanId(plan.getId());
				}
				
				// 对targets进行深层拷贝
				Map<String, Object> planMap = planDao.convert(plan);
				for (Map<String, Object> target : planTargets) {
					List<Map<String, Object>> taskMaps = new ArrayList<Map<String, Object>>();
					String targetId = target.get("id").toString();
					if (null != tasks) {
						for (TaskDO task : tasks) {
							if (!task.isDeleted() && targetId.equals(task.getTarget())) {
								Map<String, Object> taskMap = new HashMap<String, Object>();
								taskMap.put("id", task.getId());
								taskMap.put("flowStatus", task.getFlowStatus());
								taskMap.put("flowStep", task.getFlowStep());
								taskMap.put("planTime", task.getPlanTime());
								taskMap.put("generateReportDate", DateHelper.formatIsoDate(task.getGenerateReportDate()));
								taskMap.put("closeDate", DateHelper.formatIsoDate(task.getCloseDate()));
								taskMap.put("workNo", task.getWorkNo());//20160229加入
								if (EnumPlanType.SPEC.toString().equals(planType) || EnumPlanType.SPOT.toString().equals(planType)) { // 现场检查和专项检查时一个工作单对应整改通知单
									List<Map<String, Object>> improveNoticeMaps = new ArrayList<Map<String, Object>>();
									for (ImproveNoticeDO improveNotice : improveNotices) {
										if (task.getId().equals(improveNotice.getTaskId())) {
											Map<String, Object> improveNoticeMap = improveNoticeDao.convert(improveNotice, Arrays.asList(new String[]{"id", "created", "status", "generateTraceDate"}),false);
											improveNoticeMap.putAll(improveNoticeDao.getCompleteDateAndDelayDate(improveNotice));
											improveNoticeMaps.add(improveNoticeMap);
										}
									}
									taskMap.put("improveNotices", improveNoticeMaps);
								} else {
									if (null != improves) {
										for (ImproveDO improve : improves) {
											if (task.equals(improve.getTask())) {
												Map<String, Object> improveMap = improveDao.convert(improve,Arrays.asList(new String[]{"id", "flowStatus", "flowStep", "created", "generateTraceDate"}),false);
												improveMap.putAll(improveDao.getCompleteDateAndDelayDate(improve));
												taskMap.put("improve", improveMap);
												break;
											}
										}
									}
								}
								if (EnumPlanType.TERM.toString().equals(planType)){
									UnitDO unit = task.getOperator() == null ? null : unitDao.internalGetById(NumberHelper.toInteger(task.getOperator()));
									taskMap.put("unitId", unit == null ? "" : unit.getId());
									taskMap.put("unitName", unit == null ? "" : unit.getName());
								}
								taskMaps.add(taskMap);
							}
						}
					}
					target.put("tasks", taskMaps);
				}
				
				planMap.put("targets", planTargets);
				planMaps.add(planMap);
			}
			
			Map<String, Object> dataMap = new HashMap<String, Object>();
			dataMap.put("plans", planMaps);
			
			// 如果是获取某一年的数据取出工作流节点配置的属性
			if (years.size() == 1 && planMaps.size() == 1) {
				String flowId = (String) planMaps.get(0).get("flowId");
				Map<String, Object> workflowNodeAttributes = workflowService.getWorkflowNodeAttributes(flowId);
				// 流程节点的属性
				dataMap.put("workflowNodeAttributes", workflowNodeAttributes);
				// 可操作列表
				dataMap.put("actions", workflowService.getActionsWithAttributes(flowId));
				// 流程日志
				Map<String, Object> logArea = new HashMap<String, Object>();
				logArea.put("key", "com.audit.comm_file.logs");
				logArea.put("workflowLogs", workflowService.getWorkflowLogsAndCurrentStatus(flowId));
				dataMap.put("logArea", logArea);
				//判断登录人有无权限查看计划右键菜单
				if (EnumPlanType.SYS.toString().equals(planType) || EnumPlanType.SUB2.toString().equals(planType) || EnumPlanType.SUB3.toString().equals(planType) || null != checkType) {
					dataMap.put("boolSeeTask", planDao.boolSeePlan(planType, checkType));
				}
			}
			
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", dataMap);

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
	 * 获取创建审计计划的权限
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void getAddPlanPermission(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try{
			String unitId = request.getParameter("unitId");
			// 创建审计计划的权限
			boolean addable = false;
//			Integer year = Integer.parseInt(request.getParameter("year"));
			String planType = request.getParameter("planType");
			String checkType = request.getParameter("checkType");
			// 如果没有计划时再判断是否有权限
//			if (!planDao.hasPlanByYearAndType(year, planType, checkType, unitId)) {
				if (EnumCheckGrade.SYS.toString().equals(checkType)) { // 系统级的检查时,判断用户是否具有创建公司级检查计划的权限
					addable = permissionSetDao.hasPermission(PermissionSets.ADD_SYS_CHECK_PLAN.getName());
				} else if (EnumCheckGrade.SUB2.toString().equals(checkType)) { // 分子公司的检查时, 判断用户是否具有创建分子公司检查计划的权限
					if (!StringUtils.isBlank(unitId)) {
						addable = permissionSetDao.hasUnitPermission(Integer.parseInt(unitId), PermissionSets.ADD_SUB_CHECK_PLAN.getName());
					}
				} else if (EnumPlanType.SYS.toString().equals(planType)) { // 系统级的时候
					addable = permissionSetDao.hasPermission(PermissionSets.ADD_SYS_PLAN.getName());
				} else if (EnumPlanType.SUB2.toString().equals(planType)){
					if (!StringUtils.isBlank(unitId)) {
						addable = permissionSetDao.hasUnitPermission(Integer.parseInt(unitId), PermissionSets.ADD_SUB_PLAN.getName());
					}
				} else if (EnumPlanType.SUB3.toString().equals(planType)){
					if (!StringUtils.isBlank(unitId)) {
						Integer organizationId = Integer.parseInt(unitId);
						OrganizationDO organization = organizationDao.internalGetById(organizationId);
						if (organization.getUnit() != null){
							addable = permissionSetDao.hasUnitPermission(organization.getUnit().getId(), PermissionSets.ADD_SUB3_PLAN.getName());
							if (addable){
								addable = organizationDao.isOrganizationAndUser(organizationId, UserContext.getUserId());
							}
						}
					}
				} else if (EnumPlanType.TERM.toString().equals(planType)){ //航站审计
					addable = permissionSetDao.hasPermission(PermissionSets.ADD_TERM_PLAN.getName()); //是否为一级审计主管
				}
//			}
			Map<String, Object> permissionMap = new HashMap<String, Object>();
			permissionMap.put("addable", addable);
			
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", permissionMap);
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
	 * 获取创建最早的计划的年份<br>
	 * 如果还没有计划则返回当前年份
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void getFirstPlanYear(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String planType = request.getParameter("planType");
			// 检查的类型
			String checkType = request.getParameter("checkType");
			Integer year = planDao.getFirstPlanYear(planType, checkType);
			if (null == year) {
				year = DateHelper.getCalendar().get(Calendar.YEAR);
			}
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", year);
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
	 * 获取检查的级别
	 * @param request
	 * @param response
	 */
	public void getCheckGrade(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
			for (EnumCheckGrade checkGrade : EnumCheckGrade.values()) {
				Map<String, Object> checkGradeMap = new HashMap<String, Object>();
				checkGradeMap.put("id", checkGrade.toString());
				checkGradeMap.put("name", checkGrade.getDescription());
				list.add(checkGradeMap);
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
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
	 * 获取计划的类别
	 * @param request
	 * @param response
	 */
	public void getPlanType(HttpServletRequest request, HttpServletResponse response) {
		try {
			// 类别
			String category = request.getParameter("category");
			List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
			for (EnumPlanType planType : EnumPlanType.values()) {
				if (null != category && !planType.getCategory().equals(category)) {
					continue;
				}
				Map<String, Object> planTypeMap = new HashMap<String, Object>();
				planTypeMap.put("id", planType.toString());
				planTypeMap.put("name", planType.getDescription());
				list.add(planTypeMap);
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
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
	 * 判断当前用户是否是三级审计主管
	 * @param request
	 * @param response
	 */
	public void checkThirdGradeAuditMaster(HttpServletRequest request, HttpServletResponse response) {
		try {
			boolean isThirdGradeAuditMaster = false;
			Integer unitId = request.getParameter("unitId") == null ? null : Integer.parseInt((String) request.getParameter("unitId"));
			DictionaryDO dic = dictionaryDao.getByTypeAndKey("审计角色", EnumAuditRole.THIRD_GRADE_AUDIT_MASTER.getKey());
			if (null == dic) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_133000006, "审计角色", EnumAuditRole.THIRD_GRADE_AUDIT_MASTER.getKey());
			}
			if (null != unitId) {
				List<UserDO> users = unitRoleActorDao.getUsersByUnitIdAndRoleName(unitId, dic.getName(), null);
				if (users.contains(UserContext.getUser())) {
					isThirdGradeAuditMaster = true;
				}
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", isThirdGradeAuditMaster);
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
	 * 获取检查初始查询条件
	 * @param request
	 * @param response
	 */
	public void getCheckInitSearchCondition(HttpServletRequest request, HttpServletResponse response) {
		try {
			UnitDO anJianBu = unitDao.getAnJianBu(true);
			List<UnitDO> units = unitDao.getUnits(PermissionSets.VIEW_UNIT.getName());
			Map<String, Object> checkGradeMap = new HashMap<String, Object>();
			Map<String, Object> unitMap = new HashMap<String, Object>();
			if (units.contains(anJianBu)) { // 是安监部时
				checkGradeMap.put("id", EnumCheckGrade.SYS.toString());
				checkGradeMap.put("name", EnumCheckGrade.SYS.getDescription());
				unitMap.put("id", anJianBu.getId());
				unitMap.put("name", anJianBu.getName());
			} else {
				checkGradeMap.put("id", EnumCheckGrade.SUB2.toString());
				checkGradeMap.put("name", EnumCheckGrade.SUB2.getDescription());
				if (!units.isEmpty()) {
					unitMap.put("id", units.get(0).getId());
					unitMap.put("name", units.get(0).getName());
				}
			}
			Map<String, Object> dataMap = new HashMap<String, Object>();
			dataMap.put("checkGrade", checkGradeMap);
			dataMap.put("unit", unitMap);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", dataMap);
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
	 * 修改计划的时间
	 * @param request
	 * @param response
	 */
	public void modifyPlanTime(HttpServletRequest request, HttpServletResponse response) {
		try {
			Integer id = Integer.parseInt(request.getParameter("id"));
			String oldPlanTime = request.getParameter("oldPlanTime");
			String newPlanTime = request.getParameter("newPlanTime");
			String operate = request.getParameter("operate");
			planDao.modifyPlanTime(operate, id, oldPlanTime, newPlanTime);
			Map<String, Object> dataMap = new HashMap<String, Object>();
			dataMap.put("id", id);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", dataMap);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	private List<Integer> doubelListToIntegerList(List<Double> doubleList){
		if(null == doubleList){
			return null;
		}
		List<Integer> integerList = new ArrayList<Integer>();
		for(Double doubleValue : doubleList){
			Integer integerValue = null;
			if(null != doubleValue){
				integerValue = doubleValue.intValue();
			}
			integerList.add(integerValue);
		}
		return integerList;
	}

	public void setPlanDao(PlanDao planDao) {
		this.planDao = planDao;
	}

	public void setTaskDao(TaskDao taskDao) {
		this.taskDao = taskDao;
	}

	public void setDictionaryDao(DictionaryDao dictionaryDao) {
		this.dictionaryDao = dictionaryDao;
	}

	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}

	public void setWorkflowService(WorkflowService workflowService) {
		this.workflowService = workflowService;
	}

	public void setImproveDao(ImproveDao improveDao) {
		this.improveDao = improveDao;
	}

	public void setOrganizationDao(OrganizationDao organizationDao) {
		this.organizationDao = organizationDao;
	}

	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}

	public void setUnitRoleActorDao(UnitRoleActorDao unitRoleActorDao) {
		this.unitRoleActorDao = unitRoleActorDao;
	}

	public void setImproveNoticeDao(ImproveNoticeDao improveNoticeDao) {
		this.improveNoticeDao = improveNoticeDao;
	}
	
	
}
