package com.usky.sms.audit.improvenotice;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.jasperreports.engine.JRDataSource;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import net.sf.jasperreports.engine.util.JRLoader;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.audit.EnumAuditRole;
import com.usky.sms.audit.improve.EnumImproveSourceType;
import com.usky.sms.common.JasperHelper;
import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.file.EnumFileType;
import com.usky.sms.file.FileDO;
import com.usky.sms.file.FileDao;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.unit.UnitRoleActorDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDao;
import com.usky.sms.user.UserGroupDao;
import com.usky.sms.workflow.WorkflowService;

public class ImproveNoticeService extends AbstractService {

	/** 报表模板文件目录 */
	public static final String FILE_PATH = "/uui/com/audit/export_template/improve_notice/";
	
	/** 报表模板文件路径 */
	public static final String IMPROVE_NOTICE_TEMPLATE_FILE_PATH = FILE_PATH + "improve_notice.jasper";
	
	public static final String IMPROVE_NOTICE_TRACE_TEMPLATE_FILE_PATH = FILE_PATH + "improve_notice_trace.jasper";

	@Autowired
	private ImproveNoticeDao improveNoticeDao;
	
	@Autowired
	private ImproveNoticeIssueDao improveNoticeIssueDao;
	
	@Autowired
	private FileDao fileDao;
	
	@Autowired
	private WorkflowService workflowService;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private UnitRoleActorDao unitRoleActorDao;
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	
	@Autowired
	private SubImproveNoticeDao subImproveNoticeDao;
	
	@Autowired
	private UserGroupDao userGroupDao;
	
	@Autowired
	private UserDao userDao;
	
	@Autowired
	private DictionaryDao dictionaryDao;
	
	@Autowired
	private ImproveNoticeFlowUserDao improveNoticeFlowUserDao;
	
	/**
	 * 获取整改通知单的权限
	 * @param request
	 * @param response
	 */
	public void getCreateImproveNoticePermission(HttpServletRequest request, HttpServletResponse response) {
		try {
			boolean addable = false;
			Integer unitId = request.getParameter("unitId") == null ? null : Integer.parseInt(request.getParameter("unitId"));
			if (null == unitId) {
				addable = permissionSetDao.hasPermission(PermissionSets.CREATE_SYS_IMPROVE_NOTICE.getName());
			} else {
				addable = permissionSetDao.hasUnitPermission(unitId, PermissionSets.CREATE_SUB_IMPROVE_NOTICE.getName());
			}
			Map<String, Object> permissionMap = new HashMap<String, Object>();
			permissionMap.put("addable", addable);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", permissionMap);
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
	 * 获取整改通知单的责任单位列表
	 * @param request
	 * @param response
	 */
	public void getImproveNoticeResponsibilityUnits(HttpServletRequest request, HttpServletResponse response) {
		try {
			String term = request.getParameter("term");
			List<Integer> operators = gson.fromJson(request.getParameter("unitIds"), new TypeToken<List<Integer>>() {}.getType());
			List<Map<String, Object>> list = improveNoticeDao.getImproveNoticeResponsibilityUnits(operators, term);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(list, request));
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
	 * 获取可添加的整改通知单的责任单位<br>
	 * 系统级的获取所有安监机构<br>
	 * 分子公司级的获取所有安监机构及当前安监机构的下级组织
	 * @param request
	 * @param response
	 */
	public void getAddedImproveUnits(HttpServletRequest request, HttpServletResponse response) {
		try {
			String improveNoticeType = request.getParameter("improveNoticeType");
			String term = request.getParameter("term");
			Integer unitId = StringUtils.isBlank(request.getParameter("unitId")) ? null : Integer.parseInt(request.getParameter("unitId"));
			List<Map<String, Object>> list = improveNoticeDao.getAddedImproveUnits(unitId, improveNoticeType, term);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(list, request));
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
	 * 获取整改单来源
	 * @param request
	 * @param response
	 */
	public void getImproveNoticeSource(HttpServletRequest request, HttpServletResponse response) {
		try {
			String category = request.getParameter("category");
			List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
			for (EnumImproveSourceType improveSourceType : EnumImproveSourceType.values()) {
				Map<String, Object> improveSourceTypeMap = new HashMap<String, Object>();
				if (!StringUtils.isBlank(category)) {
					if (improveSourceType.getCategory().equals(category)) {
						improveSourceTypeMap.put("id", improveSourceType.toString());
						improveSourceTypeMap.put("name", improveSourceType.getDescription());
						list.add(improveSourceTypeMap);
					}
				} else {
					improveSourceTypeMap.put("id", improveSourceType.toString());
					improveSourceTypeMap.put("name", improveSourceType.getDescription());
					list.add(improveSourceTypeMap);
				}
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", list);
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
	 * 获取整改通知单
	 * @param request
	 * @param response
	 */
	public void getImproveNoticeById(HttpServletRequest request, HttpServletResponse response) {
		try {
			Integer id = Integer.parseInt(request.getParameter("id"));
			// 是否按照验证状态划分问题列表
			boolean isDividedByTraceItemStatus = false;
			// 是否按照责任单位分组
			boolean isGroupedByImproveUnit = false;
			
			if (!StringUtils.isBlank(request.getParameter("isDividedByTraceItemStatus"))) {
				isDividedByTraceItemStatus = Boolean.valueOf(request.getParameter("isDividedByTraceItemStatus")).booleanValue();
			}
			if (!StringUtils.isBlank(request.getParameter("isGroupedByImproveUnit"))) {
				isGroupedByImproveUnit = Boolean.valueOf(request.getParameter("isGroupedByImproveUnit")).booleanValue();
			}
			ImproveNoticeDO improveNotice = improveNoticeDao.internalGetById(id);
			Map<String, Object> improveNoticeMap = improveNoticeDao.convert(improveNotice);
			List<SubImproveNoticeDO> subImproveNotices = subImproveNoticeDao.getByImproveNoticeId(improveNotice.getId());
			List<Map<String, Object>> improveNoticeIssueMaps = null;
			// 分配验证人员的权限
			boolean assignable = false;
			if (isGroupedByImproveUnit) { // 按责任单位分组
				List<Map<String, Object>> subImproveNoticeMaps = new ArrayList<Map<String,Object>>();
				Map<Integer, Integer> countMap = improveNoticeIssueDao.getIssueCountGroupSubImproveNotice(improveNotice);
				for (SubImproveNoticeDO subImproveNotice : improveNoticeIssueDao.groupedByImproveUnit(improveNotice, subImproveNotices)) {
					Map<String, Object> subImproveNoticeMap = subImproveNoticeDao.convert(subImproveNotice, Arrays.asList(new String[]{"id", "improveUnit", "flowStatus"}));
					subImproveNoticeMap.put("issueCount", countMap.get(subImproveNotice.getId()) == null ? 0 : countMap.get(subImproveNotice.getId()));
					subImproveNoticeMaps.add(subImproveNoticeMap);
				}
				improveNoticeMap.put("subImproveNotices", subImproveNoticeMaps);
				improveNoticeMap.put("deletable", improveNoticeDao.isDeletable(improveNotice));
			} else {
				if (null != improveNotice.getImproveNoticeIssues()) {
					List<ImproveNoticeIssueDO> improveNoticeIssues = new ArrayList<ImproveNoticeIssueDO>();
					// 过滤出已删除的问题列表
					for (ImproveNoticeIssueDO improveNoticeIssue : improveNotice.getImproveNoticeIssues()) {
						if (!improveNoticeIssue.isDeleted()) {
							improveNoticeIssues.add(improveNoticeIssue);
						}
					}
					// 排序 按照id的升序
					Collections.sort(improveNoticeIssues, new Comparator<ImproveNoticeIssueDO>() {
						@Override
						public int compare(ImproveNoticeIssueDO o1, ImproveNoticeIssueDO o2) {
							return o1.getId().compareTo(o2.getId());
						}
					});
	
					if (isDividedByTraceItemStatus) {
						// 批量分配验证人的权限
						if (EnumImproveNoticeType.SYS.toString().equals(improveNotice.getImproveNoticeType())) { // 系统级的时候，判断是否是A1.1一级检查经理组组用户组的人员
							DictionaryDO dic = dictionaryDao.getByTypeAndKey("审计角色", EnumAuditRole.FIRST_GRADE_CHECK_MANAGER_GROUP.getKey());
							if (null == dic) {
								throw new SMSException(MessageCodeConstant.MSG_CODE_133000006, "审计角色", EnumAuditRole.FIRST_GRADE_CHECK_MANAGER_GROUP.getKey());
							}
							if (userGroupDao.isUserGroup(UserContext.getUserId(), dic.getName())) {
								assignable = true;
							}
						}
						else { // 分子公司的时候，判断是否是AC2.1二级检查经理角色的人员
							DictionaryDO dic = dictionaryDao.getByTypeAndKey("审计角色", EnumAuditRole.SECOND_GRADE_CHECK_MANAGER.getKey());
							if (null == dic) {
								throw new SMSException(MessageCodeConstant.MSG_CODE_133000006, "审计角色", EnumAuditRole.SECOND_GRADE_CHECK_MANAGER.getKey());
							}
							if (unitRoleActorDao.isRole(UserContext.getUserId(), dic.getName())) {
								assignable = true;
							}
						}
						
//						improveNoticeMap.put("improveNoticeIssues", improveNoticeIssueDao.groupByStatus(improveNoticeIssues, assignable));
						improveNoticeMap.put("assignable", assignable);
					} else {
	//					improveNoticeIssueMaps = improveNoticeIssueDao.convert(improveNoticeIssues, Arrays.asList(new String[]{"id", "issueContent", "improveReason", "improveMeasure", "improveDeadLine", "completionStatus", "confirmSuggestion", "completionDate", "confirmMan", "confirmDeadLine", "confirmDate", "traceFlowStatus", "auditSummary"}), false);
						improveNoticeIssueMaps = improveNoticeIssueDao.convert(improveNoticeIssues, false);
						improveNoticeMap.put("improveNoticeIssues", improveNoticeIssueMaps);
					}
				}
			}
			// 整改通知单下发文件
			List<FileDO> improveNoticeSentFiles = fileDao.getFilesBySource(EnumFileType.IMPROVE_NOTICE_SENT.getCode(), improveNotice.getId());
			improveNoticeMap.put("improveNoticeSentFiles", fileDao.convert(improveNoticeSentFiles));
			
			Map<String, Object> dataMap = new HashMap<String, Object>();
			dataMap.put("improveNotice", improveNoticeMap);
			List<String> executives = new ArrayList<String>();
			List<String> executiveTels = new ArrayList<String>();
			List<Map<String, Object>> logs = new ArrayList<Map<String,Object>>();
			for (SubImproveNoticeDO subImproveNotice : subImproveNotices) {
				// 责任人和联系方式
				if (!StringUtils.isBlank(subImproveNotice.getExecutive())) {
					executives.add(subImproveNotice.getExecutive());
				}
				if (!StringUtils.isBlank(subImproveNotice.getExecutiveTel())) {
					executiveTels.add(subImproveNotice.getExecutiveTel());
				}
				// 流程日志
				Map<String, Object> logArea = new HashMap<String, Object>();
				logArea.put("key", "com.audit.comm_file.logs");
				logArea.put("workflowLogs", workflowService.getWorkflowLogsAndCurrentStatus(subImproveNotice.getFlowId()));
				logs.add(logArea);
			}
			improveNoticeMap.put("executive", StringUtils.join(executives, ","));
			improveNoticeMap.put("executiveTel", StringUtils.join(executiveTels, ","));
			dataMap.put("logs", logs);
			
			boolean isProcessor = improveNoticeFlowUserDao.isProcessor(UserContext.getUserId(), id);
			improveNoticeMap.put("isProcessor", isProcessor);
			
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
		}
	}
	
	/**
	 * 下发整改通知单<br>
	 * 明细按照责任单位分成若干个子通知，并在子通知单使用工作流
	 * @param request
	 * @param response
	 */
	public void sendImproveNotice(HttpServletRequest request, HttpServletResponse response) {
		try {
			String id = request.getParameter("id");
			
			improveNoticeDao.sendImproveNotice(Integer.parseInt(id));

			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", id);
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
	 * 获取整改通知单状态
	 * @param request
	 * @param response
	 */
	public void getImproveNoticeStatus(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
			for (EnumImproveNoticeStatus e : EnumImproveNoticeStatus.values()) {
				Map<String, Object> status = new HashMap<String, Object>();
				status.put("id", e.toString());
				status.put("name", e.getDescription());
				list.add(status);
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", list);
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
	 * 获取整改通知单问题列表验证状态
	 * @param request
	 * @param response
	 */
	public void getImproveNoticeIssueTraceStatus(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
			for (EnumImproveNoticeIssueTraceStatus e : EnumImproveNoticeIssueTraceStatus.values()) {
				Map<String, Object> status = new HashMap<String, Object>();
				status.put("id", e.toString());
				status.put("name", e.getDescription());
				list.add(status);
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", list);
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
	 * 获取执行单位列表<br>
	 * 分子公司，二级单位
	 * @param request
	 * @param response
	 */
	public void getAllImproveNoticeOperators(HttpServletRequest request, HttpServletResponse response) {
		try {
			Map<String, Object> map = new HashMap<String, Object>();
			List<UnitDO> units = improveNoticeDao.getAllImproveNoticeOperators();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(unitDao.convert(units, Arrays.asList(new String[]{"id", "name"}), false), request));
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
	 * 搜索整改通知单<br>
	 * 通过来源，签发单位，审计日期和责任单位进行查询
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void searchImproveNotice(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String rule = request.getParameter("rule");
			String sort = request.getParameter("sort");
			Integer start = StringUtils.isBlank(request.getParameter("start")) ? null : Integer.parseInt(request.getParameter("start"));
			Integer length = StringUtils.isBlank(request.getParameter("length")) ? null : Integer.parseInt(request.getParameter("length"));
			Integer end = null;
			if (null != start && null != length) {
				end = start + length;
				// start是从0开始
				start = start + 1;
			}
			Map<String, Object> ruleMap = gson.fromJson(rule, new TypeToken<Map<String, Object>>() {}.getType());
			Map<String, Object> solrtMap = gson.fromJson(sort, new TypeToken<Map<String, Object>>() {}.getType());
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data",improveNoticeDao.getImproveNoticeBySearch(ruleMap, solrtMap, start, end));
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
	 * 获取安监机构树
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void getUnitsTree(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			Map<String, Object> root = new HashMap<String, Object>();
			root.put("id", 0);
			root.put("name", "上海吉祥航空股份有限公司");
			String unitName = request.getParameter("unitName");
			List<UnitDO> units = unitDao.getUnits(PermissionSets.VIEW_UNIT.getName(), unitName);
			List<Map<String, Object>> unitMaps = unitDao.convert(units, Arrays.asList("id", "name", "avatar", "code", "responsibleUser", "category", "description"));
			for (Map<String, Object> unit : unitMaps) {
				unit.put("parent", (Integer) root.get("id"));
			}
			unitMaps.add(root);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", unitMaps);
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
	 * 获取整改通知单的验证人<br>
	 * 支持模糊搜索
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void getImproveNoticeConfirmMan(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String improveNoticeId = request.getParameter("improveNoticeId");
			String term = request.getParameter("term");
			List<Map<String, Object>> list = improveNoticeDao.getImproveNoticeConfirmMan(Integer.parseInt(improveNoticeId), term);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", list);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	public void getAddableImproveNoticeUnits(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String improveNoticeType = request.getParameter("improveNoticeType");
			String unitName = request.getParameter("unitName");
			
			// 取出安监部的ID(从字典中获取)
			DictionaryDO dic = dictionaryDao.getByTypeAndName("审计参数", "公司级安监机构");
			if (null == dic) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "字典中没有配置类型为:审计参数,名称为:公司级安监机构的记录！");
			}
			
			Integer unitId = Integer.parseInt(dic.getValue());
			UnitDO unit = unitDao.internalGetById(unitId);
			List<UnitDO> units = null;
			if (EnumImproveNoticeType.SYS.toString().equals(improveNoticeType)) { // 返回安全监察部
				if(unit != null) {
					units = new ArrayList<UnitDO>();
					units.add(unit);
				}
			} else { //  返回除了安全监察部的其他安监部
				units = unitDao.getUnits(PermissionSets.VIEW_UNIT.getName(), unitName);
				if (null != unit) {
					units.remove(unit);
				}
			}
			List<Map<String, Object>> unitMaps = unitDao.convert(units, Arrays.asList("id", "name", "avatar", "code", "responsibleUser", "category", "description"));
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", unitMaps);
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
	 * 将整改通知单导出到pdf
	 * @param request
	 * @param response
	 */
	@SuppressWarnings("unchecked")
	public void exportImproveNoticeToPdf(HttpServletRequest request, HttpServletResponse response) {
		InputStream content = null;
		try {
			String id = request.getParameter("id");
			
			String exportType = request.getParameter("exportType");
			
			// 整改通知单
			ImproveNoticeDO improveNotice = improveNoticeDao.internalGetById(Integer.parseInt(id));
			Map<String, Object> improveNoticeMap = improveNoticeDao.convert(improveNotice, false);
			// 问题列表
			List<ImproveNoticeIssueDO> improveNoticeIssues = null;
			String templatePath = null;
			if ("TRACE".equals(exportType)) { // 验证的导出
				templatePath = IMPROVE_NOTICE_TRACE_TEMPLATE_FILE_PATH;
				String improveNoticeIssueIds = request.getParameter("improveNoticeIssueIds");
				String[] issueIds = gson.fromJson(improveNoticeIssueIds, String[].class);
				if (issueIds.length > 0) {
					improveNoticeIssues = improveNoticeIssueDao.internalGetByIds(issueIds);
				} else {
					improveNoticeIssues = new ArrayList<ImproveNoticeIssueDO>();
				}
			} else {
				templatePath = IMPROVE_NOTICE_TEMPLATE_FILE_PATH;
				improveNoticeIssues = improveNoticeIssueDao.getByImproveNoticeId(Integer.parseInt(id));
			}
			List<Map<String, Object>> improveNoticeIssueMaps = improveNoticeIssueDao.convert(improveNoticeIssues, Arrays.asList(new String[]{"id", "issueContent", "improveReason", "improveMeasure", "improveUnit", "expectedCompletedDate"}), false);
			List<Map<String, Object>> improveUnits = null;
			List<String> improveUnitNames = null;
			Set<String> allImproveUnitNames = new HashSet<String>();
			for (Map<String, Object> improveNoticeIssueMap : improveNoticeIssueMaps) {
				improveUnits = (List<Map<String, Object>>) improveNoticeIssueMap.get("improveUnit");
				if (null != improveUnits) {
					improveUnitNames = new ArrayList<String>();
					for (Map<String, Object> improveUnit : improveUnits) {
						if (!StringUtils.isBlank((String) improveUnit.get("name"))) {
							improveUnitNames.add((String) improveUnit.get("name"));
							allImproveUnitNames.add((String) improveUnit.get("name"));
						}
					}
				}
				improveNoticeIssueMap.put("improveUnitDisplayName", StringUtils.join(improveUnitNames, ","));
			}
			improveNoticeMap.put("improveUnitDisplayName", StringUtils.join(allImproveUnitNames, ","));
			improveNoticeMap.put("improveNoticeIssues", improveNoticeIssueMaps);
			
			
			// 文件根路径
			String root = request.getSession().getServletContext().getRealPath("/");
			if (root == null) {
				root = ImproveNoticeService.class.getResource("/").getPath() + "/../..";
			}
			List<JasperPrint> jasperPrintList = new ArrayList<JasperPrint>();
			// 正文内容
			List<Object> contentDatas = new ArrayList<Object>();
			contentDatas.add(improveNoticeMap);
			String contentUrl = root + templatePath;
			content = new FileInputStream(new File(contentUrl));
			JasperReport contentReport = (JasperReport) JRLoader.loadObject(content);
			JRDataSource contentData = new JRBeanCollectionDataSource(contentDatas, false);
			// 参数
			Map<String, Object> parameter = new HashMap<String, Object>();
			parameter.put("filePath", root + FILE_PATH);
			JasperPrint contentPrint = JasperFillManager.fillReport(contentReport, parameter, contentData);
			jasperPrintList.add(contentPrint);
			
			JasperHelper.exportToPdf(jasperPrintList, improveNotice.getDisplayName() + ".pdf", response);
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
	
	
	public void setImproveNoticeDao(ImproveNoticeDao improveNoticeDao) {
		this.improveNoticeDao = improveNoticeDao;
	}

	public void setImproveNoticeIssueDao(ImproveNoticeIssueDao improveNoticeIssueDao) {
		this.improveNoticeIssueDao = improveNoticeIssueDao;
	}

	public void setFileDao(FileDao fileDao) {
		this.fileDao = fileDao;
	}

	public void setWorkflowService(WorkflowService workflowService) {
		this.workflowService = workflowService;
	}

	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}

	public void setUnitRoleActorDao(UnitRoleActorDao unitRoleActorDao) {
		this.unitRoleActorDao = unitRoleActorDao;
	}
	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}
	public void setSubImproveNoticeDao(SubImproveNoticeDao subImproveNoticeDao) {
		this.subImproveNoticeDao = subImproveNoticeDao;
	}
	public void setUserGroupDao(UserGroupDao userGroupDao) {
		this.userGroupDao = userGroupDao;
	}
	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}
	public void setDictionaryDao(DictionaryDao dictionaryDao) {
		this.dictionaryDao = dictionaryDao;
	}
	public void setImproveNoticeFlowUserDao(ImproveNoticeFlowUserDao improveNoticeFlowUserDao) {
		this.improveNoticeFlowUserDao = improveNoticeFlowUserDao;
	}

}
