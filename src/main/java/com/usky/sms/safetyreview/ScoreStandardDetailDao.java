package com.usky.sms.safetyreview;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.commons.jexl2.Expression;
import org.apache.commons.jexl2.ExpressionImpl;
import org.apache.commons.jexl2.JexlEngine;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;

public class ScoreStandardDetailDao extends BaseDao<ScoreStandardDetailDO> {
	
	@Autowired
	private ScoreStandardDao scoreStandardDao;

	protected ScoreStandardDetailDao() {
		super(ScoreStandardDetailDO.class);
	}
	
	@SuppressWarnings("unchecked")
	public List<ScoreStandardDetailDO> getByStandardId(Integer standardId){
		if(null == standardId){
			return new ArrayList<ScoreStandardDetailDO>();
		}else{
			return (List<ScoreStandardDetailDO>) this.query("from ScoreStandardDetailDO t where t.deleted = false and t.scoreStandard.id = ? order by t.leftInterval", standardId);
		}
	}

	@Override
	protected boolean beforeSave(Map<String, Object> map) {
		// 输入校验
		checkBeforeSave(map);
		return true;
	}

	@Override
	protected void beforeUpdate(int id, Map<String, Object> map) {
		// 输入校验
		checkBeforeUpdate(map);
	}
	
	@Override
	protected void afterSave(ScoreStandardDetailDO obj) {
		super.afterSave(obj);
		// 校验区间是否重叠
		checkOverlapping(obj);
	}
	
	@Override
	protected void afterUpdate(ScoreStandardDetailDO obj, ScoreStandardDetailDO dbObj) {
		super.afterUpdate(obj, dbObj);
		// 校验区间是否重叠
		checkOverlapping(obj);
	}
	
	@Override
	@Transactional(readOnly = false, propagation = Propagation.REQUIRED, isolation = Isolation.READ_COMMITTED)
	public void delete(String[] ids) {
		this.markAsDeleted(ids);
	}
	/**
	 * 
	 * @param scoreStandardId
	 * @return scoreStandardId对应的所有评分标准详细
	 */
	@SuppressWarnings("unchecked")
	public List<ScoreStandardDetailDO> getByScoreStandardId(Integer scoreStandardId){
		if(null == scoreStandardId){
			return new ArrayList<ScoreStandardDetailDO>();
		}
		return (List<ScoreStandardDetailDO>) this.query("select distinct t from ScoreStandardDetailDO t join fetch t.scoreStandard where t.deleted = false and t.scoreStandard.id = ?", scoreStandardId);
	}
	
	/**
	 * 校验区间是否重叠
	 */
	private void checkOverlapping(ScoreStandardDetailDO scoreStandardDetail){
		Integer scoreStandardId = scoreStandardDetail.getScoreStandard().getId();
		List<ScoreStandardDetailDO> list = this.getByScoreStandardId(scoreStandardId);
		// 先按照左区间进行排序
		Collections.sort(list);
		for(int i = 0; i < list.size() - 1; i++){
			ScoreStandardDetailDO d1 = list.get(i);
			ScoreStandardDetailDO d2 = list.get(i + 1);
			Integer left1 = d1.getLeftInterval();
			Integer right1 = d1.getRightInterval();
			Integer left2 = d2.getLeftInterval();
			Integer right2 = d2.getRightInterval();
			if (null == right1 || right1 >= left2) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "区间[" + left1 + ", " + (right1 == null ? "无穷大" : right1) + "] 与 [" + left2 + ", " + (right2 == null ? "无穷大" : right2) + "]重叠了");
			}
		}
		
	}
	
	private void checkBeforeUpdate(Map<String, Object> map){
		// 左区间
		Double leftInterval = (Double) map.get("leftInterval");
		// 右区间
		Double rightInterval = (Double) map.get("rightInterval");
		if (null == leftInterval) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "左区间不能为空！");
		}
		if (null != rightInterval) {
			if (leftInterval > rightInterval) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "左区间不能比右区间大！");
			}
		}
		
		// 数学表达式
		String expression = (String) map.get("expression");
		// 只能包括数字、小数点、加、减、乘、除、括号以及字母‘x’
		checkExpression(expression);
	}
	
	/**
	 * 对输入进行校验<br>
	 * 左区间不能为空，左区间不能比右区间大，数学表达式不能有其他字符
	 * @param map
	 */
	private void checkBeforeSave(Map<String, Object> map){
		checkBeforeUpdate(map);
		
		// 对应的评分标准
		Double scoreStandardId = (Double) map.get("scoreStandard");
		ScoreStandardDO scoreStandard = null;
		if (null != scoreStandardId) {
			scoreStandard = scoreStandardDao.internalGetById(scoreStandardId.intValue());
		}
		if (null == scoreStandard) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "对应的评分标准不能为空！");
		}
	}
	
	private void checkExpression(String expression){
		if (StringUtils.isBlank(expression)) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "数学表达式不能为空！");
		}
		checkMathExpression(expression);
		praseMathExpression(expression);
	}
	

	/**
	 * 利用正则表达式对数学表达式进行校验<br>
	 * 表达式只能包括数字、小数点、加、减、乘、除、括号、空格以及字母‘x’<br>
	 * x不能连续出现
	 * @param expression
	 */
	public void checkMathExpression(String expression){
		Pattern pattern = Pattern.compile("^[\\+\\-\\*/\\d\\.x\\(\\) ]*$");
		Matcher matcher = pattern.matcher(expression);
		if (expression.contains("xx") || !matcher.matches()) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "表达式[" + expression + "]无效！");
		}
	}
	
	/**
	 * 解析表达式
	 * @param expression
	 */
	public Expression praseMathExpression(String expression){
		// Create or retrieve a JexlEngine
		JexlEngine jexl = new JexlEngine();
		ExpressionImpl exp = null;
		try {
			exp = (ExpressionImpl) jexl.createExpression(expression);
		} catch (Exception e) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "表达式[" + expression + "]无效！");
		}
		return exp;
	}
	
	public void setScoreStandardDao(ScoreStandardDao scoreStandardDao) {
		this.scoreStandardDao = scoreStandardDao;
	}
	
}
