package com.usky.sms.eiosa.user;

import java.util.ArrayList;
import java.util.Arrays;
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
import com.usky.sms.user.UserDO;
import com.usky.sms.user.UserDao;


public class EiosaUserService extends AbstractService{
	@Autowired
	private UserDao userDao;
	
	@Autowired
	private EiosaUserGroupDao eiosaUserGroupDao;

	/**
	 * 查找eiosa用户组成员
	 * @param request
	 * @param response
	 */
	public void getEiosaUsers(HttpServletRequest request,HttpServletResponse response) {
		try {
			
			String userName = request.getParameter("userName");
			List<UserDO> userList = eiosaUserGroupDao.getEiosaUsers(userName);
			Map<String, Object> map = new HashMap<String, Object>();
			map.put("success", true);
			map.put("data", PageHelper.getPagedResult(userDao.convert(userList, Arrays.asList(new String[]{"id", "username", "fullname"}), false), request));
			ResponseHelper.output(response, map);
		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	/**获取用户的EIOSA角色
	 * 
	 * @return
	 */
	public void getEiosaUsersRole(HttpServletRequest request,HttpServletResponse response) {
         try {
			
		
			String role= eiosaUserGroupDao.getUserEiosaRole();
			Map<String, Object> map = new HashMap<String, Object>();
			
			map.put("success", true);
			map.put("data", role);
			ResponseHelper.output(response, map);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}
	public UserDao getUserDao() {
		return userDao;
	}

	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}

	public EiosaUserGroupDao getEiosaUserGroupDao() {
		return eiosaUserGroupDao;
	}

	public void setEiosaUserGroupDao(EiosaUserGroupDao eiosaUserGroupDao) {
		this.eiosaUserGroupDao = eiosaUserGroupDao;
	}
	
	

}
