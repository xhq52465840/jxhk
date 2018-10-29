package com.usky.sms.audit.task;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.time.DateUtils;
import org.apache.log4j.MDC;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.activity.attribute.ActivityStatusDO;
import com.usky.sms.activity.attribute.ActivityStatusDao;
import com.usky.sms.audit.AuditConstant;
import com.usky.sms.audit.EnumAuditRole;
import com.usky.sms.audit.IAudit;
import com.usky.sms.audit.auditReport.AuditReportDao;
import com.usky.sms.audit.auditor.AuditorDao;
import com.usky.sms.audit.base.ProfessionUserDao;
import com.usky.sms.audit.check.CheckDO;
import com.usky.sms.audit.check.CheckDao;
import com.usky.sms.audit.check.CheckListDO;
import com.usky.sms.audit.check.CheckListDao;
import com.usky.sms.audit.check.EnumAuditResult;
import com.usky.sms.audit.improve.ImproveDO;
import com.usky.sms.audit.improve.ImproveDao;
import com.usky.sms.audit.log.AuditActivityLoggingDao;
import com.usky.sms.audit.log.operation.AuditActivityLoggingOperationRegister;
import com.usky.sms.audit.plan.EnumCheckGrade;
import com.usky.sms.audit.plan.EnumPlanType;
import com.usky.sms.audit.plan.PlanDO;
import com.usky.sms.audit.plan.PlanDao;
import com.usky.sms.audit.terminal.TerminalDO;
import com.usky.sms.audit.terminal.TerminalDao;
import com.usky.sms.audit.workflow.AuditWorkflowSchemeDao;
import com.usky.sms.common.DateHelper;
import com.usky.sms.common.NumberHelper;
import com.usky.sms.constant.EnumMessageCatagory;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.core.TransactionHelper;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.file.EnumFileType;
import com.usky.sms.file.FileDao;
import com.usky.sms.message.MessageDao;
import com.usky.sms.organization.OrganizationDO;
import com.usky.sms.organization.OrganizationDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.unit.UnitRoleActorDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;
import com.usky.sms.user.UserGroupDao;
import com.usky.sms.uwf.WfSetup;
import com.usky.sms.uwffunc.IUwfFuncPlugin;
import com.usky.sms.workflow.WorkflowService;

public class TaskDao extends BaseDao<TaskDO> implements IUwfFuncPlugin, IAudit {
	
	private static final String auditResult = "审计结论";

	@Autowired
	private TransactionHelper transactionHelper;

	@Autowired
	private PlanDao planDao;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private UserDao userDao;
	
	@Autowired
	private MasterDao masterDao;
	
	@Autowired
	private UnitRoleActorDao unitRoleActorDao;
	
	@Autowired
	private DictionaryDao dictionaryDao;
	
	@Autowired
	private TaskFlowUserDao taskFlowUserDao;
	
	@Autowired
	private WorkflowService workflowService;
	
	@Autowired
	private CheckDao checkDao;
	
	@Autowired
	private ProfessionUserDao professionUserDao;
	
	@Autowired
	private AuditActivityLoggingDao auditActivityLoggingDao;

	@Autowired
	private ActivityStatusDao activityStatusDao;
	
	@Autowired
	private CheckListDao checkListDao;
	
	@Autowired
	private OrganizationDao organizationDao;
	
	@Autowired
	private TerminalDao terminalDao;
	
	@Autowired
	private FileDao fileDao;

	@Autowired
	private AuditWorkflowSchemeDao auditWorkflowSchemeDao;
	
	@Autowired
	private AuditorDao auditorDao;
	
	@Autowired
	private ImproveDao improveDao;
	
	@Autowired
	private MessageDao messageDao;
	
	@Autowired
	private UserGroupDao userGroupDao;
	
	@Autowired
	private AuditReportDao auditReportDao;
	
	protected TaskDao() {
		super(TaskDO.class);
	}
	
	@SuppressWarnings("unchecked")
	@Override
	protected String getBaseHql(Map<String, Object> map) {
		List<String> planTypes = new ArrayList<String>();
		// 是否带权限的查询
		boolean permittedQuery = false;
		List<List<Map<String, Object>>> ruleList = (List<List<Map<String, Object>>>) map.get("rule");
		for (List<Map<String, Object>> list : ruleList) {
			Iterator<Map<String, Object>> it = list.iterator();
			while (it.hasNext()) {
				Map<String, Object> paramMap = it.next();
				if ("permittedQuery".equals(paramMap.get("key"))) {
					it.remove();
					permittedQuery = (boolean) paramMap.get("value");
				} else if ("planType".equals(paramMap.get("key"))) {
					if (paramMap.get("value") instanceof List) {
						planTypes.addAll((List) paramMap.get("value"));
					} else {
						planTypes.add((String) paramMap.get("value"));
					}
				}
			}
		}
		if (permittedQuery) {
			return "from " + clazz.getSimpleName() + " t where t.deleted = false and (t.id in (" + this.getPermittedTaskBaseHql(planTypes) + ")) and (";
		}
		return super.getBaseHql(map);
	}
	
	@SuppressWarnings("unchecked")
	@Override
	protected Object getQueryParamValue(String key, Object value) {
		if ("target".equals(key) || "operator".equals(key)) {
			if (null == value) {
				return null;
			}
			if (value instanceof Collection || value instanceof Object[]) {
				List<String> resultList = new ArrayList<String>();
				if (value instanceof Collection) {
					for (Object o : (Collection<Object>) value) {
						resultList.add((String) getQueryParamValue(key, o));
					}
				} else {
					for (Object o : (Object[]) value) {
						resultList.add((String) getQueryParamValue(key, o));
					}
				}
				return resultList;
			} else if (value instanceof String) {
				return auditReportDao.stripImproveUnitPrefix((String) value);
			}
			return value.toString();
		}
		return super.getQueryParamValue(key, value);
	}
	
	/**
	 * 因为现场检查的target是字典类型所有现场检查不适用
	 * @param planTypes 如果为空，则表示查询的是现场检查或专项检查
	 * @return
	 */
	public String getPermittedTaskBaseHql(List<String> planTypes) {
		PermissionSets permission = auditReportDao.getViewImproveIssuePermission();
		List<String> auditType = null;
		if (planTypes != null && !planTypes.contains(EnumPlanType.TERM.toString()) && !planTypes.contains(EnumPlanType.SPEC.toString()) && !planTypes.contains(EnumPlanType.SPOT.toString())) {
			// 审计的计划类型
			auditType = auditReportDao.getPlanTypeIdsForImproveIssue(permission);
		} else if (planTypes == null || planTypes.isEmpty() || !planTypes.contains(EnumPlanType.TERM.toString())) {
			// 检查的级别
			auditType = auditReportDao.getCheckGradeIdsForImproveIssue(permission);
		}
		if (auditType.isEmpty()) {
			return this.getViewHandledBaseHql();
		}
		// 现场检查的operator
		List<Integer> viewableOperatorIds = auditReportDao.getViewableOperatorIdsForImproveIssue(null, null);
		// 现场检查之外的operator
		List<String> operators = auditReportDao.getOperatorIdsForImproveIssue(auditType, permission);
		// 如果没有选择现场检查时
		if (planTypes != null && !planTypes.contains(EnumPlanType.SPOT.toString()) && operators.isEmpty()) {
			return this.getViewHandledBaseHql();
		}
		// 如果只选择了现场检查时
		if (planTypes != null && planTypes.size() == 1 && planTypes.contains(EnumPlanType.SPOT.toString()) && viewableOperatorIds.isEmpty()) {
			return this.getViewHandledBaseHql();
		}
		
		List<String> targets = Collections.emptyList();
		// 如果没有只选择现场检查时
		if (planTypes == null || planTypes.isEmpty() || planTypes.size() > 1 || !planTypes.contains(EnumPlanType.SPOT.toString())) {
			targets = auditReportDao.getTargetIdsForImproveIssue(auditType, operators, permission);
			if (targets.isEmpty()) {
				return this.getViewHandledBaseHql();
			}
		}
		// 将operator和target的前缀去掉
		operators = auditReportDao.stripImproveUnitPrefix(operators);
		targets = auditReportDao.stripImproveUnitPrefix(targets);
		
		// 组装hql
		String planType = StringUtils.join(auditType, "','");
		String operator = StringUtils.join(operators, "','");
		String target = StringUtils.join(targets, "','");
		String hql = "select id from TaskDO t where t.deleted = false and t.plan.deleted = false";
		if (planTypes != null && !planTypes.contains(EnumPlanType.TERM.toString()) && !planTypes.contains(EnumPlanType.SPEC.toString()) && !planTypes.contains(EnumPlanType.SPOT.toString())) {
			hql += " and t.planType in ('" + planType + "')";
		} else if (planTypes == null || planTypes.isEmpty() || !planTypes.contains(EnumPlanType.TERM.toString())) {
			hql += " and t.checkType in ('" + planType + "')";
		}
		if ((operators != null && !operators.isEmpty()) || (!viewableOperatorIds.isEmpty())) {
			hql += " and (";
			boolean hasOr = false;
			if (operators != null && !operators.isEmpty()) {
				hasOr = true;
				hql += " (t.operator in ('" + operator + "') and t.planType <> '" + EnumPlanType.SPOT.toString() + "')";
			}
			// 如果选择了现场检查时
			if (planTypes != null && planTypes.contains(EnumPlanType.SPOT.toString()) && !viewableOperatorIds.isEmpty()) {
				if (hasOr) {
					hql += " or";
				}
				hql += " (t.operator in ('" + StringUtils.join(viewableOperatorIds, "','") + "') and t.planType = '" + EnumPlanType.SPOT.toString() + "')";
			}
			hql += ")";
		}
		if (!targets.isEmpty()) {
			hql += " and (t.target in ('" + target + "')";
			// 如果选择了现场检查时
			if (planTypes != null && planTypes.contains(EnumPlanType.SPOT.toString())) {
				hql += "or t.planType = '" + EnumPlanType.SPOT.toString() + "'";
			}
			hql += ")";
		}
		return hql;
	}
	
	/**
	 * 查看自己处理过的hql
	 * @return
	 */
	public String getViewHandledBaseHql() {
		return "select checkId from HasCompletedDO a where a.userId = " + UserContext.getUserId();
	}
	
	/**
	 * 判断用户是否有查看所有审计信息(工作单，检查单，整改单)的权限<br>
	 * 如果是现场检查或专项检查，则判断用户是否是一级检查经理或一级检查主管<br>
	 * 如果是系统级审计或分子公司二级或部门三级或航站审计，则判断用户是否是一级审计经理或一级审计主管<br>
	 * @param userId 指定的用户id
	 */
	public boolean hasViewAllAuditPermission(Integer userId, List<String> planTypes) {
		List<DictionaryDO> dics = dictionaryDao.getListByType("审计角色");
		Map<String, Object> roleMap = new HashMap<String, Object>();
		for (DictionaryDO dic : dics) {
			roleMap.put(dic.getKey(), dic.getName());
		}
		List<String> groupNames = new ArrayList<String>(4);
		// 如果是现场检查或专项检查，则判断用户是否是一级检查经理或一级检查主管
		if (planTypes.contains(EnumPlanType.SPEC.toString()) || planTypes.contains(EnumPlanType.SPOT.toString())) {
			groupNames.add((String) roleMap.get(EnumAuditRole.FIRST_GRADE_CHECK_MANAGER_GROUP.getKey()));
			groupNames.add((String) roleMap.get(EnumAuditRole.FIRST_GRADE_CHECK_MASTER_GROUP.getKey()));
		}
		// 如果是系统级审计或分子公司二级或部门三级或航站审计，则判断用户是否是一级审计经理或一级审计主管
		if (planTypes.contains(EnumPlanType.SYS.toString()) || planTypes.contains(EnumPlanType.SUB2.toString()) || planTypes.contains(EnumPlanType.SUB3.toString()) || planTypes.contains(EnumPlanType.TERM.toString())) {
			groupNames.add((String) roleMap.get(EnumAuditRole.FIRST_GRADE_AUDIT_MANAGER_GROUP.getKey()));
			groupNames.add((String) roleMap.get(EnumAuditRole.FIRST_GRADE_AUDIT_MASTER_GROUP.getKey()));
		}
		
		return userGroupDao.isUserGroups(userId, groupNames.toArray(new String[groupNames.size()]));
		
	}

	public List<Map<String, Object>> getAuditTypes(String term, String type_) {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		if ("SUB2".equals(type_)){
			Map<String, Object> map1 = new HashMap<String, Object>();
			map1.put("id", EnumPlanType.SUB2.name());
			map1.put("name", EnumPlanType.SUB2.getDescription());
			list.add(map1);
			Map<String, Object> map2 = new HashMap<String, Object>();
			map2.put("id", EnumPlanType.SUB3.name());
			map2.put("name", EnumPlanType.SUB3.getDescription());
			list.add(map2);
		} else if ("SUB3".equals(type_)){
			Map<String, Object> map2 = new HashMap<String, Object>();
			map2.put("id", EnumPlanType.SUB3.name());
			map2.put("name", EnumPlanType.SUB3.getDescription());
			list.add(map2);
		} else {
			for (EnumPlanType type : EnumPlanType.values()) {
				Map<String, Object> map = new HashMap<String, Object>();
				map.put("id", type.name());
				map.put("name", type.getDescription());
				list.add(map);
			}
		}
		return list;
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public List<Map<String,Object>> updateTask(Map<String, Object> map, String dataobjectid, String isInstance) {
		List<Map<String,Object>> checkLists = new ArrayList<Map<String,Object>>();
		try{
			TaskDO task = this.internalGetById(NumberHelper.toInteger(dataobjectid));
			addActivityLoggingForUpdateTask(map,task);
			this.saveTask(map, task);
			checkLists.addAll(checkDao.updateCheck(map, task, isInstance));
			
		} catch (ParseException e) {
			e.printStackTrace();
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "时间格式不正确！");
		}
		return checkLists;
	}
	
	
	private void saveTask(Map<String, Object> map, TaskDO task) throws ParseException {
		Date startDate = null;
		Date endDate = null;
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		if (map.get("startDate") != null && !"".equals(map.get("startDate"))) {
			startDate = sdf.parse((String) map.get("startDate"));
		}
		if (map.get("endDate") != null && !"".equals(map.get("endDate"))) {
			endDate = sdf.parse((String) map.get("endDate"));
		}
		String member = (String) map.get("member");
		String address = (String) map.get("address");
		String method = (String) map.get("method");
		String teamLeader = (String) map.get("teamLeader");
		String standard = (String) map.get("standard");
		String remark = (String) map.get("remark");
		boolean _generateReportDate = (map.get("generateReportDate") == null  || "".equals(map.get("generateReportDate"))) ? false : (boolean) map.get("generateReportDate");
		Date generateReportDate = null;
		if (_generateReportDate){
			generateReportDate = new Date();
			// 现场检查和专项检查时检查组员为工作单的组员和检查单的组员集合
			if (EnumPlanType.SPOT.toString().equals(task.getPlanType()) || EnumPlanType.SPEC.toString().equals(task.getPlanType())) {
				Set<String> members = new LinkedHashSet<String>();
				if (StringUtils.isNotBlank(member)) {
					members.addAll(Arrays.asList(StringUtils.split(member, ",")));
				}
				List<CheckDO> checks = checkDao.getChecks(task.getId());
				for (CheckDO check : checks) {
					if (StringUtils.isNotBlank(check.getMember())) {
						members.addAll(Arrays.asList(StringUtils.split(check.getMember(), ",")));
					}
				}
				member = StringUtils.join(members, ",");
			}
		}
		if (task.getGenerateReportDate() == null){
			task.setGenerateReportDate(generateReportDate);
		}
		task.setStartDate(startDate);
		task.setEndDate(endDate);
		task.setMember(member);
		task.setAddress(address);
		task.setMethod(method);
		task.setTeamLeader(teamLeader);
		task.setStandard(standard);
		task.setRemark(remark);
		task.setLastUpdater(UserContext.getUser());
		// 现场检查和专项检查没有项目主管
		if (!EnumPlanType.SPOT.toString().equals(task.getPlanType()) && !EnumPlanType.SPEC.toString().equals(task.getPlanType())) {
			{
				// if (((List<Object>)map.get("managers")).get(0) == null) throw new
				// SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "请选择至少一个项目主管！");
				if ("[]".equals(map.get("managers"))){
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "请选择至少一个项目主管！");
				}
				@SuppressWarnings("unchecked")
				List<Object> managers = (List<Object>) map.get("managers");
				masterDao.deleteByTaskId(task.getId());
				Set<MasterDO> masters = new HashSet<MasterDO>();
				for (Object inte : managers) {
					UserDO user = userDao.internalGetById(NumberHelper.toInteger(inte.toString()));
					MasterDO master = new MasterDO();
					master.setTask(task);
					master.setUser(user);
					masterDao.internalSave(master);
					masters.add(master);
				}
				task.setManagers(masters);
			}
		}
		this.internalUpdate(task);
	}
	
	
	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple, boolean showExtendFields) {
		TaskDO task = (TaskDO) obj;
		Map<String, Object> target = this.getTargetObj(null, task, null, null); // 获取target的id和name
		Map<String,Object> targetMap = new HashMap<String, Object>();
		targetMap.put("targetId", target.get("id"));
		targetMap.put("targetName", target.get("name"));
		map.put("target", targetMap);
		if (!multiple && showExtendFields){
			Set<MasterDO> managers = task.getManagers();
			List<Map<String,Object>> userList = new ArrayList<Map<String,Object>>();
			if (null != managers) {
				for (MasterDO master : managers){
					Map<String,Object> userMap = new HashMap<String, Object>();
					userMap.put("id", master.getUser().getId());
					userMap.put("name", master.getUser().getFullname());
					userMap.put("username", master.getUser().getUsername());
					userList.add(userMap);
				}
			}
			map.put("managers", userList);
			
			List<CheckDO> checks = checkDao.getChecks(task.getId());
			List<Map<String,Object>> professionList = new ArrayList<Map<String,Object>>();
			for(CheckDO check : checks){
				Map<String,Object> checkWorkFlow = new HashMap<String, Object>();
				Map<String, Object> checkNodeAttributes = workflowService.getWorkflowNodeAttributes(check.getFlowId());
				checkWorkFlow.put("workflowNodeAttributes", checkNodeAttributes);
				Map<String,Object> professionMap = new HashMap<String, Object>();
				professionMap.put("checkWorkFlow", checkWorkFlow);
				professionMap.put("checkId", check.getId());
				professionMap.put("porfessionId", check.getCheckType().getId());
				professionMap.put("professionName", check.getCheckType().getName());
				if (!EnumPlanType.SPOT.toString().equals(check.getTask().getPlanType()) && !EnumPlanType.SPEC.toString().equals(check.getTask().getPlanType())) {
					String member = check.getMember();
					if (null != member) {
						String[] members = member.split(",");
						List<UserDO> members_user = userDao.internalGetByIds(members);
						List<Map<String,Object>> scopeList = new ArrayList<Map<String,Object>>();
						for (UserDO user : members_user) {
							if (user == null) continue;
							Map<String,Object> userMap = new HashMap<String, Object>();
							userMap.put("id", user.getId());
							userMap.put("username", user.getUsername());
							userMap.put("fullname", user.getFullname());
							scopeList.add(userMap);
						}
						professionMap.put("users", scopeList);
					}
				}
				professionList.add(professionMap);
			}
			map.put("auditScope", professionList);
			map.put("taskPreAuditReport", fileDao.convert(fileDao.getFilesBySource(EnumFileType.TASK_PRE_AUDIT_REPORT.getCode(), task.getId())));
			map.putAll(this.addWorkFlowAttributes(task.getFlowId())); //获取此工作单工作流数据
		}
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
	}
	/**
	 * 获取工作流数据 节点属性、日志
	 * @param flowId
	 * @return
	 */
	public Map<String, Object> addWorkFlowAttributes(String flowId) {
		Map<String, Object> map = new HashMap<String, Object>();
		Map<String, Object> NodeAttributes = workflowService.getWorkflowNodeAttributes(flowId);
		map.put("workflowNodeAttributes", NodeAttributes);
		map.put("actions", workflowService.getActionsWithAttributes(flowId));
		Map<String, Object> logArea = new HashMap<String, Object>();
		logArea.put("key", "com.audit.comm_file.logs");
		logArea.put("workflowLogs", workflowService.getWorkflowLogsAndCurrentStatus(flowId));
		map.put("logArea", logArea);
		return map;
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		
		this.checkConstraint(((Number) map.get("plan")).intValue(), (String) map.get("target"), (String) map.get("planTime"), (String) map.get("planType"));
		
		// 工作单编号，工作单名称，审计报告名称
		map.putAll(generateWorkNo(map));
		map.put("status", "Y");// 状态
		map.put("creator", UserContext.getUserId());// 创建人
		map.put("lastUpdater", UserContext.getUserId());// 更新人
		return true;
	}
	
	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		TaskDO task = this.internalGetById(id);
		if (EnumPlanType.TERM.toString().equals(task.getPlanType())) {
			@SuppressWarnings("unchecked")
			List<Object> managers = map.get("managers") == null ? null : (List<Object>) map.get("managers");
			if (managers != null){
				masterDao.deleteByTaskId(task.getId());
				for (Object inte : managers) {
					UserDO user = userDao.internalGetById(NumberHelper.toInteger(inte.toString()));
					MasterDO master = new MasterDO();
					master.setTask(task);
					master.setUser(user);
					masterDao.internalSave(master);
				}
			}
		} else {
			if (map.containsKey("managers")) { // 现场检查时代表经办人
				// 删除已有的经办人
				masterDao.deleteByTaskId(id);
				@SuppressWarnings("unchecked")
				List<Map<String, Object>> userMaps = (List<Map<String, Object>>) map.get("managers");
				for (Map<String, Object> userMap : userMaps) {
					Map<String, Object> master = new HashMap<String, Object>();
					master.put("task", id);
					master.put("user", ((Double) userMap.get("id")).intValue());
					masterDao.save(master);
				}
				map.remove("managers");
			}
		}
		if (map.containsKey("planTime")) {
			// 工作单编号，工作单名称，审计报告名称
			map.putAll(this.generateWorkNo(task.getPlan().getId(), task.getPlanType(), task.getCheckType(), (String) map.get("planTime"), task.getYear(), task.getOperator(), task.getTarget()));
		}

		addActivityLoggingForUpdateAuditReport(id, map);
		// 同一个计划，同一个target中不能有多个具有相同planTime的工作单
		this.checkConstraint(task.getPlan().getId(), task.getTarget(), (String) map.get("planTime"), task.getPlanType());
		
//		if (map.containsKey("planTime")) {
//			if (!EnumPlanType.SPOT.toString().equals(task.getPlanType())) { // 除了现场检查以外同一时间下只能有一个工作单
//				if (getTaskCountByPlanIdAndTargetAndPlanTime(task.getPlan() .getId(), task.getTarget(), (String) map.get("planTime")) > 0) {
//					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, (String) map.get("planTime") + "下已经有工作单了，操作无法完成！");
//				}
//			}
//		}
		super.beforeUpdate(id, map);
	}
	
	private void checkConstraint(Integer planId, String targetId, String planTime, String planType) {
		if (!EnumPlanType.SPOT.toString().equals(planType)) { // 除了现场检查以外同一时间下只能有一个工作单
			if (targetId != null && planTime != null && planType != null) {
				if (this.getTaskCountByPlanIdAndTargetAndPlanTime(planId, targetId, planTime) > 0) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, planTime + "下已经有工作单了，操作无法完成！");
				}
			}
		}
	}
	
	private void addActivityLoggingForUpdateAuditReport(int id, Map<String,Object> map){
		TaskDO task = this.internalGetById(id);
		List<String> details = new ArrayList<String>();
		if (map.containsKey("contact")) {
			String dbcontact = task.getContact() == null ? "" : task.getContact();
			String contact = (String) (map.get("contact") == null ? "" : map.get("contact"));
			if (!dbcontact.equals(contact)){
				details.add("更新经办人联系方式为：" + contact);
			}
		}
		if (map.containsKey("reportRemark")) {
			String dbreportRemark = task.getReportRemark() == null ? "" : task.getReportRemark();
			String reportRemark = (String) (map.get("reportRemark") == null ? "" : map.get("reportRemark"));
			if (!dbreportRemark.equals(reportRemark)){
				details.add("更新审计报告备注 为：" + reportRemark);
			}
		}
		if (map.containsKey("auditReportSummary")) {
			String dbAuditReportSummary = task.getAuditReportSummary() == null ? "" : task.getAuditReportSummary();
			String auditReportSummary = (String) (map.get("auditReportSummary") == null ? "" : map.get("auditReportSummary"));
			if (!dbAuditReportSummary.equals(auditReportSummary)){
				details.add("更新审计报告概述 为：" + auditReportSummary);
			}
		}
		if (!details.isEmpty()) {
			MDC.put("details", details.toArray());
			auditActivityLoggingDao.addLogging(id, "task", AuditActivityLoggingOperationRegister.getOperation("UPDATE_TASK"));
			MDC.remove("details");
		}
	}
	/**
	 * 根据计划ID，target和计划时间查询task的条数
	 * @param planId
	 * @param target
	 * @param planTime
	 * @return
	 */
	public int getTaskCountByPlanIdAndTargetAndPlanTime(Integer planId, String target, String planTime){
		@SuppressWarnings("unchecked")
		List<Long> counts = (List<Long>) this.query("select count(t) from TaskDO t where t.deleted = false and planTime = ? and t.target = ? and t.plan.id = ?", planTime, target, planId);
		if (counts.isEmpty()) {
			return 0;
		} else {
			return counts.get(0).intValue();
		}
	}
	
	private Map<String, Object> generateWorkNo(Map<String, Object> map) {
		Integer planId = ((Number) map.get("plan")).intValue();
		String planType = (String) map.get("planType");
		String checkType = (String) map.get("checkType");
		String planTime = (String) map.get("planTime");
		Integer year = ((Number) map.get("year")).intValue();
		String operator = (String) map.get("operator");
		String target = (String) map.get("target");
		return this.generateWorkNo(planId, planType, checkType, planTime, year, operator, target);
	}

	/**
	 * 生成工作单编号，工作单名称，审计报告名称
	 * @param planId 计划id
	 * @param planType 计划类型
	 * @param checkType 检查类型
	 * @param planTime 计划时间
	 * @param year 计划年份
	 * @param operator 操作单位
	 * @param target 执行单位
	 * @return
	 */
	public Map<String, Object> generateWorkNo(Integer planId, String planType, String checkType, String planTime, Integer year, String operator, String target){
		Map<String, Object> result = new HashMap<String, Object>();
		String workNo = null;
		String workName = null;
		String reportName = null;
		// 审计对象代号
		String targetCode = null;
		if (EnumPlanType.SYS.toString().equals(planType)) { // 公司级
			UnitDO unit = unitDao.internalGetById(Integer.parseInt(target));
			targetCode = unit.getCode();
			// 系统性工作单编号,如:HOA2014-SD
			workNo = AuditConstant.PRE_AUDIT_SN + AuditConstant.AUDIT_CODE + year + "-" + targetCode;
			// 工作单名称，如：201701运力网络部安全审计工作单
			workName = planTime + unit.getName() + AuditConstant.SAFETY_NAME + AuditConstant.AUDIT_NAME + AuditConstant.TASK_SUFIX;
			// 审计报告名称，如：201701运力网络部审计报告
			reportName = planTime + unit.getName() + AuditConstant.AUDIT_NAME + AuditConstant.REPORT_SUFIX;
		} else if (EnumPlanType.SUB2.toString().equals(planType)) { // 分子公司二级
			// 分子公司/二级单位工作单编号,如:HOSDA2014-01(HO不变，SD代表山东，A代表审计，01代表月份)
			String planMonth = planTime.substring(4);
			UnitDO unit = unitDao.internalGetById(Integer.parseInt(operator));
			targetCode = unit.getCode();
			workNo = AuditConstant.PRE_AUDIT_SN + targetCode + AuditConstant.AUDIT_CODE + year + "-" + planMonth;
			OrganizationDO targetOrg = organizationDao.internalGetById(Integer.parseInt(target));
			// 工作单名称，如：201701运力网络部安全审计工作单
			workName = planTime + targetOrg.getName() + AuditConstant.SAFETY_NAME + AuditConstant.AUDIT_NAME + AuditConstant.TASK_SUFIX;
			// 审计报告名称，如：201701运力网络部审计报告
			reportName = planTime + targetOrg.getName() + AuditConstant.AUDIT_NAME + AuditConstant.REPORT_SUFIX;
		} else if (EnumPlanType.SUB3.toString().equals(planType)) { // 部门三级
			// HOSDA2014-0001
			OrganizationDO orgnization = organizationDao.internalGetById(Integer.parseInt(operator));
			UnitDO unit = orgnization.getUnit();
			if (unit != null){
				targetCode = unit.getCode();
				workNo = AuditConstant.PRE_AUDIT_SN + targetCode + AuditConstant.AUDIT_CODE + year + "-" + this.getTaskorder(planType, operator, year);
			}
			OrganizationDO targetOrg = organizationDao.internalGetById(Integer.parseInt(target));
			// 工作单名称，如：201701二飞行中队安全审计工作单
			workName = planTime + targetOrg.getName() + AuditConstant.SAFETY_NAME + AuditConstant.AUDIT_NAME + AuditConstant.TASK_SUFIX;
			// 审计报告名称，如：201701运力网络部审计报告
			reportName = planTime + targetOrg.getName() + AuditConstant.AUDIT_NAME + AuditConstant.REPORT_SUFIX;
		} else if (EnumPlanType.TERM.toString().equals(planType)) { // 航站审计
			// HOSA2015-001 开始国内 HOSA2015-100 开始国外
			TerminalDO terminal = terminalDao.internalGetById(NumberHelper.toInteger(target));
			if ("1".equals(terminal.getType())) {
				workNo = AuditConstant.PRE_AUDIT_SN + "SA" + year + "-" + getTaskorderTerm(planType, "1", year);
			} else if ("2".equals(terminal.getType())) {
				workNo = AuditConstant.PRE_AUDIT_SN + "SA" + year + "-" + getTaskorderTerm(planType, "2", year);
			}
			TerminalDO targetTerminal = terminalDao.internalGetById(Integer.parseInt(target));
			// 工作单名称，如：201701沈阳航站审计工作单
			workName = planTime + targetTerminal.getAirport() + AuditConstant.TERMINAL_NAME + AuditConstant.AUDIT_NAME + AuditConstant.TASK_SUFIX;
			// 审计报告名称，如：201701沈阳航站审计报告
			reportName = planTime + targetTerminal.getAirport() + AuditConstant.TERMINAL_NAME + AuditConstant.AUDIT_NAME + AuditConstant.REPORT_SUFIX;
		} else if (EnumPlanType.SPOT.toString().equals(planType)) { // 现场检查
			DictionaryDO dc = dictionaryDao.internalGetById(Integer.parseInt(target));
			targetCode = dc.getKey();
			if (EnumCheckGrade.SYS.toString().equals(checkType)) { // 系统级现场检查
				// HOC2015-JP-001(JP代表类型)
				workNo = AuditConstant.PRE_AUDIT_SN + AuditConstant.CHECK_CODE + year + "-" + targetCode + "-" + this.getWorkNoOrderBySearch(null, dc.getId().toString(), planType, checkType, year.intValue());
				// 工作单名称，如：2017012公司现场/日常检查工作单
				workName = planTime + AuditConstant.COMPANY_NAME + AuditConstant.SPEC_SPOT_CHECK_NAME + AuditConstant.TASK_SUFIX;
				// 审计报告名称，如：201701公司现场/日常检查检查报告
				reportName = planTime + AuditConstant.COMPANY_NAME + AuditConstant.SPEC_SPOT_CHECK_NAME + AuditConstant.CHECK_NAME + AuditConstant.REPORT_SUFIX;
			} else if (EnumCheckGrade.SUB2.toString().equals(checkType)) { // 分子公司级现场检查
				// HOSDC2015-JP-001(C代表检查 SD代表山东)
				PlanDO plan = planDao.internalGetById(planId);
				UnitDO unit = unitDao.internalGetById(Integer.parseInt(plan.getOperator()));
				workNo = AuditConstant.PRE_AUDIT_SN + unit.getCode() + AuditConstant.CHECK_CODE + year + "-" + targetCode + "-" + this.getWorkNoOrderBySearch(unit.getId().toString(), dc.getId().toString(), planType, checkType, year);
				// 工作单名称，如：2017012维修工程部现场/日常检查工作单
				workName = planTime + unit.getName() + dc.getName() + AuditConstant.SPEC_SPOT_CHECK_NAME + AuditConstant.TASK_SUFIX;
				// 审计报告名称，如：201701维修工程部现场/日常检查检查报告
				reportName = planTime + unit.getName() + dc.getName() + AuditConstant.SPEC_SPOT_CHECK_NAME + AuditConstant.CHECK_NAME + AuditConstant.REPORT_SUFIX;
			}
			
		} else if (EnumPlanType.SPEC.toString().equals(planType)) { // 专项检查
			if (EnumCheckGrade.SYS.toString().equals(checkType)) { // 系统级专项检查
				// HOEC2015-001(EC代表专项检查)
				workNo = AuditConstant.PRE_AUDIT_SN + AuditConstant.SPEC_CODE + year + "-" + this.getWorkNoOrderBySearch(null, null, planType, checkType, year);
				// 工作单名称，如：2017-01-03至2017-01-12公司专项检查工作单
				workName = planTime + AuditConstant.COMPANY_NAME + AuditConstant.SPEC_NAME + AuditConstant.TASK_SUFIX;
				// 审计报告名称，如：2017-01-03至2017-01-12公司专项检查检查报告
				reportName = planTime + AuditConstant.COMPANY_NAME + AuditConstant.SPEC_NAME + AuditConstant.CHECK_NAME + AuditConstant.REPORT_SUFIX;
			} else if (EnumCheckGrade.SUB2.toString().equals(checkType)) { // 分子公司级专项检查
				// HOSDEC2015-001(EC代表专项检查  SD代表山东)
				PlanDO plan = planDao.internalGetById(planId);
				UnitDO unit = unitDao.internalGetById(Integer.parseInt(plan.getOperator()));
				workNo = AuditConstant.PRE_AUDIT_SN + unit.getCode() + AuditConstant.SPEC_CODE + year + "-" + this.getWorkNoOrderBySearch(unit.getId().toString(), null, planType, checkType, year);
				// 2017-03-14至2017-03-23飞行部专项检查工作单
				workName = planTime + unit.getName() + AuditConstant.SPEC_NAME + AuditConstant.TASK_SUFIX;
				// 2017-03-14至2017-03-23飞行部专项检查检查报告
				reportName = planTime + unit.getName() + AuditConstant.SPEC_NAME + AuditConstant.CHECK_NAME + AuditConstant.REPORT_SUFIX;
			}
		}
		result.put("workNo", workNo);
		result.put("workName", workName);
		result.put("reportName", reportName);
		return result;
	}

	private String getTaskorder(String planType, String operator, Integer year){
		String sql = "select count(t) from TaskDO t where t.deleted = false and t.planType = ? and t.operator = ? and t.year = ?";
		@SuppressWarnings("unchecked")
		List<Long> list = this.getHibernateTemplate().find(sql, planType, operator, year);
		if (list.size() > 0 && list.get(0) != null){
			Integer i = list.get(0).intValue();
			if (i < 9){
				Integer j = i + 1;
				return "00" + j.toString();
			} else if (i < 99){
				Integer j = i + 1;
				return "0" + j.toString();
			} else {
				return i + 1 + "";
			}
		} else {
			return "001";
		}
	}
	
	private String getTaskorderTerm(String planType, String type, Integer year) {
		String sql = "select count(*) from TaskDO t , TerminalDO a where t.deleted = false and t.planType = ? and a.type = ? and t.year = ? and t.target = a.id";
		@SuppressWarnings("unchecked")
		List<Long> list = this.getHibernateTemplate().find(sql, planType, type, year);
		Integer i = list.get(0).intValue();
		String str = "";
		if ("1".equals(type)) {
			if (list.size() > 0 && list.get(0) != null) {
				if (i < 9) {
					Integer j = i + 1;
					str = "00" + j.toString();
				} else if (i >= 9 && i < 99) {
					Integer j = i + 1;
					str = "0" + j.toString();
				} else {
					str = i + 1 + "";
				}
			} else {
				str = "001";
			}
		} else if ("2".equals(type)) {
			if (list.size() > 0 && list.get(0) != null) {
				if (i < 9) {
					Integer j = i + 1;
					str = "10" + j.toString();
				} else if (i >= 9 && i < 99) {
					Integer j = i + 1;
					str = "1" + j.toString();
				} else {
					str = i + 1 + "";
				}
			} else {
				str = "100";
			}
		}
		return str;
	}
	
	/**
	 * 取最大的workNo截取其最后3位数字+1，并以001的形式返回
	 * @param operator
	 * @param target
	 * @param planType
	 * @param checkType
	 * @param year
	 * @return
	 */
	public String getWorkNoOrderBySearch(String operator, String target, String planType, String checkType, int year) {
		Integer no = null;
		String maxWorkNo = this.getMaxWorkNoBySearch(operator, target, planType, checkType, year);
		if (null == maxWorkNo) {
			no = 1;
		} else {
			no = Integer.parseInt(maxWorkNo.substring(maxWorkNo.length() - 3)) + 1;
		}
		return String.format("%03d", no);
	}
	
	/**
	 * 获取某些条件下工作单最大的编号
	 * @param operator
	 * @param target
	 * @param planType
	 * @param checkType
	 * @param year
	 * @return
	 */
	public String getMaxWorkNoBySearch(String operator, String target, String planType, String checkType, int year) {
		StringBuffer hql = new StringBuffer("select max(t.workNo) from TaskDO t where t.planType = ? and t.year = ?");
		List<Object> values = new ArrayList<Object>();
		values.add(planType);
		values.add(year);
		if (null != operator) {
			hql.append(" and t.operator = ?");
			values.add(operator);
		}
		if (null != target) {
			hql.append(" and t.target = ?");
			values.add(target);
		}
		if (null != checkType) {
			hql.append(" and t.checkType = ?");
			values.add(checkType);
		}
		@SuppressWarnings("unchecked")
		List<String> workNos = (List<String>) this.query(hql.toString(), values.toArray());
		return workNos.get(0);
	}
	
	@Override
	protected void afterSave(TaskDO obj) {
		
		// 实施主体
		if (!EnumPlanType.TERM.toString().equals(obj.getPlanType())){
			PlanDO plan = planDao.internalGetById(obj.getPlan().getId());
			obj.setOperator(plan.getOperator());
			this.internalUpdate(obj);
		}
		
		// 实例化工作流
		if (EnumPlanType.SPOT.toString().equals(obj.getPlanType()) || EnumPlanType.SPEC.toString().equals(obj.getPlanType())) {
			String workflowTemplateId = auditWorkflowSchemeDao.getWorkflowTempIdBySearch(obj.getPlanType(), obj.getCheckType(), "TASK");
			Map<String, Object> objmap = new HashMap<String, Object>();
			objmap.put("id", obj.getId());
			objmap.put("dataobject", "task");
			String workflowId = (String) transactionHelper.doInTransaction(new WfSetup(), "Submit", UserContext.getUserId().toString(), workflowTemplateId, "", "", gson.toJson(objmap));
			obj.setFlowId(workflowId);
		}
		
		// 添加活动日志
		addActivityLoggingForAddTask(obj);
	}
	
	/**
	 * 创建工作单
	 * @param map
	 * @param operate
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public Integer createTask(Map<String, Object> map, String operate){
		Integer id = this.save(map);
		String planType = null;
		if ("instanceWorkflow".equals(operate)) { // 系统级实例化工作流
			planType = EnumPlanType.SYS.toString();
		} else if ("instanceInnerWorkflow".equals(operate)) {// 分子公司内审
			planType = EnumPlanType.SUB2.toString();
		} else if ("instanceErJiInnerWorkflow".equals(operate)) {// 二级内审
			planType = EnumPlanType.SUB3.toString();
		} else if ("instanceTermTaskWorkflow".equals(operate)) {// 航站审计
			planType = EnumPlanType.TERM.toString();
		}
		if (null != planType) {
			String workflowTemplateId = auditWorkflowSchemeDao.getWorkflowTempIdBySearch(planType, null, "TASK");
			if (workflowTemplateId != null){
				Map<String, Object> objmap = new HashMap<String, Object>();
				objmap.put("id", id);
				objmap.put("dataobject", "task");
				String workflowId = (String) transactionHelper.doInTransaction(new WfSetup(), "Submit", UserContext.getUserId().toString(), workflowTemplateId, "", "", gson.toJson(objmap));
				Map<String, Object> updateMap = new HashMap<String, Object>();
				updateMap.put("flowId", workflowId);
				this.update(id, updateMap);
			}
		}
		return id;
	}
	
	/**
	 * 添加工作单的活动日志
	 * @param task
	 */
	private void addActivityLoggingForAddTask(TaskDO task){
		auditActivityLoggingDao.addLogging(task.getId(), "task", AuditActivityLoggingOperationRegister.getOperation("ADD_TASK"));
		List<String> details = new ArrayList<String>();
		details.add("创建了" + task.getWorkName());
		if (!details.isEmpty()) {
			MDC.put("details", details.toArray());
			auditActivityLoggingDao.addLogging(task.getPlan().getId(), "plan", AuditActivityLoggingOperationRegister.getOperation("UPDATE_TASK"));
			MDC.remove("details");
		}
	}

	//更新工作单的活动日志
	@SuppressWarnings("unchecked")
	private void addActivityLoggingForUpdateTask(Map<String, Object> map, TaskDO task){
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		
		String startDate = map.get("startDate") == null ? "" : (String) map.get("startDate");
		String endDate = map.get("endDate") == null ? "" : (String) map.get("endDate");
		String address = map.get("address") == null ? "" : (String) map.get("address");
		String method = map.get("method") == null ? "" : (String) map.get("method");
		String teamLeader = map.get("teamLeader") == null ? "" : (String) map.get("teamLeader");
		String standard = map.get("standard") == null ? "" : (String) map.get("standard");
		String remark = map.get("remark") == null ? "" : (String) map.get("remark");
		String member = map.get("member") == null ? "" : (String) map.get("member");
		String termResult = map.get("termResult") == null ? "" : (String) map.get("termResult");
		String reject =  map.get("reject") == null ? "" : (String) map.get("reject");
		List<Object> managers = (List<Object>) map.get("managers");
		
		String dbStartDate = task.getStartDate() == null ? "" : sdf.format(task.getStartDate());
		String dbEndDate = task.getEndDate() == null ? "" : sdf.format(task.getEndDate());
		String dbAddress = task.getAddress() == null ? "" : task.getAddress();
		String dbMethod = task.getMethod() == null ? "" : task.getMethod();
		String dbTeamLeader = task.getTeamLeader() == null ? "" : task.getTeamLeader();
		String dbStandard = task.getStandard() == null ? "" : task.getStandard();
		String dbRemark = task.getRemark() == null ? "" : task.getRemark();
		String dbMember = task.getMember()  == null ? "" : task.getMember();
		String dbTermResult = task.getTermResult() == null ? "" : task.getTermResult();
		String dbReject = task.getReject() == null ? "" : task.getReject();
		Set<MasterDO> dbMaster = task.getManagers();
		
		List<String> details = new ArrayList<String>();
		if (!reject.equals(dbReject)) {
			details.add("填写拒绝理由为(" + reject + ")");
		}
		if (!termResult.equals(dbTermResult)) {
			details.add("更新结论为(" + termResult + ")");
		}
		if (!startDate.equals(dbStartDate)){
			details.add("更新开始审计日期为(" + startDate + ")");
		}
		if (!endDate.equals(dbEndDate)){
			details.add("更新截至审计日期为(" + endDate + ")");
		}
		if (!address.equals(dbAddress)){
			details.add("更新审计地点为(" + address + ")");
		}
		if (!method.equals(dbMethod)){
			details.add("更新审计方式为(" + method + ")");
		}
		if (!teamLeader.equals(dbTeamLeader)){
			details.add("更新审计组长为(" + teamLeader + ")");
		}
		if (!standard.equals(dbStandard)){
			details.add("更新审计标准为(" + standard + ")");
		}
		if (!member.equals(dbMember)){
			details.add("更新审计组员为(" + member + ")");
		}
		if (!remark.equals(dbRemark)){
			details.add("更新备注为(" + remark + ")");
		}
		if (!EnumPlanType.SPOT.toString().equals(task.getPlanType()) && !EnumPlanType.SPEC.toString().equals(task.getPlanType()) && !EnumPlanType.TERM.toString().equals(task.getPlanType())) {
			List<Integer> newManagers = new ArrayList<Integer>();
			List<Integer> dbManagers = new ArrayList<Integer>();
			for (Object obj : managers){
				if (obj instanceof Map) {
					newManagers.add(((Number) ((Map<String, Object>) obj).get("id")).intValue());
				} else {
					newManagers.add(NumberHelper.toInteger(obj.toString()));
				}
			}
			for (MasterDO master : dbMaster){
				if (master.getUser() != null){
					dbManagers.add(master.getUser().getId());
				}
			}
			if (!dbManagers.containsAll(newManagers)){
				String str = "";
				for (Integer inte : newManagers){
					UserDO user = userDao.internalGetById(NumberHelper.toInteger(inte.toString()));
					str = str + user.getFullname();
				}
				details.add("更新项目主管为(" + str + ")");
			}
		}
		List<Map<String,Object>> checkList = new ArrayList<Map<String,Object>>();
		if (map.get("auditScope") != null) {
			checkList.addAll((List<Map<String, Object>>) map.get("auditScope"));
			for (Map<String,Object> entry : checkList){
				List<CheckDO> checks = checkDao.getChecks(task.getId(), NumberHelper.toInteger(entry.get("professionId").toString())); 
				DictionaryDO dic = dictionaryDao.internalGetById(NumberHelper.toInteger(entry.get("professionId").toString()));
				if (dic != null){
					if (checks.size() > 0 && entry.get("checked").equals(checks.get(0).isDeleted())){
							if (entry.get("checked").equals(true)){
								details.add("创建了(" + dic.getName() + ")专业的检查单");
							} else {
								details.add("删除了(" + dic.getName() + ")专业的检查单");
							}
						} else if (checks.size() == 0) {
							if (entry.get("checked").equals(true)){
								details.add("创建了(" + dic.getName() + ")专业的检查单");
							}
						}
			   }
			}
		}
		if (!details.isEmpty()) {
			MDC.put("details", details.toArray());
			auditActivityLoggingDao.addLogging(task.getId(), "task", AuditActivityLoggingOperationRegister.getOperation("UPDATE_TASK"));
			MDC.remove("details");
		}
	}
	
	@Override
	protected void beforeDelete(Collection<TaskDO> collection) {
		// 在检查单生成之前可以删
		for (TaskDO task : collection) {
			List<CheckDO> checks = checkDao.getChecks(task.getId());
			if (!checks.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "该工作单的检查单已生成，不能被删除！");
			}
		}
		super.beforeDelete(collection);
	}

	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}
	
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(Collection<TaskDO> list) {
		List<String> ids = new ArrayList<String>();
		for (TaskDO task : list) {
			if (null != task) {
				ids.add(task.getId().toString());
			}
		}
		if (!ids.isEmpty()) {
			this.delete(ids.toArray(new String[0]));
		}
	}

	@Override
	protected void afterDelete(Collection<TaskDO> collection) {
		for (TaskDO task : collection) {
			// 添加活动日志
			addActivityLoggingForDeleteTask(task);
		}
	}
	
	@Override
	protected void afterUpdate(TaskDO obj, TaskDO dbObj) {
		addActivityLoggingForUpdateTask(obj, dbObj);
		if (EnumPlanType.TERM.toString().equals(obj.getPlanType())) {
			obj = this.internalGetById(obj.getId());
			addActivityLoggingForUpdateTask(this.convert(obj, false), dbObj);
		}
	}

	private void addActivityLoggingForUpdateTask(TaskDO obj, TaskDO dbObj){
		List<String> details = new ArrayList<String>();
		if (!obj.getPlanTime().equals(dbObj.getPlanTime())){
			details.add(UserContext.getUser().getFullname() + "修改【" + dbObj.getWorkName() + "】的审计计划时间为(" + obj.getPlanTime() + ")");
		}
		if (!details.isEmpty()) {
			MDC.put("details", details.toArray());
			auditActivityLoggingDao.addLogging(obj.getPlan().getId(), "plan", AuditActivityLoggingOperationRegister.getOperation("UPDATE_TASK"));
			MDC.remove("details");
		}
	}
	
	
	/**
	 * 删除工作单的活动日志
	 * @param task
	 */
	private void addActivityLoggingForDeleteTask(TaskDO task){
		auditActivityLoggingDao.addLogging(task.getId(), "task", AuditActivityLoggingOperationRegister.getOperation("DELETE_TASK"));
		List<String> details = new ArrayList<String>();
		details.add("删除了" + task.getWorkName());
		if (!details.isEmpty()) {
			MDC.put("details", details.toArray());
			auditActivityLoggingDao.addLogging(task.getPlan().getId(), "plan", AuditActivityLoggingOperationRegister.getOperation("UPDATE_TASK"));
			MDC.remove("details");
		}
	}

	@SuppressWarnings("unchecked")
	public List<TaskDO> getByPlanId(Integer planId) {
		if (null == planId) {
			return new ArrayList<TaskDO>();
		}
		StringBuffer hql = new StringBuffer("from TaskDO t where t.deleted = false and t.plan.id = ?");
		return (List<TaskDO>) this.query(hql.toString(), planId);
	}
	
	/**
	 * 获取审计报告
	 * @param id 工作单ID
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> getAuditReport(Integer id){
		TaskDO task = this.internalGetById(id);
		// 审计报告名称，审计编号，被审计单位，审计地点，审计日期,审计组长，经办人联系方式,备注,审计报告概述,检查报告经办人
		Map<String, Object> taskMap = this.convert(task, Arrays.asList(new String[]{"id", "target", "planType", "checkType", "year", "reportName", "workNo", "address", "startDate", "endDate", "teamLeader", "contact", "reportRemark", "method", "flowId", "auditReportSummary", "auditReportTransactor"}), false);
		// 审计单位
		taskMap.put("operator", planDao.getOperator(task.getPlanType(), task.getCheckType(), task.getOperator()));
		// 审计组员
		String member = task.getMember();
		taskMap.put("members", member);
		taskMap.put("membersDisplayName", member);
		// 经办人
		Set<MasterDO> masters = task.getManagers();
		List<Map<String, Object>> managers = new ArrayList<Map<String, Object>>();
		List<String> masterNameList = new ArrayList<String>();
		if (null != masters) {
			for (MasterDO master : masters) {
				if (!master.isDeleted()) {
					Map<String, Object> userMap = new HashMap<String, Object>();
					userMap.put("id", master.getUser().getId());
					userMap.put("name", master.getUser().getFullname());
					userMap.put("username", master.getUser().getUsername());
					managers.add(userMap);
					masterNameList.add(master.getUser().getFullname());
				}
			}
		}
		taskMap.put("managers", managers);
		taskMap.put("managersDisplayName", StringUtils.join(masterNameList, ","));
		// 审核人
		DictionaryDO auditor = dictionaryDao.getByTypeAndName("审核人", "审核人");
		taskMap.put("auditor", auditor == null ? "" : auditor.getValue());
		
		List<CheckDO> checks = checkDao.getChecks(id);
		// 结论result checkType
		List<Map<String, Object>> checkMaps = checkDao.convert(checks, Arrays.asList(new String[]{"id", "checkType", "result"}), false);
		// 审计范围
		List<String> auditItemNames = new ArrayList<String>();
		List<Map<String, Object>> auditItems = new ArrayList<Map<String, Object>>();
		for (Map<String, Object> checkMap : checkMaps) {
			if (!StringUtils.isBlank((String) checkMap.get("checkType"))) {
				Map<String, Object> auditItemMap = new HashMap<String, Object>();
				auditItemMap.put("id", checkMap.get("checkTypeId"));
				auditItemMap.put("name", checkMap.get("checkType"));
				auditItems.add(auditItemMap);
				auditItemNames.add((String) checkMap.get("checkType"));
			}	
		}
		taskMap.put("auditItems", auditItems);
		taskMap.put("auditItemsDisplayName", StringUtils.join(auditItemNames, ","));
		
		List<CheckListDO> checkLists = checkListDao.getByTaskId(id);
		if (!checkLists.isEmpty()) {
			if (null != checkLists.get(0).getItem() && null != checkLists.get(0).getItem().getVersion()) {
				taskMap.put("checkVersion", checkLists.get(0).getItem().getVersion().getName());
			}
		}
		// 检查要点 itemPoint， 审计记录 auditRecord， 审计结论 auditResult， 整改期限 improveLastDate， 责任单位 improveUnit UT 安监机构  DP 组织
		List<Map<String, Object>> checkListMaps = checkListDao.convert(checkLists, Arrays.asList(new String[]{"id", "itemPoint", "auditRecord", "auditResult", "improveLastDate", "improveUnit"}), false);
		// 有问题的项
		List<Map<String, Object>> hasProblems = new ArrayList<Map<String, Object>>();
		// 没有问题的项
		List<Map<String, Object>> noProblems = new ArrayList<Map<String, Object>>();
		// 统计结果
		Map<String, Object> statistics = new LinkedHashMap<String, Object>();
		// 审计结论字典
		List<DictionaryDO> dictionarys = dictionaryDao.getListByType(auditResult);
		// 初始化
		for (DictionaryDO dictionary : dictionarys) {
			Map<String, Object> statistic = new HashMap<String, Object>();
			statistic.put("num", 0);
			statistic.put("rate", BigDecimal.ZERO);
			if (EnumAuditResult.符合项.toString().equals(dictionary.getName())) {
				statistics.put("符合项", statistic);
			} else if (EnumAuditResult.有文无实.toString().equals(dictionary.getName()) || EnumAuditResult.无文无实.toString().equals(dictionary.getName()) || EnumAuditResult.有实无文.toString().equals(dictionary.getName())) {
				if (!statistics.containsKey("不符合项")) {
					statistics.put("不符合项", statistic);
				}
			} else {
				statistics.put(dictionary.getName(), statistic);
			}
		}
 		// 根据审计结论进行统计
		for (Map<String, Object> checkListMap : checkListMaps) {
			String auditResult = (String) checkListMap.get("auditResult");
			Map<String, Object> statistic = null;
			if (EnumAuditResult.符合项.toString().equals(auditResult)) {
				checkListMap.put("auditResult", "符合项");
				statistic = (Map<String, Object>) statistics.get("符合项");
			} else if (EnumAuditResult.有文无实.toString().equals(auditResult) || EnumAuditResult.无文无实.toString().equals(auditResult) || EnumAuditResult.有实无文.toString().equals(auditResult)) {
				checkListMap.put("auditResult", "不符合项");
				statistic = (Map<String, Object>) statistics.get("不符合项");
			} else if (statistics.containsKey(auditResult)) {
				statistic = (Map<String, Object>) statistics.get(auditResult);
			}
			if (null != statistic) {
				statistic.put("num", (Integer)statistic.get("num") + 1);
			}
			// 符合项和不适用的结论表示没问题其他的为有问题
			if (EnumAuditResult.符合项.toString().equals(auditResult) || EnumAuditResult.不适用.toString().equals(auditResult)) {
				noProblems.add(checkListMap);
			} else {
				hasProblems.add(checkListMap);
			}
		}
		
		// 百分比
		if (!checkLists.isEmpty()) {
			BigDecimal total = new BigDecimal(checkLists.size());
			NumberFormat nf = NumberFormat.getPercentInstance();
			// 保留两位小数
			nf.setMinimumFractionDigits(2);
			for (Entry<String, Object> entry : statistics.entrySet()) {
				Map<String, Object> statistc = (Map<String, Object>) entry.getValue();
				BigDecimal num = new BigDecimal((Integer)statistc.get("num"));
				statistc.put("rate", num.divide(total, 2, BigDecimal.ROUND_HALF_UP));
			}
		}
		
		statistics.put("total", checkLists.size());
		// 问题
		Map<String, Object> problems = new HashMap<String, Object>();
		problems.put("hasProblems", hasProblems);
		problems.put("noProblems", noProblems);
		problems.put("statistics", statistics);
		
		Map<String, Object> result = new HashMap<String, Object>();
		// 基本信息
		result.put("task", taskMap);
		// 审计结论
		result.put("auditResult", checkMaps);
		// 发现的问题
		result.put("problems", problems);
		return result;
	}

	/**
	 * 获取航站审计工作单的信息
	 * @param task
	 * @return
	 */
	public Map<String, Object> getTermTaskById(TaskDO task) {
		Map<String, Object> map = new HashMap<String, Object>();
		map.putAll(this.convert(task));
		List<CheckListDO> checkLists_ = checkListDao.getTermByTaskId(task.getId());
		List<Map<String, Object>> checkLists = new ArrayList<Map<String,Object>>();
		for (CheckListDO c : checkLists_){
			Map<String, Object> m = new HashMap<String, Object>();
			m.put("id", c.getId());
			m.put("itemId", c.getItem() == null ? "" : c.getItem().getId());
			m.put("itemPoint", c.getItemPoint());
			m.put("itemAccording", c.getItemAccording());
			m.put("itemPrompt", c.getItemPrompt());
			m.put("auditRecord", c.getAuditRecord());
			m.put("auditResult", c.getAuditResult() == null ? "" : c.getAuditResult().getId());
			m.put("auditResultName", c.getAuditResult() == null ? "" : c.getAuditResult().getName());
			m.put("improveLastDate", c.getImproveLastDate());
			m.put("termResponsibilityUnit", c.getTermResponsibilityUnit());
			m.put("files", fileDao.convert(fileDao.getFilesBySource(EnumFileType.CHECKLIST.getCode(), c.getId())));
			checkLists.add(m);
		}
		map.put("checkLists", checkLists);
		return map;
	}
	
	public boolean getTaskMenuPermission(Integer taskId) {
		TaskDO task = this.internalGetById(taskId);
		boolean flag = false;
		if (task != null) {
			UserDO currentUser = UserContext.getUser();
			if (EnumPlanType.TERM.toString().equals(task.getPlanType())) {
				if (professionUserDao.getYiJiShenJiZhuGuan().contains(currentUser) || professionUserDao.getYiJiShenJiJingLi().contains(currentUser)) {
					flag = true;
				}
				String operator = task.getOperator();
				UnitDO unit = unitDao.internalGetById(NumberHelper.toInteger(operator));
				String erjishenjizhuguan = dictionaryDao.getByTypeAndKey("审计角色", "A2.2") == null ? null : dictionaryDao.getByTypeAndKey("审计角色", "A2.2").getName();
				String erjishenjijingli = dictionaryDao.getByTypeAndKey("审计角色", "A2.1") == null ? null : dictionaryDao.getByTypeAndKey("审计角色", "A2.1").getName();
				if (auditorDao.boolRoleAndUserAndUnit(erjishenjijingli, currentUser, unit) || auditorDao.boolRoleAndUserAndUnit(erjishenjizhuguan, currentUser, unit)) {
					flag = true;
				}
			}
		}
		return flag;
	}
	
	public Set<String> getTaskMenuPermissionByUser(Integer taskId) {
		TaskDO task = this.internalGetById(taskId);
		Set<String> data = new HashSet<String>();
		if (task != null) {
			if (this.boolChuLiGuo("task", task.getId())) {
				data.add("task");
				data.add("report");
			}
			List<CheckDO> checks = checkDao.getChecks(taskId);
			int count = 0;
			for (CheckDO c : checks) {
				if (this.boolChuLiGuo("check", c.getId())) {
					count++;
				}
			}
			if (count > 0) {
				data.add("check");
			}
			ImproveDO improve = improveDao.getImproveByTaskId(taskId);
			if (improve != null) {
				if (this.boolChuLiGuo("improve", improve.getId())) {
					data.add("improve");
				}
				List<CheckListDO> checkLists = checkListDao.getByImproveId(improve.getId());
				String cur = "," + UserContext.getUserId() + ",";
				for (CheckListDO c : checkLists) {
					String cofirmMan = "," + c.getConfirmMan() + ",";
					if (cofirmMan.indexOf(cur) > -1) {
						data.add("trace");
					}
				}
			}
		}
		return data;
	}
	
	public boolean boolChuLiGuo(String type, Integer id) {
		String sql = "";
		if ("task".equals(type)) {
			sql = "select count(*) from a_has_completed a join a_task t on a.check_id = t.id where a.user_id = " + UserContext.getUserId() + "and t.id = " + id;
		} else if ("check".equals(type)) {
			sql = "select count(*) from a_has_completed a join a_check t on a.check_id = t.id where a.user_id = " + UserContext.getUserId() + "and t.id = " + id;
		} else if ("improve".equals(type)) {
			sql = "select count(*) from a_has_completed a join a_improve t on a.check_id = t.id where a.user_id = " + UserContext.getUserId() + "and t.id = " + id;
		}
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql);
		@SuppressWarnings("unchecked")
		List<Object> list = query.list();
		if (((BigDecimal)list.get(0)).intValue() > 0) {
			return true;
		} else {
			return false;
		}
	}
	
	@Override
	protected void afterGetList(List<Map<String, Object>> list, Map<String, Object> paramMap, Map<String, Object> searchMap, List<String> orders) {
		super.afterGetList(list, paramMap, searchMap, orders);
	}

	@Override
	public void writeUser(Integer id, String[] userIds) {
		// 已存在的user
		List<UserDO> existUsers = taskFlowUserDao.getUsersByTaskId(id);
		// 要加入的user
		List<UserDO> users = userDao.internalGetByIds(userIds);
		// 合并去重
		Set<UserDO> mergedUses = new HashSet<UserDO>();
		mergedUses.addAll(existUsers);
		mergedUses.addAll(users);

		TaskDO task = this.internalGetById(id);
		// 先删除数据库中已有的数据
		Set<TaskFlowUserDO> flowUsers = task.getFlowUsers();
		if (null != flowUsers) {
			taskFlowUserDao.delete(flowUsers);
		}
		// 再向数据库中添加新的数据
		for (UserDO user : mergedUses) {
			TaskFlowUserDO flowUser = new TaskFlowUserDO();
			flowUser.setTask(task);
			flowUser.setUser(user);
			taskFlowUserDao.internalSave(flowUser);
		}
	}

	@Override
	public void setStatus(Integer id, Integer statusId, Map<String, Object> attributes) {
		TaskDO task = this.internalGetById(id);
		// 将处理人置空
		Set<TaskFlowUserDO> flowUsers = task.getFlowUsers();
		if (null != flowUsers) {
			taskFlowUserDao.delete(flowUsers);
		}
		// 状态
		ActivityStatusDO status = activityStatusDao.internalGetById(statusId);
		if (null != status) {
			task.setFlowStatus(status.getName());
		}
		// 更新工作单的状态和工作流节点
		// 工作流节点属性
		if (null != attributes) {
			task.setFlowStep((String) attributes.get("flowStep"));
		}
		this.internalUpdate(task);
	}

	@Override
	public Collection<Integer> getUserByUnitRole(Integer id, Integer roleId) {
		// 取出安监部的ID
		Integer unitId = this.getRelatedUnitId(id);
		if (null == unitId) {
			return new HashSet<Integer>();
		}
		List<Integer> unitIds = new ArrayList<Integer>();
		unitIds.add(unitId);
		return unitRoleActorDao.getUserIdsByUnitIdsAndRoleId(roleId, unitIds);
	}
	
	@Override
	public Collection<Integer> getUserByUnitRoles(Integer id, Collection<Integer> roleIds) {
		// 取出安监部的ID
		Integer unitId = this.getRelatedUnitId(id);
		if (null == unitId) {
			return new HashSet<Integer>();
		}
		List<Integer> unitIds = new ArrayList<Integer>();
		unitIds.add(unitId);
		return unitRoleActorDao.getUserIdsByUnitIdsAndRoleIds(roleIds, unitIds);
	}
	
	@Override
	public Collection<Integer> getUserByOrganizationRole(Integer id, Integer roleId, String field) {
		// 取出组织的ID
		Integer organizationId = this.getRelatedOrganizationId(id, field);
		if (null == organizationId || null == roleId) {
			return new HashSet<Integer>();
		}
		List<Integer> organizationIds = new ArrayList<Integer>();
		organizationIds.add(organizationId);
		List<Integer> roleIds = new ArrayList<Integer>();
		roleIds.add(roleId);
		return unitRoleActorDao.getUserIdsByOrganizationIdsAndRoleIds(roleIds, organizationIds);
	}
	
	@Override
	public Collection<Integer> getUserByOrganizationRoles(Integer id, Collection<Integer> roleIds, String field) {
		// 取出组织的ID
		Integer organizationId = this.getRelatedOrganizationId(id, field);
		if (null == organizationId || null == roleIds || roleIds.isEmpty()) {
			return new HashSet<Integer>();
		}
		List<Integer> organizationIds = new ArrayList<Integer>();
		organizationIds.add(organizationId);
		return unitRoleActorDao.getUserIdsByOrganizationIdsAndRoleIds(roleIds, organizationIds);
	}
	
	/**
	 * 获取信息所属的安监机构的ID
	 * @param id
	 * @return
	 */
	@Override
	public Integer getRelatedUnitId(Integer id){
		Integer unitId = null;
		TaskDO task = this.internalGetById(id);
		if (null != task && null != task.getTarget()) {
			if (EnumPlanType.SUB2.toString().equals(task.getPlanType()) || EnumPlanType.SUB3.toString().equals(task.getPlanType())) { // 二三级的时候target表示组织
				// 取出安监部的ID
				OrganizationDO organization = organizationDao.internalGetById(Integer.parseInt(task.getTarget()));
				if (null != organization && null != organization.getUnit()) {
					unitId = organization.getUnit().getId();
				}
			} else if (EnumPlanType.SPOT.toString().equals(task.getPlanType()) || EnumPlanType.SPEC.toString().equals(task.getPlanType())) { // 现场检查和专项检查时operator表示安监机构
				unitId = Integer.parseInt(task.getOperator());
			} else if (EnumPlanType.TERM.toString().equals(task.getPlanType())){ // 航站审计 operator为安监机构
				unitId = Integer.parseInt(task.getOperator());
			} else {// 其他情况target的值表示安监机构
				unitId = Integer.parseInt(task.getTarget());
				
			}
		}
		return unitId;
	}

	@Override
	public Integer getRelatedOrganizationId(Integer id, String field) {
		Integer organizationId = null;
		TaskDO task = this.internalGetById(id);
		if (null != field) {
			if ("operator".equals(field)) {
				organizationId = Integer.parseInt(task.getOperator());
			} else if ("target".equals(field)) {
				organizationId = Integer.parseInt(task.getTarget());
			}
		} else {
			if (EnumPlanType.SUB2.toString().equals(task.getPlanType()) || EnumPlanType.SUB3.toString().equals(task.getPlanType())) { // 二三级取operator的值，表示组织
				organizationId = Integer.parseInt(task.getOperator());
			}
		}
		return organizationId;
	}
	
	/**
	 * 发送待办的信息
	 * @param id
	 * @param userIds
	 */
	@Override
	public void sendTodoMsg(Integer id, Collection<Integer> userIds, Collection<String> sendingModes) {
		TaskDO task = this.internalGetById(id);
		if (null != task && userIds != null && !userIds.isEmpty() && sendingModes != null && !sendingModes.isEmpty()) {
			// 标题
			String title = "审计待办提醒";
			// 正文内容
			String content = "您有一个工作单需要处理。名称[" + task.getDisplayName() + "], 详情请看安全审计中待我处理的审计任务。";

			// 获取ADMIN的id
			UserDO admin = userDao.getByUsername("ADMIN");
			// 接收人
			List<UserDO> users = userDao.getByIds(new ArrayList<Integer>(userIds));
			Collection<EnumMessageCatagory> sendingModeEnums = EnumMessageCatagory.getEnumByVals(sendingModes);
			// 保存
			messageDao.saveTodoMsg(sendingModeEnums, admin, users, title, content, id, "TASK");
		}
	}
	/**
	 * 获取审计执行单位的对象
	 * @param planType
	 * @return
	 */
	public Map<String, Object> getOperatorObj(PlanDO plan, TaskDO task, CheckDO check, ImproveDO improve) {
		Map<String, String> map = this.getObjParam(plan, task, check, improve);
		String planType = map.get("planType");
		String operator = map.get("operator");
		Map<String, Object> result = new HashMap<String, Object>();
		if (operator == null) return result;
		if (EnumPlanType.SYS.toString().equals(planType)) {
			UnitDO unit = unitDao.internalGetById(NumberHelper.toInteger(operator));
			result.put("name", unit.getName());
		} else if (EnumPlanType.SUB2.toString().equals(planType)) {
			UnitDO unit = unitDao.internalGetById(NumberHelper.toInteger(operator));
			result.put("name", unit.getName());
		} else if (EnumPlanType.SUB3.toString().equals(planType)) {
			OrganizationDO organzation = organizationDao.internalGetById(NumberHelper.toInteger(operator));
			result.put("name", organzation.getName());
		} else if (EnumPlanType.TERM.toString().equals(planType)) {
			UnitDO unit = unitDao.internalGetById(NumberHelper.toInteger(operator));
			result.put("name", unit.getName());
		} else if (EnumPlanType.SPOT.toString().equals(planType)) {
			//TODO
		} else if (EnumPlanType.SPEC.toString().equals(planType)) {
			//TODO
		}
		result.put("id", operator);
		return result;
	}
	/**
	 * 获取被审计单位的对象
	 * @param planType
	 * @return
	 */
	public Map<String, Object> getTargetObj(PlanDO plan, TaskDO task, CheckDO check, ImproveDO improve) {
		Map<String, String> map = this.getObjParam(plan, task, check, improve);
		String planType = map.get("planType");
		String target = map.get("target");
		String checkType = map.get("checkType");
		Map<String, Object> result = new HashMap<String, Object>();
		if (target == null) return result;
		if (EnumPlanType.SYS.toString().equals(planType)) {
			UnitDO unit = unitDao.internalGetById(NumberHelper.toInteger(target));
			result.put("name", unit.getName());
		} else if (EnumPlanType.SUB2.toString().equals(planType)) {
			OrganizationDO organzation = organizationDao.internalGetById(NumberHelper.toInteger(target));
			result.put("name", organzation.getName());
		} else if (EnumPlanType.SUB3.toString().equals(planType)) {
			OrganizationDO organzation = organizationDao.internalGetById(NumberHelper.toInteger(target));
			result.put("name", organzation.getName());
		} else if (EnumPlanType.TERM.toString().equals(planType)) {
			TerminalDO terminal = terminalDao.internalGetById(NumberHelper.toInteger(target));
			result.put("name", terminal.getAirport());
		} else if (EnumPlanType.SPOT.toString().equals(planType)) {
			//TODO
		} else if (EnumPlanType.SPEC.toString().equals(planType)) {
			if (EnumCheckGrade.SYS.toString().equals(checkType)) {
				UnitDO unit = unitDao.internalGetById(NumberHelper.toInteger(target));
				result.put("name", unit.getName());
			} else {
				OrganizationDO organization = organizationDao.internalGetById(NumberHelper.toInteger(target));
				result.put("name", organization.getName());
			}
		}
		result.put("id", target);
		return result;
	}

	private Map<String, String> getObjParam(PlanDO plan, TaskDO task, CheckDO check, ImproveDO improve) {
		String planType = null;
		String operator = null;
		String target = null;
		String checkType = null;
		if (plan != null) {
			planType = plan.getPlanType();
			operator = plan.getOperator();
		} else if (task != null) {
			planType = task.getPlanType();
			operator = task.getOperator();
			target = task.getTarget();
			checkType = task.getCheckType();
		} else if (check != null) {
			if (check.getTask() != null) {
				planType = check.getTask().getPlanType();
				operator = check.getTask().getOperator();
				target = check.getTask().getTarget();
				checkType = check.getTask().getCheckType();
			}
		} else if (improve != null) {
			if (improve.getTask() != null) {
				planType = improve.getTask().getPlanType();
				operator = improve.getTask().getOperator();
				target = improve.getTask().getTarget();
				checkType = improve.getTask().getCheckType();
			}
		}
		Map<String, String> map = new HashMap<String, String>();
		map.put("planType", planType);
		map.put("operator", operator);
		map.put("target", target);
		map.put("checkType", checkType);
		return map;
	}
	
	@SuppressWarnings("unchecked")
	public List<TaskDO> getByPlanIdAndPlanTime(Integer planId, String planTime) {
		return (List<TaskDO>) this.query("from TaskDO t where t.deleted = false and t.planTime = ? and t.plan.id = ?", planTime, planId);
	}
	
	@Override
	public void sendFeedbackMsg(Integer id, Collection<String> sendingModes) {
		// TODO Auto-generated method stub
		
	}

	public void setPlanDao(PlanDao planDao) {
		this.planDao = planDao;
	}

	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}

	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}

	public void setMasterDao(MasterDao masterDao) {
		this.masterDao = masterDao;
	}

	public void setUnitRoleActorDao(UnitRoleActorDao unitRoleActorDao) {
		this.unitRoleActorDao = unitRoleActorDao;
	}

	public void setDictionaryDao(DictionaryDao dictionaryDao) {
		this.dictionaryDao = dictionaryDao;
	}

	public void setTransactionHelper(TransactionHelper transactionHelper) {
		this.transactionHelper = transactionHelper;
	}

	public void setTaskFlowUserDao(TaskFlowUserDao taskFlowUserDao) {
		this.taskFlowUserDao = taskFlowUserDao;
	}

	public void setWorkflowService(WorkflowService workflowService) {
		this.workflowService = workflowService;
	}

	public void setCheckDao(CheckDao checkDao) {
		this.checkDao = checkDao;
	}

	public void setProfessionUserDao(ProfessionUserDao professionUserDao) {
		this.professionUserDao = professionUserDao;
	}

	public void setAuditActivityLoggingDao(AuditActivityLoggingDao auditActivityLoggingDao) {
		this.auditActivityLoggingDao = auditActivityLoggingDao;
	}

	public void setActivityStatusDao(ActivityStatusDao activityStatusDao) {
		this.activityStatusDao = activityStatusDao;
	}

	public void setCheckListDao(CheckListDao checkListDao) {
		this.checkListDao = checkListDao;
	}

	public void setOrganizationDao(OrganizationDao organizationDao) {
		this.organizationDao = organizationDao;
	}

	public void setTerminalDao(TerminalDao terminalDao) {
		this.terminalDao = terminalDao;
	}

	public void setFileDao(FileDao fileDao) {
		this.fileDao = fileDao;
	}

	public void setAuditWorkflowSchemeDao(AuditWorkflowSchemeDao auditWorkflowSchemeDao) {
		this.auditWorkflowSchemeDao = auditWorkflowSchemeDao;
	}

	public void setAuditorDao(AuditorDao auditorDao) {
		this.auditorDao = auditorDao;
	}

	public void setImproveDao(ImproveDao improveDao) {
		this.improveDao = improveDao;
	}

	public void setMessageDao(MessageDao messageDao) {
		this.messageDao = messageDao;
	}

	public void setUserGroupDao(UserGroupDao userGroupDao) {
		this.userGroupDao = userGroupDao;
	}

	public void setAuditReportDao(AuditReportDao auditReportDao) {
		this.auditReportDao = auditReportDao;
	}
	
	
}
