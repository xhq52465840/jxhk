package com.usky.sms.audit.improve;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.time.DateUtils;
import org.apache.log4j.MDC;
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
import com.usky.sms.audit.check.CheckListDO;
import com.usky.sms.audit.check.CheckListDao;
import com.usky.sms.audit.check.EnumImproveItemStatus;
import com.usky.sms.audit.check.EnumTraceItemStatus;
import com.usky.sms.audit.log.AuditActivityLoggingDao;
import com.usky.sms.audit.log.operation.AuditActivityLoggingOperationRegister;
import com.usky.sms.audit.plan.EnumCheckGrade;
import com.usky.sms.audit.plan.EnumPlanType;
import com.usky.sms.audit.plan.PlanDao;
import com.usky.sms.audit.task.MasterDO;
import com.usky.sms.audit.task.TaskDO;
import com.usky.sms.audit.task.TaskDao;
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
import com.usky.sms.email.EmailDO;
import com.usky.sms.message.MessageDao;
import com.usky.sms.organization.OrganizationDO;
import com.usky.sms.organization.OrganizationDao;
import com.usky.sms.role.RoleDO;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.unit.UnitRoleActorDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;
import com.usky.sms.user.UserGroupDO;
import com.usky.sms.uwf.WfSetup;
import com.usky.sms.uwffunc.IUwfFuncPlugin;

public class ImproveDao extends BaseDao<ImproveDO> implements IUwfFuncPlugin, IAudit{

	@Autowired
	private DictionaryDao dictionaryDao;
	
	@Autowired
	private ImproveFlowUserDao improveFlowUserDao;

	@Autowired
	private UserDao userDao;

	@Autowired
	private ActivityStatusDao activityStatusDao;
	
	@Autowired
	private UnitRoleActorDao unitRoleActorDao;
	
	@Autowired
	private TransactionHelper transactionHelper;
	
	@Autowired
	private TaskDao taskDao;
	
	@Autowired
	private CheckListDao checkListDao;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private PlanDao planDao;
	
	@Autowired
	private AuditActivityLoggingDao auditActivityLoggingDao;
	
	@Autowired
	private TransactorDao transactorDao;
	
	@Autowired
	private OrganizationDao organizationDao;
	
	@Autowired
	private AuditorDao auditorDao;
	
	@Autowired
	private AuditWorkflowSchemeDao auditWorkflowSchemeDao;
	
	@Autowired
	private ProfessionUserDao professionUserDao;
	
	@Autowired
	private MessageDao messageDao;
	
	@Autowired
	private AuditReportDao auditReportDao;
	
	protected ImproveDao() {
		super(ImproveDO.class);
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
				} else if ("task.planType".equals(paramMap.get("key"))) {
					if (paramMap.get("value") instanceof List) {
						planTypes.addAll((List) paramMap.get("value"));
					} else {
						planTypes.add((String) paramMap.get("value"));
					}
				}
			}
		}
		if (permittedQuery) {
			return "from " + clazz.getSimpleName() + " t where t.deleted = false and (t.task.id in (" + taskDao.getPermittedTaskBaseHql(planTypes) + ")) and (";
		}
		return super.getBaseHql(map);
	}
	
	@Override
	protected String getQueryParamName(String key) {
		if ("planType".equals(key) || "checkType".equals(key)) {
			return "t.task." + key;
		} else {
			return super.getQueryParamName(key);
		}
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
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		ImproveDO improve = (ImproveDO) obj;
		if ("target".equals(fieldName) && null != improve.getTarget()) { // 审计对象
			map.put("target", getTarget(improve.getTask().getPlanType(), improve.getTarget()));
		} else if ("operator".equals(fieldName) && null != improve.getOperator()) {
			map.put("operator", planDao.getOperator(improve.getTask().getPlanType(), improve.getTask().getCheckType(), improve.getOperator()));
		} else if ("improveUnit".equals(fieldName)) { // 责任单位
			Map<String, Object> unitMap = new HashMap<String,Object>();
			if (null != improve.getImproveUnit()) {
				String id = improve.getImproveUnit();
				if(id.startsWith(AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT)){ // 安监机构时
					UnitDO unit = unitDao.internalGetById(Integer.parseInt(id.replaceAll(AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT, "")));
					if (null != unit){
						unitMap.put("id", unit.getId());
						unitMap.put("type", AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT);
						unitMap.put("name", unit.getName());
					}
				} else if(id.startsWith(AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP)) { // 组织时
					OrganizationDO organization = organizationDao.internalGetById(Integer.parseInt(id.replaceAll(AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP, "")));
					if (null != organization) {
						unitMap.put("id", organization.getId());
						unitMap.put("type", AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP);
						unitMap.put("name", organization.getName());
					}
				}
				map.put(fieldName, unitMap);
			}
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}

	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple,
			boolean showExtendFields) {
		ImproveDO improve = (ImproveDO) obj;
		Set<ImproveFlowUserDO> flowUsers = improve.getFlowUsers();
		List<Map<String,Object>> flowUsersList = new ArrayList<Map<String,Object>>();
		if (flowUsers != null){
			for (ImproveFlowUserDO improveFlowUser : flowUsers){
				if (improveFlowUser.getFlowUser() != null){
					Map<String, Object> useMap = new HashMap<String, Object>();
					useMap.put("id", improveFlowUser.getFlowUser().getId());
					useMap.put("name", improveFlowUser.getFlowUser().getFullname());
					flowUsersList.add(useMap);
				}
			}
		}
		map.put("flowUsers", flowUsersList);
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		// 保存之前将工作单已有对应的整改单删除
		int taskId = ((Double) map.get("task")).intValue();
		List<ImproveDO> improves = this.getImprovesByTaskId(taskId);
		this.delete(improves);
		// 创建人
		map.put("creator", UserContext.getUserId());
		// 更新人
		map.put("lastUpdater", UserContext.getUserId());
		return true;
	}
	
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}

	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(Collection<ImproveDO> list) {
		beforeDelete(list);
		for (ImproveDO obj : list) {
			obj.setDeleted(true);
		}
		this.getHibernateTemplate().saveOrUpdateAll(list);
		afterDelete(list);
	}

	protected String getConclusion(Set<CheckListDO> allchecklist){
		Integer wait = 0;
		Integer hasfinish = 0;
		Integer deferfinish = 0;
		Integer mislead = 0;
		Integer sum = 0;
		if (allchecklist != null){
			for (CheckListDO checklist : allchecklist){
				if (checklist.getTraceItemStatus() == null && EnumImproveItemStatus.暂时无法完成.getCode() != checklist.getImproveItemStatus()){
					wait ++;
				} else if (EnumTraceItemStatus.完成验证.getCode().equals(checklist.getTraceItemStatus())){
					hasfinish ++;
					if (checklist.getImproveDate() != null && checklist.getConfirmDate() != null){
						if (DateUtils.addDays(checklist.getImproveDate(), 1).after(checklist.getImproveLastDate()) || DateUtils.addDays(checklist.getConfirmDate(), 1).after(checklist.getConfirmLastDate())){
							deferfinish ++;
						}
					}
				} else if (EnumTraceItemStatus.暂时无法完成.getCode().equals(checklist.getTraceItemStatus()) || EnumImproveItemStatus.暂时无法完成.getCode() == checklist.getImproveItemStatus()){
					mislead ++;
				} 
			}
			sum = allchecklist.size();
		}
		String conclusion = "总共验证" + sum + "项,其中待验证" + wait + "项,已完成验证" + hasfinish + "项,未按时完成验证" + deferfinish + "项,暂时无法完成验证" + mislead + "项.";
		return conclusion;
	}
	
	private List<CheckListDO> getCurrentCheckLists(ImproveDO improve, List<CheckListDO> allchecklist){
		UserDO user = UserContext.getUser();
		List<CheckListDO> checklists = new ArrayList<CheckListDO>();
		if (boolrole(improve, user)) { // 是否为一级审计经理
			for (CheckListDO checklist : allchecklist) {
				if (EnumImproveItemStatus.暂时无法完成.getCode() == checklist.getImproveItemStatus()
						|| EnumImproveItemStatus.整改完成.getCode() == checklist.getImproveItemStatus()
						|| EnumImproveItemStatus.已指派.getCode() == checklist.getImproveItemStatus()
						|| EnumImproveItemStatus.验证通过.getCode() == checklist.getImproveItemStatus()) { // 状态为 整改完成，已指派，通过
					checklists.add(checklist);
				}
			}
		} else {
			for (CheckListDO checklist : allchecklist) {
				String confirmMan = "," + checklist.getConfirmMan() + ",";
				String userid = "," + user.getId() + ",";
				if ((EnumImproveItemStatus.暂时无法完成.getCode() == checklist.getImproveItemStatus()
						|| EnumImproveItemStatus.已指派.getCode() == checklist.getImproveItemStatus()
						|| EnumImproveItemStatus.验证通过.getCode() == checklist.getImproveItemStatus())
						&& confirmMan.indexOf(userid) > -1) { // 状态为 已指派 通过
					checklists.add(checklist);
				}
			}
		}
		return checklists;
	}
	
	private List<CheckListDO> filterChecklist(Set<CheckListDO> allchecklist){
		List<CheckListDO> list = new ArrayList<CheckListDO>();
		for (CheckListDO checklist : allchecklist){
			if (EnumImproveItemStatus.暂时无法完成.getCode() == checklist.getImproveItemStatus()
					|| EnumImproveItemStatus.整改完成.getCode() == checklist.getImproveItemStatus()
					|| EnumImproveItemStatus.已指派.getCode() == checklist.getImproveItemStatus()
					|| EnumImproveItemStatus.验证通过.getCode() == checklist.getImproveItemStatus()) { // 状态为 整改完成，已指派，通过
				list.add(checklist);
			}
		}
		return list;
	}
	
	protected Map<String, Object> groupValidate(ImproveDO improve, Set<CheckListDO> allchecklist){
		UserDO user = UserContext.getUser();
		List<CheckListDO> wait = new ArrayList<CheckListDO>();
		List<CheckListDO> hasfinish = new ArrayList<CheckListDO>();
		List<CheckListDO> deferfinish = new ArrayList<CheckListDO>();
		List<CheckListDO> mislead = new ArrayList<CheckListDO>();
		if (allchecklist != null){
			for (CheckListDO checklist : filterChecklist(allchecklist)){
				if (EnumImproveItemStatus.暂时无法完成.getCode() != checklist.getImproveItemStatus() && checklist.getTraceItemStatus() == null){
					wait.add(checklist);
				} else if (EnumTraceItemStatus.完成验证.getCode().equals(checklist.getTraceItemStatus())){
					hasfinish.add(checklist);
					if (checklist.getImproveDate() != null && checklist.getConfirmDate() != null){
						if (DateUtils.addDays(checklist.getImproveDate(), 1).after(checklist.getImproveLastDate()) || DateUtils.addDays(checklist.getConfirmDate(), 1).after(checklist.getConfirmLastDate())){
							deferfinish.add(checklist);
						}
					}
				} else if (EnumImproveItemStatus.暂时无法完成.getCode() == checklist.getImproveItemStatus() || EnumTraceItemStatus.暂时无法完成.getCode().equals(checklist.getTraceItemStatus())){
					mislead.add(checklist);
				}
			}
		}
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("dealCanedit", getSort(checkListDao.convert(getCurrentCheckLists(improve, wait), Arrays.asList(new String[]{"id", "itemPoint", "improveRemark", "improveDate", "confirmLastDate", "confirmMan", "confirmResult", "auditSummary", "confirmDate", "traceItemStatus", "improveItemStatus", "confirmRemark", "verification", "auditRecord", "improveMeasure", "improveReason"}), false)));
		for (CheckListDO t : getCurrentCheckLists(improve, wait)){
			wait.remove(t);
		}
		map.put("deal", getSort(checkListDao.convert(wait, Arrays.asList(new String[]{"id", "itemPoint", "improveRemark", "improveDate", "confirmLastDate", "confirmMan", "confirmResult", "auditSummary", "confirmDate", "traceItemStatus", "improveItemStatus", "confirmRemark", "verification", "auditRecord", "improveMeasure", "improveReason"}), false)));
		map.put("hasfinish", getSort(checkListDao.convert(hasfinish, Arrays.asList(new String[]{"id", "itemPoint", "improveRemark", "improveDate", "confirmLastDate", "confirmMan", "confirmResult", "auditSummary", "confirmDate", "traceItemStatus", "improveItemStatus", "confirmRemark", "verification", "auditRecord", "improveMeasure", "improveReason"}), false)));
		map.put("deferfinishCanedit", getSort(checkListDao.convert(getCurrentCheckLists(improve, deferfinish), Arrays.asList(new String[]{"id", "itemPoint", "improveRemark", "improveDate", "confirmLastDate", "confirmMan", "confirmResult", "auditSummary", "confirmDate", "traceItemStatus", "improveItemStatus", "confirmRemark", "verification", "auditRecord", "improveMeasure", "improveReason"}), false)));
		for (CheckListDO t : getCurrentCheckLists(improve, deferfinish)){
			deferfinish.remove(t);
		}
		map.put("deferfinish", getSort(checkListDao.convert(deferfinish, Arrays.asList(new String[]{"id", "itemPoint", "improveRemark", "improveDate", "confirmLastDate", "confirmMan", "confirmResult", "auditSummary", "confirmDate", "traceItemStatus", "improveItemStatus", "confirmRemark", "verification", "auditRecord", "improveMeasure", "improveReason"}), false)));
		map.put("misleadCanedit", getSort(checkListDao.convert(getCurrentCheckLists(improve, mislead), Arrays.asList(new String[]{"id", "itemPoint", "improveRemark", "improveDate", "confirmLastDate", "confirmMan", "confirmResult", "auditSummary", "confirmDate", "traceItemStatus", "improveItemStatus", "confirmRemark", "verification", "auditRecord", "improveMeasure", "improveReason"}), false)));
		for (CheckListDO t : getCurrentCheckLists(improve, mislead)){
			mislead.remove(t);
		}
		map.put("mislead", getSort(checkListDao.convert(mislead, Arrays.asList(new String[]{"id", "itemPoint", "improveRemark", "improveDate", "confirmLastDate", "confirmMan", "confirmResult", "auditSummary", "confirmDate", "traceItemStatus", "improveItemStatus", "confirmRemark", "verification", "auditRecord", "improveMeasure", "improveReason"}), false)));
		map.put("displayfield", displayField(boolrole(improve, user)));
		return map;
	}
	
	private static List<Map<String,Object>> getSort(List<Map<String,Object>> list){
		Collections.sort(list, new Comparator<Map<String,Object>>(){
			@Override
			public int compare(Map<String, Object> o1,Map<String, Object> o2) {
				String value1 = (String) o1.get("itemPoint");
				String value2 = (String) o2.get("itemPoint");
				return value1.compareTo(value2);
			}
		});
		return list;
	}
	public boolean boolrole(ImproveDO improve, UserDO user) {
		String planType = improve.getTask().getPlanType();
		String checkType = improve.getTask().getCheckType();
		Collection<UserDO> users = null;
		if (EnumPlanType.SYS.toString().equals(planType) || EnumCheckGrade.SYS.toString().equals(checkType)) { // 系统级的时候判断是否是一级审计经理用户组的人员
			DictionaryDO dic = dictionaryDao.getByTypeAndKey("审计角色", EnumAuditRole.FIRST_GRADE_AUDIT_MANAGER_GROUP.getKey());
			String userGroupName = dic.getName();
			UserGroupDO userGroup = auditorDao.getUserGroupByName(userGroupName);
			if (userGroup == null) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT,"字典里没有一级审计经理参数！");
			users = userGroup.getUsers();
		} else { // 分子公司级判断是否是二级审计经理角色的人员
			DictionaryDO dic = dictionaryDao.getByTypeAndKey("审计角色", EnumAuditRole.SECOND_GRADE_AUDIT_MANAGER.getKey());
			if (null == dic) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_133000006, "审计角色", EnumAuditRole.SECOND_GRADE_AUDIT_MANAGER.getKey());
			}
			Integer unitId = Integer.parseInt(improve.getOperator());
			users = unitRoleActorDao.getUsersByUnitIdAndRoleName(unitId, dic.getName(), null);
		}
		if (null != users && users.contains(user)) {
			return true;
		} else {
			return false;
		}
	}
	
	
	private Map<String, Object> displayField(boolean bool){
		Map<String, Object> map = new HashMap<String, Object>();
		if (bool){
			map.put("itemPoint", "readonly");
			map.put("confirmRemark", "");
			map.put("confirmMan", "required");
			map.put("confirmLastDate", "required");
			map.put("improveMeasure", "readonly");
			map.put("improveReason", "readonly");
		} else {
			map.put("itemPoint", "readonly");
			map.put("improveRemark", "readonly");
			map.put("confirmRemark", "readonly");
			map.put("confirmResult", "required");
			map.put("confirmDate", "required");
			map.put("verification", "required");
			map.put("improveMeasure", "readonly");
			map.put("improveReason", "readonly");
		}
		return map;
	}
	
	/**
	 * 根据工作单id检索对应的整改单
	 * @param taskId
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<ImproveDO> getImprovesByTaskId(Integer taskId){
		if (null == taskId) {
			return new ArrayList<ImproveDO>();
		}
		return (List<ImproveDO>) this.query("from ImproveDO t where t.deleted = false and t.task.id = ?", taskId);
	}
	
	/**
	 * 根据计划id检索对应的整改单
	 * @param taskId
	 * @return
	 */
	public List<ImproveDO> getByPlanId(Integer planId){
		if (null == planId) {
			return null;
		}
		@SuppressWarnings("unchecked")
		List<ImproveDO> improves = (List<ImproveDO>) this.query("from ImproveDO t where t.deleted = false and t.task.deleted = false and t.task.plan.id = ?", planId);
		return improves;
	}
	
	@Override
	protected void afterSave(ImproveDO obj) {
		TaskDO task = obj.getTask();
		task = taskDao.internalGetById(task.getId());
		{
			if (task == null) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "找不到相关的工作单！");
			String improveName = task.getWorkName();
			if (task.getWorkName() != null){
				improveName = task.getWorkName().replaceAll("工作单", "整改反馈单");
			}
			obj.setImproveName(improveName);
			String improveNo = task.getWorkNo() + "-" + AuditConstant.RECTIFICATION_CODE;
			obj.setImproveNo(improveNo);
			String target = task.getTarget();
			obj.setTarget(target);
			Date startDate = task.getStartDate();
			obj.setStartDate(startDate);
			Date endDate = task.getEndDate();
			obj.setEndDate(endDate);
			String operator = task.getOperator();
			obj.setOperator(operator);
			String address = task.getAddress();
			obj.setAddress(address);
			Set<MasterDO> managers = task.getManagers();
			Set<TransactorDO> transactors = null;
			if (null != managers && !managers.isEmpty()) {
				transactors = new HashSet<TransactorDO>();
				for (MasterDO master : managers) {
					TransactorDO transactor = new TransactorDO();
					transactor.setUser(master.getUser());
					transactor.setImprove(obj);
					transactorDao.internalSave(transactor);
					transactors.add(transactor);
				}
			}
			obj.setTransactor(transactors);
			String tTel = task.getContact();
			obj.setTransactorTel(tTel);
			
			// 更新整改单
			List<CheckListDO> hasProblems = checkListDao.getHasProblemsByTaskId(task.getId());
			// 审计组员(去重)
			Set<String> members = new HashSet<String>();
			for (CheckListDO checkList : hasProblems) {
				// 审计组员
				if (null != checkList.getCheck() && !StringUtils.isBlank(checkList.getCheck().getCommitUser())) {
					members.addAll(Arrays.asList(StringUtils.split(checkList.getCheck().getCommitUser(), ",")));
				}
				checkList.setImprove(obj);
				checkList.setLastUpdater(UserContext.getUser());
				// 整改项状态
				checkList.setImproveItemStatus(EnumImproveItemStatus.整改反馈.getCode());
//					// 整改当前处理人
//					ImproveItemUserDO improveItemUser = new ImproveItemUserDO();
//					improveItemUser.setCheckList(checkList);
//					improveItemUser.setUser(UserContext.getUser());
//					improveItemUserDao.internalSave(improveItemUser);
				checkListDao.internalUpdate(checkList);
			}
			// 审计组员
			obj.setMember(StringUtils.join(members.toArray(), ","));
			obj.setCheckLists(new HashSet<CheckListDO>(hasProblems));
		}
		this.internalUpdate(obj);
		{
			String workflowTemplateId = auditWorkflowSchemeDao.getWorkflowTempIdBySearch(task.getPlanType(), task.getCheckType(), "IMPROVE");
			Map<String, Object> objmap = new HashMap<String, Object>();
			objmap.put("id", obj.getId());
			objmap.put("dataobject", "improve");
			String workflowId = (String) transactionHelper.doInTransaction(new WfSetup(), "Submit", UserContext.getUserId().toString(), workflowTemplateId, "", "", gson.toJson(objmap));
			obj.setFlowId(workflowId);
		}
		this.update(obj);

		// 添加整改单活动日志
		addActivityLoggingForAddImprove(obj);
	}

	/**
	 * 添加整改单的活动日志
	 * @param task
	 */
	private void addActivityLoggingForAddImprove(ImproveDO improve){
		auditActivityLoggingDao.addLogging(improve.getId(), "improve", AuditActivityLoggingOperationRegister.getOperation("ADD_IMPROVE"));
	}
	
	/**
	 * 通过工作单生成对应的整改单
	 * @param task
	 * @return
	 */
	public ImproveDO generateImprove(TaskDO task, String improveUnit) {
		ImproveDO improve = new ImproveDO();
		improve.setImproveUnit(improveUnit);
		improve.setSource(null);
		improve.setTask(task);
		String improveName = task.getWorkName();
		if (task.getWorkName() != null){
			improveName = task.getWorkName().replaceAll("工作单", "整改反馈单");
		}
		improve.setImproveName(improveName);
		String improveNo = task.getWorkNo() + "-" + AuditConstant.RECTIFICATION_CODE;
		improve.setImproveNo(improveNo);
		improve.setTarget(task.getTarget());
		improve.setStartDate(task.getStartDate());
		improve.setEndDate(task.getEndDate());
		improve.setOperator(task.getOperator());
		improve.setAddress(task.getAddress());
		this.internalSave(improve);
		Set<MasterDO> managers = task.getManagers();
		Set<TransactorDO> transactors = null;
		if (null != managers && !managers.isEmpty()) {
			transactors = new HashSet<TransactorDO>();
			for (MasterDO master : managers) {
				TransactorDO transactor = new TransactorDO();
				transactor.setUser(master.getUser());
				transactor.setImprove(improve);
				transactorDao.internalSave(transactor);
				transactors.add(transactor);
			}
		}
		improve.setTransactor(transactors);
		improve.setTransactorTel(task.getContact());
		this.internalUpdate(improve);
		return improve;
	}
	
	/**
	 *  下发整改单(整改改单与检查项关联)
	 * @param task
	 * @return 整改单的list
	 */
	@SuppressWarnings("unchecked")
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public List<ImproveDO> sendImprove(TaskDO task) {
		// 下发之前将工作单已有对应的整改单删除
		List<ImproveDO> oldImproves = this.getImprovesByTaskId(task.getId());
		if (!oldImproves.isEmpty()) {
			this.delete(oldImproves);
		}
		
		List<ImproveDO> improves = new ArrayList<ImproveDO>();
		if (null != task) {
			// 有问题的检查项(待下发)
			List<CheckListDO> hasProblems = checkListDao.getHasProblemsByTaskId(task.getId());
			if (!hasProblems.isEmpty()) {
//				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "该工作单没有任何有问题的项目，无法生成整改单！");
				if (EnumPlanType.SPOT.toString().equals(task.getPlanType())) { // 现场检查时按责任单位进行分组后下发
					// 分组
					Set<CheckListDO> checkLists = null;
					Map<String, Object> map = new HashMap<String, Object>();
					for (CheckListDO checkList : hasProblems) {
						String improveUnit = checkList.getImproveUnit();
						if (map.containsKey(improveUnit)) {
							checkLists = (Set<CheckListDO>) map.get(improveUnit);
							checkLists.add(checkList);
						} else {
							checkLists = new HashSet<CheckListDO>();
							checkLists.add(checkList);
							map.put(improveUnit, checkLists);
						}
					}
					// 分组后每组生成一个整改单并与之关联
					for (Entry<String, Object> entry : map.entrySet()) {
						ImproveDO improve = generateImprove(task, entry.getKey());
						improves.add(improve);
						for (CheckListDO checkList : (Set<CheckListDO>) entry.getValue()) {
							// 整改项状态
							checkList.setImproveItemStatus(EnumImproveItemStatus.整改反馈.getCode());
							checkList.setImprove(improve);
							checkListDao.update(checkList);
						}
					}
				} else {
					String improveUnit = hasProblems.isEmpty() ? null : hasProblems.get(0).getImproveUnit();
					ImproveDO improve = generateImprove(task, improveUnit);
					improves.add(improve);
					// 更新整改单
					// 审计组员(去重)
					Set<String> members = new HashSet<String>();
					for (CheckListDO checkList : hasProblems) {
						// 审计组员
						if (null != checkList.getCheck() && !StringUtils.isBlank(checkList.getCheck().getCommitUser())) {
							members.addAll(Arrays.asList(StringUtils.split(checkList.getCheck().getCommitUser(), ",")));
						}
						checkList.setImprove(improve);
						checkList.setLastUpdater(UserContext.getUser());
						// 整改项状态
						checkList.setImproveItemStatus(EnumImproveItemStatus.整改反馈.getCode());
						checkListDao.internalUpdate(checkList);
					}
					// 审计组员
					improve.setMember(StringUtils.join(members.toArray(), ","));
					this.update(improve);
				}
			} else {
				task.setCloseDate(new Date());
			}
		}
		return improves;
	}
	
	// 审计报告下发后给下级单位的主管和经理发邮件
	public void sendMessageToJingLiAndZhuGuan(ImproveDO improve, TaskDO task) {
		EmailDO email = new EmailDO();
		List<UserDO> receivers = new ArrayList<UserDO>();
		if (EnumPlanType.SYS.toString().equals(task.getPlanType())) {
			UnitDO unit = unitDao.internalGetById(Integer.parseInt(task.getTarget()));
			email.setSubject(unit.getName());//  被审计单位
			email.setContent("近期公司将对你单位实施"+EnumPlanType.SYS.getDescription()+"审计，具体情况请登录系统查看,请认真准备。");// 近期公司将对你单位实施 【类型】审计，具体情况请登录系统查看,请认真准备。
			String erjishenjizhuguan = dictionaryDao.getByTypeAndKey("审计角色", "A2.2") == null ? null : dictionaryDao.getByTypeAndKey("审计角色", "A2.2").getName();
			String erjishenjijingli = dictionaryDao.getByTypeAndKey("审计角色", "A2.1") == null ? null : dictionaryDao.getByTypeAndKey("审计角色", "A2.1").getName();
			receivers.addAll(unitRoleActorDao.getUsersByUnitIdAndRoleName(unit.getId(), erjishenjizhuguan, null));
			receivers.addAll(unitRoleActorDao.getUsersByUnitIdAndRoleName(unit.getId(), erjishenjijingli, null));
		} else if (EnumPlanType.SUB2.toString().equals(task.getPlanType())) {
			OrganizationDO organization = organizationDao.internalGetById(NumberHelper.toInteger(task.getTarget()));
			email.setSubject(organization.getName());//  被审计单位
			email.setContent("近期公司将对你单位实施"+EnumPlanType.SUB2.getDescription()+"审计，具体情况请登录系统查看,请认真准备。");// 近期公司将对你单位实施 【类型】审计，具体情况请登录系统查看,请认真准备。
			String sanjishenjizhuguan = dictionaryDao.getByTypeAndKey("审计角色", "A3.2") == null ? null : dictionaryDao.getByTypeAndKey("审计角色", "A3.2").getName();
			String sanjishenjijingli = dictionaryDao.getByTypeAndKey("审计角色", "A3.1") == null ? null : dictionaryDao.getByTypeAndKey("审计角色", "A3.1").getName();
			List<Integer> roleIds = new ArrayList<Integer>();
			RoleDO r1 = auditorDao.getRole(sanjishenjijingli);
			if (r1!= null) {
				roleIds.add(r1.getId());
		    }
			RoleDO r2 = auditorDao.getRole(sanjishenjizhuguan);
		    if (r2 != null) {
		    	roleIds.add(r2.getId());
		    }
		    List<Integer> organizationIds = new ArrayList<Integer>();
		    organizationIds.add(organization.getId());
		    List<Integer> userIds = new ArrayList<Integer>(unitRoleActorDao.getUserIdsByOrganizationIdsAndRoleIds(roleIds, organizationIds));
		    List<UserDO> us = userDao.getByIds(userIds);
		    receivers.addAll(us);
		} else if (EnumPlanType.SUB3.toString().equals(task.getPlanType())) {
			OrganizationDO organization = organizationDao.internalGetById(NumberHelper.toInteger(task.getTarget()));
			email.setSubject(organization.getName());//  被审计单位
			email.setContent("近期公司将对你单位实施"+EnumPlanType.SUB3.getDescription()+"审计，具体情况请登录系统查看,请认真准备。");// 近期公司将对你单位实施 【类型】审计，具体情况请登录系统查看,请认真准备。
			String sijishenjizhuguan = dictionaryDao.getByTypeAndKey("审计角色", "A4.2") == null ? null : dictionaryDao.getByTypeAndKey("审计角色", "A4.2").getName();
			String sijishenjijingli = dictionaryDao.getByTypeAndKey("审计角色", "A4.1") == null ? null : dictionaryDao.getByTypeAndKey("审计角色", "A4.1").getName();
			List<Integer> roleIds = new ArrayList<Integer>();
			RoleDO r1 = auditorDao.getRole(sijishenjijingli);
			if (r1!= null) {
				roleIds.add(r1.getId());
		    }
			RoleDO r2 = auditorDao.getRole(sijishenjizhuguan);
		    if (r2 != null) {
		    	roleIds.add(r2.getId());
		    }
		    List<Integer> organizationIds = new ArrayList<Integer>();
		    organizationIds.add(organization.getId());
		    List<Integer> userIds = new ArrayList<Integer>(unitRoleActorDao.getUserIdsByOrganizationIdsAndRoleIds(roleIds, organizationIds));
		    List<UserDO> us = userDao.getByIds(userIds);
		    receivers.addAll(us);
		}
		try {
			messageDao.sendEmail(email, receivers);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		// 整改联系人非空校验
		if (map.containsKey("improver") && StringUtils.isBlank((String) map.get("improver"))) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "整改联系人不能为空！");
		}
		// 整改联系人的联系方式非空校验
		if (map.containsKey("improverTel") && StringUtils.isBlank((String) map.get("improverTel"))) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "整改联系人的联系方式不能为空！");
		}
	}

	@Override
	protected void afterUpdate(ImproveDO obj, ImproveDO dbObj) {
		// 添加整改单活动日志
		addActivityLoggingForUpdateImprove(obj, dbObj);
	}

	/**
	 * 更新整改单的活动日志
	 * @param task
	 */
	private void addActivityLoggingForUpdateImprove(ImproveDO newImprove, ImproveDO oldImprove){
		List<String> details = new ArrayList<String>();
		// 整改人
		String oldImprover = oldImprove.getImprover();
		String newImprover = newImprove.getImprover();
		if (null == oldImprover && null != newImprover) {
			details.add("添加整改联系人:" + newImprover);
		} else if (!(null == oldImprover || null == newImprover || oldImprover.equals(newImprover))) {
			details.add("修改整改联系人为:" + newImprover);
		}
		// 联系方式
		String oldImproverTel = oldImprove.getImproverTel();
		String newImproverTel = newImprove.getImproverTel();
		if (null == oldImproverTel && null != newImproverTel) {
			details.add("添加整改联系人的联系方式:" + newImproverTel);
		} else if (!(null == oldImproverTel || null == newImproverTel || oldImproverTel.equals(newImproverTel))) {
			details.add("修改整改联系人的联系方式为:" + newImproverTel);
		}
		// 备注
		String oldRemark = oldImprove.getRemark();
		String newRemark = newImprove.getRemark();
		if (null == oldRemark && null != newRemark) {
			details.add("添加备注:" + newRemark);
		} else if (!(null == oldRemark || null == newRemark || oldRemark.equals(newRemark))) {
			details.add("修改备注为:" + newRemark);
		}
		if (!details.isEmpty()) {
			MDC.put("details", details.toArray());
			auditActivityLoggingDao.addLogging(newImprove.getId(), "improve", AuditActivityLoggingOperationRegister.getOperation("UPDATE_IMPROVE"));
			MDC.remove("details");
		}
		
	}
	
	/**
	 * 通过计划类型和target的ID获取target对象
	 * @param planType
	 * @param target
	 * @return
	 */
	public Map<String, Object> getTarget(String planType, String target) {

		Map<String, Object> targetMap = new HashMap<String, Object>();
		if (null != planType && null != target) {
			// 系统级时关联安监机构
			if (EnumPlanType.SYS.toString().equals(planType)) {
				UnitDO unit = unitDao.internalGetById(Integer.parseInt(target));
				targetMap.put("id", unit.getId());
				targetMap.put("name", unit.getName());
			} else if (EnumPlanType.SUB2.toString().equals(planType) || EnumPlanType.SUB3.toString().equals(planType)) {// 其他级别
				OrganizationDO organization = organizationDao.internalGetById(Integer.parseInt(target));
				targetMap.put("id", organization.getId());
				targetMap.put("name", organization.getName());
			} 
		}
		return targetMap;
	}
	
	/**
	 * 根据工作单的ID查询对应的整改单
	 * @param taskId
	 * @return
	 */
	public ImproveDO getImproveByTaskId(Integer taskId){
		if (null == taskId) {
			return null;
		}
		@SuppressWarnings("unchecked")
		List<ImproveDO> improves = (List<ImproveDO>) this.query("select t from ImproveDO t where t.deleted = false and t.task.id = ?", taskId);
		if (improves.isEmpty()) {
			return null;
		}
		return improves.get(0);
	}
	
	/**
	 * 获取整改单的完成日期和延迟日期
	 * @param improve
	 * @return
	 */
	public Map<String, Object> getCompleteDateAndDelayDate(ImproveDO improve){
		Map<String, Object> result = new HashMap<String, Object>();
		
		// 所有的checkList都提交完成情况后取最后的日期
		Date completeDate = null;
		// 所有整改延期的checkList的最后的整改期限
		Date improveDelayDate = null;
		// 所有验证延期的checkList的最后的验证期限
//		Date confirmDelayDate = null;
		// 是否全部处于验证完成状态
		boolean isCompleted = true;
		Set<CheckListDO> checkLists = improve.getCheckLists();
		for (CheckListDO checkList : checkLists) {
			if (!checkList.isDeleted()) {
				// 整改完成日期
				Date improveDate = checkList.getImproveDate();
				// 整改期限
				Date improveLastDate = checkList.getImproveLastDate();
				// 验证日期
//				Date confirmDate = checkList.getConfirmDate();
				// 验证期限
//				Date confirmLastDate = checkList.getConfirmLastDate();
				
				// 完成日期
				if (EnumPlanType.SYS.toString().equals(improve.getTask().getPlanType()) || EnumPlanType.SUB2.toString().equals(improve.getTask().getPlanType()) || EnumPlanType.SUB3.toString().equals(improve.getTask().getPlanType())) {
					if (null == checkList.getImproveItemStatus() || (EnumImproveItemStatus.整改完成.getCode() != checkList.getImproveItemStatus() && EnumImproveItemStatus.暂时无法完成.getCode() != checkList.getImproveItemStatus())) {
						isCompleted = false;
						completeDate = null;
					}
				} else {
					if (null == checkList.getImproveItemStatus() || (EnumImproveItemStatus.验证通过.getCode() != checkList.getImproveItemStatus() && EnumImproveItemStatus.暂时无法完成.getCode() != checkList.getImproveItemStatus())) {
						isCompleted = false;
						completeDate = null;
					}
				}
				if (isCompleted) {
					if (null == completeDate || (null != improveDate && improveDate.after(completeDate))) {
						completeDate = improveDate;
					}
				}
				// 整改的延期时间
				if (null != improveLastDate && (null != improveDate && improveDate.after(improveLastDate))) { // 整改发生延期时
					improveDelayDate = improveLastDate;
				}
				
				// 验证的延期时间
//				if (null != confirmLastDate && (null != confirmDate && confirmDate.after(confirmLastDate))) { // 验证发生延期时
//					confirmDelayDate = confirmLastDate;
//				}
			}
			
		}
		result.put("completeDate", DateHelper.formatIsoDate(completeDate));
		result.put("improveDelayDate", completeDate != null ? "" : DateHelper.formatIsoDate(improveDelayDate));
//		result.put("confirmDelayDate", completeDate != null ? "" : DateHelper.formatIsoDate(confirmDelayDate));
		return result;
	}
	
	public ImproveDO getByCheckListId(Integer checkListId) {
		@SuppressWarnings("unchecked")
		List<ImproveDO> improves = (List<ImproveDO>) this.query("select t from ImproveDO t join t.checkLists cl where cl.id = ?", checkListId);
		return improves.isEmpty() ? null : improves.get(0);
	}
	
	public String getWorkflowTemplateId(ImproveDO improve) {
//		TaskDO task = taskDao.internalGetById(improve.getTask().getId());
		TaskDO task = improve.getTask();
		String workflowTemplateId = auditWorkflowSchemeDao.getWorkflowTempIdBySearch(task.getPlanType(), task.getCheckType(), "IMPROVE");
		return workflowTemplateId;
	}
	
	public ImproveDO getBasicInfoById(Integer id) {
		@SuppressWarnings("unchecked")
		List<Object[]> infos = (List<Object[]>) this.query("select t.improveName, t.flowId from ImproveDO t where t.deleted = false and t.id = ?", id);
		if (infos.isEmpty()) {
			return null;
		}
		ImproveDO improve = new ImproveDO();;
		improve.setId(id);
		improve.setImproveName((String) infos.get(0)[0]);
		improve.setFlowId((String) infos.get(0)[1]);
		return improve;
	}
	
	public Map<String, Object> getBasicInfoMapById(Integer id) {
		@SuppressWarnings("unchecked")
		List<Object[]> infos = (List<Object[]>) this.query("select t.task.planType, t.task.checkType, t.improveName, t.flowId, t.traceName from ImproveDO t where t.deleted = false and t.id = ?", id);
		if (infos.isEmpty()) {
			return null;
		}
		Map<String, Object> map = new HashMap<String, Object>();;
		map.put("id", id);
		map.put("planType", infos.get(0)[0]);
		map.put("checkType", infos.get(0)[1]);
		map.put("improveName", infos.get(0)[2]);
		map.put("flowId", infos.get(0)[3]);
		map.put("traceName", infos.get(0)[4]);
		return map;
	}

	@Override
	public Integer getRelatedUnitId(Integer id) {
		Integer unitId = null;
		ImproveDO improve = this.internalGetById(id);
		if (null != improve && null != improve.getTarget()) {
			TaskDO task = taskDao.internalGetById(improve.getTask().getId());
			if (EnumPlanType.SPOT.toString().equals(task.getPlanType()) || EnumPlanType.SPEC.toString().equals(task.getPlanType())) { // 现场检查和专项检查责任单位时取责任单位
				if (null != improve.getImproveUnit()) {
					if (improve.getImproveUnit().startsWith(AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP)) { // 责任单位以"DP"开头表示组织
						// 取出组织对应的安监机构的ID
						OrganizationDO organization = organizationDao.internalGetById(Integer.parseInt(improve.getImproveUnit().replace(AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP, "")));
						if (null != organization && null != organization.getUnit()) {
							unitId = organization.getUnit().getId();
						}
					} else if (improve.getImproveUnit().startsWith(AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT)){ // 责任单位以"UT"开头表示安监机构
						unitId = Integer.parseInt(improve.getImproveUnit().replace(AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT, ""));
					}
				}
			} else if (EnumPlanType.SUB2.toString().equals(task.getPlanType()) || EnumPlanType.SUB3.toString().equals(task.getPlanType())) { // 二三级,运控的时候target表示组织
				// 取出组织对应的安监机构的ID
				OrganizationDO organization = organizationDao.internalGetById(Integer.parseInt(improve.getTarget()));
				if (null != organization && null != organization.getUnit()) {
					unitId = organization.getUnit().getId();
				}
			} else { // 其他情况target的值表示安监机构
				unitId = Integer.parseInt(improve.getTarget());
			}
		}
		return unitId;
	}

	@Override
	protected void afterGetList(List<Map<String, Object>> list, Map<String, Object> paramMap, Map<String, Object> searchMap, List<String> orders) {
		super.afterGetList(list, paramMap, searchMap, orders);
	}
	
	@Override
	public void writeUser(Integer id, String[] userIds) {
		List<UserDO> existUsers = improveFlowUserDao.getUsersByImprove(id);// 已存在的user
		List<UserDO> users = userDao.internalGetByIds(userIds);// 要加入的user
		Set<UserDO> mergedUses = new HashSet<UserDO>();// 合并去重
		mergedUses.addAll(existUsers);
		mergedUses.addAll(users);
		ImproveDO improve = this.internalGetById(id);
		Set<ImproveFlowUserDO> flowUsers = improve.getFlowUsers();
		if (null != flowUsers) {// 先删除数据库中已有的数据
			improveFlowUserDao.delete(flowUsers);
		}
		for (UserDO user : mergedUses) {// 再向数据库中添加新的数据
			ImproveFlowUserDO flowUser = new ImproveFlowUserDO();
			flowUser.setImprove(improve);
			flowUser.setFlowUser(user);
			improveFlowUserDao.internalSave(flowUser);
		}

	}

	@Override
	public void setStatus(Integer id, Integer statusId, Map<String, Object> attributes) {
		ImproveDO improve = this.internalGetById(id);// 更新计划的状态和工作流节点
		Set<ImproveFlowUserDO> flowUsers = improve.getFlowUsers();
		if (flowUsers != null){
			improveFlowUserDao.delete(flowUsers);
		}
		ActivityStatusDO status = activityStatusDao.internalGetById(statusId);
		if (null != status) {
			improve.setFlowStatus(status.getName());
		}
		if (null != attributes) {
			improve.setFlowStep((String) attributes.get("flowStep"));
		}
		this.internalUpdate(improve);
	}

	@Override
	public Collection<Integer> getUserByUnitRole(Integer id, Integer roleId) {
		Integer unitId = this.getRelatedUnitId(id);// 取出对应安监机构的ID
		if (null == unitId) {
			return new HashSet<Integer>();
		}
		List<Integer> unitIds = new ArrayList<Integer>();
		unitIds.add(unitId);
		return unitRoleActorDao.getUserIdsByUnitIdsAndRoleId(roleId, unitIds);
	}
	
	@Override
	public Collection<Integer> getUserByUnitRoles(Integer id, Collection<Integer> roleIds) {
		Integer unitId = this.getRelatedUnitId(id);// 取出对应安监机构的ID
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

	@Override
	public Integer getRelatedOrganizationId(Integer id, String field) {
		Integer organizationId = null;
		ImproveDO improve = this.internalGetById(id);
		if (null != improve) {
			if (null != field) {
				if ("operator".equals(field)) {
					organizationId = Integer.parseInt(improve.getOperator());
				} else if ("target".equals(field)) {
					organizationId = Integer.parseInt(improve.getTarget());
				}
			} else if (null != improve.getTask()){
				TaskDO task = taskDao.internalGetById(improve.getTask().getId());
				if (EnumPlanType.SUB2.toString().equals(task.getPlanType()) || EnumPlanType.SUB3.toString().equals(task.getPlanType())) { // 二三级取整改单target的值，表示组织
					organizationId = Integer.parseInt(improve.getTarget());
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
		ImproveDO improve = this.internalGetById(id);
		if (null != improve && userIds != null && !userIds.isEmpty() && sendingModes != null && !sendingModes.isEmpty()) {
			// 标题
			String title = "审计待办提醒";
			// 正文内容
			String content = "您有一个整改单需要处理。名称[" + improve.getDisplayName() + "], 详情请看安全审计中待我处理的审计任务。";

			// 获取ADMIN的id
			UserDO admin = userDao.getByUsername("ADMIN");
			// 接收人
			List<UserDO> users = userDao.getByIds(new ArrayList<Integer>(userIds));
			Collection<EnumMessageCatagory> sendingModeEnums = EnumMessageCatagory.getEnumByVals(sendingModes);
			// 保存
			messageDao.saveTodoMsg(sendingModeEnums, admin, users, title, content, id, "IMPROVE");
		}
	}
	
	@Override
	public void sendFeedbackMsg(Integer id, Collection<String> sendingModes) {
		// TODO Auto-generated method stub
		
	}

	public void setDictionaryDao(DictionaryDao dictionaryDao) {
		this.dictionaryDao = dictionaryDao;
	}

	public void setImproveFlowUserDao(ImproveFlowUserDao improveFlowUserDao) {
		this.improveFlowUserDao = improveFlowUserDao;
	}

	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}

	public void setActivityStatusDao(ActivityStatusDao activityStatusDao) {
		this.activityStatusDao = activityStatusDao;
	}

	public void setUnitRoleActorDao(UnitRoleActorDao unitRoleActorDao) {
		this.unitRoleActorDao = unitRoleActorDao;
	}

	public void setTransactionHelper(TransactionHelper transactionHelper) {
		this.transactionHelper = transactionHelper;
	}

	public void setTaskDao(TaskDao taskDao) {
		this.taskDao = taskDao;
	}

	public void setCheckListDao(CheckListDao checkListDao) {
		this.checkListDao = checkListDao;
	}

	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}

	public void setPlanDao(PlanDao planDao) {
		this.planDao = planDao;
	}

	public void setAuditActivityLoggingDao(AuditActivityLoggingDao auditActivityLoggingDao) {
		this.auditActivityLoggingDao = auditActivityLoggingDao;
	}

	public void setTransactorDao(TransactorDao transactorDao) {
		this.transactorDao = transactorDao;
	}

	public void setOrganizationDao(OrganizationDao organizationDao) {
		this.organizationDao = organizationDao;
	}

	public void setAuditorDao(AuditorDao auditorDao) {
		this.auditorDao = auditorDao;
	}

	public void setAuditWorkflowSchemeDao(AuditWorkflowSchemeDao auditWorkflowSchemeDao) {
		this.auditWorkflowSchemeDao = auditWorkflowSchemeDao;
	}

	public void setProfessionUserDao(ProfessionUserDao professionUserDao) {
		this.professionUserDao = professionUserDao;
	}

	public void setMessageDao(MessageDao messageDao) {
		this.messageDao = messageDao;
	}

	public void setAuditReportDao(AuditReportDao auditReportDao) {
		this.auditReportDao = auditReportDao;
	}
	
}
