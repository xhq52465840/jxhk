package com.usky.service;

import java.util.List;
import java.util.Map;

import com.usky.WfMng;
import com.usky.WfService;
import com.usky.comm.DbClient;
import com.usky.comm.Utility;

public class WfSetupDiscard extends WfService {
	@Override
	public String GetDescribe(){
		return "恢复工作流设置数据到上次发布状态";
	}

	@Override
    protected void DefineParams()
    {
        AddParams("user_id", "用户id", true);
        AddParams("wsd_id", "工作流设置数据id", true);
    }
	
	@SuppressWarnings("unused")
	@Override
	protected boolean OnSmsWork(DbClient dc) throws Exception {
        String user_id = GetParam("user_id");
        String id = GetParam("wsd_id");
        
//        String sql = "select wt_id from " + WfMng.db_name + "wf_setup_data where wsd_id = " + id;
//        ResultSet rs_data = dc.ExecuteQuery(sql);
        String sql = "select wt_id from " + WfMng.db_name + "wf_setup_data where wsd_id = ?";
        List<Map<String, Object>> rs_data = dc.executeQuery(sql, id);
        if (rs_data == null) {
        	SetErrorMsg(dc);
        	return false;
        }
        if (rs_data.isEmpty()) {
        	SetErrorMsg("工作流设置数据" + id + "不存在");
        	return false;
        }
        if (!Utility.IsEmpty((String) rs_data.get(0).get("WT_ID"))) {
        	SetErrorMsg("工作流未发布");
        	return false;
        }
        
        sql = "update " + WfMng.db_name + "wf_setup_data set data = release_data,last_update = " + dc.GetSysdate() + " where wsd_id = " + id; 
		int ect = dc.Execute(sql);
		if (ect < 0) {
			SetErrorMsg(dc);
			return false;
		}
		if (ect == 0) {
			SetErrorMsg("工作流配置数据" + id + "已不存在");
			return false;
		}
        
        return true;
	}

}
