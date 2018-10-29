
package com.usky.sms.risk;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.MDC;
import org.hibernate.SQLQuery;
import org.hibernate.Session;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.activity.ActivityDO;
import com.usky.sms.activity.ActivityDao;
import com.usky.sms.common.DateHelper;
import com.usky.sms.common.NumberHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.log.ActivityLoggingDao;
import com.usky.sms.log.operation.ActivityLoggingOperationRegister;
import com.usky.sms.message.MessageDO;
import com.usky.sms.message.MessageDao;
import com.usky.sms.organization.OrganizationDO;
import com.usky.sms.organization.OrganizationDao;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.risk.airline.AircraftTypeDO;
import com.usky.sms.risk.airline.AirlineInfoDO;
import com.usky.sms.risk.airline.AirlineInfoDao;
import com.usky.sms.risk.airline.StopoverDO;
import com.usky.sms.tem.ActionItemDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;

public class RiskDao extends BaseDao<RiskDO> {
	
	public static final SMSException NO_ROLE_SETTING = new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "任务分配的对应处理角色未设置！");
	
	public static final SMSException NO_USER_FOUND = new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "发布失败！未找到任务的处理人。");
	
	@Autowired
	private ActivityDao activityDao;
	
	@Autowired
	private AirlineInfoDao airlineInfoDao;
	
	@Autowired
	private ClauseDao clauseDao;
	
	@Autowired
	private MessageDao messageDao;
	
	@Autowired
	private RiskAnalysisDao riskAnalysisDao;
	
	@Autowired
	private RiskTaskDao riskTaskDao;
	
	@Autowired
	private RiskTaskSettingDao riskTaskSettingDao;
	
	@Autowired
	private OrganizationDao organizationDao;
	
	@Autowired
	private ActivityLoggingDao activityLoggingDao;
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	
	@Autowired
	private ActionItemDao actionItemDao;
	
	public RiskDao() {
		super(RiskDO.class);
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> obj) {
		// 编号 TODO
		return super.beforeSave(obj);
	}
	
	@Override
	protected void afterSave(RiskDO risk) {
		risk.setCreator(UserContext.getUser());
		this.internalUpdate(risk);
	}
	
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}
	
	@SuppressWarnings("unchecked")
	@Override
	protected Object getQueryParamValue(String key, Object value) {
		if ("creator.id".equals(key)) {
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
		return super.getQueryParamValue(key, value);
	}

	@SuppressWarnings("unchecked")
	@Override
	protected void beforeGetList(Map<String, Object> map, Map<String, Object> searchMap, List<String> orders) {
		List<List<Map<String, Object>>> ruleList = (List<List<Map<String, Object>>>) map.get("rule");
		if (ruleList != null && ruleList.size() > 0) {
			for (List<Map<String, Object>> andRule : ruleList) {
				Iterator<Map<String, Object>> it = andRule.iterator();
				List<Integer> userIds = null;
				while (it.hasNext()) {
					Map<String, Object> orRule = it.next();
					if ("unitId".equals((String) orRule.get("key"))) {
						userIds = permissionSetDao.getPermittedUserIds(((Number) orRule.get("value")).intValue(), PermissionSets.VIEW_ACTIVITY.getName());
						it.remove();
					}
				}
				if (userIds != null) {
					Map<String, Object> unitMap = new HashMap<String, Object>();
					unitMap.put("key", "creator.id");
					unitMap.put("op", "in");
					unitMap.put("value", userIds);
					andRule.add(unitMap);
				}
			}
		}
		super.beforeGetList(map, searchMap, orders);
	}

	@Override
	protected void afterGetById(Map<String, Object> map) {
		int id = (Integer) map.get("id");
		RiskDO risk = this.internalGetById(id);
		if(risk.getActivity()!=null){
			AirlineInfoDO airlineInfo = airlineInfoDao.getAirlineInfoByActivity(risk.getActivity().getId());
			if (airlineInfo != null) {
				Map<String, Object> departureAirportMap = new HashMap<String, Object>();
				departureAirportMap.put("name", airlineInfo.getDepartureAirportName());
				departureAirportMap.put("code", airlineInfo.getDepartureAirport());
				map.put("departureAirport", departureAirportMap);
				Map<String, Object> arrivalAirportMap = new HashMap<String, Object>();
				arrivalAirportMap.put("name", airlineInfo.getArrivalAirportName());
				arrivalAirportMap.put("code", airlineInfo.getArrivalAirport());
				map.put("arrivalAirport", arrivalAirportMap);
				List<Map<String, Object>> stopoverMaps = new ArrayList<Map<String, Object>>();
				for (StopoverDO stopover : airlineInfo.getStopovers()) {
					Map<String, Object> stopoverMap = new HashMap<String, Object>();
					stopoverMap.put("name", stopover.getAirportName());
					stopoverMap.put("code", stopover.getAirport());
					stopoverMap.put("sequence", stopover.getSequence());
					stopoverMaps.add(stopoverMap);
				}
				map.put("stopovers", stopoverMaps);
				map.put("unit", airlineInfo.getUnit().getName());
				List<Map<String, Object>> aircraftTypeMaps = new ArrayList<Map<String, Object>>();
				for (AircraftTypeDO aircraftType : airlineInfo.getTypes()) {
					Map<String, Object> aircraftTypeMap = new HashMap<String, Object>();
					aircraftTypeMap.put("type", aircraftType.getType());
					aircraftTypeMap.put("sequence", aircraftType.getSequence());
					aircraftTypeMaps.add(aircraftTypeMap);
				}
				map.put("aircraftTypes", aircraftTypeMaps);
			}
		}
		List<Map<String, Object>> riskAnalysisMaps = new ArrayList<Map<String, Object>>();
		List<RiskAnalysisDO> analyses = riskAnalysisDao.getRiskAnalysesByRisk(id);
		List<ClauseDO> clauses = clauseDao.getClauseByRisk(id);
		List<Integer> clauseIds = new ArrayList<Integer>();
		for (ClauseDO clause : clauses) {
			clauseIds.add(clause.getId());
		}
		// 行动项按clauseId分组
		Map<Integer, List<Map<String, Object>>> clauseActionItemMap = new HashMap<Integer, List<Map<String,Object>>>();
		List<Map<String, Object>> actionItems = actionItemDao.convert(actionItemDao.getByClauseIds(clauseIds), Arrays.asList(new String[]{"id", "clause", "description"}), false);
		for (Map<String, Object> actionItem : actionItems) {
			Integer clauseId = (Integer) actionItem.get("clauseId");
			List<Map<String, Object>> clauseActionActionItems = clauseActionItemMap.get(clauseId);
			if (clauseActionActionItems == null) {
				clauseActionActionItems = new ArrayList<Map<String,Object>>();
				clauseActionItemMap.put(clauseId, clauseActionActionItems);
			}
			clauseActionActionItems.add(actionItem);
		}
		Map<String, List<Map<String, Object>>> keyClausesMap = new HashMap<String, List<Map<String, Object>>>();
		for (ClauseDO clause : clauses) {
			String key = null;
			if (clause.getThreat() != null) key = "T" + clause.getThreat().getId();
			if (clause.getError() != null) key = "E" + clause.getError().getId();
			if (key == null) continue;
			List<Map<String, Object>> clauseMaps = keyClausesMap.get(key);
			if (clauseMaps == null) {
				clauseMaps = new ArrayList<Map<String, Object>>();
				keyClausesMap.put(key, clauseMaps);
			}
			Map<String, Object> clauseMap = new HashMap<String, Object>();
			clauseMap.put("id", clause.getId());
			clauseMap.put("controlId", clause.getControl().getId());
			clauseMap.put("controlNumber", clause.getControl().getNumber());
			clauseMap.put("title", clause.getControl().getTitle());
			clauseMap.put("generate", clause.getGenerate());
			clauseMap.put("status", clause.getStatus());
			clauseMap.put("actionItem", clauseActionItemMap.get(clause.getId()));
			clauseMaps.add(clauseMap);
		}
		boolean isRiskCreator = risk.getCreator() != null && risk.getCreator().getId().equals(UserContext.getUserId());
		for (RiskAnalysisDO analysis : analyses) {
			if (RiskAnalysisDao.RISK_ANALYSIS_STATUS_DRAFT.equals(analysis.getStatus()) && analysis.getCreator() != null && !analysis.getCreator().getId().equals(UserContext.getUserId())) continue;
			Map<String, Object> riskAnalysisMap = new HashMap<String, Object>();
			riskAnalysisMap.put("id", analysis.getId());
			riskAnalysisMap.put("fullname", analysis.getCreator().getFullname());
			riskAnalysisMap.put("username", analysis.getCreator().getUsername());
			riskAnalysisMap.put("lastUpdate", DateHelper.formatIsoSecond(analysis.getLastUpdate()));
			riskAnalysisMap.put("system", analysis.getSystem());
			riskAnalysisMap.put("status", analysis.getStatus());
			List<Map<String, Object>> threatMaps = new ArrayList<Map<String, Object>>();
			List<RiskThreatMappingDO> threats = analysis.getThreats();
			for (RiskThreatMappingDO threat : threats) {
				Map<String, Object> threatMappingMap = new HashMap<String, Object>();
				threatMappingMap.put("id", threat.getId());
				Map<String, Object> threatMap = new HashMap<String, Object>();
				threatMap.put("id", threat.getThreat().getId());
				threatMap.put("name", threat.getThreat().getName());
				threatMappingMap.put("threat", threatMap);
				threatMappingMap.put("text", threat.getText());
				threatMappingMap.put("score", threat.getScore());
				threatMappingMap.put("mark", threat.getMark());
				threatMappingMap.put("clauses", keyClausesMap.get("T" + threat.getId()));
				threatMaps.add(threatMappingMap);
			}
			riskAnalysisMap.put("threats", threatMaps);
			List<Map<String, Object>> errorMaps = new ArrayList<Map<String, Object>>();
			List<RiskErrorMappingDO> errors = analysis.getErrors();
			for (RiskErrorMappingDO error : errors) {
				Map<String, Object> errorMappingMap = new HashMap<String, Object>();
				errorMappingMap.put("id", error.getId());
				Map<String, Object> errorMap = new HashMap<String, Object>();
				errorMap.put("id", error.getError().getId());
				errorMap.put("name", error.getError().getName());
				errorMappingMap.put("error", errorMap);
				errorMappingMap.put("text", error.getText());
				errorMappingMap.put("score", error.getScore());
				errorMappingMap.put("mark", error.getMark());
				errorMappingMap.put("clauses", keyClausesMap.get("E" + error.getId()));
				errorMaps.add(errorMappingMap);
			}
			riskAnalysisMap.put("errors", errorMaps);
			riskAnalysisMap.put("editable", isRiskCreator || (analysis.getCreator() != null && UserContext.getUserId().equals(analysis.getCreator().getId())));
			riskAnalysisMaps.add(riskAnalysisMap);
		}
		map.put("riskAnalyses", riskAnalysisMaps);
		
		map.put("editable", isRiskCreator);
	}
	
	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		RiskDO risk = (RiskDO) obj;
		if ("activity".equals(fieldName)) {
			ActivityDO activity = risk.getActivity();
			if(activity != null){
				map.put("activityId", activity.getId());
				map.put("unitCode", activity.getUnit().getCode());
				map.put("unitName", activity.getUnit().getName());
				map.put("activityNum", activity.getNum());
				map.put("activitySummary", activity.getSummary());
				map.put("activityDescription", activity.getDescription());
				map.put("activityType", activity.getType().getId());
				map.put("activityTypeName", activity.getType().getName());
			}
			return;
		} else if ("created".equals(fieldName)) {
			map.put("date", DateHelper.formatIsoSecond(risk.getCreated()));
			return;
		} else if ("creator".equals(fieldName)) {
			UserDO creator = risk.getCreator();
			map.put("username", creator.getUsername());
			map.put("fullname", creator.getFullname());
			map.put("editable", creator.getId().equals(UserContext.getUserId()));
			return;
		}
		super.setField(map, obj, claz, multiple, field);
	}
	
	public Map<String, Object> getActivityInfoOfRisk(int activityId) {
		Map<String, Object> map = new HashMap<String, Object>();
		ActivityDO activity = activityDao.internalGetById(activityId);
		map.put("activityId", activity.getId());
		map.put("unitCode", activity.getUnit().getCode());
		map.put("activityNum", activity.getNum());
		map.put("activitySummary", activity.getSummary());
		map.put("activityDescription", activity.getDescription());
		map.put("activityType", activity.getType().getId());
		map.put("activityTypeName", activity.getType().getName());
		
		AirlineInfoDO airlineInfo = airlineInfoDao.getAirlineInfoByActivity(activityId);
		if (airlineInfo == null) return map;
		Map<String, Object> departureAirportMap = new HashMap<String, Object>();
		departureAirportMap.put("name", airlineInfo.getDepartureAirportName());
		departureAirportMap.put("code", airlineInfo.getDepartureAirport());
		map.put("departureAirport", departureAirportMap);
		Map<String, Object> arrivalAirportMap = new HashMap<String, Object>();
		arrivalAirportMap.put("name", airlineInfo.getArrivalAirportName());
		arrivalAirportMap.put("code", airlineInfo.getArrivalAirport());
		map.put("arrivalAirport", arrivalAirportMap);
		List<Map<String, Object>> stopoverMaps = new ArrayList<Map<String, Object>>();
		for (StopoverDO stopover : airlineInfo.getStopovers()) {
			Map<String, Object> stopoverMap = new HashMap<String, Object>();
			stopoverMap.put("name", stopover.getAirportName());
			stopoverMap.put("code", stopover.getAirport());
			stopoverMap.put("sequence", stopover.getSequence());
			stopoverMaps.add(stopoverMap);
		}
		map.put("stopovers", stopoverMaps);
		map.put("unit", airlineInfo.getUnit().getName());
		List<Map<String, Object>> aircraftTypeMaps = new ArrayList<Map<String, Object>>();
		for (AircraftTypeDO aircraftType : airlineInfo.getTypes()) {
			Map<String, Object> aircraftTypeMap = new HashMap<String, Object>();
			aircraftTypeMap.put("type", aircraftType.getType());
			aircraftTypeMap.put("sequence", aircraftType.getSequence());
			aircraftTypeMaps.add(aircraftTypeMap);
		}
		map.put("aircraftTypes", aircraftTypeMaps);
		return map;
	}
	
	@SuppressWarnings("unchecked")
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public List<Integer> publish(int activityId, int organizationId, int riskTaskId, List<Integer> riskAnalysisPersons) {
		List<Integer> ids = new ArrayList<Integer>();
		RiskTaskDO riskTask = riskTaskDao.internalGetById(riskTaskId);		
		ActivityDO activity = activityDao.internalGetById(activityId);
		List<RiskDO> riskList = this.getHibernateTemplate().find("from RiskDO where riskTask.id = ?", riskTaskId);
		if (riskList != null && riskList.size() > 0) {
			for (RiskDO riskDO : riskList) {
				riskDO.setStatus("新建");
				this.internalUpdate(riskDO);
				ids.add(riskDO.getId());
				MessageDO message = new MessageDO();
				message.setChecked(false);
				message.setLink(riskDO.getId().toString());
				message.setSender(UserContext.getUser());
				message.setSendTime(new Timestamp(System.currentTimeMillis()));
				message.setTitle(activity.getSummary());
				message.setContent(activity.getDescription());
				message.setSourceType("RISK");
				message.setReceiver(riskDO.getCreator());
				messageDao.internalSave(message);
			}
			reAddActivityLoggingForPublishRisk(riskTask);
		}else{		
			if (riskAnalysisPersons == null || riskAnalysisPersons.isEmpty()) throw NO_USER_FOUND;
			String code = activity.getUnit().getCode() + "-" + activity.getNum();
			String rsummary = activity.getSummary();
			String rdescription = activity.getDescription();
			for (Integer creatorId : riskAnalysisPersons) {
				UserDO creator = new UserDO();
				creator.setId(creatorId);
				RiskDO risk = new RiskDO();
				risk.setCode(code);
				risk.setRsummary(rsummary);
				risk.setRdescription(rdescription);
				risk.setCreator(creator);
				risk.setStatus("新建");
				risk.setActivity(activity);
				risk.setRiskTask(riskTask);
				Integer id = (Integer) this.internalSave(risk);
				ids.add(id);
				MessageDO message = new MessageDO();
				message.setChecked(false);
				message.setLink(id.toString());
				message.setSender(UserContext.getUser());
				message.setSendTime(new Timestamp(System.currentTimeMillis()));
				message.setTitle(activity.getSummary());
				message.setContent(activity.getDescription());
				message.setSourceType("RISK");
				message.setReceiver(creator);
				messageDao.internalSave(message);
			}
			
			riskTask.setType("Y");
			riskTaskDao.internalUpdate(riskTask);
			
			// 添加活动日志
			addActivityLoggingForPublishRisk(riskTask);
		}
		return ids;
	}
	
	public List<UserDO> getRiskAnalysisPerson(Integer organizationId) {
		RiskTaskSettingDO setting = riskTaskSettingDao.getSetting();
		if (setting == null || setting.getRoles() == null || setting.getRoles().isEmpty()) throw NO_ROLE_SETTING;
		List<UserDO> users = riskTaskSettingDao.getCreators(organizationId, setting.getRoles());
		return users;
	}
	
	/**
	 * 添加发布任务的活动日志
	 * 
	 * @param riskTask
	 */
	private void addActivityLoggingForPublishRisk(RiskTaskDO riskTask) {
		// 添加活动日志
		if (null != riskTask) {
			List<String> details = new ArrayList<String>();
			String organizatinPath = organizationDao.getFullPathOfOrganization(riskTask.getOrganization());
			details.add("发布了分配给 " + organizatinPath + " 的任务");
			MDC.put("details", details.toArray());
			activityLoggingDao.addLogging(riskTask.getActivity().getId(), ActivityLoggingOperationRegister.getOperation("PUBLISH_RISK_TASK"));
			MDC.remove("details");
		}
	}
	
	/**
	 * 添加重新发布任务的活动日志
	 * 
	 * @param riskTask
	 */
	private void reAddActivityLoggingForPublishRisk(RiskTaskDO riskTask) {
		// 添加活动日志
		if (null != riskTask) {
			List<String> details = new ArrayList<String>();
			String organizatinPath = organizationDao.getFullPathOfOrganization(riskTask.getOrganization());
			details.add("退回了给" + organizatinPath + ",重新分析");
			MDC.put("details", details.toArray());
			activityLoggingDao.addLogging(riskTask.getActivity().getId(), ActivityLoggingOperationRegister.getOperation("PUBLISH_RISK_TASK"));
			MDC.remove("details");
		}
	}
	
	/**
	 * 在新开航线创建人删除信息以后把分配的风险分析任务置为“无效”
	 * @param activityId
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void setRiskStatusToWuXiao(Integer activityId) {
		List<RiskDO> risks = this.getRiskByActivityId(activityId);
		RiskTaskSettingDO setting = riskTaskSettingDao.getSetting();
		for (RiskDO risk : risks) {
			risk.setStatus("无效");
			RiskTaskDO riskTask = risk.getRiskTask();
			if (riskTask != null && setting != null && setting.getRoles() != null && !setting.getRoles().isEmpty()) {
				OrganizationDO organization = riskTask.getOrganization();
				if (organization != null) {
					List<UserDO> creators = riskTaskSettingDao.getCreators(organization.getId(), setting.getRoles());
					if (creators.size() > 0) {
						MessageDO message = new MessageDO();
						message.setChecked(false);
						message.setLink(risk.getId().toString());
						message.setSender(UserContext.getUser());
						message.setSendTime(new Timestamp(System.currentTimeMillis()));
						message.setTitle(risk.getActivity() == null ? "" : risk.getActivity().getSummary());
						message.setContent("编号为"+risk.getCode()+"风险分析的任务已被删除，请自行斟酌是否进行风险分析！");
						message.setSourceType("RISK");
						messageDao.sendMessage(message, creators);
					}
				}
			}
			this.internalUpdate(risk);
		}
	}
	
	public List<RiskDO> getRiskByActivityId(Integer activityId) {
		@SuppressWarnings("unchecked")
		List<RiskDO> list = this.getHibernateTemplate().find("from RiskDO t where t.deleted = false and t.activity.id = ?", activityId);
		return list;
	}
	
	public String getSummaryById(Integer id) {
		@SuppressWarnings("unchecked")
		List<String> summarys = (List<String>) this.query("select t.rsummary from RiskDO t where t.deleted = false and t.id = ?", id);
		return summarys.isEmpty() ? null : summarys.get(0);
	}
	
	public RiskDO getBasicInfoById(Integer id) {
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> basicInfos = (List<Map<String, Object>>) this.query("select new Map(t.id as id, t.rsummary as rsummary) from RiskDO t where t.deleted = false and t.id = ?", id);
		if (basicInfos.isEmpty()) {
			return null;
		}
		Map<String, Object> basicInfoMap = basicInfos.get(0);
		RiskDO risk = new RiskDO();
		risk.setId(id);
		risk.setRsummary((String) basicInfoMap.get("rsummary")); 
		return risk;
	}
	
	public Map<String, Object> getExportData(Integer id) {
		RiskDO risk = this.internalGetById(id);
		Map<String, Object> riskMap = this.convert(risk, Arrays.asList(new String[]{"id", "riskNo", "rsummary", "rdescription", "creator", "created", "activity"}), false);
		
		if (risk.getActivity() != null) {
			AirlineInfoDO airlineInfo = airlineInfoDao.getAirlineInfoByActivity(risk.getActivity().getId());
			Map<String, Object> airlineInfoMap = airlineInfoDao.convert(airlineInfo, Arrays.asList(new String[]{"id", "departureAirport", "arrivalAirport", "departureAirportName", "arrivalAirportName", "unit"}), false);
			if (airlineInfo != null) {
				List<String> stopovers = new ArrayList<String>();
				for (StopoverDO stopover : airlineInfo.getStopovers()) {
					stopovers.add(stopover.getAirportName());
				}
				airlineInfoMap.put("stopovers", StringUtils.join(stopovers, "、"));
				List<String> aircraftTypes = new ArrayList<String>();
				for (AircraftTypeDO aircraftType : airlineInfo.getTypes()) {
					aircraftTypes.add(aircraftType.getType());
				}
				airlineInfoMap.put("aircraftTypes", StringUtils.join(aircraftTypes, "、"));
			}
			riskMap.put("airlineInfo", airlineInfoMap);
		}
		
		StringBuffer sql = new StringBuffer();
		sql.append(" SELECT");
		sql.append(" 1 AS GROUP_ORDER,");
		sql.append(" '威胁' AS GROUP_NAME,");
		sql.append(" R.ID AS RISK_ID,");
		sql.append(" RT.ID AS THREAT_ID,");
		sql.append(" TH.\"name\" AS THREAT_NAME,");
		sql.append(" RT.SCORE AS SCORE,");
		sql.append(" RT.MARK AS MARK,");
		sql.append(" RT.TEXT AS TEXT,");
		sql.append(" TC.ID AS CLAUSE_ID,");
		sql.append(" C.TITLE AS TITLE,");
		sql.append(" TAI.ID AS ACTION_ITEM_ID,");
		sql.append(" TAI.DESCRIPTION AS ACTION_ITEM,");
		sql.append(" DIC.ID AS SYSTEM_ID,");
		sql.append(" DIC.NAME AS SYSTEM_NAME");
		sql.append(" FROM T_RISK R");
		sql.append(" INNER JOIN T_RISK_ANALYSIS RA");
		sql.append(" ON (R.ID = RA.RISK_ID)");
		sql.append(" INNER JOIN T_RISK_THREAT_MAPPING RT");
		sql.append(" ON (RA.ID = RT.ANALYSIS_ID)");
		sql.append(" LEFT JOIN T_THREAT TH");
		sql.append(" ON (RT.THREAT_ID = TH.ID)");
		sql.append(" LEFT JOIN T_CLAUSE TC");
		sql.append(" ON (RT.ID = TC.THREAT_ID)");
		sql.append(" LEFT JOIN T_CONTROL C");
		sql.append(" ON (TC.CONTROL_ID = C.ID)");
		sql.append(" LEFT JOIN T_ACTION_ITEM TAI");
		sql.append(" ON (TC.ID = TAI.CLAUSE_ID)");
		sql.append(" INNER JOIN T_DICTIONARY DIC");
		sql.append(" ON (DIC.ID = RA.SYSTEM_ID)");
		sql.append(" WHERE R.ID = " + id);
		sql.append(" UNION ALL");
		sql.append(" SELECT");
		sql.append(" 2 AS GROUP_ORDER,");
		sql.append(" '差错' AS GROUP_NAME,");
		sql.append(" R.ID AS RISK_ID,");
		sql.append(" RE.ID AS THREAT_ID,");
		sql.append(" ER.\"name\" AS THREAT_NAME,");
		sql.append(" RE.SCORE AS SCORE,");
		sql.append(" RE.MARK AS MARK,");
		sql.append(" RE.TEXT AS TEXT,");
		sql.append(" TC.ID AS CLAUSE_ID,");
		sql.append(" C.TITLE AS TITLE,");
		sql.append(" TAI.ID AS ACTION_ITEM_ID,");
		sql.append(" TAI.DESCRIPTION AS ACTION_ITEM,");
		sql.append(" DIC.ID AS SYSTEM_ID,");
		sql.append(" DIC.NAME AS SYSTEM_NAME");
		sql.append(" FROM T_RISK R");
		sql.append(" INNER JOIN T_RISK_ANALYSIS RA");
		sql.append(" ON (R.ID = RA.RISK_ID)");
		sql.append(" INNER JOIN T_RISK_ERROR_MAPPING RE");
		sql.append(" ON (RA.ID = RE.ANALYSIS_ID)");
		sql.append(" LEFT JOIN T_ERROR ER");
		sql.append(" ON (RE.ERROR_ID = ER.ID)");
		sql.append(" LEFT JOIN T_CLAUSE TC");
		sql.append(" ON (RE.ID = TC.ERROR_ID)");
		sql.append(" LEFT JOIN T_CONTROL C");
		sql.append(" ON (TC.CONTROL_ID = C.ID)");
		sql.append(" LEFT JOIN T_ACTION_ITEM TAI");
		sql.append(" ON (TC.ID = TAI.CLAUSE_ID)");
		sql.append(" INNER JOIN T_DICTIONARY DIC");
		sql.append(" ON (DIC.ID = RA.SYSTEM_ID)");
		sql.append(" WHERE R.ID = " + id);
		sql.append(" ORDER BY SYSTEM_NAME, GROUP_ORDER, RISK_ID, CLAUSE_ID");

		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql.toString());
		@SuppressWarnings("unchecked")
		List<Object[]> list = query.list();
		// 风险分析按系统分组
		Map<Integer, List<Map<String, Object>>> systemAnalysisesMap = new LinkedHashMap<Integer, List<Map<String,Object>>>();
		for (Object[] obj : list) {
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("groupOrder", obj[0]);
			map.put("groupName", obj[1]);
			map.put("riskId", obj[2]);
			map.put("threatErrorId", obj[3] == null ? 0 : obj[3]);
			map.put("threatErrorName", obj[4] == null ? "" : obj[4]);
			map.put("score", obj[5] == null ? "" : obj[5]);
			map.put("mark", obj[6] == null ? "" : obj[6]);
			map.put("text", obj[7] == null ? "" : obj[7]);
			map.put("clauseId", obj[8] == null ? 0 : obj[8]);
			map.put("title", obj[9] == null ? "" : obj[9]);
			map.put("actionItemId", obj[10] == null ? 0 : obj[10]);
			map.put("actionItemDesc", obj[11] == null ? "" : obj[11]);
			map.put("systemId", obj[12]);
			map.put("systemName", obj[13] == null ? "" : obj[13]);
			
			Integer systemId = ((BigDecimal) obj[12]).intValue();
			List<Map<String, Object>> analysises = systemAnalysisesMap.get(systemId);
			if (analysises == null) {
				analysises = new ArrayList<Map<String,Object>>();
				systemAnalysisesMap.put(systemId, analysises);
			}
			analysises.add(map);
		}
		riskMap.put("analysises", systemAnalysisesMap.values());
		return riskMap;
	}
	
	
	public void setActivityDao(ActivityDao activityDao) {
		this.activityDao = activityDao;
	}
	
	public void setAirlineInfoDao(AirlineInfoDao airlineInfoDao) {
		this.airlineInfoDao = airlineInfoDao;
	}
	
	public void setClauseDao(ClauseDao clauseDao) {
		this.clauseDao = clauseDao;
	}
	
	public void setMessageDao(MessageDao messageDao) {
		this.messageDao = messageDao;
	}
	
	public void setRiskAnalysisDao(RiskAnalysisDao riskAnalysisDao) {
		this.riskAnalysisDao = riskAnalysisDao;
	}
	
	public void setRiskTaskDao(RiskTaskDao riskTaskDao) {
		this.riskTaskDao = riskTaskDao;
	}
	
	public void setRiskTaskSettingDao(RiskTaskSettingDao riskTaskSettingDao) {
		this.riskTaskSettingDao = riskTaskSettingDao;
	}
	
	public void setOrganizationDao(OrganizationDao organizationDao) {
		this.organizationDao = organizationDao;
	}
	
	public void setActivityLoggingDao(ActivityLoggingDao activityLoggingDao) {
		this.activityLoggingDao = activityLoggingDao;
	}

	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}

	public void setActionItemDao(ActionItemDao actionItemDao) {
		this.actionItemDao = actionItemDao;
	}
	
}
