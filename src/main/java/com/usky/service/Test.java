package com.usky.service;

import java.sql.*;

import com.usky.DbService;
import com.usky.comm.*;
import com.usky.sms.uwf.WfSetup;

public class Test extends DbService {
	
	@Override
	public String GetDescribe(){
		return "测试服务";
	}
	
	@Override
    protected void DefineParams()
    {
		/*
        AddParams("id", "工作流模板数据id，为空时表示新增，不为空时表示修改");
        AddParams("df_id", "流程设计文件id，为空时表示保存节点数据");
        AddParams("name", "工作流模板名", true);
        AddParams("desc", "工作流模板描述", false, "1,2,3");
        AddParams("data", "json格式的工作流模板数据", true);
        */
    }
	
	@Override
	protected boolean OnWork(DbClient dc) throws Exception{
		String sql = "select now()";
		//String sql = "select sysdate from dual";
		ResultSet rs = dc.ExecuteQuery(sql);
		if (rs == null) {
			SetErrorMsg(dc);
			return false;
		}
		rs.next();
		mResponseData.put("now", rs.getObject(1));
		mResponseData.put("ip", request.getRemoteAddr());
		mResponseData.put("pathinfo", request.getPathInfo());
		mResponseData.put("pathTranslated", request.getPathTranslated());
		mResponseData.put("URI", request.getRequestURI());
		mResponseData.put("ServletPath", request.getServletPath());
		mResponseData.put("port", request.getLocalPort());
		mResponseData.put("localip", request.getLocalAddr());
		mResponseData.put("Context", request.getContextPath());
		mResponseData.put("QueryString", request.getQueryString());
		
		//mResponseData.put("userlist", SmsFunction.UserGroup(request, "1"));
		
		
		mResponseData.put("dft", WfSetup.GetSetupList(dc.GetConnection(), null));
		
		mResponseData.put("ActivityStatus", WfSetup.GetActivityStatusList(dc.GetConnection(), "2"));
		
		Utility.CallFunc("", "com.usky.sms.uwffunc.UwfFuncPlugin", "Test", null, null);
		return true;
	}
}
