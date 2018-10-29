package com.usky.function;

import java.lang.reflect.Method;
import java.util.*;

import javax.servlet.http.HttpServletRequest;

import org.springframework.web.context.support.WebApplicationContextUtils;

import com.usky.WfMng;
import com.usky.comm.DbClient;
import com.usky.comm.Log;
import com.usky.comm.Utility;
import com.usky.sms.activity.ActivityDao;
import com.usky.sms.core.BaseDao;
import com.usky.sms.core.SMSException;
import com.usky.sms.unit.UnitDO;
import com.usky.sms.unit.UnitRoleActorDO;
import com.usky.sms.unit.UnitRoleActorDao;
import com.usky.sms.user.UserGroupDao;

public class SmsFunction {
	//arguments中必须有call和value
	@SuppressWarnings({ "rawtypes", "unchecked" })
	public static Object CallWithoutWfParam(Map<String, Object> h_page_param, Map<String, Object> h_wf_param, Map<String, Object> mResponseHeader, Map<String, Object> mResponseData, Log log) throws Exception {
		Map h_arguments = Utility.GetMapField(h_wf_param, "arguments");
		if (h_arguments == null) {
			throw new Exception("没有定义arguments参数");
			//return "def";
		}
		String call_name = Utility.GetStringField(h_arguments, "call");
		if (Utility.IsEmpty(call_name))
			throw new Exception("没有call参数");
		
		int p = call_name.lastIndexOf(".");
		if (p <= 0)
			throw new Exception(call_name + "中没有.");
		String class_name = call_name.substring(0, p);
		String func_name = call_name.substring(p + 1);
		
		String argu = Utility.GetStringField(h_arguments, "value");

		String wif_id = Utility.GetStringField(h_wf_param, "wif_id");
		WfMng mng = (WfMng) Utility.GetField(h_wf_param, "wfmng", WfMng.class);
		mng.WriteWfLog("调用" + call_name + " " + wif_id, WfMng.LogLevel.Debug);
		
		Map<String, Object> m_param = new LinkedHashMap<String, Object>();
		m_param.put("wf", h_wf_param);
		m_param.put("page", h_page_param);
		m_param.put("log", log);
		m_param.put("ResponseHeader", mResponseHeader);
		m_param.put("ResponseData", mResponseData);
		
		mResponseHeader.put("status", 0);
		
    	Class cls;
    	try {
			cls = Class.forName(class_name);
    	}
		catch (ClassNotFoundException e) {
			throw new Exception("类[" + class_name + "]不存在");
		}

    	Method m;
    	try {
    		//Object inst = cls.newInstance();
    		m = cls.getMethod(func_name, new Class[]{Map.class, String.class});
    	}
    	catch (NoSuchMethodException e) {
    		throw new Exception("类[" + class_name + "]中没有功能[" + func_name + "]");
    	}
		
    	Object o_result;
    	try {
    		o_result = m.invoke(null, new Object[]{m_param, argu});
    	}
    	catch (Exception e) {
    		e.printStackTrace();
    		if(e.getCause() != null && e.getCause().getClass() == SMSException.class){
    			throw (SMSException)e.getCause();
    		}
    		String msg = class_name + "." + func_name + "执行异常：" + Utility.GetExceptionMsg(e);
    		Throwable t = e.getCause();
    		if (t != null) {
    			msg += " 原因：" + t.getMessage();
    			log.Write((Exception) t);
    		}
    		throw new Exception(msg);
    	}
		
		return o_result;
	}
	
	@SuppressWarnings("rawtypes")
	public static String UserId(Map m_param, String user_id) {
		return user_id;
	}
	
	@SuppressWarnings("rawtypes")
	public static String UserApplyer(Map m_param, String nullStr) throws Exception {
		return GetApplyer(m_param);
	}
	
	@SuppressWarnings("rawtypes")
	public static String UserPageField(Map m_param, String field) throws Exception {
		Map m_page_param = GetPageParam(m_param);
		
		String user_id = Utility.GetStringField(m_page_param, field);
		if (Utility.IsEmpty(user_id))
			throw new Exception("字段[" + field + "]不存在");
		return user_id;
	}
	
	/*
	public static String UserGroup(HttpServletRequest request, String group_id) throws Exception, Exception {
		TransactionHelper transactionHelper = (TransactionHelper) WebApplicationContextUtils.getRequiredWebApplicationContext(request.getSession().getServletContext()).getBean("transactionHelper");
		return (String) transactionHelper.doInTransaction(new SmsFunction(), "UserGroup", request,group_id);
	}
	*/
	
	@SuppressWarnings("rawtypes")
	public static String UserGroup(Map m_param, String group_id) throws Exception {
		UserGroupDao ugd = (UserGroupDao)GetDao(m_param, "userGroupDao");
		List<Integer> list_user = ugd.getUserIdsByUserGroup(Integer.parseInt(group_id));
		if (list_user == null || list_user.size() == 0) 
			throw new Exception("用户组" + group_id + "不存在");

		String userlist = "";
		for (Integer user : list_user) {
			if (!Utility.IsEmpty(userlist))
				userlist += ",";
			userlist += user.toString();
		}
		return userlist;
	}
	
	//根据项目角色选人
	@SuppressWarnings("rawtypes")
	public static String UserProjectRole(Map m_param, String role_id) throws Exception {
		String id = GetId(m_param);
		ActivityDao add = (ActivityDao)GetDao(m_param, "activityDao");
		if (add == null)
			throw new Exception("无法获得ActivityDao");
		Map<String, Object> m_act = add.getById(Integer.parseInt(id));
		UnitDO unit = (UnitDO)Utility.GetField(m_act, "unit", UnitDO.class);
		if (unit == null)
			throw new Exception("没有unit字段");
		UnitRoleActorDao urad = (UnitRoleActorDao)GetDao(m_param, "unitRoleActorDao");
		List<UnitRoleActorDO> list_unit_role = urad.getByUnitId(unit.getId());
		
		String userlist = "";
		for (UnitRoleActorDO unit_role : list_unit_role) {
			if (!"USER".equals(unit_role.getType()) || !role_id.equals(unit_role.getRole().getId()))
				continue;
			if (!Utility.IsEmpty(userlist))
				userlist += ",";
			userlist += unit_role.getParameter();
		}
		
		return userlist;
	}
	
	@SuppressWarnings("rawtypes")
	public static BaseDao GetDao(Map m_param, String daoname) throws Exception {
		return (BaseDao)WebApplicationContextUtils.getRequiredWebApplicationContext(GetRequest(m_param).getSession().getServletContext()).getBean("userGroupDao");
	}
	
	@SuppressWarnings({ "rawtypes", "unused" })
	public static String GetId(Map m_param) throws Exception {
		if (true)
			throw new Exception("尚未实现");
		
		return "";
	}
	
	@SuppressWarnings("rawtypes")
	public static String GetApplyer(Map m_param) throws Exception {
		Map m_wf_param = GetWfParam(m_param);
		String applyer = Utility.GetStringField(m_wf_param, "wf_applyer");
		if (Utility.IsEmpty(applyer))
			throw new Exception("没有wf_applyer参数");
		return applyer;
	}
	
	@SuppressWarnings("rawtypes")
	public static DbClient GetDbClient(Map m_param) throws Exception {
		Map m_wf_param = GetWfParam(m_param);
		DbClient dc = (DbClient)Utility.GetField(m_wf_param, "dc", DbClient.class);
		if (dc == null)
			throw new Exception("没有dc参数");
		return dc;
	}
	
	@SuppressWarnings("rawtypes")
	private static HttpServletRequest GetRequest(Map m_param) throws Exception {
		Map m_wf_param = GetWfParam(m_param);
		HttpServletRequest request = (HttpServletRequest)Utility.GetField(m_wf_param, "service", HttpServletRequest.class);
		if (request == null)
			throw new Exception("没有service参数");
		return request;
	}
	
	@SuppressWarnings("rawtypes")
	private static Map GetWfParam(Map m_param) throws Exception {
		Map m_wf_param = (Map)Utility.GetField(m_param, "wf", Map.class);
		if (m_wf_param == null)
			throw new Exception("没有wf参数");
		return m_wf_param;
	}
	
	@SuppressWarnings("rawtypes")
	private static Map GetPageParam(Map m_param) throws Exception {
		Map m_page_param = (Map)Utility.GetField(m_param, "page", Map.class);
		if (m_page_param == null)
			throw new Exception("没有page参数");
		return m_page_param;
	}
}
