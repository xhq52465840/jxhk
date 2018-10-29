package com.usky.sms.safetyreview;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.jexl2.Expression;
import org.apache.commons.jexl2.JexlContext;
import org.apache.commons.jexl2.MapContext;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;

import com.google.gson.reflect.TypeToken;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.constant.MessageCodeConstant;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;

public class ScoreStandardDetailService extends AbstractService {
	
	private final String EXPRESSION_VARIABLE = "x";
	
	@Autowired
	private ScoreStandardDao scoreStandardDao;
	
	@Autowired
	private ScoreStandardDetailDao scoreStandardDetailDao;

	/**
	 * 添加评分标准详细
	 * @param request
	 * @param response
	 */
	public void addScoreStandardDetail(HttpServletRequest request, HttpServletResponse response){
		try {
			String obj = request.getParameter("obj");
			Map<String, Object> map = gson.fromJson(obj, new TypeToken<Map<String, Object>>() {}.getType());
			ScoreStandardDetailDO scoreStandardDetail = parseScoreStandardDetail(map);
			scoreStandardDetailDao.internalSave(scoreStandardDetail);
			
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", scoreStandardDetail.getId());

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
	 * 将map解析成ScoreStandardDetailDO对象
	 * @param map
	 * @return
	 */
	private ScoreStandardDetailDO parseScoreStandardDetail(Map<String, Object> map){
		ScoreStandardDetailDO scoreStandardDetail = new ScoreStandardDetailDO();
		// 左区间
		String leftInterval = (String) map.get("leftInterval");
		if (StringUtils.isBlank(leftInterval)) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "左区间不能为空！");
		}
		scoreStandardDetail.setLeftInterval(Integer.parseInt(leftInterval));
		// 右区间
		String rightInterval = (String) map.get("rightInterval");
		if (!StringUtils.isBlank(rightInterval)) {
			scoreStandardDetail.setRightInterval(Integer.parseInt(rightInterval));
			if (scoreStandardDetail.getLeftInterval() > scoreStandardDetail.getRightInterval()) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "左区间不能比右区间大！");
			}
		}
		
		// 数学表达式
		String expression = (String) map.get("expression");
		if (StringUtils.isBlank(expression)) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "表达式不能为空！");
		}
		// 使用正则表达式校验表达式 只能包括数字、小数点、加、减、乘、除、括号、空格以及字母‘x’
		scoreStandardDetailDao.checkMathExpression(expression);
		// 是否能成功解析表达式
		scoreStandardDetailDao.praseMathExpression(expression);
		scoreStandardDetail.setExpression(expression);
		
		// 对应的评分标准
		String scoreStandardId = (String) map.get("scoreStandardId");
		ScoreStandardDO scoreStandard = null;
		if (!StringUtils.isBlank(scoreStandardId)) {
			scoreStandard = scoreStandardDao.internalGetById(Integer.parseInt(scoreStandardId));
		}
		if (null == scoreStandard) {
			throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "对应的评分标准不能为空！");
		}
		scoreStandardDetail.setScoreStandard(scoreStandard);
		
		return scoreStandardDetail;
	}
	
	/**
	 * 
	 * @param request
	 * @param response
	 */
	public void testExpression(HttpServletRequest request, HttpServletResponse response){
		try{
			String expression = request.getParameter("expression");
			String param = request.getParameter("x");
			Double x = null;
			try {
				x = Double.parseDouble(param);
			} catch (Exception e) {
				throw new SMSException(MessageCodeConstant.MSG_CODE_DEFAULT, "输入的x值不是有效的数字！");
			}
			// 使用正则表达式校验表达式 只能包括数字、小数点、加、减、乘、除、括号、空格以及字母‘x’
			scoreStandardDetailDao.checkMathExpression(expression);
			// 解析表达式
			Expression exp = scoreStandardDetailDao.praseMathExpression(expression);
			// Create a context and add data
			JexlContext jc = new MapContext();
			
			// 设置变量
			jc.set(EXPRESSION_VARIABLE, x);
			// 算出表达式的结果
			Object o = exp.evaluate(jc);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("expression", expression);
			map.put("x", param);
			map.put("result", o);
			
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", map);
			
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

}
