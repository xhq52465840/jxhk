package com.usky.sms.tem;

import java.io.OutputStream;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.file.EnumFileType;
import com.usky.sms.file.ExcelUtil;
import com.usky.sms.file.FileDao;
import com.usky.sms.permission.PermissionSetDao;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.risk.ActionItemRiskAnalysisDao;
import com.usky.sms.service.QueryService;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;

public class ActionItemService extends AbstractService {
	
	@Autowired
	private ActionItemDao actionItemDao;
	
	@Autowired
	private FileDao fileDao;
	
	@Autowired
	private UserDao userDao;

	@Autowired
	private QueryService queryService;
	
	@Autowired
	private PermissionSetDao permissionSetDao;
	
	@Autowired
	private ActionItemRiskAnalysisDao actionItemRiskAnalysisDao;
	
	public ActionItemService() {
	}
	
	/**
	 * 批量验证行动项
	 * @param request
	 * @param response
	 */
	public void confirmActionItems(HttpServletRequest request, HttpServletResponse response) {
		try {
			@SuppressWarnings("unchecked")
			List<Number> actionIds = gson.fromJson(request.getParameter("actionItemIds"), List.class);
			if (actionIds == null || actionIds.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "未选择任何行动项");
			}
			String confirmComment = request.getParameter("confirmComment");
			@SuppressWarnings("unchecked")
			List<Number> fileIds = gson.fromJson(request.getParameter("fileIds"), List.class);
			@SuppressWarnings("unchecked")
			List<Number> processors = gson.fromJson(request.getParameter("processor"), List.class);
			if (processors == null || processors.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "未选择任何审批人");
			}
			actionItemDao.confirmActionItems(actionIds, fileIds, processors, confirmComment);
			
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			if (actionIds.size() == 1) {
				result.put("data", this.getReturnedDataForBatchOperation(actionIds));
			}
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
	 * 批量验证拒绝行动项
	 * @param request
	 * @param response
	 */
	@SuppressWarnings("unchecked")
	public void confirmRejectedActionItems(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<Number> actionIds = gson.fromJson(request.getParameter("actionItemIds"), List.class);
			if (actionIds == null || actionIds.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "未选择任何行动项");
			}
			String confirmComment = request.getParameter("confirmComment");
			List<Integer> actionIdsInteger = new ArrayList<Integer>();
			for (Number actionItemId : actionIds) {
				actionIdsInteger.add(actionItemId.intValue());
			}
			Map<Integer, List<Integer>> executorIdsMap = actionItemDao.getExecutorIdsMapByIds(actionIdsInteger);
			List<Map<String, Object>> maps = new ArrayList<Map<String, Object>>();;
			// 更新状态，情况处理人，设置验证意见，清空完成日期，和验证期限
			for (Number actionItemId : actionIds) {
				if (executorIdsMap.get(actionItemId.intValue()) == null || executorIdsMap.get(actionItemId.intValue()).isEmpty()) {
					String desc = actionItemDao.getDescriptionById(actionItemId.intValue());
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "行动项[" + desc + "]没有执行人");
				}
				Map<String, Object> map = new HashMap<String, Object>();
				map.put("id", actionItemId);
				map.put("completionDate", null);
				map.put("confirmDate", null);
				map.put("confirmDeadLine", null);
				map.put("status", ActionItemDao.ACTION_ITEM_STATUS_CONFIRM_REJECTED);
				map.put("confirmComment", confirmComment);
				List<Double> processorsDouble = new ArrayList<Double>();
				for (Integer processor : executorIdsMap.get(actionItemId.intValue())) {
					processorsDouble.add(processor.doubleValue());
				}
				map.put("processors", processorsDouble);
				maps.add(map);
			}
			actionItemDao.updateAll(maps.toArray(new Map[0]));
			Map<String, Object> result = new HashMap<String, Object>();
			if (actionIds.size() == 1) {
				result.put("data", this.getReturnedDataForBatchOperation(actionIds));
			}
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
	 * 批量审核通过行动项
	 * @param request
	 * @param response
	 */
	@SuppressWarnings("unchecked")
	public void auditPassActionItems(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<Number> actionIds = gson.fromJson(request.getParameter("actionItemIds"), List.class);
			if (actionIds == null || actionIds.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "未选择任何行动项");
			}
			String auditComment = request.getParameter("auditComment");
			List<Map<String, Object>> maps = new ArrayList<Map<String, Object>>();;
			// 更新状态，情况处理人，设置审核意见，设置完成时间
			Date date = new Date();
			for (Number actionItemId : actionIds) {
				Map<String, Object> map = new HashMap<String, Object>();
				map.put("id", actionItemId);
				map.put("status", ActionItemDao.ACTION_ITEM_STATUS_COMPLETE);
				map.put("auditComment", auditComment);
				map.put("processors", null);
				map.put("auditDate", date);
				maps.add(map);
			}
			actionItemDao.updateAll(maps.toArray(new Map[0]));
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			if (actionIds.size() == 1) {
				result.put("data", this.getReturnedDataForBatchOperation(actionIds));
			}
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
	 * 批量审核拒绝行动项
	 * @param request
	 * @param response
	 */
	@SuppressWarnings("unchecked")
	public void auditRejectedActionItems(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<Number> actionIds = gson.fromJson(request.getParameter("actionItemIds"), List.class);
			if (actionIds == null || actionIds.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "未选择任何行动项");
			}
			String auditComment = request.getParameter("auditComment");
			List<Integer> actionIdsInteger = new ArrayList<Integer>();
			for (Number actionItemId : actionIds) {
				actionIdsInteger.add(actionItemId.intValue());
			}
			Map<Integer, List<Integer>> executorIdsMap = actionItemDao.getExecutorIdsMapByIds(actionIdsInteger);
			List<Map<String, Object>> maps = new ArrayList<Map<String, Object>>();;
			// 更新状态，情况处理人，设置审核意见，清空完成日期、验证日期、验证期限和审核期限
			for (Number actionItemId : actionIds) {
				if (executorIdsMap.get(actionItemId.intValue()) == null || executorIdsMap.get(actionItemId.intValue()).isEmpty()) {
					String desc = actionItemDao.getDescriptionById(actionItemId.intValue());
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "行动项[" + desc + "]没有执行人");
				}
				Map<String, Object> map = new HashMap<String, Object>();
				map.put("id", actionItemId);
				map.put("completionDate", null);
				map.put("confirmDate", null);
				map.put("confirmDeadLine", null);
				map.put("auditDeadLine", null);
				map.put("status", ActionItemDao.ACTION_ITEM_STATUS_AUDIT_REJECTED);
				map.put("auditComment", auditComment);
				List<Double> processorsDouble = new ArrayList<Double>();
				for (Integer processor : executorIdsMap.get(actionItemId.intValue())) {
					processorsDouble.add(processor.doubleValue());
				}
				map.put("processors", processorsDouble);
				maps.add(map);
			}
			actionItemDao.updateAll(maps.toArray(new Map[0]));
			Map<String, Object> result = new HashMap<String, Object>();
			if (actionIds.size() == 1) {
				result.put("data", this.getReturnedDataForBatchOperation(actionIds));
			}
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
	 * 批量下发行动项
	 * @param request
	 * @param response
	 */
	@SuppressWarnings("unchecked")
	public void distributeActionItems(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<Integer> actionItemIds = null;
			
			Integer riskAnalysisId = request.getParameter("riskAnalysisId") == null ? null : Integer.parseInt(request.getParameter("riskAnalysisId"));
			if (riskAnalysisId != null) {
				actionItemIds = actionItemRiskAnalysisDao.getActionItemIdsByRiskAnalysisId(riskAnalysisId, ActionItemDao.ACTION_ITEM_STATUS_DRAFT);
			}
			
			if (actionItemIds == null || actionItemIds.isEmpty()) {
				if (actionItemIds == null) {
					actionItemIds = new ArrayList<Integer>();
				}
				List<Number> actionItemNumbers = gson.fromJson(request.getParameter("actionItemIds"), List.class);
				if (actionItemNumbers != null && !actionItemNumbers.isEmpty()) {
					for (Number actionItemNumber : actionItemNumbers) {
						actionItemIds.add(actionItemNumber.intValue());
					}
				}
			}
			if (actionItemIds == null || actionItemIds.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "没有可下发的行动项");
			}
			actionItemDao.distributeActionItems(actionItemIds);
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
	 * 执行行动项
	 * @param request
	 * @param response
	 */
	public void executeActionItem(HttpServletRequest request, HttpServletResponse response) {
		try {
			Integer actionItemId = request.getParameter("actionItemId") == null ? null : Integer.parseInt(request.getParameter("actionItemId"));
			if (actionItemId == null) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "未选择任何行动项");
			}
			ActionItemDO actionItem = actionItemDao.internalGetById(actionItemId);
			if (actionItem == null) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "行动项[ID:" + actionItemId + "]不存在");
			}
			@SuppressWarnings("unchecked")
			List<Number> fileIds = gson.fromJson(request.getParameter("fileIds"), List.class);
			String completionStatus = request.getParameter("completionStatus");
			Set<UserDO> users = actionItem.getConfirmMan();
			if (users == null || users.isEmpty()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "行动项[ID:" + actionItemId + "]未设置验证人");
			}
			List<Double> processorsDouble = new ArrayList<Double>();
			for (UserDO user : users) {
				processorsDouble.add(user.getId().doubleValue());
			}
			actionItemDao.executeActionItem(actionItemId, fileIds, processorsDouble, completionStatus);
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			List<Number> actionItemIds = new ArrayList<Number>();
			actionItemIds.add(actionItemId);
			result.put("data", this.getReturnedDataForBatchOperation(actionItemIds));
			ResponseHelper.output(response, result);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	private Map<String, Object> getReturnedDataForBatchOperation(List<Number> actionItemIds) {
		if (actionItemIds.size() == 1) {
			Integer actionId = actionItemIds.get(0).intValue();
			Map<String, Object> actionItemMap = actionItemDao.getById(actionId);
			actionItemMap.put("files", fileDao.convert(fileDao.getFilesBySource(EnumFileType.ACTION_ITEM_CONFIRM.getCode(), actionId), false));
			return actionItemMap;
		}
		return null;
	}
	
	/**
	 * 获取当前登录用户所在安监机构具有审核行动项权限的人
	 * @param request
	 * @param response
	 */
	public void getActionItemAuditors(HttpServletRequest request, HttpServletResponse response) {
		try {
			String term = request.getParameter("term");
			List<UserDO> users = permissionSetDao.getPermittedUsersByUnitsOfSpecifiedUser(UserContext.getUser(), term, PermissionSets.AUDIT_ACTION_ITEM.getName());
			
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", PageHelper.getPagedResult(userDao.convert(users, Arrays.asList(new String[]{"id", "username", "fullname", "avatar"}), false), request));
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
	 * 获取当前登录用户所在安监机构具有验证行动项权限的人
	 * @param request
	 * @param response
	 */
	public void getActionItemConfirmMen(HttpServletRequest request, HttpServletResponse response) {
		try {
			String term = request.getParameter("term");
			List<UserDO> users = permissionSetDao.getPermittedUsersByUnitsOfSpecifiedUser(UserContext.getUser(), term, PermissionSets.CONFIRM_ACTION_ITEM.getName());
			
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", PageHelper.getPagedResult(userDao.convert(users, Arrays.asList(new String[]{"id", "username", "fullname", "avatar"}), false), request));
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
	 * 获取行动项的状态
	 * @param request
	 * @param response
	 */
	public void getActionItemStatus(HttpServletRequest request, HttpServletResponse response) {
		try {
			List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
			String term = request.getParameter("term");
			for (EnumActionItemStatus e : EnumActionItemStatus.values()) {
				if (StringUtils.isNotBlank(term)) {
					if (e.getDescription().contains(term)) {
						Map<String, Object> actionItemStatus = new HashMap<String, Object>();
						actionItemStatus.put("id", e.getCode());
						actionItemStatus.put("name", e.getDescription());
						list.add(actionItemStatus);
					}
				} else {
					Map<String, Object> actionItemStatus = new HashMap<String, Object>();
					actionItemStatus.put("id", e.getCode());
					actionItemStatus.put("name", e.getDescription());
					list.add(actionItemStatus);
				}
			}
			
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", list);
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
	 * 导出行动项列表到excel
	 * @param request
	 * @param response
	 */
	@SuppressWarnings("unchecked")
	public void exportActionItemsToExcel(HttpServletRequest request, HttpServletResponse response) throws Exception{
		OutputStream out = response.getOutputStream();
		try {
			response.addHeader("content-disposition", "attachment;filename=" + URLEncoder.encode("行动项列表.xlsx", "UTF-8"));
			response.setContentType("application/msexcel");
			
			// 导出的表头
			String[][] titles = gson.fromJson(request.getParameter("titles"), String[][].class);
			Map<String, Object> result = (Map<String, Object>) queryService.getListFromDatabase(request);
			List<Map<String, Object>> dataList = (List<Map<String, Object>>) result.get("aaData");
			List<Object[]> datas = new ArrayList<Object[]>();
			for (Map<String, Object> map : dataList) {
				Object[] data = new Object[titles[0].length];
				for (int i = 0; i < titles[0].length; i++) {
					data[i] = this.getMapValue(titles[1][i], map);
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
	
	@SuppressWarnings("rawtypes")
	private Object getMapValue(String key, Object obj) {
		if (key == null || obj == null) {
			return "";
		}
		if (obj instanceof Collection || obj instanceof Object[]) {
			List<Object> list = new ArrayList<Object>();
			if (obj instanceof Collection) {
				for (Object o : (Collection) obj) {
					list.add(getMapValue(key, o));
				}
			} else {
				for (Object o : (Object[]) obj) {
					list.add(getMapValue(key, o));
				}
			}
			list.remove(null);
			list.remove("");
			return StringUtils.join(list, ",");
		} else if (obj instanceof Map) {
			String[] keys = StringUtils.split(key, ".", 2);
			if (keys.length > 1) {
				return getMapValue(keys[1], ((Map) obj).get(keys[0]));
			} else {
				return ((Map) obj).get(key) == null ? "" : ((Map) obj).get(key).toString();
			}
		} else {
			return obj == null ? "" : obj.toString();
		}
	}
	
	/**
	 * 获取行动项的待办
	 * @param request
	 * @param response
	 */
	public void getActionItemToDoStatistics(HttpServletRequest request, HttpServletResponse response) {
		try {
			Map<String, Object> ruleMap = new HashMap<String, Object>();
			String rule = request.getParameter("rule");
			List<Object> ruleList;
			if (rule != null && rule.trim().length() > 0) {
				ruleList = gson.fromJson(rule, new TypeToken<List<List<Map<String, Object>>>>() {}.getType());
			} else {
				ruleList = Collections.emptyList();
			}
			ruleMap.put("rule", ruleList);
			
			Map<String, Object> toDoStatisticMap = new HashMap<String, Object>();
			toDoStatisticMap.put("toDoStatistics", actionItemDao.getToDoStatistics(UserContext.getUserId(), ruleMap));
			
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", toDoStatisticMap);
			ResponseHelper.output(response, result);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	public void setFileDao(FileDao fileDao) {
		this.fileDao = fileDao;
	}

	public void setActionItemDao(ActionItemDao actionItemDao) {
		this.actionItemDao = actionItemDao;
	}

	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}

	public void setPermissionSetDao(PermissionSetDao permissionSetDao) {
		this.permissionSetDao = permissionSetDao;
	}

	public void setQueryService(QueryService queryService) {
		this.queryService = queryService;
	}

	public void setActionItemRiskAnalysisDao(ActionItemRiskAnalysisDao actionItemRiskAnalysisDao) {
		this.actionItemRiskAnalysisDao = actionItemRiskAnalysisDao;
	}
}
