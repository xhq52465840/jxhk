package com.usky.sms.safetyreview;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.core.BaseDao;
import com.usky.sms.filtermanager.FiltermanagerDO;
import com.usky.sms.filtermanager.FiltermanagerDao;
import com.usky.sms.user.UserContext;

public class AssessmentProjectDao extends BaseDao<AssessmentProjectDO> {
	
	@Autowired
	private ScoreStandardDao scoreStandardDao;
	
	@Autowired
	private ScoreStandardDetailDao scoreStandardDetailDao;
	
	@Autowired
	private AssessmentCommentDao assessmentCommentDao;
	
	@Autowired
	private FiltermanagerDao filtermanagerDao;
	
	protected AssessmentProjectDao() {
		super(AssessmentProjectDO.class);
	}
	
	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields,
			boolean multiple, boolean showExtendFields) {
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
		AssessmentProjectDO assessmentProject = (AssessmentProjectDO) obj;
		List<Map<String, Object>> assessmentCommentList = new ArrayList<Map<String, Object>>();
		List<AssessmentCommentDO> assessmentComments = new ArrayList<AssessmentCommentDO>(assessmentProject.getAssessmentComments());

		// 对考核内容按ID的升序进行排序
		Collections.sort(assessmentComments);

		for (AssessmentCommentDO assessmentComment : assessmentComments) {
			// 不检索假删除的数据
			if (assessmentComment.isDeleted()) {
				continue;
			}
			Map<String, Object> assessmentCommentMap = new HashMap<String, Object>();

			Integer id = assessmentComment.getId();
			String description = assessmentComment.getDescription();
			String type = assessmentComment.getType();
			// 将评分标准和过滤器也返回
			if (showExtendFields) {
				// 评分标准
				ScoreStandardDO scoreStandard = scoreStandardDao.getByAssessmentComment(assessmentComment);
				Map<String, Object> scoreStandardMap = scoreStandardDao.convert(scoreStandard);
				if (null != scoreStandard) {
					List<ScoreStandardDetailDO> details = new ArrayList<ScoreStandardDetailDO>();
					if (null != scoreStandard.getDetails()) {
						for (ScoreStandardDetailDO detail : scoreStandard.getDetails()) {
							if (!detail.isDeleted()) {
								details.add(detail);
							}
						}
					}

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

				assessmentCommentMap.put("scoreStandard", scoreStandardMap);
				assessmentCommentMap.put("filter", filterMap);
			}
			assessmentCommentMap.put("id", id);
			assessmentCommentMap.put("description", description);
			assessmentCommentMap.put("type", type);
			assessmentCommentMap.put("standardSummary", assessmentComment.getStandardSummary());
			assessmentCommentList.add(assessmentCommentMap);
		}
		map.put("assessmentComments", assessmentCommentList);
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		// 当前用户Id
		Integer userId = UserContext.getUserId();
		// 创建人
		map.put("creator", userId);
		// 更新人
		map.put("updater", userId);
		return true;
	}

	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		map.put("updater", UserContext.getUserId());
	}

	@Override
	protected void beforeDelete(Collection<AssessmentProjectDO> collection) {
		// 
		for(AssessmentProjectDO assessmentProject : collection){
			// 假删除对应的考核内容
			Set<AssessmentCommentDO> assessmentComments = assessmentProject.getAssessmentComments();
			for(AssessmentCommentDO assessmentComment : assessmentComments){
				// 假删除对应的考核内容
				assessmentComment.setDeleted(true);
				assessmentCommentDao.internalUpdate(assessmentComment);
			}
		}
	}

	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}
	
	@SuppressWarnings("unchecked")
	public List<AssessmentProjectDO> getAll(){
		StringBuffer hql = new StringBuffer();
		hql.append("select distinct ap from AssessmentProjectDO ap")
		   .append("left join fetch ap.assessmentComments left join fetch ap.creator")
		   .append("left join fetch ap.updater where ap.deleted = ?");
		return (List<AssessmentProjectDO>) this.query(hql.toString(), false);
	}
	
	/**
	 * 获取所有具有考核内容的考核项目
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<AssessmentProjectDO> getAllHasComments(){
		StringBuffer hql = new StringBuffer();
		hql.append("select distinct ap from AssessmentProjectDO ap")
		   .append(" inner join fetch ap.assessmentComments ac left join fetch ap.creator")
		   .append(" left join fetch ap.updater where ap.deleted = ? order by ap.id");
		return (List<AssessmentProjectDO>) this.query(hql.toString(), false);
	}
	
	/**
	 * 获取所有具有考核内容的且考核内容的类型为type的考核项目<br>
	 * type为空时，查询所有的type
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public List<AssessmentProjectDO> getAllHasCommentsWithType(String type){
		StringBuffer hql = new StringBuffer();
		hql.append("select distinct ap from AssessmentProjectDO ap")
		   .append(" inner join ap.assessmentComments ac with ac.deleted = false left join fetch ap.creator")
		   .append(" left join fetch ap.updater where ap.deleted = ?");
		List<Object> values = new ArrayList<Object>();
		values.add(false);
		if (!StringUtils.isBlank(type)) {
			hql.append(" and ac.type = ?");
			values.add(type);
		}
		hql.append(" order by ap.id");
		return (List<AssessmentProjectDO>) this.query(hql.toString(), values.toArray());
	}
	
	/**
	 * @param scoreStandardDao the scoreStandardDao to set
	 */
	public void setScoreStandardDao(ScoreStandardDao scoreStandardDao) {
		this.scoreStandardDao = scoreStandardDao;
	}

	/**
	 * @param assessmentCommentDao the assessmentCommentDao to set
	 */
	public void setAssessmentCommentDao(AssessmentCommentDao assessmentCommentDao) {
		this.assessmentCommentDao = assessmentCommentDao;
	}

	public void setScoreStandardDetailDao(ScoreStandardDetailDao scoreStandardDetailDao) {
		this.scoreStandardDetailDao = scoreStandardDetailDao;
	}

	public void setFiltermanagerDao(FiltermanagerDao filtermanagerDao) {
		this.filtermanagerDao = filtermanagerDao;
	}

}
