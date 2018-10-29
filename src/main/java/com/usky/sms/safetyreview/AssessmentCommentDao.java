package com.usky.sms.safetyreview;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.core.BaseDao;
import com.usky.sms.filtermanager.FiltermanagerDO;
import com.usky.sms.filtermanager.FiltermanagerDao;
import com.usky.sms.user.UserContext;

public class AssessmentCommentDao extends BaseDao<AssessmentCommentDO> {

	@Autowired
	private ScoreStandardDao scoreStandardDao;
	
	@Autowired
	private ScoreStandardDetailDao scoreStandardDetailDao;

	@Autowired
	private FiltermanagerDao filtermanagerDao;

	protected AssessmentCommentDao() {
		super(AssessmentCommentDO.class);
	}

	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields,
			boolean multiple, boolean showExtendFields) {
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
		if (showExtendFields) {
			AssessmentCommentDO assessmentComment = (AssessmentCommentDO)obj;
			Integer id = assessmentComment.getId();
			String description = assessmentComment.getDescription();
			String type = assessmentComment.getType();
			ScoreStandardDO scoreStandard = scoreStandardDao.getByAssessmentComment(assessmentComment);
			Map<String, Object> scoreStandardMap = scoreStandardDao.convert(scoreStandard);
			if(null != scoreStandard){
				List<ScoreStandardDetailDO> details = new ArrayList<ScoreStandardDetailDO>(scoreStandard.getDetails());
				
				// 按左区间的升序排序
				Collections.sort(details);
				scoreStandardMap.put("details", scoreStandardDetailDao.convert(details));
			}
			
			// 过滤器
			FiltermanagerDO filterManager = assessmentComment.getFilter();
			Map<String, Object> filterMap = new HashMap<String, Object>();
			if (null != filterManager) {
				filterMap.put("id", filterManager.getId());
				filterMap.put("name", filterManager.getName());
				filterMap.put("filterRule", filterManager.getFilterRule());
			}
			
			map.put("id", id);
			map.put("description", description);
			map.put("type", type);
			map.put("standardSummary", assessmentComment.getStandardSummary());
			map.put("scoreStandard", scoreStandardMap);
			map.put("filter", filterMap);
		}
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		// 当前用户Id
		Integer userId = UserContext.getUserId();
		// 创建人
		map.put("creator", userId);
		// 更新人
		map.put("updater", userId);
		// 考核来源(人工)
//		map.put("type", EnumAssessmentSourceType.O.toString());
		return true;
	}

	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		map.put("updater", UserContext.getUserId());
	}

	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}

	public void setScoreStandardDao(ScoreStandardDao scoreStandardDao) {
		this.scoreStandardDao = scoreStandardDao;
	}

	public void setScoreStandardDetailDao(ScoreStandardDetailDao scoreStandardDetailDao) {
		this.scoreStandardDetailDao = scoreStandardDetailDao;
	}

	public void setFiltermanagerDao(FiltermanagerDao filtermanagerDao) {
		this.filtermanagerDao = filtermanagerDao;
	}
}
