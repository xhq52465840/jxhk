package com.usky.service;

import java.util.*;

import com.usky.*;
import com.usky.comm.DbClient;
import com.usky.comm.JsonUtil;
import com.usky.comm.Utility;

public class Submit extends WfService {
	@Override
	public String GetDescribe(){
		return "启动工作流";
	}
	
	@Override
    protected void DefineParams()
    {
        AddParams("user_id", "用户id", true);
        AddParams("wt_id", "流程模板id", true);
        AddParams("title", "流程标题");
        AddParams("brief", "流程概要");
        AddParams("data", "json格式的审批数据");
    }
	
	@SuppressWarnings("unchecked")
	@Override
	protected boolean OnSmsWork(DbClient dc) throws Exception {
        String wt_id = GetParam("wt_id");
        String data = GetParam("data");
        String user_id = GetParam("user_id");
        String title = GetParam("title");
        String brief = GetParam("brief");

        /*
        ScriptEngineManager manager = new ScriptEngineManager();
        ScriptEngine eng = manager.getEngineByName("js");
        //String script = "function add (a, b) {c = a + b; return c; }";
        String script = "function Eval(expr) { return eval(expr); }";
        
        try {
        	eng.eval(script);
        	Invocable jsInvoke = (Invocable)eng;
        	mResponseData.put("script", jsInvoke.invokeFunction("Eval", new Object[] {"1 == 0"}));
        }
        catch (Exception e) {
        	SetErrorMsg(Utility.GetExceptionMsg(e));
        	log.Write(e);
        	return false;
        }
        if (1 == 1)
        	return true;
        	*/
        
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
        
        WfMng mng = new WfMng(user_id, code, wt_id, "", trace_id, h_param, this, dc, log);
        if (!mng.Submit(title, brief))
        {
            ParseWorkflowFuncResult();
            return false;
        }
        
        //mResponseData.put("param", h_param);
		return true;
	}
}
