package com.usky.sms.audit.improvenotice;

import java.lang.reflect.Field;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.Validate;
import org.apache.commons.lang.time.DateUtils;
import org.apache.log4j.MDC;
import org.quartz.CronTrigger;
import org.quartz.JobDataMap;
import org.quartz.JobDetail;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.Trigger;
import org.quartz.impl.StdSchedulerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.activity.attribute.ActivityStatusDao;
import com.usky.sms.audit.AuditConstant;
import com.usky.sms.audit.auditReport.AuditReportDao;
import com.usky.sms.audit.auditor.AuditorDao;
import com.usky.sms.audit.base.AuditReasonDO;
import com.usky.sms.audit.base.AuditReasonDao;
import com.usky.sms.audit.check.CheckListDao;
import com.usky.sms.audit.log.AuditActivityLoggingDao;
import com.usky.sms.audit.log.operation.AuditActivityLoggingOperationRegister;
import com.usky.sms.audit.plan.PlanDao;
import com.usky.sms.audit.task.TaskDao;
import com.usky.sms.common.DateHelper;
import com.usky.sms.config.Config;
import com.usky.sms.constant.EnumMessageCatagory;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.TransactionHelper;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.file.EnumFileType;
import com.usky.sms.file.FileDO;
import com.usky.sms.file.FileDao;
import com.usky.sms.job.CronSendImproveNoticeIssueExecuteNoticeJob;
import com.usky.sms.job.CronSendImproveShortMsgJob;
import com.usky.sms.job.CronSendNoticeEmailJob;
import com.usky.sms.job.JobUtils;
import com.usky.sms.message.MessageDao;
import com.usky.sms.organization.OrganizationDO;
import com.usky.sms.organization.OrganizationDao;
import com.usky.sms.shortmessage.ShortMessageDao;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.unit.UnitRoleActorDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;
import com.usky.sms.user.UserGroupDao;
import com.usky.sms.utils.SpringBeanUtils;
import com.usky.sms.workflow.WorkflowSchemeDao;
import com.usky.sms.workflow.WorkflowService;

public class ImproveNoticeIssueDao extends BaseDao<ImproveNoticeIssueDO>{
	
	private static final org.apache.log4j.Logger log = org.apache.log4j.Logger.getLogger(ImproveNoticeIssueDao.class);
	
	private static final String NAME_PREFIX = "sendImproveShotMsgJob_";
	
	private static final String NAME_SUFIX_TRIGGER = "_trigger";
	
	private static final String GROUP = "improveNoticeIssue";
	
	private static final Integer DAY_OF_SEND_IMPROVE_SHORT_MSG = 3;
	
	private static final String CRON_EXP_FOR_SEND_IMPROVE_SHORT_MSG = "0 0 9 * * ?";
	
	/** 发送执行通知的cron表达式 */
	private String cronForSendingExecuteNotice;
	
	private Config config;
	
	@Autowired
	private DictionaryDao dictionaryDao;

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
	private OrganizationDao organizationDao;
	
	@Autowired
	private SubImproveNoticeFlowUserDao issueFlowUserDao;
	
	@Autowired
	private FileDao fileDao;
	
	@Autowired
	private MessageDao messageDao;
	
	@Autowired
	private SubImproveNoticeFlowUserDao subImproveNoticeFlowUserDao;
	
	@Autowired
	private UserGroupDao userGroupDao;
	
	@Autowired
	private WorkflowService workflowService;
	
	@Autowired
	private WorkflowSchemeDao workflowSchemeDao;
	
	@Autowired
	private SubImproveNoticeDao subImproveNoticeDao;
	
	@Autowired
	private AuditorDao auditorDao;
	
	@Autowired
	private ShortMessageDao shortMessageDao;
	
	@Autowired
	private AuditReportDao auditReportDao;
	
	protected ImproveNoticeIssueDao() {
		super(ImproveNoticeIssueDO.class);
		this.config = Config.getInstance();
	}

	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		ImproveNoticeIssueDO improveNoticeIssue = (ImproveNoticeIssueDO) obj;
		if ("improveUnit".equals(fieldName)) {
			if (null != improveNoticeIssue.getImproveUnit()) {
				map.put("improveUnit", this.getImproveUnitMap(improveNoticeIssue.getImproveUnit()));
			}
		} else if ("status".equals(fieldName)) {
			Map<String, Object> statusMap = null;
			if (null != improveNoticeIssue.getStatus()) {
				statusMap = new HashMap<String, Object>();
				statusMap.put("id", improveNoticeIssue.getStatus());
				String name;
				try {
					name = EnumImproveNoticeIssueStatus.getEnumByVal(improveNoticeIssue.getStatus()).getDescription();
				} catch (Exception e) {
					name = "未知状态";
				}
				statusMap.put("name", name);
			}
			map.put("status", statusMap);
		} else if ("traceFlowStatus".equals(fieldName)){
			Map<String, Object> traceFlowStatusMap = null;
			if (null != improveNoticeIssue.getTraceFlowStatus()) {
				traceFlowStatusMap = new HashMap<String, Object>();
				traceFlowStatusMap.put("id", improveNoticeIssue.getTraceFlowStatus());
				String name;
				try {
					name = EnumImproveNoticeIssueTraceStatus.getEnumByVal(improveNoticeIssue.getTraceFlowStatus()).getDescription();
				} catch (Exception e) {
					name = "未知状态";
				}
				traceFlowStatusMap.put("name", name);
			}
			map.put("traceFlowStatus", traceFlowStatusMap);
		} else if ("confirmMan".equals(fieldName)) {
			String confirmMan = improveNoticeIssue.getConfirmMan();
			List<Map<String,Object>> manList = new ArrayList<Map<String,Object>>();
			if (null != confirmMan) {
				for (UserDO user : userDao.internalGetByIds(confirmMan.split(","))) {
					Map<String, Object> userMap = new HashMap<String, Object>();
					userMap.put("id", user.getId());
					userMap.put("text", user.getDisplayName());
					manList.add(userMap);
				}
			}
			map.put("confirmMan", manList);
		} else  if ("auditReasonId".equals(fieldName)){
			String auditReasonId = improveNoticeIssue.getAuditReasonId();
			List<Map<String,Object>> aList = new ArrayList<Map<String,Object>>();
			if (auditReasonId != null) {
				AuditReasonDao auditReasonDao = (AuditReasonDao) SpringBeanUtils.getBean("auditReasonDao");
				for (AuditReasonDO a : auditReasonDao.internalGetByIds(auditReasonId.split(","))) {
					Map<String, Object> aMap = new HashMap<String, Object>();
					aMap.put("id", a.getId());
					aMap.put("name", a.getName());
					aMap.put("description", a.getDescription());
					aList.add(aMap);
				}
			}
			map.put("auditReason", aList);
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}

	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple,
			boolean showExtendFields) {
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
		if (!multiple) {
			ImproveNoticeIssueDO improveNoticeIssue = (ImproveNoticeIssueDO) obj;
			List<FileDO> files = fileDao.getFilesBySource(EnumFileType.IMPROVE_NOTICE_ISSUE.getCode(), improveNoticeIssue.getId());
			map.put("files", fileDao.convert(files, false));
		}
	}

	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		// 编号(同一个整改单下递增)
//		map.put("issueNo", getIssueNumByImproveNoticeId(((Double) map.get("improveNotice")).intValue()) + 1.0);
		// 创建人
		map.put("creator", UserContext.getUserId());
		// 更新人
		map.put("lastUpdater", UserContext.getUserId());
		return true;
	}
	
	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		String confirmMan = null;
		// 更新人
		map.put("lastUpdater", UserContext.getUserId());
		if (EnumImproveNoticeIssueStatus.COMPLETED.toString().equals((String) map.get("status"))) { // 提交完成情况时将完成日期设置成当前时间
			map.put("completionDate", DateUtils.truncate(new Date(), Calendar.DAY_OF_MONTH));
			// 初始状态(未验证)
			map.put("traceFlowStatus", EnumImproveNoticeIssueTraceStatus.COMFIRM_UN_PASSED.toString());
//		} else if (map.containsKey("confirmMan")) { // 分配验证人时将状态设置为已指派
//			confirmMan = (String) map.get("confirmMan");
//			map.put("status", EnumImproveNoticeIssueStatus.COMFIRM_ASSIGNED.toString());
		} else if (map.containsKey("traceFlowStatus")) {
			// 提交验证结论时，将验证日期设置为当前时间
			map.put("confirmDate", DateUtils.truncate(new Date(), Calendar.DAY_OF_MONTH));
			// 如果traceFlowStatus是已验证时将status设置成验证完成
//			if (EnumImproveNoticeIssueTraceStatus.COMFIRM_PASSED.toString().equals((String) map.get("traceFlowStatus"))
//				|| EnumImproveNoticeIssueTraceStatus.COMFIRM_UN_COMPLETED_TEMPORARILY.toString().equals((String) map.get("traceFlowStatus"))) {
//				map.put("status", EnumImproveNoticeIssueStatus.COMFIRM_COMPLETED.toString());
//			} else { // 如果traceFlowStatus是验证未通过时将status设置成完成情况
//				map.put("status", EnumImproveNoticeIssueStatus.COMPLETION.toString());
//			}
		}
//		String status = (String) map.get("status");
//		String traceFlowStatus = (String) map.get("traceFlowStatus");
//		if (null != traceFlowStatus || EnumImproveNoticeIssueStatus.COMPLETED.toString().equals(status) || EnumImproveNoticeIssueStatus.COMFIRM_ASSIGNED.toString().equals(status)) {
//			ImproveNoticeIssueDO improveNoticeIssue = this.internalGetById(id);
//			// 发送待办通知
//			this.sendMessage(improveNoticeIssue, status, traceFlowStatus, confirmMan);
//			// 发送通知
//			this.sendNotice(improveNoticeIssue, status, traceFlowStatus, confirmMan);
//		}
	}
	
	@Override
	protected void beforeUpdate(ImproveNoticeIssueDO obj) {
		obj.setLastUpdater(UserContext.getUser());
	}

	@Override
	protected void afterSave(ImproveNoticeIssueDO obj) {
		// 添加活动日志
		addActivityLoggingForAddImproveNoticeIssue(obj);
	}

	/**
	 * 添加整改通知单问题列表的活动日志
	 * @param plan
	 */
	private void addActivityLoggingForAddImproveNoticeIssue(ImproveNoticeIssueDO obj){
		auditActivityLoggingDao.addLogging(obj.getId(), "improveNoticeIssue", AuditActivityLoggingOperationRegister.getOperation("ADD_IMPROVE_NOTICE_ISSUE"));
	}
	
	@Override
	protected void afterUpdate(ImproveNoticeIssueDO obj, ImproveNoticeIssueDO dbObj) {
//		SubImproveNoticeDO subImproveNotice = obj.getSubImproveNotice();
		// 添加活动日志
		addActivityLoggingForUpdateImproveNoticeIssue(obj, dbObj);
		
		// 如果所有的跟踪表的跟踪状态都为验证通过或暂时无法完成则发送结案通知
//		sendCloseMessage(obj, dbObj);
		
		// 发送整改提醒短信
//		this.startSendImproveShortMsgJob(obj, dbObj);
		
		// 关闭发送整改提醒短信
//		this.closeSendImproveShortMsgJob(obj, dbObj);
		
	}
	
	/**
	 * 发送整改提醒短信
	 * @param newImproveNoticeIssue
	 * @param oldImproveNoticeIssue
	 */
	public void startSendImproveShortMsgJob(ImproveNoticeIssueDO newImproveNoticeIssue, ImproveNoticeIssueDO oldImproveNoticeIssue) {
		Scheduler scheduler;
			try {
			// 当填写了整改期限时，启动整改期限到期前3天每天早上9点发短信的job，直到整改完成
			if (null != newImproveNoticeIssue.getImproveDeadLine() && !newImproveNoticeIssue.getImproveDeadLine().equals(oldImproveNoticeIssue.getImproveDeadLine())) {
				scheduler = StdSchedulerFactory.getDefaultScheduler();
				this.sendImproveShortMsg(scheduler, newImproveNoticeIssue);
			}
		} catch (Exception e) {
			e.printStackTrace();
			log.warn("发送整改提醒短信失败！" + e.getMessage(), e);
		}
	}
	
	public void sendImproveShortMsg(Scheduler scheduler, ImproveNoticeIssueDO improveNoticeIssue) {
		if (StringUtils.isNotBlank(config.getCronExpForSendImproveShortMsg())) {
			// 整改期限到期前多少天进行提醒
			Integer dayOfSendImproveShortMsg = null;
			try {
				dayOfSendImproveShortMsg = Integer.parseInt(config.getDayOfSendImproveShortMsg());
			} catch(Exception e) {
				e.printStackTrace();
				dayOfSendImproveShortMsg = DAY_OF_SEND_IMPROVE_SHORT_MSG;
			}
			Calendar cal = DateHelper.getCalendar();
			cal.setTime(improveNoticeIssue.getImproveDeadLine());
			cal.add(Calendar.DATE, -dayOfSendImproveShortMsg);
			List<UserDO> users = subImproveNoticeFlowUserDao.getUsersBySubImproveNotice(improveNoticeIssue.getSubImproveNotice().getId());
			// 接收人电话号码
			Collection<String> cellTels = auditorDao.getCellTelByUsers(users);
			// 短信类容
			String content = "您有整改通知单的整改问题列表没有完成, 请登录系统填写。";
			JobUtils.createCron(scheduler, NAME_PREFIX + improveNoticeIssue.getId(), GROUP, CronSendImproveShortMsgJob.class, CRON_EXP_FOR_SEND_IMPROVE_SHORT_MSG, config.getCronExpForSendImproveShortMsg(), cal.getTime(), null, "content", content, "cellTels", cellTels);
		}
	}
	
	public void sendImproveShortMsg(Scheduler scheduler) {
		// 查询出填写了整改期限但还没有整改完成的数据
		@SuppressWarnings("unchecked")
		List<ImproveNoticeIssueDO> improveNoticeIssues = (List<ImproveNoticeIssueDO>) this.query("from ImproveNoticeIssueDO t where t.deleted = false and t.improveDeadLine is not null and t.completionDate is null and t.improveNotice.deleted = false and t.subImproveNotice.deleted = false");
		for (ImproveNoticeIssueDO improveNoticeIssue : improveNoticeIssues) {
			this.sendImproveShortMsg(scheduler, improveNoticeIssue);
		}
	}
	
	/**
	 * 关闭发送整改短信的job
	 */
	private void closeSendImproveShortMsgJob(ImproveNoticeIssueDO newImproveNoticeIssue, ImproveNoticeIssueDO oldImproveNoticeIssue) {
		// 当状态变成整改完成则关闭该job
		if (EnumImproveNoticeIssueStatus.COMPLETED.toString().equals(newImproveNoticeIssue.getStatus()) && !newImproveNoticeIssue.getStatus().equals(oldImproveNoticeIssue.getStatus())) {
			// 关闭对应的job
			Scheduler scheduler;
			try {
				scheduler = StdSchedulerFactory.getDefaultScheduler();
				scheduler.unscheduleJob(NAME_PREFIX + newImproveNoticeIssue.getId() + JobUtils.NAME_SUFIX_TRIGGER, GROUP);
			} catch (SchedulerException e) {
				e.printStackTrace();
				log.error("关闭job[" + NAME_PREFIX + newImproveNoticeIssue.getId() + "]失败: " + e.getMessage(), e);
			}
		}
	}
	
	/**
	 * 发送待办通知
	 * @param newObj
	 * @param oldObj
	 */
	/*
	private void sendMessage(ImproveNoticeIssueDO improveNoticeIssue, String status, String traceFlowStatus, String confirmMan) {
		if (EnumImproveNoticeIssueTraceStatus.COMFIRM_UN_PASSED.toString().equals(traceFlowStatus) || EnumImproveNoticeIssueStatus.COMPLETED.toString().equals(status) || EnumImproveNoticeIssueStatus.COMFIRM_ASSIGNED.toString().equals(status)) {
			String improveNoticeType = improveNoticeIssue.getImproveNotice().getImproveNoticeType();
			List<UserDO> users = null;
			
			// 待办通知
			MessageDO todoMessage = new MessageDO();
			todoMessage.setLink(improveNoticeIssue.getImproveNotice().getId().toString());
			todoMessage.setChecked(false);
			todoMessage.setSender(UserContext.getUser());
			todoMessage.setSendTime(new Timestamp(System.currentTimeMillis()));
			todoMessage.setContent("整改通知单编号：" + improveNoticeIssue.getImproveNotice().getImproveNoticeNo() + "  问题内容：" + improveNoticeIssue.getIssueContent());
			if (EnumImproveNoticeIssueStatus.COMPLETED.toString().equals(status)) { // 状态变成整改完成时,如果是系统级的则给一级检查管理员发通知，否则给二级检查管理员发通知
				todoMessage.setTitle("整改通知单待分配验证人员通知");
				// 来源类型为整改通知单跟踪表
				todoMessage.setSourceType("IMPROVE_NOTICE_TRACE");
				String operator = improveNoticeIssue.getImproveNotice().getOperator();
				users = this.getAssigners(improveNoticeType, operator);
			} else if (EnumImproveNoticeIssueStatus.COMFIRM_ASSIGNED.toString().equals(status)) { // 状态变成已指派时,则给confirmMan发通知
				todoMessage.setTitle("整改通知单待验证通知");
				// 来源类型为整改通知单跟踪表
				todoMessage.setSourceType("IMPROVE_NOTICE_TRACE");
				if (null != confirmMan) {
					users = userDao.internalGetByIds(confirmMan.split(","));
				} else {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "验证人不能为空！");
				}
				
			} else if (EnumImproveNoticeIssueTraceStatus.COMFIRM_UN_PASSED.toString().equals(traceFlowStatus)) { // 状态是验证未通过时，则给flowUser发送通知
				todoMessage.setTitle("整改通知单验证未通过通知");
				// 来源类型为整改通知单跟踪表
				todoMessage.setSourceType("SUB_IMPROVE_NOTICE");
				todoMessage.setLink(improveNoticeIssue.getSubImproveNotice().getId().toString());
				users = subImproveNoticeFlowUserDao.getUsersBySubImproveNotice(improveNoticeIssue.getSubImproveNotice().getId());
				if (users.isEmpty()) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "流程处理人为空！");
				}
			}
			
			// 发送短信
			Collection<String> cellTels = auditorDao.getCellTelByUsers(users);
			ShortMessageDO shortMessage = null;
			for (String cellTel : cellTels) {
				shortMessage = new ShortMessageDO();
				shortMessage.setCreator(UserContext.getUser());
				shortMessage.setReceiveTel(cellTel);
				shortMessage.setMsgContent(todoMessage.getTitle() + "。" + todoMessage.getContent());
				shortMessageDao.internalSave(shortMessage);
			}
			
			try {
				messageDao.sendMessageAndEmail(todoMessage, users);
			} catch (Exception e) {
				e.printStackTrace();
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "发送待办通知失败！错误信息：" + e.getMessage());
			}
		}
		
	}
	*/
	
	/**
	 * 明细跟踪验证的各种操作都给整改通知单的创建人发通知，填写验证结论后如果是系统级的给一级检查经理组的人发通知，如果是分子公司级的给二级检查经理的角色发通知
	 * @param improveNoticeIssue
	 * @param status
	 * @param confirmMan
	 */
	/*
	private void sendNotice(ImproveNoticeIssueDO improveNoticeIssue, String status, String traceFlowStatus, String confirmMan){
		if (EnumImproveNoticeIssueStatus.COMFIRM_ASSIGNED.toString().equals(status) || null != traceFlowStatus) {
			String improveNoticeType = improveNoticeIssue.getImproveNotice().getImproveNoticeType();
			
			List<UserDO> noticeUsers = null;
			// 通知
			MessageDO notice = new MessageDO();
			notice.setChecked(false);
			notice.setSender(UserContext.getUser());
			notice.setSendTime(new Timestamp(System.currentTimeMillis()));
			
			StringBuffer noticeContent = new StringBuffer();
			noticeContent.append("整改通知单编号：");
			noticeContent.append(improveNoticeIssue.getImproveNotice().getImproveNoticeNo());
			noticeContent.append("  问题内容：");
			noticeContent.append(improveNoticeIssue.getIssueContent());
			if (EnumImproveNoticeIssueStatus.COMFIRM_ASSIGNED.toString().equals(status)) {
				notice.setTitle("整改通知单验证人已分配");
				noticeUsers = new ArrayList<UserDO>();
				noticeUsers.add(improveNoticeIssue.getImproveNotice().getCreator());
				// 给创建人发送通知
				List<String> userName = new ArrayList<String>();
				if (null != confirmMan) {
					List<UserDO> confirmMans = userDao.internalGetByIds(confirmMan.split(","));
					for (UserDO user : confirmMans) {
						userName.add(user.getDisplayName());
					}
				}
				noticeContent.append("  指派了验证人:" + StringUtils.join(userName, ","));
				notice.setContent(noticeContent.toString());
				notice.setSourceType("IMPROVE_NOTICE_TRACE");
				notice.setLink(improveNoticeIssue.getImproveNotice().getId().toString());
			} else if (null != traceFlowStatus){
				notice.setTitle("整改通知单验证结果通知");
				// 给创建人和分派验证人的人员发送通知
				noticeUsers = this.getAssigners(improveNoticeType, improveNoticeIssue.getImproveNotice().getOperator());
				UserDO creator = improveNoticeIssue.getImproveNotice().getCreator();
				if (!noticeUsers.contains(creator)) {
					noticeUsers.add(creator);
				}
				noticeContent.append("  将跟踪状态设置为:");
				try {
					noticeContent.append(EnumImproveNoticeIssueTraceStatus.getEnumByVal(traceFlowStatus).getDescription());
				} catch (Exception e) {
					e.printStackTrace();
				}
				notice.setContent(noticeContent.toString());
				notice.setSourceType("SUB_IMPROVE_NOTICE");
				notice.setLink(improveNoticeIssue.getSubImproveNotice().getId().toString());
			}
			try {
				messageDao.sendMessageAndEmail(notice, noticeUsers);
			} catch (Exception e) {
				e.printStackTrace();
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "发送通知失败！错误信息：" + e.getMessage());
			}
		}
	}
	*/

	/**
	 * 获取执行分派验证人的人员
	 * @param improveNoticeType
	 * @param operator
	 * @return
	 */
	/*
	private List<UserDO> getAssigners(String improveNoticeType, String operator){
		List<UserDO> users = null;
		if (EnumImproveNoticeType.SYS.toString().equals(improveNoticeType)) { // 系统级的时候，获取AC1.1一级检查经理组用户组的人员
			DictionaryDO dic = dictionaryDao.getByTypeAndKey("审计角色", EnumAuditRole.FIRST_GRADE_CHECK_MANAGER_GROUP.getKey());
			if (null == dic) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_133000006, "审计角色", EnumAuditRole.FIRST_GRADE_CHECK_MANAGER_GROUP.getKey());
			}
			users = userGroupDao.getUsersByUserGroupName(dic.getName());
			if (null == users || users.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "用户组" + dic.getName() + "没有配置人员！");
			}
		} else { // 分子公司的时候，获取AC2.1二级检查经理角色的人员
			DictionaryDO dic = dictionaryDao.getByTypeAndKey("审计角色", EnumAuditRole.SECOND_GRADE_CHECK_MANAGER.getKey());
			if (null == dic) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_133000006, "审计角色", EnumAuditRole.SECOND_GRADE_CHECK_MANAGER.getKey());
			}
			users = unitRoleActorDao.getUsersByUnitIdAndRoleName(Integer.parseInt(operator), dic.getName(), null);
			if (null == users || users.isEmpty()) {
				UnitDO unit = unitDao.internalGetById(Integer.parseInt(operator));
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, unit.getName() + "下的" + dic.getName() + "角色没有配置人员！");
			}
		}
		return users;
	}
	*/
	
	/**
	 * 如果所有已分配验证人的跟踪表的status为暂时无法完成或跟踪状态都为验证通过或暂时无法完成则发送验证结束通知
	 * @param newObj
	 * @param oldObj
	 */
	/*
	private void sendCloseMessage(ImproveNoticeIssueDO newObj, ImproveNoticeIssueDO oldObj) {
		String oldStatus = oldObj.getStatus();
		String newStatus = newObj.getStatus();
		String oldTraceFlowStatus = oldObj.getTraceFlowStatus();
		String newTraceFlowStatus = newObj.getTraceFlowStatus();
		if ((null != newStatus && !newStatus.equals(oldStatus)) || (null != newTraceFlowStatus && !newTraceFlowStatus.equals(oldTraceFlowStatus))) {
			// 整改通知单问题列表
			List<ImproveNoticeIssueDO> improveNoticeIssues = this.getBySubImproveNoticeId(newObj.getSubImproveNotice().getId());
			// 必须所有的已分配验证人整改记录的status为"暂时无法完成"或跟踪验证为"验证通过"或"暂时无法完成"的状态
			if (!improveNoticeIssues.isEmpty()) {
				boolean isClosed = true;
				for (ImproveNoticeIssueDO improveNoticeIssue : improveNoticeIssues){
					if (StringUtils.isNotBlank(improveNoticeIssue.getConfirmMan())) { // 有分配验证人的问题
						if (!EnumImproveNoticeIssueStatus.AUDIT_UN_COMPLETED_TEMPORARILY.toString().equals(newStatus) && !EnumImproveNoticeIssueTraceStatus.COMFIRM_PASSED.toString().equals(improveNoticeIssue.getTraceFlowStatus()) && !EnumImproveNoticeIssueTraceStatus.COMFIRM_UN_COMPLETED_TEMPORARILY.toString().equals(improveNoticeIssue.getTraceFlowStatus())){
							isClosed = false;
							break;
						}
					}
				}
				if (isClosed) { // 给处理人发送验证结束的通知
					MessageDO message = new MessageDO();
					message.setLink(newObj.getSubImproveNotice().getId().toString());
					message.setChecked(false);
					message.setSender(UserContext.getUser());
					message.setSendTime(new Timestamp(System.currentTimeMillis()));
					message.setTitle("整改通知单完成情况全部完成通知");
					message.setContent("整改通知单编号：" + newObj.getImproveNotice().getImproveNoticeNo());
					message.setSourceType("SUB_IMPROVE_NOTICE_CLOSE");
					
					List<UserDO> users = subImproveNoticeFlowUserDao.getUsersBySubImproveNotice(newObj.getSubImproveNotice().getId());
					
					// 发送短信
					Collection<String> cellTels = auditorDao.getCellTelByUsers(users);
					ShortMessageDO shortMessage = null;
					for (String cellTel : cellTels) {
						shortMessage = new ShortMessageDO();
						shortMessage.setCreator(UserContext.getUser());
						shortMessage.setReceiveTel(cellTel);
						shortMessage.setMsgContent(message.getTitle() + "。" + message.getContent());
						shortMessageDao.internalSave(shortMessage);
					}
					try {
						messageDao.sendMessageAndEmail(message, users);
					} catch (Exception e) {
						e.printStackTrace();
						throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "发送整改通知单验证通过的通知失败！错误信息：" + e.getMessage());
					}
				}
			}
		}
	}
	*/

	/**
	 * 更新整改通知单问题列表的活动日志
	 * @param plan
	 */
	private void addActivityLoggingForUpdateImproveNoticeIssue(ImproveNoticeIssueDO newObj, ImproveNoticeIssueDO oldObj) {
		List<String> details = new ArrayList<String>();
		// 问题内容
		String oldIssueContent = oldObj.getIssueContent();
		String newIssueContent = newObj.getIssueContent();
		if (null == oldIssueContent && null != newIssueContent) {
			details.add("添加问题内容:" + newIssueContent);
		} else if (!(null == oldIssueContent || null == newIssueContent || oldIssueContent.equals(newIssueContent))) {
			details.add("修改问题内容为:" + newIssueContent);
		}

		// 预计完成时间
		Date oldExpectedCompletedDate = oldObj.getExpectedCompletedDate();
		Date newExpectedCompletedDate = newObj.getExpectedCompletedDate();
		if (null == oldExpectedCompletedDate && null != newExpectedCompletedDate) {
			details.add("添加预计完成时间:" + DateHelper.formatIsoDate(newExpectedCompletedDate));
		} else if (!(null == oldExpectedCompletedDate || null == newExpectedCompletedDate || oldExpectedCompletedDate.equals(newExpectedCompletedDate))) {
			details.add("修改预计完成时间为:" + DateHelper.formatIsoDate(newExpectedCompletedDate));
		}

		// 整改期限
		Date oldImproveDeadLine = oldObj.getImproveDeadLine();
		Date newImproveDeadLine = newObj.getImproveDeadLine();
		if (null == oldImproveDeadLine && null != newImproveDeadLine) {
			details.add("添加整改期限:" + DateHelper.formatIsoDate(newImproveDeadLine));
		} else if (!(null == oldImproveDeadLine || null == newImproveDeadLine || oldImproveDeadLine.equals(newImproveDeadLine))) {
			details.add("修改整改期限为:" + DateHelper.formatIsoDate(newImproveDeadLine));
		}

		// 负责单位（以逗号隔开，UT代表unit的ID，DP代表组织的ID）
		String oldImproveUnit = oldObj.getImproveUnit();
		String newImproveUnit = newObj.getImproveUnit();
		if ((null == oldImproveUnit && null != newImproveUnit) || (!(null == oldImproveUnit || null == newImproveUnit || oldImproveUnit.equals(newImproveUnit)))) {
			List<String> newImproveUnitNames = new ArrayList<String>();
			String[] ids = newObj.getImproveUnit().split(",");
			for (String id : ids) {
				if (id.startsWith(AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT)) { // 安监机构时
					UnitDO unit = unitDao.internalGetById(Integer.parseInt(id.replaceAll(AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT, "")));
					if (null != unit){
						newImproveUnitNames.add(unit.getName());
					}
				} else if (id.startsWith(AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP)) { // 组织时
					OrganizationDO organization = organizationDao.internalGetById(Integer.parseInt(id.replaceAll(AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP, "")));
					if (null != organization) {
						newImproveUnitNames.add(organization.getName());
					}
				}
			}
			String newImproveUnitName = StringUtils.join(newImproveUnitNames, ",");
			if (null == oldImproveUnit && null != newImproveUnit) {
				details.add("添加负责单位:" + newImproveUnitName);
			} else if (!(null == oldImproveUnit || null == newImproveUnit || oldImproveUnit.equals(newImproveUnit))) {
				details.add("修改负责单位为:" + newImproveUnitName);
			}
		}

		// 整改说明原因
		String oldImproveReason = oldObj.getImproveReason();
		String newImproveReason = newObj.getImproveReason();
		if (null == oldImproveReason && null != newImproveReason) {
			details.add("添加整改说明原因:" + newImproveReason);
		} else if (!(null == oldImproveReason || null == newImproveReason || oldImproveReason.equals(newImproveReason))) {
			details.add("修改整改说明原因为:" + newImproveReason);
		}

		// 整改措施
		String oldImproveMeasure = oldObj.getImproveMeasure();
		String newImproveMeasure = newObj.getImproveMeasure();
		if (null == oldImproveMeasure && null != newImproveMeasure) {
			details.add("添加整改措施:" + newImproveMeasure);
		} else if (!(null == oldImproveMeasure || null == newImproveMeasure || oldImproveMeasure.equals(newImproveMeasure))) {
			details.add("修改整改措施为:" + newImproveMeasure);
		}

		// 状态
		String oldStatus = oldObj.getStatus();
		String newStatus = newObj.getStatus();
		try {
			if (null == oldStatus && null != newStatus) {
					details.add("设置流程状态为:" + EnumImproveNoticeIssueStatus.getEnumByVal(newStatus).getDescription());
			} else if (!(null == oldStatus || null == newStatus || oldStatus.equals(newStatus))) {
				details.add("修改流程状态为:" + EnumImproveNoticeIssueStatus.getEnumByVal(oldStatus).getDescription() + " --> " + EnumImproveNoticeIssueStatus.getEnumByVal(newStatus).getDescription());
			}
		} catch (Exception e) {
			e.printStackTrace();
		}

		// 完成日期
		Date oldCompletionDate = oldObj.getCompletionDate();
		Date newCompletionDate = newObj.getCompletionDate();
		if (null == oldCompletionDate && null != newCompletionDate) {
			details.add("添加完成日期:" + DateHelper.formatIsoDate(newCompletionDate));
		} else if (!(null == oldCompletionDate || null == newCompletionDate || oldCompletionDate.equals(newCompletionDate))) {
			details.add("修改完成日期为:" + DateHelper.formatIsoDate(newCompletionDate));
		}

		// 完成情况
		String oldCompletionStatus = oldObj.getCompletionStatus();
		String newCompletionStatus = newObj.getCompletionStatus();
		if (null == oldCompletionStatus && null != newCompletionStatus) {
			details.add("添加完成情况:" + newCompletionStatus);
		} else if (!(null == oldCompletionStatus || null == newCompletionStatus || oldCompletionStatus.equals(newCompletionStatus))) {
			details.add("修改完成情况为:" + newCompletionStatus);
		}

		//  验证建议
		String oldConfirmSuggestion = oldObj.getConfirmSuggestion();
		String newConfirmSuggestion = newObj.getConfirmSuggestion();
		if (null == oldConfirmSuggestion && null != newConfirmSuggestion) {
			details.add("添加验证建议:" + newConfirmSuggestion);
		} else if (!(null == oldConfirmSuggestion || null == newConfirmSuggestion || oldConfirmSuggestion.equals(newConfirmSuggestion))) {
			details.add("修改验证建议为:" + newConfirmSuggestion);
		}

		// 验证人 
		String oldConfirmMan = oldObj.getConfirmMan();
		String newConfirmMan = newObj.getConfirmMan();
		if ((null == oldConfirmMan && null != newConfirmMan) || (!(null == oldConfirmMan || null == newConfirmMan || oldConfirmMan.equals(newConfirmMan)))) {
			List<String> newConfirmManNames = new ArrayList<String>();
			for (UserDO user : userDao.internalGetByIds(newObj.getConfirmMan().split(","))) {
				newConfirmManNames.add(user.getFullname());
			}
			String newConfirmManName = StringUtils.join(newConfirmManNames, ",");
			if (null == oldConfirmMan && null != newConfirmMan) {
				details.add("添加验证人:" + newConfirmManName);
			} else if (!(null == oldConfirmMan || null == newConfirmMan || oldConfirmMan.equals(newConfirmMan))) {
				details.add("修改验证人为:" + newConfirmManName);
			}
		}

		// 验证时间
		Date oldConfirmDate = oldObj.getConfirmDate();
		Date newConfirmDate = newObj.getConfirmDate();
		if (null == oldConfirmDate && null != newConfirmDate) {
			details.add("添加验证时间:" + DateHelper.formatIsoDate(newConfirmDate));
		} else if (!(null == oldConfirmDate || null == newConfirmDate || oldConfirmDate.equals(newConfirmDate))) {
			details.add("修改验证时间为:" + DateHelper.formatIsoDate(newConfirmDate));
		}

		// 验证期限
		Date oldConfirmDeadLine = oldObj.getConfirmDeadLine();
		Date newConfirmDeadLine = newObj.getConfirmDeadLine();
		if (null == oldConfirmDeadLine && null != newConfirmDeadLine) {
			details.add("添加验证期限:" + DateHelper.formatIsoDate(newConfirmDeadLine));
		} else if (!(null == oldConfirmDeadLine || null == newConfirmDeadLine || oldConfirmDeadLine.equals(newConfirmDeadLine))) {
			details.add("修改验证期限为:" + DateHelper.formatIsoDate(newConfirmDeadLine));
		}

		// 审计总结
		String oldAuditSummary = oldObj.getAuditSummary();
		String newAuditSummary = newObj.getAuditSummary();
		if (null == oldAuditSummary && null != newAuditSummary) {
			details.add("添加审计总结:" + newAuditSummary);
		} else if (!(null == oldAuditSummary || null == newAuditSummary || oldAuditSummary.equals(newAuditSummary))) {
			details.add("修改审计总结为:" + newAuditSummary);
		}

		// 跟踪状态
		String oldTraceFlowStatus = oldObj.getTraceFlowStatus();
		String newTraceFlowStatus = newObj.getTraceFlowStatus();
		try {
			if (null == oldTraceFlowStatus && null != newTraceFlowStatus) {
					details.add("设置跟踪状态为:" + EnumImproveNoticeIssueTraceStatus.getEnumByVal(newTraceFlowStatus).getDescription());
			} else if (!(null == oldTraceFlowStatus || null == newTraceFlowStatus || oldTraceFlowStatus.equals(newTraceFlowStatus))) {
				details.add("修改跟踪状态为:" + EnumImproveNoticeIssueTraceStatus.getEnumByVal(oldTraceFlowStatus) + " --> " + EnumImproveNoticeIssueTraceStatus.getEnumByVal(newTraceFlowStatus));
			}
		} catch (Exception e) {
			e.printStackTrace();
		}

		if (!details.isEmpty()) {
			MDC.put("details", details.toArray());
			auditActivityLoggingDao.addLogging(newObj.getId(), "improveNoticeIssue", AuditActivityLoggingOperationRegister.getOperation("UPDATE_IMPROVE_NOTICE_ISSUE"));
			MDC.remove("details");
		}
	}

	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}
	
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(Collection<ImproveNoticeIssueDO> list) {
		if (null != list && !list.isEmpty()) {
			Collection<String> ids = new ArrayList<String>();
			for (ImproveNoticeIssueDO improveNoticeIssue : list) {
				ids.add(improveNoticeIssue.getId().toString());
			}
			this.markAsDeleted(ids.toArray(new String[0]));
		}
	}
	
	/**
	 * 获取同一个整改单下问题列表的条数
	 * @param id
	 * @return
	 */
	public Integer getIssueNumByImproveNoticeId(Integer id){
		@SuppressWarnings("unchecked")
		List<Long> numbers = (List<Long>) this.query("select count(t) from ImproveNoticeIssueDO t where t.improveNotice.id = ?", id);
		return numbers.get(0).intValue();
	}

	/**
	 * 按照状态进行分组<br>
	 * 如果具有分配验证人员的权限则对所有问题列表进行分组，否则只对验证人时当前用户的问题列表进行分组
	 * @param improveNoticeIssues
	 * @return
	 */
	/*
	public Map<String, Object> groupByStatus(Collection<ImproveNoticeIssueDO> improveNoticeIssues, boolean assignable){
		Map<String, Object> map = new HashMap<String, Object>();
		// 待验证的项目
		List<Map<String, Object>> waitedMaps = new ArrayList<Map<String, Object>>();
		// 已验证完成的项目
		List<Map<String, Object>> completedMaps = new ArrayList<Map<String, Object>>();
		// 未按时完成的项目
		List<Map<String, Object>> uncompletedTimelyMaps = new ArrayList<Map<String, Object>>();
		// 暂时无法完成的项目
		List<Map<String, Object>> uncompletedtemporarilyMaps = new ArrayList<Map<String, Object>>();
		boolean confirmable = false;
		if (null != improveNoticeIssues) {
			for (ImproveNoticeIssueDO improveNoticeIssue : improveNoticeIssues) {
				// 状态为 整改完成，已指派或验证完成
				if (EnumImproveNoticeIssueStatus.COMPLETED.toString().equals(improveNoticeIssue.getStatus())
					|| EnumImproveNoticeIssueStatus.COMFIRM_ASSIGNED.toString().equals(improveNoticeIssue.getStatus())
					|| EnumImproveNoticeIssueStatus.AUDIT_UN_COMPLETED_TEMPORARILY.toString().equals(improveNoticeIssue.getStatus())
					|| EnumImproveNoticeIssueStatus.COMFIRM_COMPLETED.toString().equals(improveNoticeIssue.getStatus())) {
					String traceFlowStatus = improveNoticeIssue.getTraceFlowStatus();
					// 暂时无法完成
					if (EnumImproveNoticeIssueStatus.AUDIT_UN_COMPLETED_TEMPORARILY.toString().equals(improveNoticeIssue.getStatus()) || EnumImproveNoticeIssueTraceStatus.COMFIRM_UN_COMPLETED_TEMPORARILY.toString().equals(traceFlowStatus)) { // 暂时无法完成
						uncompletedtemporarilyMaps.add(this.convert(improveNoticeIssue));
					} else if (null == traceFlowStatus) { // 待验证
						Map<String, Object> waitedMap = this.convert(improveNoticeIssue, false);
						if (!assignable) {
							if (!StringUtils.isBlank(improveNoticeIssue.getConfirmMan())) {
								List<String> confirmMans = Arrays.asList(improveNoticeIssue.getConfirmMan().split(","));
								if (confirmMans.contains(UserContext.getUserId().toString())) {
									waitedMap.put("confirmable", true);
									confirmable = true;
								}
							}
						}
						waitedMaps.add(waitedMap);
					} else if (EnumImproveNoticeIssueTraceStatus.COMFIRM_PASSED.toString().equals(traceFlowStatus)) { // 完成验证
						completedMaps.add(this.convert(improveNoticeIssue));
						// 整改完成日期 > 整改期限 或 验证日期 > 验证期限时为未按时完成
						if (null != improveNoticeIssue.getCompletionDate() && null != improveNoticeIssue.getConfirmDate()){
							if (improveNoticeIssue.getCompletionDate().after(improveNoticeIssue.getImproveDeadLine())
								|| improveNoticeIssue.getConfirmDate().after(improveNoticeIssue.getConfirmDeadLine())) {
								uncompletedTimelyMaps.add(this.convert(improveNoticeIssue, false));
							}
						}
					}
				}
			}
		}
//		List<String> returnedFields = Arrays.asList(new String[]{"id", "issueNo", "issueContent", "completionStatus", "confirmSuggestion", "completionDate", "confirmMan", "confirmDeadLine", "confirmDate", "traceFlowStatus", "auditSummary", "improveUnit"});
		map.put("waitedMaps", waitedMaps);
		map.put("completedMaps", completedMaps);
		map.put("uncompletedTimelyMaps", uncompletedTimelyMaps);
		map.put("uncompletedtemporarilyMaps", uncompletedtemporarilyMaps);
		map.put("confirmable", confirmable);
		return map;
	}
	*/
	
	/**
	 * 根据整改通知单的id获取问题列表
	 * @param improveNoticeId
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<ImproveNoticeIssueDO> getByImproveNoticeId(Integer improveNoticeId){
		return (List<ImproveNoticeIssueDO>) this.query("from ImproveNoticeIssueDO t where t.deleted = false and t.improveNotice.id = ? order by t.issueContent", improveNoticeId);
	}
	
	/**
	 * 根据整改通知单子单的id获取问题列表
	 * @param improveNoticeId
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<ImproveNoticeIssueDO> getBySubImproveNoticeId(Integer subImproveNoticeId){
		return (List<ImproveNoticeIssueDO>) this.query("from ImproveNoticeIssueDO t where t.deleted = false and t.subImproveNotice.id = ?", subImproveNoticeId);
	}
	
	/**
	 * 判断整改单子单下的问题列表是否都验证了<br>
	 * 不存在traceFlowStatus为null和COMFIRM_UN_PASSED的问题
	 * @param subImproveNoticeId
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public boolean isAllIssuesConfirmed(Integer subImproveNoticeId){
		List<ImproveNoticeIssueDO> list = (List<ImproveNoticeIssueDO>) this.query("from ImproveNoticeIssueDO t where t.deleted = false and (t.traceFlowStatus = ? or t.traceFlowStatus is null) and t.subImproveNotice.id = ?", EnumImproveNoticeIssueTraceStatus.COMFIRM_UN_PASSED.toString(), subImproveNoticeId);
		return list.isEmpty() ? true : false;
	}
	

	/**
	 * scheduler不为空时启动发送订阅邮件的job,否则立即发送
	 * 
	 * @param scheduler Scheduler
	 * @param subscribe SubscribeDO
	 * @throws Exception
	 */
	public void sendNoticeEmail(ImproveNoticeIssueDO improveNoticeIssue) throws Exception {
		Scheduler scheduler = StdSchedulerFactory.getDefaultScheduler();
		String defaultExpression = null; // 
		// 任务执行时间规则表达式
		String cronexpression = null;
		String content = "您有一项任务急需处理！请及时在待办中心或消息通知页面进行查看处理！";
		String subject = "审计工作提醒";
		Set<UserDO> receivers = null;
		if (null != scheduler) {
			createCron(scheduler, NAME_PREFIX + improveNoticeIssue.getId(), CronSendNoticeEmailJob.class, defaultExpression, cronexpression, "content", content, "subject", subject, "receivers", receivers);
		}
	}
	
	/**
	 * 创建一个job
	 * 
	 * @param scheduler
	 * @param name
	 * @param jobClass
	 * @param cronDefaultExpression
	 * @param cronExpression
	 * @param params
	 */
	private void createCron(final Scheduler scheduler, final String name, final Class<?> jobClass, final String cronDefaultExpression, final String cronExpression, final Object... params) {
		final JobDetail job = new JobDetail(name, GROUP, jobClass);
		if (params != null) {
			Validate.isTrue(params.length % 2 == 0);
			final JobDataMap map = job.getJobDataMap();
			for (int i = 0; i < params.length - 1; i += 2) {
				Validate.isTrue(params[i] instanceof String);
				map.put(params[i], params[i + 1]);
			}
		}
		final String cronEx;
		if (StringUtils.isNotBlank(cronExpression) == true) {
			cronEx = cronExpression;
		} else {
			cronEx = cronDefaultExpression;
		}
		final Trigger trigger;
		try {
			trigger = new CronTrigger(name + NAME_SUFIX_TRIGGER, GROUP, cronEx);
		} catch (final ParseException ex) {
			log.error("Could not create cron trigger with expression '" + cronEx + "' (cron job is disabled): " + ex.getMessage(), ex);
			return;
		}
		try {
			// Schedule the job with the trigger
			scheduler.scheduleJob(job, trigger);
		} catch (final SchedulerException ex) {
			log.error("Could not create cron job: " + ex.getMessage(), ex);
			return;
		}
		log.info("Cron job '" + name + "' successfully configured: " + cronEx);
	}
	
	/**
	 * 按责任单位分组
	 * @param improveNotice
	 * @param subImproveNotices
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<SubImproveNoticeDO> groupedByImproveUnit(ImproveNoticeDO improveNotice, List<SubImproveNoticeDO> subImproveNotices) {
		List<SubImproveNoticeDO> result = new ArrayList<SubImproveNoticeDO>();
		Map<String, Object> viewableOperatorsAndTargets = auditReportDao.getViewableOperatorsAndTargets(null, null, null);
		List<String> targets = (List<String>) viewableOperatorsAndTargets.get("targets");
		for (SubImproveNoticeDO subImproveNotice : subImproveNotices) {
			if (targets != null && !targets.isEmpty() && targets.contains(subImproveNotice.getImproveUnit())) {
				result.add(subImproveNotice);
			}
		}
		
		return result;
	}
	
	public Map<Integer, Integer> getIssueCountGroupSubImproveNotice(ImproveNoticeDO improveNotice) {
		Map<Integer, Integer> countMap = new HashMap<Integer, Integer>();
		@SuppressWarnings("unchecked")
		List<Object[]> counts = (List<Object[]>) this.query("select t.subImproveNotice.id, count(t.id) from ImproveNoticeIssueDO t where t.deleted = false and t.improveNotice.id = ? group by t.subImproveNotice.id", improveNotice.getId());
		for (Object[] count : counts) {
			countMap.put((Integer)count[0], ((Long) count[1]).intValue());
		}
		return countMap;
	}
	
	public List<Map<String, Object>> getImproveUnitMap(String improveUnit) {
		List<Map<String, Object>> unitMaps = new ArrayList<Map<String,Object>>();
		if (StringUtils.isNotBlank(improveUnit)) {
			String[] ids = improveUnit.split(",");
			for (String id : ids) {
				Map<String, Object> unitMap = new HashMap<String, Object>();
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
				unitMaps.add(unitMap);
			}
		}
		return unitMaps;
	}
	
	/**
	 * 查询整改通知单子单对应的所有整改问题列表
	 * @param subImproveNotices
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<ImproveNoticeIssueDO> getBySubImproveNotices(Collection<SubImproveNoticeDO> subImproveNotices) {
		if (null != subImproveNotices && !subImproveNotices.isEmpty()) {
			return (List<ImproveNoticeIssueDO>) this.query("from ImproveNoticeIssueDO t where t.deleted = false and t.subImproveNotice in (:subImproveNotices)", new String[]{"subImproveNotices"}, new Object[]{subImproveNotices});
		} else {
			return new ArrayList<ImproveNoticeIssueDO>();
		}
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
	private List<Map<String, Object>> getImproveNoticeIssueIntervalDays(String dateFieldName, List<Double> intervalDays, List<String> statuses) {
		StringBuffer dateItervalHql = new StringBuffer();
		dateItervalHql.append(" trunc(trunc(t.");
		dateItervalHql.append(dateFieldName);
		dateItervalHql.append(")-");
		dateItervalHql.append("trunc(sysdate)) + 1");
		
		StringBuffer hql = new StringBuffer("select new Map(t as improveNoticeIssue,");
		hql.append(dateItervalHql);
		hql.append(" as intervalDays) from ImproveNoticeIssueDO t where t.deleted = false and t.subImproveNotice.deleted = false and t.improveNotice.deleted = false and ");
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
	 * 发送整改通知单问题执行的通知
	 */
	public void sendExecuteNotice() {
		// 待执行的状态
		List<String> statuses = Arrays.asList(new String[]{EnumImproveNoticeIssueStatus.AUDIT_PASSED.toString()});
		List<Map<String, Object>> list = this.getImproveNoticeIssueIntervalDays("improveDeadLine", Arrays.asList(new Double[]{1.0, 7.0, 15.0}), statuses);
		for (Map<String, Object> map : list) {
			Double intervalDays = (Double) map.get("intervalDays");
			ImproveNoticeIssueDO improveNoticeIssue = (ImproveNoticeIssueDO) map.get("improveNoticeIssue");
			StringBuffer content = new StringBuffer();
			content.append("您有一条整改问题待执行！剩余");
			content.append(intervalDays.intValue());
			content.append("天！请登录SMS系统查看！");
			List<UserDO> user = subImproveNoticeFlowUserDao.getUsersBySubImproveNotice(improveNoticeIssue.getSubImproveNotice().getId());
			if (user != null && !user.isEmpty()) {
				messageDao.saveTodoMsg(Arrays.asList(new EnumMessageCatagory[]{EnumMessageCatagory.SHORT_MESSAGE}), null, user, null, content.toString(), improveNoticeIssue.getId(), "IMPROVE_NOTICE_ISSUE");
			}
		}
	}
	
	/**
	 * 启动发送整改通知单问题执行的通知的定时任务
	 */
	public void sendExecuteNoticeScheduler(Scheduler scheduler){
		if (StringUtils.isNotBlank(cronForSendingExecuteNotice)) {
			JobUtils.createCron(scheduler, "sendExecuteNotice", "improveNoticeIssue", CronSendImproveNoticeIssueExecuteNoticeJob.class, null, cronForSendingExecuteNotice);
		}
	}
	
	public void setDictionaryDao(DictionaryDao dictionaryDao) {
		this.dictionaryDao = dictionaryDao;
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

	public void setOrganizationDao(OrganizationDao organizationDao) {
		this.organizationDao = organizationDao;
	}

	public void setIssueFlowUserDao(SubImproveNoticeFlowUserDao issueFlowUserDao) {
		this.issueFlowUserDao = issueFlowUserDao;
	}

	public void setFileDao(FileDao fileDao) {
		this.fileDao = fileDao;
	}

	public void setMessageDao(MessageDao messageDao) {
		this.messageDao = messageDao;
	}

	public void setSubImproveNoticeFlowUserDao(SubImproveNoticeFlowUserDao subImproveNoticeFlowUserDao) {
		this.subImproveNoticeFlowUserDao = subImproveNoticeFlowUserDao;
	}

	public void setUserGroupDao(UserGroupDao userGroupDao) {
		this.userGroupDao = userGroupDao;
	}

	public void setWorkflowService(WorkflowService workflowService) {
		this.workflowService = workflowService;
	}

	public void setWorkflowSchemeDao(WorkflowSchemeDao workflowSchemeDao) {
		this.workflowSchemeDao = workflowSchemeDao;
	}

	public void setSubImproveNoticeDao(SubImproveNoticeDao subImproveNoticeDao) {
		this.subImproveNoticeDao = subImproveNoticeDao;
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

	public void setConfig(Config config) {
		this.config = config;
	}

	public void setAuditReportDao(AuditReportDao auditReportDao) {
		this.auditReportDao = auditReportDao;
	}

}
