package com.usky.sms.audit.improvenotice;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
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

import com.usky.sms.common.JasperHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.file.EnumFileType;
import com.usky.sms.file.FileDO;
import com.usky.sms.file.FileDao;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.workflow.WorkflowService;

public class SubImproveNoticeService extends AbstractService {
	
	/** 导出文件名称 */
	public static final String DOWNLOAD_FILE_NAME = "整改通知单.pdf";
	
	/** 报表模板文件目录 */
	public static final String FILE_PATH = "/uui/com/audit/export_template/improve_notice/";
	
	/** 报表模板文件路径 */
	public static final String IMPROVE_NOTICE_TEMPLATE_FILE_PATH = FILE_PATH + "sub_improve_notice.jasper";

	@Autowired
	private SubImproveNoticeDao subImproveNoticeDao;
	
	@Autowired
	private FileDao fileDao;
	
	@Autowired
	private WorkflowService workflowService;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private ImproveNoticeIssueDao improveNoticeIssueDao;
	
	@Autowired
	private ImproveNoticeDao improveNoticeDao;

	/**
	 * 获取整改通知单子单
	 * @param request
	 * @param response
	 */
	public void getSubImproveNoticeById(HttpServletRequest request, HttpServletResponse response) {
		try {
			String id = request.getParameter("id");
			String operate = request.getParameter("operate");
			SubImproveNoticeDO subImproveNotice = subImproveNoticeDao.internalGetById(Integer.parseInt(id));
			Map<String, Object> subImproveNoticeMap = subImproveNoticeDao.convert(subImproveNotice);
			Map<String, Object> improveNoticeMap = improveNoticeDao.convert(subImproveNotice.getImproveNotice(), false);
			// 整改通知单下发文件
			List<FileDO> improveNoticeSentFiles = fileDao.getFilesBySource(EnumFileType.IMPROVE_NOTICE_SENT.getCode(), subImproveNotice.getImproveNotice().getId());
			// 整改通知单子单上传文件
			List<FileDO> improveNoticeEchoFiles = fileDao.getFilesBySource(EnumFileType.SUB_IMPROVE_NOTICE_ECHO.getCode(), subImproveNotice.getId());
			// 文件放在一起
			improveNoticeSentFiles.addAll(improveNoticeEchoFiles);
			improveNoticeMap.put("improveNoticeSentFiles", fileDao.convert(improveNoticeSentFiles));
			// 整改通知单子单被拒绝的文件
			List<FileDO> improveNoticeRejectedFiles = fileDao.getFilesBySource(EnumFileType.SUB_IMPROVE_NOTICE_REJECTED.getCode(), subImproveNotice.getId());
			improveNoticeMap.put("improveNoticeRejectedFiles", fileDao.convert(improveNoticeRejectedFiles));
			subImproveNoticeMap.put("improveNotice", improveNoticeMap);
			List<Map<String, Object>> subImproveNoticeIssueMaps = null;
			if (null != subImproveNotice.getImproveNoticeIssues()) {
				List<ImproveNoticeIssueDO> improveNoticeIssues = null;
				if ("completion".equals(operate)) { // 进入填写完成情况页面时
					improveNoticeIssues = new ArrayList<ImproveNoticeIssueDO>();
					for (ImproveNoticeIssueDO improveNoticeIssue : subImproveNotice.getImproveNoticeIssues()) {
						if (!EnumImproveNoticeIssueStatus.AUDIT_UN_COMPLETED_TEMPORARILY.toString().equals(improveNoticeIssue.getStatus())) {
							improveNoticeIssues.add(improveNoticeIssue);
						}
					}
				} else {
					improveNoticeIssues = new ArrayList<ImproveNoticeIssueDO>(subImproveNotice.getImproveNoticeIssues());
				}
				// 排序 按照id的升序
				Collections.sort(improveNoticeIssues, new Comparator<ImproveNoticeIssueDO>() {
					@Override
					public int compare(ImproveNoticeIssueDO o1, ImproveNoticeIssueDO o2) {
						return o1.getId().compareTo(o2.getId());
					}
				});
				subImproveNoticeIssueMaps = improveNoticeIssueDao.convert(improveNoticeIssues, true);
				subImproveNoticeMap.put("improveNoticeIssues", subImproveNoticeIssueMaps);
			}
			
			Map<String, Object> dataMap = new HashMap<String, Object>();
			dataMap.put("subImproveNotice", subImproveNoticeMap);
			String flowId = (String) subImproveNoticeMap.get("flowId");
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
	 * 将整改通知单子单导出到pdf
	 * @param request
	 * @param response
	 */
	@SuppressWarnings("unchecked")
	public void exportSubImproveNoticeToPdf(HttpServletRequest request, HttpServletResponse response) {
		InputStream content = null;
		try {
			String id = request.getParameter("id");
			
			// 整改通知单子单
			SubImproveNoticeDO subImproveNotice = subImproveNoticeDao.internalGetById(Integer.parseInt(id));
			Map<String, Object> subImproveNoticeMap = subImproveNoticeDao.convert(subImproveNotice, false);
			List<String> improveUnitNames = new ArrayList<String>();
			List<Map<String, Object>> improveUnits = (List<Map<String, Object>>) subImproveNoticeMap.get("improveUnit");
			if (null != improveUnits) {
				for (Map<String, Object> improveUnit : improveUnits) {
					if (!StringUtils.isBlank((String) improveUnit.get("name"))) {
						improveUnitNames.add((String) improveUnit.get("name"));
					}
				}
			}
			subImproveNoticeMap.put("improveUnitDisplayName", StringUtils.join(improveUnitNames, ","));
			improveUnitNames.clear();
			// 整改通知单
			ImproveNoticeDO improveNotice = subImproveNotice.getImproveNotice();
			Map<String, Object> improveNoticeMap = improveNoticeDao.convert(improveNotice, false);
			subImproveNoticeMap.put("improveNotice", improveNoticeMap);
			// 问题列表
			List<ImproveNoticeIssueDO> improveNoticeIssues = improveNoticeIssueDao.getBySubImproveNoticeId(Integer.parseInt(id));
			List<Map<String, Object>> improveNoticeIssueMaps = improveNoticeIssueDao.convert(improveNoticeIssues, Arrays.asList(new String[]{"id", "issueContent", "improveReason", "improveMeasure", "improveUnit", "expectedCompletedDate"}), false);
			for (Map<String, Object> improveNoticeIssueMap : improveNoticeIssueMaps) {
				improveUnits = (List<Map<String, Object>>) improveNoticeIssueMap.get("improveUnit");
				if (null != improveUnits) {
					for (Map<String, Object> improveUnit : improveUnits) {
						if (!StringUtils.isBlank((String) improveUnit.get("name"))) {
							improveUnitNames.add((String) improveUnit.get("name"));
						}
					}
				}
				improveNoticeIssueMap.put("improveUnitDisplayName", StringUtils.join(improveUnitNames, ","));
				improveUnitNames.clear();
			}
			subImproveNoticeMap.put("improveNoticeIssues", improveNoticeIssueMaps);
			
			Map<String, Object> dataMap = new HashMap<String, Object>();
			dataMap.put("subImproveNotice", subImproveNoticeMap);
			
			// 文件根路径
			String root = request.getSession().getServletContext().getRealPath("/");
			if (root == null) {
				root = SubImproveNoticeService.class.getResource("/").getPath() + "/../..";
			}
			List<JasperPrint> jasperPrintList = new ArrayList<JasperPrint>();
			// 正文内容
			List<Object> contentDatas = new ArrayList<Object>();
			contentDatas.add(subImproveNoticeMap);
			String contentUrl = root + IMPROVE_NOTICE_TEMPLATE_FILE_PATH;
			content = new FileInputStream(new File(contentUrl));
			JasperReport contentReport = (JasperReport) JRLoader.loadObject(content);
			JRDataSource contentData = new JRBeanCollectionDataSource(contentDatas, false);
			// 参数
			Map<String, Object> parameter = new HashMap<String, Object>();
			parameter.put("filePath", root + FILE_PATH);
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
	
	public void setSubImproveNoticeDao(SubImproveNoticeDao subImproveNoticeDao) {
		this.subImproveNoticeDao = subImproveNoticeDao;
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

	public void setImproveNoticeIssueDao(ImproveNoticeIssueDao improveNoticeIssueDao) {
		this.improveNoticeIssueDao = improveNoticeIssueDao;
	}

	public void setImproveNoticeDao(ImproveNoticeDao improveNoticeDao) {
		this.improveNoticeDao = improveNoticeDao;
	}
	
}
