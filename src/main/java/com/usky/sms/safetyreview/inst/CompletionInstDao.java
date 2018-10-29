package com.usky.sms.safetyreview.inst;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.common.DateHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.directory.DailySafetyWorkStatusDao;
import com.usky.sms.safetyreview.AssessmentCommentDO;
import com.usky.sms.safetyreview.EnumAssessmentSourceType;
import com.usky.sms.service.QueryService;
import com.usky.sms.tem.ActionItemDao;
import com.usky.sms.user.UserContext;
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;

public class CompletionInstDao extends BaseDao<CompletionInstDO> {
	
	private static final Logger log = Logger.getLogger(CompletionInstDO.class);
	
	@Autowired
	private DailySafetyWorkStatusDao dailySafetyWorkStatusDao;
	
	@Autowired
	private ScoreStandardInstDao scoreStandardInstDao;
	
	@Autowired
	private AssessmentCommentInstDao assessmentCommentInstDao;
	
	@Autowired
	private MethanolInstDao methanolInstDao;
	
	@Autowired
	private QueryService queryService;
	
	@Autowired
	private CompletionInstOperationDao completionInstOperationDao;
	
	@Autowired
	private UserDao userDao;
	
	@Autowired
	private ActionItemDao actionItemDao;
	
	protected CompletionInstDao() {
		super(CompletionInstDO.class);
	}
	
	@Override
	protected void beforeUpdate(CompletionInstDO obj) {
//		CompletionInstDO completionInst = this.internalGetById(obj.getId());
//		if (null != completionInst) {
//			// 如果评审人不为空且状态为完成表示该考核内容已被评审
//			if (null != completionInst.getReviewer() && EnumCompletionInstStatus.COMPLETE.toString().equals(completionInst.getStatus())) {
//				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "此记录已被评审人:" + completionInst.getReviewer().getDisplayName() + "打过分了!");
//			}
//			if (EnumCompletionInstStatus.COMPLETE.toString().equals(obj.getStatus())) {
//				obj.setReviewer(UserContext.getUser());
//			}
//		}
	}

	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
//		CompletionInstDO completionInst = this.internalGetById(id);
//		if (null != completionInst) {
//			// 如果评审人不为空表示该考核内容已被评审
//			if (null != completionInst.getReviewer() && EnumCompletionInstStatus.COMPLETE.toString().equals(completionInst.getStatus())) {
//				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "此记录已被评审人:" + completionInst.getReviewer().getDisplayName() + "打过分了!");
//			}
//			if (EnumCompletionInstStatus.COMPLETE.toString().equals(map.get("status"))) {
//				map.put("reviewer", UserContext.getUserId());
//			}
//		}
	}

	@Override
	protected void afterUpdate(CompletionInstDO obj, CompletionInstDO dbObj) {
		this.addActivityLoggingForUpdateCompletionInst(obj, dbObj);
	}
	
	private void addActivityLoggingForUpdateCompletionInst(CompletionInstDO obj, CompletionInstDO dbObj){
		List<String> details = new ArrayList<String>();
		if (EnumCompletionInstStatus.COMPLETE.toString().equals(obj.getStatus()) && !EnumCompletionInstStatus.COMPLETE.toString().equals(dbObj.getStatus())
				&& !obj.getScore().equals(dbObj.getScore()) && !EnumAssessmentSourceType.O.toString().equals(obj.getAssessmentCommentInst().getType())){
			details.add("修改了分数:" + dbObj.getScore() + " --> " + obj.getScore());
		}
		if (!details.isEmpty()) {
			Map<String, Object> dataMap = new HashMap<String, Object>();
			dataMap.put("details", details);
			CompletionInstOperationDO operation = new CompletionInstOperationDO();
			operation.setOperation("更新了完成情况");
			operation.setCompletionInst(obj);
			UserDO user = UserContext.getUser();
			if (user == null) {
				user = userDao.getByUsername("ANONYMITY");
			}
			operation.setUser(user);
			operation.setData(gson.toJson(dataMap));
			completionInstOperationDao.internalSave(operation);
		}
	}

	/**
	 * 通过考核内容实例和评审单实例得出完成情况的实例
	 * @param assessmentCommentInst
	 * @param methanolInst
	 * @return
	 * @throws Exception 
	 */
	public CompletionInstDO evalCompletionByAssessmentCommentInst(AssessmentCommentInstDO assessmentCommentInst, AssessmentCommentDO assessmentComment, MethanolInstDO methanolInst, UserDO user) throws Exception{
		if(null == assessmentCommentInst){
			return null;
		}
		CompletionInstDO completionInst = new CompletionInstDO();
		// 考核内容
		completionInst.setAssessmentCommentInst(assessmentCommentInst);
		// 完成情况
		String complete = "";
		// 得分
		Double score = 0.0;
		// 自动算分
		// 评分标准实例
		ScoreStandardInstDO scoreStandardInst = scoreStandardInstDao.getByAssessmentCommentInst(assessmentCommentInst);
		if (!EnumAssessmentSourceType.O.toString().equals(assessmentCommentInst.getType())) {
			Map<String, Object> completionMap = null;
			if (EnumAssessmentSourceType.A.toString().equals(assessmentCommentInst.getType())) { // 安全信息时，根据过滤器检索出activityId的数量
				// 根据过滤器查询安全信息的条数
				String filterRule = null;
				if (null != assessmentComment.getFilter()) {
					filterRule = assessmentComment.getFilter().getFilterRule();
				}
				completionMap = this.evalActivityCompletion(assessmentCommentInst, scoreStandardInst, user, filterRule, methanolInst);
			} else if (EnumAssessmentSourceType.R.toString().equals(assessmentCommentInst.getType())) {
				// 检索日常安全工作情况的条数(日常安全工作情况是与考核内容模板关联)
				completionMap = this.evalDailySatetyWorkStatusCompletion(assessmentComment.getId(), methanolInst, scoreStandardInst);
			} else if (EnumAssessmentSourceType.ACTION_ITEM.toString().equals(assessmentCommentInst.getType())) {
				// 检索行动项的条数
				completionMap = this.evalActionItemCompletion(methanolInst, scoreStandardInst);
			} 
			complete = (String) completionMap.get("complete");
			score = (Double) completionMap.get("score");
		}
		// 完成情况
		completionInst.setComplete(complete);
		// 得分
		completionInst.setScore(score);
		return completionInst;
	}

	public CompletionInstDO evalCompletion(CompletionInstDO completion, ScoreStandardInstDO scoreStandardInst, MethanolInstDO methanolInst, UserDO user) {
		AssessmentCommentInstDO assessmentCommentInst = completion.getAssessmentCommentInst();
		if (!EnumAssessmentSourceType.O.toString().equals(assessmentCommentInst.getType())) {
			Map<String, Object> map = null;
			if (EnumAssessmentSourceType.A.toString().equals(assessmentCommentInst.getType())) { // 安全信息时
				map = this.evalActivityCompletion(assessmentCommentInst, scoreStandardInst, user, assessmentCommentInst.getFilterRule(), methanolInst);
			} else if (EnumAssessmentSourceType.R.toString().equals(assessmentCommentInst.getType())) { // 日常安全工作情况时
				map = this.evalDailySatetyWorkStatusCompletion(assessmentCommentInst.getAssessmentCommentTemplateId(), methanolInst, scoreStandardInst);
			} else if (EnumAssessmentSourceType.ACTION_ITEM.toString().equals(assessmentCommentInst.getType())) { // 行动项时
				map = this.evalActionItemCompletion(methanolInst, scoreStandardInst);
			}
			completion.setComplete((String) map.get("complete"));
			completion.setScore((Double) map.get("score"));
		}
		return completion;
	}
	
	/**
	 * 安全信息的完成情况
	 * @param assessmentCommentInst
	 * @return
	 */
	public Map<String, Object> evalActivityCompletion(AssessmentCommentInstDO assessmentCommentInst, ScoreStandardInstDO scoreStandardInst, UserDO user, String filterRule, MethanolInstDO methanolInst) {
		// 自动算分
		Integer num = 0;
		// 根据过滤器查询安全信息的条数
		Map<String, Object> filterMap = null;
		if (null == filterRule) {
			filterMap = new HashMap<String, Object>();
		} else {
			filterMap = gson.fromJson(filterRule, new TypeToken<Map<String, Object>>() {}.getType());
		}
		// 获取静态过滤条件
		@SuppressWarnings("unchecked")
		List<Map<String, Object>> staticfilters = (List<Map<String, Object>>) filterMap.get("staticfilters");
		if (null == staticfilters) {
			staticfilters = new ArrayList<Map<String,Object>>();
		}
		try {
			// 添加安监机构的条件
			Map<String, Object> unitMap = new HashMap<String, Object>();
			unitMap.put("propid", "unit");
			unitMap.put("propvalue", gson.fromJson("[{\"id\":" + methanolInst.getUnit().getId() + "}]", List.class));
			staticfilters.add(unitMap);
			// 添加创建时间的条件
			Map<String, Object> createdMap = new HashMap<String, Object>();
			int year = methanolInst.getYear();
			int season = methanolInst.getSeason();
			createdMap.put("propid", "created");
			String created = "[ " + DateHelper.formatStandardDate(DateHelper.getSeasonStartTime(year, season)) + "Z TO " + DateHelper.formatStandardDate(DateHelper.getSeasonStartTime(season < 4 ? year : year + 1, season < 4 ? season + 1 : 1)) + "Z }";
			createdMap.put("propvalue", gson.fromJson("[{\"id\":\"" + created + "\"}]", List.class));
			staticfilters.add(createdMap);
			filterMap.put("staticfilters", staticfilters);
			num = this.getActivityIdContByFilterRule(gson.toJson(filterMap), user);
		} catch (Exception e) {
			e.printStackTrace();
			log.error(e.getMessage());
		}
		// 完成情况
		String complete = "关联了" + num + "条安全信息";
		// 得分
		Double score = scoreStandardInstDao.eval(scoreStandardInst, num);
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("complete", complete);
		map.put("score", score);
		return map;
	}
	
	/**
	 * 日常安全工作情况的完成情况
	 * @param assessmentCommentId
	 * @param methanolInst
	 * @param scoreStandardInst
	 * @return
	 */
	public Map<String, Object> evalDailySatetyWorkStatusCompletion(Integer assessmentCommentId, MethanolInstDO methanolInst, ScoreStandardInstDO scoreStandardInst) {
		Integer year = methanolInst.getYear();
		Integer season = methanolInst.getSeason();
		// 检索日常安全工作情况的条数(日常安全工作情况是与考核内容模板关联)
		int num = dailySafetyWorkStatusDao.getDailySafetyWorkStatusCount(assessmentCommentId, methanolInst.getUnit().getId(), year, season);
		// 完成情况
		String complete = "关联了" + num + "条日常安全工作";
		// 算分
		Double score = scoreStandardInstDao.eval(scoreStandardInst, num);
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("complete", complete);
		map.put("score", score);
		return map;
	}
	
	/**
	 * 行动项的完成情况
	 * @param assessmentCommentId
	 * @param methanolInst
	 * @param scoreStandardInst
	 * @return
	 */
	public Map<String, Object> evalActionItemCompletion(MethanolInstDO methanolInst, ScoreStandardInstDO scoreStandardInst) {
		Integer year = methanolInst.getYear();
		Integer season = methanolInst.getSeason();
		String complete = "";
		try {
			// 行动项的条数
			// 完成统计
			String[] completedStatus = new String[]{ActionItemDao.ACTION_ITEM_STATUS_COMPLETE};
			long completedNum = actionItemDao.getCountBySearch(methanolInst.getUnit().getId(), DateHelper.getSeasonStartTime(year, season), DateHelper.getSeasonStartTime(season < 4 ? year : year + 1, season < 4 ? season + 1 : 1), completedStatus);
			
			// 未完成统计
			String[] unCompletedStatus = new String[]{ActionItemDao.ACTION_ITEM_STATUS_DRAFT, ActionItemDao.ACTION_ITEM_STATUS_EXECUTE_WAITING, ActionItemDao.ACTION_ITEM_STATUS_COMFIRM_WAITING, ActionItemDao.ACTION_ITEM_STATUS_AUDIT_WAITING, ActionItemDao.ACTION_ITEM_STATUS_CONFIRM_REJECTED, ActionItemDao.ACTION_ITEM_STATUS_AUDIT_REJECTED};
			long unCompletedNum = actionItemDao.getCountBySearch(methanolInst.getUnit().getId(), DateHelper.getSeasonStartTime(year, season), DateHelper.getSeasonStartTime(season < 4 ? year : year + 1, season < 4 ? season + 1 : 1), unCompletedStatus);
			long total = completedNum + unCompletedNum;
			
			BigDecimal rate = total == 0 ? BigDecimal.ZERO :  BigDecimal.valueOf(completedNum * 100).divide(BigDecimal.valueOf(total), 1, BigDecimal.ROUND_HALF_UP);
			
			// 完成情况
			complete = "完成" + completedNum + "条行动项, 未完成" + unCompletedNum + "条行动项, 完成率为" + rate + "%";
		} catch (Exception e) {
			e.printStackTrace();
			log.error(e.getMessage());
		}
		// 算分
//		Double score = scoreStandardInstDao.eval(scoreStandardInst, num);
		Map<String, Object> map = new HashMap<String, Object>();
		map.put("complete", complete);
		map.put("score", 0.0);
		return map;
	}
	
	public CompletionInstDO getByCommentInstId(Integer id){
		@SuppressWarnings("unchecked")
		List<CompletionInstDO> list = (List<CompletionInstDO>) this.query("from CompletionInstDO t where t.deleted = false and t.assessmentCommentInst.id = ?", id);
		if (list.isEmpty()) {
			return null;
		} else {
			return list.get(0);
		}
	}
	
	public List<CompletionInstDO> getByMethanonInstId(Integer id){
		@SuppressWarnings("unchecked")
		List<CompletionInstDO> list = (List<CompletionInstDO>) this.query("from CompletionInstDO t where t.deleted = false and t.assessmentCommentInst.deleted = false and t.assessmentCommentInst.assessmentProjectInst.deleted = false and t.assessmentCommentInst.assessmentProjectInst.methanolInst.id = ?", id);
		return list;
	}
	
	/**
	 * 通过过滤器的filterRule查询安全信息的条数
	 * 
	 * @param filterRule
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public int getActivityIdContByFilterRule(String filterRule, UserDO user) throws Exception{
		Map<String, Object> map = gson.fromJson(filterRule, new TypeToken<Map<String, Object>>() {}.getType());
		// 获取静态过滤条件和动态过滤条件,并合并到一起
		List<Map<String, Object>> staticfilters = (List<Map<String, Object>>) map.get("staticfilters");
		List<Map<String, Object>> dynamicfilters = (List<Map<String, Object>>) map.get("dynamicfilters");
		List<Map<String, Object>> allfilters = new ArrayList<Map<String,Object>>();
		if (null != staticfilters) {
			allfilters.addAll(staticfilters);
		}
		if (null != dynamicfilters) {
			allfilters.addAll(dynamicfilters);
		}
		List<Map<String, Object>> queryList = new ArrayList<Map<String, Object>>();
		for (Map<String, Object> item : allfilters) {
			List<Map<String, String>> propvalue = (List<Map<String, String>>) item.get("propvalue");
			if (null != propvalue && !propvalue.isEmpty()) {
				Map<String, Object> queryItem = new HashMap<String, Object>();
				queryItem.put("id", item.get("propid"));
				queryItem.put("value", propvalue);
				queryList.add(queryItem);
			}
		}
		// 查询条件
		String query = gson.toJson(queryList);
		String search = null;
		
		Map<String, Object> result = queryService.getActivityIdsByParams(
				user.getId().toString(), query, null, "0", (Integer.MAX_VALUE - 1) + "",
				null, search, false);
		if (!result.containsKey("ids")) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "查询失败！过滤器规则[" + filterRule + "]");
		}
		List<String> ids = (List<String>) result.get("ids");
		return ids.size();
	}
	
	public void setDailySafetyWorkStatusDao(DailySafetyWorkStatusDao dailySafetyWorkStatusDao) {
		this.dailySafetyWorkStatusDao = dailySafetyWorkStatusDao;
	}

	public void setScoreStandardInstDao(ScoreStandardInstDao scoreStandardInstDao) {
		this.scoreStandardInstDao = scoreStandardInstDao;
	}

	public void setAssessmentCommentInstDao(AssessmentCommentInstDao assessmentCommentInstDao) {
		this.assessmentCommentInstDao = assessmentCommentInstDao;
	}

	public void setMethanolInstDao(MethanolInstDao methanolInstDao) {
		this.methanolInstDao = methanolInstDao;
	}

	public void setQueryService(QueryService queryService) {
		this.queryService = queryService;
	}

	public void setCompletionInstOperationDao(CompletionInstOperationDao completionInstOperationDao) {
		this.completionInstOperationDao = completionInstOperationDao;
	}

	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}

	public void setActionItemDao(ActionItemDao actionItemDao) {
		this.actionItemDao = actionItemDao;
	}

}
