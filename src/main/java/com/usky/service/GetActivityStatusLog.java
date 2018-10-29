package com.usky.service;

import java.sql.ResultSet;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.usky.WfMng;
import com.usky.WfService;
import com.usky.comm.DbClient;
import com.usky.comm.Utility;
import com.usky.sms.activity.attribute.ActivityStatusDao;
import com.usky.sms.user.UserDao;
import com.usky.sms.utils.SpringBeanUtils;

public class GetActivityStatusLog extends WfService {
	@Override
	public String GetDescribe(){
		return "获取SMS日志数据";
	}

	@Override
    protected void DefineParams()
    {
        AddParams("user_id", "用户id", true);
        AddParams("wi_id", "工作流实例id", true);
    }
	
	@SuppressWarnings("unused")
	@Override
	protected boolean OnSmsWork(DbClient dc) throws Exception {
        String user_id = GetParam("user_id");
        String wi_id = GetParam("wi_id");
		
//		String sql = "select status,user_id,last_update from wf_activity_status where wi_id = " + wi_id + " order by was_id";
//		ResultSet rs_status = dc.ExecuteQuery(sql);
		String sql = "select status,user_id,last_update from wf_activity_status where wi_id = ? order by was_id";
		List<Map<String, Object>> rs_status = dc.executeQuery(sql, wi_id);
		if (rs_status == null) {
			SetErrorMsg(dc);
			return false;
		}

		List<Map<String, Object>> list_status = new ArrayList<Map<String, Object>>();
		mResponseData.put("log", list_status);
		/*
		if (!rs_status.next())
			return true;
		
		String from_status = rs_status.getString("STATUS");
		Timestamp from_date = rs_status.getTimestamp("LAST_UPDATE");
		*/
		String from_status = "创建";
		Timestamp from_date = null;

		ActivityStatusDao asd = (ActivityStatusDao) SpringBeanUtils.getBean("activityStatusDao");
		if (asd == null) {
			SetErrorMsg("无法获得ActivityStatusDao");
			return false;
		}
		UserDao ud = (UserDao) SpringBeanUtils.getBean("userDao");
		if (ud == null) {
			SetErrorMsg("无法获得UserDao");
			return false;
		}

		for (Map<String, Object> status : rs_status) {
			Map<String, Object> m_status = new HashMap<String, Object>();
			list_status.add(m_status);
			
			String to_status = (String) status.get("STATUS");
			user_id = (String) status.get("USER_ID");
			Timestamp to_date = (Timestamp) status.get("LAST_UPDATE");
			
			m_status.put("from_status", asd.getById(Integer.parseInt(from_status)));
			m_status.put("to_status", asd.getById(Integer.parseInt(to_status)));
			m_status.put("user", ud.getById(Integer.parseInt(user_id)));
			if (from_date == null)
				from_date = to_date;
			m_status.put("time_in", to_date.getTime() - from_date.getTime());
			m_status.put("last_update", to_date);
			
			from_status = to_status;
			from_date = to_date;
		}
		
		return true;
	}
}
