package com.usky.sms.audit.plan;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.activity.attribute.ActivityStatusDO;
import com.usky.sms.activity.attribute.ActivityStatusDao;
import com.usky.sms.audit.EnumAuditRole;
import com.usky.sms.audit.IAudit;
import com.usky.sms.audit.auditor.AuditorDao;
import com.usky.sms.audit.base.ProfessionUserDao;
import com.usky.sms.audit.log.AuditActivityLoggingDao;
import com.usky.sms.audit.log.operation.AuditActivityLoggingOperationRegister;
import com.usky.sms.audit.task.TaskDO;
import com.usky.sms.audit.task.TaskDao;
import com.usky.sms.audit.terminal.TerminalDO;
import com.usky.sms.audit.terminal.TerminalDao;
import com.usky.sms.audit.workflow.AuditWorkflowSchemeDao;
import com.usky.sms.common.NumberHelper;
import com.usky.sms.constant.EnumMessageCatagory;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.core.TransactionHelper;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.message.MessageDao;
import com.usky.sms.organization.OrganizationDO;
import com.usky.sms.organization.OrganizationDao;
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

public class PlanDao extends BaseDao<PlanDO> implements IUwfFuncPlugin, IAudit {

	@Autowired
	private TransactionHelper transactionHelper;
	
	@Autowired
	private DictionaryDao dictionaryDao;
	
	@Autowired
	private UnitRoleActorDao unitRoleActorDao;
	
	@Autowired
	private UserDao userDao;
	
	@Autowired
	private PlanFlowUserDao planFlowUserDao;
	
	@Autowired
	private WorkflowService workflowService;

	@Autowired
	private AuditActivityLoggingDao auditActivityLoggingDao;
	
	@Autowired
	private ActivityStatusDao activityStatusDao;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private OrganizationDao organizationDao;
	
	@Autowired
	private AuditUnitDao auditUnitDao;
	
	@Autowired
	private TerminalDao terminalDao;
	
	@Autowired
	private AuditWorkflowSchemeDao auditWorkflowSchemeDao;
	
	@Autowired
	private ProfessionUserDao professionUserDao;
	
	@Autowired
	private UserGroupDao userGroupDao;
	
	@Autowired
	private MessageDao messageDao;
	
	@Autowired
	private AuditorDao auditorDao;
	
	@Autowired
	private TaskDao taskDao;

	protected PlanDao() {
		super(PlanDO.class);
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		// 校验是否已经创建过计划
		String planType = (String) map.get("planType");
		Double year = (Double) map.get("year");
		String checkType = (String) map.get("checkType");
		String operator = (String) map.get("operator");
		if (null != planType && null != year) {
			this.validateHasPlan(year.intValue(), planType, checkType, operator);
		}
		
		// 实施主体
		if (null == map.get("operator")) {
			map.put("operator", this.getOperator(planType, checkType));
		}
		map.put("creator", UserContext.getUserId());
		map.put("lastUpdater", UserContext.getUserId());
		return true;
	}
	
	@Override
	protected void afterSave(PlanDO obj) {
		String planType = obj.getPlanType();
		if (!EnumPlanType.SPOT.toString().equals(planType) && !EnumPlanType.SPEC.toString().equals(planType)) { // 现场检查和专项检查不需要工作流
			String workflowTemplateId = auditWorkflowSchemeDao.getWorkflowTempIdBySearch(planType, obj.getCheckType(), "PLAN");
			Map<String, Object> objmap = new HashMap<String, Object>();
			objmap.put("id", obj.getId());
			objmap.put("dataobject", "plan");
			String workflowId = (String) transactionHelper.doInTransaction(new WfSetup(), "Submit", UserContext.getUserId().toString(), workflowTemplateId, "", "", gson.toJson(objmap));
			obj.setFlowId(workflowId);
		}
		this.internalUpdate(obj);
		
		// 添加活动日志
		addActivityLoggingForAddPlan(obj);
	}

	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		PlanDO plan = this.internalGetById(id);
		if (null != map.get("planTime")) {
			if(!StringUtils.isBlank(plan.getPlanTime())){
				if (plan.getPlanTime().contains((String)map.get("planTime"))) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "该时间段已经存在了");
				}
				map.put("planTime", plan.getPlanTime() + "," + (String)map.get("planTime"));
			}
		}
		map.put("lastUpdater", UserContext.getUserId());
	}
	
	/**
	 * 添加审计计划的活动日志
	 * @param plan
	 */
	public void addActivityLoggingForAddPlan(PlanDO plan){
		auditActivityLoggingDao.addLogging(plan.getId(), "plan", AuditActivityLoggingOperationRegister.getOperation("ADD_PLAN"));
	}
	
	/**
	 * 校验是否已经创建计划了
	 * @param map
	 */
	public void validateHasPlan(Integer year, String planType, String checkType, String operator) {
		if (this.hasPlanByYearAndType(year, planType, checkType, operator)) {
			try {
				StringBuffer errorMessage = new StringBuffer();
				errorMessage.append(year.intValue());
				errorMessage.append("年的");
				if (null != checkType) {
					errorMessage.append(EnumCheckGrade.getEnumByVal(checkType).getDescription());
				}
				if (null != operator) {
					Map<String, Object> operatorMap = this.getOperator(planType, checkType, operator);
					errorMessage.append(operatorMap.get("name"));
				}
				errorMessage.append(EnumPlanType.getEnumByVal(planType).getDescription());
				errorMessage.append("安全审计计划已存在！");
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, errorMessage.toString());
			} catch (Exception e) {
				e.printStackTrace();
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, e.getMessage());
			}
		}
	}

	public List<PlanDO> getPlanByYearAndType(List<Integer> year, String planType, String checkType, String operator){
		StringBuffer hql = new StringBuffer("select distinct t from PlanDO t left join fetch t.tasks where t.deleted = false");
		List<Object> values = new ArrayList<Object>();
		List<String> params = new ArrayList<String>();
		if (null != planType) {
			hql.append(" and t.planType = :planType");
			params.add("planType");
			values.add(planType);
		}
		if (null != checkType) {
			hql.append(" and t.checkType = :checkType");
			params.add("checkType");
			values.add(checkType);
		}
		if (null != year && !year.isEmpty()) {
			hql.append(" and t.year in (:year)");
			params.add("year");
			values.add(year);
		}
		if (operator != null){
			hql.append(" and t.operator in (:operator)");
			params.add("operator");
			values.add(NumberHelper.toInteger(operator).toString());
		}
		hql.append(" order by t.year");
		@SuppressWarnings("unchecked")
		List<PlanDO> plans = (List<PlanDO>) this.query(hql.toString(), params.toArray(new String[0]), values.toArray());
		return plans;
	}
	
	/**
	 * 返回某年某类型的审计计划是否已经存在
	 * @param year
	 * @param planType
	 * @param checkType
	 * @return
	 */
	public boolean hasPlanByYearAndType(Integer year, String planType, String checkType, String operator) {
		boolean hasPlan = false;
		if (null != year && null != planType) {
			StringBuffer hql = new StringBuffer("select count(t) from PlanDO t where t.deleted = false and t.planType = ? and t.year = ?");
			List<Object> values = new ArrayList<Object>();
			values.add(planType);
			values.add(year);
			if (null != checkType) {
				hql.append(" and t.checkType = ?");
				values.add(checkType);
			}
			if (operator != null){
				hql.append(" and t.operator = ?");
				values.add(operator);
			}
			@SuppressWarnings("unchecked")
			List<Long> count = (List<Long>) this.query(hql.toString(), values.toArray());
			if (!count.isEmpty()) {
				hasPlan = count.get(0) > 0;
			}
		}
		return hasPlan;
	}
	
	/**
	 * 获取审计单位的map
	 * @param planType
	 * @param checkType
	 * @param operartorId
	 * @return
	 */
	public Map<String, Object> getOperator(String planType, String checkType, String operartorId){
		Map<String, Object> operatorMap = new HashMap<String, Object>();
		if (null != planType && null != operartorId) {
			if (EnumPlanType.SUB3.toString().equals(planType)) { // 部门三级operator表示组织
				// 取出安监部的ID
				OrganizationDO organization = organizationDao.internalGetById(Integer.parseInt(operartorId));
				if (null != organization) {
					operatorMap.put("id", organization.getId());
					operatorMap.put("name", organization.getName());
				}
			} else { // 其他情况operator的值表示安监机构
				UnitDO unit = unitDao.internalGetById(Integer.parseInt(operartorId));
				if (null != unit) {
					operatorMap.put("id", unit.getId());
					operatorMap.put("name", unit.getName());
				}
			}
		}
		return operatorMap;
	}

	/**
	 * 根据计划的类型获取审计单位id
	 * @param planType
	 * @return
	 */
	public String getOperator(String planType, String checkType){
		if (null != planType) {
			if (EnumPlanType.SYS.toString().equals(planType) || EnumCheckGrade.SYS.toString().equals(checkType) || EnumPlanType.TERM.toString().equals(planType)) { // 系统级的时候取安监部的id
				// 取出安监部的ID(从字典中获取)
				DictionaryDO dic = dictionaryDao.getByTypeAndName("审计参数", "公司级安监机构");
				if (null == dic) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "字典中没有配置类型为:审计参数,名称为:公司级安监机构的记录！");
				}
				return dic.getValue();
			}
		}
		return null;
	}
	
	/**
	 * 获取创建最早的计划的年份
	 * @return
	 */
	public Integer getFirstPlanYear(String planType, String checkType){
		StringBuffer hql = new StringBuffer("select min(year) from PlanDO t where t.deleted = 0");
		List<Object> values = new ArrayList<Object>();
		if (null != planType) {
			hql.append(" and t.planType = ?");
			values.add(planType);
		}
		if (null != checkType) {
			hql.append(" and t.checkType = ?");
			values.add(checkType);
		}
		@SuppressWarnings("unchecked")
		List<Integer> minYear = (List<Integer>) this.query(hql.toString(), values.toArray());
		if (minYear.isEmpty()) {
			return null;
		}
		return minYear.get(0);
	}
	
	/**
	 * 获取计划的targetMap
	 * @param plans
	 * @return
	 */
	public List<Map<String, Object>> getTargetMaps(List<PlanDO> plans, String planType, String checkType, String operator, List<Integer> targetIds){
		// 类型不是现场检查时获取所有的targetId
		if (!EnumPlanType.SPOT.toString().equals(planType)) {
			targetIds = new ArrayList<Integer>();
			for (PlanDO plan : plans) {
				Set<TaskDO> tasks = plan.getTasks();
				if (null != tasks) {
					for (TaskDO task : tasks) {
						if (null != task.getTarget() && !task.isDeleted()) {
							targetIds.add(Integer.parseInt(task.getTarget()));
						}
					}
				}
			}
		}
		
		List<Map<String, Object>> targets = new ArrayList<Map<String,Object>>();
		// 系统级审计和系统级专项检查时关联安监机构
		if (EnumPlanType.SYS.toString().equals(planType) || (EnumPlanType.SPEC.toString().equals(planType) && EnumCheckGrade.SYS.toString().equals(checkType))) {
			List<UnitDO> units = auditUnitDao.getAllUnits(targetIds);
			for (UnitDO unit : units) {
				Map<String, Object> target = new HashMap<String, Object>();
				target.put("id", unit.getId());
				target.put("name", unit.getName());
				targets.add(target);
			}
		} else if (EnumPlanType.SUB2.toString().equals(planType) || (EnumPlanType.SPEC.toString().equals(planType) && EnumCheckGrade.SUB2.toString().equals(checkType))) {// 分子公司级和分子公司的专项检查关联安监机构下的组织
			UnitDO unit = unitDao.internalGetById(NumberHelper.toInteger(operator));
			if (unit != null){
				List<OrganizationDO> organizations = organizationDao.getByOlevelAndUnit("3", unit.getId());
				for (OrganizationDO o : organizations){
					Map<String, Object> m = new HashMap<String, Object>();
					m.put("id", o.getId());
					m.put("name", o.getName());
					targets.add(m);
				}
			}
		} else if (EnumPlanType.SPOT.toString().equals(planType)) { // 现场检查关联类型是"现场检查"的字典
			if (null != targetIds && !targetIds.isEmpty()) {
				List<DictionaryDO> dics = dictionaryDao.getByIds(targetIds);
				for (DictionaryDO dic : dics) {
					Map<String, Object> target = new HashMap<String, Object>();
					target.put("id", dic.getId());
					target.put("name", dic.getName());
					targets.add(target);
				}
			}
		} else if (EnumPlanType.SUB3.toString().equals(planType)){
			OrganizationDO organization = organizationDao.internalGetById(NumberHelper.toInteger(operator));
			if (organization != null && organization.getUnit() != null){
				List<OrganizationDO> organizations = organizationDao.getByParentAndUnit(organization.getId(), organization.getUnit().getId());
				for (OrganizationDO o : organizations){
					Map<String, Object> m = new HashMap<String, Object>();
					m.put("id", o.getId());
					m.put("name", o.getName());
					targets.add(m);
				}
			}
		} else if (EnumPlanType.TERM.toString().equals(planType)){
			List<TerminalDO> terminals = terminalDao.getList();
			for (TerminalDO t : terminals){
				Map<String, Object> target = new HashMap<String, Object>();
				target.put("id", t.getId());
				target.put("name", t.getAirport());
				targets.add(target);
			}
		}
		return targets;
	}
	
	public Boolean boolSeePlan(String planType, String checkType) {
		UserDO currentUser = UserContext.getUser();
		Boolean flag = false;
		if (EnumPlanType.SYS.toString().equals(planType)) {
			if (professionUserDao.getYiJiShenJiZhuGuan().contains(currentUser) || professionUserDao.getYiJiShenJiJingLi().contains(currentUser)) {
				flag = true;
			}
		}
		if (EnumPlanType.SUB2.toString().equals(planType)) {
			if (professionUserDao.getYiJiShenJiZhuGuan().contains(currentUser) || professionUserDao.getYiJiShenJiJingLi().contains(currentUser)) {
				flag = true;
			}
			String erjishenjizhuguan = dictionaryDao.getByTypeAndKey("审计角色", "A2.2") == null ? null : dictionaryDao.getByTypeAndKey("审计角色", "A2.2").getName();
			String erjishenjijingli = dictionaryDao.getByTypeAndKey("审计角色", "A2.1") == null ? null : dictionaryDao.getByTypeAndKey("审计角色", "A2.1").getName();
			if (unitRoleActorDao.isRole(currentUser.getId(),erjishenjizhuguan) || unitRoleActorDao.isRole(currentUser.getId(),erjishenjijingli)) {
				flag = true;
			}
		}
		if (EnumPlanType.SUB3.toString().equals(planType)) {
			if (professionUserDao.getYiJiShenJiZhuGuan().contains(currentUser) || professionUserDao.getYiJiShenJiJingLi().contains(currentUser)) {
				flag = true;
			}
			String erjishenjizhuguan = dictionaryDao.getByTypeAndKey("审计角色", "A2.2") == null ? null : dictionaryDao.getByTypeAndKey("审计角色", "A2.2").getName();
			String erjishenjijingli = dictionaryDao.getByTypeAndKey("审计角色", "A2.1") == null ? null : dictionaryDao.getByTypeAndKey("审计角色", "A2.1").getName();
			if (unitRoleActorDao.isRole(currentUser.getId(),erjishenjizhuguan) || unitRoleActorDao.isRole(currentUser.getId(),erjishenjijingli)) {
				flag = true;
			}
			String sanjishenjizhuguan = dictionaryDao.getByTypeAndKey("审计角色", "A3.2") == null ? null : dictionaryDao.getByTypeAndKey("审计角色", "A3.2").getName();
			String sanjishenjijingli = dictionaryDao.getByTypeAndKey("审计角色", "A3.1") == null ? null : dictionaryDao.getByTypeAndKey("审计角色", "A3.1").getName();
			if (unitRoleActorDao.isRole(currentUser.getId(),sanjishenjizhuguan) || unitRoleActorDao.isRole(currentUser.getId(),sanjishenjijingli)) {
				flag = true;
			}
		}
		// 现场检查和专项检查时
		if (EnumPlanType.SPOT.toString().equals(planType) || EnumPlanType.SPEC.toString().equals(planType)) {
			List<DictionaryDO> dics = dictionaryDao.getListByType("审计角色");
			Map<String, Object> roleMap = new HashMap<String, Object>();
			for (DictionaryDO dic : dics) {
				roleMap.put(dic.getKey(), dic.getName());
			}
			boolean isFirstRole = userGroupDao.isUserGroups(UserContext.getUserId(), (String) roleMap.get(EnumAuditRole.FIRST_GRADE_CHECK_MANAGER_GROUP.getKey()), (String) roleMap.get(EnumAuditRole.FIRST_GRADE_CHECK_MASTER_GROUP.getKey()), (String) roleMap.get(EnumAuditRole.FIRST_GRADE_CHECKER.getKey()));
			if (isFirstRole) { // 一级检查经理，一级检查主管，一级检查员可以看所有的
				flag = true;
			} else if (EnumCheckGrade.SUB2.toString().equals(checkType)) { // 二级检查经理、二级检查主管、二级检查员可以看分子公司的
				flag = unitRoleActorDao.isRoles(UserContext.getUserId(), (String) roleMap.get(EnumAuditRole.SECOND_GRADE_CHECK_MANAGER.getKey()), (String) roleMap.get(EnumAuditRole.SECOND_GRADE_CHECK_MASTER.getKey()), (String) roleMap.get(EnumAuditRole.SECOND_GRADE_CHECKER.getKey()));
			}
		}
		return flag;
	}
	
	/**
	 * 修改计划时间
	 * @param operate 新增、修改、删除
	 * @param id 计划id
	 * @param oldPlanTime 旧的计划时间
	 * @param newPlanTime 新的计划时间
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void modifyPlanTime(String operate, Integer id, String oldPlanTime, String newPlanTime) {
		PlanDO plan = this.internalGetById(id);
		if ("add".equals(operate) && StringUtils.isNotBlank(newPlanTime)) {
			if (null != plan.getPlanTime()) {
				if (plan.getPlanTime().contains(newPlanTime)) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "该时间段已经存在了");
				}
				plan.setPlanTime(plan.getPlanTime() + "," + newPlanTime);
			} else {
				plan.setPlanTime(newPlanTime);
			}
		} else if ("modify".equals(operate)) {
			plan.setPlanTime(plan.getPlanTime().replaceAll(oldPlanTime, newPlanTime));
			List<TaskDO> tasks = taskDao.getByPlanIdAndPlanTime(id, oldPlanTime);
			for (TaskDO task : tasks) {
				task.setPlanTime(newPlanTime);
				taskDao.update(task);
			}
		} else if ("delete".equals(operate)) {
			plan.setPlanTime(StringUtils.strip(("," + plan.getPlanTime()).replaceAll("," + oldPlanTime, ""), ","));
			List<TaskDO> tasks = taskDao.getByPlanIdAndPlanTime(id, oldPlanTime);
			taskDao.delete(tasks);
		}
		this.update(plan);
	}
	
	@Override
	public void writeUser(Integer id, String[] userIds) {
		// 要加入的user
		List<UserDO> users = userDao.internalGetByIds(userIds);

		PlanDO plan = this.internalGetById(id);
		// 先删除数据库中已有的数据
		Set<PlanFlowUserDO> flowUsers = plan.getFlowUsers();
		if (null != flowUsers) {
			planFlowUserDao.delete(flowUsers);
		}
		// 再向数据库中添加新的数据
		for (UserDO user : users) {
			PlanFlowUserDO flowUser = new PlanFlowUserDO();
			flowUser.setPlan(plan);
			flowUser.setUser(user);
			planFlowUserDao.internalSave(flowUser);
		}
	}

	@Override
	public void setStatus(Integer id, Integer statusId, Map<String, Object> attributes) {
		PlanDO plan = this.internalGetById(id);
		// 将处理人置空
		Set<PlanFlowUserDO> flowUsers = plan.getFlowUsers();
		if (null != flowUsers) {
			planFlowUserDao.delete(flowUsers);
		}
		// 状态
		ActivityStatusDO status = activityStatusDao.internalGetById(statusId);
		if (null != status) {
			plan.setFlowStatus(status.getName());
		}
		// 更新计划的工作流节点
		// 工作流节点属性
		if (null != attributes) {
			plan.setFlowStep((String) attributes.get("flowStep"));
		}
		// 更新人
		plan.setLastUpdater(UserContext.getUser());
		this.internalUpdate(plan);
	}

	@Override
	public Collection<Integer> getUserByUnitRole(Integer id, Integer roleId) {
		// 取出安监部的ID
		Integer unitId = this.getRelatedUnitId(id);
		List<Integer> unitIds = new ArrayList<Integer>();
		unitIds.add(unitId);
		return unitRoleActorDao.getUserIdsByUnitIdsAndRoleId(roleId, unitIds);
	}
	
	@Override
	public Collection<Integer> getUserByUnitRoles(Integer id, Collection<Integer> roleIds) {
		// 取出安监部的ID
		Integer unitId = this.getRelatedUnitId(id);
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
		PlanDO plan = this.internalGetById(id);
		if (null != plan && null != plan.getOperator()) {
			if (EnumPlanType.SUB3.toString().equals(plan.getPlanType())) { // 部门三级operator表示组织
				// 取出安监部的ID
				OrganizationDO organization = organizationDao.internalGetById(Integer.parseInt(plan.getOperator()));
				if (null != organization && null != organization.getUnit()) {
					unitId = organization.getUnit().getId();
				}
			} else { // 其他情况operator的值表示安监机构
				unitId = Integer.parseInt(plan.getOperator());
			}
		}
		return unitId;
	}

	@Override
	public Integer getRelatedOrganizationId(Integer id, String field) {
		PlanDO plan = this.internalGetById(id);
		Integer organizationId = null;
		if (null != field) {
			if ("operator".equals(field)) {
				organizationId = Integer.parseInt(plan.getOperator());
			} else if ("target".equals(field)) {
//				organizationId = Integer.parseInt(plan.getTarget());
			}
		} else {
			if (EnumPlanType.SUB3.toString().equals(plan.getPlanType())){
				if (plan.getOperator() != null){
					organizationId = Integer.parseInt(plan.getOperator());
				}
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
		PlanDO plan = this.internalGetById(id);
		if (null != plan && userIds != null && !userIds.isEmpty() && sendingModes != null && !sendingModes.isEmpty()) {
			// 标题
			String title = "审计待办提醒";
			// 正文内容
			String content = "您有一个计划需要处理。名称[" + plan.getDisplayName() + "], 详情请看安全审计中待我处理的审计任务。";

			// 获取ADMIN的id
			UserDO admin = userDao.getByUsername("ADMIN");
			// 接收人
			List<UserDO> users = userDao.getByIds(new ArrayList<Integer>(userIds));
			Collection<EnumMessageCatagory> sendingModeEnums = EnumMessageCatagory.getEnumByVals(sendingModes);
			// 保存
			messageDao.saveTodoMsg(sendingModeEnums, admin, users, title, content, id, "PLAN");
		}
	}
	
	@Override
	public void sendFeedbackMsg(Integer id, Collection<String> sendingModes) {
		// TODO Auto-generated method stub
		
	}

	public void setTransactionHelper(TransactionHelper transactionHelper) {
		this.transactionHelper = transactionHelper;
	}

	public void setDictionaryDao(DictionaryDao dictionaryDao) {
		this.dictionaryDao = dictionaryDao;
	}

	public void setUnitRoleActorDao(UnitRoleActorDao unitRoleActorDao) {
		this.unitRoleActorDao = unitRoleActorDao;
	}

	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}

	public void setPlanFlowUserDao(PlanFlowUserDao planFlowUserDao) {
		this.planFlowUserDao = planFlowUserDao;
	}

	public void setWorkflowService(WorkflowService workflowService) {
		this.workflowService = workflowService;
	}

	public void setAuditActivityLoggingDao(AuditActivityLoggingDao auditActivityLoggingDao) {
		this.auditActivityLoggingDao = auditActivityLoggingDao;
	}

	public void setActivityStatusDao(ActivityStatusDao activityStatusDao) {
		this.activityStatusDao = activityStatusDao;
	}

	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}

	public void setOrganizationDao(OrganizationDao organizationDao) {
		this.organizationDao = organizationDao;
	}

	public void setAuditUnitDao(AuditUnitDao auditUnitDao) {
		this.auditUnitDao = auditUnitDao;
	}

	public void setTerminalDao(TerminalDao terminalDao) {
		this.terminalDao = terminalDao;
	}

	public void setAuditWorkflowSchemeDao(AuditWorkflowSchemeDao auditWorkflowSchemeDao) {
		this.auditWorkflowSchemeDao = auditWorkflowSchemeDao;
	}

	public void setProfessionUserDao(ProfessionUserDao professionUserDao) {
		this.professionUserDao = professionUserDao;
	}

	public void setUserGroupDao(UserGroupDao userGroupDao) {
		this.userGroupDao = userGroupDao;
	}

	public void setAuditorDao(AuditorDao auditorDao) {
		this.auditorDao = auditorDao;
	}

	public void setTaskDao(TaskDao taskDao) {
		this.taskDao = taskDao;
	}

	public void setMessageDao(MessageDao messageDao) {
		this.messageDao = messageDao;
	}
}
