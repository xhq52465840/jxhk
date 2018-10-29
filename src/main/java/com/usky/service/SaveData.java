package com.usky.service;

import java.util.HashMap;

import com.usky.WfMng;
import com.usky.WfService;
import com.usky.comm.DbClient;
import com.usky.comm.JsonUtil;
import com.usky.comm.Utility;

public class SaveData extends WfService {
	@Override
	public String GetDescribe(){
		return "保存工作流数据";
	}

	@Override
    protected void DefineParams()
    {
        AddParams("user_id", "用户id", true);
        AddParams("wi_id", "工作流实例id", true);
        AddParams("data", "其他参数，json格式");
    }
	
	@SuppressWarnings("unchecked")
	@Override
	protected boolean OnSmsWork(DbClient dc) throws Exception {
        String user_id = GetParam("user_id");
        String wi_id = GetParam("wi_id");
        String data = GetParam("data");
		
        HashMap<String, Object> h_param = null; 
        if (Utility.IsEmpty(data))
        	h_param = new HashMap<String, Object>();
        else {
        	try {
        		h_param = JsonUtil.getGson().fromJson(data, HashMap.class);
        	}
        	catch (Exception e) {
        		SetErrorMsg("解析审批数据失败：" + Utility.GetExceptionMsg(e));
        		log.Write(e);
        		return false;
        	}
        }
		
        WfMng mng = new WfMng(user_id, code, "", wi_id, trace_id, h_param, this, dc, log);
        if (!mng.SaveData(wi_id, data))
        {
            ParseWorkflowFuncResult();
            return false;
        }
        
		return true;
	}
}
