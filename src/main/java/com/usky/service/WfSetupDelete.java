package com.usky.service;

import java.util.List;
import java.util.Map;

import com.usky.WfMng;
import com.usky.WfService;
import com.usky.comm.DbClient;
import com.usky.comm.Utility;

public class WfSetupDelete extends WfService {
	@Override
	public String GetDescribe(){
		return "删除工作流设置数据";
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
        	SetErrorMsg("已发布，不能删除，只能禁用");
        	return false;
        }
        
        dc.BeginTrans();
        sql = "delete from " + WfMng.db_name + "wf_setup_data where wsd_id = " + id + " and wt_id is null";
        if (dc.Execute(sql) < 0) {
        	SetErrorMsg(dc);
        	dc.Rollback();
        	return false;
        }
        dc.Commit();

        return true;
	}
}
