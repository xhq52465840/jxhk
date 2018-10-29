package com.usky.sms.safetyreview.inst;

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

public class AssessmentProjectInstDao extends BaseDao<AssessmentProjectInstDO> {
	
	@Autowired
	private CompletionInstDao completionInstDao;
	
	protected AssessmentProjectInstDao() {
		super(AssessmentProjectInstDO.class);
	}
	
	@Override
	protected void setFields(Map<String, Object> map, Object obj, Class<?> claz, List<String> fields, boolean multiple, boolean showExtendFields) {
		super.setFields(map, obj, claz, fields, multiple, showExtendFields);
		if (showExtendFields) {
			AssessmentProjectInstDO assessmentProject = (AssessmentProjectInstDO)obj;
			List<Map<String, Object>> assessmentCommentList = new ArrayList<Map<String, Object>>();
			List<AssessmentCommentInstDO> assessmentComments =new ArrayList<AssessmentCommentInstDO>(assessmentProject.getAssessmentCommentInsts());
			
			// 对考核内容按ID的升序进行排序
			Collections.sort(assessmentComments);

			for (AssessmentCommentInstDO assessmentComment : assessmentComments) {
				// 不检索假删除的数据
				if (assessmentComment.isDeleted()) {
					continue;
				}
				
				Integer id = assessmentComment.getId();
				String description = assessmentComment.getDescription();
				String type = assessmentComment.getType();
				Integer filterId = assessmentComment.getFilterId();
				Integer assessmentCommentTemplateId = assessmentComment.getAssessmentCommentTemplateId();
//				CompletionInstDO completionInst = completionInstDao.getByCommentInstId(id);
				
				Map<String, Object> assessmentCommentMap = new HashMap<String, Object>();
				assessmentCommentMap.put("id", id);
				assessmentCommentMap.put("description", description);
				assessmentCommentMap.put("type", type);
				assessmentCommentMap.put("filterId", filterId);
				assessmentCommentMap.put("standardSummary", assessmentComment.getStandardSummary());
				assessmentCommentMap.put("assessmentCommentTemplateId", assessmentCommentTemplateId);
//				assessmentCommentMap.put("completion", completionInstDao.convert(completionInst));
				assessmentCommentList.add(assessmentCommentMap);
			}
			map.put("assessmentCommentInsts", assessmentCommentList);
		}
	}

	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}

	@SuppressWarnings("unchecked")
	public List<AssessmentProjectInstDO> getByMethanolInstId(Integer methanolInstId){
		StringBuffer hql = new StringBuffer();
		hql.append("select distinct ap from AssessmentProjectInstDO ap")
//		   .append("left join ap.assessmentCommentInsts ac")
		   .append(" where ap.deleted = ? and ap.methanolInst.id = ? order by ap.id asc");
		return (List<AssessmentProjectInstDO>) this.query(hql.toString(), false, methanolInstId);
	}

	public void setCompletionInstDao(CompletionInstDao completionInstDao) {
		this.completionInstDao = completionInstDao;
	}
	

}
