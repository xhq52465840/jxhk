
package com.usky.sms.activity;

import java.io.OutputStream;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.Validate;
import org.apache.log4j.MDC;
import org.hibernate.SQLQuery;
import org.hibernate.classic.Session;
import org.hibernate.transform.ResultTransformer;
import org.hibernate.type.StandardBasicTypes;
import org.quartz.CronTrigger;
import org.quartz.JobDataMap;
import org.quartz.JobDetail;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.Trigger;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.Gson;
import com.usky.comm.Utility;
import com.usky.sms.accessinformation.AccessInformationDO;
import com.usky.sms.accessinformation.AccessInformationDao;
import com.usky.sms.accessinformation.FlightInfoEntityDO;
import com.usky.sms.accessinformation.FlightInfoEntityDao;
import com.usky.sms.activity.aircraftcommanderreport.AircraftCommanderReportTempDO;
import com.usky.sms.activity.aircraftcommanderreport.AircraftCommanderReportTempDao;
import com.usky.sms.activity.attribute.ActivityPriorityDO;
import com.usky.sms.activity.attribute.ActivityPriorityDao;
import com.usky.sms.activity.attribute.ActivityResolutionDO;
import com.usky.sms.activity.attribute.ActivityResolutionDao;
import com.usky.sms.activity.attribute.ActivityStatusCategory;
import com.usky.sms.activity.attribute.ActivityStatusDO;
import com.usky.sms.activity.attribute.ActivityStatusDao;
import com.usky.sms.activity.distribute.ActivityDistributeConfigDO;
import com.usky.sms.activity.distribute.ActivityDistributeConfigDao;
import com.usky.sms.activity.security.ActivitySecurityLevelDO;
import com.usky.sms.activity.security.ActivitySecurityLevelDao;
import com.usky.sms.activity.type.ActivityTypeDO;
import com.usky.sms.activity.type.ActivityTypeDao;
import com.usky.sms.avatar.AvatarDO;
import com.usky.sms.common.DateHelper;
import com.usky.sms.config.Config;
import com.usky.sms.constant.EnumMessageCatagory;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.core.TransactionHelper;
import com.usky.sms.custom.CustomFieldDO;
import com.usky.sms.custom.CustomFieldDao;
import com.usky.sms.custom.CustomFieldValueDO;
import com.usky.sms.custom.CustomFieldValueDao;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.directory.EnumDirectoryType;
import com.usky.sms.eventanalysis.EventAnalysisDO;
import com.usky.sms.eventanalysis.EventAnalysisDao;
import com.usky.sms.field.FieldRegister;
import com.usky.sms.file.EnumFileType;
import com.usky.sms.file.ExcelUtil;
import com.usky.sms.file.FileDO;
import com.usky.sms.file.FileDao;
import com.usky.sms.flightmovementinfo.FlightInfoDO;
import com.usky.sms.flightmovementinfo.FlightInfoDao;
import com.usky.sms.http.service.GsonBuilder4SMS;
import com.usky.sms.job.CronSynchronizeAircraftCommanderReportJob;
import com.usky.sms.label.LabelDO;
import com.usky.sms.label.LabelDao;
import com.usky.sms.log.ActivityLoggingDao;
import com.usky.sms.log.operation.ActivityLoggingOperationRegister;
import com.usky.sms.menu.IMenu;
import com.usky.sms.menu.MenuCache;
import com.usky.sms.menu.MenuItem;
import com.usky.sms.message.MessageDao;
import com.usky.sms.organization.OrganizationDO;
import com.usky.sms.organization.OrganizationDao;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.processor.ProcessorDO;
import com.usky.sms.processor.ProcessorDao;
import com.usky.sms.risk.airline.AircraftTypeDO;
import com.usky.sms.risk.airline.AirlineInfoDO;
import com.usky.sms.risk.airline.AirlineInfoDao;
import com.usky.sms.risk.airline.StopoverDO;
import com.usky.sms.search.template.ISearchTemplate;
import com.usky.sms.search.template.SearchTemplateRegister;
import com.usky.sms.solr.SolrService;
import com.usky.sms.tem.ErrorMappingDO;
import com.usky.sms.tem.ErrorMappingDao;
import com.usky.sms.tem.TemDO;
import com.usky.sms.tem.TemDao;
import com.usky.sms.tem.TemUnitDO;
import com.usky.sms.tem.TemUnitDao;
import com.usky.sms.tem.ThreatMappingDO;
import com.usky.sms.tem.ThreatMappingDao;
import com.usky.sms.tem.consequence.ConsequenceDO;
import com.usky.sms.tem.consequence.ConsequenceDao;
import com.usky.sms.tem.error.ErrorDO;
import com.usky.sms.tem.error.ErrorDao;
import com.usky.sms.tem.insecurity.InsecurityDO;
import com.usky.sms.tem.insecurity.InsecurityDao;
import com.usky.sms.tem.severity.ProvisionDO;
import com.usky.sms.tem.severity.ProvisionDao;
import com.usky.sms.tem.severity.SeverityDO;
import com.usky.sms.tem.severity.SeverityDao;
import com.usky.sms.tem.threat.ThreatDO;
import com.usky.sms.tem.threat.ThreatDao;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.unit.UnitRoleActorDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;
import com.usky.sms.user.UserHistoryItemDao;
import com.usky.sms.utils.SpringBeanUtils;
import com.usky.sms.uwf.WfSetup;
import com.usky.sms.uwffunc.IUwfFuncPlugin;
import com.usky.sms.workflow.WorkflowSchemeEntityDO;
import com.usky.sms.workflow.WorkflowSchemeEntityDao;

public class ActivityDao extends BaseDao<ActivityDO> implements IMenu, IUwfFuncPlugin {
	
	private static final org.apache.log4j.Logger log = org.apache.log4j.Logger.getLogger(ActivityDao.class);
	
	protected static Gson gson = GsonBuilder4SMS.getInstance();
	
	private Config config;
	
	/** 默认同步机场报告的时间(每天12点半和23点半进行同步) */
	private static final String CRON_EXPRESSION_FOR_SYNCRONIZE_AIRCRAFT_COMMANDER_REPORT = "0 30 12,23 * * ?";
	
	private static final String GROUP = "activity";
	
	private static final String NAME_SUFIX_TRIGGER = "_trigger";
	
	@Autowired
	private ActivityLoggingDao activityLoggingDao;
	
	@Autowired
	private ActivityPriorityDao activityPriorityDao;
	
	@Autowired
	private ActivityResolutionDao activityResolutionDao;
	
	@Autowired
	private ActivitySecurityLevelDao activitySecurityLevelDao;
	
	@Autowired
	private ActivityStatusDao activityStatusDao;
	
	@Autowired
	private ActivityTypeDao activityTypeDao;
	
	@Autowired
	private FieldRegister fieldRegister;
	
	@Autowired
	private FileDao fileDao;
	
	@Autowired
	private LabelDao labelDao;
	
	@Autowired
	private MenuCache menuCache;
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	
	@Autowired
	private ProcessorDao processorDao;
	
	@Autowired
	private SolrService solrService;
	
	@Autowired
	private TemUnitDao temUnitDao;
	
	@Autowired
	private TransactionHelper transactionHelper;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private UserDao userDao;
	
	@Autowired
	private UserHistoryItemDao userHistoryItemDao;
	
	@Autowired
	private WorkflowSchemeEntityDao workflowSchemeEntityDao;
	
	@Autowired
	private DictionaryDao dictionaryDao;
	
	@Autowired
	private FlightInfoDao flightInfoDao;
	
	@Autowired
	private InsecurityDao insecurityDao;
	
	@Autowired
	private ConsequenceDao consequenceDao;
	
	@Autowired
	private SeverityDao severityDao;
	
	@Autowired
	private ProvisionDao provisionDao;
	
	@Autowired
	private ThreatMappingDao threatMappingDao;
	
	@Autowired
	private ErrorMappingDao errorMappingDao;
	
	@Autowired
	private AccessInformationDao accessInformationDao;
	
	@Autowired
	private FlightInfoEntityDao flightInfoEntityDao;
	
	@Autowired
	private TemDao temDao;
	
	@Autowired
	private ThreatDao threatDao;
	
	@Autowired
	private ErrorDao errorDao;
	
	@Autowired
	private CustomFieldDao customFieldDao;
	
	@Autowired
	private UnitRoleActorDao unitRoleActorDao;
	
	@Autowired
	private AircraftCommanderReportTempDao aircraftCommanderReportTempDao;
	
	@Autowired
	private MessageDao messageDao;
	
	@Autowired
	private ActivityDistributeConfigDao activityDistributeConfigDao;
	
	@Autowired
	private EventAnalysisDao eventAnalysisDao;
	
	@Autowired
	private OrganizationDao organizationDao;
	
	@Autowired
	private AirlineInfoDao airlineInfoDao;
	
	public ActivityDao() {
		super(ActivityDO.class);
		this.config = Config.getInstance();
	}
	
	@Override
	protected String getBaseHql(Map<String, Object> map) {
		@SuppressWarnings("unchecked")
		List<List<Map<String, Object>>> ruleList = (List<List<Map<String, Object>>>) map.get("rule");
		for (List<Map<String, Object>> list : ruleList) {
			for (Map<String, Object> paramMap : list) {
				if ("deviceId".equals(paramMap.get("key"))) {
					String key = null;
					for (com.usky.sms.field.Field field : fieldRegister.getAllFields()) {
						if ("deviceId".equals(field.getName())) {
							key = field.getKey();
							break;
						}
					}
					if (key == null) throw new SMSException(MessageCodeConstant.MSG_CODE_110000002, "deviceId");
					return "select distinct t from ActivityDO t, CustomFieldValueDO v where t.deleted = false and t = v.activity and v.key = '" + key + "' and (";
				}
			}
		}
		return super.getBaseHql(map);
	}
	
	@Override
	protected String getQueryParamName(String key) {
		if ("deviceId".equals(key)) return "v.stringValue";
		return super.getQueryParamName(key);
	}
	
	@Override
	protected void beforeGetList(Map<String, Object> map, Map<String, Object> searchMap, List<String> orders) {
		@SuppressWarnings("unchecked")
		List<List<Map<String, Object>>> ruleList = (List<List<Map<String, Object>>>) map.get("rule");
		for (List<Map<String, Object>> list : ruleList) {
			for (Map<String, Object> paramMap : list) {
				if ("deviceId".equals(paramMap.get("key"))) {
					String key = null;
					for (com.usky.sms.field.Field field : fieldRegister.getAllFields()) {
						if ("deviceId".equals(field.getName())) {
							key = field.getKey();
							break;
						}
					}
					if (key == null) throw new SMSException(MessageCodeConstant.MSG_CODE_110000002, "deviceId");
					if (orders == null) return;
					for (int i = 0; i < orders.size(); i++) {
						orders.add(i, "t." + orders.remove(i));
					}
				}
			}
		}
	}
	
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public Integer saveExtend(Map<String, Object> map) {
		// 将安全信息的类型赋值到自定义字段"初始信息类型"中
		if (map.containsKey("type")) {
			for (com.usky.sms.field.Field field : fieldRegister.getAllFields()) {
				String fieldName = field.getName();
				if ("初始信息类型".equals(fieldName)) {
					ActivityTypeDO type = activityTypeDao.internalGetById(((Number) map.get("type")).intValue());
					if (null == type) {
						throw new SMSException(MessageCodeConstant.MSG_CODE_113000001, ((Number)map.get("type")).intValue());
					}
					map.put(field.getKey(), type.getName());
					break;
				}
			}
		}
		return super.saveExtend(map);
	}

	@Override
	protected void afterSaveExtend(int id, Map<String, Object> map) {
		ActivityDO activity = this.internalGetById(id);
		String labelValues = (String) map.get("label");
		if (labelValues != null && labelValues.trim().length() > 0) {
			for (String labelValue : labelValues.split(" ")) {
				LabelDO label = new LabelDO();
				label.setActivity(activity);
				label.setLabel(labelValue);
				labelDao.internalSave(label);
			}
		}
		
		int unitId = activity.getUnit().getId();
		int typeId = activity.getType().getId();
		WorkflowSchemeEntityDO entity = workflowSchemeEntityDao.getByUnitAndType(unitId, typeId);
		if (entity == null) entity = workflowSchemeEntityDao.getByUnitAndNullType(unitId);
		String workflow = entity.getWorkflow();
		Map<String, Object> objmap = new HashMap<String, Object>();
		objmap.put("id", id);
		objmap.put("dataobject", "activity");
		String workflowId = (String) transactionHelper.doInTransaction(new WfSetup(), "Submit", activity.getCreator().getId().toString(), workflow, "", "", gson.toJson(objmap));
		map.putAll(this.getById(id));
		activity.setWorkflowId(workflowId);
		
		// 向solr里添加处理人
		List<UserDO> users = processorDao.getProcessorUsersByActivity(activity);
		map.put("processors", userDao.convert(users));
		// 向solr里添加发生时间
		AccessInformationDO accessInformation = accessInformationDao.getByActivityId(id);
		map.put("occurredDate", accessInformation == null ? "" : accessInformation.getOccurredDate());
		// 向solr里添加信息编号
		UnitDO unit = this.getHibernateTemplate().load(UnitDO.class, activity.getUnit().getId());
		map.put("activityNo", unit.getCode() + "-" + activity.getNum());
		
		this.internalUpdate(activity);
	}
	
	@Override
	protected Map<String, Object> getCommonFieldMap(Map<String, Object> map) {
		Map<String, Object> commonFieldMap = super.getCommonFieldMap(map);
		commonFieldMap.remove("label");
		commonFieldMap.remove("crossUnits");
		return commonFieldMap;
	}
	
	@Override
	protected void afterSave(ActivityDO activity) {
		UnitDO unit = unitDao.autoIncrementUnitCount(activity.getUnit().getId());
		activity.setNum(unit.getCount());
		
		activityLoggingDao.addLogging(activity.getId(), ActivityLoggingOperationRegister.getOperation("CREATE_ACTIVITY"));
		
		if (activity.getCreator() == null) activity.setCreator(UserContext.getUser());
		this.internalUpdate(activity);
	}
	
	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		if (map.containsKey("release")) {
			if ("true".equals(map.get("release"))) {
				map.put("releaseDate", new Date());
			} else {
				map.put("releaseDate", null);
			}
		}
	}

	@Override
	protected void afterUpdate(ActivityDO obj, ActivityDO dbObj) {
		// 更新solr
		solrService.updateSolrFields("activity", obj.getId(), this.convert(obj, false));
	}

	@Override
	protected void afterUpdateExtend(int id, Map<String, Object> map, Map<String, Object> oldMap) {
		// 添加活动日志
		addActivityLoggingForUpdateExtend(id, map, oldMap);
		
		// label
		String labelValues = null;
		boolean containLabel = map.containsKey("label");
		if (containLabel) {
			List<String> labels = labelDao.getLabels(id);
			labelValues = (String) map.get("label");
			if (labelValues != null && labelValues.trim().length() > 0) {
				LABEL: for (String labelValue : labelValues.split(" ")) {
							for (String label : labels) {
								if (label.equals(labelValue)) {
									labels.remove(label);
									continue LABEL;
								}
							}
							LabelDO label = new LabelDO();
							ActivityDO activity = new ActivityDO();
							activity.setId(id);
							label.setActivity(activity);
							label.setLabel(labelValue);
							labelDao.internalSave(label);
						}
			}
			if (!labels.isEmpty()) labelDao.deleteActivitLabel(id, labels);
		}
		
		// tem units
		@SuppressWarnings("unchecked")
		List<Double> unitIds = (List<Double>) map.get("crossUnits");
		if (unitIds != null) {
			List<TemUnitDO> temUnits = temUnitDao.getByActivity(id);
			temUnitDao.internalDelete(temUnits);
			for (Double unitId : unitIds) {
				TemUnitDO temUnit = new TemUnitDO();
				ActivityDO activity = new ActivityDO();
				activity.setId(id);
				temUnit.setActivity(activity);
				UnitDO unit = new UnitDO();
				unit.setId(unitId.intValue());
				temUnit.setUnit(unit);
				temUnitDao.internalSave(temUnit);
			}
		}
		
		// get whole activity
		super.afterUpdateExtend(id, map, oldMap);
		
		// 向solr里添加标签
		if (containLabel) map.put("label", labelValues);
		
		// 向solr里添加处理人
		List<UserDO> users = processorDao.getProcessorUsersByActivityId(id);
		map.put("processors", userDao.convert(users));
		// 向solr里添加发生时间
		AccessInformationDO accessInformation = accessInformationDao.getByActivityId(id);
		map.put("occurredDate", accessInformation == null ? "" : accessInformation.getOccurredDate());
	}
	
	/**
	 * 添加更新安全信息的活动日志
	 */
	private void addActivityLoggingForUpdateExtend(int id, Map<String, Object> map, Map<String, Object> oldMap) {
		List<String> details = new ArrayList<String>();
		for (String key : map.keySet()) {
			if (!oldMap.containsKey(key) && !"label".equals(key)) continue;
			Object value = map.get(key);
			if ("type".equals(key)) {
				if (value == null || "".equals(value)) {
					if (oldMap.get(key) == null) continue;
					@SuppressWarnings("unchecked")
					Map<String, Object> typeMap = (Map<String, Object>) oldMap.get(key);
					details.add("信息类型由“" + typeMap.get("name") + "”变更为<空值>");
					continue;
				}
				int typeId = ((Number) value).intValue();
				ActivityTypeDO type = activityTypeDao.internalGetById(typeId);
				if (oldMap.get(key) == null) {
					details.add("信息类型由<空值>变更为“" + type.getName() + "”");
				} else {
					@SuppressWarnings("unchecked")
					Map<String, Object> typeMap = (Map<String, Object>) oldMap.get(key);
					if (typeId == (Integer) typeMap.get("id")) continue;
					details.add("信息类型由“" + typeMap.get("name") + "”变更为“" + type.getName() + "”");
				}
			} else if ("priority".equals(key)) {
				if (value == null || "".equals(value)) {
					if (oldMap.get(key) == null) continue;
					@SuppressWarnings("unchecked")
					Map<String, Object> priorityMap = (Map<String, Object>) oldMap.get(key);
					details.add("优先级由“" + priorityMap.get("name") + "”变更为<空值>");
					continue;
				}
				int priorityId = ((Number) value).intValue();
				ActivityPriorityDO priority = activityPriorityDao.internalGetById(priorityId);
				if (oldMap.get(key) == null) {
					details.add("优先级由<空值>变更为“" + priority.getName() + "”");
				} else {
					@SuppressWarnings("unchecked")
					Map<String, Object> priorityMap = (Map<String, Object>) oldMap.get(key);
					if (priorityId == (Integer) priorityMap.get("id")) continue;
					details.add("优先级由“" + priorityMap.get("name") + "”变更为“" + priority.getName() + "”");
				}
			} else if ("resolution".equals(key)) {
				if (value == null || "".equals(value)) {
					if (oldMap.get(key) == null) continue;
					@SuppressWarnings("unchecked")
					Map<String, Object> resolutionMap = (Map<String, Object>) oldMap.get(key);
					details.add("优先级由“" + resolutionMap.get("name") + "”变更为<空值>");
					continue;
				}
				int resolutionId = ((Number) map.get(key)).intValue();
				ActivityResolutionDO resolution = activityResolutionDao.internalGetById(resolutionId);
				if (oldMap.get(key) == null) {
					details.add("优先级由<空值>变更为“" + resolution.getName() + "”");
				} else {
					@SuppressWarnings("unchecked")
					Map<String, Object> resolutionMap = (Map<String, Object>) oldMap.get(key);
					if (resolutionId == (Integer) resolutionMap.get("id")) continue;
					details.add("优先级由“" + resolutionMap.get("name") + "”变更为“" + resolution.getName() + "”");
				}
			} else if ("security".equals(key)) {
				if (value == null || "".equals(value)) {
					if (oldMap.get(key) == null) continue;
					@SuppressWarnings("unchecked")
					Map<String, Object> securityMap = (Map<String, Object>) oldMap.get(key);
					details.add("安全方案级别由“" + securityMap.get("name") + "”变更为<空值>");
					continue;
				}
				int securityId = ((Number) map.get(key)).intValue();
				ActivitySecurityLevelDO security = activitySecurityLevelDao.internalGetById(securityId);
				if (oldMap.get(key) == null) {
					details.add("安全方案级别由<空值>变更为“" + security.getName() + "”");
				} else {
					@SuppressWarnings("unchecked")
					Map<String, Object> securityMap = (Map<String, Object>) oldMap.get(key);
					if (securityId == (Integer) securityMap.get("id")) continue;
					details.add("安全方案级别由“" + securityMap.get("name") + "”变更为“" + security.getName() + "”");
				}
			} else if ("summary".equals(key)) {
				if (value == null || "".equals(value)) {
					if (oldMap.get(key) == null) continue;
					details.add("主题由“" + oldMap.get(key) + "”变更为<空值>");
				} else if (oldMap.get(key) == null) {
					details.add("主题由<空值>变更为“" + map.get(key) + "”");
				} else {
					if (map.get(key).equals(oldMap.get(key))) continue;
					details.add("主题由“" + oldMap.get(key) + "”变更为“" + map.get(key) + "”");
				}
			} else if ("description".equals(key)) {
				if (value == null || "".equals(value)) {
					if (oldMap.get(key) == null) continue;
					details.add("详细描述由“" + oldMap.get(key) + "”变更为<空值>");
				} else if (oldMap.get(key) == null) {
					details.add("详细描述由<空值>变更为“" + map.get(key) + "”");
				} else {
					if (map.get(key).equals(oldMap.get(key))) continue;
					details.add("详细描述由“" + oldMap.get(key) + "”变更为“" + map.get(key) + "”");
				}
			} else if ("creator".equals(key)) {
				if (value == null || "".equals(value)) {
					if (oldMap.get(key) == null) continue;
					@SuppressWarnings("unchecked")
					Map<String, Object> creatorMap = (Map<String, Object>) oldMap.get(key);
					details.add("创建人由“" + creatorMap.get("fullname") + "(" + creatorMap.get("username") + ")”变更为<空值>");
				}
				int creatorId = ((Number) map.get(key)).intValue();
				UserDO creator = userDao.internalGetById(creatorId);
				if (oldMap.get(key) == null) {
					details.add("创建人由<空值>变更为“" + creator.getFullname() + "(" + creator.getUsername() + ")”");
				} else {
					@SuppressWarnings("unchecked")
					Map<String, Object> creatorMap = (Map<String, Object>) oldMap.get(key);
					if (creatorId == (Integer) creatorMap.get("id")) continue;
					details.add("创建人由“" + creatorMap.get("fullname") + "(" + creatorMap.get("username") + ")”变更为“" + creator.getFullname() + "(" + creator.getUsername() + ")”");
				}
			} else if ("reporter".equals(key)) {
				if (value == null || "".equals(value)) {
					if (oldMap.get(key) == null) continue;
					@SuppressWarnings("unchecked")
					Map<String, Object> reporterMap = (Map<String, Object>) oldMap.get(key);
					details.add("报告人由“" + reporterMap.get("fullname") + "(" + reporterMap.get("username") + ")”变更为<空值>");
				}
				int reporterId = ((Number) map.get(key)).intValue();
				UserDO reporter = userDao.internalGetById(reporterId);
				if (oldMap.get(key) == null) {
					details.add("报告人由<空值>变更为“" + reporter.getFullname() + "(" + reporter.getUsername() + ")”");
				} else {
					@SuppressWarnings("unchecked")
					Map<String, Object> reporterMap = (Map<String, Object>) oldMap.get(key);
					if (reporterId == (Integer) reporterMap.get("id")) continue;
					details.add("报告人由“" + reporterMap.get("fullname") + "(" + reporterMap.get("username") + ")”变更为“" + reporter.getFullname() + "(" + reporter.getUsername() + ")”");
				}
			} else if (key.startsWith("customfield_")) {
				String fieldName = fieldRegister.getField(key).getName();
				if (oldMap.get(key) != null || value != null || !"[]".equals(value)) {
					if (value == null || "".equals(value)) {
						details.add(fieldName + "由“" + oldMap.get(key) + "”变更为<空值>");
					} else if (oldMap.get(key) == null) {
						details.add(fieldName + "由<空值>变更为“" + map.get(key) + "”");
					} else {
						details.add(fieldName + "由“" + oldMap.get(key) + "”变更为“" + map.get(key) + "”");
					}
				}
			} else if ("label".equals(key)) {
				// 标签
				List<String> oldLabelList = labelDao.getLabels(id);
				//		List<String> newLabelList = new ArrayList<String>();
				String[] newLabelArray = {};
				String labelValues = (String) map.get(key);
				if (StringUtils.isNotBlank(labelValues)) {
					newLabelArray = labelValues.split(" ");
				}
				List<String> newLabelList = Arrays.asList(newLabelArray);
				// 删除的label的list
				List<String> delLabelList = new ArrayList<String>();
				for (String oldLabel : oldLabelList) {
					// 删除了label
					if (!newLabelList.contains(oldLabel)) {
						delLabelList.add(oldLabel.toString());
					}
				}
				// 增加的label的list
				List<String> addLabelList = new ArrayList<String>();
				for (String newLabel : newLabelList) {
					// 增加了label
					if (!oldLabelList.contains(newLabel)) {
						addLabelList.add(newLabel);
					}
				}
				StringBuffer sb = new StringBuffer();
				if (!delLabelList.isEmpty()) {
					sb.append("删除了标签[");
					Object[] delLabelArray = delLabelList.toArray();
					sb.append(StringUtils.join(delLabelArray, ","));
					sb.append("]");
					details.add(sb.toString());
					sb.setLength(0);
				}
				if (!addLabelList.isEmpty()) {
					sb.append("增加了标签[");
					Object[] addLabelArray = addLabelList.toArray();
					sb.append(StringUtils.join(addLabelArray, ","));
					sb.append("]");
					details.add(sb.toString());
				}
			}
		}
		
		if (!details.isEmpty()) {
			MDC.put("details", details.toArray());
			activityLoggingDao.addLogging(id, ActivityLoggingOperationRegister.getOperation("UPDATE_SAFEINFO"));
			MDC.remove("details");
		}
	}
	
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
		StringBuilder query = new StringBuilder("{\"delete\":{\"query\":\"id:(");
		for (String id : ids) {
			query.append(id).append(" OR ");
		}
		query.delete(query.length() - 4, query.length()).append(")\"}}");
		solrService.deleteDoc("activity", "json", query.toString());
	}
	
	@Override
	protected void afterDelete(Collection<ActivityDO> collection) {
		for (ActivityDO activity : collection) {
			List<EventAnalysisDO> eventAnalysises = eventAnalysisDao.getByActivityId(activity.getId());
			eventAnalysisDao.delete(eventAnalysises);
		}
	}

	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		ActivityDO activity = (ActivityDO) obj;
		if ("assignee".equals(fieldName)) {
			map.put(fieldName, userDao.convert(activity.getAssignee()));
		} else if ("creator".equals(fieldName)) {
			// TODO: 有些场景下，会出现懒加载UserGroup的时候session丢失的情况，故暂时改为特殊处理的方式
			//			map.put(fieldName, userDao.convert(activity.getCreator()));
			Map<String, Object> userMap = new HashMap<String, Object>();
			UserDO user = activity.getCreator();
			if (user == null) return;
			userMap.put("id", user.getId());
			userMap.put("username", user.getUsername());
			userMap.put("fullname", user.getFullname());
			AvatarDO avatar = user.getAvatar();
			if (avatar == null) {
				userMap.put("avatarUrl", config.getUserAvatarWebPath() + "/" + config.getUnknownUserAvatar());
			} else {
				userMap.put("avatar", avatar.getId());
				userMap.put("avatarUrl", config.getUserAvatarWebPath() + "/" + avatar.getFileName());
			}
			map.put(fieldName, userMap);
		} else if ("priority".equals(fieldName)) {
			map.put(fieldName, activityPriorityDao.convert(activity.getPriority()));
		} else if ("reporter".equals(fieldName)) {
			// TODO: 有些场景下，会出现懒加载UserGroup的时候session丢失的情况，故暂时改为特殊处理的方式
			//			map.put(fieldName, userDao.convert(activity.getReporter()));
			Map<String, Object> userMap = new HashMap<String, Object>();
			UserDO user = activity.getReporter();
			if (user == null) return;
			userMap.put("id", user.getId());
			userMap.put("username", user.getUsername());
			userMap.put("fullname", user.getFullname());
			AvatarDO avatar = user.getAvatar();
			if (avatar == null) {
				userMap.put("avatarUrl", config.getUserAvatarWebPath() + "/" + config.getUnknownUserAvatar());
			} else {
				userMap.put("avatar", avatar.getId());
				userMap.put("avatarUrl", config.getUserAvatarWebPath() + "/" + avatar.getFileName());
			}
			map.put(fieldName, userMap);
		} else if ("resolution".equals(fieldName)) {
			map.put(fieldName, activityResolutionDao.convert(activity.getResolution()));
		} else if ("security".equals(fieldName)) {
			map.put(fieldName, activitySecurityLevelDao.convert(activity.getSecurity()));
		} else if ("status".equals(fieldName)) {
			map.put(fieldName, activityStatusDao.convert(activity.getStatus()));
		} else if ("type".equals(fieldName)) {
			map.put(fieldName, activityTypeDao.convert(activity.getType()));
		} else if ("unit".equals(fieldName)) {
			map.put(fieldName, unitDao.convert(activity.getUnit(), Arrays.asList(new String[] { "id", "name", "code", "avatar" })));
		} else if ("created".equals(fieldName)) {
			map.put(fieldName, DateHelper.formatIsoSecond(activity.getCreated()));
		} else if ("lastUpdate".equals(fieldName)) {
			map.put(fieldName, DateHelper.formatIsoSecond(activity.getLastUpdate()));
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}
	
	@Override
	public List<Map<String, Object>> getSubMenus(Integer id, HttpServletRequest request) {
		MenuItem item = menuCache.getMenuItemById(id);
		String path = item.getPath();
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
		if ("安全信息/最新安全信息".equals(path)) {
			List<ActivityDO> activities = userHistoryItemDao.getRecentActivities(PermissionSets.VIEW_ACTIVITY.getName());
			if (activities != null) {
				for (ActivityDO activity : activities) {
					list.add(getMenuMap(activity));
				}
			}
		}
		return list;
	}
	
	private Map<String, Object> getMenuMap(ActivityDO activity) {
		Map<String, Object> menuMap = new HashMap<String, Object>();
		menuMap.put("name", activity.getSummary());
		menuMap.put("code", activity.getUnit().getCode());
		menuMap.put("count", activity.getNum());
		menuMap.put("type", "activity");
		if (activity.getType() != null) menuMap.put("activityTypeUrl", activity.getType().getUrl());
		menuMap.put("url", config.getActivityPageUrl() + "?activityId=" + activity.getId());
		return menuMap;
	}
	
	@SuppressWarnings("unchecked")
	public List<Map<String, Object>> findByIds(String[] ids, String[] orderBys) throws Exception {
		if (ids == null || ids.length == 0) return new ArrayList<Map<String,Object>>();
		//List<CustomFieldValueDO> list = this.getHibernateTemplate().find("select a from ActivityDO a, CustomFieldValueDO c1, CustomFieldValueDO c2 where a.id in ? and a = c1.activity and a=c2.activity order by ",null);
		String s_ids = "";
		for (int i = 0; i < ids.length; i++) {
			if (Utility.IsEmpty(s_ids))
				s_ids = ids[i];
			else
				s_ids += "," + ids[i];
		}
		
		String tableSql = "a";
		String orderSql = "";
		Integer n = 0;
		if (orderBys != null && orderBys.length > 0) {
			for (String orderBy : orderBys) {
				if (Utility.IsEmpty(orderBy)) continue;
				String fieldName = orderBy.trim();
				String sc = "asc";
				if (fieldName.toLowerCase().endsWith(" desc")) {
					fieldName = fieldName.substring(0, fieldName.length() - 5).trim();
					sc = "desc";
				} else if (fieldName.toLowerCase().endsWith(" asc")) {
					fieldName = fieldName.substring(0, fieldName.length() - 4).trim();
					sc = "asc";
				}
				if (fieldName.toLowerCase().startsWith("custom")) {
					n++;
					tableSql += " left outer join a.values c" + n.toString() + " with c" + n.toString() + ".key = '" + fieldName.toLowerCase() + "'";
					ISearchTemplate ist = SearchTemplateRegister.getSearchTemplate(fieldRegister.getFieldSearcher(fieldName.toLowerCase()));
					if (!Utility.IsEmpty(orderSql)) orderSql += ",";
					orderSql += "c" + n.toString() + "." + ist.getOrderFieldName() + " " + sc;
				} else {
					if (Utility.IsEmpty(orderSql))
						orderSql = "a." + orderBy;
					else
						orderSql += ",a." + orderBy;
				}
			}
		}
		//List<ActivityDO> list_activity = this.getHibernateTemplate().find("select a from ActivityDO a left outer join a.values v1 with v1.key = 'customfield_55' left outer join a.values v2 with v2.key = 'customfield_46' where a.id in (" + s_ids + ") order by v1.dateValue,v2.stringValue");
		String uql = "select a from ActivityDO " + tableSql + " where a.id in (" + s_ids + ")" + (Utility.IsEmpty(orderSql) ? "" : " order by " + orderSql);
		List<ActivityDO> list_activity = this.getHibernateTemplate().find(uql);
		List<Map<String, Object>> list_result = convert(list_activity);
		
		return list_result;
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void changeActivityStatus(int activityId, int statusId) {
		ActivityDO activity = this.internalGetById(activityId);
		ActivityStatusDO status = activityStatusDao.internalGetById(statusId);
		activity.setStatus(status);
		this.internalUpdate(activity);
	}
	
	@SuppressWarnings("unchecked")
	public List<ActivityDO> getActivityByids(String ids, String sort, String order) {
		String hql = "";
		if (order == null || "".equals(order)) {
			hql = "from ActivityDO where  id in (" + ids + ") order by " + sort;
		} else {
			hql = "from ActivityDO where  id in (" + ids + ") order by " + sort + " " + order;
		}
		return this.getHibernateTemplate().find(hql);
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void transform(int id, Map<String, Object> map) {
		Map<String, Object> commonFieldMap = getCommonFieldMap(map);
		Map<String, Object> customFieldMap = getCustomFieldMap(map);
		// 添加活动日志用
		ActivityDO act = this.internalGetById(id);
		final Map<String, Object> oldMap = this.convert(act);
		
		this.update(id, commonFieldMap);
		oldMap.putAll(this.updateCustomFields(id, customFieldMap));
		
		afterUpdateExtend(id, map, oldMap);
		// 同步到solr中
		solrService.updateSolrFields("activity", id, map);
		
		ActivityDO activity = this.internalGetById(id);
		int unitId = activity.getUnit().getId();
		int typeId = activity.getType().getId();
		WorkflowSchemeEntityDO entity = workflowSchemeEntityDao.getByUnitAndType(unitId, typeId);
		if (entity == null) entity = workflowSchemeEntityDao.getByUnitAndNullType(unitId);
		String workflow = entity.getWorkflow();
		Map<String, Object> objMap = new HashMap<String, Object>();
		objMap.put("id", id);
		objMap.put("dataobject", "activity");
		String workflowId = (String) transactionHelper.doInTransaction(new WfSetup(), "Submit", UserContext.getUserId().toString(), workflow, "", "", gson.toJson(objMap));
		activity.setWorkflowId(workflowId);
		activity.setCreator(UserContext.getUser());
		this.internalUpdate(activity);
	}
	
	public void checkPermission(int activityId, int unitId, PermissionSets... permissionSets) {
		String[] permissions = new String[permissionSets.length];
		for (int i = 0; i < permissionSets.length; i++) {
			permissions[i] = permissionSets[i].getName();
		}
		if (!permissionSetDao.hasActivityPermission(activityId, unitId, permissions)) throw SMSException.NO_ACCESS_RIGHT;
	}
	
	public void checkPermission(List<String> permissions, PermissionSets... permissionSets) {
		if (!this.hasPermission(permissions, permissionSets)) throw SMSException.NO_ACCESS_RIGHT;
	}
	
	public boolean hasPermission(List<String> permissions, PermissionSets... permissionSets) {
		for (PermissionSets permission : permissionSets) {
			if (permissions.contains(permission.getName())) return true;
		}
		return false;
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public Integer addEntityFromExcel(EntityFromExcel entity, Map<String, Object> map) {
		ActivityDO activity = new ActivityDO();
		// 优先级(一般)
		ActivityPriorityDO activityPriority = activityPriorityDao.getByName("一般");
		if (null == activityPriority) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_112002005, "一般");
		}
		activity.setPriority(activityPriority);
		// 状态(结案)
		ActivityStatusDO activityStatus = activityStatusDao.getByCategoryAndName(ActivityStatusCategory.COMPLETE.toString(), "结案");
		if (null == activityStatus) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_112002006, "结案");
		}
		activity.setStatus(activityStatus);
		// 报告人和创建者(管理员admin)
		UserDO user = userDao.getByUsername("ADMIN");
		if (null == user) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_104000001, "ADMIN");
		}
		activity.setCreator(user);
		activity.setReporter(user);
		// 类型(航空安全信息)
		ActivityTypeDO activityType = activityTypeDao.getByName("航空安全信息");
		if (null == activityType) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_112002004, "航空安全信息");
		}
		activity.setType(activityType);
		// 安监机构
		UnitDO unit = unitDao.getUnitByName(entity.getUnitName());
		if (null == unit) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_112002002, entity.getUnitName());
		}
		activity.setUnit(unit);
		// 主题
		activity.setSummary(entity.getSummary());
		// 描述
		activity.setDescription(entity.getDescription());
		Integer unitCount = unit.getCount() == null ? 1 : unit.getCount() + 1;
		// num
		activity.setNum(unitCount);
		// 保存activity
		this.internalSave(activity);
		
		unit.setCount(unitCount);
		unitDao.update(unit);
		
		map.put("priority", activity.getPriority().getId());
		map.put("status", activity.getStatus().getId());
		map.put("creator", activity.getCreator().getId());
		map.put("reporter", activity.getReporter().getId());
		map.put("type", activity.getType().getId());
		map.put("unit", activity.getUnit().getId());
		map.put("summary", activity.getSummary());
		map.put("description", activity.getDescription());
		
		// 处理人（null）
		
		if (!StringUtils.isBlank(entity.getEmergencyMeasure()) || !StringUtils.isBlank(entity.getEventType()) || !StringUtils.isBlank(entity.getSystem())) {
			// 应急措施（自定义字段）
			if (!StringUtils.isBlank(entity.getEmergencyMeasure())) {
				List<CustomFieldDO> customFields = customFieldDao.getByName("应急措施");
				if (customFields.isEmpty()) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_110000001, "应急措施");
				}
				map.put("customfield_" + customFields.get(0).getId(), entity.getEmergencyMeasure());
			}
			// 系统分类（自定义字段）
			if (!StringUtils.isBlank(entity.getSystem())) {
				List<CustomFieldDO> customFields = customFieldDao.getByName("系统分类");
				if (customFields.isEmpty()) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_110000001, "系统分类");
				}
				map.put("customfield_" + customFields.get(0).getId(), entity.getSystem());
			}
			// 事件类型（自定义字段）
			if (!StringUtils.isBlank(entity.getEventType())) {
				List<CustomFieldDO> customFields = customFieldDao.getByName("事件类型");
				if (customFields.isEmpty()) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_110000001, "事件类型");
				}
				String[] eventTypes = StringUtils.split(entity.getEventType(), ",");
//				for (String eventType : eventTypes) {
//					DictionaryDO dic = dictionaryDao.getByTypeAndName("事件类型", eventType);
//					if (null == dic) {
//						throw new SMSException(MessageCodeConstant.MSG_CODE_122000001, eventType);
//					}
//				}
				map.put("customfield_" + customFields.get(0).getId(), eventTypes);
			}
		}
		Map<String, Object> customFieldMap = getCustomFieldMap(map);
		this.saveCustomFields(activity.getId(), customFieldMap);
		
		// 发生日期
		if (!StringUtils.isBlank(entity.getOccurredDate())) {
			Date occurredDate = DateHelper.parseIsoSecond(entity.getOccurredDate());
			AccessInformationDO accessInformation = new AccessInformationDO();
			accessInformation.setOccurredDate(occurredDate);
			accessInformation.setActivity(activity);
			// 保存安全信息
			accessInformationDao.internalSave(accessInformation);
			
			// 航班信息
			FlightInfoEntityDO flightInfoEntity = new FlightInfoEntityDO();
			// 航班号
			if (!StringUtils.isBlank(entity.getFlightInfoID())) {
				// 航班号去掉字母部分,去掉两端空格
				String flightNO = entity.getFlightInfoID().replaceAll("[a-zA-Z]", "").trim();
				FlightInfoDO flightInfo = flightInfoDao.getByFlightNOAndDate(flightNO, occurredDate);
				if (null != flightInfo) {
					
					//					throw new SMSException(MessageCodeConstant.MSG_CODE_129000002, entity.getFlightInfoID());
					flightInfoEntity.setFlightInfo(flightInfo);
					
					// 飞行阶段
					if (!StringUtils.isBlank(entity.getFlightPhase())) {
						DictionaryDO flightPhase = dictionaryDao.getByTypeAndName("飞行阶段", entity.getFlightPhase());
						if (null == flightPhase) {
							throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "飞行阶段(新)[" + entity.getFlightPhase() + "]不存在！");
						}
						flightInfoEntity.setFlightPhase(flightPhase);
					}
					
					flightInfoEntity.setActivity(activity);
					// 保存航班信息
					flightInfoEntityDao.internalSave(flightInfoEntity);
				} else {
					activity.setDescription(activity.getDescription() + entity.getFlightInfoID());
					this.update(activity);
				}
			}
		}
		map.putAll(this.getById(activity.getId()));
		
		// tem信息
		// 直接从字典中取
		if (!StringUtils.isBlank(entity.getSystem())) {
			DictionaryDO system = dictionaryDao.getByTypeAndName("系统分类", entity.getSystem());
			if (null == system) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_115000001, entity.getSystem());
			}
			TemDO tem = new TemDO();
			tem.setActivity(activity);
			tem.setSysType(system);
			temDao.internalSave(tem);
			
			// 严重程度
			if (!StringUtils.isBlank(entity.getSeverity())) {
				SeverityDO severity = severityDao.getByName(entity.getSeverity());
				if (null == severity) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_121000001, entity.getSeverity());
				}
				tem.setSeverity(severity);
				// 对应条款
				ProvisionDO provision = provisionDao.getBySeverity(severity);
				if (null == provision) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_123000002, entity.getSeverity());
				}
				tem.setProvision(provision);
			}
			
			// 不安全状态
			if (!StringUtils.isBlank(entity.getInsecurity())) {
				InsecurityDO insecurity = insecurityDao.getByName(entity.getInsecurity());
				if (null == insecurity) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_125000001, entity.getInsecurity());
				}
				tem.setInsecurity(insecurity);
			}
			// 重大风险
			if (!StringUtils.isBlank(entity.getConsequence())) {
				ConsequenceDO consequence = consequenceDao.getByName(entity.getConsequence());
				if (null == consequence) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_124000001, entity.getConsequence());
				}
				tem.setConsequence(consequence);
			}
			
			// 威胁
			if (!StringUtils.isBlank(entity.getPrimaryThreat()) || !StringUtils.isBlank(entity.getSecondaryThreat())) {
				if (StringUtils.isBlank(entity.getPrimaryThreat())) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_117000003);
				}
				// 主威胁
				ThreatDO primaryThreat = threatDao.getByName(entity.getPrimaryThreat());
				if (null == primaryThreat) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_117000001, entity.getPrimaryThreat());
				}
				ThreatMappingDO primaryThreatMapping = new ThreatMappingDO();
				primaryThreatMapping.setTem(tem);
				primaryThreatMapping.setThreat(primaryThreat);
				// 保存威胁
				threatMappingDao.internalSave(primaryThreatMapping);
				
				Set<ThreatMappingDO> threatMappings = new HashSet<ThreatMappingDO>();
				threatMappings.add(primaryThreatMapping);
				
				// tem设置主威胁
				tem.setPrimaryThreat(primaryThreatMapping);
				
				// 次威胁
				if (!StringUtils.isBlank(entity.getSecondaryThreat())) {
					ThreatDO secondaryThreat = threatDao.getByName(entity.getSecondaryThreat());
					if (null == secondaryThreat) {
						throw new SMSException(MessageCodeConstant.MSG_CODE_117000002, entity.getSecondaryThreat());
					}
					ThreatMappingDO secondaryThreatMapping = new ThreatMappingDO();
					secondaryThreatMapping.setTem(tem);
					secondaryThreatMapping.setThreat(secondaryThreat);
					// 保存威胁
					threatMappingDao.internalSave(secondaryThreatMapping);
					threatMappings.add(secondaryThreatMapping);
				}
				// tem设置威胁
				tem.setThreats(threatMappings);
			}
			// 差错
			if (!StringUtils.isBlank(entity.getPrimaryError()) || !StringUtils.isBlank(entity.getSecondaryError())) {
				if (StringUtils.isBlank(entity.getPrimaryError())) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_117000003);
				}
				// 主差错
				ErrorDO primaryError = errorDao.getByName(entity.getPrimaryError());
				if (null == primaryError) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_117000001, entity.getPrimaryError());
				}
				ErrorMappingDO primaryErrorMapping = new ErrorMappingDO();
				primaryErrorMapping.setTem(tem);
				primaryErrorMapping.setError(primaryError);
				// 保存差错
				errorMappingDao.internalSave(primaryErrorMapping);
				
				Set<ErrorMappingDO> errorMappings = new HashSet<ErrorMappingDO>();
				errorMappings.add(primaryErrorMapping);
				
				// tem设置主差错
				tem.setPrimaryError(primaryErrorMapping);
				
				// 次差错
				if (!StringUtils.isBlank(entity.getSecondaryError())) {
					ErrorDO secondaryError = errorDao.getByName(entity.getSecondaryError());
					if (null == secondaryError) {
						throw new SMSException(MessageCodeConstant.MSG_CODE_117000002, entity.getSecondaryError());
					}
					ErrorMappingDO secondaryErrorMapping = new ErrorMappingDO();
					secondaryErrorMapping.setTem(tem);
					secondaryErrorMapping.setError(secondaryError);
					// 保存差错
					errorMappingDao.internalSave(secondaryErrorMapping);
					errorMappings.add(secondaryErrorMapping);
				}
				
				// tem设置差错
				tem.setErrors(errorMappings);
			}
			// 更新tem
			temDao.update(tem);
		}
		return activity.getId();
	}
	
	@SuppressWarnings("unchecked")
	public void exportToExcel(List<Map<String, Object>> columns, List<Map<String, Object>> list_result, OutputStream out) {
		// 表头
		List<String> headers = new ArrayList<String>();
		for (Map<String, Object> map : columns) {
			headers.add(map.get("name").toString());
		}
		List<Object[]> rows = new ArrayList<Object[]>();
		for (Map<String, Object> dataMap : list_result) {
			List<Object> row = new ArrayList<Object>();
			for (Map<String, Object> map : columns) {
				String key = map.get("data").toString();
				String cellContent = "";
				// 关键字/编号时特殊处理（unit.code-num, 如：ZJ-354）
				if ("keyword".equals(key) || "activityNo".equals(key)) {
					cellContent = ((Map<String, Object>) dataMap.get("unit")).get("code") + "-" + dataMap.get("num");
				} else {
					String searcher = fieldRegister.getFieldSearcher(key);
					if (searcher != null) {
						ISearchTemplate template = SearchTemplateRegister.getSearchTemplate(searcher);
						if (template != null) {
							cellContent = template.getExportContent(dataMap.get(map.get("data").toString()));
						}
					}
				}
				row.add(cellContent);
			}
			rows.add(row.toArray());
		}
		ExcelUtil.exportExcel("sheet1", headers, rows, out, "yyyy-MM-dd");
		
	}
	
	/**
	 * 通过sql进行查询
	 * 
	 * @param content 模糊查询的关键字
	 * @param showPage 显示第几页
	 * @param row 每页显示数量
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> fuzzySearch(String content, Integer showPage, Integer row) {
		Map<String, Object> result = new HashMap<String, Object>();
		if (null == content) {
			return result;
		}
		String transferredContent = content.replaceAll("/", "//").replaceAll("%", "/%").replaceAll("_", "/_");
		transferredContent = "%" + transferredContent + "%";
		
		Session session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		// 子查询(查询条件主体)
		StringBuffer sql = new StringBuffer();
		sql.append(" select a.id from");
		sql.append(" t_activity a ");
		sql.append(" left join t_organization_entity org_ety");
		sql.append(" on (");
		sql.append("     a.id = org_ety.activity_id");
		sql.append(" )");
		sql.append(" left join t_organization org");
		sql.append(" on (");
		sql.append("     org_ety.organization_id = org.id");
		sql.append(" )");
		sql.append(" left join t_custom_field_value cfv");
		sql.append(" on (");
		sql.append("     a.id = cfv.activity_id");
		sql.append(" )");
		sql.append(" left join t_custom_field cf");
		sql.append(" on (");
		sql.append("     cfv.\"key\" = concat('customfield_',cf.id)");
		sql.append(" and cf.name = '系统分类'");
		sql.append(" )");
		sql.append(" where a.deleted = '0'");
		// 安全信息的标题、详细描述
		sql.append("   and (upper(a.summary) like upper(:transferredContent) escape '/' or a.description like :transferredContent escape '/')");
		// 责任单位(单位信息)的名称
		sql.append("   or (org.deleted = '0' and upper(org.\"name\") like upper(:transferredContent) escape '/')");
		// 系统分类的名称
		sql.append("   or (cfv.deleted = '0' and upper(cfv.string_value) like upper(:transferredContent) escape '/')");
		sql.append("   ");
		sql.append(" union ");
		sql.append("");
		// 航班信息Entity
		sql.append(" select a.id from");
		sql.append(" t_activity a ");
		sql.append(" left join T_FLIGHT_INFO_ENTITY fi_ety");
		sql.append(" on (");
		sql.append("     a.id = fi_ety.activity_id");
		sql.append(" )");
		// 航班信息
		sql.append(" left join yxw_tb_flightmovementinfo fi");
		sql.append(" on (");
		sql.append("     fi_ety.flight_info = fi.flightinfoid");
		sql.append(" )");
		sql.append(" where a.deleted = '0'");
		// 航班信息(航班号、飞机机号、机场三字码、机场四字码)
		sql.append("   and (fi_ety.deleted = '0' and (upper(concat(fi.carrier, fi.flightNO)) like upper(:transferredContent) escape '/' or fi.tailNO like :transferredContent escape '/' or fi.deptAirport like :transferredContent escape '/' or fi.arrAirport like :transferredContent escape '/'))");
		sql.append("   ");
		sql.append(" union ");
		sql.append("");
		sql.append(" select a.id from");
		sql.append(" t_activity a ");
		sql.append(" left join T_FLIGHT_INFO_ENTITY fi_ety");
		sql.append(" on (");
		sql.append("     a.id = fi_ety.activity_id");
		sql.append(" )");
		// 航班信息
		sql.append(" left join yxw_tb_flightmovementinfo fi");
		sql.append(" on (");
		sql.append("     fi_ety.flight_info = fi.flightinfoid");
		sql.append(" )");
		// 排班计划
		sql.append(" left join YXW_TB_FLIGHTCREWSCHEDULEINFO fcs");
		sql.append(" on (");
		sql.append("     fcs.flightinfoid = fi.flightinfoid");
		sql.append(" )");
		// 机组人员
		sql.append(" left join YXW_TM_CR_FLIGHTCREWMEMBER fcm");
		sql.append(" on (");
		sql.append("     fcs.p_code = fcm.p_code");
		sql.append(" )");
		sql.append(" where a.deleted = '0'");
		// 机组人员姓名，乘务组人员姓名");
		// 通过模糊查询机组人员的姓名获取航班信息");
		sql.append("   and upper(fcm.c_name) like upper(:transferredContent) escape '/'");
		sql.append("   ");
		sql.append(" union ");
		sql.append("   ");
		sql.append(" select a.id from");
		sql.append(" t_activity a ");
		sql.append(" left join T_FLIGHT_INFO_ENTITY fi_ety");
		sql.append(" on (");
		sql.append("     a.id = fi_ety.activity_id");
		sql.append(" )");
		// 航班信息
		sql.append(" left join yxw_tb_flightmovementinfo fi");
		sql.append(" on (");
		sql.append("     fi_ety.flight_info = fi.flightinfoid");
		sql.append(" )");
		sql.append(" left join YXW_TB_FLIGHTCREWSCHEDULEINFO fcs");
		sql.append(" on (");
		sql.append("     fcs.flightinfoid = fi.flightinfoid");
		sql.append(" )");
		// 客舱服务排班
		sql.append(" left join YXW_TB_CABINCREWSCHEDULEINFO ccs");
		sql.append(" on (");
		sql.append("     ccs.flightinfoid = fi.flightinfoid");
		sql.append(" )");
		// 客舱服务人员
		sql.append(" left join YXW_TM_CR_CABINCREWMEMBER ccm");
		sql.append(" on (");
		sql.append("     ccs.staff_id = ccm.staff_id");
		sql.append(" )");
		sql.append(" where a.deleted = '0'");
		// 通过模糊查询乘务组人员的姓名获取航班信息
		sql.append("   and upper(ccm.staff_name) like upper(:transferredContent) escape '/'");
		sql.append("   ");
		sql.append(" union ");
		sql.append("");
		// 航班信息Entity
		sql.append(" select a.id from");
		sql.append(" t_activity a ");
		sql.append(" left join T_FLIGHT_INFO_ENTITY fi_ety");
		sql.append(" on (");
		sql.append("     a.id = fi_ety.activity_id");
		sql.append(" )");
		// 航班信息
		sql.append(" left join yxw_tb_flightmovementinfo fi");
		sql.append(" on (");
		sql.append("     fi_ety.flight_info = fi.flightinfoid");
		sql.append(" )");
		// 机场信息
		sql.append(" left join yxw_tb_airport airport");
		sql.append(" on (");
		sql.append("     fi.deptAirport = airport.iatacode");
		sql.append("  or fi.arrairport = airport.iatacode");
		sql.append(" )");
		sql.append("   where a.deleted = '0'");
		// 机场名称
		// 根据起飞机场和到达机场的三字码进行模糊查询
		sql.append("and upper(airport.fullName) like upper(:transferredContent)");
		sql.append("");
		sql.append(" union ");
		sql.append(" select a.id from");
		sql.append(" t_activity a ");
		sql.append(" left join T_FLIGHT_INFO_ENTITY fi_ety");
		sql.append(" on (");
		sql.append("     a.id = fi_ety.activity_id");
		sql.append(" )");
		// 航班信息
		sql.append(" left join yxw_tb_flightmovementinfo fi");
		sql.append(" on (");
		sql.append("     fi_ety.flight_info = fi.flightinfoid");
		sql.append(" )");
		// 机场信息
		sql.append(" left join yxw_tb_airport airport");
		sql.append(" on (");
		sql.append("     fi.deptAirport = airport.iatacode");
		sql.append("  or fi.arrairport = airport.iatacode");
		sql.append(" )");
		sql.append("   where a.deleted = '0'");
		// 机场名称
		// 根据起飞机场和到达机场的三字码进行模糊查询
		sql.append("and upper(airport.iCaoCode) like upper(:transferredContent)");
		sql.append(" union ");
		sql.append(" select a.id from");
		sql.append(" t_activity a ");
		sql.append(" left join T_FLIGHT_INFO_ENTITY fi_ety");
		sql.append(" on (");
		sql.append("     a.id = fi_ety.activity_id");
		sql.append(" )");
		// 航班信息
		sql.append(" left join yxw_tb_flightmovementinfo fi");
		sql.append(" on (");
		sql.append("     fi_ety.flight_info = fi.flightinfoid");
		sql.append(" )");
		// 机场信息
		sql.append(" left join yxw_tb_airport airport");
		sql.append(" on (");
		sql.append("     fi.deptAirport = airport.iatacode");
		sql.append("  or fi.arrairport = airport.iatacode");
		sql.append(" )");
		// 飞机信息
		sql.append(" left join ECMR_U_AIRCRAFT aircraft");
		sql.append(" on (");
		sql.append("     substr(fi.tailNO, 2, 4) = aircraft.tail_no");
		sql.append(" )");
		sql.append("   where a.deleted = '0'");
		// 机场名称
		// 根据起飞机场和到达机场的三字码进行模糊查询
		sql.append("and upper(aircraft.aircraft_type) like upper(:transferredContent)");
		sql.append(" union ");
		sql.append(" select a.id from");
		sql.append(" t_activity a ");
		// 地面位置
		sql.append(" left join t_ground_position_entity gp");
		sql.append(" on (");
		sql.append("     a.id = gp.activity_id");
		sql.append(" )");
		sql.append(" left join t_dictionary gp_dic");
		sql.append(" on (");
		sql.append("     gp.ground_position = gp_dic.id");
		sql.append(" )");
		// 车辆车牌
		sql.append(" left join t_vehicle_info_entity vi");
		sql.append(" on (");
		sql.append("     a.id = vi.activity_id");
		sql.append(" )");
		// 维护工具
		sql.append(" left join t_maintain_tool_entity mt");
		sql.append(" on (");
		sql.append("     a.id = mt.activity_id");
		sql.append(" )");
		sql.append(" left join t_dictionary mt_dic");
		sql.append(" on (");
		sql.append("     mt.maintain_tool = mt_dic.id");
		sql.append(" )");
		// 地面人员
		sql.append(" left join t_ground_staff_entity gs");
		sql.append(" on (");
		sql.append("     a.id = gs.activity_id");
		sql.append(" )");
		sql.append(" where a.deleted = '0'");
		sql.append("   and (");
		// 地面位置
		sql.append("      (gp.deleted = '0' and upper(gp_dic.name) like upper(:transferredContent) escape '/')");
		// 车辆车牌
		sql.append("     or (vi.deleted = '0' and upper(vi.num) like upper(:transferredContent) escape '/')");
		// 维护工具名称
		sql.append("     or (mt.deleted = '0' and upper(mt_dic.name) like upper(:transferredContent) escape '/')");
		// 地面人员
		sql.append("     or (gs.deleted = '0' and upper(gs.user_name) like upper(:transferredContent) escape '/')");
		sql.append("  )");
		sql.append(" union ");
		sql.append(" select a.id from");
		sql.append(" t_activity a ");
		// tem
		sql.append(" left join t_tem tem");
		sql.append(" on (");
		sql.append("     a.id = tem.activity_id");
		sql.append(" )");
		// 严重程度
		sql.append(" left join t_severity severity");
		sql.append(" on (");
		sql.append("     tem.severity_id = severity.id");
		sql.append(" )");
		// 重大风险
		sql.append(" left join t_consequence consequence");
		sql.append(" on (");
		sql.append("     tem.consequence_id = consequence.id");
		sql.append(" )");
		// 不安全状态
		sql.append(" left join t_insecurity insecurity");
		sql.append(" on (");
		sql.append("     tem.insecurity_id = insecurity.id");
		sql.append(" )");
		// 威胁
		sql.append(" left join t_threat_mapping tm");
		sql.append(" on (");
		sql.append("     tem.id = tm.tem_id");
		sql.append(" )");
		sql.append(" left join t_threat threat ");
		sql.append(" on (");
		sql.append("     tm.threat_id = threat.id");
		sql.append(" )");
		// 差错
		sql.append(" left join t_error_mapping em");
		sql.append(" on (");
		sql.append("     tem.id = em.tem_id");
		sql.append(" )");
		sql.append(" left join t_error error");
		sql.append(" on (");
		sql.append("     em.error_id = error.id");
		sql.append(" )");
		// 标签
		sql.append(" left join t_label label");
		sql.append(" on (");
		sql.append("     a.id = label.activity_id");
		sql.append(" )");
		sql.append(" where a.deleted = '0'");
		sql.append(" and (");
		// 严重程度,不安全状态,重大风险
		sql.append("      (tem.deleted = '0' and (upper(severity.name) like upper(:transferredContent) escape '/' or insecurity.\"name\" like :transferredContent escape '/' or consequence.\"name\" like :transferredContent escape '/'))");
		// 威胁
		sql.append("     or (tm.deleted = '0' and upper(threat.\"name\") like upper(:transferredContent) escape '/')");
		// 差错
		sql.append("     or (em.deleted = '0' and upper(error.\"name\") like upper(:transferredContent) escape '/')");
		// 标签
		sql.append("     or (label.deleted = '0' and upper(label.label) like upper(:transferredContent) escape '/')");
		sql.append(" )");
		// 
		StringBuffer sqlForTotalCount = new StringBuffer();
		sqlForTotalCount.append("select count(distinct (id)) from (");
		sqlForTotalCount.append(sql);
		sqlForTotalCount.append(")");
		
		SQLQuery query = session.createSQLQuery(sqlForTotalCount.toString());
		// 23个模糊查询项
		for (int i = 0; i < 23; i++) {
			query.setString("transferredContent", transferredContent);
		}
		List<BigDecimal> totalCounts = query.list();
		// 总数
		result.put("totalCount", totalCounts.get(0) == null ? 0 : totalCounts.get(0).intValue());
		
		// 返回的字段sql(进行分页)
		StringBuffer sqlForContent = new StringBuffer();
		sqlForContent.append("select ");
		sqlForContent.append("  a.id as id,");
		sqlForContent.append("  atp.name as type,");
		sqlForContent.append("  ast.name as status,");
		sqlForContent.append("  a.description as description,");
		sqlForContent.append("  lb.label as label,");
		sqlForContent.append("  a.created as created,");
		sqlForContent.append("  a.last_update as lastUpdate,");
		sqlForContent.append("  a.summary as title");
		sqlForContent.append(" from t_activity a");
		sqlForContent.append(" left join t_activity_type atp");
		sqlForContent.append(" on (a.type_id = atp.id)");
		sqlForContent.append(" left join t_activity_status ast");
		sqlForContent.append(" on (a.status_id = ast.id)");
		sqlForContent.append(" left join t_label lb");
		sqlForContent.append(" on (a.id = lb.activity_id)");
		sqlForContent.append(" where a.id in (");
		sqlForContent.append(" select distinct(id) from (");
		sqlForContent.append(" select id,rownum as rn from (");
		sqlForContent.append(sql);
		sqlForContent.append(")");
		sqlForContent.append(")");
		Integer startNum = null;
		Integer endNum = null;
		if (null != showPage && null != row) {
			// 从1开始
			startNum = (showPage - 1) * row + 1;
			endNum = showPage * row;
			sqlForContent.append(" where rn >= :startNum and rn <= :endNum");
		}
		sqlForContent.append(")");
		
		query = session.createSQLQuery(sqlForContent.toString());
		// 23个模糊查询项
		for (int i = 0; i < 23; i++) {
			query.setString("transferredContent", transferredContent);
		}
		if (null != startNum && null != endNum) {
			query.setInteger("startNum", startNum);
			query.setInteger("endNum", endNum);
		}
		query.addScalar("id", StandardBasicTypes.INTEGER);
		query.addScalar("type", StandardBasicTypes.STRING);
		query.addScalar("status", StandardBasicTypes.STRING);
		query.addScalar("description", StandardBasicTypes.STRING);
		query.addScalar("label", StandardBasicTypes.STRING);
		query.addScalar("created", StandardBasicTypes.TIMESTAMP);
		query.addScalar("lastUpdate", StandardBasicTypes.TIMESTAMP);
		query.addScalar("title", StandardBasicTypes.STRING);
		
		List<Object[]> list = query.list();
		Map<Integer, Object> map = new HashMap<Integer, Object>();
		// 将结果组装
		for (Object[] item : list) {
			Integer id = (Integer) item[0];
			String type = (String) item[1];
			String status = (String) item[2];
			String description = (String) item[3];
			String label = (String) item[4];
			Date created = (Date) item[5];
			Date lastUpdate = (Date) item[6];
			String title = (String) item[7];
			Map<String, Object> itemMap = null;
			List<String> labels = null;
			if (!map.containsKey(id)) {
				itemMap = new HashMap<String, Object>();
				itemMap.put("id", id);
				itemMap.put("type", type);
				itemMap.put("status", status);
				itemMap.put("description", description);
				itemMap.put("created", created);
				itemMap.put("lastUpdate", lastUpdate);
				itemMap.put("title", title);
				labels = new ArrayList<>();
				if (!StringUtils.isBlank(label)) {
					labels.add(label);
				}
				itemMap.put("labels", labels);
				map.put(id, itemMap);
			} else {
				itemMap = (Map<String, Object>) map.get(id);
				labels = (List<String>) itemMap.get("labels");
				labels.add(label);
			}
		}
		
		List<Map<String, String>> dataList = new ArrayList<Map<String, String>>();
		// 循环map，返回标题，状态，标签，描述，信息类型
		for (Entry<Integer, Object> entry : map.entrySet()) {
			Map<String, Object> activityMap = (Map<String, Object>) entry.getValue();
			Map<String, String> resultMap = new HashMap<String, String>();
			resultMap.put("title", (String) activityMap.get("title"));
			// 相关状态,信息类型,描述等信息
			StringBuffer detail = new StringBuffer();
			detail.append("信息类型：");
			detail.append(activityMap.get("type") == null ? "未知" : activityMap.get("type"));
			detail.append(" 状态：");
			detail.append(activityMap.get("status") == null ? "无" : activityMap.get("status"));
			detail.append(" 描述：");
			detail.append(activityMap.get("description") == null ? "无" : activityMap.get("description"));
			// 标签
			detail.append(" 标签：");
			List<String> labels = (List<String>) activityMap.get("labels");
			if (null == labels || labels.isEmpty()) {
				detail.append("无");
			} else {
				detail.append(StringUtils.join(labels, ","));
			}
			resultMap.put("content", detail.toString());
			
			// 安全信息的id
			resultMap.put("id", activityMap.get("id").toString());
			resultMap.put("type", EnumDirectoryType.SAFETYINFORMATION.toString());
			resultMap.put("created", DateHelper.formatIsoSecond((Date) activityMap.get("created")));
			resultMap.put("lastupdate", DateHelper.formatIsoSecond((Date) activityMap.get("lastUpdate")));
			dataList.add(resultMap);
		}
		result.put("dataList", dataList);
		return result;
	}
	
	/**
	 * 更新process数据
	 * 
	 * @param activity
	 * @param users
	 */
	private void updateUsersForProcess(ActivityDO activity, Collection<UserDO> users) {
		if (null != activity && null != users) {
			// 先删除数据库中已有的数据
			List<ProcessorDO> processors = processorDao.getProcessorsByActivity(activity);
			processorDao.delete(processors);
			
			// 再向数据库中添加新的数据
			for (UserDO user : users) {
				ProcessorDO processor = new ProcessorDO();
				processor.setActivity(activity);
				processor.setUser(user);
				processorDao.internalSave(processor);
			}
		}
	}
	
	/**
	 * 上报员工报告
	 * @param map
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void submitEmReport(Map<String, Object> map) {
		ActivityTypeDO type = activityTypeDao.getByName("员工安全报告");
		if (type == null) throw new SMSException(MessageCodeConstant.MSG_CODE_113000002, "员工安全报告");
		map.put("type", type.getId());
		this.submitReport(map);
	}
	
	/**
	 * 上报机长报告<br>
	 * 安监机构默认为飞行部
	 * @param map
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void submitAircraftCommanderReport(Map<String, Object> map) {
		ActivityTypeDO type = activityTypeDao.getByName("机长报告");
		if (type == null) throw new SMSException(MessageCodeConstant.MSG_CODE_113000002, "机长报告");
		map.put("type", type.getId());
		
		if (map.get("unit") == null) {
			UnitDO unit = unitDao.getUnitByName("飞行部");
			if (unit == null) throw new SMSException(MessageCodeConstant.MSG_CODE_113000003, "飞行部");
			map.put("unit", unit.getId());
		}
		// 电话的处理
		if (StringUtils.isBlank((String) map.get("reporterPhone"))) {
			map.put("reporterPhone", UserContext.getUser().getTelephoneNumber());
		}
		this.submitReport(map);
	}
	
	/**
	 * 上报报告<br>
	 * 员工报告，机长报告等
	 * @param map
	 */
	private void submitReport(Map<String, Object> map) {
		ActivityDO activity = new ActivityDO();
		String summary = map.get("summary")==null?"":map.get("summary").toString();
		String description = (String) map.get("description");
		if("".equals(summary)){
			summary = description.length() > 50 ? description.substring(0, 50) + "..." : description;
		}
		activity.setSummary(summary);
		activity.setDescription(description);
		// 安监机构
		UnitDO unit = new UnitDO();
		unit.setId(((Number) map.get("unit")).intValue());
		activity.setUnit(unit);
		// 类型
		ActivityTypeDO type = new ActivityTypeDO();
		type.setId(((Number) map.get("type")).intValue());
		activity.setType(type);
		// 优先级
		ActivityPriorityDO priority = activityPriorityDao.getDefaultPriority();
		if (priority != null) activity.setPriority(priority);
		String userCode = (String) map.remove("userCode");
		if (StringUtils.isNotEmpty(userCode)) {
			UserDO user = userDao.getByUsername(userCode);
			if (user != null) activity.setCreator(user);
		} else if (null != UserContext.getUser()) {
			activity.setCreator(UserContext.getUser());
		} else {
			UserDO anonymous = userDao.getByUsername("ANONYMITY");
			if (anonymous == null) throw new SMSException(MessageCodeConstant.MSG_CODE_112000001);
			activity.setCreator(anonymous);
		}
		
		int id = (Integer) this.internalSave(activity);
		this.afterSave(activity);
		// 发生时间
		String occurDate = (String) map.remove("occurDate");
		if (StringUtils.isNotBlank(occurDate)) {
			Map<String, Object> accessInformationMap = new HashMap<String, Object>();
			accessInformationMap.put("activity", id);
			accessInformationMap.put("occurredDate", occurDate);
			accessInformationDao.save(accessInformationMap);
		}
		// 航班信息
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> flightInfos = (List<Map<String, Object>>) map.remove("flightInfos");
		if (flightInfos != null) {
			for (Map<String, Object> flightInfo : flightInfos) {
				Map<String, Object> flightInfoEntityMap = new HashMap<String, Object>();
				flightInfoEntityMap.put("activity", ((Integer) id).doubleValue());
				flightInfoEntityMap.put("flightInfo", Double.parseDouble(((String) flightInfo.get("flightInfo"))));
				flightInfoEntityMap.put("flightPhase", Double.parseDouble((String) flightInfo.get("flightPhase")));
				flightInfoEntityDao.save(flightInfoEntityMap);
			}
		}
		
		Map<String, Object> customFieldMap = new HashMap<String, Object>();
		for (com.usky.sms.field.Field field : fieldRegister.getAllFields()) {
			String fieldName = field.getName();
			if ("联系电话".equals(fieldName)) {
				String reporterPhone = (String) map.remove("reporterPhone");
				if (StringUtils.isNotEmpty(reporterPhone)) {
					customFieldMap.put(field.getKey(), reporterPhone);
					map.put(field.getKey(), reporterPhone);
				}
			} else if ("电子邮箱".equals(fieldName)) {
				String email = (String) map.remove("email");
				if (StringUtils.isNotEmpty(email)) {
					customFieldMap.put(field.getKey(), email);
					map.put(field.getKey(), email);
				}
			} else if ("座机".equals(fieldName)) {
				String landLine = (String) map.remove("landLine");
				if (StringUtils.isNotEmpty(landLine)) {
					customFieldMap.put(field.getKey(), landLine);
					map.put(field.getKey(), landLine);
				}
			} else if ("deviceId".equals(fieldName)) {
				String deviceId = (String) map.remove("deviceId");
				if (StringUtils.isNotEmpty(deviceId)) {
					customFieldMap.put(field.getKey(), deviceId);
					map.put(field.getKey(), deviceId);
				}
			} else if ("上报途径".equals(fieldName)) {
				String mtype = (String) map.remove("mtype");
				if (StringUtils.isNotEmpty(mtype)) {
					customFieldMap.put(field.getKey(), mtype);
					map.put(field.getKey(), mtype);
				}
			} else if ("source".equals(fieldName)) {
				String source = (String) map.remove("source");
				if (StringUtils.isNotEmpty(source)) {
					customFieldMap.put(field.getKey(), source);
					map.put(field.getKey(), source);
				}
			} else if ("姓名".equals(fieldName)) {
				String userName = (String) map.remove("userName");
				if (StringUtils.isNotEmpty(userName)) {
					customFieldMap.put(field.getKey(), userName);
					map.put(field.getKey(), userName);
				}
			} else if ("所属处室".equals(fieldName)) {
				String dealDepartment = (String) map.remove("dealDepartment");
				if (StringUtils.isNotBlank(dealDepartment)) {
					Double dealDepartmentId = Double.parseDouble(dealDepartment);
					customFieldMap.put(field.getKey(), dealDepartmentId);
					map.put(field.getKey(), dealDepartmentId);
				}
			} else if ("发生地".equals(fieldName)) {
				String occurPlace = (String) map.remove("occurPlace");
				if (StringUtils.isNotEmpty(occurPlace)) {
					customFieldMap.put(field.getKey(), occurPlace);
					map.put(field.getKey(), occurPlace);
				}
			} else if ("希望采取措施".equals(fieldName)) {
				String measure = (String) map.remove("measure");
				if (StringUtils.isNotEmpty(measure)) {
					customFieldMap.put(field.getKey(), measure);
					map.put(field.getKey(), measure);
				}
			}
		}
		this.saveCustomFields(id, customFieldMap);
		afterSaveExtend(id, map);
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> attachments = (List<Map<String, Object>>) map.get("attachments");
		if (attachments != null) {
			for (Map<String, Object> attachment : attachments) {
				Integer attachmentId = ((Number) attachment.get("attachmentId")).intValue();
				FileDO file = fileDao.internalGetById(attachmentId);
				file.setSource(id);
				fileDao.internalUpdate(file);
			}
		}
		solrService.addMapBySolrj("activity", map);
	}
	
	
	/**
	 * 同步机长报告
	 * @param scheduler
	 */
	public void synchronizeAircraftCommanderReport(Scheduler scheduler) {
		String expression = config.getCronExpressionForSyncronizeAircraftCommanderReport();
		if (StringUtils.isNotBlank(expression)) {
			try {
				createCron(scheduler, "submitAircraftCommanderReport", CronSynchronizeAircraftCommanderReportJob.class, CRON_EXPRESSION_FOR_SYNCRONIZE_AIRCRAFT_COMMANDER_REPORT, expression);
			} catch (Exception e) {
				e.printStackTrace();
				log.warn("同步机长报告失败！" + e.getMessage(), e);
				throw e;
			}
		}
	}

	/**
	 * 创建一个job
	 * 
	 * @param scheduler 
	 * @param name 定时任务的名称
	 * @param jobClass 定时任务的实现类
	 * @param cronDefaultExpression 默认的表达式
	 * @param cronExpression 表达式
	 * @param params 参数对
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
		String cronEx;
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
	 * 机长报告
	 * @param map
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED)
	public void submitAircraftCommanderReport(Map<String, Object> activityMap, List<Map<String, Object>> attachments, Map<String, Object> flightInfoEntityMap, Integer aircraftCommanderReportTempId, Date flightBJDate) {
		Integer id = this.saveExtend(activityMap);
		try {
			// 同步到solr
			solrService.addMapBySolrj("activity", activityMap);
			
			ActivityDO activity = this.internalGetById(id);
			// 保存附件会用到creator的username
			UserDO user = userDao.internalGetById(activity.getCreator().getId());
			activity.setCreator(user);
			// 航班信息
			flightInfoEntityMap.put("activity", id.doubleValue());
			flightInfoEntityDao.save(flightInfoEntityMap);
	//		activityMap.putAll(flightInfoEntityDao.getFlightInfoForSolr(id));
			// 发生时间
			Map<String, Object> accessInformationMap = new HashMap<String, Object>();
			accessInformationMap.put("activity", id.doubleValue());
			accessInformationMap.put("occurredDate", flightBJDate);
			accessInformationDao.save(accessInformationMap);
			// 附件 上传失败不要影响生成安全信息
			try {
				fileDao.upload4MobileTerminal(activity, attachments, false);
			} catch (Exception e) {
				e.printStackTrace();
			}
			
			// 成功后将中间表的数据标记为已导入
			AircraftCommanderReportTempDO aircraftCommanderReportTemp = aircraftCommanderReportTempDao.internalGetById(aircraftCommanderReportTempId);
			aircraftCommanderReportTemp.setImported(true);
			aircraftCommanderReportTempDao.internalUpdate(aircraftCommanderReportTemp);
			// 同步到solr
//			solrService.addMapBySolrj("activity", activityMap);
		} catch (Exception e) {
			solrService.deleteSolrInputDocumentBySolrj("activity", id.toString());
			throw new SMSException(e);
		}
	}
	
	/**
	 * 查询源为所指定ID的安全信息
	 * @param activityId
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<ActivityDO> getByOrigin(Integer activityId) {
		if (activityId == null) {
			return new ArrayList<ActivityDO>();
		}
		return (List<ActivityDO>) this.query("from ActivityDO t where t.deleted = false and t.originActivityId = ?", activityId);
	}
	
	/**
	 * 下发安全信息
	 * @param id 安全信息id
	 * @param unitIds 安监机构的id
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public List<Integer> distributeActivity(Integer id, List<Integer> unitIds, String reason) {
		
		ActivityDO activity = this.internalGetById(id);
		// 分配原因，分配日期
		Map<String, Object> customFieldMap = new HashMap<String, Object>();
		for (com.usky.sms.field.Field field : fieldRegister.getAllFields()) {
			String fieldName = field.getName();
			if ("分配原因".equals(fieldName)) {
				customFieldMap.put(field.getKey(), reason);
			} else if ("分配日期".equals(fieldName)) {
				CustomFieldValueDao customFieldValueDao = (CustomFieldValueDao) SpringBeanUtils.getBean("customFieldValueDao");
				List<CustomFieldValueDO> customFieldValues = customFieldValueDao.getByActivityId(id, field.getKey());
				if (customFieldValues.isEmpty()) {
					customFieldMap.put(field.getKey(), DateHelper.formatIsoSecond(new Date()));
				}
			}
		}
		if (!customFieldMap.isEmpty()) {
			this.updateCustomFields(id, customFieldMap);
		}
		
		Map<String, Object> activityMap = this.assembleActivityMap(activity, ActivityDistributeConfigDao.UNIT_TYPE_UT);
		
		return this.distributeActiveOtherInfo(id, unitIds, activityMap, null);
	}
	
	/**
	 * 分配安全信息(专项风险管理)
	 * @param id 安全信息id
	 * @param orgIds 组织的id
	 * @param userIds 处理人的id
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public List<Integer> distributeActivityThroughOrgIds(Integer id, List<Integer> orgIds, List<Integer> userIds) {
		
		ActivityDO activity = this.internalGetById(id);
		
		Map<String, Object> activityMap = this.assembleActivityMap(activity, ActivityDistributeConfigDao.UNIT_TYPE_DP);
		List<OrganizationDO> orgs = organizationDao.getByIds(orgIds);
		List<Integer> unitIds = new ArrayList<Integer>();
		Map<Integer, Object> customFieldMap = new HashMap<Integer, Object>();
		// 所属处室的key
		String customFieldDeptKey = null;
		// 分配处理人的key
		String assignProcessorKey = null;
		for (com.usky.sms.field.Field field : fieldRegister.getAllFields()) {
			if ("所属处室".equals(field.getName())) {
				customFieldDeptKey = field.getKey();
			} else if ("分配处理人".equals(field.getName())) {
				assignProcessorKey = field.getKey();
			}
		}
		for (OrganizationDO org : orgs) {
			unitIds.add(org.getUnit().getId());
			Map<String, Object> customFieldValueMap = new HashMap<String, Object>();
			customFieldValueMap.put(customFieldDeptKey, org.getId().doubleValue());
			if (userIds != null && !userIds.isEmpty()) {
				customFieldValueMap.put(assignProcessorKey, StringUtils.join(userIds, ","));
			}
			customFieldMap.put(org.getUnit().getId(), customFieldValueMap);
		}
		return this.distributeActiveOtherInfo(id, unitIds, activityMap, customFieldMap);
	}
	
	/**
	 * 将安全信息的各属性放到一个map中
	 * @param activity
	 * @return
	 */
	private Map<String, Object> assembleActivityMap(ActivityDO activity, String unitType) {
		Map<String, Object> activityMap = new HashMap<String, Object>();
		// 信息类型
		ActivityDistributeConfigDO activityDistributeConfig = activityDistributeConfigDao.getBySourceTypeAndUnitType(activity.getType().getId(), unitType);
		if (activityDistributeConfig == null) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_112002003, activity.getType().getName());
		}
		activityMap.put("type", activityDistributeConfig.getDistributeType().getId());
		activityMap.put("originActivityId", activity.getId());
		activityMap.put("priority", activity.getPriority() == null ? null : activity.getPriority().getId());
		activityMap.put("resolution", activity.getResolution() == null ? null : activity.getResolution().getId());
		activityMap.put("security", activity.getSecurity() == null ? null : activity.getSecurity().getId());
		activityMap.put("summary", activity.getSummary());
		activityMap.put("description", activity.getDescription());
		activityMap.put("assignee", UserContext.getUserId());
		// 自定义字段
		Set<CustomFieldValueDO> values = activity.getValues();
		if (values != null) {
			for (CustomFieldValueDO value : values) {
				activityMap.put(value.getKey(), value);
				ISearchTemplate searchTemplate = SearchTemplateRegister.getSearchTemplate(fieldRegister.getFieldSearcher(value.getKey()));
				if (searchTemplate != null) {
					activityMap.put(value.getKey(), searchTemplate.getValue(value));
				}
			}
		}
		// 原始报告创建人和原始报告部门
		for (com.usky.sms.field.Field field : fieldRegister.getAllFields()) {
			String fieldName = field.getName();
			if ("原始报告创建人".equals(fieldName)) {
				activityMap.put(field.getKey(), activity.getCreator().getDisplayName());
			} else if ("原始报告部门".equals(fieldName)) {
				activityMap.put(field.getKey(), activity.getUnit().getDisplayName());
			} else if ("原信息类型".equals(fieldName)) {
				activityMap.put(field.getKey(), activity.getType().getDisplayName());
			}
		}
		return activityMap;
	}
	
	/**
	 * 保存安全信息相关的其他信息
	 * @param id
	 * @param unitIds
	 * @param activityMap
	 * @param customFieldMap 自定义字段的值，key为安监机构的ID
	 * @return
	 */
	@SuppressWarnings("unchecked")
	private List<Integer> distributeActiveOtherInfo(Integer id, List<Integer> unitIds, Map<String, Object> activityMap, Map<Integer, Object> customFieldMap) {
		List<Integer> result = new ArrayList<Integer>();
		// 附件
		List<FileDO> files = fileDao.getFilesBySource(EnumFileType.SAFETYINFORMATION.getCode(), id);
		// 发生时间
		AccessInformationDO accessInformationDO = accessInformationDao.getByActivityId(id);
		// 航班信息
		List<FlightInfoEntityDO> flightInfoEntitys = flightInfoEntityDao.getByActivityId(id);
		// 航线信息
		AirlineInfoDO airlineInfo = airlineInfoDao.getAirlineInfoByActivity(id);
		
		for (Integer unitId : unitIds) {
			Map<String, Object> map = new HashMap<String, Object>();
			// 安监机构
			map.put("unit", unitId);
			map.putAll(activityMap);
			if (customFieldMap != null) {
				map.putAll((Map<String, Object>) customFieldMap.get(unitId));
			}
			Integer activityId = this.saveExtend(map);
			solrService.addMapBySolrj("activity", map);
			// 附件
			for (FileDO file : files) {
				FileDO newFile = new FileDO();
				BeanUtils.copyProperties(file, newFile);
				newFile.setSource(activityId);
				newFile.setId(null);
				fileDao.internalSave(newFile);
//				Map<String, Object> fileMap = new HashMap<String, Object>();
//				fileMap.put("fileName", file.getFileName());
//				fileMap.put("type", file.getType());
//				fileMap.put("relativePath", file.getRelativePath());
//				fileMap.put("tag", file.getTag());
//				fileMap.put("size", file.getSize());
//				fileMap.put("uploadUser", file.getFileName());
//				fileDao.save(fileMap);
			}
			// 发生时间
			if (accessInformationDO != null) {
				Map<String, Object> accessInformationMap = new HashMap<String, Object>();
				accessInformationMap.put("activity", activityId);
				accessInformationMap.put("occurredDate", DateHelper.formatIsoSecond(accessInformationDO.getOccurredDate()));
				accessInformationDao.save(accessInformationMap);
			}
			// 航班信息
			for (FlightInfoEntityDO flightInfoEntity : flightInfoEntitys) {
				Map<String, Object> flightInfoEntityMap = new HashMap<String, Object>();
				flightInfoEntityMap.put("activity", activityId);
				flightInfoEntityMap.put("flightInfo", flightInfoEntity.getFlightInfo().getFlightInfoID());
				flightInfoEntityMap.put("flightPhase", flightInfoEntity.getFlightPhase().getId());
				flightInfoEntityDao.save(flightInfoEntityMap);
			}
			// 航线信息
			if (airlineInfo != null) {
				Map<String, Object> airlineInfoMap = new HashMap<String, Object>();
				airlineInfoMap.put("departureAirport", airlineInfo.getDepartureAirport());
				airlineInfoMap.put("arrivalAirport", airlineInfo.getArrivalAirport());
				airlineInfoMap.put("departureAirportName", airlineInfo.getDepartureAirportName());
				airlineInfoMap.put("arrivalAirportName", airlineInfo.getArrivalAirportName());
				airlineInfoMap.put("activity", activityId);
				airlineInfoMap.put("unit", unitId);
				// stopover
				List<Map<String, Object>> stopoverMaps = new ArrayList<Map<String,Object>>();
				List<StopoverDO> stopovers = airlineInfo.getStopovers();
				if (stopovers != null) {
					for (StopoverDO stopover : stopovers) {
						Map<String, Object> stopoverMap = new HashMap<String, Object>();
						stopoverMap.put("airport", stopover.getAirport());
						stopoverMap.put("airportName", stopover.getAirportName());
						stopoverMap.put("sequence", stopover.getSequence());
						stopoverMaps.add(stopoverMap);
					}
				}
				airlineInfoMap.put("stopovers", stopoverMaps);
				// type
				List<Map<String, Object>> typeMaps = new ArrayList<Map<String,Object>>();
				List<AircraftTypeDO> types = airlineInfo.getTypes();
				if (types != null) {
					for (AircraftTypeDO aircraftType : types) {
						Map<String, Object> aircraftTypeMap = new HashMap<String, Object>();
						aircraftTypeMap.put("type", aircraftType.getType());
						aircraftTypeMap.put("sequence", aircraftType.getSequence());
						typeMaps.add(aircraftTypeMap);
					}
				}
				airlineInfoMap.put("types", typeMaps);
				airlineInfoDao.addAirlineInfo(airlineInfoMap);
			}
			result.add(activityId);
		}
		return result;
	}
	
	public int getStaffReportStatus(String statusStr, String startDateStr, String endDateStr){
		String sql = "select count(*) as cnt " +
	                 "from T_ACTIVITY a " +
				     "join T_ACTIVITY_STATUS s on (a.status_id = s.id) " +
	                 "join T_ACTIVITY_TYPE t on (a.type_id = t.id) " +
	                 "where a.deleted = 0 and s.deleted = 0 and t.deleted = 0 " +
	                 "and s.name = '" + statusStr + "' " +
	                 "and t.name = '员工安全报告' " +
	                 "and a.created >= to_date('" + startDateStr + "', 'yyyy-MM-dd hh24:mi:ss') " +
	                 "and a.created < to_date('" + endDateStr + "', 'yyyy-MM-dd hh24:mi:ss')";
		Session	session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql);
		@SuppressWarnings("unchecked")
		List<BigDecimal> totalCounts = query.list();
		// 总数
		return totalCounts.get(0) == null ? 0 : totalCounts.get(0).intValue();
	}
	
	public int getStaffReportStatusProcessing(String startDateStr, String endDateStr){
		String sql = "select count(*) as cnt " +
	                 "from T_ACTIVITY a " +
				     "join T_ACTIVITY_STATUS s on (a.status_id = s.id) " +
	                 "join T_ACTIVITY_TYPE t on (a.type_id = t.id) " +
	                 "where a.deleted = 0 and s.deleted = 0 and t.deleted = 0 " +
	                 "and s.name not in ('结案', '不适用') " +
	                 "and t.name = '员工安全报告' " +
	                 "and a.created >= to_date('" + startDateStr + "', 'yyyy-MM-dd hh24:mi:ss') " +
	                 "and a.created < to_date('" + endDateStr + "', 'yyyy-MM-dd hh24:mi:ss')";
		Session	session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql);
		@SuppressWarnings("unchecked")
		List<BigDecimal> totalCounts = query.list();
		// 总数
		return totalCounts.get(0) == null ? 0 : totalCounts.get(0).intValue();
	}
	
	@Override
	public void writeUser(Integer id, String[] userIds) {
		ActivityDO ado = this.internalGetById(id);
		Map<String, Object> map = new HashMap<String, Object>();
		
		// 已存在的user
		List<UserDO> existUsers = processorDao.getProcessorUsersByActivity(ado);
		// 要加入的user
		List<UserDO> users = userDao.internalGetByIds(userIds);
		// 合并去重
		Set<UserDO> mergedUses = new HashSet<UserDO>();
		mergedUses.addAll(existUsers);
		mergedUses.addAll(users);
		updateUsersForProcess(ado, mergedUses);
		
		List<Integer> userIdsToSolr = new ArrayList<Integer>();
		for (UserDO user : mergedUses) {
			userIdsToSolr.add(user.getId());
		}
		map.put("processors", userIdsToSolr);
		
		solrService.updateSolrFields("activity", id, map);
	}
	
	@Override
	public void setStatus(Integer id, Integer statusId, Map<String, Object> attributes) {
		ActivityDO ado = this.internalGetById(id);
		// 更新activity的状态
		ActivityStatusDO status = new ActivityStatusDO();
		status.setId(statusId);
		ado.setStatus(status);
		this.internalUpdate(ado);
		
		// 将处理人置空
		List<ProcessorDO> processorList = processorDao.getProcessorsByActivity(ado);
		processorDao.delete(processorList);
		
		// 将状态和处理人更新到solr
		Map<String, Object> m_ado = new HashMap<String, Object>();
		m_ado.put("status", statusId);
		m_ado.put("processors", null);
		
		SolrService ss = (SolrService) SpringBeanUtils.getBean("solr");
		ss.updateSolrFields("activity", id, m_ado);
	}
	
	@Override
	public Set<Integer> getUserByUnitRole(Integer id, Integer roleId) {
		ActivityDO activity = this.internalGetById(id);
		Integer unitId = activity.getUnit().getId();
		List<Integer> unitIds = new ArrayList<Integer>();
		unitIds.add(unitId);
		return unitRoleActorDao.getUserIdsByUnitIdsAndRoleId(roleId, unitIds);
	}
	
	@Override
	public Collection<Integer> getUserByUnitRoles(Integer id, Collection<Integer> roleIds) {
		ActivityDO activity = this.internalGetById(id);
		Integer unitId = activity.getUnit().getId();
		List<Integer> unitIds = new ArrayList<Integer>();
		unitIds.add(unitId);
		return unitRoleActorDao.getUserIdsByUnitIdsAndRoleIds(roleIds, unitIds);
	}
	
	@Override
	public Collection<Integer> getUserByOrganizationRole(Integer id, Integer roleId, String field) {
		// 取出组织的ID
		Integer organizationId = this.getRelatedOrganizationId(id);
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
		Integer organizationId = this.getRelatedOrganizationId(id);
		if (null == organizationId || null == roleIds || roleIds.isEmpty()) {
			return new HashSet<Integer>();
		}
		List<Integer> organizationIds = new ArrayList<Integer>();
		organizationIds.add(organizationId);
		return unitRoleActorDao.getUserIdsByOrganizationIdsAndRoleIds(roleIds, organizationIds);
	}
	
	public Integer getRelatedOrganizationId(Integer id) {
		Integer organizationId = null;
		// 获取自定义字段（所属处室）
		ActivityDO activity = this.internalGetById(id);
		if (null != activity) {
			// 所属处室的key
			String customFieldDeptKey = null;
			ISearchTemplate deptSearchTemplate = null;
			for (com.usky.sms.field.Field field : fieldRegister.getAllFields()) {
				if ("所属处室".equals(field.getName())) {
					customFieldDeptKey = field.getKey();
					deptSearchTemplate = SearchTemplateRegister.getSearchTemplate(fieldRegister.getFieldSearcher(customFieldDeptKey));
					break;
				}
			}
			if (customFieldDeptKey != null && deptSearchTemplate != null) {
				CustomFieldValueDao customFieldValueDao = (CustomFieldValueDao) SpringBeanUtils.getBean("customFieldValueDao");
				List<CustomFieldValueDO> customFieldValues = customFieldValueDao.getByActivityId(id, customFieldDeptKey);
				if (customFieldValues != null) {
					for (CustomFieldValueDO customFieldValue : customFieldValues) {
						if (!customFieldValue.isDeleted() && customFieldDeptKey.equals(customFieldValue.getKey())) {
							Number orgId = (Number) deptSearchTemplate.getValue(customFieldValue);
							if (orgId != null) {
								organizationId = orgId.intValue();
							}
							break;
						}
					}
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
		ActivityDO activity = this.internalGetById(id);
		if (null != activity && userIds != null && !userIds.isEmpty() && sendingModes != null && !sendingModes.isEmpty()) {
			// 标题
			String title = "SMS 安全信息分配";
			// 正文内容
			StringBuffer content = new StringBuffer();
			content.append("您有一条");
			ActivityTypeDO type = activityTypeDao.internalGetById(activity.getType().getId());
			content.append(type.getName());
			content.append("待处理！请登录SMS系统查看！（信息编号：");
			UnitDO unit = unitDao.internalGetById(activity.getUnit().getId());
			content.append(unit.getCode() + "-" + activity.getNum());
			content.append("\t主题：");
			content.append(activity.getSummary());
			content.append("\t当前状态：");
			ActivityStatusDO status = activityStatusDao.internalGetById(activity.getStatus().getId());
			content.append(status.getName());
			content.append("）");

			// 获取ADMIN的id
			UserDO admin = userDao.getByUsername("ADMIN");
			// 接收人
			List<UserDO> users = userDao.getByIds(new ArrayList<Integer>(userIds));
			Collection<EnumMessageCatagory> sendingModeEnums = EnumMessageCatagory.getEnumByVals(sendingModes);
			// 保存
			messageDao.saveTodoMsg(sendingModeEnums, admin, users, title, content.toString(), id, "ACTIVITY");
		}
	}
	
	public String getSummaryById(Integer id) {
		@SuppressWarnings("unchecked")
		List<String> summarys = (List<String>) this.query("select t.summary from ActivityDO t where t.deleted = false and t.id = ?", id);
		return summarys.isEmpty() ? null : summarys.get(0);
	}
	
	public ActivityDO getBasicInfoById(Integer id) {
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> basicInfos = (List<Map<String, Object>>) this.query("select new Map(t.id as id, t.summary as summary) from ActivityDO t where t.deleted = false and t.id = ?", id);
		if (basicInfos.isEmpty()) {
			return null;
		}
		Map<String, Object> basicInfoMap = basicInfos.get(0);
		ActivityDO activity = new ActivityDO();
		activity.setId(id);
		activity.setSummary((String) basicInfoMap.get("summary")); 
		return activity;
	}
	
	/**
	 * 设置安全信息的结案时间
	 * @param id 安全信息的id
	 * @param closeDate 结案的时间
	 */
	public void doSetActivityCloseDate(Integer id, Date closeDate) {
		String closeDateFieldKey = null;
		for (com.usky.sms.field.Field field : fieldRegister.getAllFields()) {
			String fieldName = field.getName();
			if ("结案日期".equals(fieldName)) {
				closeDateFieldKey = field.getKey();
				break;
			}
		}
		if (closeDateFieldKey != null) {
			Map<String, Object> customFieldMap = new HashMap<String, Object>();
			customFieldMap.put(closeDateFieldKey, DateHelper.formatIsoSecond(closeDate));
			this.updateCustomFields(id, customFieldMap);
		}
	}
	
	/**
	 * 设置安全信息是否进入提醒结点
	 * @param id 安全信息的id
	 * @param enter 是否进入提醒结点
	 */
	public void doSetActivityNoticeNode(Integer id, boolean enter) {
		String noticeNodeFieldKey = null;
		for (com.usky.sms.field.Field field : fieldRegister.getAllFields()) {
			String fieldName = field.getName();
			if ("提醒结点".equals(fieldName)) {
				noticeNodeFieldKey = field.getKey();
				break;
			}
		}
		if (noticeNodeFieldKey != null) {
			Map<String, Object> customFieldMap = new HashMap<String, Object>();
			customFieldMap.put(noticeNodeFieldKey, Boolean.toString(enter));
			this.updateCustomFields(id, customFieldMap);
		}
	}
	
	/**
	 * 获取待我处理的安全信息
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> getToDoActivities(Integer userId, String[] typeCodes, boolean typeInclude, Map<String, Object> sort, Integer startNum, Integer endNum) {
		Map<String, Object> result = new HashMap<String, Object>();
		StringBuilder sql = new StringBuilder();
		List<String> params = new ArrayList<String>();
		List<Object> values = new ArrayList<Object>();
		String unitAvatarWebPath = config.getUnitAvatarWebPath() + "/";
		String defaultUnitAvatar = config.getDefaultUnitAvatar();
		sql.append(" select distinct ");
		sql.append("    t.id as \"id\",");
		sql.append("    t.summary as \"summary\",");
		sql.append("    t.num as \"num\",");
		sql.append("    to_char(t.last_update, 'yyyy-mm-dd hh24:mi:ss') as \"lastUpdate\",");
		sql.append("    actType.id as \"type.id\",");
		sql.append("    actType.name as \"type.name\",");
		sql.append("    actType.url as \"type.url\",");
		sql.append("    u.id as \"unit.id\",");
		sql.append("    u.name as \"unit.name\",");
		sql.append("    u.code as \"unit.code\",");
		sql.append("    '" + unitAvatarWebPath + "' || decode (avatar.file_name, null, '" + defaultUnitAvatar + "', avatar.file_name) as \"unit.avatarUrl\",");
		sql.append("    status.id as \"status.id\",");
		sql.append("    status.name as \"status.name\",");
		sql.append("    status.category as \"status.category\",");
		sql.append("    priority.id as \"priority.id\",");
		sql.append("    priority.color as \"priority.color\",");
		sql.append("    priority.name as \"priority.name\",");
		sql.append("    priority.url as \"priority.url\",");
		
		sql.append("    (select distinct 1");
		sql.append("       from t_activity act1, t_activity act2");
		sql.append("      where act1.id not in");
		sql.append("            (select origin.id");
		sql.append("               from t_activity origin");
		sql.append("              inner join t_activity a");
		sql.append("                 on (origin.id = a.origin_activity_id)");
		sql.append("              inner join t_activity_status status");
		sql.append("                 on (a.status_id = status.id)");
		sql.append("              where origin.deleted = 0");
		sql.append("                and a.deleted = 0");
		sql.append("                and status.category <> 'COMPLETE')");
		sql.append("        and act1.id = t.id");
		sql.append("        and act1.id = act2.origin_activity_id) as \"tag\"");
		sql.append("  from t_activity t");
		sql.append(" inner join t_processor p");
		sql.append("    on (t.id = p.activity_id)");
		sql.append(" inner join t_unit u");
		sql.append("    on (t.unit_id = u.id)");
		sql.append(" inner join t_activity_type actType");
		sql.append("    on (t.type_id = actType.id)");
		sql.append(" left join t_activity_priority priority");
		sql.append("    on (t.priority_id = priority.id)");
		sql.append(" inner join t_activity_status status");
		sql.append("    on (t.status_id = status.id)");
		sql.append(" left join t_avatar avatar");
		sql.append("    on (u.avatar_id = avatar.id)");
		sql.append(" where t.deleted = 0");
		sql.append("   and p.deleted = 0 and p.user_id = :userId");
		
		if (typeCodes != null && typeCodes.length > 0) {
			sql.append(" and (actType.code");
			if (typeInclude) {
				sql.append(" in ('" + StringUtils.join(typeCodes, "','") + "')");
			} else {
				sql.append(" not in ('" + StringUtils.join(typeCodes, "','") + "') or actType.code is null");
			}
			sql.append(")");
		}
		
		sql.append(" order by \"tag\" asc");
		
		params.add("userId");
		values.add(userId);
		
		// 排序
		if (null != sort) {
			String value = (String) sort.get("value");
			String key = (String) sort.get("key");
			sql.append(", ");
			sql.append("\"");
			sql.append(key);
			sql.append("\" ");
			sql.append(value);
		}
		
		StringBuilder sqlForTotalCount = new StringBuilder();
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
		
		StringBuilder sqlForContent = new StringBuilder();
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
		List<Map<String, Object>> list = query.setResultTransformer(new ResultTransformer() {

			private static final long serialVersionUID = -5365637015264354085L;

			@Override
			public Object transformTuple(Object[] tuple, String[] aliases) {
				Map<String, Object> result = new HashMap<String, Object>();
				for ( int i = 0; i < tuple.length; i++ ) {
					String alias = aliases[i];
					if (alias != null) {
						this.assembleMap(alias, tuple[i], result);
					}
				}
				return result;
			}

			@SuppressWarnings("rawtypes")
			@Override
			public List transformList(List collection) {
				return collection;
			}
			
			/**
			 * key类似为unit.id, unit.name的数据组装成key为unit,value为map对象({id:11,name:安监部})的数据
			 * @param key 类似unit.id, name等
			 * @param value key对应的值
			 * @param map
			 */
			@SuppressWarnings("rawtypes")
			private void assembleMap(String key, Object value, Map map) {
				String[] keys = StringUtils.split(key, ".", 2);
				if (keys.length == 1) {
					map.put(keys[0], value);
				} else {
					Map newMap = null;
					if (map.containsKey(keys[0]) && map.get(keys[0]) != null && map.get(keys[0]) instanceof Map) {
						newMap = (Map) map.get(keys[0]);
					} else if (value != null) {
						newMap = new HashMap<String, Object>();
						map.put(keys[0], newMap);
					}
					if (newMap != null) {
						assembleMap(keys[1], value, newMap);
					}
				}
			}
			
		}).list();
		result.put("aaData", list);
		return result;
	}
	
	/**
	 * 发送反馈信息
	 * @param id 信息id
	 * @param sendingModes 发送信息的模式
	 */
	@Override
	public void sendFeedbackMsg(Integer id, Collection<String> sendingModes) {
		ActivityDO activity = this.internalGetById(id);
		
		if (sendingModes != null && !sendingModes.isEmpty()) {
			
			// 标题
			String title = "SMS 安全信息反馈";
			// 正文内容
			StringBuffer content = new StringBuffer();
			ActivityTypeDO activityType = activityTypeDao.internalGetById(activity.getType().getId());
			ActivityStatusDO status = activityStatusDao.internalGetById(activity.getStatus().getId());
			if("待分配".equals(status.getName())) {
				content.append("您的");
				content.append(" "+activityType.getName()+" ");
				content.append("已成功提交！（信息编号：");	
			}
			else if ("不适用".equals(status.getName())) {
				content.append("您提交的");
				content.append(" "+activityType.getName()+" ");
				content.append("被审核为不适用！请登录SMS系统查看！（信息编号：");
			}
			else if ("员工安全报告".equals(activityType.getName()) && "结案".equals(status.getName())) {
				content.append("您提交的员工安全报告已结案！请登录SMS系统查看！（信息编号：");
			}
			else if ("信息报告".equals(activityType.getName()) && "结案".equals(status.getName())) {
				content.append("您有一条信息报告待处理！请登录SMS系统查看！（信息编号：");
			}
			UnitDO unit = unitDao.internalGetById(activity.getUnit().getId());
			content.append(unit.getCode() + "-" + activity.getNum());
			content.append("\t主题：");
			content.append(activity.getSummary());
			content.append("\t当前状态：");
			content.append(status.getName());
			content.append("）");
			//************************luobin(start)************************
			if("员工安全报告".equals(activityType.getName()) && "待分配".equals(status.getName())) {
				//仅限员工报告刚上报的时候，需发送中英双语给上报人
				content.append("\r\n");
				content.append("********************");
				content.append("\r\n");
				content.append("【Juneyao Air】Your report has been successfully submitted!(Info-No:");
				content.append(unit.getCode() + "-" + activity.getNum());
				content.append(" Title:");
				content.append(activity.getSummary());
				content.append(" Status:To be distributed)");
			}
			else if ("员工安全报告".equals(activityType.getName()) && "不适用".equals(status.getName())) {
				//仅限员工报告不适用的时候，需发送中英双语给上报人
				content.append("\r\n");
				content.append("********************");
				content.append("\r\n");
				content.append("【Juneyao Air】The report you submitted is not applicable!Please log in to the SMS to see the details!(Info-No:");
				content.append(unit.getCode() + "-" + activity.getNum());
				content.append(" Title:");
				content.append(activity.getSummary());
				content.append(" Status:Inapplicability)");
			}
			else if ("员工安全报告".equals(activityType.getName()) && "结案".equals(status.getName())) {
				//仅限员工报告结案的时候，需发送中英双语给上报人
				content.append("\r\n");
				content.append("********************");
				content.append("\r\n");
				content.append("【Juneyao Air】The report you submitted has already been processed!Please log in to the SMS to see the details!(Info-No:");
				content.append(unit.getCode() + "-" + activity.getNum());
				content.append(" Title:");
				content.append(activity.getSummary());
				content.append(" Status:Processed)");
			}
			//************************luobin(end)************************
			
			// 获取ADMIN的id
			UserDO admin = userDao.getByUsername("ADMIN");
			// 接收人
			List<UserDO> users = new ArrayList<UserDO>(1);
			users.add(activity.getCreator());
			Collection<EnumMessageCatagory> sendingModeEnums = EnumMessageCatagory.getEnumByVals(sendingModes);
			// 保存
			messageDao.saveTodoMsg(sendingModeEnums, admin, users, title, content.toString(), id, "ACTIVITY");
		}
	}
	
	public void setActivityLoggingDao(ActivityLoggingDao activityLoggingDao) {
		this.activityLoggingDao = activityLoggingDao;
	}
	
	public void setActivityPriorityDao(ActivityPriorityDao activityPriorityDao) {
		this.activityPriorityDao = activityPriorityDao;
	}
	
	public void setActivityResolutionDao(ActivityResolutionDao activityResolutionDao) {
		this.activityResolutionDao = activityResolutionDao;
	}
	
	public void setActivitySecurityLevelDao(ActivitySecurityLevelDao activitySecurityLevelDao) {
		this.activitySecurityLevelDao = activitySecurityLevelDao;
	}
	
	public void setActivityStatusDao(ActivityStatusDao activityStatusDao) {
		this.activityStatusDao = activityStatusDao;
	}
	
	public void setActivityTypeDao(ActivityTypeDao activityTypeDao) {
		this.activityTypeDao = activityTypeDao;
	}
	
	public void setFieldRegister(FieldRegister fieldRegister) {
		this.fieldRegister = fieldRegister;
	}
	
	public void setFileDao(FileDao fileDao) {
		this.fileDao = fileDao;
	}
	
	public void setLabelDao(LabelDao labelDao) {
		this.labelDao = labelDao;
	}
	
	public void setMenuCache(MenuCache menuCache) {
		this.menuCache = menuCache;
	}
	
	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}
	
	public void setProcessorDao(ProcessorDao processorDao) {
		this.processorDao = processorDao;
	}
	
	public void setSolrService(SolrService solrService) {
		this.solrService = solrService;
	}
	
	public void setTemUnitDao(TemUnitDao temUnitDao) {
		this.temUnitDao = temUnitDao;
	}
	
	public void setTransactionHelper(TransactionHelper transactionHelper) {
		this.transactionHelper = transactionHelper;
	}
	
	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}
	
	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}
	
	public void setUserHistoryItemDao(UserHistoryItemDao userHistoryItemDao) {
		this.userHistoryItemDao = userHistoryItemDao;
	}
	
	public void setWorkflowSchemeEntityDao(WorkflowSchemeEntityDao workflowSchemeEntityDao) {
		this.workflowSchemeEntityDao = workflowSchemeEntityDao;
	}
	
	/**
	 * @param dictionaryDao the dictionaryDao to set
	 */
	public void setDictionaryDao(DictionaryDao dictionaryDao) {
		this.dictionaryDao = dictionaryDao;
	}
	
	/**
	 * @param flightInfoDao the flightInfoDao to set
	 */
	public void setFlightInfoDao(FlightInfoDao flightInfoDao) {
		this.flightInfoDao = flightInfoDao;
	}
	
	/**
	 * @param consequenceDao the consequenceDao to set
	 */
	public void setConsequenceDao(ConsequenceDao consequenceDao) {
		this.consequenceDao = consequenceDao;
	}
	
	/**
	 * @param config the config to set
	 */
	public void setConfig(Config config) {
		this.config = config;
	}
	
	/**
	 * @param insecurityDao the insecurityDao to set
	 */
	public void setInsecurityDao(InsecurityDao insecurityDao) {
		this.insecurityDao = insecurityDao;
	}
	
	/**
	 * @param threatMappingDao the threatMappingDao to set
	 */
	public void setThreatMappingDao(ThreatMappingDao threatMappingDao) {
		this.threatMappingDao = threatMappingDao;
	}
	
	/**
	 * @param errorMappingDao the errorMappingDao to set
	 */
	public void setErrorMappingDao(ErrorMappingDao errorMappingDao) {
		this.errorMappingDao = errorMappingDao;
	}
	
	/**
	 * @param provisionDao the provisionDao to set
	 */
	public void setProvisionDao(ProvisionDao provisionDao) {
		this.provisionDao = provisionDao;
	}
	
	/**
	 * @param severityDao the severityDao to set
	 */
	public void setSeverityDao(SeverityDao severityDao) {
		this.severityDao = severityDao;
	}
	
	/**
	 * @param accessInformationDao the accessInformationDao to set
	 */
	public void setAccessInformationDao(AccessInformationDao accessInformationDao) {
		this.accessInformationDao = accessInformationDao;
	}
	
	/**
	 * @param flightInfoEntityDao the flightInfoEntityDao to set
	 */
	public void setFlightInfoEntityDao(FlightInfoEntityDao flightInfoEntityDao) {
		this.flightInfoEntityDao = flightInfoEntityDao;
	}
	
	/**
	 * @param temDao the temDao to set
	 */
	public void setTemDao(TemDao temDao) {
		this.temDao = temDao;
	}
	
	/**
	 * @param threatDao the threatDao to set
	 */
	public void setThreatDao(ThreatDao threatDao) {
		this.threatDao = threatDao;
	}
	
	/**
	 * @param errorDao the errorDao to set
	 */
	public void setErrorDao(ErrorDao errorDao) {
		this.errorDao = errorDao;
	}
	
	/**
	 * @param customFieldDao the customFieldDao to set
	 */
	public void setCustomFieldDao(CustomFieldDao customFieldDao) {
		this.customFieldDao = customFieldDao;
	}
	
	public void setUnitRoleActorDao(UnitRoleActorDao unitRoleActorDao) {
		this.unitRoleActorDao = unitRoleActorDao;
	}

	public void setAircraftCommanderReportTempDao(AircraftCommanderReportTempDao aircraftCommanderReportTempDao) {
		this.aircraftCommanderReportTempDao = aircraftCommanderReportTempDao;
	}

	public void setMessageDao(MessageDao messageDao) {
		this.messageDao = messageDao;
	}

	public static void setGson(Gson gson) {
		ActivityDao.gson = gson;
	}

	public void setActivityDistributeConfigDao(ActivityDistributeConfigDao activityDistributeConfigDao) {
		this.activityDistributeConfigDao = activityDistributeConfigDao;
	}

	public void setEventAnalysisDao(EventAnalysisDao eventAnalysisDao) {
		this.eventAnalysisDao = eventAnalysisDao;
	}

	public void setAirlineInfoDao(AirlineInfoDao airlineInfoDao) {
		this.airlineInfoDao = airlineInfoDao;
	}

	public Map<String, List<String>> getDefectTypeList(String startDateStr, String endDateStr){
		String sql = "select d.name as defectTypeName, count(*) as cnt " +
	                 "from T_EVENT_ANALYSIS ea " +
				     "join t_activity a on (ea.activity_id = a.id) " +
	                 "join t_dictionary d on (ea.defect_type = d.id) " +
				     "join t_activity_status s on (a.status_id = s.id) " +
	                 "where ea.deleted = 0 and a.deleted = 0 " +
				     "and a.last_update >= to_date('" + startDateStr + "', 'yyyy-MM-dd hh24:mi:ss') " +
	                 "and a.last_update < to_date('" + endDateStr + "', 'yyyy-MM-dd hh24:mi:ss') " +
				     "and s.name = '结案' " +
	                 "group by d.name " +
				     "order by cnt desc";
		Session	session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql);
		@SuppressWarnings("unchecked")
		List<Object[]> list = query.list();
		
		Map<String, List<String>> map = new HashMap<String, List<String>>();
		List<String> defectTypeNameList = new ArrayList<String>();
		List<String> defectTypeNameValList = new ArrayList<String>();
		for (Object[] o : list) {
			defectTypeNameList.add(o[0].toString());
			defectTypeNameValList.add(o[1].toString());
		}
		map.put("defectTypeNameList", defectTypeNameList);
		map.put("defectTypeNameValList", defectTypeNameValList);
		return map;
	}
	
	public List<Object[]> getDefectTypeAllList(String startDateStr, String endDateStr){
		String sql = "select d.name as defectTypeName " +
	                 "from T_EVENT_ANALYSIS ea " +
				     "join t_activity a on (ea.activity_id = a.id) " +
	                 "join t_dictionary d on (ea.defect_type = d.id) " +
				     "join t_activity_status s on (a.status_id = s.id) " +
	                 "where ea.deleted = 0 and a.deleted = 0 " +
				     "and a.last_update >= to_date('" + startDateStr + "', 'yyyy-MM-dd hh24:mi:ss') " +
	                 "and a.last_update < to_date('" + endDateStr + "', 'yyyy-MM-dd hh24:mi:ss') " +
				     "and s.name = '结案'";
		Session	session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql);
		@SuppressWarnings("unchecked")
		List<Object[]> list = query.list();
		
		return list;
	}
	
	/**
	 * 
	 * @title 增加
	 * @param startDateStr
	 * @param endDateStr
	 * @return
	 */
	public Map<String, List<String>> getMeasureTypeList(String startDateStr, String endDateStr){
		String sql = "select d.name as measureTypeName, count(*) as cnt " +
	                 "from T_EVENT_ANALYSIS ea " +
				     "join t_activity a on (ea.activity_id = a.id) " +
	                 "join t_dictionary d on (ea.measure_type = d.id) " +
				     "join t_activity_status s on (a.status_id = s.id) " +
	                 "where ea.deleted = 0 and a.deleted = 0 " +
	                 "and a.last_update >= to_date('" + startDateStr + "', 'yyyy-MM-dd hh24:mi:ss') " +
	                 "and a.last_update < to_date('" + endDateStr + "', 'yyyy-MM-dd hh24:mi:ss') " +
				     "and s.name = '结案' " +
	                 "group by d.name " +
				     "order by cnt desc";
		Session	session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql);
		@SuppressWarnings("unchecked")
		List<Object[]> list = query.list();
		
		Map<String, List<String>> map = new HashMap<String, List<String>>();
		List<String> measureTypeNameList = new ArrayList<String>();
		List<String> measureTypeNameValList = new ArrayList<String>();
		for (Object[] o : list) {
			measureTypeNameList.add(o[0].toString());
			measureTypeNameValList.add(o[1].toString());
		}
		map.put("measureTypeNameList", measureTypeNameList);
		map.put("measureTypeNameValList", measureTypeNameValList);
		return map;
	}
	
	public List<Object[]> getMeasureTypeAllList(String startDateStr, String endDateStr){
		String sql = "select d.name as measureTypeName " +
	                 "from T_EVENT_ANALYSIS ea " +
				     "join t_activity a on (ea.activity_id = a.id) " +
	                 "join t_dictionary d on (ea.measure_type = d.id) " +
				     "join t_activity_status s on (a.status_id = s.id) " +
	                 "where ea.deleted = 0 and a.deleted = 0 " +
	                 "and a.last_update >= to_date('" + startDateStr + "', 'yyyy-MM-dd hh24:mi:ss') " +
	                 "and a.last_update < to_date('" + endDateStr + "', 'yyyy-MM-dd hh24:mi:ss') " +
				     "and s.name = '结案'";
		Session	session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql);
		@SuppressWarnings("unchecked")
		List<Object[]> list = query.list();
		
		return list;
	}
	
	public Map<String, String> getInfoTypeCntByMonth(String startDateStr, String endDateStr){
		String sql = "select (to_char(trunc(a.created, 'MM'), 'yyyy-MM')|| t.name) as reportKey, count(*) as cnt " +
	                 "from T_ACTIVITY a " +
				     "join T_ACTIVITY_TYPE t on (a.type_id = t.id) " +
	                 "where a.deleted = 0 and t.deleted = 0 " +
				     "and t.name in ('员工安全报告', '机长报告', '持续监控信息', '航空安全信息') " +
	                 "and a.created >= to_date('" + startDateStr + "', 'yyyy-MM-dd hh24:mi:ss') " +
	                 "and a.created < to_date('" + endDateStr + "', 'yyyy-MM-dd hh24:mi:ss') " +
				     "group by trunc(a.created, 'MM'), t.name " +
				     "order by trunc(a.created, 'MM'), t.name";
		Session	session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql);
		@SuppressWarnings("unchecked")
		List<Object[]> list = query.list();
		
		Map<String, String> map = new HashMap<String, String>();
		for (Object[] o : list) {
			map.put(o[0].toString(), o[1].toString());
		}
		
		return map;
	}
	
	public Map<String, String> getStaffRptCntByMonth(String startDateStr, String endDateStr, String unitId, String searchType){
		String sql = "select to_char(trunc(a.created, 'MM'), 'yyyy-MM') as reportKey, count(*) as cnt " +
	                 "from T_ACTIVITY a " +
				     "join T_ACTIVITY_TYPE t on (a.type_id = t.id) " +
				     "join T_USER u on (a.creator_id = u.id) " +
	                 "where a.deleted = 0 and t.deleted = 0 " +
				     "and t.name ='员工安全报告' " +
	                 "and a.created >= to_date('" + startDateStr + "', 'yyyy-MM-dd hh24:mi:ss') " +
	                 "and a.created < to_date('" + endDateStr + "', 'yyyy-MM-dd hh24:mi:ss') ";
		if (!"0".equals(unitId)) {
			sql = sql + "and a.unit_id = '" + unitId + "' ";
		}
		if ("NiMing".equals(searchType)) {
			sql = sql + "and u.username = 'ANONYMITY' ";
		} else {
			sql = sql + "and u.username <> 'ANONYMITY' ";
		}
		sql = sql + "group by trunc(a.created, 'MM'), t.name " +
				    "order by trunc(a.created, 'MM'), t.name";
		Session	session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql);
		@SuppressWarnings("unchecked")
		List<Object[]> list = query.list();
		
		Map<String, String> map = new HashMap<String, String>();
		for (Object[] o : list) {
			map.put(o[0].toString(), o[1].toString());
		}
		
		return map;
	}
	
	
	public Map<String, String> getStaffRptCntByDept(String startDateStr, String endDateStr){
		String sql = "select u.name, count(*) as cnt " +
	                 "from T_ACTIVITY a " +
				     "join T_ACTIVITY_TYPE t on (a.type_id = t.id) " +
				     "join T_UNIT u on (a.unit_id = u.id) " +
	                 "where a.deleted = 0 and t.deleted = 0 and u.deleted = 0 " +
				     "and t.name ='员工安全报告' " +
	                 "and a.created >= to_date('" + startDateStr + "', 'yyyy-MM-dd hh24:mi:ss') " +
	                 "and a.created < to_date('" + endDateStr + "', 'yyyy-MM-dd hh24:mi:ss') " +
				     "group by a.unit_id, u.name " +
				     "order by cnt desc, a.unit_id";
		Session	session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql);
		@SuppressWarnings("unchecked")
		List<Object[]> list = query.list();
		
		Map<String, String> map = new HashMap<String, String>();
		for (Object[] o : list) {
			map.put(o[0].toString(), o[1].toString());
		}
		
		return map;
	}
	
	public Map<String, String> getInfoTypeCntByDay(String startDateStr, String endDateStr){
		String sql = "select (to_char(trunc(a.created), 'yyyy-MM-dd')|| t.name) as reportKey, count(*) as cnt " +
	                 "from T_ACTIVITY a " +
				     "join T_ACTIVITY_TYPE t on (a.type_id = t.id) " +
	                 "where a.deleted = 0 and t.deleted = 0 " +
				     "and t.name in ('员工安全报告', '机长报告', '持续监控信息', '航空安全信息') " +
	                 "and a.created >= to_date('" + startDateStr + "', 'yyyy-MM-dd hh24:mi:ss') " +
	                 "and a.created < to_date('" + endDateStr + "', 'yyyy-MM-dd hh24:mi:ss') " +
				     "group by trunc(a.created), t.name " +
				     "order by trunc(a.created), t.name";
		Session	session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql);
		@SuppressWarnings("unchecked")
		List<Object[]> list = query.list();
		
		Map<String, String> map = new HashMap<String, String>();
		for (Object[] o : list) {
			map.put(o[0].toString(), o[1].toString());
		}
		
		return map;
	}
	
	
	public Map<String, String> getStaffRptCntByDay(String startDateStr, String endDateStr, String unitId, String searchType){
		String sql = "select to_char(trunc(a.created), 'yyyy-MM-dd') as reportKey, count(*) as cnt " +
	                 "from T_ACTIVITY a " +
				     "join T_ACTIVITY_TYPE t on (a.type_id = t.id) " +
				     "join T_USER u on (a.creator_id = u.id) " +
	                 "where a.deleted = 0 and t.deleted = 0 " +
				     "and t.name ='员工安全报告' " +
	                 "and a.created >= to_date('" + startDateStr + "', 'yyyy-MM-dd hh24:mi:ss') " +
	                 "and a.created < to_date('" + endDateStr + "', 'yyyy-MM-dd hh24:mi:ss') ";
		if (!"0".equals(unitId)) {
			sql = sql + "and a.unit_id = '" + unitId + "' ";
		}
		if ("NiMing".equals(searchType)) {
			sql = sql + "and u.username = 'ANONYMITY' ";
		} else {
			sql = sql + "and u.username <> 'ANONYMITY' ";
		}
		sql = sql + "group by trunc(a.created), t.name " +
				    "order by trunc(a.created), t.name";
		Session	session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql);
		@SuppressWarnings("unchecked")
		List<Object[]> list = query.list();
		
		Map<String, String> map = new HashMap<String, String>();
		for (Object[] o : list) {
			map.put(o[0].toString(), o[1].toString());
		}
		
		return map;
	}
	/***
	 * 新增员工报告看板报表
	 * @param endDateStr
	 * @param type
	 * @return
	 */
	public List<Object[]> getInfoRptOverdueNotAnjian(String endDateStr, String type){
		String sql = "select u.name as deptName, count(*) as cnt " +
	                 "from T_ACTIVITY a " +
				     "join T_ACTIVITY_TYPE t on (a.type_id = t.id) " +
				     "join T_ACTIVITY_STATUS s on (a.status_id = s.id) " +
				     "join T_UNIT u on (a.unit_id = u.id) " +
	                 "where a.deleted = 0 and t.deleted = 0 and u.deleted = 0 and s.deleted = 0 " +
				     "and t.name = '信息报告' ";
		if ("Anjian".equals(type)) {
			sql = sql + "and u.name = '安监部' ";
		} else {
			sql = sql + "and u.name != '安监部' ";
		}
		sql = sql + "and s.name not in ('不适用', '结案', '信息判断') " +
	                "and a.created < to_date(to_char(to_date('" + endDateStr + "', 'yyyy-MM-dd') - 12, 'yyyy-MM-dd') || ' 00:00:00', 'yyyy-MM-dd hh24:mi:ss') " +
	                "group by a.unit_id, u.name " +
	                "order by cnt asc, a.unit_id";
		Session	session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql);
		@SuppressWarnings("unchecked")
		List<Object[]> list = query.list();
		
		return list;
	}
	
	public List<Object[]> getInfoRptOverdueAnjian(String endDateStr){
		String sql = "select '安监部' as deptName, count(*) as cnt " +
	                 "from T_ACTIVITY a " +
				     "join T_ACTIVITY_TYPE t on (a.type_id = t.id) " +
				     "join T_ACTIVITY_STATUS s on (a.status_id = s.id) " +
	                 "where a.deleted = 0 and t.deleted = 0 and s.deleted = 0 " +
				     "and t.name = '信息报告' " +
	                 "and s.name = '信息判断' " +
	                 "and a.created < to_date(to_char(to_date('" + endDateStr + "', 'yyyy-MM-dd') - 12, 'yyyy-MM-dd') || ' 00:00:00', 'yyyy-MM-dd hh24:mi:ss')";
		Session	session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql);
		@SuppressWarnings("unchecked")
		List<Object[]> list = query.list();
		
		return list;
	}
	
	public List<Object[]> getStaffRptOverdueCnt(String endDateStr){
		String sql = "select '安监部' as deptName, count(*) as cnt " +
	                 "from T_ACTIVITY a " +
				     "join T_ACTIVITY_TYPE t on (a.type_id = t.id) " +
				     "join T_ACTIVITY_STATUS s on (a.status_id = s.id) " +
	                 "where a.deleted = 0 and t.deleted = 0 and s.deleted = 0 " +
				     "and t.name = '员工安全报告' " +
	                 "and s.name = '待分配' " +
	                 "and a.created < to_date(to_char(to_date('" + endDateStr + "', 'yyyy-MM-dd') - 2, 'yyyy-MM-dd') || ' 00:00:00', 'yyyy-MM-dd hh24:mi:ss')";
		Session	session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql);
		@SuppressWarnings("unchecked")
		List<Object[]> list = query.list();
		
		return list;
	}
	
	public List<Object[]> getInfoRptOverdueDist(String endDateStr){
		String sql = "select s.name as statusName, count(*) as cnt " +
	                 "from T_ACTIVITY a " +
				     "join T_ACTIVITY_TYPE t on (a.type_id = t.id) " +
				     "join T_ACTIVITY_STATUS s on (a.status_id = s.id) " +
	                 "where a.deleted = 0 and t.deleted = 0 and s.deleted = 0 " +
				     "and t.name = '信息报告' " +
	                 "and s.name not in ('不适用','结案') " +
	                 "and a.created < to_date(to_char(to_date('" + endDateStr + "', 'yyyy-MM-dd') - 12, 'yyyy-MM-dd') || ' 00:00:00', 'yyyy-MM-dd hh24:mi:ss') " +
				     "group by a.status_id, s.name " +
				     "order by cnt desc, a.status_id";
		Session	session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql);
		@SuppressWarnings("unchecked")
		List<Object[]> list = query.list();
		
		return list;
	}
	
	public List<Object[]> getActionItemOverdue(String endDateStr){
		String sql = "select u.name as deptName, count(*) as cnt " +
	                 "from t_action_item t " +
				     "join t_aitem_organization tao on (t.id = tao.aitem_id) " +
				     "join t_organization tor on (tao.organization_id = tor.id) " +
				     "join t_unit u on (tor.\"unit\" = u.id) " +
				     "where t.completion_dead_line < to_date(to_char(to_date('" + endDateStr + "', 'yyyy-MM-dd') + 1, 'yyyy-MM-dd') || ' 00:00:00', 'yyyy-MM-dd hh24:mi:ss') " +
	                 "and t.deleted = 0 and tor.deleted = 0 and u.deleted = 0 " +
				     "and t.status <> '草稿' " +
	                 "and t.completion_date is null " +
	                 "and t.id in (select a.action_item_id from A_ACTION_ITEM_ACTIVITY a) " +
				     "group by u.name " +
				     "order by cnt";
		Session	session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql);
		@SuppressWarnings("unchecked")
		List<Object[]> list = query.list();
		
		return list;
	}
	
	public Map<String, String> getAllRptCntByDept(String startDateStr, String endDateStr){
		String sql = "select u.name, count(*) as cnt " +
	                 "from T_ACTIVITY a " +
				     "join T_ACTIVITY_TYPE t on (a.type_id = t.id) " +
				     "join T_UNIT u on (a.unit_id = u.id) " +
	                 "where a.deleted = 0 and t.deleted = 0 and u.deleted = 0 " +
				     "and t.name in ('员工安全报告', '机长报告', '持续监控信息', '航空安全信息') " +
	                 "and a.created >= to_date('" + startDateStr + "', 'yyyy-MM-dd hh24:mi:ss') " +
	                 "and a.created < to_date('" + endDateStr + "', 'yyyy-MM-dd hh24:mi:ss') " +
				     "group by a.unit_id, u.name " +
				     "order by cnt desc, a.unit_id";
		Session	session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql);
		@SuppressWarnings("unchecked")
		List<Object[]> list = query.list();
		
		Map<String, String> map = new HashMap<String, String>();
		for (Object[] o : list) {
			map.put(o[0].toString(), o[1].toString());
		}
		
		return map;
	}

	public void setOrganizationDao(OrganizationDao organizationDao) {
		this.organizationDao = organizationDao;
	}
	
	/******************************luobin added**********************************/
	public int getCaptainReportCnt(String flightId){
		String sql = "select count(*) as cnt from T_FLIGHT_INFO_ENTITY tf " +
	                 "left join T_ACTIVITY ta on tf.activity_id = ta.id " +
				     "left join T_ACTIVITY_TYPE tt on ta.type_id = tt.id " +
	                 "join yxw_tb_flightmovementinfo fm on tf.flight_info = fm.id " +
	                 "where fm.flightInfoID = '" + flightId + "' and tt.name='机长报告'";
		Session	session = this.getHibernateTemplate().getSessionFactory().getCurrentSession();
		SQLQuery query = session.createSQLQuery(sql);
		@SuppressWarnings("unchecked")
		List<BigDecimal> totalCounts = query.list();
		// 总数
		return totalCounts.get(0) == null ? 0 : totalCounts.get(0).intValue();
	}
	/******************************luobin added**********************************/
}


