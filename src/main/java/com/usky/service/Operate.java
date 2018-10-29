package com.usky.service;

import java.util.HashMap;

import com.usky.WfMng;
import com.usky.WfService;
import com.usky.comm.DbClient;
import com.usky.comm.JsonUtil;
import com.usky.comm.Utility;

public class Operate extends WfService {
	@Override
	public String GetDescribe(){
		return "操作工作流任务";
	}

	@Override
    protected void DefineParams()
    {
        AddParams("user_id", "用户id", true);
        AddParams("wip_id", "工作流路径id", true);
        //AddParams("tid", "工作流任务id", true);
        //AddParams("op", "操作", true);
        AddParams("remark", "审批意见");
        AddParams("param", "其他参数，json格式");
    }
	
	@SuppressWarnings("unchecked")
	@Override
	protected boolean OnSmsWork(DbClient dc) throws Exception {
        //String tid = GetParam("tid");
		String wip_id = GetParam("wip_id");
        String user_id = GetParam("user_id");
        //String op = GetParam("op");
        String remark = GetParam("remark");
        String param = GetParam("param");
		
        HashMap<String, Object> h_param = null; 
        if (Utility.IsEmpty(param))
        	h_param = new HashMap<String, Object>();
        else {
        	try {
        		h_param = JsonUtil.getGson().fromJson(param, HashMap.class);
        	}
        	catch (Exception e) {
        		SetErrorMsg("解析审批数据失败：" + Utility.GetExceptionMsg(e));
        		log.Write(e);
        		return false;
        	}
        }
        
        WfMng mng = new WfMng(user_id, code, "", "", trace_id, h_param, this, dc, log);
        if (!mng.Operate(wip_id, remark))
        {
            ParseWorkflowFuncResult();
            return false;
        }
        
		return true;
	}
}
