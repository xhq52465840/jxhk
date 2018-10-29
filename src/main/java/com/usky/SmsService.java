package com.usky;

import java.net.URLDecoder;
import java.sql.Connection;
import java.sql.ResultSet;
import java.util.Date;
import java.util.Iterator;
import java.util.Map.Entry;

import org.springframework.web.context.support.WebApplicationContextUtils;

import com.usky.comm.DbClient;
import com.usky.comm.DbClient.ClientType;
import com.usky.comm.Utility;
import com.usky.sms.core.TransactionHelper;

public class SmsService extends BaseService {
	protected String trace_id = "";
	
	@Override
	protected boolean OnBeforeWork() throws Exception {
		String url = "http://" + request.getLocalAddr() + (request.getLocalPort() == 80 ? "" : ":" + request.getLocalPort()) + request.getRequestURI();
		if (mParam.size() > 0) {
			url += "?";
			if (request.getMethod().toUpperCase().equals("GET"))
				url += URLDecoder.decode(request.getQueryString(), "UTF-8");
			else {
				Iterator<Entry<String, String>> it = mParam.entrySet().iterator();
				while (it.hasNext()) {
					Entry<String, String> entry = it.next();
					url += entry.getKey() + "=" + entry.getValue() + "&";
					//log.WriteLine(entry.getKey() + "=" + entry.getValue());
				}
				url = url.substring(0, url.length() - 1);
			}
		}
		log.WriteLine(code + "\t" + url + " from " + request.getRemoteAddr());
		String brief = url;
		if (brief.length() > 3000)
			brief = brief.substring(0, 3000);
		
		if (!InsertTraceInfo(brief, url))
			return false;
		
		return true;
	}
	
	@Override
	protected boolean OnWork() throws Exception {
		TransactionHelper transactionHelper = (TransactionHelper) WebApplicationContextUtils.getRequiredWebApplicationContext(request.getSession().getServletContext()).getBean("transactionHelper");
		return (Boolean) transactionHelper.doInTransaction(this, "OnWork");
	}

	public boolean OnWork(Connection conn) throws Exception {
		DbClient dc_sms = new DbClient();
		if (!dc_sms.Open(conn)) {
			SetErrorMsg(dc_sms.ErrorMessage);
			return false;
		}
		/*
		if (dc_sms.Execute("use smsuwf") < 0) {
			SetErrorMsg(dc_sms.ErrorMessage);
			return false;
		}
		*/
		return OnSmsWork(dc_sms);
	}
	
	protected boolean OnSmsWork(DbClient dc) throws Exception {
		return true;
	}
	
	@Override
	public void OnFinish() throws Exception {
		if (!Utility.IsEmpty(trace_id)) {
			int status = Integer.parseInt(mResponseHeader.get("status").toString());
			String msg = mResponseHeader.get("msg").toString();
            if (msg.length() >= 3000)
                msg = msg.substring(0, 3000) + " ...";
            DbClient dc = new DbClient();
            dc.SetConnectType(ClientType.MySQL);
            String sql = "update  " + WfMng.db_name + "app_trace set msg = '" + dc.FormatString(msg) + "',status = " + status + ",time = " + ((new Date()).getTime() - startTime) + " where id = " + trace_id;
            int ect = ExecuteSql(sql);
            if (ect == 0) 
            	log.WriteLine(sql + " 执行失败");
		}
	}
	

	protected boolean InsertTraceInfo(String brief, String url) throws Exception {
		TransactionHelper transactionHelper = (TransactionHelper) WebApplicationContextUtils.getRequiredWebApplicationContext(request.getSession().getServletContext()).getBean("transactionHelper");
		return (Boolean) transactionHelper.doInTransaction(this, "InsertTraceInfo", brief, url);
	}

	public Boolean InsertTraceInfo(Connection conn, String brief, String url) throws Exception {
		DbClient dc_sms = new DbClient();
		if (!dc_sms.Open(conn)) {
			SetErrorMsg(dc_sms.ErrorMessage);
			return false;
		}
		dc_sms.BeginTrans();
        String sql = "insert into  " + WfMng.db_name + "app_trace(id,uri,user_id,sv,brief,url,ip,last_update) values("
                + dc_sms.GetSeqNextValue("id_seq") + ","
                + "'" + dc_sms.FormatString(page.getServletName()) + "',"
                + (HasParam("user_id") ? "'" + dc_sms.FormatString(GetParam("user_id")) + "'," : "null,")
                + "'" + dc_sms.FormatString(code) + "',"
                + "'" + dc_sms.FormatString(brief) + "',"
                + (dc_sms.IsOracle() ? "empty_clob()," : "'" + dc_sms.FormatString(url) + "',")
                + "'" + request.getRemoteAddr() + "',"
                + dc_sms.GetSysdate() + ")"
                ;
        int ect = dc_sms.Execute(sql);
        if (ect < 0) {
        	SetErrorMsg(dc_sms);
        	dc_sms.Rollback();
        	return false;
        }
        trace_id = dc_sms.GetSequence("id_seq");
        if (Utility.IsEmpty(trace_id)) {
        	SetErrorMsg("内部错误：select@@identity没有返回数据");
        	dc_sms.Rollback();
        	return false;
        }
        if (dc_sms.IsOracle()) {
        	sql = "select id,url from app_trace where id = " + trace_id;
        	ResultSet rs_trace = dc_sms.ExecuteQuery(sql);
        	if (rs_trace == null) {
        		SetErrorMsg(dc_sms);
        		dc_sms.Rollback();
        		return false;
        	}
        	if (!rs_trace.next()) {
        		SetErrorMsg("内部错误： 无法找到trace_id " + trace_id);
        		dc_sms.Rollback();
        		return false;
        	}
        	if (!dc_sms.UpdateClob(rs_trace, "url", url)) {
        		SetErrorMsg(dc_sms);
        		dc_sms.Rollback();
        		return false;
        	}
        }
        dc_sms.Commit();
		return true;
	}
	
	protected int ExecuteSql(String sql) throws Exception {
		TransactionHelper transactionHelper = (TransactionHelper) WebApplicationContextUtils.getRequiredWebApplicationContext(request.getSession().getServletContext()).getBean("transactionHelper");
		return (Integer) transactionHelper.doInTransaction(this, "ExecuteSql", sql);
	}
	
	public int ExecuteSql(Connection conn, String sql) throws Exception {
		DbClient dc_sms = new DbClient();
		if (!dc_sms.Open(conn)) {
			SetErrorMsg(dc_sms.ErrorMessage);
			return -1;
		}
		dc_sms.BeginTrans();
		int result = dc_sms.Execute(sql);
		if (result < 0) {
			SetErrorMsg(dc_sms.ErrorMessage);
			dc_sms.Rollback();
			return -1;
		}
		dc_sms.Commit();
		return result;
	}
}
