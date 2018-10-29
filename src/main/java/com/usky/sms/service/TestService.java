
package com.usky.sms.service;

import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import com.usky.sms.common.ResponseHelper;
import com.usky.sms.core.AbstractService;
import com.usky.sms.test.TestDao;
import com.usky.sms.user.UserGroupDao;

public class TestService extends AbstractService {
	
	@Autowired
	private TestDao testDao;
	
	@Autowired
	private UserGroupDao userGroupDao;
	
	public void doDefault(HttpServletRequest request, HttpServletResponse response) {
		try {
			//			testDao.testTransaction2();
			Object object = userGroupDao.getUserIdsByUserGroup(1);
			
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", object);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	
	public void setTestDao(TestDao testDao) {
		this.testDao = testDao;
	}
	
	public void setUserGroupDao(UserGroupDao userGroupDao) {
		this.userGroupDao = userGroupDao;
	}
	
}
