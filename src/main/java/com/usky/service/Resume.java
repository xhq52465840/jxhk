package com.usky.service;

import com.usky.WfMng;
import com.usky.WfService;
import com.usky.comm.DbClient;

public class Resume extends WfService {
	@Override
	public String GetDescribe(){
		return "解除一个工作流实例的挂起状态";
	}

	@Override
    protected void DefineParams()
    {
        AddParams("user_id", "用户id", true);
        AddParams("wi_id", "流程实例id", true);
    }
	
	@Override
	protected boolean OnSmsWork(DbClient dc) throws Exception {
        String user_id = GetParam("user_id");
        String wi_id = GetParam("wi_id");
        
        WfMng mng = new WfMng(user_id, code, "", wi_id, trace_id, null, this, dc, log);
        if (!mng.Resume())
        {
            ParseWorkflowFuncResult();
            return false;
        }
		
		return true;
	}
}
