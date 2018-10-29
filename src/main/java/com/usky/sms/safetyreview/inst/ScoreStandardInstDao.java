package com.usky.sms.safetyreview.inst;

import java.lang.reflect.Field;
import java.util.ArrayList;
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

import com.usky.sms.core.BaseDao;

public class ScoreStandardInstDao extends BaseDao<ScoreStandardInstDO> {
	
	@Autowired
	private ScoreStandardDetailInstDao scoreStandardDetailInstDao;
	
	private final String EXPRESSION_VARIABLE = "x";

	protected ScoreStandardInstDao() {
		super(ScoreStandardInstDO.class);
	}

	@Override
	protected void setField(Map<String, Object> map, Object obj, Class<?> claz, boolean multiple, Field field) {
		String fieldName = field.getName();
		ScoreStandardInstDO scoreStandardInst = (ScoreStandardInstDO) obj;
		if ("details".equals(fieldName) && multiple) {
			List<Map<String, Object>> details = scoreStandardDetailInstDao.convert(scoreStandardDetailInstDao.getByStandardInstId(scoreStandardInst.getId()));
			map.put(fieldName, details);
		} else {
			super.setField(map, obj, claz, multiple, field);
		}
	}

	/**
	 * 通过考核内容获取评分标准
	 * @param assessmentCommentDO
	 * @return
	 */
	@Transactional(readOnly = true, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public ScoreStandardInstDO getByAssessmentCommentInst(AssessmentCommentInstDO assessmentCommentInst){
		@SuppressWarnings("unchecked")
		List<ScoreStandardInstDO> list = (List<ScoreStandardInstDO>) this.query("select distinct t from ScoreStandardInstDO t where t.deleted = false and t.assessmentCommentInst = ?", assessmentCommentInst);
		if (list.isEmpty()) {
			return null;
		}
		return list.get(0);
	}
	
	/**
	 * 通过考核内容获取评分标准
	 * @param assessmentCommentIds
	 * @return
	 */
	public List<ScoreStandardInstDO> getByAssessmentCommentInstIds(List<Integer> assessmentCommentIds){
		if (null == assessmentCommentIds || assessmentCommentIds.isEmpty()) {
			return new ArrayList<ScoreStandardInstDO>();
		}
		@SuppressWarnings("unchecked")
		List<ScoreStandardInstDO> list = this.getHibernateTemplate().find("select t from ScoreStandardInstDO t left join fetch t.details where t.deleted = false and t.assessmentCommentInst.id in (:assessmentCommentIds)", "assessmentCommentIds", assessmentCommentIds);
		return list;
	}
	
	public List<ScoreStandardInstDO> getByMethanonInstId(Integer id){
		@SuppressWarnings("unchecked")
		List<ScoreStandardInstDO> list = (List<ScoreStandardInstDO>) this.query("from ScoreStandardInstDO t where t.deleted = false and t.assessmentCommentInst.deleted = false and t.assessmentCommentInst.assessmentProjectInst.deleted = false and t.assessmentCommentInst.assessmentProjectInst.methanolInst.id = ?", id);
		return list;
	}
	
	/**
	 * 根据评分标准，算出结果并返回
	 * @param scoreStandardInst
	 * @param num
	 * @return
	 */
	public Double eval(ScoreStandardInstDO scoreStandardInst, Integer num){
		if (null == scoreStandardInst) {
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
		Double min = scoreStandardInst.getMin();
		// 最大值
		Double max = scoreStandardInst.getMax();
		List<ScoreStandardDetailInstDO> details = scoreStandardDetailInstDao.getByStandardInstId(scoreStandardInst.getId());
		if (null != details) {

			// 按左区间的升序排序
			Collections.sort(details);
			// 计算所有分段函数
			for (int i = 0; i <= num; i++) {
				for (ScoreStandardDetailInstDO scoreStandardDetailInst : details) {
					Integer leftInterval = scoreStandardDetailInst.getLeftInterval();
					Integer rightInterval = scoreStandardDetailInst.getRightInterval();
					if (null == rightInterval) {
						rightInterval = i;
					}
					String expression = scoreStandardDetailInst.getExpression();
					e = jexl.createExpression(expression);
					// 没有检索到数据特殊处理
					if (leftInterval == 0 && rightInterval == 0) {
						if (num == 0) {
							// 设置变量
							jc.set(EXPRESSION_VARIABLE, i);
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
							jc.set(EXPRESSION_VARIABLE, i);
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

	public void setScoreStandardDetailInstDao(ScoreStandardDetailInstDao scoreStandardDetailInstDao) {
		this.scoreStandardDetailInstDao = scoreStandardDetailInstDao;
	}
}
