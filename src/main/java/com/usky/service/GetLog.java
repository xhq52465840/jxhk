package com.usky.service;

import java.util.List;
import java.util.Map;

import com.usky.WfMng;
import com.usky.WfService;
import com.usky.comm.DbClient;
import com.usky.comm.Utility;

public class GetLog extends WfService {
	@Override
	public String GetDescribe(){
		return "获取工作流日志数据";
	}

	@Override
    protected void DefineParams()
    {
        AddParams("user_id", "用户id", true);
        AddParams("wi_id", "工作流实例id", true);
        AddParams("level", "显示日志级别，可选参数，缺省为20");
    }
	
	@SuppressWarnings("unused")
	@Override
	protected boolean OnSmsWork(DbClient dc) throws Exception {
        String user_id = GetParam("user_id");
        String wi_id = GetParam("wi_id");
        String level = GetParam("level", "20");

//        String sql = "select win_id,user_id,lv,do,last_update time from " + WfMng.db_name + "workflow_inst_log where wi_id = " + wi_id + " and lv <= " + level + " order by wil_id desc";
//        ResultSet rs_log = dc.ExecuteQuery(sql);
        String sql = "select win_id,user_id,lv,do,last_update time from " + WfMng.db_name + "workflow_inst_log where wi_id = ? and lv <= ? order by wil_id desc";
        List<Map<String, Object>> rs_log = dc.executeQuery(sql, wi_id, level);
        if (rs_log == null) {
        	SetErrorMsg(dc);
        	return false;
        }
        
        mResponseData.put("log", Utility.formatResultMaps(rs_log));
		
		return true;
	}
}
