package com.usky.sms.user;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.activity.ActivityDao;
import com.usky.sms.common.PageHelper;
import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.core.SMSException;

public class UserAssociationService extends AbstractService {

	@Autowired
	private UserAssociationDao associationDao;
	@Autowired
	private ActivityDao activityDao;
	
	public void getWatchUser(HttpServletRequest request,HttpServletResponse response) {
		try {
			String entityId = request.getParameter("entityId");
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", associationDao.getWatchUser(entityId));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void getActivityByUser(HttpServletRequest request,HttpServletResponse response) {
		try {		
			String sort = request.getParameter("sort");
			String order = request.getParameter("order");
			if("".equals(sort)){
				sort = null;
			}
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(activityDao.convert(associationDao.getActivityByUser(UserContext.getUser(),sort,order)), request));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void setAssociationDao(UserAssociationDao associationDao) {
		this.associationDao = associationDao;
	}

	public void setActivityDao(ActivityDao activityDao) {
		this.activityDao = activityDao;
	}

	
	
}
