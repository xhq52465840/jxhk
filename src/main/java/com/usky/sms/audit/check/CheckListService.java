package com.usky.sms.audit.check;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.audit.AuditConstant;
import com.usky.sms.audit.base.AuditReasonDO;
import com.usky.sms.audit.base.AuditReasonDao;
import com.usky.sms.audit.base.ProfessionUserDao;
import com.usky.sms.audit.improve.ImproveDO;
import com.usky.sms.audit.improve.ImproveDao;
import com.usky.sms.audit.improvenotice.EnumImproveNoticeIssueStatus;
import com.usky.sms.audit.improvenotice.EnumImproveNoticeIssueTraceStatus;
import com.usky.sms.audit.plan.EnumPlanType;
import com.usky.sms.common.DateHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.dictionary.DictionaryDao;
import com.usky.sms.file.EnumFileType;
import com.usky.sms.file.FileDO;
import com.usky.sms.file.FileDao;
import com.usky.sms.utils.SpringBeanUtils;

public class CheckListService extends AbstractService {
	
	@Autowired
	private CheckListDao checkListDao;
	
	@Autowired
	private CheckDao checkDao;
	
	@Autowired
	private ImproveDao improveDao;
	
	@Autowired
	private ProfessionUserDao professionUserDao;
	
	@Autowired
	private ImproveItemUserDao improveItemUserDao;
	
	@Autowired
	private FileDao fileDao;
	
	@Autowired
	private DictionaryDao dictionaryDao;
	
	/**
	 * 获取整改反馈记录
	 * @param request
	 * @param response
	 */
	public void getImproveRecordById(HttpServletRequest request, HttpServletResponse response) {
		try {
			String id = request.getParameter("id");
			CheckListDO checkList = checkListDao.internalGetById(Integer.parseInt(id));
			Map<String, Object> checkListMap = checkListDao.convert(checkList, Arrays.asList(new String[]{"id", "itemPoint", "auditRecord", "improveDate", "improveRemark", "improveLastDate", "improveItemStatus", "improveReason", "improveMeasure", "improveResponsiblePerson", "auditOpinion", "verification"}), false);
			if (checkList.getAuditReasonId() != null) {
				AuditReasonDao auditReasonDao = (AuditReasonDao) SpringBeanUtils.getBean("auditReasonDao");
				String[] s = checkList.getAuditReasonId().split(",");
				List<AuditReasonDO> auditReasons = auditReasonDao.internalGetByIds(s);
				List<Map<String, Object>> la = new ArrayList<Map<String,Object>>();
				for (AuditReasonDO a : auditReasons) {
					Map<String, Object> m = new HashMap<String, Object>();
					m.put("id", a.getId());
					m.put("name", a.getName());
					m.put("description", a.getDescription());
					la.add(m);
				}
				checkListMap.put("auditReason", la);
			}
			checkListMap.put("improve", improveDao.convert(checkList.getImprove()));
			// 签批件
			List<FileDO> files = fileDao.getFilesBySource(EnumFileType.IMPROVE_ITEM.getCode(), Integer.parseInt(id));
			checkListMap.put("files", fileDao.convert(files));
			
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", checkListMap);
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
	 * 整改转发
	 * @param request
	 * @param response
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void transmitImproveRecord(HttpServletRequest request, HttpServletResponse response) {
		try {
			String idsStr = request.getParameter("ids");
			if (!StringUtils.isBlank(idsStr)) {
				String[] ids = gson.fromJson(idsStr, String[].class);
				List<CheckListDO> checkLists = checkListDao.internalGetByIds(ids);
				
				checkListDao.transmitImproveRecord(checkLists);
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", null);
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
	 * 提交整改转发<br>
	 * 原因、措施、整改责任人必填，签批件必须上传，提交后将状态改为"措施制定"将不是由提交人上传的附件删除<br>
	 * 给整改单的当前处理人发送通知
	 * @param request
	 * @param response
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void commitImproveRecord(HttpServletRequest request, HttpServletResponse response) {
		try {
			String idsStr = request.getParameter("ids");
			
			checkListDao.commitImproveRecord(idsStr);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", null);
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
	 * 更新整改记录的原因、措施、整改责任人<br>
	 * 
	 * @param request
	 * @param response
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void updateImproveRecordReasonAndMeasure(HttpServletRequest request, HttpServletResponse response) {
		try {
			Integer id = Integer.parseInt(request.getParameter("id"));
			String improveReason = request.getParameter("improveReason"); // 整改说明原因
			String improveMeasure = request.getParameter("improveMeasure"); // 整改措施
			String improveResponsiblePerson = request.getParameter("improveResponsiblePerson"); // 整改责任人
			String auditReason = request.getParameter("auditReason");// 原因类型
			// 原因、措施必填、整改责任人必填
			if (StringUtils.isBlank(improveReason) || StringUtils.isBlank(improveMeasure) || StringUtils.isBlank(improveResponsiblePerson)) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, " 整改说明原因、整改措施、整改责任人都不能为空！");
			}
			
			Map<String, Object> dataMap = new HashMap<String, Object>();
			dataMap.put("improveReason", improveReason);
			dataMap.put("improveMeasure", improveMeasure);
			dataMap.put("improveResponsiblePerson", improveResponsiblePerson);
			dataMap.put("auditReasonId", auditReason);
			Integer improveItemStatus = checkListDao.getImproveItemStatusGetById(id);
			// 不是转发处理时将状态设置成"措施制定"
			if (null == improveItemStatus || EnumImproveItemStatus.整改转发.getCode() != improveItemStatus) {
				dataMap.put("improveItemStatus", ((Integer) EnumImproveItemStatus.措施制定.getCode()).doubleValue());
			}
			checkListDao.update(id, dataMap);
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
	 * 更新整改记录的状态,并且必填审核意见<br>
	 * 
	 * @param request
	 * @param response
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void updateImproveRecordStatus(HttpServletRequest request, HttpServletResponse response) {
		try {
			Integer id = Integer.parseInt(request.getParameter("id"));
			String operate = request.getParameter("operate");
			// 审核意见必填
			String auditOpinion = request.getParameter("auditOpinion");
			if (StringUtils.isBlank(auditOpinion)) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, " 审核意见不能为空！");
			}
			Map<String, Object> dataMap = new HashMap<String, Object>();
			dataMap.put("auditOpinion", auditOpinion);
			Double improveItemStatus = null;
			if ("pass".equals(operate)) { // 审核通过
				improveItemStatus = ((Integer) EnumImproveItemStatus.预案通过.getCode()).doubleValue();
			} else if ("reject".equals(operate)) { // 审核拒绝
				improveItemStatus = ((Integer) EnumImproveItemStatus.预案拒绝.getCode()).doubleValue();
			} else if ("uncompleted".equals(operate)) { // 暂时无法完成
				improveItemStatus = ((Integer) EnumImproveItemStatus.暂时无法完成.getCode()).doubleValue();
			}
			dataMap.put("improveItemStatus", improveItemStatus);
			checkListDao.update(id, dataMap);
			
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
	 * 更新整改记录的完成情况<br>
	 * 此服务废弃
	 * @param request
	 * @param response
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void updateImproveRecordCompletion(HttpServletRequest request, HttpServletResponse response) {
		try {
			String id = request.getParameter("id");
			String obj = request.getParameter("obj");
			Map<String, Object> objMap = gson.fromJson(obj, new TypeToken<Map<String, Object>>() {}.getType());
			// 必填校验
			if (null == objMap.get("improveRemark")) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, " 完成情况不能为空！");
			}
//			objMap.put("improveItemStatus", ((Integer) EnumImproveItemStatus.完成情况.getCode()).doubleValue());
			checkListDao.update(Integer.parseInt(id), objMap);
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
	 * 提交整改记录的完成情况<br>
	 * 
	 * @param request
	 * @param response
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void commitImproveRecordCompletion(HttpServletRequest request, HttpServletResponse response) {
		try {
			Integer id = Integer.parseInt(request.getParameter("id"));
			String obj = request.getParameter("obj");
			Map<String, Object> objMap = gson.fromJson(obj, new TypeToken<Map<String, Object>>() {}.getType());
			// 必填校验
			if (null == objMap.get("improveRemark")) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, " 完成情况不能为空！");
			}
			objMap.put("improveItemStatus", ((Integer) EnumImproveItemStatus.整改完成.getCode()).doubleValue());
			//把验证设置为未验证
			objMap.put("confirmResult", EnumConfirmResult.COMFIRM_UN_PASSED.toString());
			// 提交完成情况时将完成日期设置成当前时间
			objMap.put("improveDate", DateHelper.formatIsoDate(new Date()));
			// 生成跟踪表名称和编号
			ImproveDO improve = improveDao.getByCheckListId(id);
			if (null != improve.getImproveNo()) {
				improve.setTraceNo(improve.getImproveNo().replace(AuditConstant.RECTIFICATION_CODE, AuditConstant.TRACE_CODE));
			}
			if (null != improve.getImproveName()) {
				improve.setTraceName(improve.getImproveName().replace("整改反馈单", "跟踪表"));
			}
			// 将生成跟踪表的时间设置为当前时间
			improve.setGenerateTraceDate(new Date());
			improveDao.update(improve);
			checkListDao.update(id, objMap);
			// 系统性审计给一级审计经理发消息和短信
			if (EnumPlanType.SYS.toString().equals(improve.getTask().getPlanType())) {
//				checkListDao.sendMessageToYiJiShenJiJingLi(improve, id);
			}
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
	 * 更新整改通知单问题列表<br>
	 * 
	 * @param request
	 * @param response
	 */
	// 此方法暂时废弃
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void updateImproveNoticeCheckList(HttpServletRequest request, HttpServletResponse response) {
		try {
			Integer id = Integer.parseInt(request.getParameter("id"));
			String obj = request.getParameter("obj");
			Map<String, Object> objMap = gson.fromJson(obj, new TypeToken<Map<String, Object>>(){}.getType());
			String operate = request.getParameter("operate");
			Map<String, Object> dataMap = new HashMap<String, Object>();
			if ("allot".equals(operate)) { // 分配验证人
				dataMap.put("confirmMan", (String) objMap.get("confirmMan"));
			} else if ("reject".equals(operate)) { // 审核拒绝
				dataMap.put("improveItemStatus", ((Integer) EnumImproveItemStatus.预案拒绝.getCode()).doubleValue());
			} else if ("uncompleted".equals(operate)) { // 暂时无法完成
				dataMap.put("improveItemStatus", ((Integer) EnumImproveItemStatus.暂时无法完成.getCode()).intValue());
			}
			checkListDao.update(id, dataMap);
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
	 * 更新并复制检查要点<br>
	 * 
	 * @param request
	 * @param response
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void updateAndCloneCheckList(HttpServletRequest request, HttpServletResponse response) {
		try {
			String id = request.getParameter("dataobjectid");
			String obj = request.getParameter("obj");
			Map<String, Object> map = gson.fromJson(obj, new TypeToken<Map<String, Object>>() {}.getType());
			Integer addedId = null;
			if (null != map.get("clone") && (boolean) map.get("clone")) {
				addedId = checkListDao.updateAndCloneCheckList(Integer.parseInt(id), map);
			}
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", addedId);
			ResponseHelper.output(response, result);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void sendMessageToYanZhengRen(HttpServletRequest request, HttpServletResponse response) {
		try {
			String improveId = request.getParameter("improveId");
			String itemPoints_ = request.getParameter("itemPoints");
			String userIds_ = request.getParameter("userIds");
			List<String> itemPoints = gson.fromJson(itemPoints_, new TypeToken<List<String>>(){}.getType());
			List<Integer> userIds = gson.fromJson(userIds_, new TypeToken<List<Integer>>(){}.getType());
//			checkListDao.sendMessageToYanZhengRen(improveId, itemPoints, userIds);
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
	
	public void getEnumImproveItemStatus(HttpServletRequest request, HttpServletResponse response) {
		try {
			String type = request.getParameter("type");
			List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
			if ("audit".equals(type)) {
				for (EnumImproveItemStatus item : EnumImproveItemStatus.values()) {
					Map<String, Object> itemMap = new HashMap<String, Object>();
					itemMap.put("id", item.getCode());
					itemMap.put("name", item.name());
					list.add(itemMap);
				}
			} else if ("check".equals(type)) {
				for (EnumImproveNoticeIssueStatus item : EnumImproveNoticeIssueStatus.values()) {
					Map<String, Object> itemMap = new HashMap<String, Object>();
					itemMap.put("id", item.name());
					itemMap.put("name", item.getDescription());
					list.add(itemMap);
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
	
	public void getEnumTraceItemStatus(HttpServletRequest request, HttpServletResponse response) {
		try {
			String type = request.getParameter("type");
			List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
			if ("audit".equals(type)) {
				for (EnumConfirmResult item : EnumConfirmResult.values()) {
					Map<String, Object> itemMap = new HashMap<String, Object>();
					itemMap.put("id", item.name());
					itemMap.put("name", item.getDescription());
					list.add(itemMap);
				}
			} else if ("check".equals(type)) {
				for (EnumImproveNoticeIssueTraceStatus item : EnumImproveNoticeIssueTraceStatus.values()) {
					Map<String, Object> itemMap = new HashMap<String, Object>();
					itemMap.put("id", item.name());
					itemMap.put("name", item.getDescription());
					list.add(itemMap);
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
	
	
	
	public void setCheckListDao(CheckListDao checkListDao) {
		this.checkListDao = checkListDao;
	}

	public void setCheckDao(CheckDao checkDao) {
		this.checkDao = checkDao;
	}

	public void setImproveDao(ImproveDao improveDao) {
		this.improveDao = improveDao;
	}

	public void setProfessionUserDao(ProfessionUserDao professionUserDao) {
		this.professionUserDao = professionUserDao;
	}

	public void setImproveItemUserDao(ImproveItemUserDao improveItemUserDao) {
		this.improveItemUserDao = improveItemUserDao;
	}

	public void setFileDao(FileDao fileDao) {
		this.fileDao = fileDao;
	}

	public void setDictionaryDao(DictionaryDao dictionaryDao) {
		this.dictionaryDao = dictionaryDao;
	}

}
