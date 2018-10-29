package com.usky.sms.safetyreview;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;
import com.usky.sms.safetyreview.ScoreStandardDO;
import com.usky.sms.safetyreview.ScoreStandardDao;

public class ScoreStandardService extends AbstractService {
	
	@Autowired
	private ScoreStandardDao scoreStandardDao;

	public void testEval(HttpServletRequest request, HttpServletResponse response) {
		try {
			int id = Integer.parseInt(request.getParameter("id"));
			int num = Integer.parseInt(request.getParameter("num"));
			
			ScoreStandardDO scoreStandard = scoreStandardDao.internalGetById(id);
			Double d = scoreStandardDao.eval(scoreStandard, num);
			ResponseHelper.output(response, d);
			
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
	
}
