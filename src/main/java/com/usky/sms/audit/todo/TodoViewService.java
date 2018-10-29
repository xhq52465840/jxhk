
package com.usky.sms.audit.todo;

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
import com.usky.sms.unit.UnitDao;
import com.usky.sms.user.UserDao;

public class TodoViewService extends AbstractService {
	
	@Autowired
	private UserDao userDao;
	
	@Autowired
	private TodoViewDao todoViewDao;
	
	@Autowired
	private UnitDao unitDao;
	
	/**
	 * 获取待办列表
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	public void getTodoList(HttpServletRequest request, HttpServletResponse response) throws Exception {
		try {
			List<Map<String, Object>> list = todoViewDao.getTodoList();
			
			Map<String, Object> result = new HashMap<String, Object>();
			result.put("success", true);
			result.put("data", PageHelper.getPagedResult(list,request));

			ResponseHelper.output(response, result);

		} catch (SMSException e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		} catch (Exception e) {
			e.printStackTrace();
			ResponseHelper.output(response, e);
		}
	}

	public void setTodoViewDao(TodoViewDao todoViewDao) {
		this.todoViewDao = todoViewDao;
	}

	public void setUserDao(UserDao userDao) {
		this.userDao = userDao;
	}

	public void setUnitDao(UnitDao unitDao) {
		this.unitDao = unitDao;
	}
	

}
