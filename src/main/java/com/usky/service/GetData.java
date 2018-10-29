package com.usky.service;

import java.util.HashMap;

import com.usky.WfMng;
import com.usky.WfService;
import com.usky.comm.DbClient;

public class GetData extends WfService {
	@Override
	public String GetDescribe(){
		return "获取工作流数据";
	}

	@Override
    protected void DefineParams()
    {
        AddParams("user_id", "用户id", true);
        AddParams("wi_id", "工作流实例id", true);
    }
	
	@Override
	protected boolean OnSmsWork(DbClient dc) throws Exception {
        String user_id = GetParam("user_id");
        String wi_id = GetParam("wi_id");
		
        WfMng mng = new WfMng(user_id, code, "", wi_id, trace_id, new HashMap<String, Object>(), this, dc, log);
        if (!mng.GetData())
        {
            ParseWorkflowFuncResult();
            return false;
        }
        
		return true;
	}

}
