package com.usky.sms.safetyreview;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.apache.commons.jexl2.Expression;
import org.apache.commons.jexl2.JexlContext;
import org.apache.commons.jexl2.JexlEngine;
import org.apache.commons.jexl2.MapContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.user.UserContext;

public class ScoreStandardDao extends BaseDao<ScoreStandardDO> {
	
	@Autowired
	private AssessmentCommentDao assessmentCommentDao;
	
	@Autowired
	private ScoreStandardDetailDao scoreStandardDetailDao;

	protected ScoreStandardDao() {
		super(ScoreStandardDO.class);
	}
	
	public Double eval(ScoreStandardDO scoreStandard, Integer num){
		if (null == scoreStandard) {
			return 0.0;
		}
		// Create or retrieve a JexlEngine
		JexlEngine jexl = new JexlEngine();
		Expression e = null;

		// Create a context and add data
		JexlContext jc = new MapContext();

		// 总分
		Double sum = 0.0;
		// 最小值
		Double min = scoreStandard.getMin();
		// 最大值
		Double max = scoreStandard.getMax();
		List<ScoreStandardDetailDO> details = scoreStandardDetailDao.getByStandardId(scoreStandard.getId());
		if (null != details) {

			// 按左区间的升序排序
			Collections.sort(details);
			// 计算所有分段函数
			for (int i = 0; i <= num; i++) {
				
				for (ScoreStandardDetailDO scoreStandardDetail : details) {
					Integer leftInterval = scoreStandardDetail.getLeftInterval();
					Integer rightInterval = scoreStandardDetail.getRightInterval();
					if (null == rightInterval) {
						rightInterval = i;
					}
					String expression = scoreStandardDetail.getExpression();
					e = jexl.createExpression(expression);
					// 没有检索到数据特殊处理
					if (leftInterval == 0 && rightInterval == 0) {
						if (num == 0) {
							// 设置变量
							jc.set("x", i);
							// 算出表达式的结果
							Object o = e.evaluate(jc);
							// 求和
							if (null != o) {
								sum += Double.parseDouble(o.toString());
							}
						}
					} else {
						// i是否在区间里
						if (i >= leftInterval && i <= rightInterval) {
							// 设置变量
							jc.set("x", i);
							// 算出表达式的结果
							Object o = e.evaluate(jc);
							// 求和
							if (null != o) {
								sum += Double.parseDouble(o.toString());
							}
							break;
						}
					}
				}
			}
		}

		if (null != min && sum < min) { // 结果比最小值小则返回最小值
			sum = min;
		} else if (null != max && sum > max) { // 结果比最大值大则返回最大值
			sum = max;
		}
		return sum;
	}
	
	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		checkBeforeSave(map);
		// 当前用户Id
		Integer userId = UserContext.getUserId();
		// 创建人
		map.put("creator", userId);
		// 更新人
		map.put("updater", userId);
		return true;
	}

	@Override
	protected void afterSave(ScoreStandardDO obj) {
		// 关联的考核内容更新
//		AssessmentCommentDO assessmentComment = assessmentCommentDao.internalGetById(obj.getAssessmentComment().getId());
//		if (null == assessmentComment) {
//			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "对应的考核内容不存在！");
//		}
//		assessmentComment.setScoreStandard(obj);
//		assessmentCommentDao.internalUpdate(assessmentComment);
	}
	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		checkBeforeUpdate(map);
		map.put("updater", UserContext.getUserId());
	}
	
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}
	
	/**
	 * 输入校验
	 * @param map
	 */
	private void checkBeforeUpdate(Map<String, Object> map){
		Double min = null;
		Double max = null;
		try {
			// 最小值
			min = (Double) map.get("min");
			// 最大值
			max = (Double) map.get("max");
		} catch (Exception e) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "最大值或最小值输入的不是实数！");
		}
		if (null != max && null != min && min > max) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "最小值不能比最大值大！");
		}
		
	}
	
	/**
	 * 输入校验
	 * @param map
	 */
	private void checkBeforeSave(Map<String, Object> map){
		checkBeforeUpdate(map);
		
		// 对应的考核内容
		Double assessmentCommentId = (Double) map.get("assessmentComment");
		AssessmentCommentDO assessmentComment = null;
		if (null != assessmentCommentId) {
			assessmentComment = assessmentCommentDao.internalGetById(assessmentCommentId.intValue());
		}
		if (null == assessmentComment) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "对应的考核内容不能为空！");
		}
		
	}
	
	/**
	 * 通过考核内容获取评分标准
	 * @param assessmentCommentDO
	 * @return
	 */
	public ScoreStandardDO getByAssessmentComment(AssessmentCommentDO assessmentCommentDO){
		@SuppressWarnings("unchecked")
		List<ScoreStandardDO> list = this.getHibernateTemplate().find("select distinct t from ScoreStandardDO t left join fetch t.details where t.deleted = false and t.assessmentComment = ?", assessmentCommentDO);
		if (list.isEmpty()) {
			return null;
		}
		return list.get(0);
	}
	
	public void setAssessmentCommentDao(AssessmentCommentDao assessmentCommentDao) {
		this.assessmentCommentDao = assessmentCommentDao;
	}

	public void setScoreStandardDetailDao(ScoreStandardDetailDao scoreStandardDetailDao) {
		this.scoreStandardDetailDao = scoreStandardDetailDao;
	}
}
