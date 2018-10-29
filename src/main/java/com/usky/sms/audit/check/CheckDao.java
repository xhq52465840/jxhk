package com.usky.sms.audit.check;

import java.lang.reflect.Field;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.activity.attribute.ActivityStatusDO;
import com.usky.sms.activity.attribute.ActivityStatusDao;
import com.usky.sms.audit.AuditConstant;
import com.usky.sms.audit.IAudit;
import com.usky.sms.audit.auditor.AuditorDao;
import com.usky.sms.audit.log.AuditActivityLoggingDao;
import com.usky.sms.audit.log.operation.AuditActivityLoggingOperationRegister;
import com.usky.sms.audit.plan.EnumCheckGrade;
import com.usky.sms.audit.plan.EnumPlanType;
import com.usky.sms.audit.task.MasterDO;
import com.usky.sms.audit.task.TaskDO;
import com.usky.sms.audit.task.TaskDao;
import com.usky.sms.audit.workflow.AuditWorkflowSchemeDao;
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
import com.usky.sms.rewards.EnumRewordsType;
import com.usky.sms.rewards.RewardsDO;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.unit.UnitRoleActorDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;
import com.usky.sms.uwf.WfSetup;
import com.usky.sms.uwffunc.IUwfFuncPlugin;
import com.usky.sms.workflow.WorkflowService;

public class CheckDao extends BaseDao<CheckDO> implements IUwfFuncPlugin, IAudit{

	@Autowired
	private UnitDao unitDao;

	@Autowired
	private DictionaryDao dictionaryDao;

	@Autowired
	private TransactionHelper transactionHelper;
	
	@Autowired
	private WorkflowService workflowService;
	
	@Autowired
	private TaskDao taskDao;
	
	@Autowired
	private UserDao userDao;
	
	@Autowired
	private CheckFlowUserDao checkFlowUserDao;
	
	@Autowired
	private UnitRoleActorDao unitRoleActorDao;
	
	@Autowired
	private CheckListDao checkListDao;
	
	@Autowired
	private ActivityStatusDao activityStatusDao;
	
	@Autowired
	private AuditActivityLoggingDao auditActivityLoggingDao;
	
	@Autowired
	private OrganizationDao organizationDao;
	
	@Autowired
	private AuditWorkflowSchemeDao auditWorkflowSchemeDao;
	
	@Autowired
	private FileDao fileDao;
	
	@Autowired
	private MessageDao messageDao;
	
	@Autowired
	private AuditorDao auditorDao;
	
	protected CheckDao() {
		super(CheckDO.class);
	}
	
	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple, boolean showExtendFields) {
		CheckDO check = (CheckDO) obj;
		TaskDO task = check.getTask();
		Map<String, Object> target = taskDao.getTargetObj(null, null, check, null); // 获取target的id和name
		Map<String, Object> targetMap = new HashMap<String, Object>();
		targetMap.put("targetId", target.get("id"));
		targetMap.put("targetName", target.get("name"));
		map.put("target", targetMap);
		map.put("planType", check.getTask().getPlanType());
		if (!multiple) {
			map.putAll(this.addTaskparamToCheckParam(task)); //获取task的部门属性
			
			map.put("taskPreAuditReport", fileDao.convert(fileDao.getFilesBySource(EnumFileType.TASK_PRE_AUDIT_REPORT.getCode(), task.getId())));
		}
		if (showExtendFields){
			String member = check.getMember();
			if (EnumPlanType.SPOT.toString().equals(check.getTask().getPlanType()) || EnumPlanType.SPEC.toString().equals(check.getTask().getPlanType())) {
				map.put("member", member);
			} else {
				List<Map<String,Object>> memberList = new ArrayList<Map<String,Object>>();
				if(member != null){
					String[] members = member.split(",");
					List<UserDO> members_user = userDao.internalGetByIds(members);
					for (UserDO user : members_user) {
						Map<String,Object> userMap = new HashMap<String, Object>();
						userMap.put("id", user.getId());
						userMap.put("name", user.getFullname());
						userMap.put("username", user.getUsername());
						memberList.add(userMap);
					}
				}
				map.put("member", memberList);
			}
			List<CheckListDO> checkLists = checkListDao.getByCheck(check.getId());
			// 符合项放到后面
			Collections.sort(checkLists, new Comparator<CheckListDO>() {
				@Override
				public int compare(CheckListDO o1, CheckListDO o2) {
					int result = 0;
					if (o1 != null && o2 != null && o1.getAuditResult() == null && o2.getAuditResult() == null) {
						String auditResult1 = o1.getAuditResult().getName();
						String auditResult2 = o2.getAuditResult().getName();
						if (o1.getItem() != null && o2.getItem() != null) {
							Integer orderNo1 = o1.getItem().getOrderNo();
							Integer orderNo2 = o2.getItem().getOrderNo();
							// 都是符合项或都不是符合项表示相等，符合项大于不是符合项
							if ((auditResult1.equals(auditResult2))
									|| (!EnumAuditResult.符合项.toString().equals(auditResult1) && !EnumAuditResult.符合项.toString().equals(auditResult2))){
								if (orderNo1 != null && orderNo2 != null) {
									result = orderNo1.compareTo(orderNo2);
								}
							} else {
								if (EnumAuditResult.符合项.toString().equals(auditResult1)) {
									result = 1;
								} else {
									result = -1;
								}
							}
						}
					}
					return result;
				}
			});
			map.put("checkLists", checkListDao.convert(checkLists,false));
			map.put("conclusion", checkListDao.calculateCheckList(check.getId(), task.getPlanType()));
			String flowId = check.getFlowId();
			map.putAll(taskDao.addWorkFlowAttributes(flowId));// 获取此检查单工作流数据
		}
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
	}

	private Map<String, Object> addTaskparamToCheckParam(TaskDO task) {
		Map<String, Object> map = new HashMap<String, Object>();
		if (task != null) {
			map.put("planType", task.getPlanType());
			map.put("checkGrade", task.getCheckType());
			map.put("operator", task.getOperator());
			map.put("method", task.getMethod());
			map.put("teamLeader", task.getTeamLeader());
			map.put("standard", task.getStandard());
			Set<MasterDO> managers = task.getManagers();
			List<Map<String, Object>> userList = new ArrayList<Map<String, Object>>();
			if (null != managers) {
				for (MasterDO master : managers) {
					Map<String, Object> userMap = new HashMap<String, Object>();
					userMap.put("id", master.getUser().getId());
					userMap.put("name", master.getUser().getFullname());
					userMap.put("username", master.getUser().getUsername());
					userList.add(userMap);
				}
			}
			map.put("managers", userList);
		}
		return map;
	}
	
	
	
//	public Map<String,Object> getCheckWorkFlow(Integer checkId){
//		CheckDO check = this.internalGetById(checkId);
//		Map<String,Object> map = new HashMap<String, Object>();
//		if (check != null){
//			String flowId = check.getFlowId();
//			if(flowId == null) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "当前检查单缺失工作流实例！");
//			Map<String, Object> NodeAttributes = workflowService.getWorkflowNodeAttributes(flowId);
//			map.put("workflowNodeAttributes", NodeAttributes);
//			map.put("actions", workflowService.getActionsWithAttributes(flowId));
//		} else {
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "没有此检查单！");
//		}
//		return map;
//	}
	
	@SuppressWarnings("unchecked")
	public List<CheckDO> getChecks(Integer taskId){
		String sql = "from CheckDO t where t.deleted = false and t.task.id = ? order by t.checkType.key";
		List<CheckDO> list = this.getHibernateTemplate().find(sql,taskId);
		return list;
	}
	
	@SuppressWarnings("unchecked")
	public List<CheckDO> getChecks(Integer taskId, Integer professionId) {
		String sql = "from CheckDO t where t.task.id = ? and checkType.id = ?";
		List<CheckDO> list = this.getHibernateTemplate().find(sql, taskId, professionId);
		return list;
	}
	
	
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}
	
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(Collection<CheckDO> list) {
		List<String> ids = new ArrayList<String>();
		for (CheckDO check : list) {
			if (null != check) {
				ids.add(check.getId().toString());
			}
		}
		if (!ids.isEmpty()) {
			this.delete(ids.toArray(new String[0]));
		}
	}

	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		map.put("creator", UserContext.getUserId());
		map.put("lastUpdater", UserContext.getUserId());
		return super.beforeSave(map);
	}

	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		CheckDO check = this.internalGetById(id);
		if (!"完成".equals(check.getFlowStatus())) {
			map.put("commitUser", UserContext.getUserId().toString());
		}
		map.put("lastUpdater", UserContext.getUserId());
	}

	@SuppressWarnings("unchecked")
	public List<Map<String,Object>> updateCheck(Map<String,Object> taskMap, TaskDO task, String isInstance) throws ParseException {
		List<Map<String,Object>> checkList = new ArrayList<Map<String,Object>>();
		if (taskMap.get("auditScope") != null) {
			checkList.addAll((List<Map<String, Object>>) taskMap.get("auditScope"));
		}
		List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
		
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		Date startDate = null;
		Date endDate = null;
		if (taskMap.get("startDate") != null && !"".equals(taskMap.get("startDate"))) {
			startDate = sdf.parse((String) taskMap.get("startDate"));
		}
		if (taskMap.get("endDate") != null && !"".equals(taskMap.get("endDate"))) {
			endDate = sdf.parse((String) taskMap.get("endDate"));
		}
		String address = (String) taskMap.get("address");
		String taskRemark = (String) taskMap.get("remark");
		
		for (Map<String,Object> entry : checkList){
			String profession = entry.get("professionId").toString();//123
			Boolean checked = (boolean) entry.get("checked");//true false
			String member = (String) entry.get("member");//""
			
			DictionaryDO dictionary = dictionaryDao.internalGetById(NumberHelper.toInteger(profession));
			List<CheckDO> checks = this.getChecks(task.getId(), dictionary.getId());
			if (checked){
				if (StringUtils.isBlank(member) && !EnumPlanType.SPOT.toString().equals(task.getPlanType()) && !EnumPlanType.SPEC.toString().equals(task.getPlanType())) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, dictionary.getName() + "没有选择审计员！");
				}
				Map<String,Object> map = new HashMap<String, Object>();
				if (checks.size() > 0){
					CheckDO currentCheck = checks.get(0);
					if (currentCheck.getFlowId() == null || (null != member && !member.equals(currentCheck.getMember()))){
						if ("完成".equals(currentCheck.getFlowStatus()) || "结案".equals(currentCheck.getFlowStatus())){
							throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, dictionary.getName() + "已完成，不能再修改审计员了!");
						}
						currentCheck.setMember(member);
						currentCheck.setLastUpdater(UserContext.getUser());
						this.internalUpdate(currentCheck);
						
						if ("instance".equals(isInstance) || EnumPlanType.SPOT.toString().equals(task.getPlanType()) || EnumPlanType.SPEC.toString().equals(task.getPlanType())) { // 审计的时候点下发再执行此段
							String workflowTemplateId = this.getCheckWorkFlowId(task.getId());
							Map<String, Object> objmap = new HashMap<String, Object>();
							objmap.put("id", currentCheck.getId());
							objmap.put("dataobject", "check");
							String workflowId = (String) transactionHelper.doInTransaction(new WfSetup(), "Submit", UserContext.getUserId().toString(), workflowTemplateId, "", "", gson.toJson(objmap));
							currentCheck.setFlowId(workflowId);
						}
					}
					currentCheck.setDeleted(false);
					currentCheck.setStartDate(startDate);
					currentCheck.setEndDate(endDate);
					currentCheck.setAddress(address);
					currentCheck.setRemark(taskRemark);
					currentCheck.setLastUpdater(UserContext.getUser());
					this.internalUpdate(currentCheck);
					
					map.put("checkId", currentCheck.getId());
					map.put("professionId", dictionary.getId());
					list.add(map);
				} else {
					String checkName = this.getCheckName(task, dictionary);
					String checkNo = this.getCheckNo(task, dictionary);
					Map<String, Object> checkMap = new HashMap<String, Object>();
					checkMap.put("checkNo", checkNo);
					checkMap.put("checkName", checkName);
					checkMap.put("checkType", dictionary.getId());
					checkMap.put("task", task.getId());
					checkMap.put("startDate", startDate);
					checkMap.put("endDate", endDate);
					checkMap.put("address", address);
					checkMap.put("remark", taskRemark);
					checkMap.put("target", task.getTarget());
					checkMap.put("member", member);
					checkMap.put("creator", UserContext.getUserId());
					Integer checkId = this.save(checkMap);
					addActivityLoggingForAddCheck(checkId);
					if ("instance".equals(isInstance) || EnumPlanType.SPOT.toString().equals(task.getPlanType()) || EnumPlanType.SPEC.toString().equals(task.getPlanType())) { // 点下发再执行此段
						String workflowTemplateId = this.getCheckWorkFlowId(task.getId());
						Map<String, Object> objmap = new HashMap<String, Object>();
						objmap.put("id", checkId);
						objmap.put("dataobject", "check");
						String workflowId = (String) transactionHelper.doInTransaction(new WfSetup(), "Submit", UserContext.getUserId().toString(), workflowTemplateId, "", "", gson.toJson(objmap));
						Map<String, Object> checkFlowIdMap = new HashMap<String, Object>();
						checkFlowIdMap.put("flowId", workflowId);
						this.update(checkId, checkFlowIdMap);
					}
					map.put("checkId", checkId);
					map.put("professionId", dictionary.getId());
					list.add(map);
				}
			} else {
				if (checks.size() > 0){
					checks.get(0).setDeleted(true);
					checks.get(0).setLastUpdater(UserContext.getUser());
					this.update(checks.get(0));
				}
			}
		}
		return list;
	}
	
	private String getCheckWorkFlowId(Integer taskId){
		TaskDO task = taskDao.internalGetById(taskId);
		String workflowTemplateId = auditWorkflowSchemeDao.getWorkflowTempIdBySearch(task.getPlanType(), task.getCheckType(), "CHECK");
		return workflowTemplateId;
	}
	
	private String getCheckNo(TaskDO task, DictionaryDO dictionary){
		String checkNo = "";
		Pattern pattern = Pattern.compile("[a-zA-Z]");
		Matcher matcher = pattern.matcher(dictionary.getName());
		String str = "";
		while (matcher.find()){
			str += matcher.group();
		}
		if (EnumPlanType.SPOT.toString().equals(task.getPlanType())) { // 现场检查
			if (EnumCheckGrade.SYS.toString().equals(task.getCheckType())) { // 系统级
				// HOC2015-JP-001-CL-FLT （工作单编号 + "-CL-FLT"）
				checkNo = task.getWorkNo() + "-" + AuditConstant.CHECK_LIST_CODE + "-" + str;
			} else if (EnumCheckGrade.SUB2.toString().equals(task.getCheckType())) { // 分子公司级
				// HOSDC2015-JP-001-CL-FLT （工作单编号 + "-CL-FLT"）
//				UnitDO unit = unitDao.internalGetById(NumberHelper.toInteger(task.getOperator()));
				checkNo = task.getWorkNo() + "-" + AuditConstant.CHECK_LIST_CODE + "-" + str;
			}
		} else if (EnumPlanType.SPEC.toString().equals(task.getPlanType())) { // 专项检查
			if (EnumCheckGrade.SYS.toString().equals(task.getCheckType())) { // 系统级
				// HOEC2015-JP-001-CL-FLT （工作单编号 + "-CL-FLT"）
				checkNo = task.getWorkNo() + "-" + AuditConstant.CHECK_LIST_CODE + "-" + str;
			} else if (EnumCheckGrade.SUB2.toString().equals(task.getCheckType())) { // 分子公司级
				// HOSDEC2015-JP-001-CL-FLT （工作单编号 + "-CL-FLT"）
				checkNo = task.getWorkNo() + "-" + AuditConstant.CHECK_LIST_CODE + "-" + str;
			}
		}else if (EnumPlanType.SYS.toString().equals(task.getPlanType())){
			//HOA2014-SD-CL-FLT HOA2014-山东-CL-专业
			checkNo = task.getWorkNo() + "-" + AuditConstant.CHECK_LIST_CODE + "-" + str;
		} else if (EnumPlanType.SUB2.toString().equals(task.getPlanType())){
			//HOSDA2014-CL-FLT HO山东2014-CL-专业
			checkNo = task.getWorkNo() + "-" + AuditConstant.CHECK_LIST_CODE + "-" + str + "-" + returnCheckOrder(task.getPlanType(), task.getOperator());
		} else if (EnumPlanType.SUB3.toString().equals(task.getPlanType())){
			//HOSDA2014-0001-CL-FLT
			OrganizationDO organization =  organizationDao.internalGetById(NumberHelper.toInteger(task.getOperator()));
			if (organization.getUnit() != null){
				checkNo = task.getWorkNo() + "-" + AuditConstant.CHECK_LIST_CODE + "-" + str + "-" + returnCheckOrder(task.getPlanType(), task.getOperator());
			}
		}
		return checkNo; 
	}
	
	private String getCheckName(TaskDO task, DictionaryDO dictionary) {
		String checkName = "";
		if (EnumPlanType.SPOT.toString().equals(task.getPlanType())) { // 现场检查
			DictionaryDO dic = dictionaryDao.internalGetById(NumberHelper.toInteger(task.getTarget()));
			if (EnumCheckGrade.SYS.toString().equals(task.getCheckType())) { // 系统级
				// 2016年01月份公司机坪检查组织管理ORG检查单
				checkName = task.getYear() + "年" + task.getPlanTime().substring(4) + "月份公司" + dic.getName() + dictionary.getName() + "检查单";
			} else if (EnumCheckGrade.SUB2.toString().equals(task.getCheckType())) { // 分子公司级
				// 2016年01月份西北分公司机坪检查组织管理ORG检查单
				UnitDO unit = unitDao.internalGetById(NumberHelper.toInteger(task.getOperator()));
				checkName = task.getYear() + "年" + task.getPlanTime().substring(4) + "月份" + unit.getName() + dic.getName() + dictionary.getName() + "检查单";
			}
		} else if (EnumPlanType.SPEC.toString().equals(task.getPlanType())) { // 专项检查
			if (EnumCheckGrade.SYS.toString().equals(task.getCheckType())) { // 系统级
				// 2015-10-01至2015-10-31公司专项检查组织管理ORG检查单
				checkName = task.getPlanTime() + "公司专项检查" + dictionary.getName() + "检查单";
			} else if (EnumCheckGrade.SUB2.toString().equals(task.getCheckType())) { // 分子公司级
				// 2015-10-01至2015-10-31西北分公司专项检查组织管理ORG检查单
				UnitDO unit = unitDao.internalGetById(NumberHelper.toInteger(task.getOperator()));
				checkName = task.getPlanTime() + unit.getName() + "专项检查" + dictionary.getName() + "检查单";
			}
		} else if (EnumPlanType.SYS.toString().equals(task.getPlanType())) {
			//2015西北分公司安全审计组织管理ORG检查单
			UnitDO unit = unitDao.internalGetById(NumberHelper.toInteger(task.getTarget()));
			checkName = task.getYear() + unit.getName()+ "安全审计" + dictionary.getName() + "检查单";
		} else if (EnumPlanType.SUB2.toString().equals(task.getPlanType())) {
			//2015西北分公司安全审核组织管理ORG检查单
			UnitDO unit = unitDao.internalGetById(NumberHelper.toInteger(task.getOperator()));
			checkName = task.getYear() + unit.getName() + "安全审核" + dictionary.getName() + "检查单";
		} else if (EnumPlanType.SUB3.toString().equals(task.getPlanType())) {
			//2015西北分公司安全审核组织管理ORG检查单
			OrganizationDO organization =  organizationDao.internalGetById(NumberHelper.toInteger(task.getOperator()));
			UnitDO unit = organization.getUnit();
			checkName = task.getYear() + unit.getName() + "安全审核" + dictionary.getName() + "检查单";
		}
		return checkName;
	}
	
	private String returnCheckOrder(String planType, String operator){
		String sql = "select count(t) from CheckDO t where t.deleted = false and t.task.planType = ? and t.task.operator = ?";
		@SuppressWarnings("unchecked")
		List<Long> list = this.getHibernateTemplate().find(sql, planType, operator);
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
	
	@Override
	protected void afterUpdate(CheckDO obj, CheckDO dbObj) {
		String remark = obj.getRemark() == null ? "" : obj.getRemark();
		String record = obj.getRecord() == null ? "" : obj.getRecord();
		String result = obj.getResult() == null ? "" : obj.getResult();
		
		String dbRemark = dbObj.getRemark() == null ? "" : dbObj.getRemark();
		String dbRecord = dbObj.getRecord() == null ? "" : dbObj.getRecord();
		String dbResult = dbObj.getResult() == null ? "" : dbObj.getResult();
		
		List<String> details = new ArrayList<String>();
		if (!remark.equals(dbRemark)){
			details.add("更新备注为(" + remark + ")");
		}
		if (!record.equals(dbRecord)){
			details.add("更新反馈记录为(" + record + ")");
		}
		if (!result.equals(dbResult)){
			details.add("更新检查小结为(" + result + ")");
		}
		if (!details.isEmpty()) {
			MDC.put("details", details.toArray());
			auditActivityLoggingDao.addLogging(obj.getId(), "check", AuditActivityLoggingOperationRegister.getOperation("UPDATE_CHECK"));
			MDC.remove("details");
		}
	}

	/**
	 * 添加检查单的活动日志
	 * @param task
	 */
	private void addActivityLoggingForAddCheck(Integer checkId){
		auditActivityLoggingDao.addLogging(checkId, "check", AuditActivityLoggingOperationRegister.getOperation("ADD_CHECK"));
	}
	
	@Override
	public void writeUser(Integer id, String[] userIds) {
		List<UserDO> existUsers = checkFlowUserDao.getUsersByCheck(id);// 已存在的user
		List<UserDO> users = userDao.internalGetByIds(userIds);// 要加入的user
		Set<UserDO> mergedUses = new HashSet<UserDO>();// 合并去重
		mergedUses.addAll(existUsers);
		mergedUses.addAll(users);
		CheckDO check = this.internalGetById(id);
		Set<CheckFlowUserDO> flowUsers = check.getFlowUsers();
		if (null != flowUsers) {// 先删除数据库中已有的数据
			checkFlowUserDao.delete(flowUsers);
		}
		for (UserDO user : mergedUses) {// 再向数据库中添加新的数据
			CheckFlowUserDO flowUser = new CheckFlowUserDO();
			flowUser.setCheck(check);
			flowUser.setFlowUser(user);
			checkFlowUserDao.internalSave(flowUser);
		}

	}

	@Override
	public void setStatus(Integer id, Integer statusId, Map<String, Object> attributes) {
		CheckDO check = this.internalGetById(id);// 更新计划的状态和工作流节点
		Set<CheckFlowUserDO> flowUsers = check.getFlowUsers();
		if (flowUsers != null){
			checkFlowUserDao.delete(flowUsers);
		}
		ActivityStatusDO status = activityStatusDao.internalGetById(statusId);
		if (null != status) {
			check.setFlowStatus(status.getName());
		}
		if (null != attributes) {
			check.setFlowStep((String) attributes.get("flowStep"));
		}
		this.internalUpdate(check);
	}

	@Override
	public Collection<Integer> getUserByUnitRole(Integer id, Integer roleId) {
		// 取出对应安监机构的ID
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
		// 取出对应安监机构的ID
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
	
	@Override
	public Integer getRelatedUnitId(Integer id) {
		Integer unitId = null;
		CheckDO check = this.internalGetById(id);
		if (null != check && null != check.getTarget()) {
			TaskDO task = taskDao.internalGetById(check.getTask().getId());
			if (EnumPlanType.SUB2.toString().equals(task.getPlanType()) || EnumPlanType.SUB3.toString().equals(task.getPlanType())) { // 二三级,运控的时候target表示组织
				// 取出安监部的ID
				OrganizationDO organization = organizationDao.internalGetById(Integer.parseInt(check.getTarget()));
				if (null != organization && null != organization.getUnit()) {
					unitId = organization.getUnit().getId();
				}
			} else if (EnumPlanType.SPOT.toString().equals(task.getPlanType()) || EnumPlanType.SPEC.toString().equals(task.getPlanType())) { // 现场检查,专项检查时operator的值表示安监机构
				// 取出安监部的ID
				unitId = Integer.parseInt(task.getOperator());
			} else { // 其他情况target的值表示安监机构
				unitId = Integer.parseInt(check.getTarget());
			}
		}
		return unitId;
	}

	@Override
	public Integer getRelatedOrganizationId(Integer id, String field) {
		Integer organizationId = null;
		CheckDO check = this.internalGetById(id);
		TaskDO task = taskDao.internalGetById(check.getTask().getId());
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
	
	public Object getObjByCheck(CheckDO check) {
		String str = "";
		if (check != null && check.getTask() != null && check.getTarget() != null) {
			if (EnumPlanType.SYS.toString().equals(check.getTask().getPlanType())) { //公司级审计
				UnitDO unit = unitDao.internalGetById(NumberHelper.toInteger(check.getTarget()));
				str = unit == null ? str : unit.getName();
			} else if (EnumPlanType.SPOT.toString().equals(check.getTask().getPlanType())) { //现场检查
				DictionaryDO dic = dictionaryDao.internalGetById(NumberHelper.toInteger(check.getTarget()));
				str = dic == null ? str : dic.getName();
			} else if (EnumPlanType.SPEC.toString().equals(check.getTask().getPlanType())){ //专项检查
				if (EnumCheckGrade.SYS.toString().equals(check.getTask().getCheckType())) {// 专项公司级
					UnitDO unit = unitDao.internalGetById(NumberHelper.toInteger(check.getTarget()));
					str = unit == null ? str : unit.getName();
				} else { // 分子公司
					OrganizationDO organization = organizationDao.internalGetById(NumberHelper.toInteger(check.getTarget()));
					str = organization == null ? str : organization.getName();
				}
			} else { // 其他
				OrganizationDO organization = organizationDao.internalGetById(NumberHelper.toInteger(check.getTarget()));
				str = organization == null ? str : organization.getName();
			}
		}
		return str;
	}
	
	/**
	 * 发送待办的信息
	 * @param id
	 * @param userIds
	 */
	@Override
	public void sendTodoMsg(Integer id, Collection<Integer> userIds, Collection<String> sendingModes) {
		CheckDO check = this.internalGetById(id);
		if (null != check && userIds != null && !userIds.isEmpty() && sendingModes != null && !sendingModes.isEmpty()) {
			// 标题
			String title = "审计待办提醒";
			// 正文内容
			String content = "您有一个检查单需要处理。名称[" + check.getDisplayName() + "], 详情请看安全审计中待我处理的审计任务。";

			// 获取ADMIN的id
			UserDO admin = userDao.getByUsername("ADMIN");
			// 接收人
			List<UserDO> users = userDao.getByIds(new ArrayList<Integer>(userIds));
			Collection<EnumMessageCatagory> sendingModeEnums = EnumMessageCatagory.getEnumByVals(sendingModes);
			// 保存
			messageDao.saveTodoMsg(sendingModeEnums, admin, users, title, content, id, "CHECK");
		}
	}
	
	@Override
	public void sendFeedbackMsg(Integer id, Collection<String> sendingModes) {
		// TODO Auto-generated method stub
		
	}
	
	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}

	public void setDictionaryDao(DictionaryDao dictionaryDao) {
		this.dictionaryDao = dictionaryDao;
	}

	public void setTransactionHelper(TransactionHelper transactionHelper) {
		this.transactionHelper = transactionHelper;
	}

	public void setWorkflowService(WorkflowService workflowService) {
		this.workflowService = workflowService;
	}

	public void setTaskDao(TaskDao taskDao) {
		this.taskDao = taskDao;
	}

	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}

	public void setCheckFlowUserDao(CheckFlowUserDao checkFlowUserDao) {
		this.checkFlowUserDao = checkFlowUserDao;
	}

	public void setUnitRoleActorDao(UnitRoleActorDao unitRoleActorDao) {
		this.unitRoleActorDao = unitRoleActorDao;
	}

	public void setCheckListDao(CheckListDao checkListDao) {
		this.checkListDao = checkListDao;
	}

	public void setActivityStatusDao(ActivityStatusDao activityStatusDao) {
		this.activityStatusDao = activityStatusDao;
	}

	public void setAuditActivityLoggingDao(
			AuditActivityLoggingDao auditActivityLoggingDao) {
		this.auditActivityLoggingDao = auditActivityLoggingDao;
	}

	public void setOrganizationDao(OrganizationDao organizationDao) {
		this.organizationDao = organizationDao;
	}
	
	public void setAuditWorkflowSchemeDao(AuditWorkflowSchemeDao auditWorkflowSchemeDao) {
		this.auditWorkflowSchemeDao = auditWorkflowSchemeDao;
	}

	public void setFileDao(FileDao fileDao) {
		this.fileDao = fileDao;
	}

	public void setAuditorDao(AuditorDao auditorDao) {
		this.auditorDao = auditorDao;
	}

	public void setMessageDao(MessageDao messageDao) {
		this.messageDao = messageDao;
	}

	
}
