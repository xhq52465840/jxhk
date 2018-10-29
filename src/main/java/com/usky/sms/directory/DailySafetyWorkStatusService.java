package com.usky.sms.directory;

import java.util.ArrayList;
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

import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.permission.PermissionSets;
import com.usky.sms.safetyreview.AssessmentCommentDO;
import com.usky.sms.safetyreview.AssessmentCommentDao;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitDao;
import com.usky.sms.user.UserContext;

public class DailySafetyWorkStatusService extends AbstractService {

	@Autowired
	private DailySafetyWorkStatusDao dailySafetyWorkStatusDao;
	
	@Autowired
	private DirectoryDao directoryDao;

	@Autowired
	private UnitDao unitDao;
	
	@Autowired
	private AssessmentCommentDao assessmentCommentDao;
	
	/**
	 * 通过考核内容检索日常安全工作<br>
	 * 可根据安监机构、描述 ，状态：未发布/已发布进行检索
	 */
	public void getDailySafetyWorkStatus(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try{
			// 考核内容ID
			Integer assessmentCommentId = StringUtils.isEmpty(request.getParameter("assessmentCommentId")) ? null : Integer.parseInt(request.getParameter("assessmentCommentId"));
			
			if (null == assessmentCommentId) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "考核内容ID不能为空!");
			}
			// 安监机构ID
			Integer unitId = StringUtils.isEmpty(request.getParameter("unitId")) ? null : Integer.parseInt(request.getParameter("unitId"));
			List<Integer> unitIds = new ArrayList<Integer>();
			if (null == unitId) { // 如果没有传unitId则表示检索当前用户能查看的安检机构的日常安全工作
				List<UnitDO> units = unitDao.getUnits(PermissionSets.VIEW_UNIT.getName());
				for (UnitDO unit : units) {
					unitIds.add(unit.getId());
				}
			} else {
				unitIds.add(unitId);
			}
			// 描述
			String description = StringUtils.isBlank(request.getParameter("description")) ? null : request.getParameter("description");
			// 状态
			String status = StringUtils.isBlank(request.getParameter("status")) ? null : request.getParameter("status");
			// 年份
			Integer year = StringUtils.isBlank(request.getParameter("year")) ? null : Integer.parseInt(request.getParameter("year"));
			// 状态
			Integer season = StringUtils.isBlank(request.getParameter("season")) ? null : Integer.parseInt(request.getParameter("season"));
			List<DailySafetyWorkStatusDO> list = dailySafetyWorkStatusDao.getByMultiCon(assessmentCommentId, unitIds, description, status, year, season);
			
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data",  PageHelper.getPagedResult(dailySafetyWorkStatusDao.convert(list), request));
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
	 * 修改安全评审完成状态
	 */
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void modifyDailySafetyWorkStatus(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		try {
			String paramType = request.getParameter("paramType");

			DailySafetyWorkStatusDO dailySafetyWorkStatus = null;
			// 安监机构
			Integer unitId = StringUtils.isEmpty(request.getParameter("unitId")) ? null : Integer.parseInt(request.getParameter("unitId"));
			UnitDO unit = null;
			if (null == unitId || null == (unit = unitDao.internalGetById(unitId))) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "安监机构[ID:" + unitId + "]不存在！");
			}
			
			String description = request.getParameter("description");
			Integer year = null == request.getParameter("year") ? null : Integer.parseInt((String) request.getParameter("year"));
			Integer season = null == request.getParameter("season") ? null : Integer.parseInt((String) request.getParameter("season"));
			if ("add".equals(paramType)) {
				// 获取安全评审的目录
				List<DirectoryDO> directorys = directoryDao.getDirectorysByType(EnumDirectoryType.SAFETYREVIEW.getCode());
				if (null == directorys) {
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "安全评审条目不存在,请联系管理员创建该条目！");
				}
				
				Integer assessmentCommentId = StringUtils.isEmpty(request.getParameter("assessmentCommentId")) ? null : Integer.parseInt(request.getParameter("assessmentCommentId"));
				AssessmentCommentDO assessmentComment = null;
				if(null == assessmentCommentId || null == (assessmentComment = assessmentCommentDao.internalGetById(assessmentCommentId))){
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "该考核内容不存在!");
				}
				
				dailySafetyWorkStatus = new DailySafetyWorkStatusDO();
				// 获取考核内容
				dailySafetyWorkStatus.setAssessmentComment(assessmentComment);
				// 描述
				dailySafetyWorkStatus.setDescription(description);
				// 年
				dailySafetyWorkStatus.setYear(year);
				// 季度
				dailySafetyWorkStatus.setSeason(season);
				// 创建者
				dailySafetyWorkStatus.setCreator(UserContext.getUser());
				// 所属目录
				dailySafetyWorkStatus.setDirectory(directorys.get(0));
				// 安监机构
				dailySafetyWorkStatus.setUnit(unit);
				
				dailySafetyWorkStatusDao.internalSave(dailySafetyWorkStatus);
			} else if("update".equals(paramType)){
				// 修改安全评审完成状态ID
				Integer dailySafetyWorkStatusId = StringUtils.isEmpty(request.getParameter("dailySafetyWorkStatusId")) ? null : Integer.parseInt(request.getParameter("dailySafetyWorkStatusId"));
				if(null == dailySafetyWorkStatusId || null == (dailySafetyWorkStatus = dailySafetyWorkStatusDao.internalGetById(dailySafetyWorkStatusId))){
					throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "该修改安全评审完成状态不存在");
				}
				dailySafetyWorkStatus.setUnit(unit);
				dailySafetyWorkStatus.setDescription(description);
				// 年
				dailySafetyWorkStatus.setYear(year);
				// 季度
				dailySafetyWorkStatus.setSeason(season);
				dailySafetyWorkStatusDao.update(dailySafetyWorkStatus);
			}

			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("dailySafetyWorkStatusId", dailySafetyWorkStatus.getId());

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
	 * 全文检索日常安全工作情况信息
	 * @param request
	 * @param response
	 */
	public void fuzzySearchDailySafetyWorkStatusInfos(HttpServletRequest request, HttpServletResponse response) {
		try {
			// 关键字
			String searchKey = request.getParameter("searchKey");
			// 显示的页数
			int showPage = request.getParameter("showPage") == null ? 1 : Integer.parseInt(request.getParameter("showPage") );
			// 每页显示的数量
			int row = request.getParameter("row") == null ? 10 : Integer.parseInt(request.getParameter("row"));
			// 查询结果
			Map<String,Object> map = dailySafetyWorkStatusDao.fuzzySearch(searchKey, showPage, row);
			
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("totalCount", map.get("totalCount"));
			result.put("data", map.get("dataList"));

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
	 * @param dailySafetyWorkStatusDao the dailySafetyWorkStatusDao to set
	 */
	public void setDailySafetyWorkStatusDao(
			DailySafetyWorkStatusDao dailySafetyWorkStatusDao) {
		this.dailySafetyWorkStatusDao = dailySafetyWorkStatusDao;
	}

	/**
	 * @param directoryDao the directoryDao to set
	 */
	public void setDirectoryDao(DirectoryDao directoryDao) {
		this.directoryDao = directoryDao;
	}

	/**
	 * @param unitDao
	 *            the unitDao to set
	 */
	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}
	/**
	 * @param assessmentCommentDao the assessmentCommentDao to set
	 */
	public void setAssessmentCommentDao(AssessmentCommentDao assessmentCommentDao) {
		this.assessmentCommentDao = assessmentCommentDao;
	}

}
