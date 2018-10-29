package com.usky.sms.audit.check;

import java.lang.reflect.Field;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.MDC;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.impl.StdSchedulerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.audit.AuditConstant;
import com.usky.sms.audit.EnumAuditRole;
import com.usky.sms.audit.auditor.AuditorDO;
import com.usky.sms.audit.auditor.AuditorDao;
import com.usky.sms.audit.base.ItemDO;
import com.usky.sms.audit.base.ItemDao;
import com.usky.sms.audit.base.ProfessionUserDao;
import com.usky.sms.audit.improve.ImproveDO;
import com.usky.sms.audit.improve.ImproveDao;
import com.usky.sms.audit.improve.ImproveFlowUserDO;
import com.usky.sms.audit.improve.ImproveFlowUserDao;
import com.usky.sms.audit.improvenotice.ImproveNoticeDao;
import com.usky.sms.audit.log.AuditActivityLoggingDao;
import com.usky.sms.audit.log.operation.AuditActivityLoggingOperationRegister;
import com.usky.sms.audit.plan.EnumCheckGrade;
import com.usky.sms.audit.plan.EnumPlanType;
import com.usky.sms.audit.task.TaskDO;
import com.usky.sms.audit.task.TaskDao;
import com.usky.sms.common.DateHelper;
import com.usky.sms.common.NumberHelper;
import com.usky.sms.config.Config;
import com.usky.sms.constant.EnumMessageCatagory;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.file.EnumFileType;
import com.usky.sms.file.FileDO;
import com.usky.sms.file.FileDao;
import com.usky.sms.file.FileService;
import com.usky.sms.job.CronSendCheckListExecuteNoticeJob;
import com.usky.sms.job.CronSendImproveShortMsgJob;
import com.usky.sms.job.JobUtils;
import com.usky.sms.message.MessageDO;
import com.usky.sms.message.MessageDao;
import com.usky.sms.organization.OrganizationDO;
import com.usky.sms.organization.OrganizationDao;
import com.usky.sms.shortmessage.ShortMessageDO;
import com.usky.sms.shortmessage.ShortMessageDao;
import com.usky.sms.tem.ActionItemDao;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.unit.UnitRoleActorDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;
import com.usky.sms.utils.SpringBeanUtils;
import com.usky.sms.workflow.WorkflowService;

public class CheckListDao extends BaseDao<CheckListDO> {
	
	private static final org.apache.log4j.Logger log = org.apache.log4j.Logger.getLogger(CheckListDao.class);
	
	private static final String NAME_PREFIX = "sendImproveShotMsgJob_";
	
	private static final String GROUP = "checkList";
	
	private static final Integer DAY_OF_SEND_IMPROVE_SHORT_MSG = 3;
	
	private static final String CRON_EXP_FOR_SEND_IMPROVE_SHORT_MSG = "0 0 9 * * ?";
	
	/** 发送执行通知的cron表达式 */
	private String cronForSendingExecuteNotice;

	private Config config;
	
	@Autowired
	private ItemDao itemDao;

	@Autowired
	private CheckDao checkDao;

	@Autowired
	private ActionItemDao actionItemDao;
	
	@Autowired
	private OrganizationDao organizationDao;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private DictionaryDao dictionaryDao;
	
	@Autowired
	private WorkflowService workflowService;
	
	@Autowired
	private FileDao fileDao;
	
	@Autowired
	private AuditActivityLoggingDao auditActivityLoggingDao;
	
	@Autowired
	private FileService fileService;
	
	@Autowired
	private UserDao userDao;
	
	@Autowired
	private ImproveDao improveDao;
	
	@Autowired
	private ProfessionUserDao professionUserDao;
	
	@Autowired
	private ImproveItemUserDao improveItemUserDao;
	
	@Autowired
	private UnitRoleActorDao unitRoleActorDao;
	
	@Autowired
	private ImproveNoticeDao improveNoticeDao;
	
	@Autowired
	private ImproveFlowUserDao improveFlowUserDao;
	
	@Autowired
	private MessageDao messageDao;
	
	@Autowired
	private TaskDao taskDao;
	
	@Autowired
	private AuditorDao auditorDao;
	
	@Autowired
	private ShortMessageDao shortMessageDao;
	
	private static final String auditResult = "审计结论";
	
	private static final String defaultAuditResult = "符合项";
	
	
	protected CheckListDao() {
		super(CheckListDO.class);
		this.config = Config.getInstance();
	}
	
	@Override
	protected void beforeUpdate(CheckListDO obj) {
		obj.setLastUpdater(UserContext.getUser());
	}
	
	private void validateConfirmMan(int id){
		CheckListDO checklist = this.internalGetById(id);
		String userId = "," + UserContext.getUserId().toString() + ",";
		String confirmMen = "," + checklist.getConfirmMan() + ",";
		if (confirmMen.indexOf(userId) < 0){
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "您已不是这条验证项的验证人了！");
		}
	}
	
	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		if (map.get("confirmResult") != null){
//			validateConfirmMan(id);
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			try {
				map.put("confirmDate", sdf.parse(sdf.format(new Date())));
			} catch (ParseException e) {
				e.printStackTrace();
			}
		}
		this.addActivityLoggingForUpdate(id, map);
		
		map.put("lastUpdater", UserContext.getUserId());
		// 活动日志
		List<String> details = new ArrayList<String>();
		if (map.containsKey("confirmMan") && StringUtils.isBlank((String)map.get("confirmMan"))) { // 验证人
			String[] confirmManIds =  ((String)map.get("confirmMan")).split(",");
			List<UserDO> confirmMans = userDao.internalGetByIds(confirmManIds);
			List<String> confirmManName = new ArrayList<String>();
			for (UserDO confirmMan : confirmMans) {
				confirmManName.add(confirmMan.getFullname());
			}
			details.add("分派了验证人:" + StringUtils.join(confirmManName.toArray(), ","));
		}
		if (map.containsKey("traceItemStatus") && StringUtils.isBlank((String)map.get("traceItemStatus"))) { // 跟踪/验证状态
			String traceItemStatus;
			try {
				traceItemStatus = EnumTraceItemStatus.getEnumByCode((String) map.get("traceItemStatus")).toString();
				details.add("将验证结论设置为:" + traceItemStatus);
			} catch (Exception e) {
				e.printStackTrace();
			}
			
		}
		if (!details.isEmpty()) {
			MDC.put("details", details.toArray());
			auditActivityLoggingDao.addLogging(id, "checkList", AuditActivityLoggingOperationRegister.getOperation("UPDATE_CHECK_LIST"));
			MDC.remove("details");
		}
	}

	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		map.put("creator", UserContext.getUserId());
		map.put("lastUpdater", UserContext.getUserId());
		return super.beforeSave(map);
	}

	@Override
	protected void afterSave(CheckListDO obj) {
		
	}

	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		CheckListDO checkList = (CheckListDO) obj;
		if ("improveItemStatus".equals(fieldName) && null != checkList.getImproveItemStatus()) { // 整改项的状态
			try {
				Map<String, Object> statusMap = new HashMap<String, Object>();
				statusMap.put("code", checkList.getImproveItemStatus());
				statusMap.put("description", EnumImproveItemStatus.getEnumByCode(checkList.getImproveItemStatus()));
				map.put("improveItemStatus", statusMap);
			} catch (Exception e) {
				e.printStackTrace();
			}
		} else if ("confirmResult".equals(fieldName)) {
				Map<String, Object> confirmResult = new HashMap<String, Object>();
				confirmResult.put("code", checkList.getConfirmResult());
				try {
					confirmResult.put("description", EnumConfirmResult.getEnumByVal(checkList.getConfirmResult()).getDescription());
				} catch(Exception e) {
					confirmResult.put("description", "未知结论");
				}
				map.put("confirmResult", confirmResult);
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}

	@SuppressWarnings("unchecked")
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public List<CheckListDO> updateCheckList(List<Map<String, Object>> list, Integer checkId) {
		Map<String,List<Integer>> map = groupType(list);
		List<Integer> itemList = (List<Integer>) map.get("item");
		List<ItemDO> items = itemDao.getByIds(itemList);
		CheckDO check = checkDao.internalGetById(checkId);
		if (check == null) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "没有此检查单！");
		addActivityLoggingForUpdateCheck(items, check);
		for (ItemDO chapterItem : items) {
			if (chapterItem != null) {
				List<CheckListDO> boolItem = this.getHibernateTemplate().find("from CheckListDO t where t.deleted = false and t.item.id = ? and t.check.id = ?", chapterItem.getId(), checkId);
				if (boolItem.size() > 0) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "【" + chapterItem.getPoint() + "】检查项已添加！");
				CheckListDO checkList = new CheckListDO();
				{
					checkList.setItem(chapterItem);// 保存章节的id
					checkList.setItemPoint(chapterItem.getPoint()); // 要点
					checkList.setItemAccording(chapterItem.getAccording());
					checkList.setItemPrompt(chapterItem.getPrompt());
					checkList.setItemValue(chapterItem.getValue());
					checkList.setItemProfession(check.getCheckType());
				}
				{
					checkList.setCheck(check);
					checkList.setTask(check.getTask());
					checkList.setCreated(new Date());
					checkList.setLastUpdate(new Date());
					checkList.setCreator(UserContext.getUser());
					checkList.setLastUpdater(UserContext.getUser());
				}
				this.internalSave(checkList);
			}
		}
		List<CheckListDO> checkLists = this.getByCheck(check.getId());
		return checkLists;
	}
	/**
	 * 航站审计添加检查项
	 * @param dataMap
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void saveCheckList(Map<String, Object> dataMap) {
		@SuppressWarnings("unchecked")
		List<String> checkListIds = (List<String>) dataMap.get("checkListIds");
		Integer taskId = NumberHelper.toInteger(dataMap.get("taskId").toString());
		TaskDO task = taskDao.internalGetById(taskId);
		List<ItemDO> items = itemDao.internalGetByIds((String[])checkListIds.toArray(new String[checkListIds.size()]));
		List<CheckListDO> checklists = new ArrayList<CheckListDO>();
		List<String> details = new ArrayList<String>();
		for (ItemDO chapterItem : items){
			@SuppressWarnings("unchecked")
			List<CheckListDO> boolItem = this.getHibernateTemplate().find("from CheckListDO t where t.deleted = false and t.item.id = ? and t.task.id = ?", chapterItem.getId(), taskId);
			if (boolItem.size() > 0) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "【" + chapterItem.getPoint() + "】检查项已添加！");
//			details.add("添加了[" + chapterItem.getPoint() + "]检查项");
			CheckListDO checkList = new CheckListDO();
			{
				checkList.setItem(chapterItem);// 保存章节的id
				checkList.setItemPoint(chapterItem.getPoint()); // 要点
				checkList.setItemAccording(chapterItem.getAccording());
				checkList.setItemPrompt(chapterItem.getPrompt());
				checkList.setItemValue(chapterItem.getValue());
			}
			{
				checkList.setTask(task);
				checkList.setCreated(new Date());
				checkList.setLastUpdate(new Date());
				checkList.setCreator(UserContext.getUser());
				checkList.setLastUpdater(UserContext.getUser());
			}
			checklists.add(checkList);
		}
		this.internalSave(checklists);
		details.add("添加了" + items.size() + "条检查项");
		if (!details.isEmpty()) {
			MDC.put("details", details.toArray());
			auditActivityLoggingDao.addLogging(taskId, "task", AuditActivityLoggingOperationRegister.getOperation("UPDATE_TASK"));
			MDC.remove("details");
		}
	}
	
	
	private void addActivityLoggingForUpdateCheck(List<ItemDO> list, CheckDO check){
		List<String> details = new ArrayList<String>();
		//List<Integer> checkLists = this.getByChecks(check.getId());//这是item的id
//		for (ItemDO entry : list){
//			if (!checkLists.contains(entry.getId())){
//			}
//		}
		details.add("添加了" + list.size() + "条检查项");
		if (!details.isEmpty()) {
			MDC.put("details", details.toArray());
			auditActivityLoggingDao.addLogging(check.getId(), "check", AuditActivityLoggingOperationRegister.getOperation("UPDATE_CHECK"));
			MDC.remove("details");
		}
	}
	
	@Override
	protected void afterDelete(Collection<CheckListDO> collection) {
		addActivityLoggingForDeleteCheck(collection);
		super.afterDelete(collection);
	}

	private void addActivityLoggingForDeleteCheck(Collection<CheckListDO> collection){
		List<String> details = new ArrayList<String>();
		CheckDO check = null;
		TaskDO task = null;
		for (CheckListDO c : collection){
			CheckListDO checklist = this.internalGetById(c.getId());
			check = checklist.getCheck();
			task = checklist.getTask();
			details.add("删除了[" + c.getItemPoint() + "]检查项");
		}
		if (check != null){
			if (!details.isEmpty()) {
				MDC.put("details", details.toArray());
				auditActivityLoggingDao.addLogging(check.getId(), "check", AuditActivityLoggingOperationRegister.getOperation("UPDATE_CHECK"));
				MDC.remove("details");
			}
		}
		if (task != null) {
			if (EnumPlanType.TERM.toString().equals(task.getPlanType())) {
				if (!details.isEmpty()) {
					MDC.put("details", details.toArray());
					auditActivityLoggingDao.addLogging(task.getId(), "task", AuditActivityLoggingOperationRegister.getOperation("UPDATE_TASK"));
					MDC.remove("details");
				}
			}
		}
	}
	
	private Map<String, List<Integer>> groupType(List<Map<String, Object>> list) {
		List<Integer> itemList = new ArrayList<Integer>();
		for (Map<String, Object> entry : list) {
			itemList.add(NumberHelper.toInteger(entry.get("id").toString()));
		}
		Map<String, List<Integer>> map = new HashMap<String, List<Integer>>();
		map.put("item", itemList);
		return map;

	}
	
	@SuppressWarnings("unchecked")
	public List<CheckListDO> getByCheck(Integer checkId) {
		String sql = "from CheckListDO t where t.deleted = false and t.check.id = ? order by t.item.orderNo asc t.item.created asc";
		List<CheckListDO> list = this.getHibernateTemplate().find(sql, checkId);
		return list;
	}

	
	public List<Integer> getByChecks(Integer checkId) {
		List<CheckListDO> checkLists = this.getByCheck(checkId);
		List<Integer> list = new ArrayList<Integer>();
		for (CheckListDO checkList : checkLists) {
			if (checkList.getItem() != null) {
				list.add(checkList.getItem().getId());
			}
		}
		return list;
	}
	
	/**
	 * 通过工作单ID查询检查单明细
	 * @param taskId 工作单ID
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<CheckListDO> getByTaskId(Integer taskId){
		return (List<CheckListDO>) this.query("select t from CheckListDO t left join t.check c left join c.checkType ct where t.deleted = false and t.task.id = ? order by ct.key, t.itemPoint", taskId);
	}
	
	@SuppressWarnings("unchecked")
	public List<CheckListDO> getTermByTaskId(Integer taskId){
		return (List<CheckListDO>) this.query("select t from CheckListDO t where t.deleted = false and t.task.id = ? order by t.item.orderNo asc", taskId);
	}

	/**
	 * 通过工作单ID查询检查单ids
	 * @param taskId 工作单ID
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<Integer> getIdsByTaskId(Integer taskId){
		return (List<Integer>) this.query("select t.id from CheckListDO t where t.deleted = false and t.task.id = ?", taskId);
	}
	
	/**
	 * 通过工作单ID查询有问题（不是符合项和不适用）的检查单明细
	 * @param taskId 工作单ID
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<CheckListDO> getHasProblemsByTaskId(Integer taskId){
		return (List<CheckListDO>) this.query("from CheckListDO t where t.deleted = false and t.task.id = ? and t.auditResult.name <> ? and t.auditResult.name <> ?", taskId, EnumAuditResult.符合项.toString(), EnumAuditResult.不适用.toString());
	}

	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}
	
	private List<OrganizationDO> remove(UnitDO unit, List<OrganizationDO> organizations){
		List<OrganizationDO> list = new ArrayList<OrganizationDO>();
		for (OrganizationDO org : organizations) {
			if (!unit.getName().equals(org.getName())) {
				list.add(org);
			}
		}
		return list;
	}
	
	private List<Map<String,Object>> getResponsibilityUnit(Integer unitId, String term){
		UnitDO unit = unitDao.internalGetById(unitId);
		List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
		if (term != null && !"".equals(term)){
			if (unit.getName().indexOf(term) > -1){
				Map<String,Object> unitMap = new HashMap<String, Object>();
				unitMap.put("id", unit.getId());
				unitMap.put("name", unit.getName());
				unitMap.put("parentId", 0);
				unitMap.put("type", "UT");
				list.add(unitMap);
			}
		} else {
			Map<String,Object> unitMap = new HashMap<String, Object>();
			unitMap.put("id", unit.getId());
			unitMap.put("name", unit.getName());
			unitMap.put("parentId", 0);
			unitMap.put("type", "UT");
			list.add(unitMap);
		}
		List<OrganizationDO> organizations = organizationDao.getAllOrganizations(null, unitId);
		List<Integer> orgIds = getOrgIds(remove(unit, organizations));
		for (OrganizationDO org : remove(unit, organizations)) {
			if (org.getParent() != null) {
				if (term == null || "".equals(term)) {
					Map<String, Object> map = new HashMap<String, Object>();
					map.put("id", org.getId());
					map.put("name", org.getName());
					if (orgIds.contains(org.getParent().getId())) {
						map.put("parentId", org.getParent().getId());
					} else {
						map.put("parentId", unit.getId());
					}
					map.put("type", "DP");
					list.add(map);
				} else {
					Map<String, Object> map = new HashMap<String, Object>();
					if (org.getName().indexOf(term) > -1) {
						map.put("id", org.getId());
						map.put("name", org.getName());
						if (orgIds.contains(org.getParent().getId())) {
							map.put("parentId", org.getParent().getId());
						} else {
							map.put("parentId", unit.getId());
						}
						map.put("type", "DP");
						list.add(map);
					}
				}
			}
		}
		return list;
	}
	
	public List<Map<String, Object>> getResponsibilityUnits(Integer unitId, String term, String checkId) {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		if (checkId == null){ //系统级
			if (unitId != null) {
				list.addAll(getResponsibilityUnit(unitId,term));
			} else {
				List<UnitDO> units = unitDao.getList();
				for (UnitDO unit : units) {
					list.addAll(getResponsibilityUnit(unit.getId(),term));
				}
			}
		} else {
			CheckDO check = checkDao.internalGetById(NumberHelper.toInteger(checkId));
			if (EnumPlanType.SUB2.toString().equals(check.getTask().getPlanType())){
				Integer organizationId = unitId;
				if (organizationId != null) {
					List<OrganizationDO>  organizations = organizationDao.getAllOrganizationByParent(organizationId);
					list.addAll(this.factoryOrganizationMap(organizations, term));
				} else {
					list.addAll(getResponsibilityUnit(Integer.parseInt(check.getTask().getOperator()),term));
				}
			} else if (EnumPlanType.SUB3.toString().equals(check.getTask().getPlanType())){
				Integer organizationId = unitId;
				if (organizationId != null) {
					List<OrganizationDO>  organizations = organizationDao.getAllOrganizationByParent(organizationId);
					list.addAll(this.factoryOrganizationMap(organizations, term));
				} else {
					Integer operator = Integer.parseInt(check.getTask().getOperator());
					List<OrganizationDO>  organizations = organizationDao.getAllOrganizationByParent(operator);
					list.addAll(this.factoryOrganizationMap(organizations, term));
				}
			} else if (EnumCheckGrade.SYS.toString().equals(check.getTask().getCheckType())) { // 公司级检查，返回所有二级单位和分子公司的安监机构
				// 暂时下拉所有安监机构
				List<UnitDO> units = unitDao.getAllUnits(term);
				for (UnitDO unit : units) {
					Map<String,Object> unitMap = new HashMap<String, Object>();
					unitMap.put("id", unit.getId());
					unitMap.put("name", unit.getName());
					unitMap.put("parentId", 0);
					unitMap.put("type", "UT");
					list.add(unitMap);
				}
			} else if (EnumCheckGrade.SUB2.toString().equals(check.getTask().getCheckType())) { // 分子公司：分子公司下的三级单位（组织）一级执行单位
				Integer operator = Integer.parseInt(check.getTask().getOperator());
				UnitDO unit = unitDao.internalGetById(operator);
				if (StringUtils.isBlank(term) || (StringUtils.isNotBlank(term) && StringUtils.containsIgnoreCase(unit.getName(), term))) {
					Map<String,Object> unitMap = new HashMap<String, Object>();
					unitMap.put("id", unit.getId());
					unitMap.put("name", unit.getName());
					unitMap.put("parentId", 0);
					unitMap.put("type", "UT");
					list.add(unitMap);
				}
				List<OrganizationDO>  organizations = organizationDao.getByOlevelAndUnit("3", operator);
				list.addAll(this.factoryOrganizationMap(organizations, term));
			}
		}
		return list;
	}
	
	private List<Map<String, Object>> factoryOrganizationMap(List<OrganizationDO> organizations, String term){
		List<Map<String, Object>> list = new ArrayList<Map<String,Object>>();
		if (term != null && !"".equals(term)){
			for (OrganizationDO o : organizations){
				if (o.getName().indexOf(term) > -1){
					Map<String, Object> map = new HashMap<String, Object>();
					map.put("id", o.getId());
					map.put("name", o.getName());
					map.put("type", "DP");
					list.add(map);
				}
 			}
		} else {
			for (OrganizationDO o : organizations) {
				Map<String, Object> map = new HashMap<String, Object>();
				map.put("id", o.getId());
				map.put("name", o.getName());
				map.put("type", "DP");
				list.add(map);
			}
		}
		return list;
	}
	
	private List<Integer> getOrgIds(List<OrganizationDO> organizations){
		List<Integer> list = new ArrayList<Integer>();
		for (OrganizationDO org : organizations) {
			list.add(org.getId());
		}
		return list;
	}
	
	//此次共审计检查52项，其中：符合项为8项，一般不符合项为5项，严重不符合项为5项，建议项为4项，不适用项为1项。
	@SuppressWarnings("unchecked")
	public String calculateCheckList(Integer checkId, String planType){
		String sql = "select t.auditResult.id, count(*) from CheckListDO t where t.deleted = false and t.check.id = ? group by t.auditResult.id";
		List<Object[]> checkLists = this.getHibernateTemplate().find(sql,checkId);
		List<DictionaryDO> dictionarys = dictionaryDao.getListByType(auditResult);
		StringBuffer str = new StringBuffer("其中：");
		int sum = 0;
		for (DictionaryDO dic : dictionarys) {
			int count = 0;
			for (Object[] obj : checkLists) {
				if (obj[0] != null && obj[1] != null) {
					if (dic.getId().equals(obj[0])) {
						count = ((Long) obj[1]).intValue();
					}
				}

			}
			str.append(dic.getName() + "为" + count + "项，");
			sum += count;
		}
		String name = null;
		if (EnumPlanType.SPOT.toString().equals(planType) || EnumPlanType.SPEC.toString().equals(planType)) {
			name = "检查";
		} else {
			name = "审计检查";
		}
		str.insert(0, "此次共" + name + sum + "项，");
		str.replace(str.length() - 1, str.length(), "。");
		return str.toString();
	}
	
	
	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple, boolean showExtendFields) {
		CheckListDO checkList = (CheckListDO) obj;
		map.put("improveUnit", this.addImproveUnitMap(checkList.getImproveUnit()));
		map.put("improveUnit2", this.addImproveUnitMap(checkList.getImproveUnit2()));
		map.put("confirmMan", this.addConfirmManMap(checkList.getConfirmMan()));
		if (EnumPlanType.TERM.toString().equals(checkList.getTask().getPlanType())) {
			Map<String, Object> term_unit = new HashMap<String, Object>();
			term_unit.put("id", 0);
			term_unit.put("name", checkList.getTermResponsibilityUnit());
			map.put("improveUnit", term_unit);
		}
		if (showExtendFields){
			if (checkList.getAuditResult() == null){
				DictionaryDO auditResult = dictionaryDao.getByTypeAndName("审计结论", defaultAuditResult);
				if (auditResult == null) throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "没有此审计结论！");
				checkList.setAuditResult(auditResult);
				this.internalUpdate(checkList);
					if (multiple){
						map.put("auditResultId", auditResult.getId());
						map.put("auditResult", defaultAuditResult);
					}else {
						map.put("auditResult", auditResult.getId());
						map.put("auditResultDisplayName", defaultAuditResult);
				}
			}
			map.put("auditFiles", fileDao.convert(fileDao.getFilesBySource(4, checkList.getId())));
		}
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
	}
	/**
	 * 验证人JSON
	 * @param confirmMan
	 * @return
	 */
	private List<Map<String,Object>> addConfirmManMap(String confirmMan) {
		List<Map<String,Object>> manList = new ArrayList<Map<String,Object>>();
		if (confirmMan != null){
			String[] ids = confirmMan.split(",");
			List<UserDO> confirmMan_user = userDao.internalGetByIds(ids);
			for (UserDO man : confirmMan_user){
				Map<String, Object> manMap = new HashMap<String, Object>();
				manMap.put("id", man.getId());
				manMap.put("name", man.getFullname());
				manMap.put("username", man.getUsername());
				manList.add(manMap);
			}
		}
		return manList;
	}
	/**
	 * 责任单位JSON
	 * @param improveUnit
	 * @return
	 */
	private Map<String, Object> addImproveUnitMap(String improveUnit) {
		Map<String,Object> unitMap = new HashMap<String, Object>();
		if (improveUnit != null) {
			String unitType = improveUnit.replaceAll("[0-9]", "");
			Integer unitId = Integer.parseInt(improveUnit.replaceAll("[a-zA-Z]", ""));
			if ("UT".equals(unitType)) {
				UnitDO unit = unitDao.internalGetById(unitId);
				if (unit != null) {
					unitMap.put("id", unit.getId());
					unitMap.put("name", unit.getName());
				}
			} else if ("DP".equals(unitType)) {
				OrganizationDO organization = organizationDao.internalGetById(unitId);
				if (organization != null) {
					unitMap.put("id", organization.getId());
					unitMap.put("name", organization.getName());
				}
			}
			unitMap.put("type", unitType);
		}
		if (unitMap.size() == 0) {
			return null;
		} else {
			return unitMap;
		}
	}
	
	public void addActivityLoggingForUpdate(int id ,Map<String,Object> map){
		List<String> param = new ArrayList<String>();
		for (Map.Entry<String, Object> entry : map.entrySet()){
			param.add(entry.getKey());
		}
		CheckListDO checkList = this.internalGetById(id);
		String point = checkList.getItemPoint();
		if (point != null && point.length() > 15){
			point = point.substring(0, 15) + "...";
		}
		List<String> details = new ArrayList<String>();
		if (param.contains("remark")){
			String dbremark = checkList.getRemark() == null ? "" : checkList.getRemark();
			String remark = (String) (map.get("remark") == null ? "" : map.get("remark"));
			if (!dbremark.equals(remark)){
				details.add("更新【"+point+"】的备注为："+remark);
			}
		}
		if (param.contains("itemPoint")){
			String dbitemPoint = checkList.getItemPoint() == null ? "" : checkList.getItemPoint();
			String itemPoint = (String) (map.get("itemPoint") == null ? "" : map.get("itemPoint"));
			if (!dbitemPoint.equals(itemPoint)){
				details.add("更新【"+point+"】的审计要点为："+itemPoint);
			}
		}
		if (param.contains("itemAccording")){
			String dbitemAccording = checkList.getItemAccording() == null ? "" : checkList.getItemAccording();
			String itemAccording = (String) (map.get("itemAccording") == null ? "" : map.get("itemAccording"));
			if (!dbitemAccording.equals(itemAccording)){
				details.add("更新【"+point+"】的审计依据为："+itemAccording);
			}
		}
		if (param.contains("itemPrompt")){
			String dbitemPrompt = checkList.getItemPrompt() == null ? "" : checkList.getItemPrompt();
			String itemPrompt = (String) (map.get("itemPrompt") == null ? "" : map.get("itemPrompt"));
			if (!dbitemPrompt.equals(itemPrompt)){
				details.add("更新【"+point+"】的审计提示为："+itemPrompt);
			}
		}
		if (param.contains("auditRecord")){
			String dbauditRecord = checkList.getAuditRecord() == null ? "" : checkList.getAuditRecord();
			String auditRecord = (String) (map.get("auditRecord") == null ? "" : map.get("auditRecord"));
			if (!dbauditRecord.equals(auditRecord)){
				details.add("更新【"+point+"】的审计记录为："+auditRecord);
			}
		}
		if (param.contains("auditResult")){
			DictionaryDO dbauditResult = checkList.getAuditResult();
			String auditResult = (map.get("auditResult") == null ? "" : map.get("auditResult").toString());
			if (!"".equals(auditResult)){
				DictionaryDO dic = dictionaryDao.internalGetById(NumberHelper.toInteger(auditResult));
				if (!dic.equals(dbauditResult)){
					details.add("更新【"+point+"】的审计结论为："+dic.getName());
				}
				
			}
		}
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		if (param.contains("improveDate")){
			String dbimproveDate = checkList.getImproveDate() == null ? "" : sdf.format(checkList.getImproveDate());
			String improveDate = map.get("improveDate") == null ? "" : (String) map.get("improveDate");
			if (!dbimproveDate.equals(improveDate)){
				details.add("更新【"+point+"】的整改完成日期为："+improveDate);
			}
		}
		if (param.contains("improveLastDate")){
			String dbimproveLastDate = checkList.getImproveLastDate() == null ? "" : sdf.format(checkList.getImproveLastDate());
			String improveLastDate = map.get("improveLastDate") == null ? "" : (String) map.get("improveLastDate");
			if (!dbimproveLastDate.equals(improveLastDate)){
				details.add("更新【"+point+"】的整改期限为："+improveLastDate);
			}
		}
		if (param.contains("improveReason")){
			String dbimproveReason = checkList.getImproveReason() == null ? "" : checkList.getImproveReason();
			String improveReason = map.get("improveReason") == null ? "" : (String) map.get("improveReason");
			if (!dbimproveReason.equals(improveReason)){
				details.add("更新【"+point+"】的产生原因为："+improveReason);
			}
		}
		if (param.contains("improveMeasure")){
			String dbimproveMeasure = checkList.getImproveMeasure() == null ? "" : checkList.getImproveMeasure();
			String improveMeasure = map.get("improveMeasure") == null ? "" : (String) map.get("improveMeasure");
			if (!dbimproveMeasure.equals(improveMeasure)){
				details.add("更新【"+point+"】的整改措施为："+improveMeasure);
			}
		}
		if (param.contains("improveCheck")){
			String dbimproveCheck = checkList.getImproveCheck() == null ? "" : checkList.getImproveCheck();
			String improveCheck = map.get("improveCheck") == null ? "" : (String) map.get("improveCheck");
			if (!dbimproveCheck.equals(improveCheck)){
				details.add("更新【"+point+"】的整改审核为："+improveCheck);
			}
		}
		if (param.contains("improveRemark")){
			String dbimproveRemark = checkList.getImproveRemark() == null ? "" : checkList.getImproveRemark();
			String improveRemark = map.get("improveRemark") == null ? "" : (String) map.get("improveRemark");
			if (!dbimproveRemark.equals(improveRemark)){
				details.add("更新【"+point+"】的整改完成情况为："+improveRemark);
			}
		}
		if (param.contains("confirmRemark")){
			String dbconfirmRemark = checkList.getConfirmRemark() == null ? "" : checkList.getConfirmRemark();
			String confirmRemark = map.get("confirmRemark") == null ? "" : (String) map.get("confirmRemark");
			if (!dbconfirmRemark.equals(confirmRemark)){
				details.add("更新【"+point+"】的验证建议为："+confirmRemark);
			}
		}
		if (param.contains("confirmMan")){
			String dbconfirmMan = checkList.getConfirmMan() == null ? "" : checkList.getConfirmMan();
			String confirmMan = map.get("confirmMan") == null ? "" : (String) map.get("confirmMan");
			if (!dbconfirmMan.equals(confirmMan)){
				String str = "";
				if (!"".equals(confirmMan)){
					String[] tempconfirmMan = confirmMan.split(",");
					for (int i = 0; i < tempconfirmMan.length; i++){
						UserDO user = userDao.internalGetById(NumberHelper.toInteger(tempconfirmMan[i]));
						str = str + user.getFullname();
					}
				}
				details.add("更新【"+point+"】的验证人为："+str);
			}
		}
		if (param.contains("confirmLastDate")){
			String dbconfirmLastDate = checkList.getConfirmLastDate() == null ? "" : sdf.format(checkList.getConfirmLastDate());
			String confirmLastDate = map.get("confirmLastDate") == null ? "" : (String) map.get("confirmLastDate");
			if (!dbconfirmLastDate.equals(confirmLastDate)){
				details.add("更新【"+point+"】的验证期限为："+confirmLastDate);
			}
		}
		if (param.contains("confirmDate")){
			String dbconfirmDate = checkList.getConfirmDate() == null ? "" : sdf.format(checkList.getConfirmDate());
			String confirmDate = map.get("confirmDate") == null ? "" : sdf.format((Date) map.get("confirmDate"));
			if (!dbconfirmDate.equals(confirmDate)){
				details.add("更新【"+point+"】的验证日期为："+confirmDate);
			}
		}
		if (param.contains("confirmResult")){
			String dbconfirmResult = checkList.getConfirmResult() == null ? "" : checkList.getConfirmResult();
			String confirmResult = map.get("confirmResult") == null ? "" : map.get("confirmResult").toString();
			if (!dbconfirmResult.equals(confirmResult)){
				details.add("更新【"+point+"】的验证结论为："+confirmResult);
			}
		}
		if (param.contains("auditSummary")){
			String dbauditSummary = checkList.getAuditSummary() == null ? "" : checkList.getAuditSummary();
			String auditSummary = map.get("auditSummary") == null ? "" : (String) map.get("auditSummary");
			if (!dbauditSummary.equals(auditSummary)){
				details.add("更新【"+point+"】的审计总结为："+auditSummary);
			}
		}
		// 整改责任人
		if (param.contains("improveResponsiblePerson")){
			String dbImproveResponsiblePerson = checkList.getImproveResponsiblePerson() == null ? "" : checkList.getImproveResponsiblePerson();
			String improveResponsiblePerson = map.get("improveResponsiblePerson") == null ? "" : (String) map.get("improveResponsiblePerson");
			if (!dbImproveResponsiblePerson.equals(improveResponsiblePerson)){
				details.add("更新【"+point+"】的整改责任人为："+ improveResponsiblePerson);
			}
		}
		// 审核意见
		if (param.contains("auditOpinion")){
			String dbAuditOpinion = checkList.getAuditOpinion() == null ? "" : checkList.getAuditOpinion();
			String auditOpinion = map.get("auditOpinion") == null ? "" : (String) map.get("auditOpinion");
			if (!dbAuditOpinion.equals(auditOpinion)){
				details.add("更新【"+point+"】的审核意见为："+ auditOpinion);
			}
		}
		// 整改转发
		if (param.contains("transmitUsers")){
			@SuppressWarnings("unchecked")
			Collection<UserDO> transmitUsers = (Collection<UserDO>) map.get("transmitUsers");
			if (null != transmitUsers && !transmitUsers.isEmpty()) {
				List<String> fullnames = new ArrayList<String>();
				for (UserDO user : transmitUsers) {
					fullnames.add(user.getFullname());
				}
				details.add("将【"+point+"】的转发给："+ StringUtils.join(fullnames, ","));
			}
		}
		if (!details.isEmpty()) {
			MDC.put("details", details.toArray());
			if (checkList.getTask() != null){
				auditActivityLoggingDao.addLogging(checkList.getTask().getId(), "task", AuditActivityLoggingOperationRegister.getOperation("UPDATE_TASK"));
			}
			if (checkList.getImprove() != null){
				auditActivityLoggingDao.addLogging(checkList.getImprove().getId(), "improve", AuditActivityLoggingOperationRegister.getOperation("UPDATE_IMPROVE"));
			}
			if (checkList.getCheck() != null){
				auditActivityLoggingDao.addLogging(checkList.getCheck().getId(), "check", AuditActivityLoggingOperationRegister.getOperation("UPDATE_CHECK"));
			}
			MDC.remove("details");
		}
	}
	
	/**
	 * 按照责任单位分组<br>
	 * 只有主要责任单位的按主要责任单位分组<br>
	 * 所有有额外责任单位分成另一组<br>
	 * @param checkList
	 */
	@SuppressWarnings("unchecked")
	public List<List<Map<String, Object>>> groupByImproveUnit(Collection<CheckListDO> checkLists, List<String> fields){
		List<List<Map<String, Object>>> result = new ArrayList<List<Map<String,Object>>>();
		Map<String, Object> map = new HashMap<String, Object>();
		for (CheckListDO checkList : checkLists) {
			if (null != checkList.getImproveUnit2()  ) { // 有额外责任单位分成另一组
				if (map.containsKey("hasImproveUnit2")) {
					((List<CheckListDO>) map.get("hasImproveUnit2")).add(checkList);
				} else {
					List<CheckListDO> others = new ArrayList<CheckListDO>();
					others.add(checkList);
					map.put("hasImproveUnit2", others);
				}
					
			} else { // 只有主要责任单位的按主要责任单位分组
				if (map.containsKey(checkList.getImproveUnit())) {
					 ((List<CheckListDO>) map.get(checkList.getImproveUnit())).add(checkList);
				} else {
					List<CheckListDO> list = new ArrayList<CheckListDO>();
					list.add(checkList);
					map.put(checkList.getImproveUnit(), list);
				}
			}
		}
		for (Entry<String, Object> entry : map.entrySet()) {
			result.add(this.convert((List<CheckListDO>)entry.getValue(), fields, false));
		}
		Collections.sort(result, new Comparator<List<Map<String, Object>>>(){
			public int compare(List<Map<String, Object>> arg0, List<Map<String, Object>> arg1) {
				Map<String, Object> map0 = arg0.get(0);
				Map<String, Object> map1 = arg1.get(0);
				if (null != map0.get("improveUnit2") || null != map1.get("improveUnit2")) {
					return improveNoticeDao.compareMap(map0, map1, "improveUnit2");
				} else {
					return improveNoticeDao.compareMap(map0, map1, "improveUnit");
				}
//				if (null != map0.get("improveUnit2") && null != map1.get("improveUnit2")) {
//					return ((String )((Map<String, Object>) map0.get("improveUnit2")).get("name")).compareTo(((String )((Map<String, Object>) map1.get("improveUnit2")).get("name")));
//				} else if (null != map0.get("improveUnit2") && null == map1.get("improveUnit2")){
//					return 1;
//				} else if (null == map0.get("improveUnit2") && null != map1.get("improveUnit2")){
//					return -1;
//				} else {
//					return ((String )((Map<String, Object>) map0.get("improveUnit")).get("name")).compareTo(((String )((Map<String, Object>) map1.get("improveUnit")).get("name")));
//				}
			}
		});
		return result;
	}
	
	/**
	 * 整改转发
	 * 责任单位是安监机构时转发到该安监机构下的二级审计主管，责任单位时组织时转发到该组织下的三级审计主管
	 * @param checkLists
	 */
	@SuppressWarnings("unchecked")
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void transmitImproveRecord(Collection<CheckListDO> checkLists){
		if (null != checkLists && !checkLists.isEmpty()) {
			// 按照责任单位分组
			Map<String, Object> map = new HashMap<String, Object>();
			List<CheckListDO> list = null;
			for (CheckListDO checkList : checkLists) {
				String improveUnit = checkList.getImproveUnit();
				if (map.containsKey(improveUnit)) {
					list = (List<CheckListDO>) map.get(improveUnit);
					list.add(checkList);
				} else {
					list = new ArrayList<CheckListDO>();
					list.add(checkList);
					map.put(improveUnit, list);
				}
			}
			
			// 责任单位是组织时转发到主要责任单位下A3.2三级审计主管
			DictionaryDO dic = dictionaryDao.getByTypeAndKey("审计角色", EnumAuditRole.THIRD_GRADE_AUDIT_MASTER.getKey());
			if (null == dic) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_133000006, "审计角色", EnumAuditRole.THIRD_GRADE_AUDIT_MASTER.getKey());
			}
			String dpRoleName = dic.getName(); 
			// 责任单位是安监机构时转发到主要责任单位下A2.2二级审计主管
			dic = dictionaryDao.getByTypeAndKey("审计角色", EnumAuditRole.SECOND_GRADE_AUDIT_MASTER.getKey());
			if (null == dic) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_133000006, "审计角色", EnumAuditRole.SECOND_GRADE_AUDIT_MASTER.getKey());
			}
			String utRoleName = dic.getName();
			
			
			// 按分组进行转发
			for (Entry<String, Object> entry : map.entrySet()) {
				Integer improveId = null;
				Set<UserDO> allTransmittedUsers = new HashSet<UserDO>();
				int i = 0;
				Collection<UserDO> users = null;
				for (CheckListDO checkList : (List<CheckListDO>)entry.getValue()) {
					if (i == 0) {
						String improveUnit = checkList.getImproveUnit();
						users = getUsersByImproveUnitAndRoleName(improveUnit, utRoleName, dpRoleName, true);
						improveId = checkList.getImprove().getId();
					}
					// 额外责任单位为空的时候才能转发
					if (null == checkList.getImproveUnit2()) {
						// 将之前转发的用户删除掉
						List<ImproveItemUserDO> improveItemUsers = improveItemUserDao.getByCheckListId(checkList.getId());
//						Set<ImproveItemUserDO> improveItemUsers = checkList.getImproveItemUsers();
						if (null != improveItemUsers) {
							improveItemUserDao.delete(improveItemUsers);
						}
						// 已被转发的用户
						List<UserDO> transmittedUsers = improveItemUserDao.getUsersByCheckListId(checkList.getId());
						allTransmittedUsers.addAll(transmittedUsers);
						for (UserDO user : users) {
							// 过滤掉已被转发的用户
							if (!transmittedUsers.contains(user)) {
//								ImproveItemUserDO improveItemUser = new ImproveItemUserDO();
//								improveItemUser.setCheckList(checkList);
//								improveItemUser.setUser(user);
								Map<String, Object> improveItemUserMap = new HashMap<String, Object>();
								improveItemUserMap.put("checkList", checkList.getId());
								improveItemUserMap.put("user", user.getId());
								improveItemUserDao.save(improveItemUserMap);
							}
						}
						// 状态 (整改转发)
						checkList.setImproveItemStatus(EnumImproveItemStatus.整改转发.getCode());
						this.update(checkList);

						// 添加活动日志 转发给users
						Map<String, Object> addLogMap = new HashMap<String, Object>();
						addLogMap.put("transmitUsers", users);
						this.addActivityLoggingForUpdate(checkList.getId(), addLogMap);
					}
					i++;
				}
				// 将improve下的主要责任单位下A3.2三级审计主管上传的签批件置空
				List<FileDO> files = fileDao.getFilesBySource(EnumFileType.IMPROVE_TRANSMITTED.getCode(), improveId);
				List<FileDO> deletedFiles = new ArrayList<FileDO>();
				for (FileDO file : files) {
					if (allTransmittedUsers.contains(file.getUploadUser())) {
						deletedFiles.add(file);
					}
				}
				fileDao.delete(deletedFiles);
				
//				this.sendTransmittedTodoMsg(improveId, users);
			}
		}
	}
	
	/**
	 * 根据责任单位和角色名查找对应的用户
	 * @param improveUnit
	 * @param utRole 安监机构时的角色
	 * @param dpRole 组织时的角色
	 * @param throwExceptionIfNoUser 查询不到用户时是否抛出异常
	 * @return
	 */
	// TODO
	@SuppressWarnings("unchecked")
	public Collection<UserDO> getUsersByImproveUnitAndRoleName(String improveUnit, String utRole, String dpRole, boolean throwExceptionIfNoUser){
		String improveUnitName = null;
		Collection<UserDO> users = null;
		if (null != improveUnit) {
			String unitType = improveUnit.replaceAll("[0-9]", "");
			Integer improveUnitId = Integer.parseInt(improveUnit.replaceAll("[a-zA-Z]", ""));
			if (AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP.equals(unitType)) { // 责任单位是组织时
				users = getUsersByOrganizationIdAndRoleName(improveUnitId, dpRole);
				// 与组织下的用户取交集
				if (null != users && !users.isEmpty()) {
					OrganizationDO organization = organizationDao.internalGetById(improveUnitId);
					if (null != organization && null != organization.getUsers()) {
						improveUnitName = organization.getName();
						users = CollectionUtils.intersection(users, organization.getUsers());
					}
				}
				// 没人时提示错误
				if (throwExceptionIfNoUser && (null == users || users.isEmpty())) {
					improveUnitName = improveUnitName == null ? improveUnit : improveUnitName;
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, improveUnitName + "下的" + dpRole + "角色没有设置人");
				}
			} else if (AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT.equals(unitType)) { // 责任单位是安监机构时
				UnitDO unit = unitDao.internalGetById(improveUnitId);
				if (null != unit) {
					improveUnitName = unit.getName();
				}
				users = unitRoleActorDao.getUsersByUnitIdAndRoleName(improveUnitId, utRole, null);
				// 没人时提示错误
				if (throwExceptionIfNoUser && (null == users || users.isEmpty())) {
					improveUnitName = improveUnitName == null ? improveUnit : improveUnitName;
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, improveUnitName + "下的" + utRole + "角色没有设置人");
				}
			}
		}
		
		return users;
	}
	
	/**
	 * 根据责任单位的list和角色名查找对应的用户
	 * @param improveUnit
	 * @param roleName
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public Collection<UserDO> getUsersByImproveUnitsAndRoleName(List<String> improveUnits, String roleName){
		Collection<UserDO> users = new HashSet<UserDO>();
		DictionaryDO dic = dictionaryDao.getByTypeAndKey("审计角色", EnumAuditRole.THIRD_GRADE_AUDIT_MASTER.getKey());
		if (null == dic) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_133000006, "审计角色", EnumAuditRole.THIRD_GRADE_AUDIT_MASTER.getKey());
		}
		if (null != improveUnits && !improveUnits.isEmpty()) {
			List<Integer> orgnanizationIds = new ArrayList<Integer>();
			List<Integer> unitIds = new ArrayList<Integer>();
			for (String improveUnit : improveUnits) {
				Integer improveUnitId = null;
				if (improveUnit.startsWith(AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP)) {
					improveUnitId = Integer.parseInt(improveUnit.replaceAll(AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP, ""));
					if (!orgnanizationIds.contains(improveUnitId)) {
						orgnanizationIds.add(improveUnitId);
					}
				} else if (improveUnit.startsWith(AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT)) {
					improveUnitId = Integer.parseInt(improveUnit.replaceAll(AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT, ""));
					if (!unitIds.contains(improveUnitId)) {
						unitIds.add(improveUnitId);
					}
				}
			}
			// 责任单位是组织时
			for (Integer orgnanizationId : orgnanizationIds) {
				List<UserDO> orgUsers = getUsersByOrganizationIdAndRoleName(orgnanizationId, dic.getName());
				// 与组织下的用户取交集
				if (null != orgUsers && !orgUsers.isEmpty()) {
					OrganizationDO organization = organizationDao.internalGetById(orgnanizationId);
					if (null != organization && null != organization.getUsers()) {
						users.addAll(CollectionUtils.intersection(orgUsers, organization.getUsers()));
					}
				}
			}
			// 责任单位是安监机构时
			users.addAll(unitRoleActorDao.getUsersByUnitIdsAndRoleName(unitIds, dic.getName(), null));
		}
		return users;
	}
	
	/**
	 * 根据整改单的id查询
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<CheckListDO> getByImproveId(Integer improveId){
		return (List<CheckListDO>) this.query("from CheckListDO t where t.deleted = false and t.improve.id = ?", improveId);
	}
	
	public List<UserDO> getUsersByOrganizationIdAndRoleName(Integer organizationId, String roleName){
		OrganizationDO organization = organizationDao.internalGetById(organizationId);
		if (null != organization && null != organization.getUnit()) {
			return unitRoleActorDao.getUsersByUnitIdAndRoleName(organization.getUnit().getId(), roleName, null);
		}
		return new ArrayList<UserDO>();
	}
	/**
	 * 等最后一条检查项验证完成以后给二级审计主管发消息，提交
	 * @param checklist
	 */
	public void sendMessageToErJiShenJiZhuGuan(CheckListDO checklist){
		ImproveDO improve = checklist.getImprove();
		if (improve != null){
			List<CheckListDO> checkLists = this.getByImproveId(improve.getId());
			int i = 0;
			for (CheckListDO cl : checkLists){
				if (cl.getImproveItemStatus() != EnumImproveItemStatus.验证通过.getCode() && cl.getImproveItemStatus() != EnumImproveItemStatus.暂时无法完成.getCode()){
					i++;
				}
			}
			if (i == 0){
				Set<ImproveFlowUserDO> flowUsers = improve.getFlowUsers();
				List<UserDO> receivers = new ArrayList<UserDO>();//接收人
				for (ImproveFlowUserDO ifu : flowUsers){
					if (ifu != null){
						receivers.add(ifu.getFlowUser());
					}
				}
				MessageDO message = new MessageDO();
				message.setSender(UserContext.getUser());
				message.setSendTime(new Date());
				message.setContent(improve.getTraceName() + "的检查项已验证完成，请及时结案整改单！");
				message.setTitle("系统性审计整改单验证完成通知");
				message.setLink(improve.getId().toString());
				message.setChecked(false);
				message.setSourceType("ERJIJIEAN");
				try {
					messageDao.sendMessageAndEmail(message, receivers);
				} catch (Exception e) {
					e.printStackTrace();
				}
				for (UserDO u : receivers) {
					AuditorDO a = auditorDao.getAuditorByUserId(u.getId());
					if (a != null) {
					ShortMessageDao shortMessageDao = (ShortMessageDao) SpringBeanUtils.getBean("shortMessageDao");
					ShortMessageDO shortMessage = new ShortMessageDO();
					shortMessage.setCreator(UserContext.getUser());
					shortMessage.setReceiveTel(a.getCellTel());
					shortMessage.setMsgContent("[验证完成通知]" + improve.getTraceName() + "的检查项已验证完成，请及时结案整改单！");
					shortMessageDao.internalSave(shortMessage);
					}
				}
			}
		}
	}
	/**
	 * 1、在一级审计经理分配验证人的时候给创建工作单的人发消息。2、验证人填写验证结论的时候给创建工作单的人发消息
	 * @param checklist
	 */
	public void sendMessageToCreateTaskAuthor(CheckListDO checklist, CheckListDO oldChecklist){
		ImproveDO improve = checklist.getImprove();
		TaskDO task = checklist.getTask();
		if (improve != null && task != null){
			if (checklist.getImproveItemStatus() == EnumImproveItemStatus.已指派.getCode() && checklist.getConfirmMan() != null){
				String[] confirmMan = checklist.getConfirmMan().split(",");
				List<UserDO> users = userDao.internalGetByIds(confirmMan);
				List<String> username = new ArrayList<String>();
				for (UserDO user : users){
					username.add(user.getFullname());
				}
				MessageDO message = new MessageDO();
				message.setSender(UserContext.getUser());
				message.setSendTime(new Date());
				message.setContent("【" + UserContext.getUser().getFullname() + "】" + "把" + checklist.getItemPoint() + "的验证人员指派为" + "【" + StringUtils.join(username, ",") + "】");
				message.setTitle("验证人指派结果通知");
				message.setLink(improve.getId().toString());
				message.setChecked(false);
				message.setSourceType("TRACE");
				message.setReceiver(task.getCreator());
				messageDao.internalSave(message);
			} else if (oldChecklist.getImproveItemStatus() == EnumImproveItemStatus.已指派.getCode() && checklist.getConfirmResult() != null){
				List<UserDO> users = professionUserDao.getYiJiShenJiJingLi();
				users.add(task.getCreator());
				MessageDO message = new MessageDO();
				message.setSender(UserContext.getUser());
				message.setSendTime(new Date());
				message.setContent("【" + UserContext.getUser().getFullname() + "】" + "把" + checklist.getItemPoint() + "的验证验证结论填写为" + "【" + checklist.getConfirmResult() + "】");
				message.setTitle("验证结论结果通知");
				message.setLink(improve.getId().toString());
				message.setChecked(false);
				if ("未通过".equals(checklist.getConfirmResult())){
					message.setSourceType("IMPROVE");
				} else if ("通过".equals(checklist.getConfirmResult()) || "暂时无法完成".equals(checklist.getConfirmResult())){
					message.setSourceType("TRACE");
				}
				messageDao.sendMessage(message, users);
			}
		}
	}
	/**
	 * 二级审计主管填写完成情况 提交给已经审计经理时，发消息和短信通知已经审计经理
	 * @param improve
	 */
	public void sendMessageToYiJiShenJiJingLi(ImproveDO improve, Integer checkListId) {
		CheckListDO checkList = this.internalGetById(checkListId);
		MessageDO message = new MessageDO();
		message.setSender(UserContext.getUser());
		message.setSendTime(new Date());
		message.setContent(checkList.getItemPoint());
		message.setTitle("待分配验证人员");
		message.setLink(improve.getId().toString());
		message.setChecked(false);
		message.setSourceType("TRACE");
		List<UserDO> yiJiShenJiJingLi = professionUserDao.getYiJiShenJiJingLi();
		messageDao.sendMessage(message, yiJiShenJiJingLi);
		//发短信
		ShortMessageDao shortMessageDao = (ShortMessageDao) SpringBeanUtils.getBean("shortMessageDao");
		for (UserDO u : yiJiShenJiJingLi) {
			AuditorDO a = auditorDao.getAuditorByUserId(u.getId());
			if (a != null) {
				ShortMessageDO shortMessage = new ShortMessageDO();
				shortMessage.setCreator(UserContext.getUser());
				shortMessage.setReceiveTel(a.getCellTel());
				shortMessage.setMsgContent("[待分配验证人员]"+checkList.getItemPoint());
				shortMessageDao.internalSave(shortMessage);
			}
		}
		
	}
	/**
	 * 一级审计经理分配验证人时给验证人发短信和站内消息
	 * @param improve
	 * @param checkListId
	 */
	public void sendMessageToYanZhengRen(String improveId, List<String> itemPoints, List<Integer> userIds) {
		MessageDO message = new MessageDO();
		message.setSender(UserContext.getUser());
		message.setSendTime(new Date());
		message.setContent("请尽量按时完成【"+StringUtils.join(itemPoints, "】，【")+"】检查，辛苦了！");
		message.setTitle("待验证检查要点");
		message.setLink(improveId);
		message.setChecked(false);
		message.setSourceType("TRACE");
		List<UserDO> receivers = userDao.getByIds(userIds);
		messageDao.sendMessage(message, receivers);
		//发短信
		ShortMessageDao shortMessageDao = (ShortMessageDao) SpringBeanUtils.getBean("shortMessageDao");
		for (UserDO u : receivers) {
			AuditorDO a = auditorDao.getAuditorByUserId(u.getId());
			if (a != null) {
				ShortMessageDO shortMessage = new ShortMessageDO();
				shortMessage.setCreator(UserContext.getUser());
				shortMessage.setReceiveTel(a.getCellTel());
				shortMessage.setMsgContent("[待验证检查要点]"+"请尽量按时完成【"+StringUtils.join(itemPoints, "】，【")+"】检查，辛苦了！");
				shortMessageDao.internalSave(shortMessage);
			}
		}
		
	}
	
	/**
	 * 提交整改转发<br>
	 * 原因、措施、整改责任人必填，签批件必须上传，提交后将状态改为"措施制定"将不是由提交人上传的附件删除<br>
	 * 给整改单的当前处理人发送通知
	 * @throws Exception 
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void commitImproveRecord(String idsStr) throws Exception{
		if (!StringUtils.isBlank(idsStr)) {
			String[] ids = gson.fromJson(idsStr, String[].class);
			List<CheckListDO> checkLists = this.internalGetByIds(ids);
			if (!checkLists.isEmpty()) {
				boolean hasFile = false;
				// 责任单位是组织时取主要责任单位下A3.2三级审计主管
				DictionaryDO dic = dictionaryDao.getByTypeAndKey("审计角色", EnumAuditRole.THIRD_GRADE_AUDIT_MASTER.getKey());
				if (null == dic) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_133000006, "审计角色", EnumAuditRole.THIRD_GRADE_AUDIT_MASTER.getKey());
				}
				String dpRoleName = dic.getName(); 
				// 责任单位是安监机构时取主要责任单位下A2.2二级审计主管
				dic = dictionaryDao.getByTypeAndKey("审计角色", EnumAuditRole.SECOND_GRADE_AUDIT_MASTER.getKey());
				if (null == dic) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_133000006, "审计角色", EnumAuditRole.SECOND_GRADE_AUDIT_MASTER.getKey());
				}
				String utRoleName = dic.getName();
				Collection<UserDO> users = this.getUsersByImproveUnitAndRoleName(checkLists.get(0).getImproveUnit(), utRoleName, dpRoleName, false);
				List<FileDO> transmittedFiles = fileDao.getFilesBySource(EnumFileType.IMPROVE_TRANSMITTED.getCode(), checkLists.get(0).getImprove().getId());
				for (FileDO file : transmittedFiles) {
					// 上传者是当前用户且当前用户是主要责任单位下是A3.2三级审计主管时
					if (UserContext.getUser().equals(file.getUploadUser()) && users.contains(UserContext.getUser())) {
						hasFile = true;
					} else {
						// 将其他人上传的附件删除
//						file.setDeleted(true);
//						fileDao.update(file);
					}
				}
				if (!hasFile) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "当前用户没有上传签批件，无法提交！");
				}
			}

			for (CheckListDO checkList : checkLists) {
				// 整改说明原因
				String improveReason = checkList.getImproveReason();
				// 整改措施
				String improveMeasure = checkList.getImproveMeasure();
				// 整改责任人
				String improveResponsiblePerson = checkList.getImproveResponsiblePerson();
				// 原因、措施、整改责任人必填
				if (StringUtils.isBlank(improveReason) || StringUtils.isBlank(improveMeasure) || StringUtils.isBlank(improveResponsiblePerson)) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, checkList.getItemPoint() + "的整改说明原因或整改措施或整改责任人未填写，无法提交！");
				}
				// 将列表里其他人上传的附件删除
//				List<FileDO> files = fileDao.getFilesBySource(EnumFileType.IMPROVE_ITEM.getCode(), checkList.getId());
//				for (FileDO file : files) {
//					if (UserContext.getUser().equals(file.getUploadUser())) {
//					} else {
//						// 将其他人上传的附件删除
//						file.setDeleted(true);
//						fileDao.update(file);
//					}
//				}
				
				// 状态设置成"措施制定"
				checkList.setImproveItemStatus(EnumImproveItemStatus.措施制定.getCode());
				this.update(checkList);
				
				// 删除处理人
//				Set<ImproveItemUserDO> improveItemUsers = checkList.getImproveItemUsers();
//				if (null != improveItemUsers) {
//					improveItemUserDao.delete(improveItemUsers);
//				}
			}
			
			if (!checkLists.isEmpty()) {
				ImproveDO improve = checkLists.get(0).getImprove();
				// 给当前处理人发送通知
				MessageDO message = new MessageDO();
				message.setLink(improve.getId().toString());
				message.setChecked(false);
				message.setSender(UserContext.getUser());
				message.setSendTime(new Timestamp(System.currentTimeMillis()));
				message.setTitle("审计整改单转发提交通知");
				message.setContent("整改单编号：" + improve.getImproveNo() + "  整改名称：" + checkLists.get(0).getImprove().getImproveName());
				message.setSourceType("IMPROVE_TRANSMIT_COMMIT");
				// 当前处理人
				List<UserDO> users = improveFlowUserDao.getUsersByImprove(improve.getId());
//				messageDao.sendMessageAndEmail(message, users);
			}
		}
	}
	
	public Integer updateAndCloneCheckList(Integer id, Map<String, Object> map) {
		Integer addedId = null;
		// 复制一份
		// 默认是符合项
		CheckListDO checkList = this.internalGetById(id);
		DictionaryDO auditResult = dictionaryDao.getByTypeAndName("审计结论", EnumAuditResult.符合项.toString());
		if (null == auditResult) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "系统字典中没有配置类型为[审计结论],名称为[" + EnumAuditResult.符合项.toString() + "]的记录！");
		}
		Date currentDate = new Date();
		CheckListDO newCheckList = new CheckListDO();
		newCheckList.setAuditResult(auditResult);
		newCheckList.setItem(checkList.getItem());// 保存章节的id
		newCheckList.setItemPoint(checkList.getItemPoint()); // 要点
		newCheckList.setItemAccording(checkList.getItemAccording());
		newCheckList.setItemPrompt(checkList.getItemPrompt());
		newCheckList.setItemValue(checkList.getItemValue());
		newCheckList.setItemProfession(checkList.getItemProfession());
		newCheckList.setCheck(checkList.getCheck());
		newCheckList.setTask(checkList.getCheck().getTask());
		newCheckList.setCreated(currentDate);
		newCheckList.setLastUpdate(currentDate);
		newCheckList.setCreator(UserContext.getUser());
		newCheckList.setLastUpdater(UserContext.getUser());
		addedId = (Integer) this.internalSave(newCheckList);
		map.remove("clone");
		// 更新
		this.update(id, map);
		return addedId;
	}
	
	public Integer getImproveItemStatusGetById(Integer id) {
		@SuppressWarnings("unchecked")
		List<Integer> status = (List<Integer>) this.query("select t.improveItemStatus from CheckListDO t where t.id = ?", id);
		if(status.isEmpty()){
			return null;
		}
		return status.get(0);
	}
	
	@Override
	protected void afterUpdate(CheckListDO obj, CheckListDO dbObj) {
//		sendMessageToErJiShenJiZhuGuan(obj);
//		sendMessageToCreateTaskAuthor(obj,dbObj);
		
		// 发送整改提醒短信
//		this.startSendImproveShortMsgJob(obj, dbObj);
		
		// 关闭发送整改提醒短信
//		this.closeSendImproveShortMsgJob(obj, dbObj);
	}
	
	/**
	 * 发送整改提醒短信
	 * @param newCheckList
	 * @param oldCheckList
	 */
	public void startSendImproveShortMsgJob(CheckListDO newCheckList, CheckListDO oldCheckList) {
		Scheduler scheduler;
		try {
			// 当填写了整改期限时，启动整改期限到期前3天每天早上9点发短信的job，直到整改完成
			if (null != newCheckList.getImproveLastDate() && !newCheckList.getImproveLastDate().equals(oldCheckList.getImproveLastDate())) {
				scheduler = StdSchedulerFactory.getDefaultScheduler();
				this.sendImproveShortMsg(scheduler, newCheckList);
			}
		} catch (Exception e) {
			e.printStackTrace();
			log.warn("发送整改提醒短信失败！" + e.getMessage(), e);
		}
	}
	
	public void sendImproveShortMsg(Scheduler scheduler, CheckListDO checkList) {
		if (null != checkList.getImprove() && StringUtils.isNotBlank(config.getCronExpForSendImproveShortMsg())) {
			// 整改期限到期前多少天进行提醒
			Integer dayOfSendImproveShortMsg = null;
			try {
				dayOfSendImproveShortMsg = Integer.parseInt(config.getDayOfSendImproveShortMsg());
			} catch(Exception e) {
				e.printStackTrace();
				dayOfSendImproveShortMsg = DAY_OF_SEND_IMPROVE_SHORT_MSG;
			}
			Calendar cal = DateHelper.getCalendar();
			cal.setTime(checkList.getImproveLastDate());
			cal.add(Calendar.DATE, -dayOfSendImproveShortMsg);
			List<UserDO> users = improveFlowUserDao.getUsersByImprove(checkList.getImprove().getId());
			// 接收人电话号码
			Collection<String> cellTels = auditorDao.getCellTelByUsers(users);
			// 短信类容
			String content = "您有整改单的整改问题列表没有完成, 请登录系统填写。";
			JobUtils.createCron(scheduler, NAME_PREFIX + checkList.getId(), GROUP, CronSendImproveShortMsgJob.class, CRON_EXP_FOR_SEND_IMPROVE_SHORT_MSG, config.getCronExpForSendImproveShortMsg(), cal.getTime(), null, "content", content, "cellTels", cellTels);
		}
	}
	
	public void sendImproveShortMsg(Scheduler scheduler) {
		// 查询出填写了整改期限但还没有整改完成的数据
		@SuppressWarnings("unchecked")
		List<CheckListDO> checkLists = (List<CheckListDO>) this.query("from CheckListDO t where t.deleted = false and t.improveLastDate is not null and t.improveDate is null and t.task.deleted = false and t.improve.deleted = false and t.task.plan.deleted = false");
		for (CheckListDO checkList : checkLists) {
			this.sendImproveShortMsg(scheduler, checkList);
		}
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void sendImproveShortMsg(Integer checkListId, Collection<String> cellTels) {
		if (null != checkListId) {
			ImproveDO improve = improveDao.getByCheckListId(checkListId);
			if (null != improve) {
				// 短信类容
				String content = "您有整改单的整改问题列表没有完成, 请登录系统填写。整改单编号:[" + improve.getImproveNo() + "]";
				shortMessageDao.save(content, cellTels);
			}
		}
	}
	
	/**
	 * 关闭发送整改短信的job
	 */
	private void closeSendImproveShortMsgJob(CheckListDO newCheckList, CheckListDO oldCheckList) {
		// 当状态变成整改完成则关闭该job
		if (null != newCheckList.getImproveItemStatus() && EnumImproveItemStatus.整改完成.getCode() == newCheckList.getImproveItemStatus() && !newCheckList.getImproveItemStatus().equals(oldCheckList.getImproveItemStatus())) {
			// 关闭对应的job
			Scheduler scheduler;
			try {
				scheduler = StdSchedulerFactory.getDefaultScheduler();
				scheduler.unscheduleJob(NAME_PREFIX + newCheckList.getId() + JobUtils.NAME_SUFIX_TRIGGER, GROUP);
			} catch (SchedulerException e) {
				e.printStackTrace();
				log.error("关闭job[" + NAME_PREFIX + newCheckList.getId() + "]失败: " + e.getMessage(), e);
			}
		}
	}
	
	/**
	 * 发送转发待办的信息
	 * @param id
	 * @param userIds
	 */
	public void sendTransmittedTodoMsg(Integer improveId, Collection<UserDO> users) {
		ImproveDO improve = improveDao.internalGetById(improveId);
		String content = "您有一份转发整改单需要处理。名称[" + improve.getDisplayName() + "], 详情请看待我处理的审计任务看板。";
		Collection<String> cellTels = auditorDao.getCellTelByUsers(users);
		shortMessageDao.save(content, cellTels);
	}
	
	/**
	 * 获取整改问题的某个时间字段与当前时间的间隔天数符合条件的数据<br>
	 * 时间间隔=dateFieldName - 当前时间
	 * @param dateFieldName 时间字段
	 * @param intervalDays 间隔的天数
	 * @param statuses 状态的列表
	 * @return
	 */
	@SuppressWarnings("unchecked")
	private List<Map<String, Object>> getCheckListIntervalDays(String dateFieldName, List<Double> intervalDays, List<Integer> statuses) {
		StringBuffer dateItervalHql = new StringBuffer();
		dateItervalHql.append(" trunc(trunc(t.");
		dateItervalHql.append(dateFieldName);
		dateItervalHql.append(")-");
		dateItervalHql.append("trunc(sysdate)) + 1");
		
		StringBuffer hql = new StringBuffer("select new Map(t as checkList,");
		hql.append(dateItervalHql);
		hql.append(" as intervalDays) from CheckListDO t where t.deleted = false and t.task.deleted = false and t.improve.deleted = false and t.check.deleted = false and t.task.plan.deleted = false and ");
		hql.append(dateItervalHql);
		hql.append(" in (:intervalDays)");
		List<String> params = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		params.add("intervalDays");
		values.add(intervalDays);
		if (statuses != null && !statuses.isEmpty()) {
			hql.append(" and t.improveItemStatus in (:statuses)");
			params.add("statuses");
			values.add(statuses);
		}
		return (List<Map<String, Object>>) this.query(hql.toString(), params.toArray(new String[0]), values.toArray());
	}
	
	/**
	 * 发送整改单问题执行的通知
	 */
	public void sendExecuteNotice() {
		// 待执行的状态
		List<Integer> statuses = Arrays.asList(new Integer[]{EnumImproveItemStatus.预案通过.getCode()});
		List<Map<String, Object>> list = this.getCheckListIntervalDays("improveLastDate", Arrays.asList(new Double[]{1.0, 7.0, 15.0}), statuses);
		for (Map<String, Object> map : list) {
			Double intervalDays = (Double) map.get("intervalDays");
			CheckListDO checkList = (CheckListDO) map.get("checkList");
			StringBuffer content = new StringBuffer();
			content.append("您有一条整改问题待执行！剩余");
			content.append(intervalDays.intValue());
			content.append("天！请登录SMS系统查看！");
			List<UserDO> user = improveFlowUserDao.getUsersByImprove((checkList.getImprove().getId()));
			if (user != null && !user.isEmpty()) {
				messageDao.saveTodoMsg(Arrays.asList(new EnumMessageCatagory[]{EnumMessageCatagory.SHORT_MESSAGE}), null, user, null, content.toString(), checkList.getId(), "CHECK_LIST");
			}
		}
	}
	
	/**
	 * 启动发送整改通知单问题执行的通知的定时任务
	 */
	public void sendExecuteNoticeScheduler(Scheduler scheduler){
		if (StringUtils.isNotBlank(cronForSendingExecuteNotice)) {
			JobUtils.createCron(scheduler, "sendExecuteNotice", "checkList", CronSendCheckListExecuteNoticeJob.class, null, cronForSendingExecuteNotice);
		}
	}
	
	public void setCheckDao(CheckDao checkDao) {
		this.checkDao = checkDao;
	}

	public void setItemDao(ItemDao itemDao) {
		this.itemDao = itemDao;
	}

	public void setActionItemDao(ActionItemDao actionItemDao) {
		this.actionItemDao = actionItemDao;
	}

	public void setOrganizationDao(OrganizationDao organizationDao) {
		this.organizationDao = organizationDao;
	}

	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}

	public void setDictionaryDao(DictionaryDao dictionaryDao) {
		this.dictionaryDao = dictionaryDao;
	}


	public void setWorkflowService(WorkflowService workflowService) {
		this.workflowService = workflowService;
	}


	public void setFileDao(FileDao fileDao) {
		this.fileDao = fileDao;
	}

	public void setAuditActivityLoggingDao(
			AuditActivityLoggingDao auditActivityLoggingDao) {
		this.auditActivityLoggingDao = auditActivityLoggingDao;
	}

	public void setFileService(FileService fileService) {
		this.fileService = fileService;
	}

	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}

	public void setImproveDao(ImproveDao improveDao) {
		this.improveDao = improveDao;
	}

	public void setProfessionUserDao(ProfessionUserDao professionUserDao) {
		this.professionUserDao = professionUserDao;
	}

	public void setImproveItemUserDao(ImproveItemUserDao improveItemUserDao) {
		this.improveItemUserDao = improveItemUserDao;
	}

	public void setUnitRoleActorDao(UnitRoleActorDao unitRoleActorDao) {
		this.unitRoleActorDao = unitRoleActorDao;
	}

	public void setImproveNoticeDao(ImproveNoticeDao improveNoticeDao) {
		this.improveNoticeDao = improveNoticeDao;
	}

	public void setMessageDao(MessageDao messageDao) {
		this.messageDao = messageDao;
	}

	public void setImproveFlowUserDao(ImproveFlowUserDao improveFlowUserDao) {
		this.improveFlowUserDao = improveFlowUserDao;
	}

	public void setTaskDao(TaskDao taskDao) {
		this.taskDao = taskDao;
	}

	public void setAuditorDao(AuditorDao auditorDao) {
		this.auditorDao = auditorDao;
	}

	public void setShortMessageDao(ShortMessageDao shortMessageDao) {
		this.shortMessageDao = shortMessageDao;
	}

	public void setCronForSendingExecuteNotice(String cronForSendingExecuteNotice) {
		this.cronForSendingExecuteNotice = cronForSendingExecuteNotice;
	}
}
