package com.usky.sms.safetyreview;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;

public class AssessmentProjectService extends AbstractService {
	
	@Autowired
	private AssessmentProjectDao assessmentProjectDao;
	
	@Autowired
	private ScoreStandardDao scoreStandardDao;
	
	@Autowired
	private ScoreStandardDetailDao scoreStandardDetailDao;

	/**
	 * 获取具有考核内容的所有考核项目且考核内容的类型为type的考核项目<br>
	 * type为空时检索所有的type
	 */
	public void getAssessmentProjects(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			String type = request.getParameter("type");
			
			Map<String, Object> result = new HashMap<String, Object>();
			
			List<AssessmentProjectDO> list = assessmentProjectDao.getAllHasCommentsWithType(type);
			
			List<Map<String, Object>> dataMapList = new ArrayList<Map<String,Object>>();
			for (AssessmentProjectDO assessmentProject : list) {
				Map<String, Object> assessmentProjectMap = new HashMap<String, Object>();
				assessmentProjectMap.put("id", assessmentProject.getId());
				assessmentProjectMap.put("name", assessmentProject.getName());
				
				List<Map<String, Object>> assessmentCommentList = new ArrayList<Map<String, Object>>();
				List<AssessmentCommentDO> assessmentComments = new ArrayList<AssessmentCommentDO>(
						assessmentProject.getAssessmentComments());

				// 对考核内容按ID的升序进行排序
				Collections.sort(assessmentComments);

				for (AssessmentCommentDO assessmentComment : assessmentComments) {
					// 不检索假删除的数据
					if (assessmentComment.isDeleted()) {
						continue;
					}
					// 不显示类型不是参数type的考核内容
					if (null != type && !type.equals(assessmentComment.getType())) {
						continue;
					}
					Map<String, Object> assessmentCommentMap = new HashMap<String, Object>();

					Integer id = assessmentComment.getId();
					String description = assessmentComment.getDescription();
					assessmentCommentMap.put("id", id);
					assessmentCommentMap.put("description", description);
					assessmentCommentMap.put("type", assessmentComment.getType());
					assessmentCommentList.add(assessmentCommentMap);
				}
				assessmentProjectMap.put("assessmentComments", assessmentCommentList);
				dataMapList.add(assessmentProjectMap);
			}

			result.put("success", true);
			result.put("data", PageHelper.getPagedResult(dataMapList, request));

			ResponseHelper.output(response, result);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	public void setScoreStandardDao(ScoreStandardDao scoreStandardDao) {
		this.scoreStandardDao = scoreStandardDao;
	}

	public void setScoreStandardDetailDao(ScoreStandardDetailDao scoreStandardDetailDao) {
		this.scoreStandardDetailDao = scoreStandardDetailDao;
	}

	public void setAssessmentProjectDao(AssessmentProjectDao assessmentProjectDao) {
		this.assessmentProjectDao = assessmentProjectDao;
	}

}
