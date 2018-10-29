package com.usky.sms.audit.validate;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.StringUtils;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.usky.sms.audit.auditor.AuditorDao;
import com.usky.sms.audit.base.ProfessionUserDao;
import com.usky.sms.common.NumberHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.http.service.GsonBuilder4SMS;
import com.usky.sms.message.MessageDO;
import com.usky.sms.message.MessageDao;
import com.usky.sms.organization.OrganizationDO;
import com.usky.sms.organization.OrganizationDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;
import com.usky.sms.utils.SpringBeanUtils;

public class ActionItemCreatorDao extends BaseDao<ActionItemCreatorDO> {

	protected static final Gson gson = GsonBuilder4SMS.getInstance();
	
	protected ActionItemCreatorDao() {
		super(ActionItemCreatorDO.class);
	}

	/**
	 * 建立人和组织的对应关系
	 * 
	 * @return
	 */
	private Map<Integer, List<Integer>> factoryUserAndOrganization() {
		String sql = "select u.id as userId, org.id as orgId"
				+ " from t_organization org"
				+ " join T_USER_ORGANIZATION user_org"
				+ "   on org.id = user_org.organization_id"
				+ " join t_user u"
				+ "   on user_org.user_id = u.id"
				+ " where u.id in (select creator.creator_id from A_ACTION_ITEM_CREATOR creator)";
		Map<Integer, List<Integer>> map = this.queryList(sql);
		return map;
	}
	/**
	 * 建立行动项和组织的对应关系
	 * 
	 * @return
	 */
	private Map<Integer, List<Integer>> factoryActionItemAndOrganization() {
		String sql = "select action_item.id as actionItemId, org.id as orgId"
				+ " from t_action_item action_item"
				+ " join t_aitem_organization aitem"
				+ "   on action_item.id = aitem.aitem_id"
				+ " join t_organization org"
				+ "   on org.id = aitem.organization_id"
				+ " where action_item.id in (select creator.action_item_id from A_ACTION_ITEM_CREATOR creator)";
		Map<Integer, List<Integer>> map = this.queryList(sql);
		return map;
	}

	/**
	 * sql返回两列，第一列有重复，第二列无重复，组合成1：n的关系
	 * 
	 * @param sql
	 * @return
	 */
	private Map<Integer, List<Integer>> queryList(String sql) {
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql);
		@SuppressWarnings("unchecked")
		List<Object[]> list = query.list();
		Map<Integer, List<Integer>> map = new HashMap<Integer, List<Integer>>();
		for (Object[] o : list) {
			if (o[0] != null && o[1] != null) {
				Integer o0 = ((BigDecimal) o[0]).intValue();
				Integer o1 = ((BigDecimal) o[1]).intValue();
				List<Integer> orgIds = map.get(o0);
				if (orgIds == null) {
					orgIds = new ArrayList<Integer>();
					map.put(o0, orgIds);
				}
				orgIds.add(o1);
			}
		}
		return map;
	}

	/**
	 * 建立组织id和组织object的关系
	 * 
	 * @return
	 */
	private Map<Integer, OrganizationDO> factoryOrganization() {
		@SuppressWarnings("unchecked")
		List<OrganizationDO> orgs = this.getHibernateTemplate().find("from OrganizationDO");
		Map<Integer, OrganizationDO> map = new HashMap<Integer, OrganizationDO>();
		for (OrganizationDO o : orgs) {
			map.put(o.getId(), o);
		}
		return map;
	}

	/**
	 * 根据组织的id返回这些组织的路径
	 * 
	 * @param orgIds
	 * @param resourceMap
	 * @return
	 */
	private List<String> getOrganizationByIds(List<Integer> orgIds, Map<Integer, OrganizationDO> resourceMap) {
		List<OrganizationDO> ogrs = new ArrayList<OrganizationDO>();
		if (null != orgIds) {
			for (Integer orgId : orgIds) {
				ogrs.add(resourceMap.get(orgId));
			}
		}
		List<String> paths = new ArrayList<String>();
		for (OrganizationDO org : ogrs) {
			StringBuilder path = new StringBuilder();
			OrganizationDO tempOrg = org;
			path.insert(0, "/" + tempOrg.getName());
			while (tempOrg.getParent() != null) {
				tempOrg = tempOrg.getParent();
				path.insert(0, "/" + tempOrg.getName());
			}
			paths.add(path.toString().substring(1, path.length()));
		}
		return paths;
	}

	/**
	 * 通过actionItem或user的id获取责任单位
	 * @return
	 */
	private List<String> getPathsByActionItemIdOrUserId(Integer resourceId, Map<Integer, List<Integer>> resourceMap, Map<Integer, OrganizationDO> orgsMap) {
		List<Integer> orgIds = resourceMap.get(resourceId);
		List<String> paths = this.getOrganizationByIds(orgIds, orgsMap);
		return paths;
	}
	
	/**
	 * 查询风险验证列表结果集
	 * @param request
	 * @return
	 */
	private List<Object[]> getViewData(HttpServletRequest request) {
		String _status = request.getParameter("status");//行动项状态
		String _result = request.getParameter("result"); //验证结论
		String description = request.getParameter("description"); //行动项描述
		List<String> status = gson.fromJson(_status, new TypeToken<List<String>>(){}.getType());
		List<String> result = gson.fromJson(_result, new TypeToken<List<String>>(){}.getType());
		String deadlineStart = request.getParameter("deadlineStart"); //行动项期限
		String deadlineEnd = request.getParameter("deadlineEnd");
		StringBuffer sql = new StringBuffer();
		sql.append("select action_item.id,");
		sql.append(" action_item.deadline,");
		sql.append(" action_item.description,");
		sql.append(" action_item.status,");
		sql.append(" creator.creator_id,");
		sql.append(" risk.validator,");
		sql.append(" risk.result,");
		sql.append(" risk.id as validateriskid,");
		sql.append(" DECODE(TM_TEM.ACTIVITY_ID,NULL,DECODE(EM_TEM.ACTIVITY_ID,NULL,DECODE(RTM_RISK.ACTIVITY_ID,NULL, REM_RISK.ACTIVITY_ID,RTM_RISK.ACTIVITY_ID),EM_TEM.ACTIVITY_ID),TM_TEM.ACTIVITY_ID) AS ACTIVITY_ID");
		sql.append(" from t_action_item action_item");
		sql.append(" join a_action_item_creator creator");
		sql.append("   on action_item.id = creator.action_item_id");
		sql.append(" left join a_validate_risk risk");
		sql.append("   on creator.action_item_id = risk.action_item_id");
		sql.append(" LEFT JOIN T_CONTROL_MEASURE CM ON (ACTION_ITEM.MEASURE_ID = CM.ID)");
		sql.append(" LEFT JOIN T_THREAT_MAPPING TM ON (CM.THREAT_ID = TM.ID)");
		sql.append(" LEFT JOIN T_TEM TM_TEM ON (TM.TEM_ID = TM_TEM.ID)");
		sql.append(" LEFT JOIN T_ERROR_MAPPING EM ON (CM.ERROR_ID = EM.ID)");
		sql.append(" LEFT JOIN T_TEM EM_TEM ON (EM.TEM_ID = EM_TEM.ID)");
		sql.append(" LEFT JOIN T_CLAUSE CLAUSE ON (ACTION_ITEM.CLAUSE_ID = CLAUSE.ID)");
		sql.append(" LEFT JOIN T_RISK_THREAT_MAPPING RTM ON (CLAUSE.THREAT_ID = RTM.ID)");
		sql.append(" LEFT JOIN T_RISK_ANALYSIS RTM_RA ON (RTM.ANALYSIS_ID = RTM_RA.ID)");
		sql.append(" LEFT JOIN T_RISK RTM_RISK ON (RTM_RA.RISK_ID = RTM_RISK.ID)");
		sql.append(" LEFT JOIN T_RISK_ERROR_MAPPING REM ON (CLAUSE.ERROR_ID = REM.ID)");
		sql.append(" LEFT JOIN T_RISK_ANALYSIS REM_RA ON (RTM.ANALYSIS_ID = REM_RA.ID)");
		sql.append(" LEFT JOIN T_RISK REM_RISK ON (REM_RA.RISK_ID = REM_RISK.ID)");
		sql.append(" where 1 = 1");
		if (description != null && description.length() > 0) {
			sql.append(" and upper(action_item.description) like upper(?)");
		}
		if (status.size() > 0) {
			sql.append(" and action_item.status in ('" + StringUtils.join(status, "','") + "')");
		}
		if (result.size() > 0) {
			sql.append(" and risk.result in ('" + StringUtils.join(result, "','") + "')");
		}
		if (deadlineStart != null && deadlineStart.length() > 0) {
			sql.append(" and action_item.deadline >= to_date('" + deadlineStart + "','yyyy-MM-dd')");
		}
		if (deadlineEnd != null && deadlineEnd.length() > 0) {
			sql.append(" and action_item.deadline <= to_date('" + deadlineEnd + "','yyyy-MM-dd')");
		}
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql.toString());
		if (description != null && description.length() > 0) {
			query.setParameter(0, "%" + description + "%");
		}
		@SuppressWarnings("unchecked")
		List<Object[]> list = query.list();
		return list;
	}
	/**
	 * 判断验证人result是否满足query条件
	 * @param result
	 * @param query
	 * @return
	 */
	private Boolean boolValidator(Object result, String query) {
		if (query == null || "".equals(query)) return false;
		if (query != null && !"".equals(query) && result == null) return true;
		String[] q = query.split(",");
		for (int i = 0; i < q.length; i++) {
			if (("," + result + ",").indexOf("," + q[i] + ",") > -1) {
				return false;
			}
		}
		return true;
	}
	/**
	 * 判断组织result是否满足query条件
	 * @param result
	 * @param query
	 * @return
	 */
	private Boolean boolOrganization(List<Integer> query, Integer resourceId, Map<Integer, List<Integer>> resourceMap) {
		List<Integer> result = resourceMap.get(resourceId);
		if (query.size() == 0) return false;
		if (query.size() > 0 && (result == null || result.size() == 0)) return true;
		for (Integer q : query) {
			if (result.contains(q)) return false;
		}
		return true;
	}
	
	/**
	 * 查找组织层级为3的父节点
	 * @param organization
	 * @return
	 */
	private OrganizationDO getLevel3Parent(OrganizationDO organization) {
		OrganizationDO tempOrg = organization.getParent();
		while (tempOrg != null && tempOrg.getParent() != null && !"3".equals(tempOrg.getOlevel())) {
			tempOrg = tempOrg.getParent();
		}
		return tempOrg == null ? null : tempOrg.getParent();
	}
	/**
	 * 判断当前登录人是否可分配验证项
	 * @param creator
	 * @param userToOrganizationMap
	 * @param organizationMap
	 * @return
	 */
	private Boolean boolDistribution(Integer creator, Map<Integer, List<Integer>> userToOrganizationMap, Map<Integer, OrganizationDO> organizationMap) {
		List<Integer> organizationIds = userToOrganizationMap.get(creator);
		if (organizationIds != null) {
			for (Integer organizationId : organizationIds) {
				OrganizationDO organization = organizationMap.get(organizationId);
				String olevel = organization.getOlevel();
				AuditorDao auditorDao = (AuditorDao) SpringBeanUtils.getBean("auditorDao");
				DictionaryDao dictionaryDao = (DictionaryDao) SpringBeanUtils.getBean("dictionaryDao");
				// 如果olevel为2并且组织名称为"安全监察部"，则看当前登录人是否为一级审计经理
				// 如果olevel为2并且组织名称不为"安全监察部"，则看当前登录人是否为此机构的二级审计经理
				// 如果olevel为3，则看当前登录人是否为此机构此组织的三级审计经理
				switch (olevel) {
				case "2":
					if ("安全监察部".equals(organization.getName())) {
						ProfessionUserDao professionUserDao = (ProfessionUserDao) SpringBeanUtils.getBean("professionUserDao");
						if (professionUserDao.getYiJiShenJiJingLi().contains(UserContext.getUser())) {
							return true;
						}
					} else {
						String erjishenjizhuguan = dictionaryDao.getByTypeAndKey("审计角色", "A2.1") == null ? null : dictionaryDao.getByTypeAndKey("审计角色", "A2.1").getName();
						if (auditorDao.boolRoleAndUserAndUnit(erjishenjizhuguan, UserContext.getUser(), organization.getUnit())) {
							return true;
						}
					}
					break;
				case "3":
					OrganizationDao organizationDao = (OrganizationDao) SpringBeanUtils.getBean("organizationDao");
					// 看当前登录人是否为此组织下的人，再看此人是否为此机构的三级审计经理
					if (organizationDao.isOrganizationAndUser(organizationId, UserContext.getUserId())) {
						String sanjishenjizhuguan = dictionaryDao.getByTypeAndKey("审计角色", "A3.1") == null ? null : dictionaryDao.getByTypeAndKey("审计角色", "A3.1").getName();
						if (auditorDao.boolRoleAndUserAndUnit(sanjishenjizhuguan, UserContext.getUser(), organization.getUnit())) {
							return true;
						}
					}
					break;
				default :
					// 其他层级找它层级为3的组织去判断
					String sanjishenjizhuguan = dictionaryDao.getByTypeAndKey("审计角色", "A3.1") == null ? null : dictionaryDao.getByTypeAndKey("审计角色", "A3.1").getName();
					organization = this.getLevel3Parent(organization);
					if (organization != null && auditorDao.boolRoleAndUserAndUnit(sanjishenjizhuguan, UserContext.getUser(), organization.getUnit())) {
						return true;
					}
					break;
				}
			}
		}
		return false;
	}
	/**
	 * 判断当前登录人是否可验证此项
	 * @param validator
	 * @return
	 */
	private Boolean boolValidate(String validator) {
		if (validator == null) return false;
		if (("," + validator + ",").indexOf("," + UserContext.getUserId().toString() + ",") > -1) {
			return true;
		}
		return false;
	}
	
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED)
	public List<Map<String, Object>> getValidateList(HttpServletRequest request) {
		String _actionOrganizationIds = request.getParameter("actionOrganizationIds"); // 行动项责任单位
		String _creatorOrganizationIds = request.getParameter("creatorOrganizationIds"); //风险分析创建人所属组织
		String _validator = request.getParameter("validator"); //验证人
		List<Integer> actionOrganizationIds = gson.fromJson(_actionOrganizationIds, new TypeToken<List<Integer>>(){}.getType());
		List<Integer> creatorOrganizationIds = gson.fromJson(_creatorOrganizationIds, new TypeToken<List<Integer>>(){}.getType());
		
		List<Object[]> list = this.getViewData(request);
		Map<Integer, List<Integer>> userOrgMap = this.factoryUserAndOrganization();
		Map<Integer, List<Integer>> actionItemOrgMap = this.factoryActionItemAndOrganization();
		Map<Integer, OrganizationDO> orgsMap = this.factoryOrganization();
		List<Map<String, Object>> datas = new ArrayList<Map<String, Object>>();
		UserDao userDao = (UserDao) SpringBeanUtils.getBean("userDao");
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		for (Object[] o : list) {
			if (this.boolValidator(o[5], _validator)) { //验证人条件不满足
				continue;
			}
			Integer actionItemId = ((BigDecimal) o[0]).intValue();
			if (this.boolOrganization(actionOrganizationIds, actionItemId, actionItemOrgMap)) { //行动项责任单位条件
				continue;
			}
			Integer creator = ((BigDecimal) o[4]).intValue();
			if (this.boolOrganization(creatorOrganizationIds, creator, userOrgMap)) { // 创建人所属单位条件
				continue;
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("actionItemId", actionItemId);
			List<String> actionOrganization = this.getPathsByActionItemIdOrUserId(actionItemId, actionItemOrgMap, orgsMap);
			map.put("actionOrganization", actionOrganization);
			map.put("deadline", o[1] == null ? null : sdf.format((Timestamp)o[1]));
			map.put("description", o[2]);
			map.put("status", o[3]);
			List<String> creatorOrganization = this.getPathsByActionItemIdOrUserId(creator, userOrgMap, orgsMap);
			map.put("creatorOrganization", creatorOrganization);
			String validator = o[5] == null ? null : o[5].toString();
			if (validator != null) {
				List<UserDO> users = userDao.internalGetByIds(validator.split(","));
				map.put("validator", userDao.convert(users, Arrays.asList(new String[]{"id", "fullname", "username"})));
			} else {
				map.put("validator", null);
			}
			map.put("result", o[6]);
			map.put("validateRiskId", o[7]);
			map.put("activityId", o[8]);
			if (this.boolDistribution(creator, userOrgMap, orgsMap)) {
				map.put("kefenpei", true);
			} else {
				map.put("kefenpei", false);
			}
			if (!"通过".equals((String) o[6]) && this.boolValidate(validator)) {
				map.put("keyanzheng", true);
			} else {
				map.put("keyanzheng", false);
			}
			datas.add(map);
		}
		return datas;
	}
	
	/**
	 * 分配验证人
	 * @param request
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void saveFenPeiResult(HttpServletRequest request) {
		String _objs = request.getParameter("objs");
		// [{validateRiskId:8494806,actionItemId:8270825, validator:"14251"},{validateRiskId:123,actionItemId:123, validator:"4,5"}]
		List<Map<String, Object>> objs = gson.fromJson(_objs, new TypeToken<List<Map<String, Object>>>() {}.getType());
		ValidateRiskDao validateRiskDao = (ValidateRiskDao) SpringBeanUtils.getBean("validateRiskDao");
		for (Map<String, Object> entry : objs) {
			if (entry.get("validateRiskId") != null) {
				Integer validateRiskId = NumberHelper.toInteger(entry.get("validateRiskId").toString());
				Map<String, Object> map = new HashMap<String, Object>();
				map.put("validator", entry.get("validator"));
				validateRiskDao.update(validateRiskId, map);
			} else {
				Map<String, Object> map = new HashMap<String, Object>();
				map.put("aid", Double.parseDouble(entry.get("actionItemId").toString()));
				map.put("validator", entry.get("validator"));
				validateRiskDao.save(map);
			}
			this.sendMessage((String)entry.get("actionItemId"), (String)entry.get("description"), (String)entry.get("validator"));
		}
	}
	
	private void sendMessage(String actionItemId, String description, String validator) {
		MessageDO message = new MessageDO();
		message.setSender(UserContext.getUser());
		message.setSendTime(new Date());
		message.setContent("风险验证单[" + description + "]等待验证!");
		message.setTitle("风险验证单通知");
		message.setLink(actionItemId);
		message.setChecked(false);
		message.setSourceType("RISKVALIDATE");
		MessageDao messageDao = (MessageDao) SpringBeanUtils.getBean("messageDao");
		UserDao userDao = (UserDao) SpringBeanUtils.getBean("userDao");
		try {
			messageDao.sendMessageAndEmail(message, userDao.internalGetByIds(validator.split(",")));
		} catch (Exception e) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "请选择验证人！");
		}
	}
	
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> getActionItemMapsByValidateRiskIds(List<Integer> validateRiskIds) {
		if (null == validateRiskIds || validateRiskIds.isEmpty()) {
			return new ArrayList<Map<String, Object>>();
		}
		return (List<Map<String, Object>>) this.getHibernateTemplate().findByNamedParam("select new Map(t.actionItemId as actionItemId, t.creator as creator, ai as actionItem) from ActionItemCreatorDO t, ActionItemDO ai where t.actionItemId in (select vr.aid.id from ValidateRiskDO vr where vr.deleted = false and vr.id in (:ids)) and t.actionItemId = ai.id", "ids", validateRiskIds);
	}
}
