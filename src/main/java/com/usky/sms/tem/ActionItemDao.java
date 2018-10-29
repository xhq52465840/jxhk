
package com.usky.sms.tem;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.time.DateUtils;
import org.apache.log4j.MDC;
import org.quartz.Scheduler;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.activity.ActivityDao;
import com.usky.sms.common.DateHelper;
import com.usky.sms.common.NumberHelper;
import com.usky.sms.common.StringHelper;
import com.usky.sms.config.Config;
import com.usky.sms.constant.EnumMessageCatagory;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.eventanalysis.EventAnalysisDO;
import com.usky.sms.eventanalysis.EventAnalysisDao;
import com.usky.sms.file.EnumFileType;
import com.usky.sms.file.FileDO;
import com.usky.sms.file.FileDao;
import com.usky.sms.job.CronSendActionItemExecuteNoticeJob;
import com.usky.sms.job.JobUtils;
import com.usky.sms.log.ActivityLoggingDao;
import com.usky.sms.log.operation.ActivityLoggingOperationRegister;
import com.usky.sms.message.MessageDao;
import com.usky.sms.organization.OrganizationDO;
import com.usky.sms.organization.OrganizationDao;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.risk.ClauseDao;
import com.usky.sms.risk.RiskTaskSettingDao;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;

public class ActionItemDao extends BaseDao<ActionItemDO> {
	
	/** {@value} */
	public static final String ACTION_ITEM_STATUS_DRAFT = "草稿";
	
	/** {@value} */
	public static final String ACTION_ITEM_STATUS_EXECUTE_WAITING = "待执行";
	
	/** {@value} */
	public static final String ACTION_ITEM_STATUS_COMFIRM_WAITING = "待验证";
	
	/** {@value} */
	public static final String ACTION_ITEM_STATUS_CONFIRM_REJECTED = "待执行(验证拒绝)";
	
	/** {@value} */
	public static final String ACTION_ITEM_STATUS_AUDIT_REJECTED = "待执行(审核拒绝)";
	
	/** {@value} */
	public static final String ACTION_ITEM_STATUS_AUDIT_WAITING = "待审核";
	
	/** {@value} */
	public static final String ACTION_ITEM_STATUS_COMPLETE = "完成";
	
	/** 发送执行通知的cron表达式 */
	private String cronForSendingExecuteNotice;
	
	private Config config; 
	
//	public static final String ACTION_ITEM_STATUS_INCOMPLETE = "未完成";
	
	public static final SMSException DELETE_COMPLETE_ACTION_ITEM = new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "不能删除非草稿的行动项！");
	
	@Autowired
	private ActivityDao activityDao;
	
	@Autowired
	private ClauseDao clauseDao;
	
	@Autowired
	private ControlMeasureDao controlMeasureDao;
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	
	@Autowired
	private ActionItemCommentDao actionItemCommentDao;
	
	@Autowired
	private EventAnalysisDao eventAnalysisDao;
	
	@Autowired
	private FileDao fileDao;
	
	@Autowired
	private ActionItemOperationDao actionItemOperationDao;
	
	@Autowired
	private OrganizationDao organizationDao;
	
	@Autowired
	private ActivityLoggingDao activityLoggingDao;
	
	@Autowired
	private RiskTaskSettingDao riskTaskSettingDao;
	
	@Autowired
	private UserDao userDao;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private MessageDao messageDao;
	
	public ActionItemDao() {
		super(ActionItemDO.class);
		config = Config.getInstance();
	}
	
	@Override
	protected String getBaseHql(Map<String, Object> map) {
		String baseHql = "select distinct t from " + clazz.getSimpleName() + " t left join t.processors p left join t.confirmMan c left join t.auditor a left join t.organizations o where t.deleted = false and t.id in (select actionItem from ActionItemActivityDO) and (";
		// 是否带权限的查询
		boolean permittedQuery = false;
		@SuppressWarnings("unchecked")
		List<List<Map<String, Object>>> ruleList = (List<List<Map<String, Object>>>) map.get("rule");
		for (List<Map<String, Object>> list : ruleList) {
			Iterator<Map<String, Object>> it = list.iterator();
			while (it.hasNext()) {
				Map<String, Object> paramMap = it.next();
				if ("permittedQuery".equals(paramMap.get("key"))) {
					it.remove();
					permittedQuery = true;
					break;
				}
			}
			if (permittedQuery) break;
		}
		if (permittedQuery) {
			List<Integer> unitIds = unitDao.getUnitIds(PermissionSets.VIEW_UNIT.getName());
			if (unitIds.isEmpty()) {
				baseHql = baseHql + "1 = 2 and ";
			} else {
				baseHql = baseHql + "o.unit in (" + StringUtils.join(unitIds, ",") + ") and ";
			}
		}
		return baseHql;
	}
	
	@SuppressWarnings("unchecked")
	@Override
	protected Object getQueryParamValue(String key, Object value) {
		if ("id".equals(key) || "processors.id".equals(key) || "confirmMan.id".equals(key) || "auditor.id".equals(key) || "organizations.id".equals(key) || "creator.id".equals(key) || "lastUpdater.id".equals(key)
			|| "measure.id".equals(key) || "clause.id".equals(key) || "eventAnalysis.id".equals(key) || "organizations.unit.id".equals(key) || "systemAnalysisClause.id".equals(key)) {
			if (null == value) {
				return null;
			}
			if (value instanceof Collection || value instanceof Object[]) {
				List<Integer> resultList = new ArrayList<Integer>();
				if (value instanceof Collection) {
					for (Object o : (Collection<Object>) value) {
						resultList.add((Integer) getQueryParamValue(key, o));
					}
				} else {
					for (Object o : (Object[]) value) {
						resultList.add((Integer) getQueryParamValue(key, o));
					}
				}
				return resultList;
			} else if (value instanceof Number) {
				return ((Number) value).intValue();
			}
			return (NumberHelper.toInteger((String) value));
		}
		if ("remainingDays".equals(key)) {
			Integer remainingDays = ((Number) value).intValue();
			return DateUtils.addDays(DateHelper.getIniDate(new Date()), remainingDays);
		}
		return super.getQueryParamValue(key, value);
	}
	
	@Override
	protected String getQueryParamName(String key) {
		if ("processors.id".equals(key)) {
			return "p.id";
		}
		if ("confirmMan.id".equals(key)) {
			return "c.id";
		}
		if ("auditor.id".equals(key)) {
			return "a.id";
		}
		if ("organizations.id".equals(key)) {
			return "o.id";
		}
		if ("organizations.unit.id".equals(key)) {
			return "o.unit.id";
		}
		return super.getQueryParamName(key);
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		ActionItemDO actionItem = (ActionItemDO) obj;
		if (multiple) {
			if ("id".equals(field.getName())) {
				ActivityDO activity = this.getActivityByActionItem(actionItem);
				map.put("activity", activity == null ? null : activity.getId());
				map.put("activitySummary", activity == null ? null : activity.getSummary());
				map.put("activityNo", activity == null ? null : activity.getUnit().getCode() + "-" + activity.getNum());
				super.setField(map, obj, claz, multiple, field);
				return;
			} else if ("organizations".equals(field.getName())) {
				List<Map<String, Object>> orgMaps = new ArrayList<Map<String,Object>>();
				List<OrganizationDO> orgs = actionItem.getOrganizations();
				if (orgs != null) {
					for (OrganizationDO org : orgs) {
						Map<String, Object> orgMap = new HashMap<String, Object>();
						orgMap.put("id", org.getId());
						orgMap.put("name", organizationDao.getFullPathOfOrganization(org));
						orgMaps.add(orgMap);
					}
				}
				map.put("organizations", orgMaps);
				return;
			} else if ("auditor".equals(field.getName())) {
				if (actionItem.getAuditor() != null) {
					map.put("auditor", userDao.convert(new ArrayList<UserDO>(actionItem.getAuditor()), Arrays.asList(new String[]{"id", "username", "fullname", "avatar"}), false));
					return;
				}
			} else if ("processors".equals(field.getName())) {
				if (actionItem.getProcessors() != null) {
					map.put("processors", userDao.convert(new ArrayList<UserDO>(actionItem.getProcessors()), Arrays.asList(new String[]{"id", "username", "fullname", "avatar"}), false));
					return;
				}
			}
		}
		if ("confirmMan".equals(field.getName())) {
			if (actionItem.getConfirmMan() != null) {
				map.put("confirmMan", userDao.convert(new ArrayList<UserDO>(actionItem.getConfirmMan()), Arrays.asList(new String[]{"id", "username", "fullname", "avatar"}), false));
				return;
			}
		}
		super.setField(map, obj, claz, multiple, field);
	}
	
	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple, boolean showExtendFields) {
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
//		if (showExtendFields) {
//			ClauseDO clause = ((ActionItemDO) obj).getClause();
//			if (clause == null) return;
//			map.put("risk", clause.getThreat() != null ? clause.getThreat().getAnalysis().getRisk().getId() : clause.getError().getAnalysis().getRisk().getId());
//		}
		ActionItemDO actionItem = (ActionItemDO) obj;
		// 执行逾期天数(完成日期-执行到期日)
		Long completionOverdueDays = DateHelper.getIntervalDays(actionItem.getCompletionDeadLine(), actionItem.getCompletionDate() == null ? new Date() : actionItem.getCompletionDate());
		map.put("completionOverdueDays", completionOverdueDays == null || completionOverdueDays <= 0 ? null : completionOverdueDays);
		// 验证逾期天数(验证日期-验证到期日)
		Long confirmOverdueDays = DateHelper.getIntervalDays(actionItem.getConfirmDeadLine(), actionItem.getConfirmDate() == null ? new Date() : actionItem.getConfirmDate());
		map.put("confirmOverdueDays", confirmOverdueDays == null || confirmOverdueDays <= 0 ? null : confirmOverdueDays);
		// 审核逾期天数(审核日期-审核到期日)
		Long auditOverdueDays = DateHelper.getIntervalDays(actionItem.getAuditDeadLine(), actionItem.getAuditDate() == null ? new Date() : actionItem.getAuditDate());
		map.put("auditOverdueDays", auditOverdueDays == null || auditOverdueDays <= 0 ? null : auditOverdueDays);
	}
	
	@Override
	protected void afterGetList(List<Map<String, Object>> list, Map<String, Object> paramMap,
			Map<String, Object> searchMap, List<String> orders) {
		List<Integer> ids = new ArrayList<Integer>();
		for (Map<String, Object> map : list) {
			ids.add((Integer) map.get("id"));
		}
		// 验证的文件
		List<Map<String, Object>> confirmFileMaps = fileDao.convert(fileDao.getFilesBySources(EnumFileType.ACTION_ITEM_CONFIRM.getCode(), ids), false);
		// 验证的文件按source分组
		Map<Integer, Object> confirmFilesGroupMap = this.groupFileMaps(confirmFileMaps);
		// 执行的文件
		List<Map<String, Object>> executeFileMaps = fileDao.convert(fileDao.getFilesBySources(EnumFileType.ACTION_ITEM_EXECUTE.getCode(), ids), false);
		// 执行的文件按source分组
		Map<Integer, Object> executeFilesGroupMap = this.groupFileMaps(executeFileMaps);
		
		// 将分组好的file挂到问题列表中
		for (Map<String, Object> map : list) {
			map.put("confirmFiles", confirmFilesGroupMap.get((Integer) map.get("id")));
			map.put("executeFiles", executeFilesGroupMap.get((Integer) map.get("id")));
		}
		super.afterGetList(list, paramMap, searchMap, orders);
	}
	
	@SuppressWarnings("unchecked")
	private Map<Integer, Object> groupFileMaps(List<Map<String, Object>> fileMaps) {
		// file按source分组
		Map<Integer, Object> groupMap = new HashMap<Integer, Object>();
		for (Map<String, Object> fileMap : fileMaps) {
			Integer source = (Integer) fileMap.get("source");
			List<Map<String, Object>> groupList = null;
			if (groupMap.containsKey(source)) {
				groupList = (List<Map<String, Object>>) groupMap.get(source);
				groupList.add(fileMap);
			} else {
				groupList = new ArrayList<Map<String,Object>>();
				groupList.add(fileMap);
				groupMap.put(source, groupList);
			}
		}
		return groupMap;
	}
	
	@Override
	public void afterGetList(Map<String, Object> map, Map<String, Object> ruleMap) {
	}
	
	/**
	 * 获取待办的统计
	 * @param userId
	 * @return
	 */
	public List<Map<String, Long>> getToDoStatistics(Integer userId, Map<String, Object> ruleMap) {
		StringBuffer hql = new StringBuffer();
		List<String> paramNames = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		hql.append("select new Map(temp_ai.status as status, count(*) as count) from ActionItemDO temp_ai left join temp_ai.processors temp_p where temp_ai.deleted = false and temp_p.id = :processorId");
		paramNames.add("processorId");
		values.add(userId);
		if (ruleMap != null) {
			hql.append(" and temp_ai in (");
			String generateHql = this.generateHql(ruleMap, null, null, paramNames, values);
			// 去除 order by语句
			generateHql = StringUtils.substringBeforeLast(generateHql, "order by");
			hql.append(generateHql);
			hql.append(")");
		}
		hql.append(" group by temp_ai.status");
		
		@SuppressWarnings("unchecked")
		List<Map<String, Long>> maps = (List<Map<String, Long>>) this.query(hql.toString(), paramNames.toArray(new String[0]), values.toArray());
		
		return maps;
	}
	
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	protected boolean beforeSave(Map<String, Object> map) {
		// 初始状态
		map.put("status", ACTION_ITEM_STATUS_DRAFT);
		return true;
	}
	
	@Override
	protected void afterSave(ActionItemDO actionItem) {
		if (actionItem.getMeasure() != null) {
			controlMeasureDao.setControlMeasureStatus(actionItem.getMeasure().getId(), ControlMeasureDao.CONTROL_MEASURE_STATUS_UNPUBLISHED);
		} else if (actionItem.getClause() != null) {
			clauseDao.setClauseStatus(actionItem.getClause().getId(), ClauseDao.CLAUSE_STATUS_UNPUBLISHED);
		} else if (actionItem.getEventAnalysis() != null) {
			EventAnalysisDO eventAnalysis = eventAnalysisDao.internalGetById(actionItem.getEventAnalysis().getId());
			eventAnalysis.setActionItem(actionItem);
			eventAnalysisDao.internalUpdate(eventAnalysis);
			actionItem.setEventAnalysis(eventAnalysis);
		}
		// 添加活动日志
		addActivityLoggingForUpdateActionItem(actionItem, null);
	}

	@SuppressWarnings("unchecked")
	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		if (map.containsKey("eventAnalysis") && map.get("eventAnalysis") != null) {
			// 保存事件分析
			Map<String, Object> eventAnalysis = (Map<String, Object>) map.get("eventAnalysis");
			int eventAnalysisId = ((Number) eventAnalysis.remove("id")).intValue();
			eventAnalysisDao.update(eventAnalysisId, eventAnalysis);
			map.remove("eventAnalysis");
		}
		// 添加操作记录
		this.addOperation(id, (String) map.get("status"));
	}
	

	@Override
	protected void afterUpdate(ActionItemDO actionItem, ActionItemDO dbActionItem) {
		if (!actionItem.getStatus().equals(dbActionItem.getStatus())) {
			if (actionItem.getMeasure() != null) {
				int controlMeasureId = actionItem.getMeasure().getId();
				if (ACTION_ITEM_STATUS_COMPLETE.equals(actionItem.getStatus())) {
					// 所有行动项都完成，设置成落实
					List<ActionItemDO> actionItems = this.getActionItems(controlMeasureId, null, new String[] { ACTION_ITEM_STATUS_DRAFT, ACTION_ITEM_STATUS_EXECUTE_WAITING, ACTION_ITEM_STATUS_COMFIRM_WAITING, ACTION_ITEM_STATUS_AUDIT_WAITING, ACTION_ITEM_STATUS_AUDIT_REJECTED, ACTION_ITEM_STATUS_CONFIRM_REJECTED }, false);
					if (actionItems.isEmpty()) controlMeasureDao.setControlMeasureStatus(controlMeasureId, ControlMeasureDao.CONTROL_MEASURE_STATUS_COMPLETE);
				} else if (ACTION_ITEM_STATUS_EXECUTE_WAITING.equals(actionItem.getStatus()) || 
						ACTION_ITEM_STATUS_CONFIRM_REJECTED.equals(actionItem.getStatus()) || 
						ACTION_ITEM_STATUS_AUDIT_REJECTED.equals(actionItem.getStatus()) || 
						ACTION_ITEM_STATUS_COMFIRM_WAITING.equals(actionItem.getStatus()) || 
						ACTION_ITEM_STATUS_AUDIT_WAITING.equals(actionItem.getStatus())) {
					List<ActionItemDO> actionItems = this.getActionItems(controlMeasureId, null, new String[] { ACTION_ITEM_STATUS_DRAFT }, false);
					if (actionItems.isEmpty()) controlMeasureDao.setControlMeasureStatus(controlMeasureId, ControlMeasureDao.CONTROL_MEASURE_STATUS_INCOMPLETE);
				}
			} else if (actionItem.getClause() != null) {
				int clauseId = actionItem.getClause().getId();
				if (ACTION_ITEM_STATUS_COMPLETE.equals(actionItem.getStatus())) {
					List<ActionItemDO> actionItems = this.getActionItems(null, clauseId, new String[] { ACTION_ITEM_STATUS_DRAFT, ACTION_ITEM_STATUS_EXECUTE_WAITING, ACTION_ITEM_STATUS_COMFIRM_WAITING, ACTION_ITEM_STATUS_AUDIT_WAITING, ACTION_ITEM_STATUS_AUDIT_REJECTED, ACTION_ITEM_STATUS_CONFIRM_REJECTED }, false);
					if (actionItems.isEmpty()) clauseDao.setClauseStatus(clauseId, ClauseDao.CLAUSE_STATUS_COMPLETE);
				} else if (ACTION_ITEM_STATUS_EXECUTE_WAITING.equals(actionItem.getStatus()) || 
						ACTION_ITEM_STATUS_CONFIRM_REJECTED.equals(actionItem.getStatus()) || 
						ACTION_ITEM_STATUS_AUDIT_REJECTED.equals(actionItem.getStatus()) || 
						ACTION_ITEM_STATUS_COMFIRM_WAITING.equals(actionItem.getStatus()) || 
						ACTION_ITEM_STATUS_AUDIT_WAITING.equals(actionItem.getStatus())) {
					List<ActionItemDO> actionItems = this.getActionItems(null, clauseId, new String[] { ACTION_ITEM_STATUS_DRAFT }, false);
					if (actionItems.isEmpty()) clauseDao.setClauseStatus(clauseId, ClauseDao.CLAUSE_STATUS_INCOMPLETE);
				}
			}
		}
		// 状态改变后发送通知给处理人
		this.sendTodoMsg(actionItem, dbActionItem);
		
		// 添加活动日志
		addActivityLoggingForUpdateActionItem(actionItem, dbActionItem);
	}

	/**
	 * 添加更新行动项的活动日志
	 * 
	 * @param eventAnalysis
	 * @param dbEventAnalysis
	 */
	private void addActivityLoggingForUpdateActionItem(ActionItemDO actionItem, ActionItemDO dbActionItem) {
		ActivityDO activity = this.getActivityByActionItem(actionItem);
		if (activity != null) {
			List<String> details = new ArrayList<String>();
			// 行动项
			if (null != actionItem && null == dbActionItem) {
				// 制定措施
				if (StringUtils.isNotBlank(actionItem.getDescription())) {
					details.add("添加制定措施:" + actionItem.getDescription());
				}
				// 完成期限
				if (actionItem.getCompletionDeadLine() != null) {
					details.add("添加完成期限:" + DateHelper.formatIsoDate(actionItem.getCompletionDeadLine()));
				}
				// 责任单位
				List<OrganizationDO> orgs = actionItem.getOrganizations();
				if (orgs != null && !orgs.isEmpty()) {
					List<String> addOrgNames = new ArrayList<String>();
					for (OrganizationDO org : orgs) {
						org = organizationDao.internalGetById(org.getId());
						addOrgNames.add(org.getName());
					}
					details.add("添加责任单位:" + StringUtils.join(addOrgNames, ", "));
				}
				// 验收人
				Set<UserDO> confirmMan = actionItem.getConfirmMan();
				if (confirmMan != null && !confirmMan.isEmpty()) {
					List<String> confirmManNames = new ArrayList<String>();
					for (UserDO user : confirmMan) {
						user = userDao.internalGetById(user.getId());
						confirmManNames.add(user.getFullname());
					}
					details.add("添加验收人:" + StringUtils.join(confirmManNames, ", "));
				}
			} else if (!(null == actionItem || null == dbActionItem)) {
				// 制定措施
				if (!StringUtils.equals(actionItem.getDescription(), dbActionItem.getDescription())) {
					details.add("修改制定措施为:" + dbActionItem.getDescription() + " --> " + actionItem.getDescription());
				}
				// 完成期限
				if (!DateHelper.equals(actionItem.getCompletionDeadLine(), dbActionItem.getCompletionDeadLine())) {
					details.add("修改完成期限为:" + DateHelper.formatIsoDate(dbActionItem.getCompletionDeadLine()) + " --> " + DateHelper.formatIsoDate(actionItem.getCompletionDeadLine()));
				}
				// 责任单位
				List<OrganizationDO> orgs = actionItem.getOrganizations();
				List<OrganizationDO> dbOrgs = dbActionItem.getOrganizations();
				List<String> orgNames = new ArrayList<String>();
				List<String> dbOrgNames = new ArrayList<String>();
				if (orgs != null && !orgs.isEmpty()) {
					for (OrganizationDO org : orgs) {
						org = organizationDao.internalGetById(org.getId());
						orgNames.add(org.getName());
					}
				}
				if (dbOrgs != null && !dbOrgs.isEmpty()) {
					for (OrganizationDO org : dbOrgs) {
						org = organizationDao.internalGetById(org.getId());
						dbOrgNames.add(org.getName());
					}
				}
				if (!orgNames.containsAll(dbOrgNames) || !orgNames.containsAll(dbOrgNames)) {
					details.add("修改责任单位为:" + StringUtils.join(dbOrgNames, ", ") + " --> " + StringUtils.join(orgNames, ", "));
				}
				// 验收人
				Set<UserDO> confirmMan = actionItem.getConfirmMan();
				Set<UserDO> dbConfirmMan = dbActionItem.getConfirmMan();
				Set<String> confirmManNames = new HashSet<String>();
				Set<String> dbConfirmManNames = new HashSet<String>();
				if (confirmMan != null && !confirmMan.isEmpty()) {
					for (UserDO user : confirmMan) {
						user = userDao.internalGetById(user.getId());
						confirmManNames.add(user.getFullname());
					}
				}
				if (dbConfirmMan != null && !dbConfirmMan.isEmpty()) {
					for (UserDO user : dbConfirmMan) {
						user = userDao.internalGetById(user.getId());
						dbConfirmManNames.add(user.getFullname());
					}
				}
				if (!confirmManNames.equals(dbConfirmManNames)) {
					details.add("修改验收人为:" + StringUtils.join(dbConfirmManNames, ", ") + " --> " + StringUtils.join(confirmManNames, ", "));
				}
			}
			if (!details.isEmpty()) {
				MDC.put("details", details.toArray());
				activityLoggingDao.addLogging(activity.getId(), ActivityLoggingOperationRegister.getOperation("UPDATE_EVENT_ANALYSIS"));
				MDC.remove("details");
			}
		}
	}
	
	public void deleteRelatedInfo(Collection<ActionItemDO> collection) {
		for (ActionItemDO actionItemDO : collection) {
			List<ActionItemCommentDO> dellist = actionItemCommentDao.getAicByActionItems(actionItemDO);
			if(dellist!=null&&dellist.size()>0){
				actionItemCommentDao.internalDelete(dellist);
			}
			// 对应的事件分析处理
			if (actionItemDO.getEventAnalysis() != null) {
				EventAnalysisDO eventAnalysis = actionItemDO.getEventAnalysis();
				eventAnalysis.setActionItem(null);
				eventAnalysisDao.internalUpdate(eventAnalysis);
			}
			// 对应的operation处理
			List<ActionItemOperationDO> actionItemOperations = actionItemOperationDao.getAllByActionItem(actionItemDO);
			actionItemOperationDao.delete(actionItemOperations);
		}
	}
	
	@Override
	protected void beforeDelete(Collection<ActionItemDO> collection) {
		for (ActionItemDO actionItem : collection) {
			if (!ACTION_ITEM_STATUS_DRAFT.equals(actionItem.getStatus())) {
				throw DELETE_COMPLETE_ACTION_ITEM;
			}
		}
		this.deleteRelatedInfo(collection);
	}
	
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		super.delete(ids);
	}
	
	@Override
	public void afterDelete(Collection<ActionItemDO> actionItems) {
		for (ActionItemDO actionItem : actionItems) {
			if (actionItem.getMeasure() != null) {
				int controlMeasureId = actionItem.getMeasure().getId();
				List<ActionItemDO> draftList = this.getActionItems(controlMeasureId, null, new String[] { ACTION_ITEM_STATUS_DRAFT }, false);
				if (!draftList.isEmpty()) continue;
				List<ActionItemDO> incompleteList = this.getActionItems(controlMeasureId, null, new String[] { ACTION_ITEM_STATUS_COMFIRM_WAITING, ACTION_ITEM_STATUS_AUDIT_WAITING }, false);
				if (!incompleteList.isEmpty()) controlMeasureDao.setControlMeasureStatus(controlMeasureId, ControlMeasureDao.CONTROL_MEASURE_STATUS_INCOMPLETE);
				List<ActionItemDO> completeList = this.getActionItems(controlMeasureId, null, new String[] { ACTION_ITEM_STATUS_COMPLETE }, false);
				if (!completeList.isEmpty()) controlMeasureDao.setControlMeasureStatus(controlMeasureId, ControlMeasureDao.CONTROL_MEASURE_STATUS_COMPLETE);
			} else if (actionItem.getClause() != null) {
				int clauseId = actionItem.getClause().getId();
				List<ActionItemDO> draftList = this.getActionItems(null, clauseId, new String[] { ACTION_ITEM_STATUS_DRAFT }, false);
				if (!draftList.isEmpty()) continue;
				List<ActionItemDO> incompleteList = this.getActionItems(null, clauseId, new String[] { ACTION_ITEM_STATUS_COMFIRM_WAITING, ACTION_ITEM_STATUS_AUDIT_WAITING }, false);
				if (!incompleteList.isEmpty()) clauseDao.setClauseStatus(clauseId, ClauseDao.CLAUSE_STATUS_INCOMPLETE);
				List<ActionItemDO> completeList = this.getActionItems(null, clauseId, new String[] { ACTION_ITEM_STATUS_COMPLETE }, false);
				if (!completeList.isEmpty()) clauseDao.setClauseStatus(clauseId, ClauseDao.CLAUSE_STATUS_COMPLETE);
			}
		}
	}
	
	public Integer getActionItemCountByUser(Integer userId) {
		String sql = "select count(act) from ActionItemDO act left join act.processors p where act.deleted = false and p.id =:id and act.id in (select actionItem from ActionItemActivityDO)";
		List<Object> values = new ArrayList<Object>();
		values.add(userId);
		@SuppressWarnings("unchecked")
		List<Long> list = this.getHibernateTemplate().findByNamedParam(sql, new String[]{"id"}, values.toArray());
		return list.get(0).intValue();
	}
	
	public List<ActionItemDO> getActionItemsByControlMeasure(int controlMeasureId, boolean deleted) {
		@SuppressWarnings("unchecked")
		List<ActionItemDO> list = this.getHibernateTemplate().find("from ActionItemDO where deleted = ? and measure.id = ?", deleted, controlMeasureId);
		return list;
	}
	
	public List<ActionItemDO> getActionItemsByClause(int clauseId, boolean deleted) {
		@SuppressWarnings("unchecked")
		List<ActionItemDO> list = this.getHibernateTemplate().find("from ActionItemDO where deleted = ? and clause.id = ?", deleted, clauseId);
		return list;
	}
	
	public List<ActionItemDO> getActionItemsBysystemAnalysisClause(int clauseId, boolean deleted) {
		@SuppressWarnings("unchecked")
		List<ActionItemDO> list = this.getHibernateTemplate().find("from ActionItemDO where deleted = ? and systemAnalysisClause.id = ?", deleted, clauseId);
		return list;
	}
	
	public List<ActionItemDO> getByClauseIds(List<Integer> cluaseIds) {
		if (cluaseIds == null || cluaseIds.isEmpty()) {
			return new ArrayList<ActionItemDO>();
		}
		@SuppressWarnings("unchecked")
		List<ActionItemDO> list = (List<ActionItemDO>) this.query("from ActionItemDO where deleted = false and clause.id in (" + StringUtils.join(cluaseIds, ",") + ")");
		return list;
	}
	
	private List<ActionItemDO> getActionItems(Integer controlMeasureId, Integer clauseId, String[] statuses, boolean deleted) {
		StringBuilder hql = new StringBuilder("from ActionItemDO where deleted = :deleted");
		List<String> paramNames = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		paramNames.add("deleted");
		values.add(deleted);
		if (controlMeasureId != null) {
			hql.append(" and measure.id = :controlMeasureId");
			paramNames.add("controlMeasureId");
			values.add(controlMeasureId);
		}
		if (clauseId != null) {
			hql.append(" and clause.id = :clauseId");
			paramNames.add("clauseId");
			values.add(clauseId);
		}
		hql.append(" and status in (:statuses)");
		paramNames.add("statuses");
		values.add(statuses);
		@SuppressWarnings("unchecked")
		List<ActionItemDO> list = this.getHibernateTemplate().findByNamedParam(hql.toString(), paramNames.toArray(new String[0]), values.toArray());
		return list;
	}
	
	public String getDescriptionById(Integer id) {
		@SuppressWarnings("unchecked")
		List<String> descriptions = (List<String>) this.query("select t.description from ActionItemDO t where t.deleted = false and t.id = ?", id);
		if (descriptions.isEmpty()) {
			return null;
		}
		return descriptions.get(0);
	}
	
	public ActionItemDO getBasicInfoById(Integer id) {
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> basicInfos = (List<Map<String, Object>>) this.query("select new Map(t.id as id, t.description as description) from ActionItemDO t where t.deleted = false and t.id = ?", id);
		if (basicInfos.isEmpty()) {
			return null;
		}
		Map<String, Object> basicInfoMap = basicInfos.get(0);
		ActionItemDO actionItem = new ActionItemDO();
		actionItem.setId(id);
		actionItem.setDescription((String) basicInfoMap.get("description")); 
		return actionItem;
	}
	
	/**
	 * 通过安监机构、到期日检索，状态等检索行动项的条数<br>
	 * 到期日检索是按照开区间查询
	 */
	public long getCountBySearch(Integer unitId, Date deadlineStartDate, Date deadlineEndDate, String... status) {
		StringBuffer hql = new StringBuffer();
		List<Object> values = new ArrayList<Object>();
		hql.append("select count(ai.id) from ActionItemDO ai");
		if (null != unitId) {
			hql.append(" inner join ai.organizations org");
			hql.append(" inner join org.unit u");
			hql.append(" where ai.deleted = false and u.id = ?");
			
			values.add(unitId);
		} else {
			hql.append(" where ai.deleted = false");
		}
		hql.append(" and ai.id in (select actionItem from ActionItemActivityDO)");
		if (null != deadlineStartDate) {
			hql.append(" and ai.confirmDeadLine > ?");
			values.add(deadlineStartDate);
		}
		if (null != deadlineEndDate) {
			hql.append(" and ai.confirmDeadLine < ?");
			values.add(deadlineEndDate);
		}
		if (null != status && status.length > 0) {
			hql.append(" and ai.status in (?)");
			values.add(StringUtils.join(status, ","));
		}
		@SuppressWarnings("unchecked")
		List<Long> counts = (List<Long>) this.query(hql.toString(), values.toArray());
		return counts.get(0);
	}
	
	private void addOperation(int id, String status) {
		if (StringUtils.isNotBlank(status)) {
			String operation = null;
			if (ACTION_ITEM_STATUS_COMFIRM_WAITING.equals(status)) {
				operation = EnumActionItemOperation.EXECUTE.getCode();
			} else if (ACTION_ITEM_STATUS_AUDIT_WAITING.equals(status)) {
				operation = EnumActionItemOperation.COMFIRM.getCode();
			} else if (ACTION_ITEM_STATUS_AUDIT_REJECTED.equals(status)) {
				operation = EnumActionItemOperation.AUDIT_REJECT.getCode();
			} else if (ACTION_ITEM_STATUS_COMPLETE.equals(status)) {
				operation = EnumActionItemOperation.AUDIT_PASS.getCode();
			}
			if (operation != null) {
				Map<String, Object> operationMap = new HashMap<String, Object>();
				operationMap.put("actionItem", id);
				operationMap.put("operator", UserContext.getUserId());
				operationMap.put("operation", operation);
				actionItemOperationDao.save(operationMap);
			}
		}
	}
	
	/**
	 * 验证行动项列表
	 * @param request
	 * @param response
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void executeActionItem(Number actionItemId, List<Number> fileIds, List<Double> processors, String completionStatus) {
		Date date = new Date();
		// 更新状态,设置审核人和审批人
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("completionStatus", completionStatus);
		map.put("completionDate", date);
		map.put("confirmDeadLine", DateUtils.addDays(date, config.getActionItemConfirmDays()));
		map.put("status", ActionItemDao.ACTION_ITEM_STATUS_COMFIRM_WAITING);
		map.put("processors", processors);
		this.update(actionItemId.intValue(), map);
		
		// 关联附件
		if (fileIds != null && !fileIds.isEmpty()) {
			List<Integer> fileIdsInteger = new ArrayList<Integer>();
			for (Number fileId : fileIds) {
				fileIdsInteger.add(fileId.intValue());
			}
			List<FileDO> files = fileDao.getByIds(fileIdsInteger);
			for (FileDO file : files) {
				file.setSource(actionItemId.intValue());
				fileDao.update(file);
			}
		}
	}
	
	/**
	 * 验证行动项列表
	 * @param request
	 * @param response
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void confirmActionItems(List<Number> actionItemIds, List<Number> fileIds, List<Number> processors, String confirmComment) {
		Date date = new Date();
		// 更新状态,设置审核人和审批人
		for (Number actionItemId : actionItemIds) {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("status", ACTION_ITEM_STATUS_AUDIT_WAITING);
			map.put("processors", processors);
			map.put("auditor", processors);
			map.put("confirmDate", date);
			map.put("auditDeadLine", DateUtils.addDays(date, config.getActionItemAuditDays()));
			map.put("confirmComment", confirmComment);
			this.update(actionItemId.intValue(), map);
		}
		
		// 关联附件
		if (fileIds != null && !fileIds.isEmpty()) {
			List<Integer> fileIdsInteger = new ArrayList<Integer>();
			for (Number fileId : fileIds) {
				fileIdsInteger.add(fileId.intValue());
			}
			List<FileDO> files = fileDao.getByIds(fileIdsInteger);
			int i = 0;
			for (Number actionItemId : actionItemIds) {
				for (FileDO file : files) {
					if (i ==0) {
						file.setSource(actionItemId.intValue());
						fileDao.update(file);
					} else {
						FileDO newFile = new FileDO();
						BeanUtils.copyProperties(file, newFile);
						newFile.setSource(actionItemId.intValue());
						newFile.setId(null);
						fileDao.internalSave(newFile);
					}
				}
				i++;
			}
		}
	}
	
	/**
	 * 获取多个行动项的验证人id
	 * @param ids
	 * @return
	 */
	public Map<Integer, List<Integer>> getConfirmManIdsMapByIds(List<Integer> ids) {
		Map<Integer, List<Integer>> result = new HashMap<Integer, List<Integer>>();
		List<ActionItemDO> actionItems = this.getByIds(ids);
		for (ActionItemDO actionItem : actionItems) {
			List<Integer> userIds = null;
			Set<UserDO> users = actionItem.getConfirmMan();
			if (users != null) {
				userIds = new ArrayList<Integer>();
				for (UserDO user : users) {
					userIds.add(user.getId());
				}
			}
			result.put(actionItem.getId(), userIds);
		}
		return result;
	}
	
	/**
	 * 获取多个行动项的执行人id
	 * @param ids
	 * @return
	 */
	public Map<Integer, List<Integer>> getExecutorIdsMapByIds(List<Integer> ids) {
		Map<Integer, List<Integer>> result = new HashMap<Integer, List<Integer>>();
		List<ActionItemDO> actionItems = this.getByIds(ids);
		for (ActionItemDO actionItem : actionItems) {
			List<Integer> userIds = null;
			List<OrganizationDO> orgs = actionItem.getOrganizations();
			if (orgs != null) {
				List<Integer> orgIds = new ArrayList<Integer>();
				for (OrganizationDO org : orgs) {
					orgIds.add(org.getId());
				}
				userIds = permissionSetDao.getPermittedOrgUserIds(orgIds, PermissionSets.EXECUTE_ACTION_ITEM.getName());
			}
			result.put(actionItem.getId(), userIds);
		}
		return result;
	}
	
	/**
	 * 下发行动项
	 * @param ids
	 */
	@SuppressWarnings("unchecked")
	public void distributeActionItems(List<Integer> ids) {
		if (ids != null && !ids.isEmpty()) {
			Map<Integer, List<Integer>> executorIdsMap = this.getExecutorIdsMapByIds(ids);
			List<Map<String, Object>> maps = new ArrayList<Map<String, Object>>();;
			// 更新状态
			for (Integer actionItemId : ids) {
				if (executorIdsMap.get(actionItemId.intValue()) == null || executorIdsMap.get(actionItemId.intValue()).isEmpty()) {
					String desc = this.getDescriptionById(actionItemId);
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "行动项[" + desc + "]没有执行人");
				}
				Map<String, Object> map = new HashMap<String, Object>();
				map.put("id", actionItemId);
				map.put("status", ActionItemDao.ACTION_ITEM_STATUS_EXECUTE_WAITING);
				map.put("distributeDate", new Date());
				List<Double> processorsDouble = new ArrayList<Double>();
				for (Integer processor : executorIdsMap.get(actionItemId)) {
					processorsDouble.add(processor.doubleValue());
				}
				map.put("processors", processorsDouble);
				maps.add(map);
			}
			this.updateAll(maps.toArray(new Map[0]));
		}
	}
	
	public ActivityDO getActivityByActionItem(ActionItemDO actionItem) {
		ActivityDO activity = null;
		if (actionItem.getEventAnalysis() != null && actionItem.getEventAnalysis().getActivity() != null) {
			activity = actionItem.getEventAnalysis().getActivity();
		} else if (actionItem.getClause() != null) {
			if (actionItem.getClause().getError() != null) {
				activity = actionItem.getClause().getError().getAnalysis().getRisk().getActivity();
			} else if (actionItem.getClause().getThreat() != null) {
				activity = actionItem.getClause().getThreat().getAnalysis().getRisk().getActivity();
			}
		} else if (actionItem.getMeasure() != null) {
			if (actionItem.getMeasure().getError() != null) {
				activity = actionItem.getMeasure().getError().getTem().getActivity();
			} else if (actionItem.getMeasure().getThreat() != null) {
				activity = actionItem.getMeasure().getThreat().getTem().getActivity();
			}
		} else if (actionItem.getSystemAnalysisClause() != null) {
			if (actionItem.getSystemAnalysisClause().getRiskErrorMapping() != null) {
				activity = actionItem.getSystemAnalysisClause().getRiskErrorMapping().getRiskAnalysis().getActivity();
			} else if (actionItem.getSystemAnalysisClause().getRiskThreatMapping() != null) {
				activity = actionItem.getSystemAnalysisClause().getRiskThreatMapping().getRiskAnalysis().getActivity();
			}
		}
		return activity;
	}
	
	/**
	 * 通过安全信息的id获取对应的行动项的id的list
	 * @param activityId 安全信息的id
	 * @param actionItemStatus 行动项的状态
	 * @param activityId 安全信息的id
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<Integer> getActionItemIdsByActivityId(Integer activityId, String actionItemStatus) {
		StringBuffer hql = new StringBuffer("select t.id from ActionItemDO t where t.id in (select actionItem from ActionItemActivityDO where activity = ?)");
		List<Object> params = new ArrayList<Object>();
		params.add(activityId);
		if (actionItemStatus != null) {
			hql.append(" and t.status = ?");
			params.add(actionItemStatus);
		}
		return (List<Integer>) this.query(hql.toString(), params.toArray());
	}
	
	/**
	 * 获取行动项的某个时间字段与当前时间的间隔天数符合条件的数据<br>
	 * 时间间隔=dateFieldName - 当前时间
	 * @param dateFieldName 时间字段
	 * @param intervalDays 间隔的天数
	 * @param statuses 状态的列表
	 * @return
	 */
	@SuppressWarnings("unchecked")
	private List<Map<String, Object>> getActionItemIntervalDays(String dateFieldName, List<Double> intervalDays, List<String> statuses) {
		StringBuffer dateItervalHql = new StringBuffer();
		dateItervalHql.append("trunc(trunc(t.");
		dateItervalHql.append(dateFieldName);
		dateItervalHql.append(")-");
		dateItervalHql.append("trunc(sysdate)) + 1");
		
		StringBuffer hql = new StringBuffer("select new Map(t as actionItem,");
		hql.append(dateItervalHql);
		hql.append(" as intervalDays) from ActionItemDO t where t.id in (select actionItem from ActionItemActivityDO) and ");
		hql.append(dateItervalHql);
		hql.append(" in (:intervalDays)");
		List<String> params = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		params.add("intervalDays");
		values.add(intervalDays);
		if (statuses != null && !statuses.isEmpty()) {
			hql.append(" and t.status in (:statuses)");
			params.add("statuses");
			values.add(statuses);
		}
		return (List<Map<String, Object>>) this.query(hql.toString(), params.toArray(new String[0]), values.toArray());
	}
	
	/**
	 * 发送行动项执行的通知
	 */
	public void sendExecuteNotice() {
		// 待执行的状态
		List<String> statuses = Arrays.asList(new String[]{ActionItemDao.ACTION_ITEM_STATUS_EXECUTE_WAITING, ActionItemDao.ACTION_ITEM_STATUS_AUDIT_REJECTED, ActionItemDao.ACTION_ITEM_STATUS_CONFIRM_REJECTED});
		List<Map<String, Object>> list = this.getActionItemIntervalDays("completionDeadLine", Arrays.asList(new Double[]{1.0, 7.0, 15.0}), statuses);
		for (Map<String, Object> map : list) {
			Double intervalDays = (Double) map.get("intervalDays");
			ActionItemDO actionItem = (ActionItemDO) map.get("actionItem");
			StringBuffer content = new StringBuffer();
			content.append("您有一条行动项待执行！剩余");
			content.append(intervalDays.intValue());
			content.append("天！请登录SMS系统查看！\r\n（行动项：");
			content.append(StringHelper.getLimitedString(actionItem.getDescription(), 30, "..."));
			content.append("）");
			Set<UserDO> user = actionItem.getProcessors();
			if (user != null && !user.isEmpty()) {
				messageDao.saveTodoMsg(Arrays.asList(new EnumMessageCatagory[]{EnumMessageCatagory.SHORT_MESSAGE}), null, user, null, content.toString(), actionItem.getId(), "ACTION_ITEM");
			}
		}
	}
	
	/**
	 * 启动发送行动项执行的通知的定时任务
	 */
	public void sendExecuteNoticeScheduler(Scheduler scheduler){
		if (StringUtils.isNotBlank(cronForSendingExecuteNotice)) {
			JobUtils.createCron(scheduler, "sendExecuteNotice", "actionItem", CronSendActionItemExecuteNoticeJob.class, null, cronForSendingExecuteNotice);
		}
	}
	
	/**
	 * 发送待办的信息
	 * @param actionItem 更新后的行动项
	 * @param dbActionItem 更新前的行动项
	 */
	public void sendTodoMsg(ActionItemDO actionItem, ActionItemDO dbActionItem) {
		String status = actionItem.getStatus();
		String dbstatus = dbActionItem.getStatus();
		
		if (status != null && dbstatus != null && !status.equals(dbstatus)) {
			StringBuffer content = new StringBuffer();
			switch (status) {
				case ActionItemDao.ACTION_ITEM_STATUS_COMFIRM_WAITING:
					content.append("您有一条行动项执行完毕待验证！");
					break;
				case ActionItemDao.ACTION_ITEM_STATUS_CONFIRM_REJECTED:
					content.append("您有一条行动项验证未通过被退回！");
					break;
				case ActionItemDao.ACTION_ITEM_STATUS_AUDIT_WAITING:
					content.append("您有一条行动项验证完毕待审核！");
					break;
				case ActionItemDao.ACTION_ITEM_STATUS_AUDIT_REJECTED:
					content.append("您有一条或多条行动项审核未通过被退回！");
					break;
				default:
					// doNothing
			}
			if (content.length() > 0) {
				content.append("请登录SMS系统查看！\r\n（行动项：");
				content.append(StringHelper.getLimitedString(actionItem.getDescription(), 30, "..."));
				content.append("）");
				Set<UserDO> user = actionItem.getProcessors();
				if (user != null && !user.isEmpty()) {
					messageDao.saveTodoMsg(Arrays.asList(new EnumMessageCatagory[]{EnumMessageCatagory.SHORT_MESSAGE}), UserContext.getUser(), user, null, content.toString(), actionItem.getId(), "ACTION_ITEM");
				}
			}
		}	
	}
	
	public void setActivityDao(ActivityDao activityDao) {
		this.activityDao = activityDao;
	}
	
	public void setClauseDao(ClauseDao clauseDao) {
		this.clauseDao = clauseDao;
	}
	
	public void setControlMeasureDao(ControlMeasureDao controlMeasureDao) {
		this.controlMeasureDao = controlMeasureDao;
	}
	
	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}

	public void setActionItemCommentDao(ActionItemCommentDao actionItemCommentDao) {
		this.actionItemCommentDao = actionItemCommentDao;
	}

	public void setEventAnalysisDao(EventAnalysisDao eventAnalysisDao) {
		this.eventAnalysisDao = eventAnalysisDao;
	}

	public void setFileDao(FileDao fileDao) {
		this.fileDao = fileDao;
	}

	public void setActionItemOperationDao(ActionItemOperationDao actionItemOperationDao) {
		this.actionItemOperationDao = actionItemOperationDao;
	}

	public void setOrganizationDao(OrganizationDao organizationDao) {
		this.organizationDao = organizationDao;
	}

	public void setActivityLoggingDao(ActivityLoggingDao activityLoggingDao) {
		this.activityLoggingDao = activityLoggingDao;
	}

	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}

	public void setRiskTaskSettingDao(RiskTaskSettingDao riskTaskSettingDao) {
		this.riskTaskSettingDao = riskTaskSettingDao;
	}

	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}

	public ActionItemOperationDao getActionItemOperationDao() {
		return actionItemOperationDao;
	}

	public void setMessageDao(MessageDao messageDao) {
		this.messageDao = messageDao;
	}

	public void setCronForSendingExecuteNotice(String cronForSendingExecuteNotice) {
		this.cronForSendingExecuteNotice = cronForSendingExecuteNotice;
	}
	
}
