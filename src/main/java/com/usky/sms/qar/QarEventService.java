package com.usky.sms.qar;

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

public class QarEventService extends AbstractService{
	
	@Autowired
	private QarEventDao qarEventDao;
	
	@Autowired
	private QarQueryDao qarQueryDao;
	
	public void setQarEventDao(QarEventDao qarEventDao) {
		this.qarEventDao = qarEventDao;
	}
	
	public void setQarQueryDao(QarQueryDao qarQueryDao) {
		this.qarQueryDao = qarQueryDao;
	}
	
	public void getQarEvent(HttpServletRequest request, HttpServletResponse response){
		try{
			String getMonth = request.getParameter("month");
			String getYear = request.getParameter("year");
			String getType = request.getParameter("type");
			
			List<QarEventDO> qarEventDOList = qarEventDao.getQarEvent(getYear,getMonth,getType);
			
			
			Map<String, Object> result = new HashMap<String, Object>();
			Map<String, Object> data = new HashMap<String, Object>();		
			
			data.put("qarEventDOList", PageHelper.getPagedResult(qarEventDao.convert(qarEventDOList,false), request));
			result.put("success", true);
			result.put("data", data);

			ResponseHelper.output(response, result);
			
		}catch(SMSException e){
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}catch(Exception e){
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	
		
}

