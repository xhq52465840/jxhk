
package com.usky.sms.activity;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.URLDecoder;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.jasperreports.engine.JRDataSource;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import net.sf.jasperreports.engine.util.JRLoader;

import org.apache.commons.fileupload.FileItem;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.reflect.TypeToken;
import com.usky.comm.Utility;
import com.usky.sms.accessinformation.AccessInformationActivityTypeEntityDao;
import com.usky.sms.accessinformation.AccessInformationDao;
import com.usky.sms.accessinformation.FlightInfoEntityDao;
import com.usky.sms.accessinformation.GroundPositionEntityDao;
import com.usky.sms.accessinformation.GroundStaffEntityDao;
import com.usky.sms.accessinformation.MaintainToolEntityDao;
import com.usky.sms.accessinformation.OrganizationEntityDao;
import com.usky.sms.accessinformation.VehicleInfoEntityDao;
import com.usky.sms.activity.action.ActionDao;
import com.usky.sms.activity.aircraftcommanderreport.AircraftCommanderReportTempDO;
import com.usky.sms.activity.aircraftcommanderreport.AircraftCommanderReportTempDao;
import com.usky.sms.activity.attribute.ActivityPriorityDO;
import com.usky.sms.activity.attribute.ActivityPriorityDao;
import com.usky.sms.activity.attribute.ActivityStatusCategory;
import com.usky.sms.activity.attribute.ActivityStatusDao;
import com.usky.sms.activity.distribute.ActivityDistributeConfigDO;
import com.usky.sms.activity.distribute.ActivityDistributeConfigDao;
import com.usky.sms.activity.security.ActivitySecurityLevelDO;
import com.usky.sms.activity.security.ActivitySecurityLevelDao;
import com.usky.sms.activity.security.ActivitySecurityLevelEntityDO;
import com.usky.sms.activity.security.ActivitySecurityLevelEntityDao;
import com.usky.sms.activity.security.ActivitySecuritySchemeDO;
import com.usky.sms.activity.security.ActivitySecuritySchemeDao;
import com.usky.sms.activity.type.ActivityTypeDO;
import com.usky.sms.activity.type.ActivityTypeDao;
import com.usky.sms.activity.type.ActivityTypeSchemeDO;
import com.usky.sms.activity.type.ActivityTypeSchemeDao;
import com.usky.sms.activity.type.ActivityTypeSchemeMappingDO;
import com.usky.sms.activity.type.ActivityTypeSchemeMappingDao;
import com.usky.sms.activity.type.EnumActivityType;
import com.usky.sms.avatar.AvatarDO;
import com.usky.sms.common.DateHelper;
import com.usky.sms.common.JasperHelper;
import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.config.Config;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.core.TransactionHelper;
import com.usky.sms.custom.CustomFieldConfigSchemeDO;
import com.usky.sms.custom.CustomFieldConfigSchemeDao;
import com.usky.sms.custom.CustomFieldValueDO;
import com.usky.sms.custom.CustomFieldValueDao;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.eventanalysis.EventAnalysisActivityTypeEntityDao;
import com.usky.sms.eventanalysis.EventAnalysisDO;
import com.usky.sms.eventanalysis.EventAnalysisDao;
import com.usky.sms.field.FieldLayoutItemDO;
import com.usky.sms.field.FieldLayoutItemDao;
import com.usky.sms.field.FieldLayoutSchemeEntityDO;
import com.usky.sms.field.FieldRegister;
import com.usky.sms.field.screen.FieldScreenDao;
import com.usky.sms.field.screen.FieldScreenLayoutItemDO;
import com.usky.sms.field.screen.FieldScreenLayoutItemDao;
import com.usky.sms.field.screen.FieldScreenTabDO;
import com.usky.sms.field.screen.FieldScreenTabDao;
import com.usky.sms.file.EnumFileType;
import com.usky.sms.file.ExcelUtil;
import com.usky.sms.file.FileDao;
import com.usky.sms.file.FileService;
import com.usky.sms.flightmovementinfo.FlightCrewMemberDao;
import com.usky.sms.flightmovementinfo.FlightCrewScheduleInfoDao;
import com.usky.sms.flightmovementinfo.FlightInfoDO;
import com.usky.sms.flightmovementinfo.FlightInfoDao;
import com.usky.sms.label.LabelDao;
import com.usky.sms.organization.OrganizationDO;
import com.usky.sms.organization.OrganizationDao;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.processor.ProcessorDao;
import com.usky.sms.rewards.RewardsActivityTypeEntityDao;
import com.usky.sms.rewards.RewardsDao;
import com.usky.sms.risk.RiskTaskActivityTypeEntityDao;
import com.usky.sms.risk.RiskTaskDao;
import com.usky.sms.risk.airline.AirlineInfoActivityTypeEntityDao;
import com.usky.sms.risk.airline.AirlineInfoDao;
import com.usky.sms.risk.systemanalysis.SystemAnalysisActivityTypeEntityDao;
import com.usky.sms.risk.systemanalysis.SystemAnalysisMappingDao;
import com.usky.sms.risk.systemanalysis.SystemAnalysisRiskAnalysisActivityTypeEntityDao;
import com.usky.sms.risk.systemanalysis.SystemAnalysisRiskAnalysisConclusionDao;
import com.usky.sms.risk.systemanalysis.SystemAnalysisRiskAnalysisDao;
import com.usky.sms.risk.systemanalysis.residualderivativerisk.ResidualDerivativeRiskDao;
import com.usky.sms.role.RoleDO;
import com.usky.sms.search.template.ISearchTemplate;
import com.usky.sms.search.template.SearchTemplateRegister;
import com.usky.sms.service.QueryService;
import com.usky.sms.solr.SolrService;
import com.usky.sms.sync.SynchronizeService;
import com.usky.sms.tem.TemActivityTypeEntityDao;
import com.usky.sms.tem.TemDO;
import com.usky.sms.tem.TemDao;
import com.usky.sms.unit.UnitConfigDO;
import com.usky.sms.unit.UnitConfigDao;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.unit.UnitRoleActorDao;
import com.usky.sms.user.UserAssociationDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;
import com.usky.sms.user.UserHistoryItemDO;
import com.usky.sms.user.UserHistoryItemDao;
import com.usky.sms.user.UserService;
import com.usky.sms.user.UserType;
import com.usky.sms.uwf.WfSetup;

public class ActivityService extends AbstractService {
	
	private static final Logger log = Logger.getLogger(ActivityService.class);
	
//	public static final SMSException NO_UNIT = new SMSException(MessageCodeConstant.MSG_CODE_109000004);
	
//	public static final SMSException NO_ACTIVITY_TYPE = new SMSException(MessageCodeConstant.MSG_CODE_112000004);
	
	/** 导出文件名称 */
	public static final String DOWNLOAD_FILE_NAME = "安全信息.pdf";
	
	/** 报表模板文件目录 */
	public static final String FILE_PATH = "/uui/com/sms/export_template/activity/";
	
	/** 报表模板文件路径 */
	public static final String ACTIVITY_REPORT_TEMPLATE_FILE_PATH = FILE_PATH + "activity_report.jasper";
	
	private Config config;
	
	@Autowired
	private AccessInformationActivityTypeEntityDao accessInformationActivityTypeEntityDao;
	
	@Autowired
	private AccessInformationDao accessInformationDao;
	
	@Autowired
	private ActionDao actionDao;
	
	@Autowired
	private ActivityDao activityDao;
	
	@Autowired
	private ActivityPriorityDao activityPriorityDao;
	
	@Autowired
	private ActivitySecurityLevelDao activitySecurityLevelDao;
	
	@Autowired
	private ActivitySecurityLevelEntityDao activitySecurityLevelEntityDao;
	
	@Autowired
	private ActivitySecuritySchemeDao activitySecuritySchemeDao;
	
	@Autowired
	private ActivityTypeDao activityTypeDao;
	
	@Autowired
	private ActivityTypeSchemeDao activityTypeSchemeDao;
	
	@Autowired
	private ActivityTypeSchemeMappingDao activityTypeSchemeMappingDao;
	
	@Autowired
	private AirlineInfoActivityTypeEntityDao airlineInfoActivityTypeEntityDao;
	
	@Autowired
	private AirlineInfoDao airlineInfoDao;
	
	@Autowired
	private CustomFieldConfigSchemeDao customFieldConfigSchemeDao;
	
	@Autowired
	private CustomFieldValueDao customFieldValueDao;
	
	@Autowired
	private FieldLayoutItemDao fieldLayoutItemDao;
	
	@Autowired
	private FieldRegister fieldRegister;
	
	@Autowired
	private FieldScreenDao fieldScreenDao;
	
	@Autowired
	private FieldScreenTabDao fieldScreenTabDao;
	
	@Autowired
	private FieldScreenLayoutItemDao fieldScreenLayoutItemDao;
	
	@Autowired
	private FileDao fileDao;
	
	@Autowired
	private FlightInfoEntityDao flightInfoEntityDao;
	
	@Autowired
	private GroundPositionEntityDao groundPositionEntityDao;
	
	@Autowired
	private GroundStaffEntityDao groundStaffEntityDao;
	
	@Autowired
	private LabelDao labelDao;
	
	@Autowired
	private MaintainToolEntityDao maintainToolEntityDao;
	
	@Autowired
	private OrganizationEntityDao organizationEntityDao;
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	
	@Autowired
	private RiskTaskActivityTypeEntityDao riskTaskActivityTypeEntityDao;
	
	@Autowired
	private RiskTaskDao riskTaskDao;
	
	@Autowired
	private TemActivityTypeEntityDao temActivityTypeEntityDao;
	
	@Autowired
	private TemDao temDao;
	
	@Autowired
	private TransactionHelper transactionHelper;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private UnitConfigDao unitConfigDao;
	
	@Autowired
	private UserAssociationDao userAssociationDao;
	
	@Autowired
	private UserDao userDao;
	
	@Autowired
	private UserHistoryItemDao userHistoryItemDao;
	
	@Autowired
	private UserService userService;
	
	@Autowired
	private VehicleInfoEntityDao vehicleInfoEntityDao;
	
	@Autowired
	private OrganizationDao organizationDao;
	
	@Autowired
	private FileService fileService;
	
	@Autowired
	private ActivityStatusDao activityStatusDao;
	
	@Autowired
	private SolrService solrService;
	
	@Autowired
	private QueryService queryService;
	
	@Autowired
	private DictionaryDao dictionaryDao;
	
	@Autowired
	private FlightCrewScheduleInfoDao flightCrewScheduleInfoDao;
	
	@Autowired
	private FlightCrewMemberDao flightCrewMemberDao;
	
	@Autowired
	private AircraftCommanderReportTempDao aircraftCommanderReportTempDao;
	
	@Autowired
	private RewardsActivityTypeEntityDao rewardsActivityTypeEntityDao;
	
	@Autowired
	private RewardsDao rewardsDao;
	
	@Autowired
	private FlightInfoDao flightInfoDao;
	
	@Autowired
	private EventAnalysisDao eventAnalysisDao;
	
	@Autowired
	private EventAnalysisActivityTypeEntityDao eventAnalysisActivityTypeEntityDao;
	
	@Autowired
	private ActivityDistributeConfigDao activityDistributeConfigDao;
	
	@Autowired
	private SystemAnalysisRiskAnalysisActivityTypeEntityDao systemAnalysisRiskAnalysisActivityTypeEntityDao;
	
	@Autowired
	private SystemAnalysisActivityTypeEntityDao systemAnalysisActivityTypeEntityDao;
	
	@Autowired
	private SystemAnalysisMappingDao systemAnalysisMappingDao;
	
	@Autowired
	private ResidualDerivativeRiskDao residualDerivativeRiskDao;
	
	@Autowired
	private SystemAnalysisRiskAnalysisDao systemAnalysisRiskAnalysisDao;
	
	@Autowired
	private SystemAnalysisRiskAnalysisConclusionDao systemAnalysisRiskAnalysisConclusionDao;
	
	@Autowired
	private ProcessorDao processorDao;
	
	@Autowired
	private SynchronizeService synchronizeService;
	
	@Autowired
	private UnitRoleActorDao unitRoleActorDao;

	private ImportProgress importProgress;
	
	public ActivityService() {
		super();
		this.config = Config.getInstance();
	}
	
	public void copyActivitySecurityScheme(HttpServletRequest request, HttpServletResponse response) {
		try {
			Integer id = Integer.parseInt(request.getParameter("activitySecurityScheme"));
			String name = request.getParameter("name");
			String description = request.getParameter("description");
			activitySecuritySchemeDao.copy(id, name, description);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void transform(HttpServletRequest request, HttpServletResponse response) {
		try {
			int activityId = Integer.parseInt(request.getParameter("dataobjectid"));
			Map<String, Object> objMap = gson.fromJson(request.getParameter("obj"), new TypeToken<Map<String, Object>>() {}.getType());
			activityDao.transform(activityId, objMap);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getActivityCreatingConfig(HttpServletRequest request, HttpServletResponse response) {
		try {
			String unit = request.getParameter("unit");
			String type = request.getParameter("type");
			Map<String, Object> data;
			if (unit == null || type == null) {
				data = getScreenData(ActivityOperation.CREATE);
			} else {
				data = getScreenData(unit, type, ActivityOperation.CREATE);
			}
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getActivityCreatingType(HttpServletRequest request, HttpServletResponse response) {
		try {
			int unitId = Integer.parseInt(request.getParameter("unit"));
			List<ActivityTypeDO> types = activityTypeDao.getByUnitId(unitId);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", activityTypeDao.convert(types));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getActivityCreatingUnit(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<UserHistoryItemDO> items = userHistoryItemDao.getRecentUnits(PermissionSets.CREATE_ACTIVITY.getName());
			List<UnitDO> units = unitDao.getUnits(PermissionSets.CREATE_ACTIVITY.getName());
			List<UnitDO> recentUnits = new ArrayList<UnitDO>();
			for (UserHistoryItemDO item : items) {
				for (UnitDO unit : units) {
					if (item.getEntityId().equals(unit.getId().toString())) {
						recentUnits.add(unit);
						break;
					}
				}
			}
			Map<String, Object> data = new HashMap<String, Object>();
			data.put("recentUnits", unitDao.convert(recentUnits, false));
			data.put("units", unitDao.convert(units, false));
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getActivityOperation(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<Map<String, Object>> operations = new ArrayList<Map<String, Object>>();
			for (ActivityOperation operation : ActivityOperation.values()) {
				Map<String, Object> operationMap = new HashMap<String, Object>();
				operationMap.put("key", operation.name());
				operationMap.put("name", operation.getName());
				operations.add(operationMap);
			}
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(operations, request));
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getActivitySecurityLevels(HttpServletRequest request, HttpServletResponse response) {
		try {
			boolean manage = Boolean.parseBoolean(request.getParameter("manage"));
			Integer unitId = null;
			Integer schemeId;
			UnitConfigDO config = null;
			ActivitySecuritySchemeDO scheme;
			if (manage) {
				schemeId = Integer.parseInt(request.getParameter("scheme"));
				scheme = activitySecuritySchemeDao.internalGetById(schemeId);
			} else {
				unitId = Integer.parseInt(request.getParameter("unit"));
				config = unitConfigDao.getByUnitId(unitId);
				scheme = config.getActivitySecurityScheme();
				schemeId = scheme == null ? null : scheme.getId();
			}
			Map<String, Object> data = new HashMap<String, Object>();
			if (scheme != null) {
				List<Map<String, Object>> levelMaps = activitySecurityLevelDao.convert(activitySecurityLevelDao.getByActivitySecuritySchemeId(schemeId));
				List<ActivitySecurityLevelEntityDO> entities = activitySecurityLevelEntityDao.getList();
				Map<Integer, List<Map<String, Object>>> idMap = new HashMap<Integer, List<Map<String, Object>>>();
				for (ActivitySecurityLevelEntityDO entity : entities) {
					Integer id = entity.getLevel().getId();
					List<Map<String, Object>> idList = idMap.get(id);
					if (idList == null) {
						idList = new ArrayList<Map<String, Object>>();
						idMap.put(id, idList);
					}
					Map<String, Object> map = new HashMap<String, Object>();
					UserType type = UserType.valueOf(entity.getType());
					map.put("id", entity.getId());
					map.put("type", type.getName());
					String parameter = entity.getParameter();
					if (parameter != null && parameter.trim().length() > 0) {
						map.put("parameter", userService.getUserTypeValueName(type, parameter));
					}
					idList.add(map);
				}
				ActivitySecurityLevelDO defaultLevel = scheme.getDefaultLevel();
				for (Map<String, Object> levelMap : levelMaps) {
					levelMap.put("entities", idMap.get(levelMap.get("id")));
					if (defaultLevel != null && ((Integer) levelMap.get("id")).intValue() == defaultLevel.getId()) levelMap.put("default", true);
				}
				List<UnitDO> units = unitDao.getByActivitySecuritySchemeId(schemeId);
				List<Map<String, Object>> unitMaps = new ArrayList<Map<String, Object>>();
				for (UnitDO unit : units) {
					Map<String, Object> unitMap = new HashMap<String, Object>();
					unitMap.put("id", unit.getId());
					unitMap.put("name", unit.getName());
					unitMap.put("code", unit.getCode());
					if (unit.getAvatar() == null) {
						unitMap.put("avatar", this.config.getUnitAvatarWebPath() + "/" + this.config.getDefaultUnitAvatar());
					} else {
						unitMap.put("avatar", this.config.getUnitAvatarWebPath() + "/" + unit.getAvatar().getFileName());
					}
					unitMaps.add(unitMap);
				}
				data.put("id", schemeId);
				data.put("name", scheme.getName());
				data.put("levels", PageHelper.getPagedResult(levelMaps, request));
				data.put("units", unitMaps);
			}
			if (!manage) {
				if (scheme == null) {
					data.put("action", new String[] { "选择一个方案" });
				} else if (permissionSetDao.hasPermission(PermissionSets.ADMIN.getName())) {
					data.put("action", new String[] { "编辑信息安全方案", "使用不同的方案" });
				} else {
					data.put("action", new String[] { "使用不同的方案" });
				}
				data.put("config", config.getId());
			}
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getActivityStatusCategory(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<Map<String, String>> categories = new ArrayList<Map<String, String>>();
			for (ActivityStatusCategory category : ActivityStatusCategory.values()) {
				Map<String, String> map = new HashMap<String, String>();
				map.put("key", category.name());
				map.put("name", category.getName());
				categories.add(map);
			}
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(categories, request));
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getActivityTransformConfig(HttpServletRequest request, HttpServletResponse response) {
		try {
			int activityId = Integer.parseInt(request.getParameter("activity"));
			int typeId = Integer.parseInt(request.getParameter("type"));
			Map<String, Object> data = getScreenData(activityDao.internalGetById(activityId).getUnit().getId(), typeId, ActivityOperation.CREATE);
			setFieldValues(data, activityId);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getActivityTransformType(HttpServletRequest request, HttpServletResponse response) {
		try {
			int activityId = Integer.parseInt(request.getParameter("activity"));
			List<ActivityTypeDO> types = activityTypeDao.getByActivityId(activityId);
			ActivityDO activity = activityDao.internalGetById(activityId);
			for (ActivityTypeDO type : types) {
				if (activity.getType().getId().equals(type.getId())) {
					types.remove(type);
					break;
				}
			}
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", activityTypeDao.convert(types));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getActivityTypeSchemeSelectionForUnit(HttpServletRequest request, HttpServletResponse response) {
		try {
			int unitId = Integer.parseInt(request.getParameter("unit"));
			List<ActivityTypeSchemeDO> schemes = activityTypeSchemeDao.getAllList();
			List<ActivityTypeSchemeMappingDO> mappings = activityTypeSchemeMappingDao.getAllList();
			List<UnitConfigDO> configs = unitConfigDao.getAllList();
			List<Map<String, Object>> schemeMaps = new ArrayList<Map<String, Object>>();
			Map<Integer, Map<String, Object>> idSchemeMap = new HashMap<Integer, Map<String, Object>>();
			for (ActivityTypeSchemeDO scheme : schemes) {
				Map<String, Object> schemeMap = activityTypeSchemeDao.convert(scheme);
				schemeMaps.add(schemeMap);
				idSchemeMap.put(scheme.getId(), schemeMap);
			}
			for (ActivityTypeSchemeMappingDO mapping : mappings) {
				Map<String, Object> schemeMap = idSchemeMap.get(mapping.getScheme().getId());
				@SuppressWarnings("unchecked")
				List<Map<String, Object>> typeMaps = (List<Map<String, Object>>) schemeMap.get("types");
				if (typeMaps == null) {
					typeMaps = new ArrayList<Map<String, Object>>();
					schemeMap.put("types", typeMaps);
				}
				typeMaps.add(activityTypeDao.convert(mapping.getType()));
			}
			List<Map<String, Object>> unitMaps = new ArrayList<Map<String, Object>>();
			for (UnitConfigDO config : configs) {
				if (unitId == config.getUnit().getId()) continue;
				Map<String, Object> unitMap = unitDao.convert(config.getUnit());
				unitMap.put("scheme", idSchemeMap.get(config.getActivityTypeScheme().getId()));
				unitMaps.add(unitMap);
			}
			Map<String, Object> data = new HashMap<String, Object>();
			data.put("schemes", schemeMaps);
			data.put("units", unitMaps);
			data.put("types", activityTypeDao.convert(activityTypeDao.getAllList()));
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getActivityEditingConfig(HttpServletRequest request, HttpServletResponse response) {
		try {
			int activityId = Integer.parseInt(request.getParameter("activity"));
			Map<String, Object> data = getScreenData(activityId, ActivityOperation.MODIFY);
			setFieldValues(data, activityId);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getActivityViewConfig(HttpServletRequest request, HttpServletResponse response) {
		try {
			int activityId = Integer.parseInt(request.getParameter("activity"));
			ActivityDO activity = activityDao.internalGetById(activityId);
			List<String> permissions = permissionSetDao.getActivityPermissions(activity.getId(), activity.getUnit().getId());
			//			activityDao.checkPermission(activity.getId(), activity.getUnit().getId(), PermissionSets.VIEW_ACTIVITY);
			activityDao.checkPermission(permissions, PermissionSets.VIEW_ACTIVITY);
			
			Map<String, Object> data = new HashMap<String, Object>();
			data.put("actions", getActions(activity));
			data.put("operations", getOperations(activity, permissions));
			data.put("more", getMore());
			data.put("left", getLeft(activity, permissions));
			data.put("right", getRight(activity));
			data.put("statusCategory", activity.getStatus().getCategory());
			data.put("release", activity.isRelease());
			
			userHistoryItemDao.record("Activity", String.valueOf(activityId), UserContext.getUser().getUsername(), null);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	private Object getActions(ActivityDO activity) {
		String workflowId = activity.getWorkflowId();
		if (workflowId == null) return null;
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> actions = (List<Map<String, Object>>) transactionHelper.doInTransaction(new WfSetup(), "GetPathListWithAttibutes", UserContext.getUserId().toString(), workflowId);
		return actions;
	}
	
	private List<Map<String, String>> getOperations(ActivityDO activity, List<String> permissions) {
		List<Map<String, String>> operations = new ArrayList<Map<String, String>>();
		if (EnumActivityType.INFOMATION_REPORT.toString().equals(activity.getType().getCode())) {
			Map<String, String> exportButton = new HashMap<String, String>();
			exportButton.put("name", "PDF");
			exportButton.put("description", "");
			exportButton.put("icon", "fa-external-link");
			exportButton.put("module", "");
			operations.add(exportButton);
		}
		if (permissionSetDao.hasPermission(PermissionSets.EDIT_LABEL.getName())) {
			Map<String, String> labelButton = new HashMap<String, String>();
			labelButton.put("name", "editLabel");
			labelButton.put("description", "");
			labelButton.put("icon", "fa-cube");
			labelButton.put("module", "com.sms.activityinfo.tag");
			operations.add(labelButton);
		}
		if (!EnumActivityType.EMPLOYEE_REPORT.toString().equals(activity.getType().getCode()) && !EnumActivityType.AIRCRAFT_COMMANDER_REPORT.toString().equals(activity.getType().getCode())) {
			if (activityDao.hasPermission(permissions, PermissionSets.EDIT_ACTIVITY)) {
				Map<String, String> editButton = new HashMap<String, String>();
				editButton.put("name", "edit");
				editButton.put("description", "");
				editButton.put("icon", "fa-pencil");
				editButton.put("module", "com.sms.activityinfo.edit");
				operations.add(editButton);
			}
			if (activityDao.hasPermission(permissions, PermissionSets.DELETE_ACTIVITY)) {
				Map<String, String> remarkButton = new HashMap<String, String>();
				remarkButton.put("name", "delete");
				remarkButton.put("description", "");
				remarkButton.put("icon", "fa-trash-o");
				remarkButton.put("module", "com.sms.activityinfo.delete");
				operations.add(remarkButton);
			}
		}
		if (activityDao.hasPermission(permissions, PermissionSets.ADD_REMARK)) {
			Map<String, String> remarkButton = new HashMap<String, String>();
			remarkButton.put("name", "remark");
			remarkButton.put("description", "");
			remarkButton.put("icon", "fa-comment");
			remarkButton.put("module", "com.sms.detailmodule.logs");
			operations.add(remarkButton);
		}
		if (activityDao.hasPermission(permissions, PermissionSets.TRANSFORM_ACTIVITY)) {
			Map<String, String> transformButton = new HashMap<String, String>();
			transformButton.put("name", "transform");
			transformButton.put("description", "");
			transformButton.put("icon", "fa-wrench");
			transformButton.put("module", "com.sms.activityinfo.transform");
			operations.add(transformButton);
		}
		{
			Map<String, String> sendMessageButton = new HashMap<String, String>();
			sendMessageButton.put("name", "sendMessage");
			sendMessageButton.put("description", "");
			sendMessageButton.put("icon", "fa-comments-o");
			sendMessageButton.put("module", "com.sms.notice.activity");
			operations.add(sendMessageButton);
		}
		{
			if (permissionSetDao.hasPermission(PermissionSets.RELEASE_ACTIVITY.getName())) {
				Map<String, String> releaseButton = new HashMap<String, String>();
				releaseButton.put("name", "release");
				releaseButton.put("description", "");
				releaseButton.put("icon", "fa-share");
				releaseButton.put("module", "com.sms.activityinfo.release");
				operations.add(releaseButton);
				Map<String, String> unReleaseButton = new HashMap<String, String>();
				unReleaseButton.put("name", "unRelease");
				unReleaseButton.put("description", "");
				unReleaseButton.put("icon", "fa-share");
				unReleaseButton.put("module", "com.sms.activityinfo.unRelease");
				operations.add(unReleaseButton);
			}
		}
		return operations;
	}
	
	private List<List<Map<String, String>>> getMore() {
		List<List<Map<String, String>>> more = new ArrayList<List<Map<String, String>>>();
		List<Map<String, String>> list = new ArrayList<Map<String, String>>();
		Map<String, String> upload = new HashMap<String, String>();
		upload.put("name", "upload");
		upload.put("description", "");
		upload.put("module", "com.sms.detailmodule.upload");
		list.add(upload);
		more.add(list);
		return more;
	}
	
	private List<Map<String, Object>> getLeft(ActivityDO activity, List<String> permissions) {
		// 员工报告或者机长报告
		boolean isEmployeeReport = EnumActivityType.EMPLOYEE_REPORT.toString().equals(activity.getType().getCode()) || EnumActivityType.AIRCRAFT_COMMANDER_REPORT.toString().equals(activity.getType().getCode());
		List<Map<String, Object>> left = new ArrayList<Map<String, Object>>();
		// 基本信息
		Map<String, Object> baseArea = this.getBaseArea(activity);
		if (baseArea != null) {
			left.add(baseArea);
		}
		
		// 任务分配(子安全信息)
		Map<String, Object> subActivityArea = this.getSubActivityArea(activity, permissions);
		if (subActivityArea != null) {
			left.add(subActivityArea);
		}
		
		// 风险分析任务分配
		Map<String, Object> riskAnalysisSubActivityArea = this.getRiskAnalysisSubActivityArea(activity, permissions);
		if (riskAnalysisSubActivityArea != null) {
			left.add(riskAnalysisSubActivityArea);
		}
		
		// 附件
		Map<String, Object> attachmentArea = this.getAttachmentArea(activity, isEmployeeReport);
		if (attachmentArea != null) {
			left.add(attachmentArea);
		}
		
		// 信息获取
		Map<String, Object> accessInformationArea = this.getAccessInformationArea(activity, permissions, isEmployeeReport);
		if (accessInformationArea != null) {
			left.add(accessInformationArea);
		}
		
		// tem
		Map<String, Object> temArea = this.getTemArea(activity, permissions, isEmployeeReport);
		if (temArea != null) {
			left.add(temArea);
		}
		
		// 航班信息
		Map<String, Object> airlineInfoArea = this.getAirlineInfoArea(activity, permissions, isEmployeeReport);
		if (airlineInfoArea != null) {
			left.add(airlineInfoArea);
		}
		
		// 风险任务
		Map<String, Object> riskTaskArea = this.getRiskTaskArea(activity, permissions, isEmployeeReport);
		if (riskTaskArea != null) {
			left.add(riskTaskArea);
		}
		
		// 系统工作分析
		Map<String, Object> systemAnalysisArea = this.getSystemAnalysisArea(activity, permissions, isEmployeeReport);
		if (systemAnalysisArea != null) {
			left.add(systemAnalysisArea);
		}
		
		// 系统工作分析风险分析
		Map<String, Object> systemAnalysisRiskAnalysisArea = this.getSystemAnalysisRiskAnalysisArea(activity, permissions, isEmployeeReport);
		if (systemAnalysisRiskAnalysisArea != null) {
			left.add(systemAnalysisRiskAnalysisArea);
		}
		
		// 事件分析(SHEL模型)
		Map<String, Object> eventAnalysisArea = this.getEventAnalysisArea(activity, permissions, isEmployeeReport);
		if (eventAnalysisArea != null) {
			left.add(eventAnalysisArea);
		}
		
		// 流程流转日志
		Map<String, Object> workflowLogArea = this.getWorkflowLogArea(activity, permissions, isEmployeeReport);
		if (workflowLogArea != null) {
			left.add(workflowLogArea);
		}
		return left;
	}
	
	/**
	 * 获取子安全信息的区域
	 * @return
	 */
	private Map<String, Object> getSubActivityArea(ActivityDO activity, List<String> permissions) {
		if (activityDistributeConfigDao.getBySourceTypeAndUnitType(activity.getType().getId(), ActivityDistributeConfigDao.UNIT_TYPE_UT) == null) {
			return null;
		}
		Map<String, Object> subActivityArea = new HashMap<String, Object>();
		subActivityArea.put("key", "com.sms.detailmodule.staffReport.taskAssignment");
		subActivityArea.put("editable", activityDao.hasPermission(permissions, PermissionSets.ACTIVITY_ASSIGNMENT));
		List<ActivityDO> activities = activityDao.getByOrigin(activity.getId());
		List<Integer> activityIds = new ArrayList<Integer>();
		for (ActivityDO a : activities) {
			activityIds.add(a.getId());
		}
		Map<String, Object> userMaps = processorDao.getProcessorUserMapsByActivityIds(activityIds);
		List<Map<String, Object>> assignments = activityDao.convert(activities, Arrays.asList(new String[]{"id", "unit", "status"}), false);
		for (Map<String, Object> assignment : assignments) {
			assignment.put("processors", userMaps.get(((Integer) assignment.get("id")).toString()));
		}
		if (activities != null && activities.size() > 0) subActivityArea.put("assignments", assignments);
		return subActivityArea;
	}
	
	/**
	 * 获取风险分析任务分配的区域
	 * @return
	 */
	private Map<String, Object> getRiskAnalysisSubActivityArea(ActivityDO activity, List<String> permissions) {
		ActivityDistributeConfigDO activityDistributeConfig = activityDistributeConfigDao.getBySourceTypeAndUnitType(activity.getType().getId(), ActivityDistributeConfigDao.UNIT_TYPE_DP);
		if (activityDistributeConfig == null) {
			return null;
		}
		Map<String, Object> subActivityArea = new HashMap<String, Object>();
		subActivityArea.put("key", "com.sms.detailmodule.orgTaskAssignment");
		subActivityArea.put("editable", activityDao.hasPermission(permissions, PermissionSets.ACTIVITY_ASSIGNMENT));
		Set<RoleDO> roles = activityDistributeConfig.getRoles();
		List<Integer> roleIds = null;
		if (roles != null) {
			roleIds = new ArrayList<Integer>();
			for (RoleDO role : roles) {
				roleIds.add(role.getId());
			}
		}
		subActivityArea.put("roleIds", roleIds);
		List<ActivityDO> activities = activityDao.getByOrigin(activity.getId());
		
		List<Integer> activityIds = new ArrayList<Integer>();
		for (ActivityDO a : activities) {
			activityIds.add(a.getId());
		}
		// 所属处室的自定义字段
		Map<Integer, Object> deptMaps = this.getActivityDeptValue(activities);
		// 处理提醒标识
		Map<Integer, Object> dealNoticeSigns = this.getActivityDealNoticeSigns(activities);
		Map<String, Object> userMaps = processorDao.getProcessorUserMapsByActivityIds(activityIds);
		List<Map<String, Object>> assignments = activityDao.convert(activities, Arrays.asList(new String[]{"id", "status"}), false);
		for (Map<String, Object> assignment : assignments) {
			assignment.put("processors", userMaps.get(((Integer) assignment.get("id")).toString()));
			assignment.put("organization", deptMaps.get((Integer) assignment.get("id")));
			assignment.put("dealNoticeSign", dealNoticeSigns.get((Integer) assignment.get("id")));
		}
		if (activities != null && activities.size() > 0) subActivityArea.put("assignments", assignments);
		return subActivityArea;
	}
	
	private Map<Integer, Object> getActivityDeptValue(List<ActivityDO> activities) {
		Map<Integer, Object> deptMaps = new HashMap<Integer, Object>();
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
		for (ActivityDO activity : activities) {
			if (customFieldDeptKey != null && deptSearchTemplate != null) {
				Set<CustomFieldValueDO> customFieldValues = activity.getValues();
				if (customFieldValues != null) {
					for (CustomFieldValueDO customFieldValue : customFieldValues) {
						if (!customFieldValue.isDeleted() && customFieldDeptKey.equals(customFieldValue.getKey())) {
							Number orgId = (Number) deptSearchTemplate.getValue(customFieldValue);
							if (orgId != null) {
								OrganizationDO org = organizationDao.internalGetById(orgId.intValue());
								if (org != null) {
									deptMaps.put(activity.getId(), organizationDao.getFullPathOfOrganization(org));
								}
							}
							break;
						}
					}
				}
			}
		}
		return deptMaps;
	}
	
	/**
	 * 获取安全信息处理提醒的标识<br>
	 * 只要有任一一个安全信息到达提醒结点，则设置其他未到达提醒结点的安全信息的提醒标识为true
	 * @param activities
	 * @return
	 */
	private Map<Integer, Object> getActivityDealNoticeSigns(List<ActivityDO> activities) {
		Map<Integer, Object> dealNoticeSigns = new HashMap<Integer, Object>();
		// 提醒结点
		String customFieldNoticeNodeKey = null;
		ISearchTemplate noticeNodeSearchTemplate = null;
		for (com.usky.sms.field.Field field : fieldRegister.getAllFields()) {
			if ("提醒结点".equals(field.getName())) {
				customFieldNoticeNodeKey = field.getKey();
				noticeNodeSearchTemplate = SearchTemplateRegister.getSearchTemplate(fieldRegister.getFieldSearcher(customFieldNoticeNodeKey));
				break;
			}
		}
		// 是否有任一信息进入到提醒结点
		boolean hasAnyActivityEnteredNoticeNode = false;
		Map<Integer, Boolean> enteredNoticeNode = new HashMap<Integer, Boolean>();
		for (ActivityDO activity : activities) {
			// 初始化
			dealNoticeSigns.put(activity.getId(), false);
			enteredNoticeNode.put(activity.getId(), false);
			if (customFieldNoticeNodeKey != null && noticeNodeSearchTemplate != null) {
				Set<CustomFieldValueDO> customFieldValues = activity.getValues();
				if (customFieldValues != null) {
					for (CustomFieldValueDO customFieldValue : customFieldValues) {
						if (!customFieldValue.isDeleted() && customFieldNoticeNodeKey.equals(customFieldValue.getKey())) {
							String hasEnteredNoticeNode = (String) noticeNodeSearchTemplate.getValue(customFieldValue);
							if ("true".equalsIgnoreCase(hasEnteredNoticeNode)) {
								enteredNoticeNode.put(activity.getId(), true);
								hasAnyActivityEnteredNoticeNode = true;
							}
							break;
						}
					}
				}
			}
		}
		if (hasAnyActivityEnteredNoticeNode) {
			for (Entry<Integer, Boolean> entry : enteredNoticeNode.entrySet()) {
				dealNoticeSigns.put(entry.getKey(), !entry.getValue());
			}
		}
		return dealNoticeSigns;
	}
	
	/**
	 * 获取附件区域
	 * @param activity
	 * @param isEmployeeReport
	 * @return
	 */
	private Map<String, Object> getAttachmentArea(ActivityDO activity, boolean isEmployeeReport) {
		Map<String, Object> attachmentArea = new HashMap<String, Object>();
		attachmentArea.put("editable", !isEmployeeReport);
		attachmentArea.put("key", "com.sms.detailmodule.uploadFile");
		return attachmentArea;
	}
	
	/**
	 * 信息获取
	 * @param activity
	 * @param permissions
	 * @param isEmployeeReport
	 * @return
	 */
	private Map<String, Object> getAccessInformationArea(ActivityDO activity, List<String> permissions, boolean isEmployeeReport) {
		if (!accessInformationActivityTypeEntityDao.hasAccessInformationActivityTypeEntity(activity.getType().getId())) {
			return null;
		}
		Map<String, Object> infoArea = new HashMap<String, Object>();
		infoArea.put("editable", !isEmployeeReport);
		infoArea.put("key", "com.sms.detailmodule.infomodel");
		infoArea.put("occurredDate", accessInformationDao.convert(accessInformationDao.getByActivityId(activity.getId())));
		infoArea.put("organizations", organizationEntityDao.convert(organizationEntityDao.getByActivityId(activity.getId())));
		infoArea.put("flightInfos", flightInfoEntityDao.convert(flightInfoEntityDao.getByActivityId(activity.getId())));
		infoArea.put("groundPositions", groundPositionEntityDao.convert(groundPositionEntityDao.getByActivityId(activity.getId())));
		infoArea.put("vehicleInfos", vehicleInfoEntityDao.convert(vehicleInfoEntityDao.getByActivityId(activity.getId())));
		infoArea.put("maintainTools", maintainToolEntityDao.convert(maintainToolEntityDao.getByActivityId(activity.getId())));
		infoArea.put("groundStaffs", groundStaffEntityDao.convert(groundStaffEntityDao.getByActivityId(activity.getId())));
		return infoArea;
	}
	
	/**
	 * 获取tem区域
	 * @param activity
	 * @param permissions
	 * @param isEmployeeReport
	 * @return
	 */
	private Map<String, Object> getTemArea(ActivityDO activity, List<String> permissions, boolean isEmployeeReport) {
		if (!temActivityTypeEntityDao.hasTemActivityTypeEntity(activity.getType().getId())) {
			return null;
		}
		Map<String, Object> temArea = new HashMap<String, Object>();
		temArea.put("key", "com.sms.detailmodule.temmodel");
		temArea.put("editable", isEmployeeReport ? false : activityDao.hasPermission(permissions, PermissionSets.TEM));
		List<TemDO> tems = temDao.getByActivityId(activity.getId());
		if (tems != null && tems.size() > 0) temArea.put("tems", temDao.convert(tems));
		return temArea;
	}
	
	/**
	 * 获取航线信息区域
	 * @param activity
	 * @param permissions
	 * @param isEmployeeReport
	 * @return
	 */
	private Map<String, Object> getAirlineInfoArea(ActivityDO activity, List<String> permissions, boolean isEmployeeReport) {
		if (!airlineInfoActivityTypeEntityDao.hasAirlineInfoActivityTypeEntity(activity.getType().getId())) {
			return null;
		}
		Map<String, Object> airlineArea = new HashMap<String, Object>();
		airlineArea.put("key", "com.sms.detailmodule.airline");
		airlineArea.put("airline", airlineInfoDao.convert(airlineInfoDao.getAirlineInfoByActivity(activity.getId())));
		airlineArea.put("editable", isEmployeeReport ? false : activityDao.hasPermission(permissions, PermissionSets.AIRLINE_INFORMATION));
		return airlineArea;
	}
	
	/**
	 * 获取风险任务区域
	 * @param activity
	 * @param permissions
	 * @param isEmployeeReport
	 * @return
	 */
	private Map<String, Object> getRiskTaskArea(ActivityDO activity, List<String> permissions, boolean isEmployeeReport) {
		if (!riskTaskActivityTypeEntityDao.hasRiskTaskActivityTypeEntity(activity.getType().getId())) {
			return null;
		}
		Map<String, Object> assignmentArea = new HashMap<String, Object>();
		assignmentArea.put("key", "com.sms.detailmodule.assignment");
		assignmentArea.put("assignment", riskTaskDao.convert(riskTaskDao.getAirlineInfoByActivity(activity.getId())));
		assignmentArea.put("editable", isEmployeeReport ? false : activityDao.hasPermission(permissions, PermissionSets.RISK_TASK));
		return assignmentArea;
	}
	
	/**
	 * 获取系统工作分析区域
	 * @param activity
	 * @param permissions
	 * @param isEmployeeReport
	 * @return
	 */
	private Map<String, Object> getSystemAnalysisArea(ActivityDO activity, List<String> permissions, boolean isEmployeeReport) {
		if (!systemAnalysisActivityTypeEntityDao.hasSystemAnalysisActivityTypeEntity(activity.getType().getId())) {
			return null;
		}
		Map<String, Object> systemAnalysisArea = new HashMap<String, Object>();
		systemAnalysisArea.put("key", "com.sms.detailmodule.systemwork.workAnalysis");
		systemAnalysisArea.put("systemAnalysisMappings", systemAnalysisMappingDao.convert(systemAnalysisMappingDao.getByActivityId(activity.getId())));
		systemAnalysisArea.put("editable", true);
		return systemAnalysisArea;
	}
	
	/**
	 * 获取系统分析风险分析区域
	 * @param activity
	 * @param permissions
	 * @param isEmployeeReport
	 * @return
	 */
	private Map<String, Object> getSystemAnalysisRiskAnalysisArea(ActivityDO activity, List<String> permissions, boolean isEmployeeReport) {
		if (!systemAnalysisRiskAnalysisActivityTypeEntityDao.hasSystemAnalysisRiskAnalysisActivityTypeEntity(activity.getType().getId())) {
			return null;
		}
		Map<String, Object> systemAnalysisRiskAnalysisArea = new HashMap<String, Object>();
		systemAnalysisRiskAnalysisArea.put("key", "com.sms.detailmodule.riskAnalysis.riskAnalysis");
		systemAnalysisRiskAnalysisArea.put("systemAnalysisRiskAnalysis", systemAnalysisRiskAnalysisDao.convert(systemAnalysisRiskAnalysisDao.getByActivityId(activity.getId())));
		systemAnalysisRiskAnalysisArea.put("residualDerivativeRisks", residualDerivativeRiskDao.convert(residualDerivativeRiskDao.getByActivityId(activity.getId())));
		systemAnalysisRiskAnalysisArea.put("conclusion", systemAnalysisRiskAnalysisConclusionDao.convert(systemAnalysisRiskAnalysisConclusionDao.getByActivityId(activity.getId())));
		systemAnalysisRiskAnalysisArea.put("editable", true);
		return systemAnalysisRiskAnalysisArea;
	}
	
	/**
	 * 获取事件分析区域
	 * @param activity
	 * @param permissions
	 * @param isEmployeeReport
	 * @return
	 */
	private Map<String, Object> getEventAnalysisArea(ActivityDO activity, List<String> permissions, boolean isEmployeeReport) {
		if (!eventAnalysisActivityTypeEntityDao.hasEventAnalysisActivityTypeEntity(activity.getType().getId())) {
			return null;
		}
		Map<String, Object> eventAnalysisArea = new HashMap<String, Object>();
		eventAnalysisArea.put("key", "com.sms.detailmodule.shel.analysis");
		eventAnalysisArea.put("editable", isEmployeeReport ? false : activityDao.hasPermission(permissions, PermissionSets.EVENT_ANALYSIS));
		List<EventAnalysisDO> eventAnalysises = eventAnalysisDao.getByActivityId(activity.getId());
		if (eventAnalysises != null && eventAnalysises.size() > 0) eventAnalysisArea.put("eventAnalysises", eventAnalysisDao.convert(eventAnalysises));
		return eventAnalysisArea;
	}
	
	/**
	 * 获取流程流转日志区域
	 * @param activity
	 * @param permissions
	 * @param isEmployeeReport
	 * @return
	 */
	private Map<String, Object> getWorkflowLogArea(ActivityDO activity, List<String> permissions, boolean isEmployeeReport) {
		Map<String, Object> logArea = new HashMap<String, Object>();
		logArea.put("key", "com.sms.detailmodule.logs");
		logArea.put("addable", activityDao.hasPermission(permissions, PermissionSets.ADD_REMARK));
		if (activity.getWorkflowId() != null) {
			@SuppressWarnings("unchecked")
			List<Map<String, Object>> workflowLogs = (List<Map<String, Object>>) transactionHelper.doInTransaction(new WfSetup(), "GetWfActivityStatusLog", activity.getWorkflowId());
			logArea.put("workflowLogs", workflowLogs);
		}
		return logArea;
	}
	
	/**
	 * 获取备注区域
	 * @param activity
	 * @param permissions
	 * @param isEmployeeReport
	 * @return
	 */
	private Map<String, Object> getActionArea(ActivityDO activity) {
		Map<String, Object> actionArea = new HashMap<String, Object>();
		actionArea.put("actions", actionDao.convert(actionDao.getByActivity(activity.getId())));
		return actionArea;
	}
	
	public void getActivityBaseInfo(HttpServletRequest request, HttpServletResponse response) {
		try {
			int activityId = Integer.parseInt(request.getParameter("activityId"));
			ActivityDO activity = activityDao.internalGetById(activityId);
			Map<String, Object> baseInfo = this.getBaseArea(activity);
			
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", baseInfo);

			ResponseHelper.output(response, result);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
		
	
	public Map<String, Object> getBaseArea(ActivityDO activity) {
		Map<String, Object> baseArea = new HashMap<String, Object>();
		baseArea.put("key", "com.sms.detailmodule.base");
		Map<String, Object> activityMap = activityDao.convert(activity);
		activityMap.put("label", labelDao.getLabels(activity.getId()));
		baseArea.put("activity", activityMap);
		baseArea.putAll(this.getScreenData(activity.getId(), ActivityOperation.VIEW));
		List<CustomFieldValueDO> values = customFieldValueDao.getByActivityId(activity.getId());
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> tabs = (List<Map<String, Object>>) baseArea.get("tabs");
		Iterator<Map<String, Object>> tabIterator = tabs.iterator();
		while (tabIterator.hasNext()) {
			Map<String, Object> tabMap = tabIterator.next();
			@SuppressWarnings("unchecked")
			List<Map<String, Object>> fields = (List<Map<String, Object>>) tabMap.get("fields");
			Iterator<Map<String, Object>> fieldIterator = fields.iterator();
			FIELD: while (fieldIterator.hasNext()) {
				Map<String, Object> field = fieldIterator.next();
				String key = (String) field.get("key");
				if (key.startsWith("customfield_")) {
					for (CustomFieldValueDO value : values) {
						if (key.equals(value.getKey())) {
							ISearchTemplate template = SearchTemplateRegister.getSearchTemplate(fieldRegister.getFieldSearcher(value.getKey()));
							if (template == null) break;
							Object displayValue = template.getCustomFieldDisplayValue(value);
							field.put("value", displayValue);
							field.put("exportValue", template.getExportContent(displayValue));
							continue FIELD;
						}
					}
				}
				fieldIterator.remove();
			}
			if (fields.size() == 0) tabIterator.remove();
		}
		return baseArea;
	}
	
	private List<Map<String, Object>> getRight(ActivityDO activity) {
		List<Map<String, Object>> right = new ArrayList<Map<String, Object>>();
		// 用户区域
		Map<String, Object> userArea = this.getUserArea(activity);
		if (userArea != null) {
			right.add(userArea);
		}
		// 日期区域
		Map<String, Object> dateArea = this.getDateArea(activity);
		if (dateArea != null) {
			right.add(dateArea);
		}
		return right;
	}
	
	/**
	 * 获取用户信息区域
	 * @return
	 */
	private Map<String, Object> getUserArea(ActivityDO activity) {
		Map<String, Object> userArea = new HashMap<String, Object>();
		userArea.put("key", "com.sms.detailmodule.people");
		if (activity.getWorkflowId() != null) {
			@SuppressWarnings("unchecked")
			List<String> userIds = (List<String>) transactionHelper.doInTransaction(new WfSetup(), "GetWfCurrentUserList", activity.getWorkflowId());
			List<Map<String, String>> userMaps = new ArrayList<Map<String, String>>();
			for (String userId : userIds) {
				UserDO user = userDao.internalGetById(Double.valueOf(userId).intValue());
				Map<String, String> userMap = new HashMap<String, String>();
				userMap.put("fullname", user.getFullname());
				AvatarDO avatar = user.getAvatar();
				userMap.put("avatar", config.getUserAvatarWebPath() + "/" + (avatar == null ? config.getUnknownUserAvatar() : avatar.getFileName()));
				userMaps.add(userMap);
			}
			userArea.put("assignees", userMaps);
		}
		{
			UserDO reported = activity.getCreator();
			Map<String, String> reporterMap = new HashMap<String, String>();
			List<OrganizationDO> orgList = organizationDao.getByUser(reported.getId());
			String userOrgs = orgList == null || orgList.size() < 1 ? null : "(" + orgList.get(0).getName() + ")";
			reporterMap.put("fullname", reported.getFullname() + (userOrgs == null ? "" : userOrgs));
			AvatarDO avatar = reported.getAvatar();
			reporterMap.put("avatar", config.getUserAvatarWebPath() + "/" + (avatar == null ? config.getUnknownUserAvatar() : avatar.getFileName()));
			userArea.put("reporter", reporterMap);
		}
		{
			Map<String, Object> watchers = new HashMap<String, Object>();
			watchers.put("count", userAssociationDao.getWatchCount(activity.getId().toString()));
			watchers.put("watched", userAssociationDao.booleanWatch(UserContext.getUserId(), activity.getId().toString(), "activity"));
			userArea.put("watchers", watchers);
		}
		return userArea;
	}
	
	/**
	 * 获取日期区域数据
	 * @param activity
	 * @return
	 */
	private Map<String, Object> getDateArea(ActivityDO activity) {
		Map<String, Object> dateArea = new HashMap<String, Object>();
		dateArea.put("key", "com.sms.detailmodule.date");
		dateArea.put("created", DateHelper.formatIsoSecond(activity.getCreated()));
		dateArea.put("lastUpdate", DateHelper.formatIsoSecond(activity.getLastUpdate()));
		return dateArea;
	}
	
	/**
	 * 获取下发的安全信息的处理人
	 * @param request
	 * @param response
	 */
	public void getDistributedActivityProcessors(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<Integer> orgIds = gson.fromJson(request.getParameter("orgIds"), new TypeToken<List<Integer>>() {}.getType());
			if (orgIds == null || orgIds.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_101002003, "组织id");
			}
			List<Integer> roleIds = gson.fromJson(request.getParameter("roleIds"), new TypeToken<List<Integer>>() {}.getType());
			if (roleIds == null || roleIds.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_101002003, "角色id");
			}
			String term = request.getParameter("term");
			List<UserDO> users = unitRoleActorDao.getUsersByOrganizationIdsAndRoleIds(roleIds, orgIds, term, true);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(userDao.convert(users), request));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getActivityWorkflowConfig(HttpServletRequest request, HttpServletResponse response) {
		try {
			int activityId = Integer.parseInt(request.getParameter("activity"));
			int screenId = Integer.parseInt(request.getParameter("screen"));
			Map<String, Object> data = getScreenData(activityId, screenId);
			setFieldValues(data, activityId);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	private Map<String, Object> getScreenData(ActivityOperation operation) {
		int unitId;
		int typeId;
		UserHistoryItemDO unitItem = userHistoryItemDao.getCurrentUnit(PermissionSets.CREATE_ACTIVITY.getName());
		if (unitItem == null) {
			List<UnitDO> units = unitDao.getUnits(PermissionSets.CREATE_ACTIVITY.getName());
			if (units.size() == 0) throw SMSException.NO_OPERATE_PERMISSION;
			unitId = units.get(0).getId();
		} else {
			unitId = Integer.parseInt(unitItem.getEntityId());
		}
		UserHistoryItemDO typeItem = userHistoryItemDao.getActivityType();
		if (typeItem == null) {
			ActivityTypeDO type = activityTypeDao.getDefaultByUnitId(unitId);
			if (type == null) {
				type = activityTypeDao.getByUnitId(unitId).get(0);
			}
			typeId = type.getId();
		} else {
			typeId = Integer.parseInt(typeItem.getEntityId());
		}
		Map<String, Object> data = getScreenData(unitId, typeId, operation);
		setUnitAndType(data, unitId, typeId);
		return data;
	}
	
	private Map<String, Object> getScreenData(String unitIdStr, String typeIdStr, ActivityOperation operation) {
		int unitId = Integer.parseInt(unitIdStr);
		int typeId = Integer.parseInt(typeIdStr);
		List<ActivityTypeDO> types = activityTypeDao.getByUnitId(unitId);
		ActivityTypeDO matchedType = null;
		for (ActivityTypeDO type : types) {
			if (type.getId() == typeId) {
				matchedType = type;
				break;
			}
		}
		if (matchedType == null) matchedType = activityTypeDao.getDefaultByUnitId(unitId);
		if (matchedType == null) {
			if (types.size() == 0) throw SMSException.NO_OPERATE_PERMISSION;
			matchedType = types.get(0);
		}
		typeId = matchedType.getId();
		userHistoryItemDao.record("Unit", unitIdStr, UserContext.getUsername(), null);
		userHistoryItemDao.recordActivityType(Integer.toString(typeId), UserContext.getUsername(), null);
		Map<String, Object> data = getScreenData(unitId, typeId, operation);
		setUnitAndType(data, unitId, typeId);
		return data;
	}
	
	private Map<String, Object> getScreenData(int unitId, int typeId, ActivityOperation operation) {
		int screenId = fieldScreenDao.getFieldScreen(unitId, typeId, operation).getId();
		return getScreenData(screenId, unitId, typeId);
	}
	
	private Map<String, Object> getScreenData(int activityId, int screenId) {
		ActivityDO activity = activityDao.internalGetById(activityId);
		int unitId = activity.getUnit().getId();
		int typeId = activity.getType().getId();
		return getScreenData(screenId, unitId, typeId);
	}
	
	private Map<String, Object> getScreenData(int activityId, ActivityOperation operation) {
		ActivityDO activity = activityDao.internalGetById(activityId);
		int unitId = activity.getUnit().getId();
		int typeId = activity.getType().getId();
		int screenId = fieldScreenDao.getFieldScreen(unitId, typeId, operation).getId();
		return getScreenData(screenId, unitId, typeId);
	}
	
	private Map<String, Object> getScreenData(int screenId, int unitId, int typeId) {
		List<Object[]> objsList = fieldLayoutItemDao.getFieldLayoutItemAndFieldLayoutSchemeEntity(unitId, typeId);
		Map<String, FieldLayoutItemDO> keyItemMap = new HashMap<String, FieldLayoutItemDO>();
		for (Object[] objs : objsList) {
			FieldLayoutItemDO item = (FieldLayoutItemDO) objs[0];
			FieldLayoutSchemeEntityDO entity = (FieldLayoutSchemeEntityDO) objs[1];
			String key = item.getKey();
			if (!keyItemMap.containsKey(key) || entity.getType() != null) {
				keyItemMap.put(key, item);
			}
		}
		
		List<CustomFieldConfigSchemeDO> schemes = customFieldConfigSchemeDao.getCustomFieldConfigScheme(unitId, typeId);
		Map<Integer, CustomFieldConfigSchemeDO> idSchemeMap = new HashMap<Integer, CustomFieldConfigSchemeDO>();
		for (CustomFieldConfigSchemeDO scheme : schemes) {
			int id = scheme.getField().getId();
			CustomFieldConfigSchemeDO existScheme = idSchemeMap.get(id);
			if (existScheme != null) {
				Set<UnitDO> units = scheme.getUnits();
				Set<ActivityTypeDO> types = scheme.getActivityTypes();
				Set<UnitDO> existUnits = existScheme.getUnits();
				Set<ActivityTypeDO> existTypes = existScheme.getActivityTypes();
				if (units.size() > 0 && existUnits.size() == 0) {
					continue;
				} else if (units.size() == 0 && existUnits.size() > 0) {
					// do nothing
				} else if (types.size() > 0 && existTypes.size() == 0) {
					continue;
				}
			}
			idSchemeMap.put(id, scheme);
		}
		
		List<Map<String, Object>> fieldMaps = new ArrayList<Map<String, Object>>();
		List<Map<String, Object>> tabMaps = new ArrayList<Map<String, Object>>();
		List<FieldScreenTabDO> tabs = fieldScreenTabDao.getSortedTabsByFieldScreenId(screenId);
		for (FieldScreenTabDO tab : tabs) {
			Map<String, Object> tabMap = fieldScreenTabDao.convert(tab);
			List<FieldScreenLayoutItemDO> items = fieldScreenLayoutItemDao.getSortedItemsByTabId(tab.getId());
			List<Map<String, Object>> fields = new ArrayList<Map<String, Object>>();
			for (FieldScreenLayoutItemDO item : items) {
				String key = item.getKey();
				if ("unit".equals(key) || "type".equals(key)) continue;
				FieldLayoutItemDO fieldLayoutItem = keyItemMap.get(key);
				if (fieldLayoutItem == null) continue;
				CustomFieldConfigSchemeDO scheme = null;
				if (key.startsWith("customfield_")) {
					int customFieldId = Integer.parseInt(key.substring(12));
					scheme = idSchemeMap.get(customFieldId);
					if (scheme == null) continue;
				}
				Map<String, Object> fieldMap = new HashMap<String, Object>();
				fieldMap.put("key", key);
				fieldMap.put("name", fieldRegister.getFieldName(key));
				fieldMap.put("description", fieldLayoutItem.getDescription());
				fieldMap.put("required", fieldLayoutItem.getRequired());
				fieldMap.put("renderer", fieldLayoutItem.getRenderer());
				boolean editable = true;
				if ("label".equals(key)) { // 标签时返回是否有编辑标签的权限
					editable = permissionSetDao.hasPermission(PermissionSets.EDIT_LABEL.getName());
				}
				fieldMap.put("editable", editable);
				if (scheme != null) {
					fieldMap.put("config", scheme.getField().getConfig());
					fieldMap.put("defaultValue", scheme.getDefaultValue());
				} else if ("priority".equals(key)) {
					fieldMap.put("defaultValue", activityPriorityDao.convert(activityPriorityDao.getDefaultPriority()));
				}
				fields.add(fieldMap);
				fieldMaps.add(fieldMap);
			}
			tabMap.put("fields", fields);
			tabMaps.add(tabMap);
		}
		Map<String, Object> data = new HashMap<String, Object>();
		data.put("fields", fieldMaps);
		data.put("tabs", tabMaps);
		return data;
	}
	
	private void setUnitAndType(Map<String, Object> data, int unitId, int typeId) {
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> fieldMaps = (List<Map<String, Object>>) data.get("fields");
		Map<String, Object> unitFieldMap = new HashMap<String, Object>();
		unitFieldMap.put("key", "unit");
		unitFieldMap.put("name", fieldRegister.getFieldName("unit"));
		unitFieldMap.put("required", true);
		unitFieldMap.put("renderer", "com.sms.plugin.render.unitProp");
		unitFieldMap.put("defaultValue", gson.toJson(unitDao.convert(unitDao.internalGetById(unitId), false)));
		fieldMaps.add(unitFieldMap);
		Map<String, Object> typeFieldMap = new HashMap<String, Object>();
		typeFieldMap.put("key", "type");
		typeFieldMap.put("name", fieldRegister.getFieldName("type"));
		typeFieldMap.put("required", true);
		typeFieldMap.put("renderer", "com.sms.plugin.render.activityTypeProp");
		typeFieldMap.put("defaultValue", gson.toJson(activityTypeDao.convert(activityTypeDao.internalGetById(typeId))));
		fieldMaps.add(typeFieldMap);
	}
	
	private void setFieldValues(Map<String, Object> data, int activityId) {
		Map<String, Object> activityMap = activityDao.convert(activityDao.internalGetById(activityId));
		List<CustomFieldValueDO> values = customFieldValueDao.getByActivityId(activityId);
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> tabMaps = (List<Map<String, Object>>) data.get("tabs");
		for (Map<String, Object> tabMap : tabMaps) {
			@SuppressWarnings("unchecked")
			List<Map<String, Object>> fields = (List<Map<String, Object>>) tabMap.get("fields");
			for (Map<String, Object> field : fields) {
				String key = (String) field.get("key");
				if (key.startsWith("customfield_")) {
					for (CustomFieldValueDO value : values) {
						if (key.equals(value.getKey())) {
							ISearchTemplate template = SearchTemplateRegister.getSearchTemplate(fieldRegister.getFieldSearcher(key));
							if (template == null) break;
							field.put("value", template.getCustomFieldDisplayValue(value));
							break;
						}
					}
				} else if ("label".equals(key)) {
					field.put("value", labelDao.getLabels(activityId));
				} else {
					field.put("value", activityMap.get(key));
				}
			}
		}
	}
	
	/**
	 * 读取导入进度
	 * 
	 * @param request
	 * @param response
	 */
	public void getImportActivitiesFromExcelProgress(HttpServletRequest request, HttpServletResponse response) {
		try {
			
			Map<String, Object> progress = new HashMap<String, Object>();
			progress.put("message", importProgress.getMessage());
			progress.put("processed", importProgress.getProcessed());
			progress.put("total", importProgress.getTotal());
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", progress);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/**
	 * 从excel表格中导入安全信息
	 */
	public void importActivitiesFromExcel(HttpServletRequest request, HttpServletResponse response) {
		try {
			importProgress = new ImportProgress();
			
			List<FileItem> fileItems = fileDao.getFileItems(request);
			for (FileItem item : fileItems) {
				InputStream in = item.getInputStream();
				List<String[]> dataList;
				try {
					// 解析输入流
					dataList = ExcelUtil.getDataListFromInputStream(in);
				} catch (Exception e) {
					e.printStackTrace();
					throw new SMSException(MessageCodeConstant.MSG_CODE_132000006, item.getName());
				}
				try {
					log.info("开始导入[" + item.getName() + "]的数据！");
					importProgress.setMessage("正在导入文件：" + item.getName());
					importProgress.setTotal(dataList.size() - 1);
					
					// 导入数据
					importActivityFromExcelData(dataList);
					
					log.info("文件[" + item.getName() + "]导入数据完成！");
				} catch (Exception e) {
					e.printStackTrace();
					//					e.getCause().printStackTrace();
					log.error("文件[" + item.getName() + "]导入数据失败！" + e.getMessage());
					throw new SMSException(MessageCodeConstant.MSG_CODE_132000005, item.getName());
				}
			}
			importProgress.setMessage("导入完成！");
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	private void importActivityFromExcelData(List<String[]> dataList) throws SecurityException, NoSuchMethodException, IllegalArgumentException, IllegalAccessException, InvocationTargetException {
		// EntityFromExcel的成员变量(首字母大写)，并与excel的表头的顺序一致
		String[] fields = { "UnitName", "Summary", "OccurredDate", "FlightInfoID", "EventType", "System", "Description", "EmergencyMeasure", "FlightPhase", "Consequence", "Insecurity", "PrimaryThreat", "SecondaryThreat", "PrimaryError", "SecondaryError", "Severity" };
		List<EntityFromExcel> list = new ArrayList<EntityFromExcel>();
		int i = 0;
		for (String[] data : dataList) {
			if (i == 0) {
				if (data.length != fields.length) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_101001004, data.length, fields.length);
				}
			} else {
				EntityFromExcel entityFromExcel = new EntityFromExcel();
				for (int j = 0; j < data.length; j++) {
					Method method = EntityFromExcel.class.getMethod("set" + fields[j], String.class);
					
					method.invoke(entityFromExcel, data[j]);
				}
				if (StringUtils.isBlank(entityFromExcel.getUnitName()) || StringUtils.isBlank(entityFromExcel.getSummary()) || StringUtils.isBlank(entityFromExcel.getDescription()) || StringUtils.isBlank(entityFromExcel.getSystem()) || StringUtils.isBlank(entityFromExcel.getSeverity())) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_112002001, i + 1);
				}
				list.add(entityFromExcel);
			}
			i++;
		}
		
		try {
			i = 0;
			log.info("导入数据开始！");
			for (EntityFromExcel entity : list) {
				log.info("正在导入第" + (i + 2) + "行数据...");
				
				Map<String, Object> map = new HashMap<String, Object>();
				Integer id = activityDao.addEntityFromExcel(entity, map);
				solrService.addDoc("activity", id, map);
				
				log.info("导入第" + (i + 2) + "行数据完成!");
				importProgress.setProcessed(i + 1);
				i++;
			}
			log.info("导入数据完成！共导入" + i + "条数据");
		} catch (Exception e) {
			e.printStackTrace();
			StringBuffer message = new StringBuffer();
			message.append("共导入");
			message.append(i);
			message.append("条数据，第");
			message.append(i + 2);
			message.append("行数据导入失败！");
			message.append(e.getMessage());
			//			//  错误详情
			//			message.append(" detail:");
			//			StackTraceElement[] messages = e.getStackTrace();
			//			for (StackTraceElement stackTraceElement : messages) {
			//				message.append("\r\nClassName:");
			//				message.append(stackTraceElement.getClassName());
			//				message.append("\r\ngetFileName:");
			//				message.append(stackTraceElement.getFileName());
			//				message.append("\r\ngetLineNumber:");
			//				message.append(stackTraceElement.getLineNumber());
			//				message.append("\r\ngetMethodName:");
			//				message.append(stackTraceElement.getMethodName());
			//				message.append("\r\n");
			//			}
			log.error(message.toString());
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, message.toString());
		}
	}
	
	public void exportActivitiesToExcel(HttpServletRequest request, HttpServletResponse response) throws Exception {
		OutputStream out = response.getOutputStream();
		try {
			String query = request.getParameter("query");
			String core = request.getParameter("core");
			if (Utility.IsEmpty(core)) throw new Exception("缺少core参数");
			String start = "0";
			// 最多导出5000条数据
			String length = "5000";
			String fl = request.getParameter("fl");
			String sort = request.getParameter("sort");
			String search = request.getParameter("search");
			List<Map<String, Object>> columns = gson.fromJson(request.getParameter("columns"), new TypeToken<List<Map<String, Object>>>() {}.getType());
			Map<String, Object> result = queryService.getResultByParams(UserContext.getUserId().toString(), query, core, start, length, fl, sort, search, columns, true);
			if (null != result) {
				@SuppressWarnings("unchecked")
				List<Map<String, Object>> list_result = (List<Map<String, Object>>) result.get("aaData");
				response.reset();
				response.addHeader("content-disposition", "attachment;filename=" + new String("safetyinformation.xlsx"));
				response.setContentType("application/msexcel");
				activityDao.exportToExcel(columns, list_result, out);
				response.flushBuffer();
			}
		} catch (Exception e) {
			String url = new String(request.getParameter("url").getBytes("iso-8859-1"), "utf-8");
			url = URLDecoder.decode(url, "utf-8");
			response.reset();
			response.setContentType("text/html");
			response.setCharacterEncoding("UTF-8");
			response.setHeader("Pragma", "no-cache");
			response.setHeader("Cache-Control", "no-cache");
			PrintWriter writer = response.getWriter();
			request.getServletPath();
			StringBuilder sb = new StringBuilder().append("<script language='javascript'>alert('下载失败！");
			sb.append("');window.location.href='");
			sb.append(request.getScheme());
			sb.append("://");
			sb.append(url);
			sb.append("';</script>");
			writer.print(sb.toString());
			writer.flush();
			writer.close();
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} finally {
			IOUtils.closeQuietly(out);
		}
	}
	
	/**
	 * 全文检索安全信息
	 * 
	 * @param request
	 * @param response
	 */
	public void fuzzySearchActivityInfos(HttpServletRequest request, HttpServletResponse response) {
		try {
			// 关键字
			String searchKey = request.getParameter("searchKey");
			// 显示的页数
			int showPage = request.getParameter("showPage") == null ? 1 : Integer.parseInt(request.getParameter("showPage"));
			// 每页显示的数量
			int row = request.getParameter("row") == null ? 10 : Integer.parseInt(request.getParameter("row"));
			// 查询结果
			Map<String, Object> map = activityDao.fuzzySearch(searchKey, showPage, row);
			
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("totalCount", map.get("totalCount"));
			result.put("data", map.get("dataList"));
			result.put("success", true);
			
			ResponseHelper.output(response, result);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getEmReportDeatil(HttpServletRequest request, HttpServletResponse response) {
		try {
			int id = Integer.parseInt(request.getParameter("id"));
			List<CustomFieldValueDO> list=customFieldValueDao.getByActivityId(id,"customfield_8279247");
			ActivityDO activity = activityDao.internalGetById(id);
			Map<String, Object> data = new HashMap<String, Object>();
			Map<String, Object> activityMap = new HashMap<String, Object>();
			activityMap.put("unit", activity.getUnit().getId());
			activityMap.put("unitName", activity.getUnit().getName());
			activityMap.put("summary", activity.getSummary());
			activityMap.put("description", activity.getDescription());
			activityMap.put("status", activity.getStatus().getName());
			activityMap.put("created", DateHelper.formatIsoSecond(activity.getCreated()));
			activityMap.put("userCode", activity.getCreator().getUsername());
			for (CustomFieldValueDO value : customFieldValueDao.getByActivityId(id)) {
				String fieldName = fieldRegister.getFieldName(value.getKey());
				if ("联系电话".equals(fieldName)) {
					activityMap.put("reporterPhone", value.getStringValue());
				} else if ("电子邮箱".equals(fieldName)) {
					activityMap.put("email", value.getStringValue());
				} else if ("deviceId".equals(fieldName)) {
					activityMap.put("deviceId", value.getStringValue());
				} else if ("上报途径".equals(fieldName)) {
					activityMap.put("mtype", value.getStringValue());
				} else if ("source".equals(fieldName)) {
					activityMap.put("source", value.getStringValue());
				} else if ("姓名".equals(fieldName)) {
					activityMap.put("userName", value.getStringValue());
				}
			}
			data.put("activity", activityMap);
			List<Map<String, Object>> fileList=fileDao.convert(fileDao.getFilesBySource(3, id), Arrays.asList(new String[] { "id", "fileName" }));
			List<Map<String, Object>> newFileList=new ArrayList<Map<String,Object>>();
			String serverIP=Config.getInstance().getServerIP();
			//String serverIP=request.getLocalAddr();
			//String serverPort=String.valueOf(request.getServerPort());
			//String uri=request.getRequestURI();
			String serverPort=Config.getInstance().getServerPort();
			for(int i=0;i<fileList.size();i++)
			{
				Map<String, Object> file=fileList.get(i);
				String fileId=String.valueOf(file.get("id"));
				StringBuffer url=new StringBuffer("http://");
				url.append(serverIP+":"+serverPort+"/sms/query.do?");
				if(list.size()>=1&&list.get(0).getStringValue().equals("mobile"))
				{
		          url.append("nologin=Y&method=downloadFiles&isMobile=true&ids=["+fileId+"]");
				}
				else
				{
				  url.append("nologin=Y&method=downloadFiles&ids=["+fileId+"]");
				}
				file.put("url", url);
				newFileList.add(file);
			}
			data.put("attachments", newFileList);
			data.put("remarks", actionDao.convert(actionDao.getByActivity(id)));
			@SuppressWarnings("unchecked")
			List<Map<String, Object>> workflowLogs = (List<Map<String, Object>>) transactionHelper.doInTransaction(new WfSetup(), "GetWfActivityStatusLog", activity.getWorkflowId());
			data.put("workflowLogs", workflowLogs);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void submitEmReport(HttpServletRequest request, HttpServletResponse response) {
		try {
			Map<String, Object> map = gson.fromJson(request.getParameter("activity"), new TypeToken<Map<String, Object>>() {}.getType());
			activityDao.submitEmReport(map);
			
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			ResponseHelper.output(response, result);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/**
	 * 上报机长报告
	 * @param request
	 * @param response
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void submitAircraftCommanderReport(HttpServletRequest request, HttpServletResponse response) {
		try {
			Map<String, Object> map = gson.fromJson(request.getParameter("activity"), new TypeToken<Map<String, Object>>() {}.getType());
			activityDao.submitAircraftCommanderReport(map);

			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			ResponseHelper.output(response, result);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void submitAircraftCommanderReport() {
		// 类型为"机长报告"
		ActivityTypeDO type = activityTypeDao.getByName("机长报告");
		if (type == null) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_113000002, "机长报告");
		}
		
		// 机长报告的数据
		List<AircraftCommanderReportTempDO> aircraftCommanderReportTemps = aircraftCommanderReportTempDao.getUnImportedReports();
		if (!aircraftCommanderReportTemps.isEmpty()) {
			// 优先级为默认
			ActivityPriorityDO priority = activityPriorityDao.getDefaultPriority();
			// 飞行阶段默认为"初始爬升"
			DictionaryDO flightPhase = dictionaryDao.getByTypeAndName("飞行阶段", "初始爬升");
			if (null == flightPhase) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_133000007, "飞行阶段", "初始爬升");
			}
			for (AircraftCommanderReportTempDO aircraftCommanderReportTemp : aircraftCommanderReportTemps) {
				Map<String, Object> reportMap = gson.fromJson(aircraftCommanderReportTemp.getReportData(), new TypeToken<Map<String, Object>>() {}.getType());
				// 安全信息
				Map<String, Object> activityMap = new HashMap<String, Object>();
				// 航班id(用于查询对应的安监机构)
				String filghtInfoId = (String) reportMap.get("legId");
				log.info("同步legId为" + filghtInfoId + "的机长报告开始！");
//				String pcode = null;
//				String rankNo = null;
//				Integer fjsOrder = null;
					
				// 航班信息
				Map<String, Object> flightInfoEntityMap = new HashMap<String, Object>();
				flightInfoEntityMap.put("flightPhase", flightPhase.getId().doubleValue());
				flightInfoEntityMap.put("flightInfo", ((Integer) Integer.parseInt(filghtInfoId)).doubleValue());
				
//				List<FlightCrewScheduleInfoDO> schedules = flightCrewScheduleInfoDao.getCrewSchedule(Integer.parseInt(filghtInfoId));
//				for (FlightCrewScheduleInfoDO schedule : schedules) {
					// 如果有多条则取RANK_NO =A001的，如果 RANK_NO =A001 有多条 则取 FJS_ORDER = 1的
//					String pcodeTemp = schedule.getP_code();
//					String rankNoTemp = schedule.getRank_no();
//					Integer fjsOrderTemp = schedule.getFjs_order();
//					if (null != pcodeTemp) {
//						if (null == pcode ) {
//							pcode = pcodeTemp;
//							rankNo = rankNoTemp;
//							fjsOrder = fjsOrderTemp;
//						} else if (!"A001".equals(rankNo)) {
//							if ("A001".equals(rankNoTemp)) {
//								pcode = pcodeTemp;
//								rankNo = rankNoTemp;
//								fjsOrder = fjsOrderTemp;
//							}
//						} else if (!new Integer(1).equals(fjsOrder)) {
//							if ("A001".equals(rankNoTemp) && new Integer(1).equals(fjsOrderTemp)) {
//								pcode = pcodeTemp;
//								break;
//							}
//						}
//					}
//				}
//				if (null == pcode) {
//					log.error("航班ID:[" + filghtInfoId + "]对应的p_code不存在, 同步机长报告数据失败！");
//					continue;
//				}
//				FlightCrewMemberDO crewMember = flightCrewMemberDao.getByPcode(pcode);
//				if (null == crewMember || null == crewMember.getDep_code()) {
//					log.error("航班ID:[" + filghtInfoId + "]对应的p_code[" + pcode + "]对应的dep_code不存在, 同步机长报告数据失败！");
//					continue;
//				}
//				// 根据航班id获取对应的组织编号(根据d_code前6位字符找到对应的组织id，并将组织id保存到自定义字段"员工报告处理部门ID"中)
//				String dcode = crewMember.getDep_code().length() < 6 ? crewMember.getDep_code() : crewMember.getDep_code().substring(0, 6);
//				OrganizationDO org = organizationDao.getByDeptCode(dcode);
//				if (null == org) {
//					log.error("dep_code[" + dcode + "]对应的组织不存在, 同步机长报告数据失败！");
//					continue;
//				}
//				if (null == org.getUnit()) {
//					log.error("组织[" + org.getName() + "]对应的安监机构不存在, 同步机长报告数据失败！");
//					continue;
//				}
				// retvTime
				String retvTime = reportMap.get("retvTime") == null ? null : (String) reportMap.get("retvTime");
				// 创建人 TODO (暂定为匿名用户)
				UserDO anonymous = userDao.getByUsername("ANONYMITY");
				if (anonymous == null) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_112000001);
				}
				activityMap.put("creator", anonymous.getId());
				// 安监机构
				activityMap.put("unit", reportMap.get("pcno") == null ? null : Integer.parseInt((String) reportMap.get("pcno")));
				
				// 优先级
				activityMap.put("priority", priority.getId());
				// 类型
				activityMap.put("type", type.getId());
				// 描述
				String description = reportMap.get("reportContent") == null ? "" : (String) reportMap.get("reportContent");
				activityMap.put("description", description);
				// 主题
				String summary = description.length() > 50 ? description.substring(0, 50) + "..." : description;
				activityMap.put("summary", summary);
				
				// 自定义字段(将回收时间放在自定义字段中，用于同步时进行查询)
				Map<String, Object> customFieldMap = new HashMap<String, Object>();
				for (com.usky.sms.field.Field field : fieldRegister.getAllFields()) {
					String fieldName = field.getName();
					if ("回收时间".equals(fieldName)) {
						// 时间格式
						customFieldMap.put(field.getKey(), retvTime);
					} else if ("员工报告处理部门ID".equals(fieldName)) {
						// 组织id
						customFieldMap.put(field.getKey(), reportMap.get("cno"));
					} else if ("原机长报告创建人".equals(fieldName)) {
						// 报告人
						customFieldMap.put(field.getKey(), (String) reportMap.get("fullName"));
					} else if ("原机长报告创建人工号".equals(fieldName)) {
						// 原机长报告创建人工号
						customFieldMap.put(field.getKey(), (String) reportMap.get("confirmer"));
					} else if ("原机长报告所在组织".equals(fieldName)) {
						// 原机长报告所在组织
//						customFieldMap.put(field.getKey(), dcode);
					}
				}
				activityMap.putAll(customFieldMap);
				// 附件
				@SuppressWarnings("unchecked")
				List<String> fileUrls = (List<String>) reportMap.get("filearr");
				List<Map<String, Object>> files = new ArrayList<Map<String, Object>>();
				if (null != fileUrls) {
					for (String fileUrl : fileUrls) {
						if (null != fileUrl) {
							Map<String, Object> fileMap = new HashMap<String, Object>();
							String[] paths = fileUrl.split("/");
 							fileMap.put("name", paths[paths.length - 1]);
							fileMap.put("path", fileUrl);
							files.add(fileMap);
						}
					}
				}
				// 航班日期
				List<FlightInfoDO> flightInfos = flightInfoDao.getByFlightInfoID(Integer.parseInt(filghtInfoId));
				if (flightInfos.isEmpty()) {
					log.error("航班ID:[" + filghtInfoId + "]对应的航班信息不存在, 同步机长报告数据失败！");
					continue;
				}
				Date flightBJDate = flightInfos.get(0).getFlightBJDate();
				try {
					// 保存信息
					activityDao.submitAircraftCommanderReport(activityMap, files, flightInfoEntityMap, aircraftCommanderReportTemp.getId(), flightBJDate);
				} catch(Exception e){
					e.printStackTrace();
				}
			}
		}
	}
	
	/**
	 * 查询源为所指定ID的安全信息
	 * @param request
	 * @param response
	 */
	public void getByOrigin(HttpServletRequest request, HttpServletResponse response) {
		try {
			Integer id = request.getParameter("id") == null ? null : Integer.parseInt(request.getParameter("id"));
			@SuppressWarnings("unchecked")
			List<Integer> unitIds = (List<Integer>) (request.getParameter("unitIds") == null ? null : gson.fromJson(request.getParameter("unitIds"), new TypeToken<List<Integer>>() {}.getType()));
			if (id == null) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_101002003, "安全信息id");
			}
			if (unitIds == null || unitIds.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_101002003, "安监机构ids");
			}
			List<ActivityDO> activitys = activityDao.getByOrigin(id);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", activityDao.convert(activitys, Arrays.asList(new String[]{"id", "unit", "status"})));
			ResponseHelper.output(response, map);
			
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	/**
	 * 下发安全信息(员工报告)
	 * @param request
	 * @param response
	 */
	public void distributeActivity(HttpServletRequest request, HttpServletResponse response) {
		Integer id = request.getParameter("id") == null ? null : Integer.parseInt(request.getParameter("id"));
		try {
			@SuppressWarnings("unchecked")
			List<Integer> unitIds = (List<Integer>) (request.getParameter("unitIds") == null ? null : gson.fromJson(request.getParameter("unitIds"), new TypeToken<List<Integer>>() {}.getType()));
			if (id == null) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_101002003, "安全信息id");
			}
			if (unitIds == null || unitIds.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_101002003, "安监机构ids");
			}
			// 组织(自定义字段：所属处室)
			String reason = request.getParameter("reason");
			activityDao.distributeActivity(id, unitIds, reason);
			List<ActivityDO> activities = activityDao.getByOrigin(id);
			List<Integer> activityIds = new ArrayList<Integer>();
			for (ActivityDO a : activities) {
				activityIds.add(a.getId());
			}
			Map<String, Object> userMaps = processorDao.getProcessorUserMapsByActivityIds(activityIds);
			List<Map<String, Object>> assignments = activityDao.convert(activities, Arrays.asList(new String[]{"id", "unit", "status"}), false);
			for (Map<String, Object> assignment : assignments) {
				assignment.put("processors", userMaps.get(((Integer) assignment.get("id")).toString()));
			}
			Map<String, Object> dataMap = new HashMap<String, Object>();
			dataMap.put("activities", assignments);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", dataMap);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} finally {
			if (id != null) {
				ActivityDO activity = activityDao.internalGetById(id);
				List<ActivityDO> activities = new ArrayList<ActivityDO>();
				activities.add(activity);
				synchronizeService.synchronizeActivityWithThreads(activities, false);
			}
		}
	}
	
	/**
	 * 分配安全信息(专项风险管理), 以组织进行分配
	 * @param request
	 * @param response
	 */
	public void distributeActivityThroughDept(HttpServletRequest request, HttpServletResponse response) {
		Integer id = request.getParameter("id") == null ? null : Integer.parseInt(request.getParameter("id"));
		try {
			if (id == null) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_101002003, "安全信息id");
			}
			@SuppressWarnings("unchecked")
			List<Integer> orgIds = (List<Integer>) (request.getParameter("orgIds") == null ? null : gson.fromJson(request.getParameter("orgIds"), new TypeToken<List<Integer>>() {}.getType()));
			if (orgIds == null || orgIds.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_101002003, "组织ids");
			}
			@SuppressWarnings("unchecked")
			List<Integer> userIds = (List<Integer>) (request.getParameter("userIds") == null ? null : gson.fromJson(request.getParameter("userIds"), new TypeToken<List<Integer>>() {}.getType()));
			if (userIds == null || userIds.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_101002003, "用户ids");
			}
			// 组织(自定义字段：所属处室)
			activityDao.distributeActivityThroughOrgIds(id, orgIds, userIds);
			List<ActivityDO> activities = activityDao.getByOrigin(id);
			List<Integer> activityIds = new ArrayList<Integer>();
			for (ActivityDO a : activities) {
				activityIds.add(a.getId());
			}
			// 所属处室的自定义字段
			Map<Integer, Object> deptMaps = this.getActivityDeptValue(activities);
			// 处理提醒标识
			Map<Integer, Object> dealNoticeSigns = this.getActivityDealNoticeSigns(activities);
			Map<String, Object> userMaps = processorDao.getProcessorUserMapsByActivityIds(activityIds);
			List<Map<String, Object>> assignments = activityDao.convert(activities, Arrays.asList(new String[]{"id", "unit", "status"}), false);
			for (Map<String, Object> assignment : assignments) {
				assignment.put("processors", userMaps.get(((Integer) assignment.get("id")).toString()));
				assignment.put("organization", deptMaps.get((Integer) assignment.get("id")));
				assignment.put("dealNoticeSign", dealNoticeSigns.get((Integer) assignment.get("id")));
			}
			Map<String, Object> dataMap = new HashMap<String, Object>();
			dataMap.put("activities", assignments);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", dataMap);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} finally {
			if (id != null) {
				ActivityDO activity = activityDao.internalGetById(id);
				List<ActivityDO> activities = new ArrayList<ActivityDO>();
				activities.add(activity);
				synchronizeService.synchronizeActivityWithThreads(activities, false);
			}
		}
	}
	
	/**
	 * 将安全信息导出到pdf
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public void exportActivityToPdf(HttpServletRequest request, HttpServletResponse response) throws Exception{
		InputStream content = null;
		try {
			Map<String, Object> dataMap = new HashMap<String, Object>();
			int activityId = Integer.parseInt(request.getParameter("activity"));
			List<String> permissions = Collections.emptyList();
			boolean isEmployeeReport = false;
			ActivityDO activity = activityDao.internalGetById(activityId);
			
			// 基本信息
			Map<String, Object> baseArea = this.getBaseArea(activity);
			baseArea.remove("fields");
			Map<String, Object> activityMap = (Map<String, Object>) baseArea.get("activity");
			if (activityMap != null) {
				List<String> label = (List<String>) activityMap.remove("label");
				if (label != null && !label.isEmpty()) {
					activityMap.put("label", label.get(0));
				}
			}
			List<Map<String, Object>> tabs = (List<Map<String, Object>>) baseArea.remove("tabs");
			if (tabs != null && !tabs.isEmpty()) {
				List<Map<String, Object>> fields = (List<Map<String, Object>>) tabs.get(0).get("fields");
				// 将fields分为左右两部分
				if (fields != null && !fields.isEmpty()) {
					List<Map<String, Object>> newFields = new ArrayList<Map<String,Object>>();
					int i = 0;
					Map<String, Object> rowMap = null;
					for (Map<String, Object> field : fields) {
						if (i % 2 == 0) {
							rowMap = new HashMap<String, Object>();
							rowMap.put("leftField", field);
							if (i == fields.size() - 1) {
								newFields.add(rowMap);
							}
						} else {
							rowMap.put("rightField", field);
							newFields.add(rowMap);
						}
						i++;
					}
					baseArea.put("fields", newFields);
				}
			}
			
			dataMap.put("baseArea", baseArea);
			
			// 任务分配(子安全信息)
			dataMap.put("subActivityArea", this.getSubActivityArea(activity, permissions));
			
			// 附件
			Map<String, Object> attachmentArea = this.getAttachmentArea(activity, isEmployeeReport);
			if (attachmentArea != null) {
				attachmentArea.put("files", fileDao.convert(fileDao.getFilesBySource(EnumFileType.SAFETYINFORMATION.getCode(), activity.getId()), Arrays.asList(new String[]{"fileName", "directory", "size", "uploadTime"}), false));
			}
			dataMap.put("attachmentArea", attachmentArea);
			
			// 信息获取
			dataMap.put("accessInformationArea", this.getAccessInformationArea(activity, permissions, isEmployeeReport));
			
			// tem
			dataMap.put("temArea", this.getTemArea(activity, permissions, isEmployeeReport));
			
			// 航线信息
			dataMap.put("airlineInfoArea", this.getAirlineInfoArea(activity, permissions, isEmployeeReport));
			
			// 风险任务
			dataMap.put("riskTaskArea", this.getRiskTaskArea(activity, permissions, isEmployeeReport));
			
			// 事件分析(SHEL模型)
			Map<String, Object> eventAnalysisArea = this.getEventAnalysisArea(activity, permissions, isEmployeeReport);
			if (eventAnalysisArea != null) {
				List<Map<String, Object>> eventAnalysises = (List<Map<String, Object>>) eventAnalysisArea.get("eventAnalysises");
				if (eventAnalysises != null && !eventAnalysises.isEmpty()) {
					for (Map<String, Object> eventAnalysis : eventAnalysises) {
						Map<String, Object> actionItem = (Map<String, Object>) eventAnalysis.get("actionItem");
						if (actionItem != null) {
							List<Map<String, Object>> organizations = (List<Map<String, Object>>) actionItem.get("organizations");
							if (organizations != null && !organizations.isEmpty()) {
								actionItem.put("organizationsDisplayName", organizations.get(0).get("name"));
							}
							List<Map<String, Object>> confirmMan = (List<Map<String, Object>>) actionItem.get("confirmMan");
							if (confirmMan != null && !confirmMan.isEmpty()) {
								actionItem.put("confirmManDisplayName", confirmMan.get(0).get("fullname"));
							}
						}
					}
				}
			}
			dataMap.put("eventAnalysisArea", eventAnalysisArea);
			
			// 用户
			Map<String, Object> userArea = this.getUserArea(activity);
			if (userArea != null) {
				List<Map<String, Object>> assignees = (List<Map<String, Object>>) userArea.get("assignees");
				if (assignees != null && !assignees.isEmpty()) {
					StringBuilder assigneesDisplayName = new StringBuilder();
					for (Map<String, Object> assignee : assignees) {
						String fullname = (String) assignee.get("fullname");
						if (fullname != null) {
							assigneesDisplayName.append(fullname).append(",");
						}
					}
					assigneesDisplayName.setLength(assigneesDisplayName.length() - 1);
					userArea.put("assigneesDisplayName", assigneesDisplayName.toString());
				}
			}
			dataMap.put("userArea", userArea);
			
			// 日期
			dataMap.put("dateArea", this.getDateArea(activity));
			
			// 备注
			dataMap.put("actionArea", this.getActionArea(activity));
			
			// 文件根路径
			String root = request.getSession().getServletContext().getRealPath("/");
			if (root == null) {
				root = ActivityService.class.getResource("/").getPath() + "/../..";
			}
			List<JasperPrint> jasperPrintList = new ArrayList<JasperPrint>();
			// 正文内容
			List<Object> contentDatas = new ArrayList<Object>();
			contentDatas.add(dataMap);
			String contentUrl = root + ACTIVITY_REPORT_TEMPLATE_FILE_PATH;
			content = new FileInputStream(new File(contentUrl));
			JasperReport contentReport = (JasperReport) JRLoader.loadObject(content);
			JRDataSource contentData = new JRBeanCollectionDataSource(contentDatas, false);
			// 参数
			Map<String, Object> parameter = new HashMap<String, Object>();
			parameter.putAll(dataMap);
			JasperPrint contentPrint = JasperFillManager.fillReport(contentReport, parameter, contentData);
			jasperPrintList.add(contentPrint);
			
			JasperHelper.exportToPdf(jasperPrintList, DOWNLOAD_FILE_NAME, response);
		} catch (Exception e) {
			e.printStackTrace();
			if (!response.isCommitted()) {
				response.reset();
				ResponseHelper.output(response, "导出失败！" + e.getMessage());
			}
		} finally {
			IOUtils.closeQuietly(content);
		}
	}
	
	/**
	 * 获取待我处理的安全信息
	 * @param request
	 * @param response
	 */
	public void getToDoActivities(HttpServletRequest request, HttpServletResponse response) {
		try {
			Map<String, Object> sort = gson.fromJson(request.getParameter("sort"), new TypeToken<Map<String, Object>>() {}.getType());
			Integer start = StringUtils.isBlank(request.getParameter("start")) ? null : Integer.parseInt(request.getParameter("start"));
			Integer length = StringUtils.isBlank(request.getParameter("length")) ? null : Integer.parseInt(request.getParameter("length"));
			Integer end = null;
			if (null != start && null != length) {
				end = start + length;
				// start是从0开始
				start = start + 1;
			}
			String infoType = request.getParameter("infoType");
			boolean typeInclude = false;
			if ("risk".equals(infoType)) {
				typeInclude = true;
			}
			// 风险的类型code
			String[] riskTypeCodes = {EnumActivityType.RISK_MANAGEMENT.toString(), EnumActivityType.RISK_ANALYSIS.toString(), EnumActivityType.NEW_AIRLINE.toString()};
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", activityDao.getToDoActivities(UserContext.getUserId(), riskTypeCodes, typeInclude, sort, start, end));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getStaffReportStatusDist(HttpServletRequest request, HttpServletResponse response) {
		try {
			String[] timeRangeArr = getTimeRangeByRequest(request);
			
			int finishedCnt = activityDao.getStaffReportStatus("结案", timeRangeArr[0], timeRangeArr[1]);
			int notAppliedCnt = activityDao.getStaffReportStatus("不适用", timeRangeArr[0], timeRangeArr[1]);
			int processingCnt = activityDao.getStaffReportStatusProcessing(timeRangeArr[0], timeRangeArr[1]);
			
			Map<String, Object> data = new HashMap<String, Object>();
			Map<String, Object> finishedMap = new HashMap<String, Object>();
			Map<String, Object> notAppliedMap = new HashMap<String, Object>();
			Map<String, Object> processingMap = new HashMap<String, Object>();
			List<String> nameList = new ArrayList<String>();
			if (finishedCnt != 0) {
				nameList.add("办结");
				finishedMap.put("value", String.valueOf(finishedCnt));
				finishedMap.put("name", "办结");
			}
			if (notAppliedCnt != 0) {
				nameList.add("不适用");
				notAppliedMap.put("value", String.valueOf(notAppliedCnt));
				notAppliedMap.put("name", "不适用");
			}
			if (processingCnt != 0) {
				nameList.add("进行中");
				processingMap.put("value", String.valueOf(processingCnt));
				processingMap.put("name", "进行中");
			}
			data.put("nameData", nameList);
			
			List<Map<String, Object>> seriesDataList = new ArrayList<Map<String, Object>>();
			if (finishedMap.size() > 0) {
				seriesDataList.add(finishedMap);
			}
			if (notAppliedMap.size() > 0) {
				seriesDataList.add(notAppliedMap);
			}
			if (processingMap.size() > 0) {
				seriesDataList.add(processingMap);
			}
			data.put("seriesData", seriesDataList);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getStaffRptOverdueList(HttpServletRequest request, HttpServletResponse response) {
		try {
			String startDate = request.getParameter("startDate");
			
			String endDateForSearch = null;
			if (startDate == null || "".equals(startDate)) {
				Calendar calNow = Calendar.getInstance();
				SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
				endDateForSearch = sdf.format(calNow.getTime());
			} else {
				endDateForSearch = startDate;
			}
			
			List<Object[]> staffRptOverdueRs = activityDao.getStaffRptOverdueCnt(endDateForSearch);
			
			List<String> deptList = new ArrayList<String>();
			deptList.add("安监部");
			
			List<String> cntList = new ArrayList<String>();
			if (staffRptOverdueRs != null && staffRptOverdueRs.size() > 0) {
				cntList.add((staffRptOverdueRs.get(0))[1].toString());
			} else {
				cntList.add("0");
			}
			
			Map<String, Object> data = new HashMap<String, Object>();
			data.put("deptData", deptList);
			data.put("seriesData", cntList);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void setAccessInformationActivityTypeEntityDao(AccessInformationActivityTypeEntityDao accessInformationActivityTypeEntityDao) {
		this.accessInformationActivityTypeEntityDao = accessInformationActivityTypeEntityDao;
	}
	
	public void setAccessInformationDao(AccessInformationDao accessInformationDao) {
		this.accessInformationDao = accessInformationDao;
	}
	
	public void setActionDao(ActionDao actionDao) {
		this.actionDao = actionDao;
	}
	
	public void setActivityDao(ActivityDao activityDao) {
		this.activityDao = activityDao;
	}
	
	public void setActivityPriorityDao(ActivityPriorityDao activityPriorityDao) {
		this.activityPriorityDao = activityPriorityDao;
	}
	
	public void setActivitySecurityLevelDao(ActivitySecurityLevelDao activitySecurityLevelDao) {
		this.activitySecurityLevelDao = activitySecurityLevelDao;
	}
	
	public void setActivitySecurityLevelEntityDao(ActivitySecurityLevelEntityDao activitySecurityLevelEntityDao) {
		this.activitySecurityLevelEntityDao = activitySecurityLevelEntityDao;
	}
	
	public void setActivitySecuritySchemeDao(ActivitySecuritySchemeDao activitySecuritySchemeDao) {
		this.activitySecuritySchemeDao = activitySecuritySchemeDao;
	}
	
	public void setActivityTypeDao(ActivityTypeDao activityTypeDao) {
		this.activityTypeDao = activityTypeDao;
	}
	
	public void setActivityTypeSchemeDao(ActivityTypeSchemeDao activityTypeSchemeDao) {
		this.activityTypeSchemeDao = activityTypeSchemeDao;
	}
	
	public void setActivityTypeSchemeMappingDao(ActivityTypeSchemeMappingDao activityTypeSchemeMappingDao) {
		this.activityTypeSchemeMappingDao = activityTypeSchemeMappingDao;
	}
	
	public void setAirlineInfoActivityTypeEntityDao(AirlineInfoActivityTypeEntityDao airlineInfoActivityTypeEntityDao) {
		this.airlineInfoActivityTypeEntityDao = airlineInfoActivityTypeEntityDao;
	}
	
	public void setAirlineInfoDao(AirlineInfoDao airlineInfoDao) {
		this.airlineInfoDao = airlineInfoDao;
	}
	
	public void setCustomFieldConfigSchemeDao(CustomFieldConfigSchemeDao customFieldConfigSchemeDao) {
		this.customFieldConfigSchemeDao = customFieldConfigSchemeDao;
	}
	
	public void setCustomFieldValueDao(CustomFieldValueDao customFieldValueDao) {
		this.customFieldValueDao = customFieldValueDao;
	}
	
	public void setFieldLayoutItemDao(FieldLayoutItemDao fieldLayoutItemDao) {
		this.fieldLayoutItemDao = fieldLayoutItemDao;
	}
	
	public void setFieldRegister(FieldRegister fieldRegister) {
		this.fieldRegister = fieldRegister;
	}
	
	public void setFieldScreenDao(FieldScreenDao fieldScreenDao) {
		this.fieldScreenDao = fieldScreenDao;
	}
	
	public void setFieldScreenTabDao(FieldScreenTabDao fieldScreenTabDao) {
		this.fieldScreenTabDao = fieldScreenTabDao;
	}
	
	public void setFieldScreenLayoutItemDao(FieldScreenLayoutItemDao fieldScreenLayoutItemDao) {
		this.fieldScreenLayoutItemDao = fieldScreenLayoutItemDao;
	}
	
	public void setFileDao(FileDao fileDao) {
		this.fileDao = fileDao;
	}
	
	public void setFlightInfoEntityDao(FlightInfoEntityDao flightInfoEntityDao) {
		this.flightInfoEntityDao = flightInfoEntityDao;
	}
	
	public void setGroundPositionEntityDao(GroundPositionEntityDao groundPositionEntityDao) {
		this.groundPositionEntityDao = groundPositionEntityDao;
	}
	
	public void setGroundStaffEntityDao(GroundStaffEntityDao groundStaffEntityDao) {
		this.groundStaffEntityDao = groundStaffEntityDao;
	}
	
	public void setLabelDao(LabelDao labelDao) {
		this.labelDao = labelDao;
	}
	
	public void setMaintainToolEntityDao(MaintainToolEntityDao maintainToolEntityDao) {
		this.maintainToolEntityDao = maintainToolEntityDao;
	}
	
	public void setOrganizationEntityDao(OrganizationEntityDao organizationEntityDao) {
		this.organizationEntityDao = organizationEntityDao;
	}
	
	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}
	
	public void setRiskTaskActivityTypeEntityDao(RiskTaskActivityTypeEntityDao riskTaskActivityTypeEntityDao) {
		this.riskTaskActivityTypeEntityDao = riskTaskActivityTypeEntityDao;
	}
	
	public void setRiskTaskDao(RiskTaskDao riskTaskDao) {
		this.riskTaskDao = riskTaskDao;
	}
	
	public void setTemActivityTypeEntityDao(TemActivityTypeEntityDao temActivityTypeEntityDao) {
		this.temActivityTypeEntityDao = temActivityTypeEntityDao;
	}
	
	public void setTemDao(TemDao temDao) {
		this.temDao = temDao;
	}
	
	public void setTransactionHelper(TransactionHelper transactionHelper) {
		this.transactionHelper = transactionHelper;
	}
	
	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}
	
	public void setUnitConfigDao(UnitConfigDao unitConfigDao) {
		this.unitConfigDao = unitConfigDao;
	}
	
	public void setUserAssociationDao(UserAssociationDao userAssociationDao) {
		this.userAssociationDao = userAssociationDao;
	}
	
	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}
	
	public void setUserHistoryItemDao(UserHistoryItemDao userHistoryItemDao) {
		this.userHistoryItemDao = userHistoryItemDao;
	}
	
	public void setUserService(UserService userService) {
		this.userService = userService;
	}
	
	public void setVehicleInfoEntityDao(VehicleInfoEntityDao vehicleInfoEntityDao) {
		this.vehicleInfoEntityDao = vehicleInfoEntityDao;
	}
	
	public void setOrganizationDao(OrganizationDao organizationDao) {
		this.organizationDao = organizationDao;
	}
	
	public void setFileService(FileService fileService) {
		this.fileService = fileService;
	}
	
	public void setActivityStatusDao(ActivityStatusDao activityStatusDao) {
		this.activityStatusDao = activityStatusDao;
	}
	
	public void setSolrService(SolrService solrService) {
		this.solrService = solrService;
	}
	
	public void setImportProgress(ImportProgress importProgress) {
		this.importProgress = importProgress;
	}
	
	public void setQueryService(QueryService queryService) {
		this.queryService = queryService;
	}
	
	public void setDictionaryDao(DictionaryDao dictionaryDao) {
		this.dictionaryDao = dictionaryDao;
	}

	public void setFlightCrewScheduleInfoDao(FlightCrewScheduleInfoDao flightCrewScheduleInfoDao) {
		this.flightCrewScheduleInfoDao = flightCrewScheduleInfoDao;
	}

	public void setFlightCrewMemberDao(FlightCrewMemberDao flightCrewMemberDao) {
		this.flightCrewMemberDao = flightCrewMemberDao;
	}

	public void setAircraftCommanderReportTempDao(AircraftCommanderReportTempDao aircraftCommanderReportTempDao) {
		this.aircraftCommanderReportTempDao = aircraftCommanderReportTempDao;
	}

	public void setRewardsActivityTypeEntityDao(RewardsActivityTypeEntityDao rewardsActivityTypeEntityDao) {
		this.rewardsActivityTypeEntityDao = rewardsActivityTypeEntityDao;
	}

	public void setRewardsDao(RewardsDao rewardsDao) {
		this.rewardsDao = rewardsDao;
	}

	public void setFlightInfoDao(FlightInfoDao flightInfoDao) {
		this.flightInfoDao = flightInfoDao;
	}

	public void setEventAnalysisActivityTypeEntityDao(EventAnalysisActivityTypeEntityDao eventAnalysisActivityTypeEntityDao) {
		this.eventAnalysisActivityTypeEntityDao = eventAnalysisActivityTypeEntityDao;
	}

	public void setEventAnalysisDao(EventAnalysisDao eventAnalysisDao) {
		this.eventAnalysisDao = eventAnalysisDao;
	}

	public void setProcessorDao(ProcessorDao processorDao) {
		this.processorDao = processorDao;
	}

	public void setConfig(Config config) {
		this.config = config;
	}

	public void setActivityDistributeConfigDao(ActivityDistributeConfigDao activityDistributeConfigDao) {
		this.activityDistributeConfigDao = activityDistributeConfigDao;
	}

	public void setSynchronizeService(SynchronizeService synchronizeService) {
		this.synchronizeService = synchronizeService;
	}
	public void setSystemAnalysisRiskAnalysisActivityTypeEntityDao(
			SystemAnalysisRiskAnalysisActivityTypeEntityDao systemAnalysisRiskAnalysisActivityTypeEntityDao) {
		this.systemAnalysisRiskAnalysisActivityTypeEntityDao = systemAnalysisRiskAnalysisActivityTypeEntityDao;
	}

	public void setSystemAnalysisActivityTypeEntityDao(
			SystemAnalysisActivityTypeEntityDao systemAnalysisActivityTypeEntityDao) {
		this.systemAnalysisActivityTypeEntityDao = systemAnalysisActivityTypeEntityDao;
	}

	public void setSystemAnalysisMappingDao(SystemAnalysisMappingDao systemAnalysisMappingDao) {
		this.systemAnalysisMappingDao = systemAnalysisMappingDao;
	}

	public void setResidualDerivativeRiskDao(ResidualDerivativeRiskDao residualDerivativeRiskDao) {
		this.residualDerivativeRiskDao = residualDerivativeRiskDao;
	}

	public void setSystemAnalysisRiskAnalysisDao(SystemAnalysisRiskAnalysisDao systemAnalysisRiskAnalysisDao) {
		this.systemAnalysisRiskAnalysisDao = systemAnalysisRiskAnalysisDao;
	}

	public void setSystemAnalysisRiskAnalysisConclusionDao(
			SystemAnalysisRiskAnalysisConclusionDao systemAnalysisRiskAnalysisConclusionDao) {
		this.systemAnalysisRiskAnalysisConclusionDao = systemAnalysisRiskAnalysisConclusionDao;
	}

	public void setUnitRoleActorDao(UnitRoleActorDao unitRoleActorDao) {
		this.unitRoleActorDao = unitRoleActorDao;
	}

	/**
	 * @title 新增
	 * @param request
	 * @param response
	 */
	public void getDefectTypeList(HttpServletRequest request, HttpServletResponse response) {
		try {
			String[] timeRangeArr = getTimeRangeByRequest(request);
			
			Map<String, List<String>> resultMap = activityDao.getDefectTypeList(timeRangeArr[0], timeRangeArr[1]);
			
			Map<String, Object> data = new HashMap<String, Object>();
			int totalSize = activityDao.getDefectTypeAllList(timeRangeArr[0], timeRangeArr[1]).size();
			data.put("totalSize", String.valueOf(totalSize));
			
			List<String> defectTypeNameList = resultMap.get("defectTypeNameList");
			List<String> defectTypeNameValList = resultMap.get("defectTypeNameValList");
			
			if (defectTypeNameList.size() >= 10) {
				data.put("xAxisdata", defectTypeNameList.subList(0, 10));
				data.put("seriesData", defectTypeNameValList.subList(0, 10));
			} else {
				data.put("xAxisdata", defectTypeNameList.subList(0, defectTypeNameList.size()));
				data.put("seriesData", defectTypeNameValList.subList(0, defectTypeNameValList.size()));
			}
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getMeasureTypeList(HttpServletRequest request, HttpServletResponse response) {
		try {
			String[] timeRangeArr = getTimeRangeByRequest(request);
			
			Map<String, List<String>> resultMap = activityDao.getMeasureTypeList(timeRangeArr[0], timeRangeArr[1]);
			
			Map<String, Object> data = new HashMap<String, Object>();
			int totalSize = activityDao.getMeasureTypeAllList(timeRangeArr[0], timeRangeArr[1]).size();
			data.put("totalSize", String.valueOf(totalSize));
			
			List<String> measureTypeNameList = resultMap.get("measureTypeNameList");
			List<String> measureTypeNameValList = resultMap.get("measureTypeNameValList");
			
			if (measureTypeNameList.size() >= 10) {
				data.put("xAxisdata", measureTypeNameList.subList(0, 10));
				data.put("seriesData", measureTypeNameValList.subList(0, 10));
			} else {
				data.put("xAxisdata", measureTypeNameList.subList(0, measureTypeNameList.size()));
				data.put("seriesData", measureTypeNameValList.subList(0, measureTypeNameValList.size()));
			}
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	private String[] getTimeRangeByRequest(HttpServletRequest request) {
		String year = request.getParameter("year");
		String month = request.getParameter("month");
		
		Calendar currentMonthDate = DateHelper.getCalendar();
		if (year != null && !"0".equals(year) && month != null && !"0".equals(month)) {
			currentMonthDate.set(Calendar.YEAR, Integer.parseInt(year));
			currentMonthDate.set(Calendar.MONTH, Integer.parseInt(month) - 1);
		}
		int currentMonthYear = currentMonthDate.get(Calendar.YEAR);
		int currentMonthMonth = currentMonthDate.get(Calendar.MONTH) + 1;
		
		Calendar nextMonthDate = DateHelper.getCalendar();
		if (year != null && !"0".equals(year) && month != null && !"0".equals(month)) {
			nextMonthDate.set(Calendar.YEAR, Integer.parseInt(year));
			nextMonthDate.set(Calendar.MONTH, Integer.parseInt(month) - 1);
		}
		nextMonthDate.add(Calendar.MONTH, 1);
		int nextMonthYear = nextMonthDate.get(Calendar.YEAR);
		int nextMonthMonth = nextMonthDate.get(Calendar.MONTH) + 1;
		
		String startTime = null;
		String endTime = null;
		if (currentMonthMonth < 10) {
			startTime = currentMonthYear + "-0" + currentMonthMonth + "-01 00:00:00";
		} else {
			startTime = currentMonthYear + "-" + currentMonthMonth + "-01 00:00:00";
		}
		if (nextMonthMonth < 10) {
			endTime = nextMonthYear + "-0" + nextMonthMonth + "-01 00:00:00";
		} else {
			endTime = nextMonthYear + "-" + nextMonthMonth + "-01 00:00:00";
		}
		return new String[]{startTime, endTime};
	}
	
	public void getInfoTypeCntByMonth(HttpServletRequest request, HttpServletResponse response) {
		try {
			String yearBegin = request.getParameter("yearBegin");
			String monthBegin = request.getParameter("monthBegin");
			String yearEnd = request.getParameter("yearEnd");
			String monthEnd = request.getParameter("monthEnd");
			
			Calendar calBegin = Calendar.getInstance();
			if (yearBegin != null && !"0".equals(yearBegin) && monthBegin != null && !"0".equals(monthBegin)) {
				calBegin.set(Calendar.YEAR, Integer.parseInt(yearBegin));
				calBegin.set(Calendar.MONTH, Integer.parseInt(monthBegin) - 1);
				calBegin.set(Calendar.DAY_OF_MONTH, 1);
			} else {
				calBegin.set(Calendar.MONTH, 0);
				calBegin.set(Calendar.DAY_OF_MONTH, 1);
			}
			
			Calendar calEnd = Calendar.getInstance();
			if (yearEnd != null && !"0".equals(yearEnd) && monthEnd != null && !"0".equals(monthEnd)) {
				calEnd.set(Calendar.YEAR, Integer.parseInt(yearEnd));
				calEnd.set(Calendar.MONTH, Integer.parseInt(monthEnd));
				calEnd.set(Calendar.DAY_OF_MONTH, 1);
			} else {
				calEnd.set(Calendar.DAY_OF_MONTH, 1);
				calEnd.add(Calendar.MONTH, 1);
			}
			
			int startDateYear = calBegin.get(Calendar.YEAR);
			int startDateMonth = calBegin.get(Calendar.MONTH) + 1;
			int endDateYear = calEnd.get(Calendar.YEAR);
			int endDateMonth = calEnd.get(Calendar.MONTH) + 1;
			String startDateStr = null;
			if (startDateMonth < 10) {
				startDateStr = startDateYear + "-0" + startDateMonth + "-01 00:00:00";
			} else {
				startDateStr = startDateYear + "-" + startDateMonth + "-01 00:00:00";
			}
			String endDateStr = null;
			if (endDateMonth < 10) {
				endDateStr = endDateYear + "-0" + endDateMonth + "-01 00:00:00";
			} else {
				endDateStr = endDateYear + "-" + endDateMonth + "-01 00:00:00";
			}
			
			Map<String, Object> data = new HashMap<String, Object>();
			List<String> dateArr = DateHelper.getDatesBetweenTwoDateForMonth(calBegin.getTime(), calEnd.getTime());
			data.put("xAxisdata", dateArr);
			
			Map<String, String> resultData = activityDao.getInfoTypeCntByMonth(startDateStr, endDateStr);
			List<String> staffReportList = new ArrayList<String>();
			List<String> captainReportList = new ArrayList<String>();
			List<String> continousReportList = new ArrayList<String>();
			List<String> airSafeReportList = new ArrayList<String>();
			for (String dateTmp : dateArr) {
				if (resultData.size() <= 0){
					break;
				}
				if (resultData.get(dateTmp + "员工安全报告") != null) {
					staffReportList.add(resultData.get(dateTmp + "员工安全报告").toString());
				} else {
					staffReportList.add("");
				}
				if (resultData.get(dateTmp + "机长报告") != null) {
					captainReportList.add(resultData.get(dateTmp + "机长报告").toString());
				} else {
					captainReportList.add("");
				}
				if (resultData.get(dateTmp + "持续监控信息") != null) {
					continousReportList.add(resultData.get(dateTmp + "持续监控信息").toString());
				} else {
					continousReportList.add("");
				}
				if (resultData.get(dateTmp + "航空安全信息") != null) {
					airSafeReportList.add(resultData.get(dateTmp + "航空安全信息").toString());
				} else {
					airSafeReportList.add("");
				}
			}
			data.put("staffReportList", staffReportList);
			data.put("captainReportList", captainReportList);
			data.put("continousReportList", continousReportList);
			data.put("airSafeReportList", airSafeReportList);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getStaffRptCntByDay(HttpServletRequest request, HttpServletResponse response) {
		try {
			String startDate = request.getParameter("startDate");
			String endDate = request.getParameter("endDate");
			String unitId = null;
			
			if (request.getParameter("unitId") == null || "".equals(request.getParameter("unitId"))) {
				unitId = "0";
			} else {
				unitId = request.getParameter("unitId");
			}
			
			List<String> dateArr = null;
			if ((startDate == null || "".equals(startDate)) && (endDate == null || "".equals(endDate))) {
				dateArr = DateHelper.getDatesBetweenTwoDate("", "");
			} else {
				dateArr = DateHelper.getDatesBetweenTwoDate(startDate, endDate);
			}
			String startDateStr = dateArr.get(0) + " 00:00:00";
			
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			Date dateEnd = sdf.parse(dateArr.get(dateArr.size() - 1));
			Calendar calEndForSearch = Calendar.getInstance();
			calEndForSearch.setTime(dateEnd);
			calEndForSearch.add(Calendar.DAY_OF_MONTH, 1);
			String endDateStr = sdf.format(calEndForSearch.getTime()) + " 00:00:00";
			
			Map<String, Object> data = new HashMap<String, Object>();
			data.put("xAxisdata", dateArr);
			
			Map<String, String> niMingData = activityDao.getStaffRptCntByDay(startDateStr, endDateStr, unitId, "NiMing");
			Map<String, String> shiMingData = activityDao.getStaffRptCntByDay(startDateStr, endDateStr, unitId, "ShiMing");
			List<String> niMingList = new ArrayList<String>();
			List<String> shiMingList = new ArrayList<String>();
			for (String dateTmp : dateArr) {
				if (niMingData.size() <= 0 && shiMingData.size() <= 0){
					break;
				}
				if (niMingData.get(dateTmp) != null) {
					niMingList.add(niMingData.get(dateTmp).toString());
				} else {
					niMingList.add("");
				}
				if (shiMingData.get(dateTmp) != null) {
					shiMingList.add(shiMingData.get(dateTmp).toString());
				} else {
					shiMingList.add("");
				}
			}
			data.put("staffNiMingList", niMingList);
			data.put("staffShiMingList", shiMingList);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getStaffRptCntByMonth(HttpServletRequest request, HttpServletResponse response) {
		try {
			String yearBegin = request.getParameter("yearBegin");
			String monthBegin = request.getParameter("monthBegin");
			String yearEnd = request.getParameter("yearEnd");
			String monthEnd = request.getParameter("monthEnd");
			String unitId = null;
			
			if (request.getParameter("unitId") == null || "".equals(request.getParameter("unitId"))) {
				unitId = "0";
			} else {
				unitId = request.getParameter("unitId");
			}
			
			Calendar calBegin = Calendar.getInstance();
			if (yearBegin != null && !"0".equals(yearBegin) && monthBegin != null && !"0".equals(monthBegin)) {
				calBegin.set(Calendar.YEAR, Integer.parseInt(yearBegin));
				calBegin.set(Calendar.MONTH, Integer.parseInt(monthBegin) - 1);
				calBegin.set(Calendar.DAY_OF_MONTH, 1);
			} else {
				calBegin.set(Calendar.MONTH, 0);
				calBegin.set(Calendar.DAY_OF_MONTH, 1);
			}
			
			Calendar calEnd = Calendar.getInstance();
			if (yearEnd != null && !"0".equals(yearEnd) && monthEnd != null && !"0".equals(monthEnd)) {
				calEnd.set(Calendar.YEAR, Integer.parseInt(yearEnd));
				calEnd.set(Calendar.MONTH, Integer.parseInt(monthEnd));
				calEnd.set(Calendar.DAY_OF_MONTH, 1);
			} else {
				calEnd.set(Calendar.DAY_OF_MONTH, 1);
				calEnd.add(Calendar.MONTH, 1);
			}
			
			int startDateYear = calBegin.get(Calendar.YEAR);
			int startDateMonth = calBegin.get(Calendar.MONTH) + 1;
			int endDateYear = calEnd.get(Calendar.YEAR);
			int endDateMonth = calEnd.get(Calendar.MONTH) + 1;
			String startDateStr = null;
			if (startDateMonth < 10) {
				startDateStr = startDateYear + "-0" + startDateMonth + "-01 00:00:00";
			} else {
				startDateStr = startDateYear + "-" + startDateMonth + "-01 00:00:00";
			}
			String endDateStr = null;
			if (endDateMonth < 10) {
				endDateStr = endDateYear + "-0" + endDateMonth + "-01 00:00:00";
			} else {
				endDateStr = endDateYear + "-" + endDateMonth + "-01 00:00:00";
			}
			
			Map<String, Object> data = new HashMap<String, Object>();
			List<String> dateArr = DateHelper.getDatesBetweenTwoDateForMonth(calBegin.getTime(), calEnd.getTime());
			data.put("xAxisdata", dateArr);
			
			Map<String, String> niMingData = activityDao.getStaffRptCntByMonth(startDateStr, endDateStr, unitId, "NiMing");
			Map<String, String> shiMingData = activityDao.getStaffRptCntByMonth(startDateStr, endDateStr, unitId, "ShiMing");
			List<String> niMingList = new ArrayList<String>();
			List<String> shiMingList = new ArrayList<String>();
			for (String dateTmp : dateArr) {
				if (niMingData.size() <= 0 && shiMingData.size() <= 0){
					break;
				}
				if (niMingData.get(dateTmp) != null) {
					niMingList.add(niMingData.get(dateTmp).toString());
				} else {
					niMingList.add("");
				}
				if (shiMingData.get(dateTmp) != null) {
					shiMingList.add(shiMingData.get(dateTmp).toString());
				} else {
					shiMingList.add("");
				}
			}
			data.put("staffNiMingList", niMingList);
			data.put("staffShiMingList", shiMingList);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	
	public void getStaffRptCntByDept(HttpServletRequest request, HttpServletResponse response) {
		try {
			String yearBegin = request.getParameter("yearBegin");
			String monthBegin = request.getParameter("monthBegin");
			String yearEnd = request.getParameter("yearEnd");
			String monthEnd = request.getParameter("monthEnd");
			
			Calendar calBegin = Calendar.getInstance();
			if (yearBegin != null && !"0".equals(yearBegin) && monthBegin != null && !"0".equals(monthBegin)) {
				calBegin.set(Calendar.YEAR, Integer.parseInt(yearBegin));
				calBegin.set(Calendar.MONTH, Integer.parseInt(monthBegin) - 1);
				calBegin.set(Calendar.DAY_OF_MONTH, 1);
			} else {
				calBegin.set(Calendar.MONTH, 0);
				calBegin.set(Calendar.DAY_OF_MONTH, 1);
			}
			
			Calendar calEnd = Calendar.getInstance();
			if (yearEnd != null && !"0".equals(yearEnd) && monthEnd != null && !"0".equals(monthEnd)) {
				calEnd.set(Calendar.YEAR, Integer.parseInt(yearEnd));
				calEnd.set(Calendar.MONTH, Integer.parseInt(monthEnd));
				calEnd.set(Calendar.DAY_OF_MONTH, 1);
			} else {
				calEnd.set(Calendar.DAY_OF_MONTH, 1);
				calEnd.add(Calendar.MONTH, 1);
			}
			
			int startDateYear = calBegin.get(Calendar.YEAR);
			int startDateMonth = calBegin.get(Calendar.MONTH) + 1;
			int endDateYear = calEnd.get(Calendar.YEAR);
			int endDateMonth = calEnd.get(Calendar.MONTH) + 1;
			String startDateStr = null;
			if (startDateMonth < 10) {
				startDateStr = startDateYear + "-0" + startDateMonth + "-01 00:00:00";
			} else {
				startDateStr = startDateYear + "-" + startDateMonth + "-01 00:00:00";
			}
			String endDateStr = null;
			if (endDateMonth < 10) {
				endDateStr = endDateYear + "-0" + endDateMonth + "-01 00:00:00";
			} else {
				endDateStr = endDateYear + "-" + endDateMonth + "-01 00:00:00";
			}
			
			Map<String, String> resultDataMap = activityDao.getStaffRptCntByDept(startDateStr, endDateStr);
			List<String> nameDataList = new ArrayList<String>();
			List<Map<String, Object>> seriesDataList = new ArrayList<Map<String, Object>>();
			Iterator<String> iter = resultDataMap.keySet().iterator();
			while (iter.hasNext()) {
				String deptName = iter.next();
				String deptValue = resultDataMap.get(deptName);
				nameDataList.add(deptName);
				Map<String, Object> tmpMap = new HashMap<String, Object>();
				tmpMap.put("value", deptValue);
				tmpMap.put("name", deptName);
				seriesDataList.add(tmpMap);
			}
			
			Map<String, Object> data = new HashMap<String, Object>();
			data.put("nameData", nameDataList);
			data.put("seriesData", seriesDataList);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getInfoTypeCntByDay(HttpServletRequest request, HttpServletResponse response) {
		try {
			String startDate = request.getParameter("startDate");
			String endDate = request.getParameter("endDate");
			
			List<String> dateArr = null;
			if ((startDate == null || "".equals(startDate)) && (endDate == null || "".equals(endDate))) {
				dateArr = DateHelper.getDatesBetweenTwoDate("", "");
			} else {
				dateArr = DateHelper.getDatesBetweenTwoDate(startDate, endDate);
			}
			String startDateStr = dateArr.get(0) + " 00:00:00";
			
			SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
			Date dateEnd = sdf.parse(dateArr.get(dateArr.size() - 1));
			Calendar calEndForSearch = Calendar.getInstance();
			calEndForSearch.setTime(dateEnd);
			calEndForSearch.add(Calendar.DAY_OF_MONTH, 1);
			String endDateStr = sdf.format(calEndForSearch.getTime()) + " 00:00:00";
			
			Map<String, Object> data = new HashMap<String, Object>();
			data.put("xAxisdata", dateArr);
			
			Map<String, String> resultData = activityDao.getInfoTypeCntByDay(startDateStr, endDateStr);
			List<String> staffReportList = new ArrayList<String>();
			List<String> captainReportList = new ArrayList<String>();
			List<String> continousReportList = new ArrayList<String>();
			List<String> airSafeReportList = new ArrayList<String>();
			for (String dateTmp : dateArr) {
				if (resultData.size() <= 0){
					break;
				}
				if (resultData.get(dateTmp + "员工安全报告") != null) {
					staffReportList.add(resultData.get(dateTmp + "员工安全报告").toString());
				} else {
					staffReportList.add("");
				}
				if (resultData.get(dateTmp + "机长报告") != null) {
					captainReportList.add(resultData.get(dateTmp + "机长报告").toString());
				} else {
					captainReportList.add("");
				}
				if (resultData.get(dateTmp + "持续监控信息") != null) {
					continousReportList.add(resultData.get(dateTmp + "持续监控信息").toString());
				} else {
					continousReportList.add("");
				}
				if (resultData.get(dateTmp + "航空安全信息") != null) {
					airSafeReportList.add(resultData.get(dateTmp + "航空安全信息").toString());
				} else {
					airSafeReportList.add("");
				}
			}
			data.put("staffReportList", staffReportList);
			data.put("captainReportList", captainReportList);
			data.put("continousReportList", continousReportList);
			data.put("airSafeReportList", airSafeReportList);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	/**
	 * 
	 * @param request
	 * @param response
	 */
	public void getInfoRptOverdueList(HttpServletRequest request, HttpServletResponse response) {
		try {
			String startDate = request.getParameter("startDate");
			
			String endDateForSearch = null;
			if (startDate == null || "".equals(startDate)) {
				Calendar calNow = Calendar.getInstance();
				SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
				endDateForSearch = sdf.format(calNow.getTime());
			} else {
				endDateForSearch = startDate;
			}
			
			List<Object[]> notAnjianData = activityDao.getInfoRptOverdueNotAnjian(endDateForSearch, "");
			List<Object[]> notAnjianDataIncludeAn = activityDao.getInfoRptOverdueNotAnjian(endDateForSearch, "Anjian");
			List<Object[]> anjianData = activityDao.getInfoRptOverdueAnjian(endDateForSearch);
			int anjianCnt = 0;
			if (anjianData.size() > 0) {
				anjianCnt = Integer.parseInt(anjianData.get(0)[1].toString());
			}
			if (notAnjianDataIncludeAn.size() > 0) {
				anjianCnt = anjianCnt + Integer.parseInt(notAnjianDataIncludeAn.get(0)[1].toString());
			}
			
			List<String> deptList = new ArrayList<String>();
			List<String> cntList = new ArrayList<String>();
			boolean findAnjian = false;
			if (notAnjianData.size() == 0 && anjianCnt > 0) {
				// 安监以外没值、安监有值
				deptList.add("安监部");
				cntList.add(String.valueOf(anjianCnt));
			}
			
			for (Object[] o : notAnjianData) {
				// 安监以外有值
				int currentDeptNum = Integer.parseInt(o[1].toString());
				if (anjianCnt == 0) {
					// 安监没值
					deptList.add(o[0].toString());
					cntList.add(o[1].toString());
				} else {
					// 安监有值
					if (currentDeptNum < anjianCnt) {
						deptList.add(o[0].toString());
						cntList.add(o[1].toString());
					} else {
						if (!findAnjian) {
							findAnjian = true;
							deptList.add("安监部");
							cntList.add(String.valueOf(anjianCnt));
						}
						deptList.add(o[0].toString());
						cntList.add(o[1].toString());
					}
				}
			}
			if (notAnjianData.size() > 0 && anjianCnt > 0) {
				if (!deptList.contains("安监部")) {
					deptList.add("安监部");
					cntList.add(String.valueOf(anjianCnt));
				}
			}
			Map<String, Object> data = new HashMap<String, Object>();
			data.put("deptData", deptList);
			data.put("seriesData", cntList);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getInfoRptOverdueDist(HttpServletRequest request, HttpServletResponse response) {
		try {
			String startDate = request.getParameter("startDate");
			
			String endDateForSearch = null;
			if (startDate == null || "".equals(startDate)) {
				Calendar calNow = Calendar.getInstance();
				SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
				endDateForSearch = sdf.format(calNow.getTime());
			} else {
				endDateForSearch = startDate;
			}
			
			List<String> nameDataList = new ArrayList<String>();
			List<Map<String, Object>> seriesDataList = new ArrayList<Map<String, Object>>();
			
			List<Object[]> resultDataList = activityDao.getInfoRptOverdueDist(endDateForSearch);
			for (Object[] o : resultDataList) {
				nameDataList.add(o[0].toString());
				Map<String, Object> tmpMap = new HashMap<String, Object>();
				tmpMap.put("value", o[1].toString());
				tmpMap.put("name", o[0].toString());
				seriesDataList.add(tmpMap);
			}
			
			Map<String, Object> data = new HashMap<String, Object>();
			data.put("nameData", nameDataList);
			data.put("seriesData", seriesDataList);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getActionItemOverdue(HttpServletRequest request, HttpServletResponse response) {
		try {
			String startDate = request.getParameter("startDate");
			
			String endDateForSearch = null;
			if (startDate == null || "".equals(startDate)) {
				Calendar calNow = Calendar.getInstance();
				SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
				endDateForSearch = sdf.format(calNow.getTime());
			} else {
				endDateForSearch = startDate;
			}
			
			List<Object[]> resultDataList = activityDao.getActionItemOverdue(endDateForSearch);
			
			List<String> deptList = new ArrayList<String>();
			List<String> cntList = new ArrayList<String>();
			for (Object[] o : resultDataList) {
				deptList.add(o[0].toString());
				cntList.add(o[1].toString());
			}
			
			Map<String, Object> data = new HashMap<String, Object>();
			data.put("deptData", deptList);
			data.put("seriesData", cntList);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getAllRptCntByDept(HttpServletRequest request, HttpServletResponse response) {
		try {
			String yearBegin = request.getParameter("yearBegin");
			String monthBegin = request.getParameter("monthBegin");
			String yearEnd = request.getParameter("yearEnd");
			String monthEnd = request.getParameter("monthEnd");
			
			Calendar calBegin = Calendar.getInstance();
			if (yearBegin != null && !"0".equals(yearBegin) && monthBegin != null && !"0".equals(monthBegin)) {
				calBegin.set(Calendar.YEAR, Integer.parseInt(yearBegin));
				calBegin.set(Calendar.MONTH, Integer.parseInt(monthBegin) - 1);
				calBegin.set(Calendar.DAY_OF_MONTH, 1);
			} else {
				calBegin.set(Calendar.MONTH, 0);
				calBegin.set(Calendar.DAY_OF_MONTH, 1);
			}
			
			Calendar calEnd = Calendar.getInstance();
			if (yearEnd != null && !"0".equals(yearEnd) && monthEnd != null && !"0".equals(monthEnd)) {
				calEnd.set(Calendar.YEAR, Integer.parseInt(yearEnd));
				calEnd.set(Calendar.MONTH, Integer.parseInt(monthEnd));
				calEnd.set(Calendar.DAY_OF_MONTH, 1);
			} else {
				calEnd.set(Calendar.DAY_OF_MONTH, 1);
				calEnd.add(Calendar.MONTH, 1);
			}
			
			int startDateYear = calBegin.get(Calendar.YEAR);
			int startDateMonth = calBegin.get(Calendar.MONTH) + 1;
			int endDateYear = calEnd.get(Calendar.YEAR);
			int endDateMonth = calEnd.get(Calendar.MONTH) + 1;
			String startDateStr = null;
			if (startDateMonth < 10) {
				startDateStr = startDateYear + "-0" + startDateMonth + "-01 00:00:00";
			} else {
				startDateStr = startDateYear + "-" + startDateMonth + "-01 00:00:00";
			}
			String endDateStr = null;
			if (endDateMonth < 10) {
				endDateStr = endDateYear + "-0" + endDateMonth + "-01 00:00:00";
			} else {
				endDateStr = endDateYear + "-" + endDateMonth + "-01 00:00:00";
			}
			
			Map<String, String> resultDataMap = activityDao.getAllRptCntByDept(startDateStr, endDateStr);
			List<String> nameDataList = new ArrayList<String>();
			List<Map<String, Object>> seriesDataList = new ArrayList<Map<String, Object>>();
			Iterator<String> iter = resultDataMap.keySet().iterator();
			while (iter.hasNext()) {
				String deptName = iter.next();
				String deptValue = resultDataMap.get(deptName);
				nameDataList.add(deptName);
				Map<String, Object> tmpMap = new HashMap<String, Object>();
				tmpMap.put("value", deptValue);
				tmpMap.put("name", deptName);
				seriesDataList.add(tmpMap);
			}
			
			Map<String, Object> data = new HashMap<String, Object>();
			data.put("nameData", nameDataList);
			data.put("seriesData", seriesDataList);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", data);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
}
