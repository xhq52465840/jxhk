package com.usky.sms.audit.improvenotice;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.text.Collator;
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
import java.util.Locale;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.beanutils.BeanUtils;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.MDC;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.hibernate.type.StandardBasicTypes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.activity.attribute.ActivityStatusDao;
import com.usky.sms.audit.AuditConstant;
import com.usky.sms.audit.EnumAuditRole;
import com.usky.sms.audit.auditReport.AuditReportDao;
import com.usky.sms.audit.auditor.AuditorDO;
import com.usky.sms.audit.auditor.AuditorDao;
import com.usky.sms.audit.check.CheckListDO;
import com.usky.sms.audit.check.CheckListDao;
import com.usky.sms.audit.improve.EnumImproveSourceType;
import com.usky.sms.audit.log.AuditActivityLoggingDao;
import com.usky.sms.audit.log.operation.AuditActivityLoggingOperationRegister;
import com.usky.sms.audit.plan.PlanDao;
import com.usky.sms.audit.task.TaskDO;
import com.usky.sms.audit.task.TaskDao;
import com.usky.sms.audit.workflow.AuditWorkflowSchemeDao;
import com.usky.sms.common.DateHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.core.TransactionHelper;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.file.EnumFileType;
import com.usky.sms.file.FileDO;
import com.usky.sms.file.FileDao;
import com.usky.sms.message.MessageDO;
import com.usky.sms.message.MessageDao;
import com.usky.sms.organization.OrganizationDO;
import com.usky.sms.organization.OrganizationDao;
import com.usky.sms.permission.IPermission;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.unit.UnitRoleActorDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;
import com.usky.sms.user.UserGroupDao;
import com.usky.sms.uwf.WfSetup;

public class ImproveNoticeDao extends BaseDao<ImproveNoticeDO> implements IPermission {

	
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
	private SubImproveNoticeDao subImproveNoticeDao;
	
	@Autowired
	private ImproveNoticeIssueDao improveNoticeIssueDao;
	
	@Autowired
	private AuditorDao auditorDao;
	
	@Autowired
	private FileDao fileDao;
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	
	@Autowired
	private AuditWorkflowSchemeDao auditWorkflowSchemeDao;
	
	@Autowired
	private UserGroupDao userGroupDao;
	
	@Autowired
	private ImproveNoticeFlowUserDao improveNoticeFlowUserDao;
	
	@Autowired
	private MessageDao messageDao;
	
	@Autowired
	private AuditReportDao auditReportDao;
	
	protected ImproveNoticeDao() {
		super(ImproveNoticeDO.class);
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		ImproveNoticeDO improveNotice = (ImproveNoticeDO)obj;
//		if ("improveUnit".equals(fieldName)) {
//			if (null != improveNotice.getImproveUnit()) {
//				List<Map<String, Object>> unitMaps = new ArrayList<Map<String,Object>>();
//				String[] ids = improveNotice.getImproveUnit().split(",");
//				for (String id : ids) {
//					Map<String, Object> unitMap = new HashMap<String, Object>();
//					if(id.startsWith(AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT)){ // 安监机构时
//						UnitDO unit = unitDao.internalGetById(Integer.parseInt(id.replaceAll(AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT, "")));
//						if (null != unit){
//							unitMap.put("id", unit.getId());
//							unitMap.put("type", AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT);
//							unitMap.put("name", unit.getName());
//						}
//					} else if(id.startsWith(AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP)) { // 组织时
//						OrganizationDO organization = organizationDao.internalGetById(Integer.parseInt(id.replaceAll(AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP, "")));
//						if (null != organization) {
//							unitMap.put("id", organization.getId());
//							unitMap.put("type", AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP);
//							unitMap.put("name", organization.getName());
//						}
//					}
//					unitMaps.add(unitMap);
//				}
//				map.put(fieldName, unitMaps);
//			}
//		} else 
		if ("source".equals(fieldName)) {
			Map<String, Object> source = new HashMap<String, Object>();
			source.put("id", improveNotice.getSource());
			String sourceName = null;
			if (null != improveNotice.getSource()) {
				try {
					sourceName = EnumImproveSourceType.getEnumByVal(improveNotice.getSource()).getDescription();
				} catch (Exception e) {
					e.printStackTrace();
					sourceName = "未知类型";
				}
			} else {
				sourceName = "";
			}
			source.put("name", sourceName);
			map.put(fieldName, source);
		} else if ("status".equals(fieldName)) {
			Map<String, Object> status = new HashMap<String, Object>();
			status.put("id", improveNotice.getStatus());
			try {
				status.put("name", EnumImproveNoticeStatus.getEnumByVal(improveNotice.getStatus()).getDescription());
			} catch (Exception e) {
				e.printStackTrace();
				status.put("name", "未知状态");
			}
			map.put(fieldName, status);
		} else if ("operator".equals(fieldName)) {
			Map<String, Object> operator = new HashMap<String, Object>();
			if (!StringUtils.isBlank(improveNotice.getOperator())) {
				if (EnumImproveNoticeType.SYS.toString().equals(improveNotice.getImproveNoticeType()) || EnumImproveNoticeType.SUB2.toString().equals(improveNotice.getImproveNoticeType())) {
					UnitDO unit = unitDao.internalGetById(Integer.parseInt(improveNotice.getOperator()));
					if (null != unit) {
						operator = unitDao.convert(unit, Arrays.asList(new String[] { "id", "name" }), false);
					}
				} else {
					OrganizationDO org = organizationDao.internalGetById(Integer.parseInt(improveNotice.getOperator()));
					if (null != org) {
						operator = organizationDao.convert(org, Arrays.asList(new String[] { "id", "name" }), false);
					}
				}
			}
			map.put(fieldName, operator);
		} else if ("lastUpdate".equals(fieldName)) {
			Date lastUpdate = improveNotice.getLastUpdate();
			map.put(fieldName, DateHelper.formatIsoSecond(lastUpdate));
//		} else if ("improveNoticeTransactor".equals(fieldName)) {
//			UserDO user = improveNotice.getImproveNoticeTransactor();
//			map.put(fieldName, userDao.convert(user, Arrays.asList(new String[]{"id", "fullname"})));
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}

	@Override
	protected String getQueryParamName(String key) {
		if ("improveUnit".equals(key)) {
			return "concat(',', " + key + ", ',')";
		}
		return super.getQueryParamName(key);
	}

	@Override
	protected Object getQueryParamValue(String key, Object value) {
		if ("improveUnit".equals(key)) {
			return "," + value + ",";
		}
		return super.getQueryParamValue(key, value);
	}

	@Override
	protected boolean beforeSave(Map<String, Object> map) {
//		String operator = (String) map.get("operator");
//		UnitDO unit = unitDao.internalGetById(Integer.parseInt(operator));
//		if (AuditConstant.SAFETY_SUPERVISION_DEPT.equals(unit.getName())) { // 安全监察部时,表示系统级
//			map.put("improveNoticeType", EnumImproveNoticeType.SYS.toString());
//		} else { // 不是安全监察部时,表示分子公司级
//			map.put("improveNoticeType", EnumImproveNoticeType.SUB2.toString());
//		}

		map.put("status", EnumImproveNoticeStatus.NEW.toString());
		String improveSourceType = (String) map.get("source");
		if (!(EnumImproveSourceType.SPOT.toString().equals(improveSourceType) || EnumImproveSourceType.SPEC.toString().equals(improveSourceType))) {
			// 经办人
			map.put("improveNoticeTransactor", UserContext.getUser().getFullname());
			
			// 经办人联系方式
			AuditorDO auditor = auditorDao.getAuditorByUserId(UserContext.getUserId());
			map.put("improveNoticeTransactorTel", auditor == null ? null : auditor.getCellTel());
		}
		// 创建人
		map.put("creator", UserContext.getUserId());
		// 更新人
		map.put("lastUpdater", UserContext.getUserId());
		return true;
	}
	
	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		// 来源
		if (map.containsKey("source")) {
			ImproveNoticeDO improveNotice = this.internalGetById(id);
			if (null != map.get("source") && !((String) map.get("source")).equals(improveNotice.getSource())) {
				// 整改单编号
				String improveNoticeNo = this.generateImproveNoticeNo(improveNotice.getOperator(), (String) map.get("source"), (String) map.get("improveNoticeType"));
				map.put("improveNoticeNo", improveNoticeNo);
			}
		}
		// 点提交审核时
		if (map.containsKey("improveNoticeAuditUsers")) {
			if (EnumImproveNoticeStatus.AUDIT_WAITING.toString().equals((String) map.get("status"))) {
				// 提交审核时将处理人置空
				List<ImproveNoticeFlowUserDO> auditUsers = improveNoticeFlowUserDao.getByImproveNoticeId(id);
				improveNoticeFlowUserDao.delete(auditUsers);
				// 保存审核人
				@SuppressWarnings("unchecked")
				List<Double> userIds = (List<Double>) map.get("improveNoticeAuditUsers");
				for (Double userId : userIds) {
					if (null != userId) {
						Map<String, Object> improveNoticeFlowUserMap = new HashMap<String, Object>();
						improveNoticeFlowUserMap.put("improveNotice", ((Integer)id).doubleValue());
						improveNoticeFlowUserMap.put("user", userId);
						improveNoticeFlowUserDao.save(improveNoticeFlowUserMap);
					}
				}
			}
			map.remove("improveNoticeAuditUsers");
		}
		// 点击审核拒绝时
		if (EnumImproveNoticeStatus.AUDIT_REJECTED.toString().equals((String) map.get("status"))) {
			ImproveNoticeDO improveNotice = this.internalGetById(id);
			// 将整改通知单的创建人设置为处理人
			List<UserDO> users = new ArrayList<UserDO>();
			users.add(improveNotice.getCreator());
			this.writeCreatableUsers(improveNotice, users);
		}
		// 更新人
		map.put("lastUpdater", UserContext.getUserId());
	}
	
	@Override
	protected void afterSave(ImproveNoticeDO obj) {
		// 写入处理人
		this.writeCreatableUsers(obj, null);
		// 添加活动日志
		addActivityLoggingForAddImproveNotice(obj);
	}

	/**
	 * 添加整改通知单的活动日志
	 * @param plan
	 */
	private void addActivityLoggingForAddImproveNotice(ImproveNoticeDO obj){
		auditActivityLoggingDao.addLogging(obj.getId(), "improveNotice", AuditActivityLoggingOperationRegister.getOperation("ADD_IMPROVE_NOTICE"));
	}
	
	@Override
	protected void afterUpdate(ImproveNoticeDO obj, ImproveNoticeDO dbObj) {
		// 添加活动日志
		addActivityLoggingForUpdateImproveNotice(obj, dbObj);
		// 发送通知(提交和审核拒绝时)
		this.sendMessage(obj, dbObj);
	}

	/**
	 * 更新整改通知单的活动日志
	 * @param plan
	 */
	private void addActivityLoggingForUpdateImproveNotice(ImproveNoticeDO newObj, ImproveNoticeDO oldObj){
		List<String> details = new ArrayList<String>();
		// 来源
		String oldSource = oldObj.getSource();
		String newSource = newObj.getSource();
		try {
			if (null == oldSource && !StringUtils.isEmpty(newSource)) {
				details.add("添加来源:" + EnumImproveSourceType.getEnumByVal(newSource).getDescription());
			} else if (!(null == oldSource || null == newSource || oldSource.equals(newSource))) {
				details.add("修改来源为:" + EnumImproveSourceType.getEnumByVal(newSource).getDescription());
			}
		} catch (Exception e) {
			e.printStackTrace();
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, e.getMessage());
		}

		// 整改编号
		String oldImproveNoticeNo = oldObj.getImproveNoticeNo();
		String newImproveNoticeNo = newObj.getImproveNoticeNo();
		if (null == oldImproveNoticeNo && !StringUtils.isEmpty(newImproveNoticeNo)) {
			details.add("添加整改编号:" + newImproveNoticeNo);
		} else if (!(null == oldImproveNoticeNo || null == newImproveNoticeNo || oldImproveNoticeNo.equals(newImproveNoticeNo))) {
			details.add("修改整改编号为:" + newImproveNoticeNo);
		}
		
		// 检查地点
		String oldAddress = oldObj.getAddress();
		String newAddress = newObj.getAddress();
		if (null == oldAddress && !StringUtils.isEmpty(newAddress)) {
			details.add("添加检查地点:" + newAddress);
		} else if (!(null == oldAddress || null == newAddress || oldAddress.equals(newAddress))) {
			details.add("修改检查地点为:" + newAddress);
		}
		// 检查日期
		Date oldCheckStartDate = oldObj.getCheckStartDate();
		Date newCheckStartDate = newObj.getCheckStartDate();
		Date oldCheckEndDate = oldObj.getCheckEndDate();
		Date newCheckEndDate = newObj.getCheckEndDate();
		if (null == oldCheckStartDate && null != newCheckStartDate) {
			details.add("添加检查日期:" + DateHelper.formatIsoDate(newCheckStartDate) + "-" + DateHelper.formatIsoDate(newCheckEndDate));
		} else if (!(null == oldCheckStartDate || null == newCheckStartDate || oldCheckStartDate.equals(newCheckStartDate)) || (!(null == oldCheckEndDate || null == newCheckEndDate || oldCheckEndDate.equals(newCheckEndDate)))) {
			details.add("修改检查日期为:" + DateHelper.formatIsoDate(newCheckStartDate) + "-" + DateHelper.formatIsoDate(newCheckEndDate));
		}
		
		// 回复期限
		Date oldReplyDeadLine = oldObj.getReplyDeadLine();
		Date newReplyDeadLine = newObj.getReplyDeadLine();
		if (null == oldReplyDeadLine && null != newReplyDeadLine) {
			details.add("添加回复期限:" + DateHelper.formatIsoDate(newReplyDeadLine));
		} else if (!(null == oldReplyDeadLine || null == newReplyDeadLine || oldReplyDeadLine.equals(newReplyDeadLine))) {
			details.add("修改回复期限为:" + DateHelper.formatIsoDate(newReplyDeadLine));
		}

		// 负责单位（以逗号隔开，UT代表unit的ID，DP代表组织的ID）
//		String oldImproveUnit = oldObj.getImproveUnit();
//		String newImproveUnit = newObj.getImproveUnit();
//		if ((null == oldImproveUnit && null != newImproveUnit) || (!(null == oldImproveUnit || null == newImproveUnit || oldImproveUnit.equals(newImproveUnit)))) {
//			List<String> newImproveUnitNames = new ArrayList<String>();
//			String[] ids = newObj.getImproveUnit().split(",");
//			for (String id : ids) {
//				if (id.startsWith(AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT)) { // 安监机构时
//					UnitDO unit = unitDao.internalGetById(Integer.parseInt(id.replaceAll(AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT, "")));
//					if (null != unit){
//						newImproveUnitNames.add(unit.getName());
//					}
//				} else if (id.startsWith(AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP)) { // 组织时
//					OrganizationDO organization = organizationDao.internalGetById(Integer.parseInt(id.replaceAll(AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP, "")));
//					if (null != organization) {
//						newImproveUnitNames.add(organization.getName());
//					}
//				}
//			}
//			String newImproveUnitName = StringUtils.join(newImproveUnitNames, ",");
//			if (null == oldImproveUnit && null != newImproveUnit) {
//				details.add("添加负责单位:" + newImproveUnitName);
//			} else if (!(null == oldImproveUnit || null == newImproveUnit || oldImproveUnit.equals(newImproveUnit))) {
//				details.add("修改负责单位为:" + newImproveUnitName);
//			}
//		}
		
		// 经办人
		String oldImproveNoticeTransactor = oldObj.getImproveNoticeTransactor();
		String newImproveNoticeTransactor = newObj.getImproveNoticeTransactor();
		if (null == oldImproveNoticeTransactor && !StringUtils.isEmpty(newImproveNoticeTransactor)) {
			details.add("添加经办人:" + newImproveNoticeTransactor);
		} else if (!(null == oldImproveNoticeTransactor || null == newImproveNoticeTransactor || oldImproveNoticeTransactor.equals(newImproveNoticeTransactor))) {
			details.add("修改经办人为:" + newImproveNoticeTransactor);
		}
		
		// 联系方式
		String oldImproveNoticeTransactorTel = oldObj.getImproveNoticeTransactorTel();
		String newImproveNoticeTransactorTel = newObj.getImproveNoticeTransactorTel();
		if (null == oldImproveNoticeTransactorTel && !StringUtils.isEmpty(newImproveNoticeTransactorTel)) {
			details.add("添加联系方式:" + newImproveNoticeTransactorTel);
		} else if (!(null == oldImproveNoticeTransactorTel || null == newImproveNoticeTransactorTel || oldImproveNoticeTransactorTel.equals(newImproveNoticeTransactorTel))) {
			details.add("修改联系方式为:" + newImproveNoticeTransactorTel);
		}
		
		// 负责人
//		String oldExecutive = oldObj.getExecutive();
//		String newExecutive = newObj.getExecutive();
//		if (null == oldExecutive && !StringUtils.isEmpty(newExecutive)) {
//			details.add("添加负责人:" + newExecutive);
//		} else if (!(null == oldExecutive || null == newExecutive || oldExecutive.equals(newExecutive))) {
//			details.add("修改负责人为:" + newExecutive);
//		}
		
		// 负责人联系方式
//		String oldExecutiveTel = oldObj.getExecutiveTel();
//		String newExecutiveTel = newObj.getExecutiveTel();
//		if (null == oldExecutiveTel && !StringUtils.isEmpty(newExecutiveTel)) {
//			details.add("添加负责人联系方式:" + newExecutiveTel);
//		} else if (!(null == oldExecutiveTel || null == newExecutiveTel || oldExecutiveTel.equals(newExecutiveTel))) {
//			details.add("修改负责人联系方式为:" + newExecutiveTel);
//		}

		// 说明
		String oldDescription = oldObj.getDescription();
		String newDescription = newObj.getDescription();
		if (null == oldDescription && !StringUtils.isEmpty(newDescription)) {
			details.add("添加说明:" + newDescription);
		} else if (!(null == oldDescription || null == newDescription || oldDescription.equals(newDescription))) {
			details.add("修改说明为:" + newDescription);
		}

		if (!details.isEmpty()) {
			MDC.put("details", details.toArray());
			auditActivityLoggingDao.addLogging(newObj.getId(), "improveNotice", AuditActivityLoggingOperationRegister.getOperation("UPDATE_IMPROVE_NOTICE"));
			MDC.remove("details");
		}
	}
	
	/**
	 * 提交和审核拒绝时发送通知
	 * @param newObj
	 * @param oldObj
	 */
	private void sendMessage(ImproveNoticeDO newObj, ImproveNoticeDO oldObj) {
		String oldStatus = oldObj.getStatus();
		String newStatus = newObj.getStatus();
		MessageDO todoMessage = new MessageDO();
		todoMessage.setLink(newObj.getId().toString());
		todoMessage.setChecked(false);
		todoMessage.setSender(UserContext.getUser());
		todoMessage.setSendTime(new Timestamp(System.currentTimeMillis()));
		todoMessage.setContent("整改通知单编号：" + newObj.getImproveNoticeNo());
		Collection<UserDO> users = null;
		if (EnumImproveNoticeStatus.AUDIT_WAITING.toString().equals(newStatus) && !newStatus.equals(oldStatus)) {
			// 提交时(状态变成待审核)
			todoMessage.setSourceType("IMPROVE_NOTICE_AUDIT_WAITING");
			todoMessage.setTitle("整改通知单审核通知");
			// 给审核人发通知
			users = improveNoticeFlowUserDao.getUsersByImproveNotice(newObj.getId());
		} else if (EnumImproveNoticeStatus.AUDIT_REJECTED.toString().equals(newStatus) && !newStatus.equals(oldStatus)) {
			// 拒绝时(状态变成审核拒绝)
			todoMessage.setSourceType("IMPROVE_NOTICE_AUDIT_REJECTED");
			todoMessage.setTitle("整改通知单拒绝通知");
			// 给创建人发通知
			users = new ArrayList<UserDO>();
			users.add(newObj.getCreator());
		}
		try {
			if (null != users && !users.isEmpty()) {
				messageDao.sendMessageAndEmail(todoMessage, users);
			}
		} catch (Exception e) {
			e.printStackTrace();
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "发送通知失败！错误信息：" + e.getMessage());
		}
	}
	
	/**
	 * 生成整改通知单编号
	 * @param operator
	 * @param source
	 * @return
	 */
	public String generateImproveNoticeNo(String operator, String source, String improveNoticeType){
		String sourceShortName = null;
		UnitDO unit = unitDao.internalGetById(Integer.parseInt(operator));
		try {
			sourceShortName = EnumImproveSourceType.getEnumByVal(source).getShortName();
		} catch (Exception e) {
			e.printStackTrace();
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, e.getMessage());
		}
		// 整改单编号
		Calendar cal = DateHelper.getCalendar();
		int year = cal.get(Calendar.YEAR);
		// 局方：HOAJ-JFJC-2015-001 (AJ--SD)山东
		// SAFA :HOAJ-SAFA-2015-001
		// 公司：HOAJ-2015-001
		// 国际：HOAJ-GJSW-2015-001
		// 其他：HOAJ-QTSW-2015-001
		StringBuffer improveNoticeNo = new StringBuffer();
		improveNoticeNo.append(AuditConstant.PRE_AUDIT_SN);
//		String unitCode = null;
//		if (EnumImproveNoticeType.SYS.toString().equals(improveNoticeType) || EnumImproveNoticeType.SUB2.toString().equals(improveNoticeType)) {
//			UnitDO unit = unitDao.internalGetById(Integer.parseInt(operator));
//			unitCode = unit.getCode();
//		} else {
//			OrganizationDO org = organizationDao.internalGetById(Integer.parseInt(operator));
//			unitCode = org.getUnit().getCode() + AuditConstant.DEPARTMENT;
//		}
//		improveNoticeNo.append(unitCode);
		improveNoticeNo.append(unit.getCode());
		if (!StringUtils.isBlank(sourceShortName)) {
			improveNoticeNo.append("-");
			improveNoticeNo.append(sourceShortName);
		}
		improveNoticeNo.append("-");
		improveNoticeNo.append(year);
		improveNoticeNo.append("-");
		
		Integer no = null;
		String maxImproveNoticeNo = this.getMaxImproveNoticeNoBySearch(operator, source, year);
		if (null == maxImproveNoticeNo) {
			no = 1;
		} else {
			no = Integer.parseInt(maxImproveNoticeNo.substring(maxImproveNoticeNo.length() - 3)) + 1;
		}
		improveNoticeNo.append(String.format("%03d", no));
		
		return improveNoticeNo.toString();
	}
	
	
	/**
	 * 添加整改通知单的下拉框
	 * 通过安监机构ID获取整改通知单的责任单位
	 * @param unitId
	 * @param term
	 * @return
	 */
	public List<Map<String, Object>> getImproveNoticeResponsibilityUnits(Integer anJianBuId, Integer unitId, String term) {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		if (null == unitId) {
			List<Integer> unitIds = unitDao.getUnitIds(PermissionSets.VIEW_UNIT.getName());
			for (Integer id : unitIds) {
				list.addAll(getImproveNoticeResponsibilityUnits(anJianBuId, id, term));
			}
		} else {
			UnitDO unit = unitDao.internalGetById(unitId);
			if (null != unit) {
				Map<String, Object> map = null;
				if (anJianBuId.equals(unit.getId())) { // 安全监察部时获取所有安监机构
					List<UnitDO> units = unitDao.getAllUnits(term);
					for (UnitDO u : units) {
						map = new HashMap<String, Object>();
						map.put("id", AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT + u.getId());
						map.put("name", u.getName());
						list.add(map);
					}
				} else { // 获取该安监机构下的组织
					List<OrganizationDO> organizations = organizationDao.getByOlevelAndUnit("3", unitId);
					for (OrganizationDO o : organizations) {
						map = new HashMap<String, Object>();
						map.put("id", AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP + o.getId());
						map.put("name", o.getName());
						list.add(map);
					}
				}
			}
			// 按名称排序
			Collections.sort(list, new Comparator<Map<String, Object>>() {
				Collator collator = Collator.getInstance();
				public int compare(Map<String, Object> arg0, Map<String, Object> arg1) {
					return collator.compare((String)arg0.get("name"), (String)arg1.get("name"));
				}
			});
		}
		return list;
	}
	
	/**
	 * 查询整改通知单的下拉框
	 * 通过安监机构ID获取整改通知单的责任单位
	 * @param unitId
	 * @param term
	 * @return
	 */
	public List<Map<String, Object>> getImproveNoticeResponsibilityUnits(List<Integer> operators, String term) {
		List<String> improveUnitIds = this.getImproveUnitIds(operators, term);
		List<Integer> unitIds = new ArrayList<Integer>();
		List<Integer> orgIds = new ArrayList<Integer>();
		for (String improveUnitId : improveUnitIds) {
			if (improveUnitId.startsWith(AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT)) {
				unitIds.add(Integer.parseInt(improveUnitId.replaceAll(AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT, "")));
			} else if (improveUnitId.startsWith(AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP)) {
				orgIds.add(Integer.parseInt(improveUnitId.replaceAll(AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP, "")));
			}
		}
		List<Map<String, Object>> result = new ArrayList<Map<String,Object>>();
		Map<String, Object> map = null;
		if (!unitIds.isEmpty()) {
			List<UnitDO> units = unitDao.getByIds(unitIds);
			for (UnitDO u : units) {
				map = new HashMap<String, Object>();
				map.put("id", AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT + u.getId());
				map.put("name", u.getName());
				map.put("parent", null);
				result.add(map);
			}
		}
		if (!orgIds.isEmpty()) {
			List<OrganizationDO> organizations = organizationDao.getByIds(orgIds);
			for (OrganizationDO o : organizations) {
				map = new HashMap<String, Object>();
				map.put("id", AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP + o.getId());
				map.put("name", o.getName());
				map.put("parent", o.getUnit() == null ? null : o.getUnit().getId());
				result.add(map);
			}
		}
		// 按名称排序
		Collections.sort(result, new Comparator<Map<String, Object>>() {
			Collator collator = Collator.getInstance();
			public int compare(Map<String, Object> arg0, Map<String, Object> arg1) {
				return collator.compare((String)arg0.get("name"), (String)arg1.get("name"));
			}
		});
		return result;
	}
	
	/**
	 * 获取责任单位的id
	 * @param operators
	 * @param term
	 * @return
	 */
	public List<String> getImproveUnitIds(List<Integer> operators, String term) {
		Integer anJianBuId = unitDao.getAnJianBuId(true);
		if (null == operators || operators.isEmpty() || operators.contains(anJianBuId)) {
			operators = unitDao.getUnitIds(PermissionSets.VIEW_UNIT.getName());
		}
		if (operators.isEmpty()) {
			return new ArrayList<String>();
		}
		Set<Integer> unitIds = new HashSet<Integer>();
		Set<Integer> orgIds = new HashSet<Integer>();
		// 如果是系统级, 则只返回该用户可以浏览的安监机构的责任单位的数据二级检查主管和二级检查经理，或者是用户组是一级检查主管和一级检查经理.如果是分子公司级责任单位下的三级检查主管或三级检查经理,组织所在安监机构的二级检查主管和二级检查经理
		List<DictionaryDO> dics = dictionaryDao.getListByType("审计角色");
		Map<String, Object> roleMap = new HashMap<String, Object>();
		for (DictionaryDO dic : dics) {
			roleMap.put(dic.getKey(), dic.getName());
		}
		// 如果用户是一级检查主管或一级检查经理显示所有数据 AC1.1,AC1.2或二级时
		boolean isFirstRole = userGroupDao.isUserGroups(UserContext.getUserId(), (String) roleMap.get(EnumAuditRole.FIRST_GRADE_CHECK_MANAGER_GROUP.getKey()), (String) roleMap.get(EnumAuditRole.FIRST_GRADE_CHECK_MASTER_GROUP.getKey()));
		if (isFirstRole || unitRoleActorDao.isRoles(UserContext.getUserId(), (String) roleMap.get(EnumAuditRole.SECOND_GRADE_CHECK_MANAGER.getKey()), (String) roleMap.get(EnumAuditRole.SECOND_GRADE_CHECK_MASTER.getKey()))) {
			unitIds.addAll(unitDao.getByUnitIds(operators, term));
			orgIds.addAll(organizationDao.getIdsByOlevelAndUnitIdsAndUser("3", operators, null, term));
		} else {
			// 三级时
			orgIds.addAll(organizationDao.getIdsByOlevelAndUnitIdsAndUser("4", operators, UserContext.getUserId(), term));
		}
		List<String> result = new ArrayList<String>();
		for (Integer unitId : unitIds) {
			result.add(AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT + unitId);
		}
		for (Integer orgId : orgIds) {
			result.add(AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP + orgId);
		}
		return result;
	}
	
	/**
	 * 获取可添加的整改通知单的责任单位<br>
	 * 系统级的获取所有安监机构<br>
	 * 分子公司级的获取所有安监机构及对应的下级组织<br>
	 * 部门三级获取当前组织的下级组织(待定)
	 */
	public List<Map<String, Object>> getAddedImproveUnits(Integer unitId, String improveNoticeType, String term) {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		Map<String, Object> map = null;
		if (EnumImproveNoticeType.SYS.toString().equals(improveNoticeType) || EnumImproveNoticeType.SUB2.toString().equals(improveNoticeType)) {
			List<UnitDO> units = unitDao.getAllUnits(term);
			for (UnitDO u : units) {
				map = new HashMap<String, Object>();
				map.put("id", AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT + u.getId());
				map.put("name", u.getName());
				map.put("parent", null);
				list.add(map);
			}
		}
		if (EnumImproveNoticeType.SUB2.toString().equals(improveNoticeType)) {
			// 当前安监机构下的3级组织
			if (null != unitId) {
				List<Integer> unitIds = new ArrayList<Integer>();
				unitIds.add(unitId);
				List<OrganizationDO> orgs = organizationDao.getByOlevelAndUnitIdsAndUser("3", unitIds, null, term);
				for (OrganizationDO org : orgs) {
					map = new HashMap<String, Object>();
					map.put("id", AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP + org.getId());
					map.put("name", org.getName());
					map.put("parent", org.getUnit() == null ? null : org.getUnit().getId());
					list.add(map);
				}
			}
		} else {
			// 当前组织的下级组织
			if (null != unitId) {
				List<OrganizationDO> orgs = organizationDao.getSubOrganizations(unitId, term);
				for (OrganizationDO org : orgs) {
					map = new HashMap<String, Object>();
					map.put("id", AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP + org.getId());
					map.put("name", org.getName());
					map.put("parent", org.getUnit() == null ? null : org.getUnit().getId());
					list.add(map);
				}
			}
		}
		// 按名称排序
		Collections.sort(list, new Comparator<Map<String, Object>>() {
			Collator collator = Collator.getInstance();
			public int compare(Map<String, Object> arg0, Map<String, Object> arg1) {
				return collator.compare((String)arg0.get("name"), (String)arg1.get("name"));
			}
		});
		return list;
	}
	
	/**
	 * 获取执行单位列表<br>
	 * 分子公司，二级单位
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<UnitDO> getAllImproveNoticeOperators(){
		String[] categories = {"分子公司", "二级部门"};
		String hql = "select t from UnitDO t where t.deleted = false and t.category.name in (:categories) order by t.name";
		
		return (List<UnitDO>) this.getHibernateTemplate().findByNamedParam(hql, "categories", Arrays.asList(categories));
	}
	
	/**
	 * 下发整改通知单<br>
	 * 明细按照责任单位分成若干个子通知，并在子通知单使用工作流
	 * @param improveNoticeIssues
	 */
	@SuppressWarnings("unchecked")
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void sendImproveNoticeIssue(ImproveNoticeDO improveNotice) {
		if (null != improveNotice && null != improveNotice.getImproveNoticeIssues()) {
			// 下发之前先将已下发的整改通知单子单删除
			List<SubImproveNoticeDO> subs = subImproveNoticeDao.getByImproveNoticeId(improveNotice.getId());
			subImproveNoticeDao.delete(subs);
			
			List<ImproveNoticeIssueDO> list = improveNoticeIssueDao.getByImproveNoticeId(improveNotice.getId());
			Set<ImproveNoticeIssueDO> improveNoticeIssues = null;
			Map<String, Object> map = new HashMap<String, Object>();
			for (ImproveNoticeIssueDO improveNoticeIssue : list) {
				// 按照责任单位分组
				String improveUnit = improveNoticeIssue.getImproveUnit();
				if (map.containsKey(improveUnit)) {
					improveNoticeIssues = (Set<ImproveNoticeIssueDO>) map.get(improveUnit);
					improveNoticeIssues.add(improveNoticeIssue);
				} else {
					improveNoticeIssues = new HashSet<ImproveNoticeIssueDO>();
					improveNoticeIssues.add(improveNoticeIssue);
					map.put(improveUnit, improveNoticeIssues);
				}
			}
			
			String workflowTemplateId = auditWorkflowSchemeDao.getWorkflowTempIdBySearch(improveNotice.getImproveNoticeType(), null, "SUB_IMPROVE_NOTICE");

			// 按责任单位生成子单并进行下发
			for (Entry<String, Object> entry : map.entrySet()) {
				SubImproveNoticeDO subImproveNotice = new SubImproveNoticeDO();
				subImproveNotice.setImproveNotice(improveNotice);
				subImproveNotice.setImproveUnit(entry.getKey());
				subImproveNotice.setImproveNoticeIssues((Set<ImproveNoticeIssueDO>) entry.getValue());
				subImproveNotice.setCreator(UserContext.getUser());
				subImproveNotice.setLastUpdater(UserContext.getUser());
				subImproveNoticeDao.internalSave(subImproveNotice);
				for (ImproveNoticeIssueDO improveNoticeIssue : (Set<ImproveNoticeIssueDO>) entry.getValue()) {
					improveNoticeIssue.setSubImproveNotice(subImproveNotice);
					improveNoticeIssueDao.update(improveNoticeIssue);
				}

				// 使用工作流
				Map<String, Object> objmap = new HashMap<String, Object>();
				objmap.put("id", subImproveNotice.getId());
				objmap.put("dataobject", "subImproveNotice");
				String workflowId = (String) transactionHelper.doInTransaction(new WfSetup(), "Submit", UserContext
						.getUserId().toString(), workflowTemplateId, "", "", gson.toJson(objmap));
				subImproveNotice.setFlowId(workflowId);
				subImproveNoticeDao.update(subImproveNotice);
			}
			
			// 修改状态为下发
			improveNotice.setStatus(EnumImproveNoticeStatus.SENT.toString());
			
			this.update(improveNotice);
		}
	}

	/**
	 * 搜索整改通知单<br>
	 * 通过来源，签发单位，审计日期和责任单位进行查询
	 * @param ruleMap
	 * @param sortMap
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> getImproveNoticeBySearch(Map<String, Object> ruleMap, final Map<String, Object> sortMap, Integer startNum, Integer endNum){
		List<String> status = null;
		String improveNoticeNo = null;
		List<String> source = null;
		List<String> operator = null;
		List<String> improveUnit = null;
		Date startCheckDate =null;
		Date endCheckDate = null;
		List<String> flowStatus = null;
		if (null != ruleMap) {
			improveNoticeNo = (String) ruleMap.get("improveNoticeNo");
			status = (List<String>) ruleMap.get("status");
			source = (List<String>) ruleMap.get("source");
			operator = (List<String>) ruleMap.get("operator");
			improveUnit = (List<String>) ruleMap.get("improveUnit");
			startCheckDate = ruleMap.get("startCheckDate") != null ? DateHelper.parseIsoDate((String) ruleMap.get("startCheckDate")) : null;
			endCheckDate = ruleMap.get("endCheckDate") != null ? DateHelper.parseIsoDate((String) ruleMap.get("endCheckDate")) : null;
			flowStatus = (List<String>) ruleMap.get("flowStatus");
		}
		
		StringBuffer sort = new StringBuffer();
		// 排序
		if (null != sortMap) {
			String value = (String) sortMap.get("value");
			String key = (String) sortMap.get("key");
			sort.append(" order by ");
			sort.append(key);
			sort.append(" ");
			sort.append(value);
		}
		
		return this.getBySearch(improveNoticeNo, status, source, operator, improveUnit, startCheckDate, endCheckDate, flowStatus, sort.toString(), startNum, endNum);
	}
	
	@SuppressWarnings("unchecked")
	public Map<String, Object> getBySearch(String improveNoticeNo, List<String> status, List<String> source, List<String> operator, List<String> improveUnit, Date startCheckDate, Date endCheckDate, List<String> flowStatus, String sort, Integer startNum, Integer endNum){
		Map<String, Object> result = new HashMap<String, Object>();
		// 查看的权限
		PermissionSets permission = auditReportDao.getViewImproveIssuePermission();
		// 能够查看的整改通知单的类型
		List<String> checkGrades = auditReportDao.getCheckGradeIdsForImproveIssue(permission);
		if (checkGrades != null && !checkGrades.isEmpty()) {
			StringBuffer sql = new StringBuffer();
			List<String> params = new ArrayList<String>();
			List<Object> values = new ArrayList<Object>();
			
			List<String> improveNoticeParams = new ArrayList<String>();
			List<Object> improveNoticeValues = new ArrayList<Object>();
			
			// 整改通知单的sql
			StringBuffer improveNoticeSql = new StringBuffer();
			improveNoticeSql.append(" select distinct ain.id as id,");
			improveNoticeSql.append(" ain.improve_notice_no as improveNoticeNo,");
			improveNoticeSql.append(" ain.source as source,");
			improveNoticeSql.append(" ain.operator as operatorId,");
			improveNoticeSql.append(" decode(u.name, null, operatorOrg.\"name\", u.name) as operatorName,");
			improveNoticeSql.append(" ain.address as address,");
			improveNoticeSql.append(" ain.status as status,");
			improveNoticeSql.append(" null as flowStep,");
			improveNoticeSql.append(" ain.last_update as lastUpdate,");
			improveNoticeSql.append(" ain.reply_dead_line as replyDeadLine,");
			improveNoticeSql.append(" null as improveUnit,");
			improveNoticeSql.append(" null as flowStatus,");
			improveNoticeSql.append(" ain.improve_notice_type as improveNoticeType");
			improveNoticeSql.append(" from a_improve_notice ain");
			improveNoticeSql.append(" left join t_unit u on (ain.operator = u.id)");
			improveNoticeSql.append(" left join t_organization operatorOrg on (ain.operator = operatorOrg.id)");
			improveNoticeSql.append(" left join a_improve_notice_issue aini on (ain.id = aini.improve_notice_id and aini.deleted = '0')");
			improveNoticeSql.append(" where ain.deleted = '0'");
			
			improveNoticeSql.append(" and ain.improve_notice_type in (:improveNoticeType)");
			improveNoticeParams.add("improveNoticeType");
			improveNoticeValues.add(checkGrades);
			
			List<String> creatableOperatorIdsForImproveNotice = this.getCreatableOperatorIdsForImproveNotice();
			creatableOperatorIdsForImproveNotice = auditReportDao.stripImproveUnitPrefix(creatableOperatorIdsForImproveNotice);
			Map<String, Object> viewableOperatorsAndTargets = auditReportDao.getViewableOperatorsAndTargets(operator, improveUnit, checkGrades);
			List<String> viewableImproveUnit = (List<String>) viewableOperatorsAndTargets.get("targets");
			// 如果页面有传值则按照所传的值进行匹配
			if ((operator != null && !operator.isEmpty()) || (improveUnit != null && !improveUnit.isEmpty())) {
				if (operator != null && !operator.isEmpty()) {
					improveNoticeSql.append(" and (");
					boolean hasOr = false;
					// 求差集
					List<String> operatorsToImproveUnits = (List<String>) CollectionUtils.subtract(operator, creatableOperatorIdsForImproveNotice);
					// 此时operatorsToImproveUnits只能匹配下发给当前用户所在机构或组织的数据, 所以要加上improveUnit条件
					if (!operatorsToImproveUnits.isEmpty()) {
						if (viewableImproveUnit != null && !viewableImproveUnit.isEmpty()) {
							// 求交集
							List<String> interSectionImproveUnits = viewableImproveUnit;
							if (improveUnit != null && !improveUnit.isEmpty()) {
								interSectionImproveUnits = (List<String>) CollectionUtils.intersection(viewableImproveUnit, improveUnit);
							}
							if (!interSectionImproveUnits.isEmpty()) {
								hasOr = true;
								operatorsToImproveUnits = auditReportDao.stripImproveUnitPrefix(operatorsToImproveUnits);
								improveNoticeSql.append(" (ain.operator in (:operatorsToImproveUnits) ");
								improveNoticeParams.add("operatorsToImproveUnits");
								improveNoticeValues.add(operatorsToImproveUnits);
								improveNoticeSql.append(" and aini.improve_unit in (:interSectionImproveUnits))");
								improveNoticeParams.add("interSectionImproveUnits");
								improveNoticeValues.add(interSectionImproveUnits);
							}
						} else {
							sql.append(" 1 = 0");
							hasOr = true;
						}
					}
					operator = (List<String>) CollectionUtils.subtract(operator, operatorsToImproveUnits);
					if (!operator.isEmpty()) {
						if (hasOr) {
							improveNoticeSql.append(" or");
						}
						operator = auditReportDao.stripImproveUnitPrefix(operator);
						improveNoticeSql.append(" ain.operator in (:operator) ");
						improveNoticeParams.add("operator");
						improveNoticeValues.add(operator);
					}
					
					improveNoticeSql.append(")");
				}
				if (improveUnit != null && !improveUnit.isEmpty()) {
					improveNoticeSql.append(" and aini.improve_unit in (:improveUnit)");
					improveNoticeParams.add("improveUnit");
					improveNoticeValues.add(improveUnit);
				}
			} else {
				if (!creatableOperatorIdsForImproveNotice.isEmpty() || !viewableImproveUnit.isEmpty()) {
					improveNoticeSql.append(" and (");
					if (!creatableOperatorIdsForImproveNotice.isEmpty()) {
						improveNoticeSql.append(" ain.operator in (:operator)");
						improveNoticeParams.add("operator");
						improveNoticeValues.add(creatableOperatorIdsForImproveNotice);
						
						if (!viewableImproveUnit.isEmpty()) {
							improveNoticeSql.append(" or");
						}
					}
					if (!viewableImproveUnit.isEmpty()) {
						// 求交集
						List<String> interSectionImproveUnits = viewableImproveUnit;
						if (improveUnit != null && !improveUnit.isEmpty()) {
							interSectionImproveUnits = (List<String>) CollectionUtils.intersection(viewableImproveUnit, improveUnit);
						}
						if (!interSectionImproveUnits.isEmpty()) {
							improveNoticeSql.append(" aini.improve_unit in (:improveUnit)");
							improveNoticeParams.add("improveUnit");
							improveNoticeValues.add(interSectionImproveUnits);
						}
					}
					improveNoticeSql.append(" )");
				} else {
					// 如果不属于任何安监机构或组织则检索不到数据
					improveNoticeSql.append(" and 1 = 0");
				}
			}
			
			if (null != status && !status.isEmpty()) {
				improveNoticeSql.append(" and ain.status in (:status)");
				improveNoticeParams.add("status");
				improveNoticeValues.add(status);
			}
			
			if (null != improveNoticeNo) {
				improveNoticeSql.append(" and ain.improve_notice_no like :improveNoticeNo");
				String transferredImproveNoticeNo = improveNoticeNo.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
				transferredImproveNoticeNo = "%" + transferredImproveNoticeNo + "%";
				improveNoticeParams.add("improveNoticeNo");
				improveNoticeValues.add(transferredImproveNoticeNo);
			} else {
				improveNoticeSql.append(" and ain.improve_notice_no is not null");
			}
			if (null != source && !source.isEmpty()) {
				improveNoticeSql.append(" and ain.source in (:source)");
				improveNoticeParams.add("source");
				improveNoticeValues.add(source);
			}
			
			if (null != startCheckDate){
				improveNoticeSql.append(" and (ain.check_start_date >= :startCheckDate or ain.check_end_date >= :startCheckDate)");
				improveNoticeParams.add("startCheckDate");
				improveNoticeValues.add(startCheckDate);
				
				improveNoticeParams.add("startCheckDate");
				improveNoticeValues.add(startCheckDate);
			}
			if (null != endCheckDate){
				improveNoticeSql.append(" and (ain.check_start_date <= :endCheckDate or ain.check_end_date <= :endCheckDate)");
				improveNoticeParams.add("endCheckDate");
				improveNoticeValues.add(endCheckDate);
				
				improveNoticeParams.add("endCheckDate");
				improveNoticeValues.add(endCheckDate);
			}
			if (null != flowStatus && !flowStatus.isEmpty()) {
				improveNoticeSql.append(" and 1 = 0");
			}
			
			// union
			sql = improveNoticeSql;
			sql.append(sort);
			params.addAll(improveNoticeParams);
			values.addAll(improveNoticeValues);
			
			StringBuffer sqlForTotalCount = new StringBuffer();
			sqlForTotalCount.append("select count(*) from (");
			sqlForTotalCount.append(sql);
			sqlForTotalCount.append(")");
			
			Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
			SQLQuery query = session.createSQLQuery(sqlForTotalCount.toString());
			for (int i = 0; i < params.size(); i++) {
				if (values.get(i) instanceof Collection) {
					query.setParameterList(params.get(i), (Collection<?>) values.get(i));
				} else {
					query.setParameter(params.get(i), values.get(i));
				}
			}
			List<BigDecimal> totalCounts = query.list();
			// 总数
			result.put("iTotalRecords", totalCounts.get(0).intValue());
			result.put("iTotalDisplayRecords", totalCounts.get(0).intValue());
			
			StringBuffer sqlForContent = new StringBuffer();
			sqlForContent.append("select * from (");
			sqlForContent.append("select temp.*, rownum as rn from (");
			sqlForContent.append(sql);
			sqlForContent.append(") temp ");
			sqlForContent.append(")");
			if (null != startNum || null != endNum) {
				sqlForContent.append(" where");
				if (null != startNum) {
					sqlForContent.append(" rn >= :startNum");
					params.add("startNum");
					values.add(startNum);
				}
				if (null != endNum)  {
					sqlForContent.append(" and rn <= :endNum");
					params.add("endNum");
					values.add(endNum);
				}
			}
			
			query = session.createSQLQuery(sqlForContent.toString());
			for (int i = 0; i < params.size(); i++) {
				if (values.get(i) instanceof Collection) {
					query.setParameterList(params.get(i), (Collection<?>) values.get(i));
				} else {
					query.setParameter(params.get(i), values.get(i));
				}
			}
			query.addScalar("id", StandardBasicTypes.INTEGER);
			query.addScalar("improveNoticeNo", StandardBasicTypes.STRING);
			query.addScalar("source", StandardBasicTypes.STRING);
			query.addScalar("operatorId", StandardBasicTypes.STRING);
			query.addScalar("operatorName", StandardBasicTypes.STRING);
			query.addScalar("address", StandardBasicTypes.STRING);
			query.addScalar("status", StandardBasicTypes.STRING);
			query.addScalar("flowStep", StandardBasicTypes.STRING);
			query.addScalar("lastUpdate", StandardBasicTypes.CALENDAR);
			query.addScalar("replyDeadLine", StandardBasicTypes.DATE);
			query.addScalar("improveUnit", StandardBasicTypes.STRING);
			query.addScalar("flowStatus", StandardBasicTypes.STRING);
			query.addScalar("improveNoticeType", StandardBasicTypes.STRING);
			List<Object[]> list = query.list();
			
			List<Map<String, Object>> dataList = new ArrayList<Map<String,Object>>();
			for (Object[] item : list) {
				Map<String, Object> map = new HashMap<String, Object>();
				// ID
				map.put("id", (Integer) item[0]);
				// 整改通知单编号
				map.put("improveNoticeNo", (String) item[1]);
				// 整改通知单来源类型
				Map<String, Object> sourceMap = new HashMap<String, Object>();
				sourceMap.put("id", (String) item[2]);
				String sourceName = null;
				if (null != (String) item[2]) {
					try {
						sourceName = EnumImproveSourceType.getEnumByVal((String) item[2]).getDescription();
					} catch (Exception e) {
						e.printStackTrace();
						sourceName = "未知类型";
					}
				} else {
					sourceName = "";
				}
				sourceMap.put("name", sourceName);
				map.put("source", sourceMap);
				// 执行单位
				Map<String, Object> operatorMap = new HashMap<String, Object>();
				operatorMap.put("id", (String) item[3]);
				operatorMap.put("name", (String) item[4]);
				map.put("operator", operatorMap);
				// 检查地点
				map.put("address", (String) item[5]);
				// 状态
				Map<String, Object> statusMap = new HashMap<String, Object>();
				statusMap.put("id", (String) item[6]);
				try {
					statusMap.put("name", EnumImproveNoticeStatus.getEnumByVal((String) item[6]).getDescription());
				} catch (Exception e) {
					e.printStackTrace();
					statusMap.put("name", "未知状态");
				}
				map.put("status", statusMap);
				// 更新时间
				map.put("flowStep", (String) item[7]);
				// 更新时间
				map.put("lastUpdate", (Calendar) item[8] == null ? null : DateHelper.formatIsoSecond(((Calendar) item[8]).getTime()));
				// 回复期限
				map.put("replyDeadLine", (Date) item[9] == null ? null : DateHelper.formatIsoDate((Date) item[9]));
				// 责任单位
				List<Map<String, Object>> improveUnits = new ArrayList<Map<String, Object>>();
				Map<String, Object> improveUnitMap = new HashMap<String, Object>();
				improveUnitMap.put("name", (String) item[10]);
				improveUnits.add(improveUnitMap);
				map.put("improveUnit", improveUnits);
				// 流程状态
				map.put("flowStatus", (String) item[11]);
				// 整改通知单类型
				map.put("improveNoticeType", (String) item[12]);
				dataList.add(map);
			}
			result.put("aaData", dataList);
		}
		return result;
	}
	
	/**
	 * 获取当前用户能够创建整改通知单的operator
	 * @return list 以UT开头的为安监机构的id, 以DP开头的为组织的id
	 */
	public List<String> getCreatableOperatorIdsForImproveNotice() {
		Map<String, Object> map = this.getCreatableOperatorsMapForImproveNotice();
		return auditReportDao.addPrefixForUnitAndOrgIds(map);
	}
	
	/**
	 * 获取当前用户能够创建整改通知单的operator的map
	 * @return Map key为UT的表示安监机构，key为DP的表示组织
	 */
	public Map<String, Object> getCreatableOperatorsMapForImproveNotice() {
		Map<String, Object> map = new HashMap<String, Object>();
		List<Integer> unitIds = new ArrayList<Integer>();
		List<Integer> orgIds = new ArrayList<Integer>();
		if (permissionSetDao.hasPermission(PermissionSets.CREATE_SYS_IMPROVE_NOTICE.getName())) {
			unitIds = unitDao.getAllUnitIds(null);
			orgIds = organizationDao.getIdsByOlevelAndUnitIdsAndUser("3", unitIds, null, null);
		} else {
			// 能够创建分子公司的整改通知单的安监机构
			unitIds = permissionSetDao.getPermittedUnitIdsByUnitName(UserContext.getUserId(), null, PermissionSets.CREATE_SUB_IMPROVE_NOTICE.getName());
			if (!unitIds.isEmpty()) {
				orgIds = organizationDao.getIdsByOlevelAndUnitIdsAndUser("3", unitIds, null, null);
			} else {
//				orgIds = permissionSetDao.getPermittedOrgIdsByOrgName(UserContext.getUserId(), null, PermissionSets.CREATE_SUB3_IMPROVE_NOTICE.getName());
			}
		}
		map.put(AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT, unitIds);
		map.put(AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP, orgIds);
		return map;
	}
	
	/**
	 * 查询整改通知单<br>
	 * 通过来源，签发单位，审计日期和责任单位进行查询
	 */
	@SuppressWarnings("unchecked")
	public List<ImproveNoticeDO> getBySearch(String improveNoticeNo, String status, String source, String operator, String improveUnit, Date startCheckDate, Date endCheckDate){
		StringBuffer hql = new StringBuffer("from ImproveNoticeDO t where t.deleted = ?");
		List<Object> values = new ArrayList<Object>();
		values.add(false);
		if (null != improveNoticeNo) {
			hql.append(" and t.improveNoticeNo = ?");
			values.add(improveNoticeNo);
		}
		if (null != status) {
			hql.append(" and t.status = ?");
			values.add(status);
		}
		if (null != source) {
			hql.append(" and t.source = ?");
			values.add(source);
		}
		if (null != operator) {
			hql.append(" and t.operator = ?");
			values.add(operator);
		}
		if (null != improveUnit) {
			hql.append(" and concat(',', t.improveUnit, ',') like ?");
			values.add("," + improveUnit + ",");
		}
		if (null != startCheckDate){
			hql.append(" and t.checkDate >= ?");
			values.add(startCheckDate);
		}
		if (null != endCheckDate){
			hql.append(" and t.checkDate <= ?");
			values.add(endCheckDate);
		}
		return (List<ImproveNoticeDO>) this.query(hql.toString(), values.toArray());
	}
	
	@SuppressWarnings("unchecked")
	public int compareMap(Map<String, Object> map0, Map<String, Object> map1, String key){
		if (null == map0.get(key) && null == map1.get(key)) {
			return 0;
		}
		if (null == map0.get(key)) {
			return -1;
		} else if (null == map1.get(key)) {
			return 1;
		} else if (map0.get(key) instanceof String) {
			Collator instance = Collator.getInstance(Locale.getDefault());
			return instance.compare((String) map0.get(key), (String) map1.get(key));
		} else if (map0.get(key) instanceof Map) {
			Map<String, Object> subMap0 = (Map<String, Object>) map0.get(key);
			Map<String, Object> subMap1 = (Map<String, Object>) map1.get(key);
			return compareMap(subMap0, subMap1, "name");
		} else if (map0.get(key) instanceof List) {
			List<Map<String, Object>> subMaps0 = (List<Map<String, Object>>) map0.get(key);
			List<Map<String, Object>> subMaps1 = (List<Map<String, Object>>) map1.get(key);
			if (subMaps0.isEmpty() && subMaps1.isEmpty()) {
				return 0;
			}
			if (subMaps0.isEmpty()) {
				return -1;
			}
			if (subMaps1.isEmpty()) {
				return 1;
			}
			return compareMap(subMaps0.get(0), subMaps1.get(0), "name");
		} else {
			return 0;
		}
	}
	

	/**
	 * 获取所给时间所在年的所给执行单位下所给整改来源的整改通知单的条数
	 * @param id
	 * @return
	 */
	public Integer getNumBySearch(String operator, String source, int year){
		@SuppressWarnings("unchecked")
		List<Long> numbers = (List<Long>) this.query("select count(t) from ImproveNoticeDO t where t.source = ? and t.operator = ? and year(t.created) = ?", source, operator, year);
		return numbers.get(0).intValue();
	}
	
	public String getMaxImproveNoticeNoBySearch(String operator, String source, int year) {
		@SuppressWarnings("unchecked")
		List<String> improveNoticeNo = (List<String>) this.query("select max(t.improveNoticeNo) from ImproveNoticeDO t where t.source = ? and t.operator = ? and year(t.created) = ? order by t.improveNoticeNo desc", source, operator, year);
		return improveNoticeNo.get(0);
	}
	
	
	
	/**
	 * 获取进行验证人分配时的验证人的下拉列表<br>
	 * 支持模糊搜索
	 * @return
	 */
	public List<Map<String, Object>> getImproveNoticeConfirmMan(Integer improveNoticeId, String term){
		ImproveNoticeDO improveNotice = this.internalGetById(improveNoticeId);
		if (EnumImproveNoticeType.SYS.toString().equals(improveNotice.getImproveNoticeType())) { // 系统级时从审计员资质库中获取一级审计员
			return auditorDao.getAuditorByRole(term);
		} else { // 分子公司级时获取执行单位下的二级审计员和审计员资质库中的一级审计员
			List<Map<String, Object>> list = auditorDao.getAuditorByRole(term);
			// 执行单位
			boolean hasUnit = false;
			Integer operator = Integer.parseInt(improveNotice.getOperator());
			for (Map<String, Object> map : list) {
				if (operator.equals((Integer)map.get("unitId"))) {
					hasUnit = true;
					break;
				}
			}
			if (!hasUnit) {
				UnitDO unit = unitDao.internalGetById(operator);
				Map<String, Object> unitMap = new HashMap<String, Object>();
				unitMap.put("unitId", unit.getId());
				unitMap.put("unitName", unit.getName());
				unitMap.put("parentId", 0);
			}
			// 验证人
			DictionaryDO dic = dictionaryDao.getByTypeAndKey("审计角色", EnumAuditRole.SECOND_GRADE_AUDITOR.getKey());
			if (null == dic) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_133000006, "审计角色", EnumAuditRole.SECOND_GRADE_AUDITOR.getKey());
			}
			List<UserDO> users = unitRoleActorDao.getUsersByUnitIdAndRoleName(operator, dic.getName(), term);
			for (UserDO user : users) {
				Map<String, Object> userMap = new HashMap<String, Object>();
				userMap.put("userId", user.getId());
				userMap.put("userfullname", user.getFullname());
				userMap.put("parentId", operator);
				list.add(userMap);
			}
			return list;
		}
	}
	
	/**
	 * 根据计划id检索对应的整改通知单
	 * @param taskId
	 * @return
	 */
	public List<ImproveNoticeDO> getByPlanId(Integer planId) {
		if (null == planId) {
			return null;
		}
		@SuppressWarnings("unchecked")
		List<ImproveNoticeDO> improveNotices = (List<ImproveNoticeDO>) this.query("select distinct i from ImproveNoticeDO i, PlanDO p where i.deleted = false and i.taskId in (select t.id from TaskDO t where t.deleted = false and t.plan.id = ?)", planId);
		return improveNotices;
	}
	
	/**
	 * 获取整改单的完成日期和延迟日期
	 * @param improve
	 * @return
	 */
	public Map<String, Object> getCompleteDateAndDelayDate(ImproveNoticeDO improveNotice){
		Map<String, Object> result = new HashMap<String, Object>();
		
		// 所有的问题列表都整改完成后取最后的日期
		Date completeDate = null;
		// 所有整改延期的问题列表的最后的整改期限
		Date improveNoticeDelayDate = null;
		// 所有验证延期的问题列表的最后的验证期限
		Date confirmDelayDate = null;
		// 是否全部处于验证完成状态
		boolean isCompleted = true;
		Set<ImproveNoticeIssueDO> improveNoticeIssues = improveNotice.getImproveNoticeIssues();
		for (ImproveNoticeIssueDO improveNoticeIssue : improveNoticeIssues) {
			if (!improveNoticeIssue.isDeleted()) {
				// 整改完成日期
				Date improveNoticeDate = improveNoticeIssue.getCompletionDate();
				// 整改期限
				Date improveNoticeLastDate = improveNoticeIssue.getImproveDeadLine();
				// 验证日期
				Date confirmDate = improveNoticeIssue.getConfirmDate();
				// 验证期限
				Date confirmLastDate = improveNoticeIssue.getConfirmDeadLine();
				
				// 完成日期
				if (null == improveNoticeDate) {
					isCompleted = false;
					completeDate = null;
				}
				if (isCompleted) {
					if (null == completeDate || improveNoticeDate.after(completeDate)) {
						completeDate = improveNoticeDate;
					}
				}
				// 整改的延期时间
				if (null != improveNoticeLastDate && (null != improveNoticeDate && improveNoticeDate.after(improveNoticeLastDate))) { // 整改发生延期时
					improveNoticeDelayDate = improveNoticeLastDate;
				}
				
				// 验证的延期时间
				if (null != confirmLastDate && (null != confirmDate && confirmDate.after(confirmLastDate))) { // 验证发生延期时
					confirmDelayDate = confirmLastDate;
				}
			}
		}
		result.put("completeDate", DateHelper.formatIsoDate(completeDate));
		result.put("improveNoticeDelayDate", completeDate != null ? "" : DateHelper.formatIsoDate(improveNoticeDelayDate));
		result.put("confirmDelayDate", completeDate != null ? "" : DateHelper.formatIsoDate(confirmDelayDate));
		return result;
	}
	
	@SuppressWarnings("unchecked")
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void sendImproveNotice(Integer id) {
		ImproveNoticeDO improveNotice = this.internalGetById(id);
		if (null == improveNotice || null == improveNotice.getImproveNoticeIssues() || improveNotice.getImproveNoticeIssues().isEmpty()) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "该整改通知单没有问题列表，不能下发！");
		}
		List<ImproveNoticeIssueDO> list = improveNoticeIssueDao.getByImproveNoticeId(improveNotice.getId());
		// 将处理人置空
		List<ImproveNoticeFlowUserDO> auditUsers = improveNoticeFlowUserDao.getByImproveNoticeId(improveNotice.getId());
		improveNoticeFlowUserDao.delete(auditUsers);
		// 下发之前先将已下发的整改通知单子单删除
		List<SubImproveNoticeDO> subs = subImproveNoticeDao.getByImproveNoticeId(improveNotice.getId());
		subImproveNoticeDao.delete(subs);
		
		// 将有多个责任单位的问题列表拆分
		List<ImproveNoticeIssueDO> newList = new ArrayList<ImproveNoticeIssueDO>(); 
		for (ImproveNoticeIssueDO improveNoticeIssue : list) {
			String[] improveUnits = StringUtils.split(improveNoticeIssue.getImproveUnit(), ",");
			if (improveUnits.length > 1) {
				int i = 0;
				for (String improveUnit : improveUnits) {
					if (i == 0) {
						improveNoticeIssue.setImproveUnit(improveUnit);
						improveNoticeIssueDao.update(improveNoticeIssue);
						newList.add(improveNoticeIssue);
					} else {
						ImproveNoticeIssueDO newImproveNoticeIssue;
						try {
							newImproveNoticeIssue = (ImproveNoticeIssueDO) BeanUtils.cloneBean(improveNoticeIssue);
						} catch (Exception e) {
							e.printStackTrace();
							throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "操作失败！错误详情：" + e.getMessage());
						}
						newImproveNoticeIssue.setId(null);
						newImproveNoticeIssue.setImproveUnit(improveUnit);
						improveNoticeIssueDao.internalSave(newImproveNoticeIssue);
						improveNoticeIssueDao.afterSave(newImproveNoticeIssue);
						newList.add(newImproveNoticeIssue);
					}
					i++;
				}
			} else {
				newList.add(improveNoticeIssue);
			}
		}
		
		Set<ImproveNoticeIssueDO> improveNoticeIssues = null;
		Map<String, Object> map = new HashMap<String, Object>();
		for (ImproveNoticeIssueDO improveNoticeIssue : newList) {
			// 按照责任单位分组
			String improveUnit = improveNoticeIssue.getImproveUnit();
			if (map.containsKey(improveUnit)) {
				improveNoticeIssues = (Set<ImproveNoticeIssueDO>) map.get(improveUnit);
				improveNoticeIssues.add(improveNoticeIssue);
			} else {
				improveNoticeIssues = new HashSet<ImproveNoticeIssueDO>();
				improveNoticeIssues.add(improveNoticeIssue);
				map.put(improveUnit, improveNoticeIssues);
			}
		}
		
		String workflowTemplateId = auditWorkflowSchemeDao.getWorkflowTempIdBySearch(improveNotice.getImproveNoticeType(), null, "SUB_IMPROVE_NOTICE");

		// 按责任单位生成子单并进行下发
		for (Entry<String, Object> entry : map.entrySet()) {
			SubImproveNoticeDO subImproveNotice = new SubImproveNoticeDO();
			subImproveNotice.setImproveNotice(improveNotice);
			subImproveNotice.setImproveUnit(entry.getKey());
//			subImproveNotice.setImproveNoticeIssues((Set<ImproveNoticeIssueDO>) entry.getValue());
			subImproveNotice.setCreator(UserContext.getUser());
			subImproveNotice.setLastUpdater(UserContext.getUser());
			subImproveNoticeDao.internalSave(subImproveNotice);
			for (ImproveNoticeIssueDO improveNoticeIssue : (Set<ImproveNoticeIssueDO>) entry.getValue()) {
				improveNoticeIssue.setSubImproveNotice(subImproveNotice);
				improveNoticeIssueDao.internalUpdate(improveNoticeIssue);
			}

			// 使用工作流
			Map<String, Object> objmap = new HashMap<String, Object>();
			objmap.put("id", subImproveNotice.getId());
			objmap.put("dataobject", "subImproveNotice");
			try{
				String workflowId = (String) transactionHelper.doInTransaction(new WfSetup(), "Submit", UserContext
						.getUserId().toString(), workflowTemplateId, "", "", gson.toJson(objmap));
				subImproveNotice.setFlowId(workflowId);
			} catch (Exception e) {
				String improveUnit = null;
				List<Map<String, Object>> improveUnitMaps = improveNoticeIssueDao.getImproveUnitMap(subImproveNotice.getImproveUnit());
				if (improveUnitMaps.size() > 0) {
					improveUnit = (String) improveUnitMaps.get(0).get("name");
				} else {
					improveUnit = subImproveNotice.getImproveUnit();
				}
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "责任单位为" + improveUnit + "的问题实例化工作流失败！错误详情：" + e.getMessage());
			}
			subImproveNoticeDao.internalUpdate(subImproveNotice);
		}
		
		if (map.size() > 0) {
			// 修改状态为下发
			improveNotice.setStatus(EnumImproveNoticeStatus.SENT.toString());
			
			this.update(improveNotice);
		} else {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "下发未成功请重新下发！");
		}
	}
	
	/**
	 * 由工作单生成整改通知单
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public int generateImproveNoticeFromTask(TaskDO task) {
		
		// 有问题的检查项(待下发)
		List<CheckListDO> hasProblems = checkListDao.getHasProblemsByTaskId(task.getId());
		
		if (hasProblems.isEmpty()) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "该工作单没有任何有问题的项目，无法生成整改通知单！");
		} 
		
		Map<String, Object> improveNoticeMap = new HashMap<String, Object>();
		// 工作单id
		improveNoticeMap.put("taskId", task.getId().doubleValue());
		// 工作单编号
		improveNoticeMap.put("workNo", task.getWorkNo());
		// 类型
		improveNoticeMap.put("improveNoticeType", task.getCheckType());
		// 整改来源
		improveNoticeMap.put("source", task.getPlanType());
		
		// 整改通知单编号
		improveNoticeMap.put("improveNoticeNo", this.generateImproveNoticeNo(task.getOperator(), task.getPlanType(), task.getCheckType()));
		
		// 整改通知单来源编号取工作单的编号
		improveNoticeMap.put("improveNoticeSourceNo", task.getWorkNo());
		
		// 审计地点, 检查地点
		improveNoticeMap.put("address", task.getAddress());
		
		// 检查日期()
		improveNoticeMap.put("checkStartDate", task.getStartDate());
		improveNoticeMap.put("checkEndDate", task.getEndDate());
		
		// 执行单位(安监机构的ID)
		improveNoticeMap.put("operator", task.getOperator());
		
		// 经办人
		improveNoticeMap.put("improveNoticeTransactor", task.getAuditReportTransactor());
		
		// 经办人联系方式
		improveNoticeMap.put("improveNoticeTransactorTel", task.getContact());
		
		Integer improveNoticeId = this.save(improveNoticeMap);
		
		// 审计报告的附件
		List<FileDO> files = fileDao.getFilesBySource(EnumFileType.TASK.getCode(), task.getId());
		for (FileDO file : files) {
			FileDO newFile;
			try {
				newFile = (FileDO) BeanUtils.cloneBean(file);
				newFile.setId(null);
				newFile.setSource(improveNoticeId);
				newFile.setSourceType(EnumFileType.IMPROVE_NOTICE_SENT.getCode());
				fileDao.internalSave(newFile);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
		
		for (CheckListDO checkList : hasProblems) {
			Map<String, Object> improveNoticeIssueMap = new HashMap<String, Object>();
			// 整改通知单
			improveNoticeIssueMap.put("improveNotice", improveNoticeId.doubleValue());
			// 检查单id
			improveNoticeIssueMap.put("checkListId", checkList.getId().doubleValue());
			// 问题内容
			StringBuffer issueContent = new StringBuffer("检查要点：");
			if (StringUtils.isNotBlank(checkList.getItemPoint())) {
				issueContent.append(checkList.getItemPoint());
			}
			issueContent.append("\n检查记录：");
			if (StringUtils.isNotBlank(checkList.getAuditRecord())) {
				issueContent.append(checkList.getAuditRecord());
			}
			improveNoticeIssueMap.put("issueContent", issueContent.toString());
			// 责任单位
			improveNoticeIssueMap.put("improveUnit", checkList.getImproveUnit());
			// 整改期限
			improveNoticeIssueMap.put("improveDeadLine", checkList.getImproveLastDate());
			// 专业
			improveNoticeIssueMap.put("profession", checkList.getCheck().getCheckType().getId().doubleValue());
			
			Integer issueId = improveNoticeIssueDao.save(improveNoticeIssueMap);
			
			// 审计记录的附件
			fileDao.cloneFilesToNewSource(EnumFileType.CHECKLIST, checkList.getId(), EnumFileType.IMPROVE_NOTICE_ISSUE, issueId);
		}
		return improveNoticeId;
	}
	
	/**
	 * 写入可创建整改通知单的人到流程处理人
	 * @param obj
	 */
	public void writeCreatableUsers(ImproveNoticeDO obj, List<UserDO> processors) {
		// 先将处理人置空
		List<ImproveNoticeFlowUserDO> auditUsers = improveNoticeFlowUserDao.getByImproveNoticeId(obj.getId());
		improveNoticeFlowUserDao.delete(auditUsers);
		List<UserDO> users;
		if (processors != null && !processors.isEmpty()) {
			users = processors;
		} else {
			if (EnumImproveNoticeType.SYS.toString().equals(obj.getImproveNoticeType())) {
				users = permissionSetDao.getPermittedUsers(PermissionSets.CREATE_SYS_IMPROVE_NOTICE.getName());
			} else {
				users = permissionSetDao.getPermittedUsers(Integer.parseInt(obj.getOperator()), PermissionSets.CREATE_SUB_IMPROVE_NOTICE.getName());
			}
		}
		for (UserDO user : users) {
			ImproveNoticeFlowUserDO flowUser = new ImproveNoticeFlowUserDO();
			flowUser.setImproveNotice(obj);
			flowUser.setUser(user);
			improveNoticeFlowUserDao.internalSave(flowUser);
		}
	}
	
	/**
	 * 整改通知单是否可以被删除
	 * @param improveNotice
	 * @return
	 */
	public boolean isDeletable(ImproveNoticeDO improveNotice) {
		boolean isDeletable = false;
		if (EnumImproveNoticeType.SYS.toString().equals(improveNotice.getImproveNoticeType())) {
			isDeletable = permissionSetDao.hasPermission(PermissionSets.DELETE_SYS_IMPROVE_NOTICE.getName());
		} else if (EnumImproveNoticeType.SUB2.toString().equals(improveNotice.getImproveNoticeType())) {
			isDeletable = permissionSetDao.hasUnitPermission(Integer.parseInt(improveNotice.getOperator()), PermissionSets.DELETE_SUB_IMPROVE_NOTICE.getName());
		}
		return isDeletable;
	}
	
	public ImproveNoticeDO getBasicInfoById(Integer id) {
		@SuppressWarnings("unchecked")
		List<Object[]> infos = (List<Object[]>) this.query("select t.improveNoticeNo, t.operator from ImproveNoticeDO t where t.deleted = false and t.id = ?", id);
		if (infos.isEmpty()) {
			return null;
		}
		ImproveNoticeDO improveNotice = new ImproveNoticeDO();;
		improveNotice.setId(id);
		improveNotice.setImproveNoticeNo((String) infos.get(0)[0]);
		improveNotice.setOperator((String) infos.get(0)[1]);
		return improveNotice;
	}

	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);;
	}
	
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(Collection<ImproveNoticeDO> list) {
		if (null != list && !list.isEmpty()) {
			Collection<String> ids = new ArrayList<String>();
			for (ImproveNoticeDO improveNotice : list) {
				ids.add(improveNotice.getId().toString());
			}
			this.markAsDeleted(ids.toArray(new String[0]));
		}
	}
	
	@Override
	public boolean hasPermission(Integer id, HttpServletRequest request) {
		// 先查看是否有全局权限
		if (permissionSetDao.hasPermission(PermissionSets.VIEW_GLOBAL_IMPROVE_NOTICE.getName())) {
			return true;
		}
		// 再查看是否有机构权限
		return permissionSetDao.hasUnitPermission(PermissionSets.VIEW_UNIT_IMPROVE_NOTICE.getName());
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

	public void setSubImproveNoticeDao(SubImproveNoticeDao subImproveNoticeDao) {
		this.subImproveNoticeDao = subImproveNoticeDao;
	}

	public void setImproveNoticeIssueDao(ImproveNoticeIssueDao improveNoticeIssueDao) {
		this.improveNoticeIssueDao = improveNoticeIssueDao;
	}

	public void setAuditorDao(AuditorDao auditorDao) {
		this.auditorDao = auditorDao;
	}

	public void setFileDao(FileDao fileDao) {
		this.fileDao = fileDao;
	}

	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}
	
	public void setAuditWorkflowSchemeDao(AuditWorkflowSchemeDao auditWorkflowSchemeDao) {
		this.auditWorkflowSchemeDao = auditWorkflowSchemeDao;
	}

	public void setUserGroupDao(UserGroupDao userGroupDao) {
		this.userGroupDao = userGroupDao;
	}

	public void setImproveNoticeFlowUserDao(ImproveNoticeFlowUserDao improveNoticeFlowUserDao) {
		this.improveNoticeFlowUserDao = improveNoticeFlowUserDao;
	}

	public void setMessageDao(MessageDao messageDao) {
		this.messageDao = messageDao;
	}

	public void setAuditReportDao(AuditReportDao auditReportDao) {
		this.auditReportDao = auditReportDao;
	}

}
