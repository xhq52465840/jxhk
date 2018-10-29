package com.usky.service;

import com.usky.WfMng;
import com.usky.WfService;
import com.usky.comm.DbClient;

public class WfFunctionDelete extends WfService {
	@Override
	public String GetDescribe(){
		return "删除工作流功能信息";
	}

	@Override
    protected void DefineParams()
    {
        AddParams("user_id", "用户id", true);
        AddParams("id", "工作流功能信息id", true);
    }
	
	@SuppressWarnings("unused")
	@Override
	protected boolean OnSmsWork(DbClient dc) throws Exception {
        String user_id = GetParam("user_id");
        String id = GetParam("id");
        
        dc.BeginTrans();
        String sql = "delete from " + WfMng.db_name + "wf_function_info where wfi_id = " + id;
        int ect = dc.Execute(sql);
        if (ect < 0) {
        	SetErrorMsg(dc);
        	dc.Rollback();
        	return false;
        }
        if (ect == 0) {
        	SetErrorMsg("功能信息" + id + "不存在");
        	dc.Rollback();
        	return false;
        }
        dc.Commit();

        return true;
	}
}
