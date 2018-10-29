package com.usky.sms.audit.improvenotice;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.activity.attribute.ActivityStatusDO;
import com.usky.sms.activity.attribute.ActivityStatusDao;
import com.usky.sms.audit.AuditConstant;
import com.usky.sms.audit.IAudit;
import com.usky.sms.audit.auditor.AuditorDao;
import com.usky.sms.audit.check.CheckListDao;
import com.usky.sms.audit.log.AuditActivityLoggingDao;
import com.usky.sms.audit.plan.PlanDao;
import com.usky.sms.audit.task.TaskDao;
import com.usky.sms.common.DateHelper;
import com.usky.sms.constant.EnumMessageCatagory;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.core.TransactionHelper;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.file.FileDao;
import com.usky.sms.message.MessageDao;
import com.usky.sms.organization.OrganizationDO;
import com.usky.sms.organization.OrganizationDao;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.unit.UnitRoleActorDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;
import com.usky.sms.uwffunc.IUwfFuncPlugin;

public class SubImproveNoticeDao extends BaseDao<SubImproveNoticeDO> implements IUwfFuncPlugin, IAudit{

	
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
	private SubImproveNoticeFlowUserDao subImproveNoticeFlowUserDao;
	
	@Autowired
	private FileDao fileDao;
	
	@Autowired
	private MessageDao messageDao;
	
	@Autowired
	private AuditorDao auditorDao;
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	
	@Autowired
	private ImproveNoticeIssueDao improveNoticeIssueDao;
	
	@Autowired
	private ImproveNoticeDao improveNoticeDao;
	
	protected SubImproveNoticeDao() {
		super(SubImproveNoticeDO.class);
	}

	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		SubImproveNoticeDO subImproveNotice = (SubImproveNoticeDO)obj;
		if ("improveUnit".equals(fieldName)) {
			if (null != subImproveNotice.getImproveUnit()) {
				List<Map<String, Object>> unitMaps = new ArrayList<Map<String,Object>>();
				String[] ids = subImproveNotice.getImproveUnit().split(",");
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
				map.put(fieldName, unitMaps);
			}
		} else if ("lastUpdate".equals(fieldName)) {
			Date lastUpdate = subImproveNotice.getLastUpdate();
			map.put("lastUpdate", DateHelper.formatIsoSecond(lastUpdate));
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}

	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple,
			boolean showExtendFields) {
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
	}
	
	/**
	 * 根据整改单id获取整改单子单列表
	 * @param improveNoticeId
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<SubImproveNoticeDO> getByImproveNoticeId(Integer improveNoticeId){
		return (List<SubImproveNoticeDO>) this.query("from SubImproveNoticeDO t where t.deleted = false and t.improveNotice.id = ?", improveNoticeId);
	}

	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		// 创建人
		map.put("creator", UserContext.getUserId());
		// 更新人
		map.put("lastUpdater", UserContext.getUserId());
		return true;
	}
	
	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		// 更新人
		map.put("lastUpdater", UserContext.getUserId());
	}

	@Override
	protected void afterUpdate(SubImproveNoticeDO obj, SubImproveNoticeDO dbObj) {
		// TODO 责任
		super.afterUpdate(obj, dbObj);
	}

	@Override
	protected void afterSave(SubImproveNoticeDO obj) {
	}
	
	/**
	 * 查询整改通知单子单<br>
	 * 通过来源，签发单位，审计日期和责任单位进行查询
	 */
	@SuppressWarnings("unchecked")
	public List<SubImproveNoticeDO> getBySearch(String improveNoticeNo, String source, String operator, String improveUnit, Date startCheckDate, Date endCheckDate){
		StringBuffer hql = new StringBuffer("from SubImproveNoticeDO t where t.deleted = ?");
		List<Object> values = new ArrayList<Object>();
		values.add(false);
		if (null != source) {
			hql.append(" and t.improveNotice.improveNoticeNo = ?");
			values.add(improveNoticeNo);
		}
		if (null != source) {
			hql.append(" and t.improveNotice.source = ?");
			values.add(source);
		}
		if (null != operator) {
			hql.append(" and t.improveNotice.operator = ?");
			values.add(operator);
		}
		if (null != improveUnit) {
			hql.append(" and t.improveUnit = ?");
			values.add(improveUnit);
		}
		if (null != startCheckDate){
			hql.append(" and t.improveNotice.checkDate >= ?");
			values.add(startCheckDate);
		}
		if (null != endCheckDate){
			hql.append(" and t.improveNotice.checkDate <= ?");
			values.add(endCheckDate);
		}
		return (List<SubImproveNoticeDO>) this.query(hql.toString(), values.toArray());
	}
	
	public SubImproveNoticeDO getBasicInfoById(Integer id) {
		@SuppressWarnings("unchecked")
		List<Object[]> infos = (List<Object[]>) this.query("select t.improveNotice.id, t.improveNotice.improveNoticeNo, t.flowId from SubImproveNoticeDO t where t.deleted = false and t.id = ?", id);
		if (infos.isEmpty()) {
			return null;
		}
		ImproveNoticeDO improveNotice = new ImproveNoticeDO();;
		improveNotice.setId((Integer) infos.get(0)[0]);
		improveNotice.setImproveNoticeNo((String) infos.get(0)[1]);
		SubImproveNoticeDO subImproveNotice = new SubImproveNoticeDO();
		subImproveNotice.setId(id);
		subImproveNotice.setImproveNotice(improveNotice);
		subImproveNotice.setFlowId((String) infos.get(0)[2]);
		return subImproveNotice;
	}
	
	@Override
	protected void beforeDelete(Collection<SubImproveNoticeDO> collection) {
		// 删除时权限校验
		boolean hasPermission = false;
		if (null != collection && !collection.isEmpty()) {
			hasPermission = improveNoticeDao.isDeletable(collection.iterator().next().getImproveNotice());
		}
		if (!hasPermission) {
			throw SMSException.NO_ACCESS_RIGHT;
		}
	}

	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}
	
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(Collection<SubImproveNoticeDO> list) {
		if (null != list && !list.isEmpty()) {
			Collection<String> ids = new ArrayList<String>();
			for (SubImproveNoticeDO subImproveNotice : list) {
				ids.add(subImproveNotice.getId().toString());
			}
			this.markAsDeleted(ids.toArray(new String[0]));
		}
	}

	@Override
	protected void afterDelete(Collection<SubImproveNoticeDO> list) {
		if (null != list && !list.isEmpty()) {
			List<ImproveNoticeIssueDO> issues = improveNoticeIssueDao.getBySubImproveNotices(list);
			improveNoticeIssueDao.delete(issues);
		}
	}

	@Override
	public void writeUser(Integer id, String[] userIds) {
		List<UserDO> existUsers = subImproveNoticeFlowUserDao.getUsersBySubImproveNotice(id);// 已存在的user
		List<UserDO> users = userDao.internalGetByIds(userIds);// 要加入的user
		Set<UserDO> mergedUses = new HashSet<UserDO>();// 合并去重
		mergedUses.addAll(existUsers);
		mergedUses.addAll(users);
		SubImproveNoticeDO subImproveNotice = this.internalGetById(id);
		Set<SubImproveNoticeFlowUserDO> flowUsers = subImproveNotice.getFlowUsers();
		if (null != flowUsers) {// 先删除数据库中已有的数据
			subImproveNoticeFlowUserDao.delete(flowUsers);
		}
		for (UserDO user : mergedUses) {// 再向数据库中添加新的数据
			SubImproveNoticeFlowUserDO flowUser = new SubImproveNoticeFlowUserDO();
			flowUser.setSubImproveNotice(subImproveNotice);
			flowUser.setUser(user);
			subImproveNoticeFlowUserDao.internalSave(flowUser);
		}
	}

	@Override
	public void setStatus(Integer id, Integer statusId, Map<String, Object> attributes) {
		SubImproveNoticeDO subImproveNotice = this.internalGetById(id);
		// 将处理人置空
		Set<SubImproveNoticeFlowUserDO> flowUsers = subImproveNotice.getFlowUsers();
		if (null != flowUsers) {
			subImproveNoticeFlowUserDao.delete(flowUsers);
		}
		// 状态
		ActivityStatusDO status = activityStatusDao.internalGetById(statusId);
		if (null != status) {
			subImproveNotice.setFlowStatus(status.getName());
		}
		// 更新计划的工作流节点
		// 工作流节点属性
		if (null != attributes) {
			subImproveNotice.setFlowStep((String) attributes.get("flowStep"));
		}
		this.internalUpdate(subImproveNotice);
	}

	@Override
	public Collection<Integer> getUserByUnitRole(Integer id, Integer roleId) {
		// 取出安监机构的ID
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
		// 取出安监机构的ID
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
		SubImproveNoticeDO subImproveNotice = this.internalGetById(id);
		if (null != subImproveNotice && null != subImproveNotice.getImproveUnit()) {
			if (subImproveNotice.getImproveUnit().startsWith(AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP)) { // 责任单位以"DP"开头表示组织
				// 取出组织对应的安监机构的ID
				OrganizationDO organization = organizationDao.internalGetById(Integer.parseInt(subImproveNotice.getImproveUnit().replace(AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP, "")));
				if (null != organization && null != organization.getUnit()) {
					unitId = organization.getUnit().getId();
				}
			} else if (subImproveNotice.getImproveUnit().startsWith(AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT)){ // 责任单位以"UT"开头表示安监机构
				unitId = Integer.parseInt(subImproveNotice.getImproveUnit().replace(AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT, ""));
			}
		}
		return unitId;
	}

	@Override
	public Integer getRelatedOrganizationId(Integer id, String field) {
		Integer organizationId = null;
		SubImproveNoticeDO subImproveNotice = this.internalGetById(id);
		if (null != subImproveNotice) {
			if ("operator".equals(field)) {
				organizationId = Integer.parseInt(subImproveNotice.getImproveNotice().getOperator());
			} else if (null != subImproveNotice.getImproveUnit()) {
				if (subImproveNotice.getImproveUnit().startsWith(AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP)) { // 责任单位以"DP"开头表示组织
					// 取出组织的ID
					organizationId = Integer.parseInt(subImproveNotice.getImproveUnit().replace(AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP, ""));
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
		SubImproveNoticeDO subImproveNotice = this.internalGetById(id);
		if (null != subImproveNotice && userIds != null && !userIds.isEmpty() && sendingModes != null && !sendingModes.isEmpty()) {
			// 标题
			String title = "审计待办提醒";
			// 正文内容
			String content = "您有一个整改通知单需要处理。名称[" + subImproveNotice.getDisplayName() + "], 详情请看安全审计中待我处理的审计任务。";

			// 获取ADMIN的id
			UserDO admin = userDao.getByUsername("ADMIN");
			// 接收人
			List<UserDO> users = userDao.getByIds(new ArrayList<Integer>(userIds));
			Collection<EnumMessageCatagory> sendingModeEnums = EnumMessageCatagory.getEnumByVals(sendingModes);
			// 保存
			messageDao.saveTodoMsg(sendingModeEnums, admin, users, title, content, id, "SUB_IMPROVE_NOTICE");
		}
	}
	
	@Override
	public void sendFeedbackMsg(Integer id, Collection<String> sendingModes) {
		// TODO Auto-generated method stub
		
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

	public void setSubImproveNoticeFlowUserDao(SubImproveNoticeFlowUserDao subImproveNoticeFlowUserDao) {
		this.subImproveNoticeFlowUserDao = subImproveNoticeFlowUserDao;
	}

	public void setFileDao(FileDao fileDao) {
		this.fileDao = fileDao;
	}

	public void setAuditorDao(AuditorDao auditorDao) {
		this.auditorDao = auditorDao;
	}

	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}

	public void setImproveNoticeIssueDao(ImproveNoticeIssueDao improveNoticeIssueDao) {
		this.improveNoticeIssueDao = improveNoticeIssueDao;
	}

	public void setImproveNoticeDao(ImproveNoticeDao improveNoticeDao) {
		this.improveNoticeDao = improveNoticeDao;
	}

	public void setMessageDao(MessageDao messageDao) {
		this.messageDao = messageDao;
	}

}
