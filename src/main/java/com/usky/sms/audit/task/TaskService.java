package com.usky.sms.audit.task;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
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
import net.sf.jasperreports.engine.export.ooxml.JRDocxExporter;
import net.sf.jasperreports.engine.util.FileBufferedOutputStream;
import net.sf.jasperreports.engine.util.JRLoader;
import net.sf.jasperreports.export.SimpleExporterInput;
import net.sf.jasperreports.export.SimpleOutputStreamExporterOutput;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.common.JasperHelper;
import com.usky.sms.common.NumberHelper;
import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.file.EnumFileType;
import com.usky.sms.file.FileDO;
import com.usky.sms.file.FileDao;
import com.usky.sms.workflow.WorkflowService;

public class TaskService extends AbstractService {

	/** 报表模板文件目录 */
	public static final String FILE_PATH = "/uui/com/audit/export_template/audit_report/";
	
	/** 报表模板文件路径 */
	public static final String AUDIT_REPORT_TEMPLATE_FILE_PATH = FILE_PATH + "audit_report.jasper";
	
	/** 报表封面模板文件路径 */
	public static final String AUDIT_REPORT_COVER_TEMPLATE_FILE_PATH = FILE_PATH + "audit_report_cover.jasper";

	@Autowired
	private TaskDao taskDao;
	
	@Autowired
	private WorkflowService workflowService;
	
	@Autowired
	private FileDao fileDao;
	
	public void updateTask(HttpServletRequest request, HttpServletResponse response) {
		try {
			String dataobjectid = request.getParameter("dataobjectid");
			String obj = request.getParameter("obj");
			String isInstance = request.getParameter("isInstance");
			Map<String, Object> objMap = gson.fromJson(obj, new TypeToken<Map<String, Object>>() {}.getType());
			List<Map<String,Object>> checkList = taskDao.updateTask(objMap, dataobjectid, isInstance);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(checkList, request));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	

	

	public void getAuditTypes(HttpServletRequest request, HttpServletResponse response) {
		try {
			String term = request.getParameter("term");
			String type = request.getParameter("type");
			List<Map<String,Object>> list = taskDao.getAuditTypes(term, type);
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
	 * 获取审计报告
	 * @param request
	 * @param response
	 */
	public void getAuditReport(HttpServletRequest request, HttpServletResponse response) {
		try {
			String id = request.getParameter("id");
			Map<String, Object> report = taskDao.getAuditReport(Integer.parseInt(id));
			List<FileDO> files = fileDao.getFilesBySource(EnumFileType.TASK.getCode(), Integer.parseInt(id));
			report.put("reportFiles", fileDao.convert(files, Arrays.asList(new String[]{"id","fileName","type","size","uploadTime","uploadUser"}), false));
			
			Map<String, Object> dataMap = new HashMap<String, Object>();
			dataMap.put("report", report);
			@SuppressWarnings("unchecked")
			String flowId = (String) ((Map<String, Object>) report.get("task")).get("flowId");
			Map<String, Object> workflowNodeAttributes = workflowService.getWorkflowNodeAttributes(flowId);
			// 流程节点的属性
			dataMap.put("workflowNodeAttributes", workflowNodeAttributes);
			// 可操作列表
			dataMap.put("actions", workflowService.getActionsWithAttributes(flowId));
			// 流程日志
			Map<String, Object> logArea = new HashMap<String, Object>();
			logArea.put("key", "com.audit.comm_file.logs");
			logArea.put("workflowLogs", workflowService.getWorkflowLogsAndCurrentStatus(flowId));
			dataMap.put("logArea", logArea);
			
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
	 * 导出审计报告到pdf
	 * @param request
	 * @param response
	 * @throws Exception 
	 */
	@SuppressWarnings("unchecked")
	public void exportAuditReportToPdf(HttpServletRequest request, HttpServletResponse response) throws Exception{
		InputStream cover = null;
		InputStream content = null;
		try{
			Integer id = Integer.parseInt(request.getParameter("id"));
			Map<String, Object> report = taskDao.getAuditReport(id);
			
			List<Map<String, Object>> checkMaps = (List<Map<String, Object>>) report.get("auditResult");
			// 去掉没有内容的结论
			Iterator<Map<String, Object>> it = checkMaps.iterator();
			Long number = 0l;
			while (it.hasNext()) {
				Map<String, Object> checkMap = it.next();
				if (StringUtils.isBlank((String)checkMap.get("result"))) {
					it.remove();
				} else {
					number++;
					checkMap.put("number", NumberHelper.convertToChineseNum((double)number));
				}
			}
			
			// 文件根路径
			String root = request.getSession().getServletContext().getRealPath("/");
			if (root == null) {
				root = TaskService.class.getResource("/").getPath() + "/../..";
			}
			List<JasperPrint> jasperPrintList = new ArrayList<JasperPrint>();
			// 封面
			List<Object> coverDatas = new ArrayList<Object>();
			coverDatas.add(report.get("task"));
			String coverUrl = root + AUDIT_REPORT_COVER_TEMPLATE_FILE_PATH;
			cover = new FileInputStream(new File(coverUrl));
			JasperReport coverReport = (JasperReport) JRLoader.loadObject(cover);
			JRDataSource coverData = new JRBeanCollectionDataSource(coverDatas, false);
			// 参数
			Map<String, Object> parameter = new HashMap<String, Object>();
			parameter.put("filePath", root + FILE_PATH);
			JasperPrint coverPrint = JasperFillManager.fillReport(coverReport, parameter, coverData);
			jasperPrintList.add(coverPrint);
			
			// 正文内容
			List<Object> contentDatas = new ArrayList<Object>();
			contentDatas.add(report);
			String contentUrl = root + AUDIT_REPORT_TEMPLATE_FILE_PATH;
			content = new FileInputStream(new File(contentUrl));
			JasperReport contentReport = (JasperReport) JRLoader.loadObject(content);
			JRDataSource contentData = new JRBeanCollectionDataSource(contentDatas, false);
			JasperPrint contentPrint = JasperFillManager.fillReport(contentReport, null, contentData);
			jasperPrintList.add(contentPrint);
			
			JasperHelper.exportToPdf(jasperPrintList, (String) ((Map<String, Object>) report.get("task")).get("reportName") + ".pdf", response);
			
		} catch (Exception e) {
			e.printStackTrace();
			if (!response.isCommitted()) {
				response.reset();
				ResponseHelper.output(response, "导出失败！" + e.getMessage());
			}
		} finally {
			IOUtils.closeQuietly(cover);
			IOUtils.closeQuietly(content);
		}
	}
	
	/**
	 * 导出审计报告到doc
	 * @param request
	 * @param response
	 * @throws Exception 
	 */
	@SuppressWarnings("unchecked")
	public void exportAuditReportToDoc(HttpServletRequest request, HttpServletResponse response) throws Exception{
		OutputStream outputStream = null;
		InputStream cover = null;
		InputStream content = null;
		FileBufferedOutputStream fbos = null;
		try{
			Integer id = Integer.parseInt(request.getParameter("id"));
			Map<String, Object> report = taskDao.getAuditReport(id);
			
			List<Object> contentDatas = new ArrayList<Object>();
			contentDatas.add(report);
			List<Object> coverDatas = new ArrayList<Object>();
			coverDatas.add(report.get("task"));
			String root = request.getSession().getServletContext().getRealPath("/");
			if (root == null) {
				root = TaskService.class.getResource("/").getPath() + "/../..";
			}
			String coverUrl = root + AUDIT_REPORT_COVER_TEMPLATE_FILE_PATH;
			cover = new FileInputStream(new File(coverUrl));
			JasperReport coverReport = (JasperReport) JRLoader.loadObject(cover);
			String contentUrl = root + AUDIT_REPORT_TEMPLATE_FILE_PATH;
			content = new FileInputStream(new File(contentUrl));
			JasperReport contentReport = (JasperReport) JRLoader.loadObject(content);
			JRDataSource contentData = new JRBeanCollectionDataSource(contentDatas, false);
			JRDataSource coverData = new JRBeanCollectionDataSource(coverDatas, false);
			Map<String, Object> parameter = new HashMap<String, Object>();
			parameter.put("filePath", root + FILE_PATH);
			JasperPrint coverPrint = JasperFillManager.fillReport(coverReport, parameter, coverData);
			JasperPrint contentPrint = JasperFillManager.fillReport(contentReport, null, contentData);
			List<JasperPrint> jasperPrintList = new ArrayList<JasperPrint>();
			jasperPrintList.add(coverPrint);
			jasperPrintList.add(contentPrint);
			outputStream = response.getOutputStream();

			fbos = new FileBufferedOutputStream();
			JRDocxExporter exporter = new JRDocxExporter();
			exporter.setExporterInput(SimpleExporterInput.getInstance(jasperPrintList));
			exporter.setExporterOutput(new SimpleOutputStreamExporterOutput(fbos));
			exporter.exportReport();
			fbos.close();
			if (fbos.size() > 0) {
				response.setContentType("application/msword");
				response.setHeader("Content-Disposition", "inline; filename=" + URLEncoder.encode(((String) ((Map<String, Object>) report.get("task")).get("reportName") + ".doc"), "UTF-8"));
				response.setContentLength(fbos.size());
				fbos.writeData(outputStream);
				fbos.dispose();
				outputStream.flush();
			}
			
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, "导出失败！" + e.getMessage());
		} finally {
			if (null != fbos) {
				fbos.close();
				fbos.dispose();
			}
			IOUtils.closeQuietly(cover);
			IOUtils.closeQuietly(content);
			IOUtils.closeQuietly(outputStream);
		}
	}
	
	/**
	 * 生成工作单
	 * @param request
	 * @param response
	 */
	public void createTask(HttpServletRequest request, HttpServletResponse response) {
		try {
			String obj = request.getParameter("obj");
			String operate = request.getParameter("operate");
			@SuppressWarnings("unchecked")
			Integer id = taskDao.createTask((Map<String, Object>) gson.fromJson(obj, new TypeToken<Map<String,Object>>() {}.getType()), operate);
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
	
	public void getTermTaskById(HttpServletRequest request, HttpServletResponse response) {
		try {
			String id = request.getParameter("id");
			if (id == null) throw SMSException.NO_ENTRY_SELECTED;
			TaskDO task = taskDao.internalGetById(NumberHelper.toInteger(id));
			Map<String, Object> dataMap = new HashMap<String, Object>();
			// task
			Map<String, Object> taskMap = taskDao.getTermTaskById(task);
			// 工作单附件
			List<FileDO> taskTermFiles = fileDao.getFilesBySource(EnumFileType.TERM_TASK.getCode(), task.getId());
			// 审计报告附件
			List<FileDO> reportTermFiles = fileDao.getFilesBySource(EnumFileType.TERM_AUDIT_REPORT.getCode(), task.getId());
			// 签批件
			List<FileDO> qianPiJianTermFiles = fileDao.getFilesBySource(EnumFileType.TERM_TASK_QIANPIJIAN.getCode(), task.getId());
			// 完成情况
			List<FileDO> wanChengQingKuangTermFiles = fileDao.getFilesBySource(EnumFileType.TERM_TASK_WANCHENGQINGKANG.getCode(), task.getId());
			// 审核签批件
			List<FileDO> shenHeQianPiTermFiles = fileDao.getFilesBySource(EnumFileType.TERM_TASK_QIANPIJIAN_SHENHE.getCode(), task.getId());
			taskMap.put("taskTermFiles", fileDao.convert(taskTermFiles));
			taskMap.put("reportTermFiles", fileDao.convert(reportTermFiles));
			taskMap.put("qianPiJianTermFiles", fileDao.convert(qianPiJianTermFiles));
			taskMap.put("wanChengQingKuangTermFiles", fileDao.convert(wanChengQingKuangTermFiles));
			taskMap.put("shenHeQianPiTermFiles", fileDao.convert(shenHeQianPiTermFiles));
			dataMap.put("task", taskMap);
			// 可操作列表
			dataMap.put("actions", workflowService.getActionsWithAttributes(task.getFlowId()));
			// 流程节点的属性
			Map<String, Object> workflowNodeAttributes = workflowService.getWorkflowNodeAttributes(task.getFlowId());
			dataMap.put("workflowNodeAttributes", workflowNodeAttributes);
			// 流程日志
			Map<String, Object> logArea = new HashMap<String, Object>();
			logArea.put("key", "com.audit.comm_file.logs");
			logArea.put("workflowLogs", workflowService.getWorkflowLogsAndCurrentStatus(task.getFlowId()));
			dataMap.put("logArea", logArea);
			
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
	
	public void getTaskMenuPermission(HttpServletRequest request, HttpServletResponse response) {
		try {
			Integer taskId = NumberHelper.toInteger(request.getParameter("taskId"));
			boolean flag = taskDao.getTaskMenuPermission(taskId);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", flag);
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getTaskMenuPermissionByUser(HttpServletRequest request, HttpServletResponse response) {
		try {
			Integer taskId = NumberHelper.toInteger(request.getParameter("taskId"));
			Set<String> data = taskDao.getTaskMenuPermissionByUser(taskId);
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
	
	public void setTaskDao(TaskDao taskDao) {
		this.taskDao = taskDao;
	}

	public void setWorkflowService(WorkflowService workflowService) {
		this.workflowService = workflowService;
	}

	public void setFileDao(FileDao fileDao) {
		this.fileDao = fileDao;
	}

}
