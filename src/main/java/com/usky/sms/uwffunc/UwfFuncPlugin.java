
package com.usky.sms.uwffunc;

import java.lang.reflect.Method;
import java.sql.Connection;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.apache.log4j.MDC;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.context.WebApplicationContext;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.usky.WfMng;
import com.usky.comm.DbClient;
import com.usky.comm.JsonUtil;
import com.usky.comm.Utility;
import com.usky.sms.accessinformation.AccessInformationDO;
import com.usky.sms.accessinformation.AccessInformationDao;
import com.usky.sms.accessinformation.FlightInfoEntityDO;
import com.usky.sms.accessinformation.FlightInfoEntityDao;
import com.usky.sms.accessinformation.GroundPositionEntityDO;
import com.usky.sms.accessinformation.GroundPositionEntityDao;
import com.usky.sms.accessinformation.MaintainToolEntityDO;
import com.usky.sms.accessinformation.MaintainToolEntityDao;
import com.usky.sms.accessinformation.OrganizationEntityDO;
import com.usky.sms.accessinformation.OrganizationEntityDao;
import com.usky.sms.accessinformation.VehicleInfoEntityDO;
import com.usky.sms.accessinformation.VehicleInfoEntityDao;
import com.usky.sms.activity.ActivityDO;
import com.usky.sms.activity.ActivityDao;
import com.usky.sms.activity.attribute.ActivityStatusDO;
import com.usky.sms.activity.attribute.ActivityStatusDao;
import com.usky.sms.audit.AuditConstant;
import com.usky.sms.audit.check.CheckDO;
import com.usky.sms.audit.check.CheckDao;
import com.usky.sms.audit.check.CheckListDO;
import com.usky.sms.audit.check.CheckListDao;
import com.usky.sms.audit.check.EnumAuditResult;
import com.usky.sms.audit.check.EnumImproveItemStatus;
import com.usky.sms.audit.improve.EnumImproveNoticeLogType;
import com.usky.sms.audit.improve.ImproveDO;
import com.usky.sms.audit.improve.ImproveDao;
import com.usky.sms.audit.improvenotice.EnumImproveNoticeIssueStatus;
import com.usky.sms.audit.improvenotice.EnumImproveNoticeIssueTraceStatus;
import com.usky.sms.audit.improvenotice.EnumImproveNoticeStatus;
import com.usky.sms.audit.improvenotice.ImproveNoticeDO;
import com.usky.sms.audit.improvenotice.ImproveNoticeDao;
import com.usky.sms.audit.improvenotice.ImproveNoticeIssueDO;
import com.usky.sms.audit.improvenotice.ImproveNoticeIssueDao;
import com.usky.sms.audit.improvenotice.SubImproveNoticeDO;
import com.usky.sms.audit.improvenotice.SubImproveNoticeDao;
import com.usky.sms.audit.log.AuditActivityLoggingDao;
import com.usky.sms.audit.log.operation.AuditActivityLoggingOperationRegister;
import com.usky.sms.audit.plan.PlanDO;
import com.usky.sms.audit.plan.PlanDao;
import com.usky.sms.audit.task.TaskDO;
import com.usky.sms.audit.task.TaskDao;
import com.usky.sms.audit.workflow.AuditWorkflowSchemeDao;
import com.usky.sms.common.BeanHelper;
import com.usky.sms.common.StringHelper;
import com.usky.sms.config.Config;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.AbstractBaseDO;
import com.usky.sms.core.AbstractPlugin;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.custom.CustomFieldDO;
import com.usky.sms.custom.CustomFieldDao;
import com.usky.sms.custom.CustomFieldValueDO;
import com.usky.sms.custom.CustomFieldValueDao;
import com.usky.sms.email.EmailDO;
import com.usky.sms.email.EmailDao;
import com.usky.sms.email.EnumSendStatus;
import com.usky.sms.email.SmtpDO;
import com.usky.sms.email.SmtpDao;
import com.usky.sms.eventanalysis.EventAnalysisDO;
import com.usky.sms.eventanalysis.EventAnalysisDao;
import com.usky.sms.field.FieldRegister;
import com.usky.sms.file.EnumFileType;
import com.usky.sms.file.FileDO;
import com.usky.sms.file.FileDao;
import com.usky.sms.flightmovementinfo.FlightCrewMemberDO;
import com.usky.sms.flightmovementinfo.FlightCrewMemberDao;
import com.usky.sms.http.service.GsonBuilder4SMS;
import com.usky.sms.message.MessageDO;
import com.usky.sms.message.MessageDao;
import com.usky.sms.organization.OrganizationDO;
import com.usky.sms.organization.OrganizationDao;
import com.usky.sms.risk.RiskDao;
import com.usky.sms.shortmessage.ShortMessageDO;
import com.usky.sms.shortmessage.ShortMessageDao;
import com.usky.sms.tem.ActionItemDao;
import com.usky.sms.tem.TemDO;
import com.usky.sms.tem.TemDao;
import com.usky.sms.tem.TemUnitDO;
import com.usky.sms.tem.TemUnitDao;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.unit.UnitRoleActorDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;
import com.usky.sms.user.UserGroupDao;
import com.usky.sms.utils.SpringBeanUtils;
import com.usky.sms.uwf.WfFunctionDao;
import com.usky.sms.uwf.WfSetup;
import com.usky.sms.workflow.WorkflowService;

public class UwfFuncPlugin extends AbstractPlugin {
	
	private static final Gson gson = GsonBuilder4SMS.getInstance();
	
	private static final Config config = Config.getInstance();
	
	private static final String[][] funcs = {
	//{"选人", "选人测试", "com.usky.sms.uwffunc.UwfFuncPlugin.UserTest", ""},
			{ "选人", "UserId", "设置审批人", "com.usky.sms.uwffunc.UwfFuncPlugin.UserId", "com.sms.plugin.workflow.setUser" },
			{ "选人", "UserApplyer", "根据报告人选人", "com.usky.sms.uwffunc.UwfFuncPlugin.UserApplyer", "" },
			{ "选人", "UserField", "根据页面字段选人", "com.usky.sms.uwffunc.UwfFuncPlugin.UserPageField",
					"com.sms.plugin.workflow.setCustomField" },
			{ "选人", "UserGroup", "根据用户组选人", "com.usky.sms.uwffunc.UwfFuncPlugin.UserGroup",
					"com.sms.plugin.workflow.setUserGroup" },
			{ "选人", "getByUserGroups", "根据用户组选人(可多选)", "com.usky.sms.uwffunc.UwfFuncPlugin.getByUserGroups",
					"com.sms.plugin.workflow.setUserGroups" },
			{ "选人", "UserRole", "根据安监机构角色选人", "com.usky.sms.uwffunc.UwfFuncPlugin.UserUnitRole",
					"com.sms.plugin.workflow.setUnitRole" },
			{ "选人", "getByUnitRoles", "根据安监机构角色选人(可多选)", "com.usky.sms.uwffunc.UwfFuncPlugin.getByUnitRoles",
			"com.sms.plugin.workflow.setUnitRoles" },
			{ "选人", "getByUnitsRole", "根据其他安监机构选人", "com.usky.sms.uwffunc.UwfFuncPlugin.getByUnitsRole", "com.sms.plugin.workflow.setUnitRole" },
			{ "选人", "getByBusinessForm", "根据业务表单选人", "com.usky.sms.uwffunc.UwfFuncPlugin.getByBusinessForm", "com.sms.plugin.workflow.setBusinessForm" },
			{ "选人", "getCurrentUser", "根据当前用户选人", "com.usky.sms.uwffunc.UwfFuncPlugin.getCurrentUser", "" },
			{ "选人", "getByOrganizationRole", "根据组织角色选人", "com.usky.sms.uwffunc.UwfFuncPlugin.getByOrganizationRole", "com.sms.plugin.workflow.setUnitRole" },
			{ "选人", "getByOrganizationRoles", "根据组织角色选人(可多选)", "com.usky.sms.uwffunc.UwfFuncPlugin.getByOrganizationRoles", "com.sms.plugin.workflow.setUnitRoles" },
			{ "选人", "getByOperatorOrganizationRoles", "根据审计实施主体组织角色选人(可多选)", "com.usky.sms.uwffunc.UwfFuncPlugin.getByOperatorOrganizationRoles", "com.sms.plugin.workflow.setUnitRoles" },
			{ "选人", "getByTargetOrganizationRoles", "根据审计对象组织角色选人(可多选)", "com.usky.sms.uwffunc.UwfFuncPlugin.getByTargetOrganizationRoles", "com.sms.plugin.workflow.setUnitRoles" },
			{ "选人", "getByOrganizationAndRole", "根据表单中填写的组织和设置角色选人", "com.usky.sms.uwffunc.UwfFuncPlugin.getByOrganizationAndRole","com.sms.plugin.workflow.setUnitRole" },
			{ "结果处理", "SetActivityStatus", "设置状态", "com.usky.sms.uwffunc.UwfFuncPlugin.SetActivityStatus", "" },
			{ "校验条件", "checkTem", "TEM必填验证", "com.usky.sms.uwffunc.UwfFuncPlugin.checkTem", "" },
			{ "校验条件", "checkAuditScope", "审计范围校验", "com.usky.sms.uwffunc.UwfFuncPlugin.checkAuditScope", "" },
			{ "校验条件", "checkCheckList", "检查项必填校验", "com.usky.sms.uwffunc.UwfFuncPlugin.checkCheckList", "" },
			{ "校验条件", "checkAuditRecord", "审计记录必填校验", "com.usky.sms.uwffunc.UwfFuncPlugin.checkAuditRecord", "" },
			{ "校验条件", "checkImproveTrace", "完成情况提交校验", "com.usky.sms.uwffunc.UwfFuncPlugin.checkImproveTrace", "" },
			{ "校验条件", "checkAuditReport", "审计报告必填校验", "com.usky.sms.uwffunc.UwfFuncPlugin.checkAuditReport", "" },
			{ "校验条件", "checkAuditReportHasProblems", "审计报告是否有不符合项校验", "com.usky.sms.uwffunc.UwfFuncPlugin.checkAuditReportHasProblems", "" },
			{ "校验条件", "checkImproveRecord", "整改反馈填写校验", "com.usky.sms.uwffunc.UwfFuncPlugin.checkImproveRecord", "" },
			{ "校验条件", "checkImproveAuditPassed", "整改审核通过校验", "com.usky.sms.uwffunc.UwfFuncPlugin.checkImproveAuditPassed", "" },
			{ "校验条件", "checkImproveAuditNotPassed", "整改审核不通过校验", "com.usky.sms.uwffunc.UwfFuncPlugin.checkImproveAuditNotPassed", "" },
			{ "校验条件", "checkImproveCommit", "整改单原因及措施提交校验", "com.usky.sms.uwffunc.UwfFuncPlugin.checkImproveCommit", "" },
			{ "校验条件", "checkImproveNoticeReject", "整改通知单审核拒绝校验", "com.usky.sms.uwffunc.UwfFuncPlugin.checkImproveNoticeReject", "" },
			{ "校验条件", "checkImproveNoticePass", "整改通知单审核通过校验", "com.usky.sms.uwffunc.UwfFuncPlugin.checkImproveNoticePass", "" },
			{ "校验条件", "checkImproveNoticeClose", "整改通知单提交校验", "com.usky.sms.uwffunc.UwfFuncPlugin.checkImproveNoticeClose", "" },
			{ "校验条件", "checkImproveNoticeCloseSkipConfirm", "整改通知单跳过验证直接结案校验", "com.usky.sms.uwffunc.UwfFuncPlugin.checkImproveNoticeCloseSkipConfirm", "" },
			{ "校验条件", "checkPlanJieAn", "审计计划结案校验", "com.usky.sms.uwffunc.UwfFuncPlugin.checkPlanJieAn", "" },
			{ "校验条件", "termPlanJieAn", "航站审计计划结案校验", "com.usky.sms.uwffunc.UwfFuncPlugin.termPlanJieAn", "" },
			{ "校验条件", "checkImproveRemark", "内审整改单完成情况必填校验", "com.usky.sms.uwffunc.UwfFuncPlugin.checkImproveRemark", "" },
			{ "校验条件", "checkSubActivitiesComplete", "子安全信息完成校验", "com.usky.sms.uwffunc.UwfFuncPlugin.checkSubActivitiesComplete", "" },
			{ "校验条件", "checkHasEventAnalysis", "是否进行SHEL分析校验", "com.usky.sms.uwffunc.UwfFuncPlugin.checkHasEventAnalysis", "" },
			{ "校验条件", "checkHasSubActivities", "安全信息已分配校验", "com.usky.sms.uwffunc.UwfFuncPlugin.checkHasSubActivities", "" },
			{ "校验条件", "checkActivityNotAssigned", "安全信息未分配校验", "com.usky.sms.uwffunc.UwfFuncPlugin.checkActivityNotAssigned", "" },
//			{ "校验条件", "checkAccessInfo", "信息获取必填验证", "com.usky.sms.uwffunc.UwfFuncPlugin.checkAccessInfo", "" },
//			{ "校验条件", "checkSafeInfo", "信息详情相关字段必填验证", "com.usky.sms.uwffunc.UwfFuncPlugin.checkSafeInfo", "" },
			{ "触发条件", "testTrigger", "触发条件测试", "com.usky.sms.uwffunc.UwfFuncPlugin.testTrigger", "" },
			{ "触发条件", "isOlevel", "信息创建人所属组织级别是所设置的级别", "com.usky.sms.uwffunc.UwfFuncPlugin.isOlevel", "com.sms.plugin.workflow.setOrglevel" },
			{ "触发条件", "isNotOlevel", "信息创建人所属组织级别不是所设置的级别", "com.usky.sms.uwffunc.UwfFuncPlugin.isNotOlevel", "com.sms.plugin.workflow.setOrglevel" },
			{ "触发条件", "isOlevelOfForm", "信息表单中填写的组织级别是所设置的级别", "com.usky.sms.uwffunc.UwfFuncPlugin.isOlevelOfForm", "com.sms.plugin.workflow.setOrglevel" },
			{ "触发条件", "isNotOlevelOfForm", "信息表单中填写的组织级别不是所设置的级别", "com.usky.sms.uwffunc.UwfFuncPlugin.isNotOlevelOfForm", "com.sms.plugin.workflow.setOrglevel" },
			{ "触发条件", "improveUnitIsAnJianBu", "整改通知单的责任单位是安监部", "com.usky.sms.uwffunc.UwfFuncPlugin.improveUnitIsAnJianBu", "" },
			{ "触发条件", "improveUnitIsNotAnJianBu", "整改通知单的责任单位不是安监部", "com.usky.sms.uwffunc.UwfFuncPlugin.improveUnitIsNotAnJianBu", "" },
			{ "触发条件", "improveUnitIsUnit", "整改通知单的责任单位是安监机构", "com.usky.sms.uwffunc.UwfFuncPlugin.improveUnitIsUnit", "" },
			{ "触发条件", "improveUnitIsNotUnit", "整改通知单的责任单位不是安监机构", "com.usky.sms.uwffunc.UwfFuncPlugin.improveUnitIsNotUnit", "" },
			{ "触发条件", "activityUnitIsAnJianBu", "安全信息的处理单位是安监部", "com.usky.sms.uwffunc.UwfFuncPlugin.activityUnitIsAnJianBu", "" },
			{ "触发条件", "activityUnitIsNotAnJianBu", "安全信息的处理单位不是安监部", "com.usky.sms.uwffunc.UwfFuncPlugin.activityUnitIsNotAnJianBu", "" },
			{ "触发条件", "activityIsNotAssigned", "安全信息未分配", "com.usky.sms.uwffunc.UwfFuncPlugin.activityIsNotAssigned", "" },
			{ "触发条件", "activityIsAssigned", "安全信息已分配", "com.usky.sms.uwffunc.UwfFuncPlugin.activityIsAssigned", "" },
			{ "结果处理", "postFunction", "信息报告反馈", "com.usky.sms.uwffunc.UwfFuncPlugin.postFunction", "com.sms.plugin.workflow.setMessageWay" },
			{ "结果处理", "postFunctionForAircraftCommanderReport", "机长报告反馈", "com.usky.sms.uwffunc.UwfFuncPlugin.postFunctionForAircraftCommanderReport", "" },
//			{ "结果处理", "postMessage", "消息推送", "com.usky.sms.uwffunc.UwfFuncPlugin.postMessage", "" },
			{ "结果处理", "addOccurredDate", "添加发生时间", "com.usky.sms.uwffunc.UwfFuncPlugin.addOccurredDate", "" },
			{ "结果处理", "recordImproveNoticeLog", "记录整改通知单的日志", "com.usky.sms.uwffunc.UwfFuncPlugin.recordImproveNoticeLog", "" },
			{ "结果处理", "instanceTaskWorkflow", "实例化工作单的流程", "com.usky.sms.uwffunc.UwfFuncPlugin.instanceTaskWorkflow", "" },
			{ "结果处理", "resetRejectedImproveNoticeIssueStatus", "重置整改通知单中被审核拒绝的问题的状态及签批件拒绝处理", "com.usky.sms.uwffunc.UwfFuncPlugin.resetRejectedImproveNoticeIssueStatus", "" },
			{ "结果处理", "rejectImproveFile", "整改单拒绝时签批件拒绝处理", "com.usky.sms.uwffunc.UwfFuncPlugin.rejectImproveFile", "" },
			{ "结果处理", "generateImprove", "生成整改单", "com.usky.sms.uwffunc.UwfFuncPlugin.generateImprove", "" },
			{ "结果处理", "deleteImprove", "删除对应整改单", "com.usky.sms.uwffunc.UwfFuncPlugin.deleteImprove", "" },
			{ "结果处理", "addImproveDate", "添加整改完成日期", "com.usky.sms.uwffunc.UwfFuncPlugin.addImproveDate", "" },
			{ "结果处理", "deleteImproveDate", "删除整改完成日期", "com.usky.sms.uwffunc.UwfFuncPlugin.deleteImproveDate", "" },
			{ "结果处理", "generateImproveNotice", "生成整改通知单", "com.usky.sms.uwffunc.UwfFuncPlugin.generateImproveNotice", "" },
			{ "结果处理", "closeImproveNotice", "整改通知单结案处理", "com.usky.sms.uwffunc.UwfFuncPlugin.closeImproveNotice", "" },
			{ "结果处理", "closeTask", "工作单结案处理", "com.usky.sms.uwffunc.UwfFuncPlugin.closeTask", "" },
			{ "结果处理", "setRiskStatusToWuXiao", "风险分析置为无效", "com.usky.sms.uwffunc.UwfFuncPlugin.setRiskStatusToWuXiao", "" },
			{ "结果处理", "distributeActionItem", "下发行动项", "com.usky.sms.uwffunc.UwfFuncPlugin.distributeActionItem", "" },
			{ "结果处理", "setActivityCloseDate", "设置安全信息结案日期", "com.usky.sms.uwffunc.UwfFuncPlugin.setActivityCloseDate", "" },
			{ "结果处理", "enterNoticeNode", "进入提醒结点", "com.usky.sms.uwffunc.UwfFuncPlugin.enterNoticeNode", "" },
			{ "结果处理", "cancelEnterNoticeNode", "取消进入提醒结点", "com.usky.sms.uwffunc.UwfFuncPlugin.cancelEnterNoticeNode", "" },
	};

	@Autowired
	private WfFunctionDao wfFunctionDao;
	
	public void setWfFunctionDao(WfFunctionDao wfFunctionDao) {
		this.wfFunctionDao = wfFunctionDao;
	}
	
	@Override
	public void initialize(WebApplicationContext context) throws Exception {
		for (String[] func : funcs) {
			wfFunctionDao.save(func[0], func[1], func[2], func[3], func[4]);
		}
		
		Thread.currentThread().getContextClassLoader().loadClass(this.getClass().getName());
		System.out.println(this.getClass().getName() + " initialize");
	}
	
	@Override
	public void uninstall() throws Exception {
		for (String[] func : funcs) {
			wfFunctionDao.Delete(func[0], func[1]);
		}
	}
	
	public static String UserTest() {
		System.out.println("Test ok");
		return "Test";
	}
	
	
	//保存当前审批用户
	static void WriteUser(Map m_param, String userlist) throws Exception {
		// 方法移动到WfMng.WriteUser()
		/*
		String[] userIds = userlist.split(",");
		if (StringUtils.isBlank(userlist) || userIds.length == 0) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "没有处理人，请联系管理员！");
		}
		int id = GetObjectId(m_param);
		String objectName = getObjectName(m_param);
		BaseDao<? extends AbstractBaseDO> baseDao = getDataAccessObject(objectName);
		if (baseDao instanceof IUwfFuncPlugin) {
			((IUwfFuncPlugin) baseDao).writeUser(id, userIds);
		}
		// 发送站内消息(信息为安全信息，并且配置文件中流程变更状态后是否发送通知为Y时)
		if ("activity".equals(objectName) && "Y".equals(config.getSendMessageIfWorkflowStatusChanged())) {
			postMessage(id, userIds);
		}
		*/
	}
	/**
	 * 整改单完成情况必填校验
	 * @param m_param
	 * @param temp
	 * @return
	 * @throws Exception
	 */
	public static boolean checkImproveRemark(Map<String, Object> m_param, String temp) throws Exception {
		Integer id = GetObjectId(m_param);
		if (id == null) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "未找到实体对象！");
		}
		CheckListDao checkListDao = (CheckListDao) SpringBeanUtils.getBean("checkListDao");
		List<CheckListDO> checkLists = checkListDao.getByImproveId(id);
		List<String> list = new ArrayList<>();
		for (CheckListDO cl : checkLists) {
			if (cl.getImproveRemark() == null || cl.getImproveRemark().trim() == null) {
				list.add(cl.getItemPoint());
			}
		}
		if (list.size() > 0) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, StringUtils.join(list, ",") + "的完成情况还未填写！");
		} else {
			return true;
		}
	}
	
	/**
	 * 审计计划结案校验
	 * @param m_param
	 * @param temp
	 * @return
	 */
	public static boolean checkPlanJieAn(Map<String, Object> m_param, String temp) throws Exception {
		Integer id = GetObjectId(m_param);
		if (id == null) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "未找到实体对象！");
		}
		TaskDao taskDao = (TaskDao) SpringBeanUtils.getBean("taskDao");
		List<TaskDO> tasks = taskDao.getByPlanId(id);
		ImproveDao improveDao = (ImproveDao) SpringBeanUtils.getBean("improveDao");
		List<ImproveDO> improves = improveDao.getByPlanId(id);
		int count = 0;
		for (TaskDO task : tasks) {
			if (task.getCloseDate() != null) {
				continue;
			}
			boolean hasImprove = false;
			if (improves != null) {
				for (ImproveDO improve : improves) {
					if (task.getId().equals(improve.getTask().getId())) {
						hasImprove = true;
						if (!"结案".equals(improve.getFlowStatus())) {
							count++;
							break;
						}
					}
				}
			}
			if (!hasImprove) {
				count++;
			}
		}
		if (count > 0) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "还有" + count + "个工作单还没完成!");
		} else {
			return true;
		}
	}
	/**
	 * 航站审计计划结案校验
	 * @param m_param
	 * @param temp
	 * @return
	 */
	public static boolean termPlanJieAn(Map<String, Object> m_param, String temp) throws Exception {
		Integer id = GetObjectId(m_param);
		if (id == null) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "未找到实体对象！");
		}
		TaskDao taskDao = (TaskDao) SpringBeanUtils.getBean("taskDao");
		List<TaskDO> tasks = taskDao.getByPlanId(id);
		int count = 0;
		for (TaskDO t : tasks) {
			if (!"结案".equals(t.getFlowStatus())) {
				count++;
			}
		}
		if (count > 0) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "还有" + count + "个工作单还没完成!");
		} else {
			return true;
		}
	}
	
	/**
	 * 审计范围必填校验
	 * @param m_param
	 * @param temp
	 * @return
	 */
	public static boolean checkAuditScope(Map<String, Object> m_param, String temp) throws Exception {
		Integer id = GetObjectId(m_param);
		if (id == null){
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "未找到实体对象！");
		}
		CheckDao checkDao = (CheckDao) SpringBeanUtils.getBean("checkDao");
		List<CheckDO> checks = checkDao.getChecks(id);
		if (checks.size() == 0){
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "此工作单下没有检查单！");
		}
		List<String> details = new ArrayList<String>();
		List<String> msg = new ArrayList<String>();
		WorkflowService workflowService = (WorkflowService) SpringBeanUtils.getBean("workflow");
		for (CheckDO check : checks){
			String flowId = check.getFlowId();
			if (flowId == null) {
				msg.add(check.getCheckType().getName());
			} else {
				Map<String, Object> NodeAttributes = workflowService.getWorkflowNodeAttributes(flowId);
				String flowStatus = NodeAttributes.get("flowStatus") == null ? null : (String) NodeAttributes.get("flowStatus");
				if (!"wanCheng".equals(flowStatus)) {
					details.add(check.getCheckType().getName());
				}
			}
		}
		if (msg.size() > 0) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "(" + StringUtils.join(msg, ",") + ")的检查单还未下发!");
		}
		if (details.size() > 0){
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "(" + StringUtils.join(details, ",") + ")的检查单还没完成!");
		} else {
			return true;
		}
	}
	
	/**
	 * 审计记录必填校验
	 * @param m_param
	 * @param temp
	 * @return
	 */
	public static boolean checkAuditRecord(Map<String, Object> m_param, String temp) throws Exception {
		Integer id = GetObjectId(m_param);
		if (id == null){
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "未找到实体对象！");
		}
		CheckListDao checkListDao = (CheckListDao) SpringBeanUtils.getBean("checkListDao");
		List<CheckListDO> checkLists = checkListDao.getByCheck(id);
		List<String> details = new ArrayList<String>();
		for (CheckListDO checkList : checkLists){
			if (!"符合项".equals(checkList.getAuditResult().getName()) && !"不适用".equals(checkList.getAuditResult().getName())){
				if (checkList.getAuditRecord() == null || "".equals(checkList.getAuditRecord()) ){
					details.add(checkList.getItemPoint());
				} 
			}
		}
		if (details.size() > 0){
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "(" + StringUtils.join(details, ",") + ")没有添加审计记录!");
		} else {
			return true;
		}
	}
	
	public static boolean checkImproveTrace(Map<String, Object> m_param, String temp) throws Exception {
		Integer id = GetObjectId(m_param);
		if (id == null){
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "未找到实体对象！");
		}
		ImproveDao improveDao = (ImproveDao) SpringBeanUtils.getBean("improveDao");
		ImproveDO improve = improveDao.internalGetById(id);
		Set<CheckListDO> checkLists = improve.getCheckLists();
		Integer i = 0;
		if (checkLists != null){
			for (CheckListDO checkList : checkLists){
				if (!checkList.isDeleted() && EnumImproveItemStatus.整改完成.getCode() != checkList.getImproveItemStatus() 
						&& EnumImproveItemStatus.暂时无法完成.getCode() != checkList.getImproveItemStatus()){
					i++;
				}
			}
			if (i > 0){
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "还有"+i+"项没有提交完成情况！");
			}
		}
		return true;
	}
	
	/**
	 * 审计报告必填校验<br>
	 * 当审计报告的问题类型不为"文实相符"和"不适用"时，如果审计记录为空则校验不通过
	 * @param m_param
	 * @param temp
	 * @return
	 */
	public static boolean checkAuditReport(Map<String, Object> m_param, String temp) throws Exception {
		Integer id = GetObjectId(m_param);
		CheckListDao checkListDao = (CheckListDao) SpringBeanUtils.getBean("checkListDao");
		List<CheckListDO> checkLists = checkListDao.getByTaskId(id);
		List<String> details = new ArrayList<String>();
		for (CheckListDO checkList : checkLists){
			if (!EnumAuditResult.符合项.toString().equals(checkList.getAuditResult().getName()) && !EnumAuditResult.不适用.toString().equals(checkList.getAuditResult().getName())){
				if (StringUtils.isBlank(checkList.getAuditRecord())){
					details.add(checkList.getItemPoint());
				} 
			}
		}
		if (details.size() > 0){
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "(" + StringUtils.join(details, ",") + ")没有添加审计记录!");
		} else {
			return true;
		}
	}

	/**
	 * 审计报告是否有不符合项校验<br>
	 * 是否有除了"文实相符"和"不适用"项的问题列表
	 * @param m_param
	 * @param temp
	 * @return
	 */
	public static boolean checkAuditReportHasProblems(Map<String, Object> m_param, String temp) throws Exception{
		Integer id = GetObjectId(m_param);
		CheckListDao checkListDao = (CheckListDao) SpringBeanUtils.getBean("checkListDao");
		List<CheckListDO> checkLists = checkListDao.getByTaskId(id);
		boolean hasProblems = false;
		for (CheckListDO checkList : checkLists){
			if (!EnumAuditResult.符合项.toString().equals(checkList.getAuditResult().getName()) && !EnumAuditResult.不适用.toString().equals(checkList.getAuditResult().getName())){
				hasProblems = true;
			}
		}
		if (!hasProblems){
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "该审计报告没有有问题的项!");
		}
		return true;
	}
	
	/**
	 * 整改反馈记录校验<br>
	 * 所有整改反馈记录项的状态必须为"措施制定"并且必须上传整改单的签批件
	 * @param m_param
	 * @param temp
	 * @return
	 */
	public static boolean checkImproveRecord(Map<String, Object> m_param, String temp) throws Exception {
		Integer id = GetObjectId(m_param);
		ImproveDao improveDao = (ImproveDao) SpringBeanUtils.getBean("improveDao");
		ImproveDO improve = improveDao.internalGetById(id);
		Set<CheckListDO> checkLists = improve.getCheckLists();
		// 必须上传签批件
		if (null != improve.getFiles()) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "整改反馈的签批件未上传！");
		}
		// 所有整改反馈记录项的状态必须为"措施制定"
		if (null != checkLists && !checkLists.isEmpty()) {
			for (CheckListDO checkList : checkLists){
				if (!checkList.isDeleted() && EnumImproveItemStatus.措施制定.getCode() != checkList.getImproveItemStatus()){
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "存在审计状态不为" + EnumImproveItemStatus.措施制定.toString() + "的记录！");
				}
			}
		}
		return true;
	}
	
	/**
	 * 整改审核通过校验<br>
	 * 必须所有的整改记录为"预案通过"或"暂时无法完成"不能出现"预案拒绝"
	 * @param m_param
	 * @param temp
	 * @return
	 */
	public static boolean checkImproveAuditPassed(Map<String, Object> m_param, String temp) throws Exception {
		Integer id = GetObjectId(m_param);
		ImproveDao improveDao = (ImproveDao) SpringBeanUtils.getBean("improveDao");
		ImproveDO improve = improveDao.internalGetById(id);
		// 整改记录
		Set<CheckListDO> checkLists = improve.getCheckLists();
		// 必须所有的整改记录为"预案通过"或"暂时无法完成"，不能出现"预案拒绝"等其他的状态
		if (null != checkLists && !checkLists.isEmpty()) {
			// 判断是否都进行审核过了
			if (!isImproveAudited(checkLists)) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "存在未进行审核的整改反馈记录!");
			}
			for (CheckListDO checkList : checkLists){
				if (!checkList.isDeleted() && EnumImproveItemStatus.预案拒绝.getCode() == checkList.getImproveItemStatus()){
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "存在审计状态是" + EnumImproveItemStatus.预案拒绝.toString() + "的记录！");
				}
			}
		}
		return true;
	}
	
	/**
	 * 整改审核未通过校验<br>
	 * 至少存在一个整改记录为"预案拒绝"
	 * @param m_param
	 * @param temp
	 * @return
	 */
	public static boolean checkImproveAuditNotPassed(Map<String, Object> m_param, String temp) throws Exception {
		Integer id = GetObjectId(m_param);
		ImproveDao improveDao = (ImproveDao) SpringBeanUtils.getBean("improveDao");
		ImproveDO improve = improveDao.internalGetById(id);
		// 整改记录
		Set<CheckListDO> checkLists = improve.getCheckLists();
		// 至少存在一个整改记录为"预案拒绝"(不为"预案通过"或"暂时无法完成")的状态
		boolean hasNotPassed = false;
		if (null != checkLists && !checkLists.isEmpty()) {
			// 判断是否都进行审核过了
			if (!isImproveAudited(checkLists)) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "存在未进行审核的整改反馈记录!");
			}
			for (CheckListDO checkList : checkLists){
				if (!checkList.isDeleted() && EnumImproveItemStatus.预案拒绝.getCode() == checkList.getImproveItemStatus()){
					hasNotPassed = true;
					break;
				}
			}
		}
		if (!hasNotPassed) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "不存在审计状态是" + EnumImproveItemStatus.预案拒绝.toString() + "的记录！");
		}
		return true;
	}
	
	/**
	 * 判断整改审核反馈是否都审核过了<br>
	 * 即状态是否是"预案通过"、 "预案拒绝"或"暂时无法完成"
	 * @param checkLists
	 */
	private static boolean isImproveAudited(Set<CheckListDO> checkLists){
		if (null != checkLists && !checkLists.isEmpty()) {
			for (CheckListDO checkList : checkLists){
				if(!checkList.isDeleted() && EnumImproveItemStatus.预案通过.getCode() != checkList.getImproveItemStatus() && EnumImproveItemStatus.暂时无法完成.getCode() != checkList.getImproveItemStatus() && EnumImproveItemStatus.预案拒绝.getCode() != checkList.getImproveItemStatus()){
					return false;
				}
			}
		}
		return true;
	}
	

	/**
	 * 整改单原因及措施提交校验<br>
	 * 所有整改记录状态为"措施制定","预案通过","暂时无法完成"
	 * @param m_param
	 * @param temp
	 * @return
	 */
	public static boolean checkImproveCommit(Map<String, Object> m_param, String temp) throws Exception {
		Integer id = GetObjectId(m_param);
		ImproveDao improveDao = (ImproveDao) SpringBeanUtils.getBean("improveDao");
		ImproveDO improve = improveDao.internalGetById(id);
		// 整改记录
		Set<CheckListDO> checkLists = improve.getCheckLists();
		// 所有整改记录状态为"措施制定","预案通过","暂时无法完成"
		if (null != checkLists && !checkLists.isEmpty()) {
			for (CheckListDO checkList : checkLists){
				if (!checkList.isDeleted() && EnumImproveItemStatus.暂时无法完成.getCode() != checkList.getImproveItemStatus() && EnumImproveItemStatus.措施制定.getCode() != checkList.getImproveItemStatus() && EnumImproveItemStatus.预案通过.getCode() != checkList.getImproveItemStatus()){
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "存在审计状态不是" + EnumImproveItemStatus.措施制定.toString() + "或" + EnumImproveItemStatus.暂时无法完成.toString() + "或" + EnumImproveItemStatus.预案通过.toString() + "的记录！");
				}
			}
		}
		return true;
	}
	
	/**
	 * 整改通知单审核拒绝校验<br>
	 * 至少存在一个整改记录为"审核拒绝"
	 * @param m_param
	 * @param temp
	 * @return
	 */
	public static boolean checkImproveNoticeReject(Map<String, Object> m_param, String temp) throws Exception {
		Integer id = GetObjectId(m_param);
		SubImproveNoticeDao subImproveNoticeDao = (SubImproveNoticeDao) SpringBeanUtils.getBean("subImproveNoticeDao");
//		ImproveNoticeIssueDao improveNoticeIssueDao = (ImproveNoticeIssueDao) SpringBeanUtils.getBean("improveNoticeIssueDao");
		SubImproveNoticeDO subImproveNotice = subImproveNoticeDao.internalGetById(id);
		// 整改通知单问题列表
		Set<ImproveNoticeIssueDO> improveNoticeIssues = subImproveNotice.getImproveNoticeIssues();
		// 至少存在一个整改记录为"审核拒绝"(不为"预案通过"或"暂时无法完成")的状态
		boolean hasNotPassed = false;
		if (null != improveNoticeIssues && !improveNoticeIssues.isEmpty()) {
			// 判断是否都进行审核过了
			if (!isImproveNoticeAudited(improveNoticeIssues)) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "存在未进行审核的整改问题记录!");
			}
			for (ImproveNoticeIssueDO improveNoticeIssue : improveNoticeIssues){
				if (!improveNoticeIssue.isDeleted() && EnumImproveNoticeIssueStatus.AUDIT_REJECTED.toString().equals(improveNoticeIssue.getStatus())){
					hasNotPassed = true;
					break;
				}
			}
		}
		if (!hasNotPassed) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "不存在审核状态是" + EnumImproveNoticeIssueStatus.AUDIT_REJECTED.getDescription() + "的记录！");
		}
//		for (ImproveNoticeIssueDO improveNoticeIssue : improveNoticeIssues){
//			// 将状态置空
//			improveNoticeIssue.setStatus(null);
//			improveNoticeIssueDao.update(improveNoticeIssue);
//		}
		return true;
	}
	
	/**
	 * 整改通知单审核通过校验<br>
	 * 全部整改记录为"审核通过"
	 * @param m_param
	 * @param temp
	 * @return
	 */
	public static boolean checkImproveNoticePass(Map<String, Object> m_param, String temp) throws Exception {
		Integer id = GetObjectId(m_param);
		SubImproveNoticeDao subImproveNoticeDao = (SubImproveNoticeDao) SpringBeanUtils.getBean("subImproveNoticeDao");
		SubImproveNoticeDO subImproveNotice = subImproveNoticeDao.internalGetById(id);
		// 整改通知单问题列表
		Set<ImproveNoticeIssueDO> improveNoticeIssues = subImproveNotice.getImproveNoticeIssues();
		// 必须所有的整改记录为"审核通过"的状态
		if (null != improveNoticeIssues && !improveNoticeIssues.isEmpty()) {
			// 判断是否都进行审核过了
			if (!isImproveNoticeAudited(improveNoticeIssues)) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "存在未进行审核的整改问题记录!");
			}
			for (ImproveNoticeIssueDO improveNoticeIssue : improveNoticeIssues){
				if (!improveNoticeIssue.isDeleted() && EnumImproveNoticeIssueStatus.AUDIT_REJECTED.toString().equals(improveNoticeIssue.getStatus())){
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "存在审核状态是" + EnumImproveNoticeIssueStatus.AUDIT_REJECTED.getDescription() + "的记录！");
				}
			}
		}
		return true;
	}
	
	/**
	 * 判断整改通知单是否都审核过了<br>
	 * 即状态是否是"审核通过"、 "审核拒绝"、"暂时无法完成"
	 * @param checkLists
	 */
	private static boolean isImproveNoticeAudited(Set<ImproveNoticeIssueDO> improveNoticeIssues){
		if (null != improveNoticeIssues && !improveNoticeIssues.isEmpty()) {
			for (ImproveNoticeIssueDO improveNoticeIssue : improveNoticeIssues){
				if(!improveNoticeIssue.isDeleted() && !EnumImproveNoticeIssueStatus.AUDIT_UN_COMPLETED_TEMPORARILY.toString().equals(improveNoticeIssue.getStatus()) && !EnumImproveNoticeIssueStatus.AUDIT_PASSED.toString().equals(improveNoticeIssue.getStatus()) && !EnumImproveNoticeIssueStatus.AUDIT_REJECTED.toString().equals(improveNoticeIssue.getStatus())){
					return false;
				}
			}
		}
		return true;
	}
	
	/**
	 * 整改通知单提交校验<br>
	 * 全部整改记录的traceFlowStatus为'验证通过'或'暂时无法完成'
	 * @param m_param
	 * @param temp
	 * @return
	 */
	public static boolean checkImproveNoticeClose(Map<String, Object> m_param, String temp) throws Exception {
		/*
		Integer id = GetObjectId(m_param);
		ImproveNoticeIssueDao improveNoticeIssueDao = (ImproveNoticeIssueDao) SpringBeanUtils.getBean("improveNoticeIssueDao");
		// 整改通知单问题列表
		List<ImproveNoticeIssueDO> improveNoticeIssues = improveNoticeIssueDao.getBySubImproveNoticeId(id);
		
		// 必须所有的整改记录的跟踪验证为"验证通过"或"暂时无法完成"的状态
		int unConfirmedCount = 0;
		int unpassedConfirmedCount = 0;
		// 是否有分配验证人（状态是否为COMFIRM_ASSIGNED）
		boolean hasConfirmMan = false;
		for (ImproveNoticeIssueDO improveNoticeIssue : improveNoticeIssues) {
			if (StringUtils.isNotBlank(improveNoticeIssue.getConfirmMan())) {
				hasConfirmMan = true;
				if (!EnumImproveNoticeIssueStatus.AUDIT_UN_COMPLETED_TEMPORARILY.toString().equals(improveNoticeIssue.getStatus())) {
					if (null == improveNoticeIssue.getTraceFlowStatus()){
						unConfirmedCount++;
					} else if (!EnumImproveNoticeIssueTraceStatus.COMFIRM_PASSED.toString().equals(improveNoticeIssue.getTraceFlowStatus()) && !EnumImproveNoticeIssueTraceStatus.COMFIRM_UN_COMPLETED_TEMPORARILY.toString().equals(improveNoticeIssue.getTraceFlowStatus())){
						unpassedConfirmedCount++;
					}
				}
			}
		}
		if (!hasConfirmMan) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "必须要有至少一条问题进行跟踪验证！");
		}
		if (unConfirmedCount > 0 || unpassedConfirmedCount > 0) {
			StringBuffer message = new StringBuffer();
			if (unConfirmedCount > 0) {
				message.append("存在" + unConfirmedCount + "条未进行跟踪验证的记录！");
			}
			if (unpassedConfirmedCount > 0) {
				message.append("存在" + unpassedConfirmedCount + "条跟踪验证状态是" + EnumImproveNoticeIssueTraceStatus.COMFIRM_UN_PASSED.getDescription() + "的记录！");
			}
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, message.toString());
		}
		*/
		return true;
	}
	
	/**
	 * 整改通知单跳过验证直接结案校验<br>
	 * 如果整改记录有分配验证人，则该记录的traceFlowStatus必须为'验证通过'或'暂时无法完成'，否则填写完成情况后可直接结案
	 * @param m_param
	 * @param temp
	 * @return
	 */
	public static boolean checkImproveNoticeCloseSkipConfirm(Map<String, Object> m_param, String temp) throws Exception {
		Integer id = GetObjectId(m_param);
		ImproveNoticeIssueDao improveNoticeIssueDao = (ImproveNoticeIssueDao) SpringBeanUtils.getBean("improveNoticeIssueDao");
		// 整改通知单问题列表
		List<ImproveNoticeIssueDO> improveNoticeIssues = improveNoticeIssueDao.getBySubImproveNoticeId(id);
		// 必须都填写了完成情况
		int unCompletedCount = 0;
		// 如果分配了验证人则该整改记录的跟踪验证必须为"验证通过"或"暂时无法完成"的状态
		int unConfirmedCount = 0;
		int unpassedConfirmedCount = 0;
		for (ImproveNoticeIssueDO improveNoticeIssue : improveNoticeIssues){
			if (StringUtils.isNotBlank(improveNoticeIssue.getConfirmMan())) {
				if (!EnumImproveNoticeIssueStatus.AUDIT_UN_COMPLETED_TEMPORARILY.toString().equals(improveNoticeIssue.getStatus())) {
					if (null == improveNoticeIssue.getTraceFlowStatus()){
						unConfirmedCount++;
					} else if (!EnumImproveNoticeIssueTraceStatus.COMFIRM_PASSED.toString().equals(improveNoticeIssue.getTraceFlowStatus())){
						unpassedConfirmedCount++;
					}
				}
			} else { // 没有分配验证人则必须要填写完成情况
				if (!EnumImproveNoticeIssueStatus.AUDIT_UN_COMPLETED_TEMPORARILY.toString().equals(improveNoticeIssue.getStatus())) {
					if (!EnumImproveNoticeIssueStatus.COMPLETED.toString().equals(improveNoticeIssue.getStatus())) {
						unCompletedCount++;
					}
					
				}
			}
		}
		if (unConfirmedCount > 0 || unpassedConfirmedCount > 0 || unCompletedCount > 0) {
			StringBuffer message = new StringBuffer();
//			if (unConfirmedCount > 0) {
//				message.append("存在" + unConfirmedCount + "条未进行跟踪验证的记录！");
//			}
//			if (unpassedConfirmedCount > 0) {
//				message.append("存在" + unpassedConfirmedCount + "条跟踪验证状态是" + EnumImproveNoticeIssueTraceStatus.COMFIRM_UN_PASSED.getDescription() + "的记录！");
//			}
			if (unCompletedCount > 0) {
				message.append("存在" + unCompletedCount + "条未提交完成情况的记录！");
			}
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, message.toString());
		}
		return true;
	}
	
	public static boolean checkSubActivitiesComplete(Map<String, Object> m_param, String temp) throws Exception {
		Integer id = GetObjectId(m_param);
		if (id == null) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "未找到实体对象！");
		}
		ActivityDao activityDao = (ActivityDao) SpringBeanUtils.getBean("activityDao");
		List<ActivityDO> activities = activityDao.getByOrigin(id);
		for (ActivityDO activity : activities) {
			if (activity.getStatus() == null || !"COMPLETE".equals(activity.getStatus().getCategory())) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "编号[" + activity.getUnit().getCode() + "-" + activity.getNum() + "]的安全信息还没有完成");
			}
		}
		return true;
	}
	
	public static boolean checkHasEventAnalysis(Map<String, Object> m_param, String temp) throws Exception {
		Integer id = GetObjectId(m_param);
		if (id == null) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "未找到实体对象！");
		}
		EventAnalysisDao eventAnalysisDao = (EventAnalysisDao) SpringBeanUtils.getBean("eventAnalysisDao");
		List<EventAnalysisDO> list = eventAnalysisDao.getByActivityId(id);
		if (list.isEmpty()) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "该信息未进行SHEL分析");
		}
		return true;
	}
	
	public static boolean checkHasSubActivities(Map<String, Object> m_param, String temp) throws Exception {
		Integer id = GetObjectId(m_param);
		if (id == null) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "未找到实体对象！");
		}
		ActivityDao activityDao = (ActivityDao) SpringBeanUtils.getBean("activityDao");
		List<ActivityDO> list = activityDao.getByOrigin(id);
		if (list.isEmpty()) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "该信息未进行任务分配");
		}
		return true;
	}
	
	public static boolean checkCheckList(Map<String, Object> m_param, String temp) throws Exception {
		Integer id = GetObjectId(m_param);
		if (id == null) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "未找到实体对象！");
		}
		CheckListDao checkListDao = (CheckListDao) SpringBeanUtils.getBean("checkListDao");
		List<CheckListDO> checkList = checkListDao.getByCheck(id);
		if (checkList.size() == 0) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "请为此检查单添加检查项！");
		} else {
			return true;
		}
	}
	
	public static boolean checkActivityNotAssigned(Map<String, Object> m_param, String temp) throws Exception {
		if (activityIsAssigned(m_param, temp)) {
			// 删除 公司判定 所填写的理由
			CustomFieldValueDao customFieldValueDao = (CustomFieldValueDao) SpringBeanUtils.getBean("customFieldValueDao");
			customFieldValueDao.deleteCustomFieldValue(GetObjectId(m_param), "公司判定");
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "该安全信息已经分配了！");
		}
		return true;
	}
	
	/**
	 * 消息推送
	 * @param m_param
	 * @return
	 * @throws Exception
	 */
	public static void postMessage(Integer activityId, String[] userIds) throws Exception {
		ActivityDao activityDao = (ActivityDao) SpringBeanUtils.getBean("activityDao");
		ActivityDO activity = activityDao.internalGetById(activityId);
		if (null != activity) {
			// 处理人
			UserDao userDao = (UserDao) SpringBeanUtils.getBean("userDao");
			List<UserDO> users = userDao.internalGetByIds(userIds);
			Date date = new Date();
			String title = "SMS 安全信息分配";
			StringBuffer content = new StringBuffer();
			content.append("主题：");
			content.append(activity.getSummary());
			content.append(" 描述：");
			content.append(activity.getDescription());
			if (null != activity.getStatus()) {
				ActivityStatusDao activityStatusDao = (ActivityStatusDao) SpringBeanUtils.getBean("activityStatusDao");
				ActivityStatusDO status = activityStatusDao.internalGetById(activity.getStatus().getId());
				content.append(" 当前状态：");
				content.append(status.getName());
			}
			content.append(" 创建人：");
			content.append(activity.getCreator().getDisplayName());
			MessageDao messageDao = (MessageDao) SpringBeanUtils.getBean("messageDao");
			SmtpDao smtpDao = (SmtpDao) SpringBeanUtils.getBean("smtpDao");
			EmailDao emailDao = (EmailDao) SpringBeanUtils.getBean("emailDao");
			
			List<SmtpDO> list = smtpDao.getAllList();
			if (list.size() == 0) {
				Logger log = Logger.getLogger(UwfFuncPlugin.class);
				log.warn("没有配置smtp,无法发送邮件！");
			}
			for (UserDO user : users) {
				MessageDO message = new MessageDO();
				// 发送人取当前用户
				message.setSender(UserContext.getUser());
				message.setReceiver(user);
				message.setSendTime(date);
				message.setTitle(title);
				message.setContent(content.toString());
				message.setChecked(false);
				message.setLink(activityId.toString());
				message.setSourceType("ACTIVITY");
				messageDao.internalSave(message);
				if (list.size() > 0) {
					EmailDO email = new EmailDO();
					// 发件人
					email.setFrom(list.get(0).getAddress());
					// 收件人
					email.setTo(user.getEmail());
					email.setSubject(title);
					email.setContent(content.toString());
					// 等待发送
					email.setSendStatus(EnumSendStatus.WAITING.getCode());
					emailDao.internalSave(email);
				}
			}
			
		}
	}
	
	@SuppressWarnings( { "rawtypes", "unchecked" })
	public static String UserId(Map m_param, String user) throws Exception {
		Map<String, Object> m_user = null;
		try {
			m_user = JsonUtil.getGson().fromJson(user, Map.class);
		} catch (Exception e) {
			throw new Exception(user + "\n" + e.getMessage());
		}
		String user_id = Utility.GetStringField(m_user, "id");
		if (Utility.IsEmpty(user_id)) throw new Exception("字段[id]不存在" + "\n" + user);
		
		WriteUser(m_param, user_id);
		
		return String.valueOf(((Double)(Double.parseDouble(user_id))).intValue());
		
		//return user_id;
	}
	
	@SuppressWarnings("rawtypes")
	public static String UserApplyer(Map m_param, String nullStr) throws Exception {
		String applyer = GetApplyer(m_param);
		
		WriteUser(m_param, applyer);
		
		return applyer;
	}
	
	@SuppressWarnings("rawtypes")
	public static String UserPageField(Map m_param, String json_field) throws Exception {
		Map<String, Object> m_field = null;
		try {
			m_field = JsonUtil.getGson().fromJson(json_field, Map.class);
		} catch (Exception e) {
			throw new Exception(json_field + "\n" + e.getMessage());
		}
		String field = Utility.GetStringField(m_field, "id");
		if (Utility.IsEmpty(field)) throw new Exception("字段[id]不存在" + "\n" + json_field);
		
		ActivityDao add = (ActivityDao) SpringBeanUtils.getBean("activityDao");
		if (add == null) throw new Exception("无法获得ActivityDao");
		
		int activityId = GetObjectId(m_param);
		ActivityDO ado = add.internalGetById(activityId);
		Map<String, Object> m_ado = add.convert(ado);
		
		CustomFieldValueDao cfvd = (CustomFieldValueDao) SpringBeanUtils.getBean("customFieldValueDao");
		Map<Integer, Map<String, Object>> list_cfv = cfvd.findByIds(new String[] { String.valueOf(activityId) });
		Map<String, Object> m_cfv = list_cfv.get(activityId);
		if (m_cfv != null) m_ado.putAll(m_cfv);
		
		//		Map m_page_param = GetPageParam(m_param);
		
		String user_id = Utility.GetStringField(m_ado, field);
		if (Utility.IsEmpty(user_id)) throw new Exception("字段[" + field + "]不存在");
		
		WriteUser(m_param, user_id);
		return user_id;
	}
	
	/*
	 * public static String UserGroup(HttpServletRequest request, String
	 * group_id) throws Exception, Exception { TransactionHelper
	 * transactionHelper = (TransactionHelper)
	 * WebApplicationContextUtils.getRequiredWebApplicationContext(request.getSession().getServletContext()).getBean("transactionHelper");
	 * return (String) transactionHelper.doInTransaction(new SmsFunction(),
	 * "UserGroup", request,group_id); }
	 */

	@SuppressWarnings("rawtypes")
	public static String UserGroup(Map m_param, String json_group) throws Exception {
		Map<String, Object> m_group = null;
		try {
			m_group = JsonUtil.getGson().fromJson(json_group, Map.class);
		} catch (Exception e) {
			throw new Exception(json_group + "\n" + e.getMessage());
		}
		String group_id = Utility.GetStringField(m_group, "id");
		if (Utility.IsEmpty(group_id)) throw new Exception("字段[id]不存在" + "\n" + json_group);
		
		//UserGroupDao ugd = (UserGroupDao)GetDao(m_param, "userGroupDao");
		UserGroupDao ugd = (UserGroupDao) SpringBeanUtils.getBean("userGroupDao");
		List<Integer> list_user = ugd.getUserIdsByUserGroup(((Double)(Double.parseDouble(group_id))).intValue());
//		if (list_user == null || list_user.size() == 0) throw new Exception("用户组" + m_group.get("name") + "下没有设置人");
		
		String userlist = "";
		for (Integer user : list_user) {
			if (!Utility.IsEmpty(userlist)) userlist += ",";
			userlist += user.toString();
		}
		WriteUser(m_param, userlist);
		return userlist;
	}
	
	@SuppressWarnings("rawtypes")
	public static String getByUserGroups(Map m_param, String groups) throws Exception {
		List<Map<String, Object>> groupMaps = gson.fromJson(groups, new TypeToken<List<Map<String, Object>>>() {}.getType());
		// 转换成int
		List<Integer> intGroupIds = new ArrayList<Integer>();
		for (Map<String, Object> groupMap : groupMaps) {
			intGroupIds.add(((Double) groupMap.get("id")).intValue());
		}
		
		UserGroupDao userGroupDao = (UserGroupDao) SpringBeanUtils.getBean("userGroupDao");
		List<Integer> userIds = userGroupDao.getUserIdsByUserGroupIds(intGroupIds);
		
		String userlist = StringHelper.listToString(new ArrayList<Integer>(userIds), ",", false);
		WriteUser(m_param, userlist);
		return userlist;
	}
	
	@SuppressWarnings("rawtypes")
	//根据项目角色选人
	public static String UserUnitRole(Map m_param, String role_id) throws Exception {
		Integer id = GetObjectId(m_param);
		Map<String, Object> roleMap = gson.fromJson(role_id, new TypeToken<Map<String, Object>>() {}.getType());
		int roleId = ((Double) roleMap.get("id")).intValue();
		BaseDao<? extends AbstractBaseDO> baseDao = getDataAccessObject(m_param);
		Collection<Integer> idList = null;
		if (baseDao instanceof IUwfFuncPlugin) {
			idList = ((IUwfFuncPlugin) baseDao).getUserByUnitRole(id, roleId);
			String userlist = StringHelper.listToString(new ArrayList<Integer>(idList), ",", false);
			WriteUser(m_param, userlist);
			return userlist;
		}
		return null;
	}
	
	/**
	 * 根据安监机构角色选人（多选）
	 * @param m_param
	 * @param role_id
	 * @return
	 * @throws Exception
	 */
	public static String getByUnitRoles(Map m_param, String roleIds) throws Exception {
		Integer id = GetObjectId(m_param);
		List<Map<String, Object>> roleMaps = gson.fromJson(roleIds, new TypeToken<List<Map<String, Object>>>() {}.getType());
		// 转换成int
		List<Integer> intRoleIds = new ArrayList<Integer>();
		for (Map<String, Object> roleMap : roleMaps) {
			intRoleIds.add(((Double) roleMap.get("id")).intValue());
		}
		BaseDao<? extends AbstractBaseDO> baseDao = getDataAccessObject(m_param);
		Collection<Integer> idList = null;
		if (baseDao instanceof IUwfFuncPlugin) {
			idList = ((IUwfFuncPlugin) baseDao).getUserByUnitRoles(id, intRoleIds);
			String userlist = StringHelper.listToString(new ArrayList<Integer>(idList), ",", false);
			WriteUser(m_param, userlist);
			return userlist;
		}
		return null;
	}
	

	/**
	 * 根据组织角色选人
	 * @param m_param
	 * @param role_id
	 * @return
	 * @throws Exception
	 */
	public static String getByOrganizationRole(Map m_param, String roleId) throws Exception {
		Integer id = GetObjectId(m_param);
		Map<String, Object> roleMap = gson.fromJson(roleId, new TypeToken<Map<String, Object>>() {}.getType());
		// 转换成int
		Integer intRoleId = ((Double) roleMap.get("id")).intValue();
		BaseDao<? extends AbstractBaseDO> baseDao = getDataAccessObject(m_param);
		Collection<Integer> idList = null;
		if (baseDao instanceof IUwfFuncPlugin) {
			idList = ((IUwfFuncPlugin) baseDao).getUserByOrganizationRole(id, intRoleId, null);
			String userlist = StringHelper.listToString(new ArrayList<Integer>(idList), ",", false);
			WriteUser(m_param, userlist);
			return userlist;
		}
		return null;
	}
	
	/**
	 * 根据组织角色选人(多选)
	 * @param m_param
	 * @param role_id
	 * @return
	 * @throws Exception
	 */
	public static String getByOrganizationRoles(Map m_param, String roleIds) throws Exception {
		Integer id = GetObjectId(m_param);
		List<Map<String, Object>> roleMaps = gson.fromJson(roleIds, new TypeToken<List<Map<String, Object>>>() {}.getType());
		// 转换成int
		List<Integer> intRoleIds = new ArrayList<Integer>();
		for (Map<String, Object> roleMap : roleMaps) {
			intRoleIds.add(((Double) roleMap.get("id")).intValue());
		}
		BaseDao<? extends AbstractBaseDO> baseDao = getDataAccessObject(m_param);
		Collection<Integer> idList = null;
		if (baseDao instanceof IUwfFuncPlugin) {
			idList = ((IUwfFuncPlugin) baseDao).getUserByOrganizationRoles(id, intRoleIds, null);
			String userlist = StringHelper.listToString(new ArrayList<Integer>(idList), ",", false);
			WriteUser(m_param, userlist);
			return userlist;
		}
		return null;
	}
	
	/**
	 * 根据审计实施主体组织角色选人(多选)
	 * @param m_param
	 * @param role_id
	 * @return
	 * @throws Exception
	 */
	public static String getByOperatorOrganizationRoles(Map m_param, String roleIds) throws Exception {
		Integer id = GetObjectId(m_param);
		List<Map<String, Object>> roleMaps = gson.fromJson(roleIds, new TypeToken<List<Map<String, Object>>>() {}.getType());
		// 转换成int
		List<Integer> intRoleIds = new ArrayList<Integer>();
		for (Map<String, Object> roleMap : roleMaps) {
			intRoleIds.add(((Double) roleMap.get("id")).intValue());
		}
		BaseDao<? extends AbstractBaseDO> baseDao = getDataAccessObject(m_param);
		Collection<Integer> idList = null;
		if (baseDao instanceof IUwfFuncPlugin) {
			idList = ((IUwfFuncPlugin) baseDao).getUserByOrganizationRoles(id, intRoleIds, "operator");
			String userlist = StringHelper.listToString(new ArrayList<Integer>(idList), ",", false);
			WriteUser(m_param, userlist);
			return userlist;
		}
		return null;
	}
	
	/**
	 * 根据审计对象组织角色选人(多选)
	 * @param m_param
	 * @param role_id
	 * @return
	 * @throws Exception
	 */
	public static String getByTargetOrganizationRoles(Map m_param, String roleIds) throws Exception {
		Integer id = GetObjectId(m_param);
		List<Map<String, Object>> roleMaps = gson.fromJson(roleIds, new TypeToken<List<Map<String, Object>>>() {}.getType());
		// 转换成int
		List<Integer> intRoleIds = new ArrayList<Integer>();
		for (Map<String, Object> roleMap : roleMaps) {
			intRoleIds.add(((Double) roleMap.get("id")).intValue());
		}
		BaseDao<? extends AbstractBaseDO> baseDao = getDataAccessObject(m_param);
		Collection<Integer> idList = null;
		if (baseDao instanceof IUwfFuncPlugin) {
			idList = ((IUwfFuncPlugin) baseDao).getUserByOrganizationRoles(id, intRoleIds, "target");
			String userlist = StringHelper.listToString(new ArrayList<Integer>(idList), ",", false);
			WriteUser(m_param, userlist);
			return userlist;
		}
		return null;
	}

	/** 
	 * 根据表单中填写的组织和设置的角色选人 匿名员工报告专用
	 * @param m_param
	 * @param role_id
	 * @return
	 * @throws Exception
	 */
	public static String getByOrganizationAndRole(Map<String, Object> m_param, String roleMapStr) throws Exception {
		Integer id = GetObjectId(m_param);
		Map<String, Object> roleMap = gson.fromJson(roleMapStr, new TypeToken<Map<String, Object>>() {}.getType());
		int roleId = ((Double) roleMap.get("id")).intValue();
		BaseDao<? extends AbstractBaseDO> baseDao = getDataAccessObject("organization");
		Collection<Integer> idList = null;
		if (baseDao instanceof IUwfFuncPlugin) {
			idList = ((IUwfFuncPlugin) baseDao).getUserByOrganizationRole(id, roleId, null);
			String userlist = StringHelper.listToString(new ArrayList<Integer>(idList), ",", false);
			WriteUser(m_param, userlist);
			return userlist;
		}
		return null;
	}
	
	/**
	 * 根据其他安监机构选人
	 * @param m_param
	 * @param role_id
	 * @return
	 * @throws Exception
	 */
	public static String getByUnitsRole(Map m_param, String role_id) throws Exception {
		if(StringUtils.isBlank(role_id)){
			return "";
		}
		Map<String, Object> roleMap = gson.fromJson(role_id, new TypeToken<Map<String, Object>>() {}.getType());
		int roleId = ((Double) roleMap.get("id")).intValue();
		
		Integer id = GetObjectId(m_param);
		TemUnitDao temUnitDao = (TemUnitDao) SpringBeanUtils.getBean("temUnitDao");
		if (temUnitDao == null) {
			throw new Exception("无法获得TemUnitDao");
		}
		List<TemUnitDO> temUnits = temUnitDao.getByActivity(id);
		
		// 根据TemUnit获取安监机构的id
		List<Integer> unitIds = new ArrayList<Integer>();
		for(TemUnitDO temUnit : temUnits){
			if(null != temUnit.getUnit()){
				unitIds.add(temUnit.getUnit().getId());
			}
		}
		
		UnitRoleActorDao unitRoleActorDao = (UnitRoleActorDao) SpringBeanUtils.getBean("unitRoleActorDao");
		if (unitRoleActorDao == null) {
			throw new Exception("无法获得UnitRoleActorDao");
		}
		
		// 通过角色id和安监机构id获取用户id
		Set<Integer> userIds = unitRoleActorDao.getUserIdsByUnitIdsAndRoleId(roleId, unitIds);
		//转换成逗号隔开的string
		String userlist = StringHelper.listToString(new ArrayList<Integer>(userIds), ",", false);
		WriteUser(m_param, userlist);
		return userlist;
	}
	
	/**
	 * 根据业务表单选人
	 * @param m_param
	 * @param role_id
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public static String getByBusinessForm(Map m_param, String input) throws Exception {
		if(StringUtils.isBlank(input)){
			return "";
		}
		Set<Integer> userIds = new HashSet<Integer>();
		Integer id = GetObjectId(m_param);
		Map<String, Object> inputMap = gson.fromJson(input, new TypeToken<Map<String, Object>>() {}.getType());
		String dataobject = (String) inputMap.get("dataobject");
		String field = (String) inputMap.get("field");
		BaseDao<? extends AbstractBaseDO> baseDao = getDataAccessObject(dataobject);
		AbstractBaseDO baseDO = baseDao.internalGetById(id);
		Class<?> clazz = baseDO.getClass();
		Method getter = BeanHelper.determineGetter(clazz, field);
		Object o = getter.invoke(baseDO);
		String userlist = "";
		if (o instanceof Collection) {
			for (Object obj : (Collection<? extends AbstractBaseDO>) o) {
				clazz = obj.getClass();
				getter = BeanHelper.determineGetter(clazz, "user");
				UserDO user = (UserDO) getter.invoke(obj);
				userIds.add(user.getId());
			}
			userlist = StringHelper.listToString(new ArrayList<Integer>(userIds), ",", false);
		} else if (o instanceof AbstractBaseDO) {
			getter = BeanHelper.determineGetter(clazz, "user");
			UserDO user = (UserDO) getter.invoke(o);
			userlist = user.getId().toString();
		} else if (o instanceof String){
			userlist = (String)o;
		}
		WriteUser(m_param, userlist);
		return userlist;
	}
	
	/**
	 * 根据当前用户选人
	 * @param m_param
	 * @param input
	 * @return
	 */
	public static String getCurrentUser(Map m_param, String input){
		Integer userId = UserContext.getUserId();
		return userId.toString();
	}
	
	public static boolean testTrigger(Map m_param, String value) throws Exception {
		System.out.println("test trigger");
		
		return false;
	}
	
	/**
	 * 判断创建人所属组织的级别是否是所给的级别
	 * @param m_param
	 * @param value
	 * @return
	 * @throws Exception
	 */
	public static boolean isOlevel(Map m_param, String olevel) throws Exception {
		// 测试数据
//		olevel = "4";
		olevel = gson.fromJson(olevel, String.class);
		boolean result = false;
		Integer activityId = GetObjectId(m_param);
		ActivityDao activityDao = (ActivityDao) SpringBeanUtils.getBean("activityDao");
		ActivityDO activity = activityDao.internalGetById(activityId);
		if (null != activity) {
			OrganizationDao organizationDao = (OrganizationDao) SpringBeanUtils.getBean("organizationDao");
			List<OrganizationDO> organizations = organizationDao.getByUser(activity.getCreator().getId());
			if (!organizations.isEmpty()) {
				OrganizationDO organization = organizations.get(0);
				if (null != organization.getOlevel() && organization.getOlevel().equals(olevel)) {
					result = true;
				}
			}
		}
		
		return result;
	}
	
	/**
	 * 判断创建人所属组织的级别是否不是所给的级别
	 * @param m_param
	 * @param value
	 * @return
	 * @throws Exception
	 */
	public static boolean isNotOlevel(Map m_param, String olevel) throws Exception {
		return !isOlevel(m_param, olevel);
	}
	
	/**
	 * 判断信息表单中填写的组织级别是否是所给的级别
	 * @param m_param
	 * @param value
	 * @return
	 * @throws Exception
	 */
	public static boolean isOlevelOfForm(Map m_param, String olevel) throws Exception {
		olevel = gson.fromJson(olevel, String.class);
		Integer activityId = GetObjectId(m_param);
		CustomFieldValueDao customFieldValueDao = (CustomFieldValueDao) SpringBeanUtils.getBean("customFieldValueDao");
		List<CustomFieldValueDO> customFieldValueList = customFieldValueDao.getByActivityId(activityId);
		if (customFieldValueList == null || customFieldValueList.size() == 0) {
			return false;
		}
		CustomFieldDao customFieldDao = (CustomFieldDao) SpringBeanUtils.getBean("customFieldDao");
		List<CustomFieldDO> customFieldList = customFieldDao.getByName("员工报告处理部门ID");
		if (customFieldList == null || customFieldList.size() == 0) {
			return false;
		}
		for (CustomFieldValueDO customFieldValue : customFieldValueList) {
			if (("customfield_" + customFieldList.get(0).getId()).equals(customFieldValue.getKey())) {
				String deptId = customFieldValue.getStringValue();
				if (!StringUtils.isBlank(deptId)) {
					OrganizationDao organizationDao = (OrganizationDao) SpringBeanUtils.getBean("organizationDao");
					OrganizationDO organization = organizationDao.internalGetById(Integer.parseInt(deptId));
					if (null != organization && null != organization.getOlevel() && organization.getOlevel().equals(olevel)) {
						return true;
					}
				}
			}
		}
		
		return false;
	}
	
	/**
	 * 判断信息表单中填写的组织级别是否不是所给的级别
	 * @param m_param
	 * @param value
	 * @return
	 * @throws Exception
	 */
	public static boolean isNotOlevelOfForm(Map m_param, String olevel) throws Exception {
		return !isOlevelOfForm(m_param, olevel);
	}
	
	/**
	 * 判断整改通知单子单的责任单位是否是安全检查部
	 */
	public static boolean improveUnitIsAnJianBu(Map m_param, String temp) throws Exception {
		int id = GetObjectId(m_param);
		SubImproveNoticeDao subImproveNoticeDao = (SubImproveNoticeDao) SpringBeanUtils.getBean("subImproveNoticeDao");
		SubImproveNoticeDO subImproveNotice = subImproveNoticeDao.internalGetById(id);
		UnitDao unitDao = (UnitDao) SpringBeanUtils.getBean("unitDao");
		Integer anJianBuId = unitDao.getAnJianBuId(true);
		String improveUnit = subImproveNotice.getImproveUnit();
		if (improveUnit.substring(2).equals(anJianBuId.toString())) {
			return true;
		}
		return false;
	}
	
	/**
	 * 判断整改通知单子单的责任单位是否不是安全检查部
	 */
	public static boolean improveUnitIsNotAnJianBu(Map m_param, String temp) throws Exception {
		return !improveUnitIsAnJianBu(m_param, temp);
	}
	
	/**
	 * 判断整改通知单子单的责任单位是否是安监机构
	 */
	public static boolean improveUnitIsUnit(Map m_param, String temp) throws Exception {
		int id = GetObjectId(m_param);
		SubImproveNoticeDao subImproveNoticeDao = (SubImproveNoticeDao) SpringBeanUtils.getBean("subImproveNoticeDao");
		SubImproveNoticeDO subImproveNotice = subImproveNoticeDao.internalGetById(id);
		String improveUnit = subImproveNotice.getImproveUnit();
		if (improveUnit.startsWith(AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT)) {
			return true;
		}
		return false;
	}
	
	/**
	 * 判断整改通知单子单的责任单位不是否是安监机构
	 */
	public static boolean improveUnitIsNotUnit(Map m_param, String temp) throws Exception {
		return !improveUnitIsUnit(m_param, temp);
	}
	
	public static boolean activityUnitIsAnJianBu(Map m_param, String temp) throws Exception {
		int id = GetObjectId(m_param);
		ActivityDao activityDao = (ActivityDao) SpringBeanUtils.getBean("activityDao");
		ActivityDO activity = activityDao.internalGetById(id);
		UnitDao unitDao = (UnitDao) SpringBeanUtils.getBean("unitDao");
		Integer anJianBuId = unitDao.getAnJianBuId(true);
		return activity.getUnit().getId().equals(anJianBuId);
	}
	
	public static boolean activityUnitIsNotAnJianBu(Map m_param, String temp) throws Exception {
		return !activityUnitIsAnJianBu(m_param, temp);
	}
	
	public static boolean activityIsNotAssigned(Map m_param, String temp) throws Exception {
		int id = GetObjectId(m_param);
		ActivityDao activityDao = (ActivityDao) SpringBeanUtils.getBean("activityDao");
		return activityDao.getByOrigin(id).isEmpty();
	}
	
	public static boolean activityIsAssigned(Map m_param, String temp) throws Exception {
		return !activityIsNotAssigned(m_param, temp);
	}
	
	public static boolean SetActivityStatus(Map m_param, String role_id) throws Exception {
		String wi_id = GetWiid(m_param);
		String wip_id = GetWipid(m_param);
		DbClient dc = GetDc(m_param);
		
		if (Utility.IsEmpty(wip_id)) throw new Exception("功能没有定义在路径上");
		
		//获取下一节点id
		String sql = "select next_name from workflow_inst_path where wip_id = ?";
		List<Map<String, Object>> rs_path = dc.executeQuery(sql, wip_id);
		if (rs_path == null) throw new Exception(dc.ErrorMessage);
		if (rs_path.isEmpty()) throw new Exception("路径" + wip_id + "不存在");
		String next_name = (String)rs_path.get(0).get("NEXT_NAME");
		if (Utility.IsEmpty(next_name)) {
			System.out.println("SetActivityStatus: next_name为空，直接返回");
			return true;
		}
		sql = "select win_id from workflow_inst_node where wi_id = ? and name = ? order by win_id desc";
		List<Map<String,Object>> rs_node = dc.executeQuery(sql, wi_id, dc.FormatString(next_name));
		if (rs_node == null) throw new Exception(dc.ErrorMessage);
		if (rs_node.isEmpty()) throw new Exception("节点[" + next_name + "]不存在");
		String win_id = (String) rs_node.get(0).get("WIN_ID");
		
		//获取state属性
//		sql = "select attr_value from workflow_inst_attr where wi_id = " + wi_id + " and win_id = " + win_id + " and attr_name = 'state'";
		// 获取节点的所有属性
//		sql = "select attr_name, attr_value from workflow_inst_attr where wi_id = " + wi_id + " and win_id = " + win_id;
//		ResultSet rs_attr = dc.ExecuteQuery(sql);
		sql = "select attr_name, attr_value from workflow_inst_attr where wi_id = ? and win_id = ?";
		List<Map<String, Object>> rs_attr = dc.executeQuery(sql, wi_id, win_id);
		if (rs_attr == null) throw new Exception(dc.ErrorMessage);
//		if (!rs_attr.next()) {
//			//throw new Exception("节点没有state属性");
//			return true;
//		}
		
		List<Map<String, Object>> attributes = Utility.formatResultMaps(rs_attr);
		Map<String, Object> attributeMap = new HashMap<String, Object>();
		// 将list里的map放在一个map里
		for (Map<String, Object> attribute : attributes) {
			attributeMap.put((String) attribute.get("attr_name"), attribute.get("attr_value"));
		}
		int statusId = Double.valueOf((String)attributeMap.get("state")).intValue();
		
		int id = GetObjectId(m_param);
		String objName = getObjectName(m_param);
		
		//写入wf_activity_status
		sql = "insert into wf_activity_status(was_id,wi_id,wip_id,activity_id,status,user_id,last_update) values(" + dc.GetSeqNextValue("id_seq") + "," + wi_id + "," + wip_id + "," + id + "," + statusId + "," + "'" + dc.FormatString(GetUserId(m_param)) + "'," + dc.GetSysdate() + ")";
		if (dc.Execute(sql) < 0) throw new Exception(dc.ErrorMessage);
		
		//add.changeActivityStatus(activityId, statusId);
//		sql = "update t_activity set status_id = " + statusId + " where id = " + id;
//		int ect = dc.Execute(sql);
//		if (ect < 0)
//			throw new Exception(dc.ErrorMessage);
//		if (ect == 0)
//			throw new Exception(objName + "[" + id + "]不存在");
		
		BaseDao<? extends AbstractBaseDO> baseDao = getDataAccessObject(objName);
		if (baseDao instanceof IUwfFuncPlugin) {
			((IUwfFuncPlugin) baseDao).setStatus(id, statusId, attributeMap);
		}
		
		return true;
	}
	
	/**
	 * TEM必填验证
	 * @param m_param
	 * @param role_id
	 * @return
	 * @throws Exception
	 */
	public static boolean checkTem(Map<String, Object> m_param, String role_id) throws Exception{
		
		List<String> details = new ArrayList<String>();
		Integer activityId = GetObjectId(m_param);
		TemDao temDao = (TemDao) SpringBeanUtils.getBean("temDao");
		List<TemDO> tems = temDao.getByActivityId(activityId);		
		if(null == tems||tems.size()==0){			
			details.add("必须添加TEM块");//待优化必填验证
		}
		if (details.isEmpty()) {
			return true;
		} else {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, StringUtils.join(details.toArray(), ","));
		}
	}
	
	/**
	 * 信息获取必填验证
	 * @param m_param
	 * @param role_id
	 * @return
	 * @throws Exception
	 */
	public static boolean checkAccessInfo(Map<String, Object> m_param, String role_id) throws Exception {
		List<String> details = new ArrayList<String>();
		Integer activityId = GetObjectId(m_param);
		ActivityDao activityDao = (ActivityDao) SpringBeanUtils.getBean("activityDao");
		ActivityDO activity = activityDao.internalGetById(activityId);
		if(null != activity){
			// 发生时间
			AccessInformationDao accessInformationDao = (AccessInformationDao) SpringBeanUtils.getBean("accessInformationDao");
			AccessInformationDO accessInformation = accessInformationDao.getByActivityId(activityId);
			if(null == accessInformation || null == accessInformation.getOccurredDate()){
				details.add("发生时间不能为空");
			}
			// 单位信息
			OrganizationEntityDao organizationEntityDao = (OrganizationEntityDao) SpringBeanUtils.getBean("organizationEntityDao");
			List<OrganizationEntityDO> organizationEntitys = organizationEntityDao.getByActivityId(activityId);
			if (organizationEntitys.isEmpty()) {
				details.add("单位信息不能为空");
			}
			// 航班信息
			FlightInfoEntityDao flightInfoEntityDao = (FlightInfoEntityDao) SpringBeanUtils.getBean("flightInfoEntityDao");
			List<FlightInfoEntityDO> flightInfoEntitys = flightInfoEntityDao.getByActivityId(activityId);
			// 地面位置
			GroundPositionEntityDao groundPositionEntityDao = (GroundPositionEntityDao) SpringBeanUtils.getBean("groundPositionEntityDao");
			List<GroundPositionEntityDO> groundPositionEntitys = groundPositionEntityDao.getByActivityId(activityId);
			// 车辆信息
			VehicleInfoEntityDao vehicleInfoEntityDao = (VehicleInfoEntityDao) SpringBeanUtils.getBean("vehicleInfoEntityDao");
			List<VehicleInfoEntityDO> vehicleInfoEntitys = vehicleInfoEntityDao.getByActivityId(activityId);
			// 维护工具
			MaintainToolEntityDao maintainToolEntityDao = (MaintainToolEntityDao) SpringBeanUtils.getBean("maintainToolEntityDao");
			List<MaintainToolEntityDO> maintainToolEntitys = maintainToolEntityDao.getByActivityId(activityId);
			
			if(flightInfoEntitys.isEmpty() || groundPositionEntitys.isEmpty() || vehicleInfoEntitys.isEmpty() || maintainToolEntitys.isEmpty()){
				details.add("航班信息、地面位置、车辆信息、维护工具至少有一项不能为空");
			}
		}
		if (details.isEmpty()) {
			return true;
		} else {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, StringUtils.join(details.toArray(), ","));
		}
	}
	
	/**
	 * 信息详情相关字段必填验证
	 * @param m_param
	 * @param role_id
	 * @return
	 * @throws Exception
	 */
	public static boolean checkSafeInfo(Map<String, Object> m_param, String role_id) throws Exception {
		List<String> details = new ArrayList<String>();
		Integer activityId = GetObjectId(m_param);
		ActivityDao activityDao = (ActivityDao) SpringBeanUtils.getBean("activityDao");
		ActivityDO activity = activityDao.internalGetById(activityId);
		if(null != activity){
			// 优先级
			if(null == activity.getPriority()){
				details.add("优先级不能为空");
			}
			// 主题
			if(StringUtils.isBlank(activity.getSummary())){
				details.add("主题不能为空");
			}
		}
		if (details.isEmpty()) {
			return true;
		} else {
			throw new Exception(StringUtils.join(details.toArray(), ","));
		}
	}
	
	/**
	 * 信息反馈(给信息的创建人进行反馈)
	 * @param m_param
	 * @param sendingModes 发送模式(MESSAGE,SHORT_MESSAGE,EMAIL)
	 * @return
	 * @throws Exception
	 */
	public static void postFunction(Map<String, Object> m_param, String sendingModes) throws Exception {
		List<Map<String, Object>> sendingModeMaps = gson.fromJson(sendingModes, new TypeToken<List<Map<String, Object>>>() {}.getType());
		// 转换成
		List<String> sendingModeList = new ArrayList<String>();
		for (Map<String, Object> sendingModeMap : sendingModeMaps) {
			sendingModeList.add((String) sendingModeMap.get("id"));
		}
		Integer id = GetObjectId(m_param);
		
		BaseDao<? extends AbstractBaseDO> baseDao = getDataAccessObject(m_param);
		if (baseDao instanceof IUwfFuncPlugin) {
			((IUwfFuncPlugin) baseDao).sendFeedbackMsg(id, sendingModeList);
		}
	}

	/**
	 * 机长报告反馈
	 * @param m_param
	 * @return
	 * @throws Exception
	 */
	public static void postFunctionForAircraftCommanderReport(Map<String, Object> m_param, String temp) throws Exception {
		String postContent = null;
		String confirmer = null;
		Integer activityId = GetObjectId(m_param);
		ActivityDao activityDao = (ActivityDao) SpringBeanUtils.getBean("activityDao");
		ActivityDO activity = activityDao.internalGetById(activityId);
		if (null != activity) {
			// 获取机长报告反馈自定义字段对应的key值
			String confirmerKey = null;
			String postKey = null;
			FieldRegister fieldRegister = (FieldRegister) SpringBeanUtils.getBean("fieldRegister");
			for (com.usky.sms.field.Field field : fieldRegister.getAllFields()) {
				String fieldName = field.getName();
				if ("机长报告反馈".equals(fieldName)) {
					postKey = field.getKey();
				} else if ("原机长报告创建人工号".equals(fieldName)) {
					confirmerKey = field.getKey();
				}
				if (confirmerKey != null && postKey != null) {
					break;
				}
			}
			
			// 获取原机长报告创建人的手机号和反馈内容
			Set<CustomFieldValueDO> customFieldValues = activity.getValues();
			
			for (CustomFieldValueDO customFieldValue : customFieldValues) {
				if (null != confirmerKey && confirmerKey.equals(customFieldValue.getKey())) {
					confirmer = customFieldValue.getStringValue();
				} else if (null != postKey && postKey.equals(customFieldValue.getKey())) {
					postContent = customFieldValue.getTextValue();
				}
				if (confirmer != null && postContent != null) {
					break;
				}
			}
			
			if (confirmer != null) {
				// 电话号码
				FlightCrewMemberDao flightCrewMemberDao = (FlightCrewMemberDao) SpringBeanUtils.getBean("flightCrewMemberDao");
				FlightCrewMemberDO flightCrewMember = flightCrewMemberDao.getByWorkNo(confirmer);
			
				// 发送短信和邮件
				if (flightCrewMember != null && StringUtils.isNotBlank(flightCrewMember.getMobil_no())) {
					StringBuffer content = new StringBuffer();
					content.append("您提交的机长报告[主题：");
					content.append(activity.getSummary());
					content.append("]");
					content.append("已开始被处理！反馈内容如下：");
					content.append(postContent);
					
					// 发送短信
					ShortMessageDao shortMessageDao = (ShortMessageDao) SpringBeanUtils.getBean("shortMessageDao");
					ShortMessageDO shortMessage = new ShortMessageDO();
					shortMessage.setCreator(UserContext.getUser());
					shortMessage.setReceiveTel(flightCrewMember.getMobil_no());
					shortMessage.setMsgContent(content.toString());
					shortMessageDao.internalSave(shortMessage);
				}
			}
		}
	}
	
	/**
	 * 对整改通知单的操作进行日志记录
	 * @param m_param
	 * @param logType
	 * @throws Exception
	 */
	public static void recordImproveNoticeLog(Map<String, Object> m_param, String logType) throws Exception {
		if (!StringUtils.isBlank(logType)) {
			Map<String, Object> logTypeMap = JsonUtil.getGson().fromJson(logType, new TypeToken<Map<String, Object>>(){}.getType());
			String type = (String) logTypeMap.get("id");
			Integer id = GetObjectId(m_param);
			ImproveDao improveDao = (ImproveDao) SpringBeanUtils.getBean("improveDao");
			ImproveDO improve = improveDao.internalGetById(id);
			Set<CheckListDO> checkLists = improve.getCheckLists();
			if (null != checkLists) {
				for (CheckListDO checkList : checkLists) {
					List<String> details = new ArrayList<String>();
					if (EnumImproveNoticeLogType.MESASURE_REASEON.toString().equals(type)) { // 记录措施和原因
						details.add("修改分析原因为:" + checkList.getImproveReason());
						details.add("修改整改措施为:" + checkList.getImproveMeasure());
					} else if (EnumImproveNoticeLogType.OPERATION.toString().equals(type)) { // 记录操作动作
						// 获取操作动作的名称
						String wp_id = GetWipid(m_param);
						String sql = "select name workflow_inst_path wip where wip.wip_id = ?";
						DbClient dc = GetDc(m_param);
						List<Map<String, Object>> result = dc.executeQuery(sql, wp_id);
						if (!result.isEmpty()) {
							details.add("执行了:" + result.get(0).get("NAME") + "操作");
						}
					}
					if (!details.isEmpty()) {
						MDC.put("details", details.toArray());
						AuditActivityLoggingDao auditActivityLoggingDao = (AuditActivityLoggingDao) SpringBeanUtils.getBean("auditActivityLoggingDao");
						auditActivityLoggingDao.addLogging(checkList.getId(), "checkList", AuditActivityLoggingOperationRegister.getOperation("UPDATE_CHECK_LIST"));
						MDC.remove("details");
					}
				}
			}
		}
	}
	
	/**
	 * 添加信息获取的发生时间
	 * @param m_param
	 * @param emailAddr
	 * @throws Exception
	 */
	public static void addOccurredDate(Map<String, Object> m_param, String emailAddr) throws Exception {
		Integer activityId = GetObjectId(m_param);
		ActivityDao activityDao = (ActivityDao) SpringBeanUtils.getBean("activityDao");
		ActivityDO activity = activityDao.internalGetById(activityId);
		if (null != activity) {
			AccessInformationDao accessInformationDao = (AccessInformationDao) SpringBeanUtils.getBean("accessInformationDao");
			AccessInformationDO accessInformation = accessInformationDao.getByActivityId(activityId);
			if (null == accessInformation) {
				Map<String,Object> map = new HashMap<String, Object>();
				map.put("activity", activityId);
				map.put("occurredDate", new Date());
				accessInformationDao.save(map);
			} else {
				accessInformation.setOccurredDate(new Date());
				accessInformationDao.update(accessInformation);
			}
		}
	}
	
	/**
	 * 实例工作单的流程
	 * @param m_param
	 * @param emailAddr
	 * @throws Exception
	 */
	public static void instanceTaskWorkflow(Map<String, Object> m_param, String temp) throws Exception {
		Integer planId = GetObjectId(m_param);
		PlanDao planDao = (PlanDao) SpringBeanUtils.getBean("planDao");
		AuditWorkflowSchemeDao auditWorkflowSchemeDao = (AuditWorkflowSchemeDao) SpringBeanUtils.getBean("auditWorkflowSchemeDao");
		PlanDO plan = planDao.internalGetById(planId);
		String workflowTemplateId = auditWorkflowSchemeDao.getWorkflowTempIdBySearch(plan.getPlanType(), plan.getCheckType(), "TASK");
		TaskDao taskDao = (TaskDao) SpringBeanUtils.getBean("taskDao");
		DbClient dc = GetDc(m_param);
		Connection conn = dc.GetConnection();
		List<TaskDO> tasks = taskDao.getByPlanId(planId);
		for (TaskDO task : tasks) {
			Map<String, Object> objmap = new HashMap<String, Object>();
			objmap.put("id", task.getId());
			objmap.put("dataobject", "task");
			String flowId = WfSetup.Submit(conn, UserContext.getUserId().toString(), workflowTemplateId, "", "", JsonUtil.toJson(objmap));
			task.setFlowId(flowId);
			taskDao.internalUpdate(task);
		}
	}
	
	/**
	 * 整改单拒绝时签批件拒绝处理
	 * @param m_param
	 * @param temp
	 * @throws Exception
	 */
	public static void rejectImproveFile(Map<String, Object> m_param, String temp) throws Exception {
		Integer improveId = GetObjectId(m_param);
		FileDao fileDao = (FileDao) SpringBeanUtils.getBean("fileDao");
		List<FileDO> files = fileDao.getFilesBySource(EnumFileType.IMPROVE.getCode(), improveId);
		for (FileDO file : files) {
			file.setSourceType(EnumFileType.IMPROVE_REJECTED.getCode());
			fileDao.update(file);
		}
	}
	
	/**
	 * 重置整改通知单中被审核拒绝的问题的状态
	 * 上传的附件的拒绝处理
	 * @param m_param
	 * @param emailAddr
	 * @throws Exception
	 */
	public static void resetRejectedImproveNoticeIssueStatus(Map<String, Object> m_param, String temp) throws Exception {
		Integer subImproveNoticeId = GetObjectId(m_param);
		ImproveNoticeIssueDao improveNoticeIssueDao = (ImproveNoticeIssueDao) SpringBeanUtils.getBean("improveNoticeIssueDao");
		List<ImproveNoticeIssueDO> improveNoticeIssues = improveNoticeIssueDao.getBySubImproveNoticeId(subImproveNoticeId);
		for (ImproveNoticeIssueDO improveNoticeIssue : improveNoticeIssues) {
			if (EnumImproveNoticeIssueStatus.AUDIT_REJECTED.toString().equals(improveNoticeIssue.getStatus())) {
				improveNoticeIssue.setStatus(null);
				improveNoticeIssueDao.update(improveNoticeIssue);
			}
		}
		// 上传的附件的拒绝处理
		FileDao fileDao = (FileDao) SpringBeanUtils.getBean("fileDao");
		List<FileDO> files = fileDao.getFilesBySource(EnumFileType.SUB_IMPROVE_NOTICE_ECHO.getCode(), subImproveNoticeId);
		for (FileDO file : files) {
			file.setSourceType(EnumFileType.SUB_IMPROVE_NOTICE_REJECTED.getCode());
			fileDao.update(file);
		}
	}
	
	/**
	 * 生成整改单并下发和实例化工作流
	 * @param m_param
	 * @param temp
	 * @throws Exception
	 */
	public static void generateImprove(Map<String, Object> m_param, String temp) throws Exception {
		// 数据库连接
		DbClient dc = GetDc(m_param);
		Connection conn = dc.GetConnection();
		// 工作单id
		Integer taskId = GetObjectId(m_param);
		TaskDao taskDao = (TaskDao) SpringBeanUtils.getBean("taskDao");
		ImproveDao improveDao = (ImproveDao) SpringBeanUtils.getBean("improveDao");
		// 工作单
		TaskDO task = taskDao.internalGetById(taskId);
		// 下发
		List<ImproveDO> improves = improveDao.sendImprove(task);
		// 实例化工作流
		for (ImproveDO improve : improves) {
			String workflowTemplateId = improveDao.getWorkflowTemplateId(improve);
			Map<String, Object> objmap = new HashMap<String, Object>();
			objmap.put("id", improve.getId());
			objmap.put("dataobject", "improve");
//			String workflowId = (String) transactionHelper.doInTransaction(new WfSetup(), "Submit", UserContext.getUserId().toString(), workflowTemplateId, "", "", gson.toJson(objmap));
			WfSetup wfSetup = new WfSetup();
			String flowId = wfSetup.Submit(conn, UserContext.getUserId().toString(), workflowTemplateId, "", "", JsonUtil.toJson(objmap));
			improve.setFlowId(flowId);
			improveDao.internalUpdate(improve);
			improveDao.sendMessageToJingLiAndZhuGuan(improve, task);// 审计报告下发后给下级单位的主管和经理发邮件
		}
	}
	

	/**
	 * 删除工作单对应整改单
	 * @param m_param
	 * @param temp
	 * @throws Exception
	 */
	public static void deleteImprove(Map<String, Object> m_param, String temp) throws Exception {
		// 工作单id
		Integer taskId = GetObjectId(m_param);
		ImproveDao improveDao = (ImproveDao) SpringBeanUtils.getBean("improveDao");
		
		List<ImproveDO> improves = improveDao.getImprovesByTaskId(taskId);
		
		if (!improves.isEmpty()) {
			improveDao.delete(improves);
		}
	
	}
	
	/**
	 * 添加整改完成日期
	 * @param m_param
	 * @param temp
	 * @throws Exception
	 */
	public static void addImproveDate(Map<String, Object> m_param, String temp) throws Exception {
		// 整改单id
		Integer improveId = GetObjectId(m_param);
		CheckListDao checkListDao = (CheckListDao) SpringBeanUtils.getBean("checkListDao");
		
		List<CheckListDO> checkLists = checkListDao.getByImproveId(improveId);
		if (!checkLists.isEmpty()) {
			Date date = new Date();
			for (CheckListDO checkList : checkLists) {
				checkList.setImproveDate(date);
				checkListDao.internalUpdate(checkList);
			}
		}
		
	}
	
	/**
	 * 删除整改完成日期
	 * @param m_param
	 * @param temp
	 * @throws Exception
	 */
	public static void deleteImproveDate(Map<String, Object> m_param, String temp) throws Exception {
		// 整改单id
		Integer improveId = GetObjectId(m_param);
		CheckListDao checkListDao = (CheckListDao) SpringBeanUtils.getBean("checkListDao");
		
		List<CheckListDO> checkLists = checkListDao.getByImproveId(improveId);
		if (!checkLists.isEmpty()) {
			for (CheckListDO checkList : checkLists) {
				checkList.setImproveDate(null);
				checkListDao.internalUpdate(checkList);
			}
		}
		
	}
	
	/**
	 * 生成整改通知单
	 * @param m_param
	 * @param temp
	 * @throws Exception
	 */
	public static void generateImproveNotice(Map<String, Object> m_param, String temp) throws Exception {
		// 工作单id
		Integer taskId = GetObjectId(m_param);
		TaskDao taskDao = (TaskDao) SpringBeanUtils.getBean("taskDao");
		ImproveNoticeDao improveNoticeDao = (ImproveNoticeDao) SpringBeanUtils.getBean("improveNoticeDao");
		
		TaskDO task = taskDao.internalGetById(taskId);
		// 生成整改通知单
		improveNoticeDao.generateImproveNoticeFromTask(task);
	}
	
	/**
	 * 整改通知单结案处理
	 * @param m_param
	 * @param temp
	 * @throws Exception
	 */
	public static void closeImproveNotice(Map<String, Object> m_param, String temp) throws Exception {
		// 工作单id
		Integer subImproveNoticeId = GetObjectId(m_param);
		SubImproveNoticeDao subImproveNoticeDao = (SubImproveNoticeDao) SpringBeanUtils.getBean("subImproveNoticeDao");
		
		SubImproveNoticeDO subImproveNotice = subImproveNoticeDao.internalGetById(subImproveNoticeId);
		subImproveNotice.setStatus(EnumImproveNoticeStatus.COMPLETED.toString());
		subImproveNoticeDao.internalUpdate(subImproveNotice);
		
		List<SubImproveNoticeDO> subImproveNotices = subImproveNoticeDao.getByImproveNoticeId(subImproveNotice.getImproveNotice().getId());
		// 判断是否所有的整改单子单都是结案状态
		Boolean isAllCompleted = true;
		for (SubImproveNoticeDO sub : subImproveNotices) {
			if (!EnumImproveNoticeStatus.COMPLETED.toString().equals(sub.getStatus())) {
				isAllCompleted = false;
				break;
			}
		}
		if (isAllCompleted) {
			ImproveNoticeDao improveNoticeDao = (ImproveNoticeDao) SpringBeanUtils.getBean("improveNoticeDao");
			ImproveNoticeDO improveNotice = subImproveNotice.getImproveNotice();
			improveNotice.setStatus(EnumImproveNoticeStatus.COMPLETED.toString());
			improveNoticeDao.update(improveNotice);
			
		}
	}

	/**
	 * 工作单结案处理
	 * @param m_param
	 * @param temp
	 * @throws Exception
	 */
	public static void closeTask(Map<String, Object> m_param, String temp) throws Exception {
		// 工作单id
		Integer id = GetObjectId(m_param);
		TaskDao taskDao = (TaskDao) SpringBeanUtils.getBean("taskDao");
		
		TaskDO task = taskDao.internalGetById(id);
		// 设置结案时间
		task.setCloseDate(new Date());;
		taskDao.internalUpdate(task);
	}

	/**
	 * 在新开航线创建人删除信息以后把分配的风险分析任务置为“无效”
	 * @param m_param
	 * @param temp
	 * @throws Exception
	 */
	public static void setRiskStatusToWuXiao(Map<String, Object> m_param, String temp) throws Exception {
		Integer activityId = GetObjectId(m_param);
		RiskDao riskDao = (RiskDao) SpringBeanUtils.getBean("riskDao");
		riskDao.setRiskStatusToWuXiao(activityId);
	}
	
	/**
	 * 下发行动项(将行动项的状态改成待执行)
	 * @param m_param
	 * @param temp
	 * @throws Exception
	 */
	public static void distributeActionItem(Map<String, Object> m_param, String temp) throws Exception {
		Integer activityId = GetObjectId(m_param);
		ActionItemDao actionItemDao = (ActionItemDao) SpringBeanUtils.getBean("actionItemDao");
		List<Integer> actionItemIds = actionItemDao.getActionItemIdsByActivityId(activityId, ActionItemDao.ACTION_ITEM_STATUS_DRAFT);
		actionItemDao.distributeActionItems(actionItemIds);
	}
	
	/**
	 * 设置安全信息的结案日期
	 * @param m_param
	 * @param temp
	 * @throws Exception
	 */
	public static void setActivityCloseDate(Map<String, Object> m_param, String temp) throws Exception {
		Integer activityId = GetObjectId(m_param);
		ActivityDao activityDao = (ActivityDao) SpringBeanUtils.getBean("activityDao");
		activityDao.doSetActivityCloseDate(activityId, new Date());
	}
	
	/**
	 * 进入提醒结点
	 * @param m_param
	 * @param temp
	 * @throws Exception
	 */
	public static void enterNoticeNode(Map<String, Object> m_param, String temp) throws Exception {
		Integer activityId = GetObjectId(m_param);
		ActivityDao activityDao = (ActivityDao) SpringBeanUtils.getBean("activityDao");
		activityDao.doSetActivityNoticeNode(activityId, true);
	}
	
	/**
	 * 取消进入提醒结点
	 * @param m_param
	 * @param temp
	 * @throws Exception
	 */
	public static void cancelEnterNoticeNode(Map<String, Object> m_param, String temp) throws Exception {
		Integer activityId = GetObjectId(m_param);
		ActivityDao activityDao = (ActivityDao) SpringBeanUtils.getBean("activityDao");
		activityDao.doSetActivityNoticeNode(activityId, false);
	}

	/*
	 * @SuppressWarnings("rawtypes") public static BaseDao GetDao(Map m_param,
	 * String daoname) throws Exception { return
	 * (BaseDao)WebApplicationContextUtils.getRequiredWebApplicationContext(GetRequest(m_param).getSession().getServletContext()).getBean("userGroupDao"); }
	 */

	@SuppressWarnings( { "rawtypes", "unchecked" })
	public static Integer GetObjectId(Map m_param) throws Exception {
		WfMng mng = GetWfMng(m_param);
		if (!mng.GetData()) {
			ParseWorkflowFuncResult(mng);
		}
		
		Map<String, Object> m_data = (Map<String, Object>) Utility.GetField(mng.mResponseData, "data", Map.class);
		if (m_data == null) throw new Exception("获取工作流数据失败");
		String id = Utility.GetStringField(m_data, "id");
		if (Utility.IsEmpty(id)) throw new Exception("在工作流数据中没有id字段");
		return ((Double)(Double.parseDouble(id))).intValue();
	}
	
	@SuppressWarnings("rawtypes")
	public static String GetWiid(Map m_param) throws Exception {
		Map m_wf_param = GetWfParam(m_param);
		String wi_id = Utility.GetStringField(m_wf_param, "wi_id");
		if (Utility.IsEmpty(wi_id)) throw new Exception("没有wi_id参数");
		return wi_id;
	}
	
	@SuppressWarnings("rawtypes")
	public static String GetWinid(Map m_param) throws Exception {
		Map m_wf_param = GetWfParam(m_param);
		String win_id = Utility.GetStringField(m_wf_param, "win_id");
		if (Utility.IsEmpty(win_id)) throw new Exception("没有win_id参数");
		return win_id;
	}
	
	@SuppressWarnings("rawtypes")
	public static String GetWipid(Map m_param) throws Exception {
		Map m_wf_param = GetWfParam(m_param);
		String wip_id = Utility.GetStringField(m_wf_param, "wip_id");
		if (Utility.IsEmpty(wip_id)) throw new Exception("没有wip_id参数");
		return wip_id;
	}
	
	@SuppressWarnings( { "rawtypes", "unused" })
	public static DbClient GetDc(Map m_param) throws Exception {
		Map m_wf_param = GetWfParam(m_param);
		DbClient dc = (DbClient) Utility.GetField(m_wf_param, "dc", DbClient.class);
		if (dc == null) throw new Exception("没有dc参数");
		return dc;
	}
	
	@SuppressWarnings("rawtypes")
	public static WfMng GetWfMng(Map m_param) throws Exception {
		Map m_wf_param = GetWfParam(m_param);
		WfMng mng = (WfMng) Utility.GetField(m_wf_param, "wfmng", WfMng.class);
		if (mng == null) throw new Exception("没有wfmng参数");
		return mng;
	}
	
	@SuppressWarnings("rawtypes")
	public static String GetUserId(Map m_param) throws Exception {
		Map m_wf_param = GetWfParam(m_param);
		String user_id = Utility.GetStringField(m_wf_param, "user_id");
		if (Utility.IsEmpty(user_id)) throw new Exception("没有user_id参数");
		return user_id;
	}
	
	@SuppressWarnings("rawtypes")
	public static String GetApplyer(Map m_param) throws Exception {
		Map m_wf_param = GetWfParam(m_param);
		String applyer = Utility.GetStringField(m_wf_param, "wf_applyer");
		if (Utility.IsEmpty(applyer)) throw new Exception("没有wf_applyer参数");
		return applyer;
	}
	
	@SuppressWarnings("rawtypes")
	public static DbClient GetDbClient(Map m_param) throws Exception {
		Map m_wf_param = GetWfParam(m_param);
		DbClient dc = (DbClient) Utility.GetField(m_wf_param, "dc", DbClient.class);
		if (dc == null) throw new Exception("没有dc参数");
		return dc;
	}
	
	/*
	 * @SuppressWarnings("rawtypes") private static HttpServletRequest
	 * GetRequest(Map m_param) throws Exception { Map m_wf_param =
	 * GetWfParam(m_param); HttpServletRequest request =
	 * (HttpServletRequest)Utility.GetField(m_wf_param, "service",
	 * HttpServletRequest.class); if (request == null) throw new
	 * Exception("没有service参数"); return request; }
	 */

	@SuppressWarnings("rawtypes")
	private static Map GetWfParam(Map m_param) throws Exception {
		Map m_wf_param = (Map) Utility.GetField(m_param, "wf", Map.class);
		if (m_wf_param == null) throw new Exception("没有wf参数");
		return m_wf_param;
	}
	
	@SuppressWarnings("rawtypes")
	private static Map GetPageParam(Map m_param) throws Exception {
		Map m_page_param = (Map) Utility.GetField(m_param, "page", Map.class);
		if (m_page_param == null) throw new Exception("没有page参数");
		return m_page_param;
	}
	
	protected static void ParseWorkflowFuncResult(WfMng mng) throws Exception {
		if (!mng.mResponseHeader.containsKey("status")) {
			throw new Exception("返回的数据中没有[status]字段");
		}
		if (!"0".equals(mng.mResponseHeader.get("status").toString())) {
			if (mng.mResponseHeader.containsKey("msg")) {
				int status = Integer.parseInt(mng.mResponseHeader.get("status").toString());
				String msg = mng.mResponseHeader.get("msg").toString();
				throw new Exception(msg);
			} else
				throw new Exception("工作流服务发生错误，但原因未知");
		}
		throw new Exception("工作流服务执行失败，但是返回status为0，可能有函数return false前没有SetErrorMsg");
	}
	
	/**
	 * 获取数据对象的名称
	 * @param m_param
	 * @return
	 * @throws Exception
	 */
	public static String getObjectName(Map m_param) throws Exception {
		Map<String,Object> page = GetPageParam(m_param);
		
		return (String) page.get("dataobject");
	}
	
	/**
	 * 获取数据访问对象的实体（*Dao）
	 * @param objName
	 * @return
	 */
	@SuppressWarnings("unchecked")
	protected static BaseDao<? extends AbstractBaseDO> getDataAccessObject(String objName) {
		try {
			return (BaseDao<? extends AbstractBaseDO>) SpringBeanUtils.getBean(objName + "Dao");
		} catch (BeansException e) {
			throw SMSException.NO_MATCHABLE_OBJECT;
		}
	}
	

	/**
	 * 获取数据访问对象的实体（*Dao）
	 * @param m_param
	 * @return
	 * @throws Exception 
	 */
	@SuppressWarnings("unchecked")
	protected static BaseDao<? extends AbstractBaseDO> getDataAccessObject(Map m_param) throws Exception {
		String objName = getObjectName(m_param);
		return getDataAccessObject(objName);
	}
}
