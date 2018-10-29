package com.usky.sms.audit.improve;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
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

import com.usky.sms.audit.EnumAuditRole;
import com.usky.sms.audit.auditor.AuditorDao;
import com.usky.sms.audit.check.CheckListDO;
import com.usky.sms.audit.check.CheckListDao;
import com.usky.sms.audit.check.EnumImproveItemStatus;
import com.usky.sms.audit.check.ImproveItemUserDO;
import com.usky.sms.audit.check.ImproveItemUserDao;
import com.usky.sms.audit.task.TaskDao;
import com.usky.sms.common.JasperHelper;
import com.usky.sms.common.NumberHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.dictionary.DictionaryDO;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.file.EnumFileType;
import com.usky.sms.file.FileDO;
import com.usky.sms.file.FileDao;
import com.usky.sms.file.FileService;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.unit.UnitRoleActorDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.workflow.WorkflowService;

public class ImproveService extends AbstractService {
	/** 导出文件名称 */
	public static final String DOWNLOAD_FILE_NAME = "整改反馈单.pdf";
	
	/** 报表模板文件目录 */
	public static final String FILE_PATH = "/uui/com/audit/export_template/improve_report/";
	
	/** 报表模板文件路径 */
	public static final String IMPROVE_REPORT_TEMPLATE_FILE_PATH = FILE_PATH + "improve_report.jasper";
	
	/** 导出文件名称 */
	public static final String TRACE_DOWNLOAD_FILE_NAME = "验证单.pdf";
	
	/** 报表模板文件目录 */
	public static final String TRACE_FILE_PATH = "/uui/com/audit/export_template/trace_report/";
	
	/** 报表模板文件路径 */
	public static final String TRACE_REPORT_TEMPLATE_FILE_PATH = TRACE_FILE_PATH + "improve_report.jasper";

	@Autowired
	private TaskDao taskDao;
	
	@Autowired
	private WorkflowService workflowService;
	
	@Autowired
	private FileDao fileDao;
	
	@Autowired
	private ImproveDao improveDao;
	
	@Autowired
	private CheckListDao checkListDao;
	
	@Autowired
	private AuditorDao auditorDao;
	
	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private FileService fileService;
	
	@Autowired
	private UnitRoleActorDao unitRoleActorDao;
	
	@Autowired
	private DictionaryDao dictionaryDao;
	
	@Autowired
	private ImproveItemUserDao improveItemUserDao;

	/**
	 * 获取整改单
	 * @param request
	 * @param response
	 */
	public void getImproveById(HttpServletRequest request, HttpServletResponse response) {
		try {
			String id = request.getParameter("id");
			
			// 是否按照责任单位排序
			boolean isGroupedByImproveUnit = false;
			
			// 是否按照专业
			boolean isDividedByProfession = false;

			// 是否是被转发人查看信息
			boolean isTransmitted = false;
			
			// 是否显示工作流按钮
			boolean showActions = true;
			
			// 是否有拒绝的问题
			boolean hasAuditRejected = false;
			
			if (!StringUtils.isBlank(request.getParameter("isGroupedByImproveUnit"))) {
				isGroupedByImproveUnit = Boolean.valueOf(request.getParameter("isGroupedByImproveUnit")).booleanValue();
			}
			
			if (!StringUtils.isBlank(request.getParameter("isDividedByProfession"))) {
				isDividedByProfession = Boolean.valueOf(request.getParameter("isDividedByProfession")).booleanValue();
			}
			
			if (!StringUtils.isBlank(request.getParameter("isTransmitted"))) {
				isTransmitted = Boolean.valueOf(request.getParameter("isTransmitted")).booleanValue();
			}
			ImproveDO improve = improveDao.internalGetById(Integer.parseInt(id));
			Map<String, Object> improveMap = improveDao.convert(improve);
			
			Set<CheckListDO> checkListSet = improve.getCheckLists();
			List<CheckListDO> checkLists = new ArrayList<CheckListDO>();
			List<Integer> checkListIds = new ArrayList<Integer>();
			if (null != checkListSet) {
				if (isDividedByProfession) { // 审核时显示用户所在专业的检查单，并且当前用户时检查的组员
					List<DictionaryDO> professions = auditorDao.getProfessionsByUserId(UserContext.getUserId());
					for (CheckListDO checkList : checkListSet) {
						if (!checkList.isDeleted()) {
							if (EnumImproveItemStatus.预案拒绝.getCode() == checkList.getImproveItemStatus()) {
								hasAuditRejected = true;
							}
							// 审计组员
							Set<String> members = new HashSet<String>();
							if (null != checkList.getCheck() && !StringUtils.isBlank(checkList.getCheck().getCommitUser())) {
								members.addAll(Arrays.asList(StringUtils.split(checkList.getCheck().getCommitUser(), ",")));
							}
							if (professions.contains(checkList.getItemProfession()) && members.contains(String.valueOf(UserContext.getUserId())) && EnumImproveItemStatus.暂时无法完成.getCode() != checkList.getImproveItemStatus()) { // 只显示用户所在专业的检查单，并且检查单的审计员是当前用户,且状态不是'暂时无法完成'
								checkLists.add(checkList);
								checkListIds.add(checkList.getId());
							} else { // 如果存在未经审核的检查单，则将工作流按钮隐藏
								if (EnumImproveItemStatus.预案通过.getCode() != checkList.getImproveItemStatus() && EnumImproveItemStatus.暂时无法完成.getCode() != checkList.getImproveItemStatus() && EnumImproveItemStatus.预案拒绝.getCode() != checkList.getImproveItemStatus()){
									// 隐藏工作流按钮
									showActions = false;
								}
							}
						}
					}
				} else if (isTransmitted) { // 是否是被转发人查看信息,被转发人获取整改反馈明细
					for (CheckListDO checkList : checkListSet) {
						Set<ImproveItemUserDO> improveItemUsers = checkList.getImproveItemUsers();
						if (!checkList.isDeleted() && null != improveItemUsers) {
							for (ImproveItemUserDO improveItemUser : improveItemUsers) {
								if (UserContext.getUser().equals(improveItemUser.getUser()) && !checkLists.contains(checkList)) {
									checkLists.add(checkList);
									checkListIds.add(checkList.getId());
								}
							}
						}
					}
					
				} else { // 全部明细
					for (CheckListDO checkList : checkListSet) {
						// 过滤掉已删除的检查单
						if (!checkList.isDeleted()) {
							// 填写完成情况时不将状态为"暂时无法完成"的问题返回
							if (null == checkList.getImproveItemStatus() || EnumImproveItemStatus.暂时无法完成.getCode() != checkList.getImproveItemStatus()) {
								checkLists.add(checkList);
								checkListIds.add(checkList.getId());
							}
						}
					}
				}
			}
			
			// 验证上传的附件
			Map<Integer, Object> confirmFilesMap = this.getConfirmFilesMap(checkListIds);
			
			// 返回的字段
			List<String> fields = Arrays.asList(new String[]{"id", "itemPoint", "auditRecord", "improveLastDate", "improveItemStatus", "improveResponsiblePerson", "verification", "improveItemUsers", "confirmResult"});
			// 按照检查要点升序排列
			if (!isGroupedByImproveUnit) {
				List<Map<String, Object>> checkListMap = new ArrayList<Map<String,Object>>();
				for (CheckListDO checkList : checkLists) {
					Map<String, Object> map = checkListDao.convert(checkList, fields, true);
					// 转发处理人
					Set<ImproveItemUserDO> improveItemUsers = checkList.getImproveItemUsers();
					if (null != improveItemUsers) {
						map.put("improveItemUsers", improveItemUserDao.convert(new ArrayList<ImproveItemUserDO>(improveItemUsers), Arrays.asList(new String[]{"id", "user"})));
					}
					// 附件
					map.put("confirmFiles", confirmFilesMap.get(checkList.getId()));
					
					checkListMap.add(map);
				}
				
				Collections.sort(checkListMap, new Comparator<Map<String, Object>>() {
					public int compare(Map<String, Object> arg0, Map<String, Object> arg1) {
						return ((String) arg0.get("itemPoint")).compareTo((String) arg1.get("itemPoint"));
					}
				});
				improveMap.put("checkLists", checkListMap);
			} else { // 按责任单位分组
				List<List<Map<String, Object>>> checkListMap = checkListDao.groupByImproveUnit(checkLists, fields);
				improveMap.put("checkLists", checkListMap);
			}

			Map<String, Object> dataMap = new HashMap<String, Object>();
			dataMap.put("improve", improveMap);
			String flowId = (String) improveMap.get("flowId");
			// 审计报告的签批件是与工作单关联
			List<FileDO> auditReportFiles = fileDao.getFilesBySource(EnumFileType.TASK.getCode(), improve.getTask().getId());
			improveMap.put("auditReportFiles", fileDao.convert(auditReportFiles));
			// 整改反馈的签批件是与整改单单关联
			List<FileDO> improveFiles = fileDao.getFilesBySource(EnumFileType.IMPROVE.getCode(), improve.getId());
			improveMap.put("improveFiles", fileDao.convert(improveFiles));
			
			// 整改反馈拒绝的签批件是与整改单单关联
			List<FileDO> improveRejectedFiles = fileDao.getFilesBySource(EnumFileType.IMPROVE_REJECTED.getCode(), improve.getId());
			improveMap.put("improveRejectedFiles", fileDao.convert(improveRejectedFiles));
			
			//分子公司内审、二级内审的整改跟踪上传的附件
			List<FileDO> improveSUBFiles = fileDao.getFilesBySource(EnumFileType.SUB2_3_IMPROVE_TRACE.getCode(), improve.getId());
			improveMap.put("improveSUBFiles", fileDao.convert(improveSUBFiles));
			//分子公司内审、二级内审的验证单附件
			List<FileDO> improveSUB2_SUB3Files = fileDao.getFilesBySource(EnumFileType.SUB2_SUB3_COMFIRM_LIST.getCode(), improve.getId());
			improveMap.put("improveSUB2_SUB3Files", fileDao.convert(improveSUB2_SUB3Files));
			
			Map<String, Object> workflowNodeAttributes = workflowService.getWorkflowNodeAttributes(flowId);
			// 流程节点的属性
			dataMap.put("workflowNodeAttributes", workflowNodeAttributes);
			if (!isTransmitted) {
				// 可操作列表
				dataMap.put("actions", workflowService.getActionsWithAttributes(flowId));
			}
			List<FileDO> transmittedFiles = new ArrayList<FileDO>();
			if (!checkLists.isEmpty()) {
				// 主要责任单位下是A3.2三级审计主管的用户
				DictionaryDO dic = dictionaryDao.getByTypeAndKey("审计角色", EnumAuditRole.THIRD_GRADE_AUDIT_MASTER.getKey());
				if (null == dic) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_133000006, "审计角色", EnumAuditRole.THIRD_GRADE_AUDIT_MASTER.getKey());
				}
				List<String> improveUnits = new ArrayList<String>();
				for (CheckListDO checkList : checkLists) {
					improveUnits.add(checkList.getImproveUnit());
				}
				Collection<UserDO> users = checkListDao.getUsersByImproveUnitsAndRoleName(improveUnits, dic.getName());
				for (FileDO file : fileDao.getFilesBySource(EnumFileType.IMPROVE_TRANSMITTED.getCode(), improve.getId())) {
					// 显示上传者是主要责任单位下是A3.2三级审计主管的用户的文件
					if (users.contains(file.getUploadUser())) {
						transmittedFiles.add(file);
					}
				}
//				Collection<UserDO> users = checkListDao.getUsersByImproveUnitAndRoleName(checkLists.get(0).getImproveUnit(), dic.getName(), false);
//				for (FileDO file : fileDao.getFilesBySource(EnumFileType.IMPROVE_TRANSMITTED.getCode(), improve.getId())) {
//					// 显示上传者是主要责任单位下是A3.2三级审计主管的用户的文件
//					if (users.contains(file.getUploadUser())) {
//						transmittedFiles.add(file);
//					}
//				}
			}
			improveMap.put("transmittedFiles", fileDao.convert(transmittedFiles));
			// 流程日志
			Map<String, Object> logArea = new HashMap<String, Object>();
			logArea.put("key", "com.audit.comm_file.logs");
			logArea.put("workflowLogs", workflowService.getWorkflowLogsAndCurrentStatus(flowId));
			dataMap.put("logArea", logArea);
			// 是否显示工作流按钮
			dataMap.put("showActions", showActions);
			// 是否有拒绝的问题项
			dataMap.put("hasAuditRejected", hasAuditRejected);
			
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
	
	@SuppressWarnings("unchecked")
	private Map<Integer, Object> getConfirmFilesMap(List<Integer> checkListIds) {
		// 验证上传的附件
		List<Map<String, Object>> confirmFiles = fileDao.convert(fileDao.getFilesBySources(EnumFileType.AUDIT_CONFIRM.getCode(), checkListIds), false);
		Map<Integer, Object> confirmFilesMap = new HashMap<Integer, Object>();
		for (Map<String, Object> confirmFile : confirmFiles) {
			List<Map<String, Object>> files = null;
			if (confirmFilesMap.get((Integer) confirmFile.get("source")) == null) {
				files = new ArrayList<Map<String,Object>>();
			} else {
				files = (List<Map<String, Object>>) confirmFilesMap.get((Integer) confirmFile.get("source"));
			}
			files.add(confirmFile);
			confirmFilesMap.put((Integer) confirmFile.get("source"), files);
		}
		return confirmFilesMap;
	}
	
	
	/**
	 * 获取跟踪表
	 * @param request
	 * @param response
	 */
	public void getTraceById(HttpServletRequest request, HttpServletResponse response) {
		try {
			String id = request.getParameter("id");
			ImproveDO improve = improveDao.internalGetById(NumberHelper.toInteger(id));
			Map<String, Object> improveMap = improveDao.convert(improve);
			improveMap.put("checkLists", improveDao.groupValidate(improve, improve.getCheckLists()));
			Map<String, Object> dataMap = new HashMap<String, Object>();
			dataMap.put("improve", improveMap);
			String flowId = (String) improveMap.get("flowId");
			
			// 可操作列表
			dataMap.put("actions", workflowService.getActionsWithAttributes(flowId));
			
			Map<String, Object> workflowNodeAttributes = workflowService.getWorkflowNodeAttributes(flowId);
			// 流程节点的属性
			dataMap.put("workflowNodeAttributes", workflowNodeAttributes);
			// 流程日志
			Map<String, Object> logArea = new HashMap<String, Object>();
			logArea.put("key", "com.audit.comm_file.logs");
			logArea.put("workflowLogs", workflowService.getWorkflowLogsAndCurrentStatus(flowId));
			dataMap.put("logArea", logArea);
			dataMap.put("conclusion", improveDao.getConclusion(improve.getCheckLists()));
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
	 * 将整改单导出到pdf
	 * @param request
	 * @param response
	 */
	public void exportImproveToPdf(HttpServletRequest request, HttpServletResponse response) {
		InputStream content = null;
		try {
			String improveId = request.getParameter("improveId");
			String checkListIds = request.getParameter("checkListIds");
			
			ImproveDO improve = improveDao.internalGetById(Integer.parseInt(improveId));
			Map<String, Object> improveMap = improveDao.convert(improve);
			List<String> users = new ArrayList<String>();
			Set<TransactorDO> transactors = improve.getTransactor();
			if (null != transactors) {
				for (TransactorDO transactor : transactors) {
					users.add(transactor.getUser().getFullname());
				}
			}
			improveMap.put("transactor", StringUtils.join(users, ","));
			List<Map<String, Object>> checkListMap = null;
			if (null != improve.getCheckLists()) {
				List<CheckListDO> checkLists = null;
				// 转发时导出签批件
				if (null != checkListIds) {
					String[] ids = gson.fromJson(checkListIds, String[].class);
					if (ids.length > 0) {
						checkLists = checkListDao.internalGetByIds(ids);
					}
				} else {
					checkLists = checkListDao.getByImproveId(improve.getId());
				}
				checkListMap = checkListDao.convert(checkLists, Arrays.asList(new String[]{"id", "itemPoint", "auditRecord", "improveDate", "improveUnit", "improveLastDate", "improveItemStatus", "improveReason", "improveMeasure"}), false);
			}
			improveMap.put("checkLists", checkListMap);
			
			Map<String, Object> dataMap = new HashMap<String, Object>();
			dataMap.put("improve", improveMap);
			
			// 文件根路径
			String root = request.getSession().getServletContext().getRealPath("/");
			if (root == null) {
				root = ImproveService.class.getResource("/").getPath() + "/../..";
			}
			List<JasperPrint> jasperPrintList = new ArrayList<JasperPrint>();
			// 正文内容
			List<Object> contentDatas = new ArrayList<Object>();
			contentDatas.add(improveMap);
			String contentUrl = root + IMPROVE_REPORT_TEMPLATE_FILE_PATH;
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
	
	/**
	 * 将验证单导出到pdf
	 * @param request
	 * @param response
	 */
	public void exportTraceToPdf(HttpServletRequest request, HttpServletResponse response) {
		InputStream content = null;
		try {
			String improveId = request.getParameter("improveId");
			String checkListIds = request.getParameter("checkListIds");
			
			ImproveDO improve = improveDao.internalGetById(Integer.parseInt(improveId));
			Map<String, Object> improveMap = improveDao.convert(improve);
			List<String> users = new ArrayList<String>();
			Set<TransactorDO> transactors = improve.getTransactor();
			if (null != transactors) {
				for (TransactorDO transactor : transactors) {
					users.add(transactor.getUser().getFullname());
				}
			}
			improveMap.put("transactor", StringUtils.join(users, ","));
			List<Map<String, Object>> checkListMap = null;
			if (null != improve.getCheckLists()) {
				List<CheckListDO> checkLists = null;
				// 转发时导出签批件
				if (null != checkListIds) {
					String[] ids = gson.fromJson(checkListIds, String[].class);
					if (ids.length > 0) {
						checkLists = checkListDao.internalGetByIds(ids);
					}
				} else {
					checkLists = checkListDao.getByImproveId(improve.getId());
				}
				checkListMap = checkListDao.convert(checkLists, Arrays.asList(new String[]{"id", "itemPoint", "auditRecord", "improveDate", "improveUnit", "improveLastDate", "improveItemStatus", "improveReason", "improveMeasure"}), false);
			}
			improveMap.put("checkLists", checkListMap);
			
			Map<String, Object> dataMap = new HashMap<String, Object>();
			dataMap.put("improve", improveMap);
			
			// 文件根路径
			String root = request.getSession().getServletContext().getRealPath("/");
			if (root == null) {
				root = ImproveService.class.getResource("/").getPath() + "/../..";
			}
			List<JasperPrint> jasperPrintList = new ArrayList<JasperPrint>();
			// 正文内容
			List<Object> contentDatas = new ArrayList<Object>();
			contentDatas.add(improveMap);
			String contentUrl = root + TRACE_REPORT_TEMPLATE_FILE_PATH;
			content = new FileInputStream(new File(contentUrl));
			JasperReport contentReport = (JasperReport) JRLoader.loadObject(content);
			JRDataSource contentData = new JRBeanCollectionDataSource(contentDatas, false);
			// 参数
			Map<String, Object> parameter = new HashMap<String, Object>();
			parameter.put("filePath", root + TRACE_FILE_PATH);
			JasperPrint contentPrint = JasperFillManager.fillReport(contentReport, parameter, contentData);
			jasperPrintList.add(contentPrint);
			
			JasperHelper.exportToPdf(jasperPrintList, TRACE_DOWNLOAD_FILE_NAME, response);
			
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
	 * 根据工作单的ID查询对应整改单的ID
	 * @param request
	 * @param response
	 */
	public void getImproveByTaskId(HttpServletRequest request, HttpServletResponse response) {
		try {
			String taskId = request.getParameter("taskId");
			ImproveDO improve = null;
			if (null != taskId) {
				improve = improveDao.getImproveByTaskId(Integer.parseInt(taskId));
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", improveDao.convert(improve, false));
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

	public void setImproveDao(ImproveDao improveDao) {
		this.improveDao = improveDao;
	}

	public void setCheckListDao(CheckListDao checkListDao) {
		this.checkListDao = checkListDao;
	}

	public void setAuditorDao(AuditorDao auditorDao) {
		this.auditorDao = auditorDao;
	}

	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}

	public void setFileService(FileService fileService) {
		this.fileService = fileService;
	}

	public void setUnitRoleActorDao(UnitRoleActorDao unitRoleActorDao) {
		this.unitRoleActorDao = unitRoleActorDao;
	}

	public void setDictionaryDao(DictionaryDao dictionaryDao) {
		this.dictionaryDao = dictionaryDao;
	}

	public void setImproveItemUserDao(ImproveItemUserDao improveItemUserDao) {
		this.improveItemUserDao = improveItemUserDao;
	}

}
