package com.usky.sms.audit.auditReport;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLEncoder;
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
import com.usky.sms.audit.AuditConstant;
import com.usky.sms.audit.plan.EnumCheckGrade;
import com.usky.sms.audit.plan.EnumPlanType;
import com.usky.sms.common.DateHelper;
import com.usky.sms.common.JasperHelper;
import com.usky.sms.common.NumberHelper;
import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.common.StringHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.file.EnumFileType;
import com.usky.sms.file.ExcelUtil;
import com.usky.sms.file.FileDO;
import com.usky.sms.file.FileDao;
import com.usky.sms.organization.OrganizationDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.utils.SpringBeanUtils;

public class AuditReportService extends AbstractService {
	
	/** 报表模板文件目录 */
	public static final String FILE_PATH = "/uui/com/audit/export_template/improve_issue/";
	
	/** 报表模板文件路径 */
	public static final String IMPROVE_ISSUE_REPORT_TEMPLATE_FILE_PATH = FILE_PATH + "improve_issue.jasper";
	
	@Autowired
	private AuditReportDao auditReportDao;
	
	@Autowired
	private FileDao fileDao;
	
	public void getAuditMap(HttpServletRequest request, HttpServletResponse response) {
		try {
			Integer year = null;
			try {
				year = NumberHelper.toInteger(request.getParameter("year"));
			} catch (Exception e) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "请选择年份！");
			}
			List<Map<String, Object>> list = auditReportDao.getAuditMap(year);
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
	
	@SuppressWarnings("unchecked")
	public void getImproveIssueList(HttpServletRequest request, HttpServletResponse response) {
		try {
			Map<String, Object> result = null;
			Integer sourceType = null;
			if ("audit".equals(request.getParameter("issueType"))) {
				result = auditReportDao.getImproveIssueList(request);
				sourceType = EnumFileType.AUDIT_CONFIRM.getCode();
			} else if ("check".equals(request.getParameter("issueType"))) { // check
				result = auditReportDao.getImproveNoticeIssue(request);
				sourceType = EnumFileType.CHECK_CONFIRM.getCode();
			} else { // term
				result = auditReportDao.getTermIssueList(request);
			}
			
			if (sourceType != null) {
				List<Map<String, Object>> list = (List<Map<String, Object>>) result.get("data");
				List<Integer> ids = new ArrayList<Integer>();
				for (Map<String, Object> map : list) {
					ids.add((Integer) map.get("id"));
				}
				List<Map<String, Object>> fileMaps = fileDao.convert(fileDao.getFilesBySources(sourceType, ids), false);
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
				
				// 将分组好的file挂到问题列表中
				for (Map<String, Object> map : list) {
					map.put("files", groupMap.get((Integer) map.get("id")));
				}
			}
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			Map<String, Object> dataMap = new HashMap<String, Object>();
			dataMap.put("sEcho", request.getParameter("sEcho"));
			dataMap.put("iTotalDisplayRecords", result.get("count"));
			dataMap.put("iTotalRecords", result.get("count"));
			dataMap.put("aaData", result.get("data"));
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
	 * 导出整改问题列表到excel
	 * @param request
	 * @param response
	 */
	@SuppressWarnings("unchecked")
	public void exportImproveIssueToExcel(HttpServletRequest request, HttpServletResponse response) throws Exception{
		OutputStream out = response.getOutputStream();
		try {
			response.addHeader("content-disposition", "attachment;filename=" + URLEncoder.encode("整改问题列表.xlsx", "UTF-8"));
			response.setContentType("application/msexcel");
			
			// 导出的表头
//			String[][] titles = null;
//			String[][] titles_audit = {{"系统分类","主要责任单位","执行单位","被审计单位","存在问题","原因类型","整改原因","整改措施","审计结论","验证状态","整改期限","完成情况","完成日期","审计状态"},
//								{"checkType","improveUnit","operator","target","itemPoint", "auditReason", "improveReason", "improveMeasure", "auditResult", "confirmResult", "improveLastDate","improveRemark","improveDate","improveItemStatus"}};
//			String[][] titles_check = {{"系统分类","执行单位","责任单位","存在问题","原因类型","整改原因","整改措施","检查结论","验证状态","整改期限","完成情况","完成日期","检查状态"},
//					{"checkType","operator","improveUnit","itemPoint", "auditReason", "improveReason", "improveMeasure", "auditResult", "confirmResult", "improveLastDate","improveRemark","improveDate","improveItemStatus"}};
			// 导出的表头
			String[][] titles = gson.fromJson(request.getParameter("titles"), String[][].class);
			String issueType = request.getParameter("issueType");
			Map<String, Object> result = null;
			if ("audit".equals(issueType)) {
//				titles = titles_audit;
				result = auditReportDao.getImproveIssueList(request);
			} else if ("check".equals(issueType)){
//				titles = titles_check;
				result = auditReportDao.getImproveNoticeIssue(request);
			} else { // term
				result = auditReportDao.getTermIssueList(request);
			}
			List<Object[]> datas = new ArrayList<Object[]>();
			for (Map<String, Object> map : (List<Map<String, Object>>) result.get("data")) {
				String[] data = new String[titles[0].length];
				for (int i = 0; i < titles[0].length; i++) {
					if ("itemPoint".equals(titles[1][i]) && "audit".equals(issueType)) {
						data[i] = map.get(titles[1][i]) == null ? "" : map.get(titles[1][i]).toString() + "\r\n";
						data[i] = data[i] + "审计记录:" + (map.get("auditRecord") == null ? "" : map.get("auditRecord").toString());
					} else {
						data[i] = map.get(titles[1][i]) == null ? "" : map.get(titles[1][i]).toString();
					}
				}
				datas.add(data);
			}
			// 导出的表头
			List<String> headers = Arrays.asList(titles[0]);
			// 数据
			List<Object[]> dataset = new ArrayList<Object[]>();
			for (Object[] data : datas) {
				dataset.add(data);
			}
			ExcelUtil.exportExcel(headers, dataset, out);
			out.close();
			response.flushBuffer();
		} catch (SMSException e) {
			e.printStackTrace();
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			IOUtils.closeQuietly(out);
		}
	}
	
	/**
	 * 将问题列表导出到pdf
	 * @param request
	 * @param response
	 */
	public void exportImproveIssueToPdf(HttpServletRequest request, HttpServletResponse response) {
		InputStream content = null;
		try {
			
			String exportType = request.getParameter("issueType");
			
			Map<String, Object> result = null;
			if ("audit".equals(exportType)) {
				result = auditReportDao.getImproveIssueList(request);
			} else if ("check".equals(exportType)) {
				result = auditReportDao.getImproveNoticeIssue(request);
			}
			
			// 问题列表
			@SuppressWarnings("unchecked")
			List<Map<String, Object>> list = (List<Map<String, Object>>) result.get("data");
			// 检查和审计的数据统一key值
			for (Map<String, Object> map : list) {
				if ("audit".equals(exportType)) {
					map.put("issueContent", "审计要点：" + (String) map.get("itemPoint") + "\n审计记录：" + (String) map.get("auditRecord"));
					map.put("completionStatus", map.get("improveRemark"));
				} else if ("check".equals(exportType)) {
					map.put("issueContent", map.get("itemPoint"));
					map.put("completionStatus", map.get("improveRemark"));
				}
			}
			
			Map<String, Object> dataMap = new HashMap<String, Object>();
			dataMap.put("improveIssues", list);
			// 文件根路径
			String root = request.getSession().getServletContext().getRealPath("/");
			if (root == null) {
				root = this.getClass().getResource("/").getPath() + "/../..";
			}
			List<JasperPrint> jasperPrintList = new ArrayList<JasperPrint>();
			// 正文内容
			List<Object> contentDatas = new ArrayList<Object>();
			contentDatas.add(dataMap);
			String contentUrl = root + IMPROVE_ISSUE_REPORT_TEMPLATE_FILE_PATH;
			content = new FileInputStream(new File(contentUrl));
			JasperReport contentReport = (JasperReport) JRLoader.loadObject(content);
			JRDataSource contentData = new JRBeanCollectionDataSource(contentDatas, false);
			// 参数
			Map<String, Object> parameter = new HashMap<String, Object>();
			parameter.put("filePath", root + FILE_PATH);
			JasperPrint contentPrint = JasperFillManager.fillReport(contentReport, parameter, contentData);
			jasperPrintList.add(contentPrint);
			
			JasperHelper.exportToPdf(jasperPrintList, "审计(检查)验证单" + ".pdf", response);
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
	
	public void getCheckListBar(HttpServletRequest request, HttpServletResponse response) {
		try {
			String auditType = request.getParameter("auditType");//审计类型字符串
			String operator = request.getParameter("operator");//执行单位字符串
			String profession = request.getParameter("profession");//专业字符串
			String chapter = request.getParameter("chapter");//章节字符串
			String target_ = request.getParameter("target");//被执行单位数组
			String checklist_ = request.getParameter("checklist");//检查要点数组
			String startDate_ = request.getParameter("startDate");
			String endDate_ = request.getParameter("endDate");
			List<Integer> target= gson.fromJson(target_, new TypeToken<List<Integer>>() {}.getType());
			List<Integer> checklist = gson.fromJson(checklist_, new TypeToken<List<Integer>>() {}.getType());
			List<Map<String, Object>> list = auditReportDao.getCheckListBar(auditType, operator, profession, chapter, startDate_, endDate_, target, checklist);
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
	 * 获取建议项柱状图数据
	 * 
	 * @param planType
	 * @param checkType
	 * @return
	 */
	public void getAdtRstLineByAdtRptDate(HttpServletRequest request, HttpServletResponse response) {
		try {
			String planType = StringUtils.isBlank(request.getParameter("planType")) ? null : request.getParameter("planType");
			String checkType = StringUtils.isBlank(request.getParameter("checkType")) ? null : request.getParameter("checkType");
			List<String> operators = gson.fromJson(request.getParameter("operators"), new TypeToken<List<String>>() {}.getType());
			List<String> targets = gson.fromJson(request.getParameter("targets"), new TypeToken<List<String>>() {}.getType());
			List<String> years = gson.fromJson(request.getParameter("years"), new TypeToken<List<String>>() {}.getType());
			if (null == years || years.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "年份为必选项!");
			}
			List<String> professions = gson.fromJson(request.getParameter("professions"), new TypeToken<List<String>>() {}.getType());
			List<Integer> professionInts = StringHelper.converStringListToIntegerList(professions);
			Collections.sort(years);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("timeLine", years);
			map.put("data", PageHelper.getPagedResult(
					auditReportDao.getAdtRstCntGroupByAdtRptDate(operators, targets, professionInts, planType, checkType, years),
					request));
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
	 * 获取建议项柱状图数据(横轴为被执行单位)
	 * 
	 * @param planType
	 * @param checkType
	 * @return
	 */
	public void getAdtRstLineByTarget(HttpServletRequest request, HttpServletResponse response) {
		try {
			String planType = StringUtils.isBlank(request.getParameter("planType")) ? null : request.getParameter("planType");
			String checkType = StringUtils.isBlank(request.getParameter("checkType")) ? null : request.getParameter("checkType");
			List<String> operators = gson.fromJson(request.getParameter("operators"), new TypeToken<List<String>>() {}.getType());
			List<String> targets = gson.fromJson(request.getParameter("targets"), new TypeToken<List<String>>() {}.getType());
			List<String> professions = gson.fromJson(request.getParameter("professions"), new TypeToken<List<String>>() {}.getType());
			Date startDate = request.getParameter("startDate") == null ? null : DateHelper.parseIsoDate(request.getParameter("startDate"));
			Date endDate = request.getParameter("endDate") == null ? null : DateHelper.parseIsoDate(request.getParameter("endDate"));
			
			List<Map<String, Object>> targetMaps = auditReportDao.getAuditReportTargets(planType, checkType, operators, targets, null);
			if (null == targets) {
				targets = new ArrayList<String>();
			} else {
				targets.clear();
			}
			for (Map<String, Object> targetMap : targetMaps) {
				targets.add(targetMap.get("id").toString());
			}
			if (targets.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "没有被审计单位!");
			}
			List<Integer> professionInts = StringHelper.converStringListToIntegerList(professions);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("timeLine", targetMaps);
			map.put("data", PageHelper.getPagedResult(
					auditReportDao.getAdtRstCntGroupByTarget(operators, targets, professionInts, planType, checkType, startDate, endDate),
					request));
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
	 * 获取建议项柱状图数据(横轴为专业)
	 * 
	 * @param planType
	 * @param checkType
	 * @return
	 */
	public void getAdtRstLineByProfession(HttpServletRequest request, HttpServletResponse response) {
		try {
			String planType = StringUtils.isBlank(request.getParameter("planType")) ? null : request.getParameter("planType");
			String checkType = StringUtils.isBlank(request.getParameter("checkType")) ? null : request.getParameter("checkType");
			List<String> operators = gson.fromJson(request.getParameter("operators"), new TypeToken<List<String>>() {}.getType());
			List<String> targets = gson.fromJson(request.getParameter("targets"), new TypeToken<List<String>>() {}.getType());
			List<String> professions = gson.fromJson(request.getParameter("professions"), new TypeToken<List<String>>() {}.getType());
			Date startDate = request.getParameter("startDate") == null ? null : DateHelper.parseIsoDate(request.getParameter("startDate"));
			Date endDate = request.getParameter("endDate") == null ? null : DateHelper.parseIsoDate(request.getParameter("endDate"));
			List<Map<String, Object>> professionMaps = auditReportDao.getAuditReportProfession(professions);

			if (professionMaps.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "没有选的专业!");
			}
			List<Integer> professionInts = new ArrayList<Integer>();
			for (Map<String, Object> professionMap : professionMaps) {
				professionInts.add(Integer.parseInt(professionMap.get("id").toString()));
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("timeLine", professionMaps);
			map.put("data", PageHelper.getPagedResult(
					auditReportDao.getAdtRstCntGroupByProfession(operators, targets, professionInts, planType, checkType, startDate, endDate),
					request));
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
	 * 获取执行单位
	 * @param planType
	 * @param checkType
	 * @return
	 */
	public void getAuditReportOperators(HttpServletRequest request, HttpServletResponse response) {
		try {
			String planType = request.getParameter("planType");
			String checkType = request.getParameter("checkType");
			String name = request.getParameter("name");
			if (StringUtils.isBlank(planType)) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "审计类型不能为空!");
			}
			if (EnumPlanType.SPOT.equals(EnumPlanType.getEnumByVal(planType)) || EnumPlanType.SPEC.equals(EnumPlanType.getEnumByVal(planType))) {
				if (StringUtils.isBlank(checkType)) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "级别不能为空!");
				}
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data",
					PageHelper.getPagedResult(auditReportDao.getAuditReportOperators(planType, checkType, name), request));
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
	 * 获取被被执行单位
	 * @param planType
	 * @param checkType
	 * @return
	 */
	public void getAuditReportTargets(HttpServletRequest request, HttpServletResponse response) {
		try {
			String planType = request.getParameter("planType");
			String checkType = request.getParameter("checkType");
			String name = request.getParameter("name");
			if (StringUtils.isBlank(planType)) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "审计类型不能为空!");
			}
			if (EnumPlanType.SPOT.equals(EnumPlanType.getEnumByVal(planType)) || EnumPlanType.SPEC.equals(EnumPlanType.getEnumByVal(planType))) {
				if (StringUtils.isBlank(checkType)) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "级别不能为空!");
				}
			}
			List<String> operators = null;
			if (!StringUtils.isBlank(request.getParameter("operators"))) {
				operators = gson.fromJson(request.getParameter("operators"), new TypeToken<List<String>>() {}.getType());
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data",
					PageHelper.getPagedResult(auditReportDao.getAuditReportTargets(planType, checkType, operators, null, name), request));
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
	 * 获取审计的计划类型
	 * @return
	 */
	public void getPlanTypeForImproveIssue(HttpServletRequest request, HttpServletResponse response) {
		try {
			PermissionSets permission = auditReportDao.getViewImproveIssuePermission();
			List<String> planTypeIds = auditReportDao.getPlanTypeIdsForImproveIssue(permission);
			List<Map<String, Object>> planTypeMaps = new ArrayList<Map<String,Object>>();
			for (String planTypeId : planTypeIds) {
				Map<String, Object> planTypeMap = new HashMap<String, Object>();
				planTypeMap.put("id", planTypeId);
				try {
					planTypeMap.put("name", EnumPlanType.getEnumByVal(planTypeId).getDescription());
				} catch (Exception e) {
					planTypeMap.put("name", "未知类型");
				}
				planTypeMaps.add(planTypeMap);
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(planTypeMaps, request));
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
	 * 获取检查的级别
	 * @return
	 */
	public void getCheckGradeForImproveIssue(HttpServletRequest request, HttpServletResponse response) {
		try {
			PermissionSets permission = auditReportDao.getViewImproveIssuePermission();
			List<String> checkGradeIds = auditReportDao.getCheckGradeIdsForImproveIssue(permission);
			List<Map<String, Object>> checkGradeMaps = new ArrayList<Map<String,Object>>();
			for (String checkGradeId : checkGradeIds) {
				Map<String, Object> checkGradeMap = new HashMap<String, Object>();
				checkGradeMap.put("id", checkGradeId);
				try {
					checkGradeMap.put("name", EnumCheckGrade.getEnumByVal(checkGradeId).getDescription());
				} catch (Exception e) {
					checkGradeMap.put("name", "未知类型");
				}
				checkGradeMaps.add(checkGradeMap);
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(checkGradeMaps, request));
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
	 * 获取执行单位
	 * @return
	 */
	public void getOperatorForImproveIssue(HttpServletRequest request, HttpServletResponse response) {
		try {
			String term = request.getParameter("term");
			@SuppressWarnings("unchecked")
			List<String> planTypes = gson.fromJson(request.getParameter("auditType"), List.class);
			PermissionSets permission = auditReportDao.getViewImproveIssuePermission();
			Map<String, Object> operatorIdsMap = auditReportDao.getOperatorIdMapsForImproveIssue(planTypes, permission);
			@SuppressWarnings("unchecked")
			List<Integer> unitIds = (List<Integer>) operatorIdsMap.get(AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT);
			@SuppressWarnings("unchecked")
			List<Integer> orgIds = (List<Integer>) operatorIdsMap.get(AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP);
			List<Map<String, Object>> operatorMaps = new ArrayList<Map<String,Object>>();
			if (!unitIds.isEmpty()) {
				UnitDao unitDao = (UnitDao) SpringBeanUtils.getBean("unitDao");
				List<Map<String, Object>> maps = unitDao.convert(unitDao.getByIds(unitIds), Arrays.asList(new String[]{"id", "name"}), false);
				for (Map<String, Object> map : maps) {
					map.put("id", AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT + map.get("id"));
					operatorMaps.add(map);
				}
			}
			if (!orgIds.isEmpty()) {
				OrganizationDao organizationDao = (OrganizationDao) SpringBeanUtils.getBean("organizationDao");
				List<Map<String, Object>> maps = organizationDao.convert(organizationDao.getByIds(orgIds), Arrays.asList(new String[]{"id", "name"}), false);
				for (Map<String, Object> map : maps) {
					map.put("id", AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP + map.get("id"));
					operatorMaps.add(map);
				}
			}
			if (!StringUtils.isBlank(term)) {
				Iterator<Map<String, Object>> it = operatorMaps.iterator();
				while (it.hasNext()) {
					Map<String, Object> map = it.next();
					if (!StringUtils.containsIgnoreCase((String) map.get("name"), term)) {
						it.remove();
					}
				}
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(operatorMaps, request));
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
	 * 获取被执行单位
	 * @return
	 */
	public void getTargetForImproveIssue(HttpServletRequest request, HttpServletResponse response) {
		try {
			String term = request.getParameter("term");
			@SuppressWarnings("unchecked")
			List<String> planTypes = gson.fromJson(request.getParameter("auditType"), List.class);
			@SuppressWarnings("unchecked")
			List<String> operators = gson.fromJson(request.getParameter("operators"), List.class);
			PermissionSets permission = auditReportDao.getViewImproveIssuePermission();
			Map<String, Object> targetIdsMap = auditReportDao.getTargetIdMapsForImproveIssue(planTypes, operators, permission);
			@SuppressWarnings("unchecked")
			List<Integer> unitIds = (List<Integer>) targetIdsMap.get(AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT);
			@SuppressWarnings("unchecked")
			List<Integer> orgIds = (List<Integer>) targetIdsMap.get(AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP);
			List<Map<String, Object>> targetMaps = new ArrayList<Map<String,Object>>();
			if (!unitIds.isEmpty()) {
				UnitDao unitDao = (UnitDao) SpringBeanUtils.getBean("unitDao");
				List<Map<String, Object>> maps = unitDao.convert(unitDao.getByIds(unitIds), Arrays.asList(new String[]{"id", "name"}), false);
				for (Map<String, Object> map : maps) {
					map.put("id", AuditConstant.IMPROVE_UNIT_ID_PREFIX_UT + map.get("id"));
					targetMaps.add(map);
				}
			}
			if (!orgIds.isEmpty()) {
				OrganizationDao organizationDao = (OrganizationDao) SpringBeanUtils.getBean("organizationDao");
				List<Map<String, Object>> maps = organizationDao.convert(organizationDao.getByIds(orgIds), Arrays.asList(new String[]{"id", "name"}), false);
				for (Map<String, Object> map : maps) {
					map.put("id", AuditConstant.IMPROVE_UNIT_ID_PREFIX_DP + map.get("id"));
					targetMaps.add(map);
				}
			}
			if (!StringUtils.isBlank(term)) {
				Iterator<Map<String, Object>> it = targetMaps.iterator();
				while (it.hasNext()) {
					Map<String, Object> map = it.next();
					if (!StringUtils.containsIgnoreCase((String) map.get("name"), term)) {
						it.remove();
					}
				}
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(targetMaps, request));
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
	 * 验证 问题列表
	 * @param request
	 * @param response
	 */
	public void confirmImproveIssue(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<FileDO> files = auditReportDao.confirmImproveIssue(request);
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", fileDao.convert(files, false));
			ResponseHelper.output(response, result);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void setAuditReportDao(AuditReportDao auditReportDao) {
		this.auditReportDao = auditReportDao;
	}

	public void setFileDao(FileDao fileDao) {
		this.fileDao = fileDao;
	}
	
	public void getCheckOverdueInfo(HttpServletRequest request, HttpServletResponse response) {
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
			
			List<Object[]> resultDataList = auditReportDao.getCheckOverdueInfo(endDateForSearch);
			
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
	
	public void getAuditOverdueInfo(HttpServletRequest request, HttpServletResponse response) {
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
			
			List<Object[]> resultDataList = auditReportDao.getAuditOverdueInfo(endDateForSearch);
			
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
	
	
}
